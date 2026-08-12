import { WORLD } from "@/app/_components/projects/data";
import type { WorldTextures } from "@/app/_components/projects/world/textures";
import {
  DUST_COUNT,
  DUST_STREAK_MAX,
  NEBULA_TINTS,
  STAR_COUNT,
  STREAK_EPSILON,
  STREAK_FADE,
  STREAK_FULL,
  STREAK_MAX,
  STREAK_RAMP,
  STREAK_START,
} from "@/app/_components/projects/world/tuning";
import { Container, Graphics, Sprite } from "pixi.js";

/**
 * Everything behind the stations: three parallax star layers, a few nebula
 * blooms, the survey grid and the world boundary.
 *
 * The whole backdrop is a child of the camera-transformed world container, so
 * each layer fakes depth by *undoing* part of that transform — a layer at depth
 * 0.15 cancels 85% of the camera translation and barely moves.
 */

type Layer = { view: Container; depth: number };

type Dust = {
  sprite: Sprite;
  speedX: number;
  speedY: number;
  phase: number;
  base: number;
};

/** A near-layer star that stretches along the heading once the ship is flying. */
type Streaker = { sprite: Sprite; baseScaleX: number; baseAlpha: number };

export type Starfield = {
  view: Container;
  update: (
    dt: number,
    cameraX: number,
    cameraY: number,
    /** Smoothed, straight from the avatar — see the note on `Avatar.update`. */
    heading: number,
    speedRatio: number,
  ) => void;
  destroy: () => void;
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/** Fixed-seed PRNG: the sky must look identical on every mount and every visit. */
const mulberry32 = (seed: number) => {
  let state = seed;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const LAYER_DEPTHS = [0.15, 0.4, 0.75] as const;

const buildGrid = (): Graphics => {
  const halfWidth = WORLD.width / 2;
  const halfHeight = WORLD.height / 2;
  const grid = new Graphics();

  // Fine mesh first, then a brighter major grid on top of it: one density alone
  // either disappears or turns into graph paper.
  for (let x = -halfWidth; x <= halfWidth; x += WORLD.gridSize / 2) {
    grid.moveTo(x, -halfHeight).lineTo(x, halfHeight);
  }
  for (let y = -halfHeight; y <= halfHeight; y += WORLD.gridSize / 2) {
    grid.moveTo(-halfWidth, y).lineTo(halfWidth, y);
  }
  grid.stroke({ color: 0xffffff, alpha: 0.02, width: 1 });

  for (let x = -halfWidth; x <= halfWidth; x += WORLD.gridSize * 2) {
    grid.moveTo(x, -halfHeight).lineTo(x, halfHeight);
  }
  for (let y = -halfHeight; y <= halfHeight; y += WORLD.gridSize * 2) {
    grid.moveTo(-halfWidth, y).lineTo(halfWidth, y);
  }
  grid.stroke({ color: 0xffffff, alpha: 0.05, width: 1 });

  return grid;
};

/** Corner brackets read as a surveyed sector; a full rectangle reads as a box. */
const buildBoundary = (): Graphics => {
  const halfWidth = WORLD.width / 2;
  const halfHeight = WORLD.height / 2;
  const arm = 120;
  const boundary = new Graphics();

  for (const signX of [-1, 1]) {
    for (const signY of [-1, 1]) {
      const x = halfWidth * signX;
      const y = halfHeight * signY;
      boundary
        .moveTo(x - arm * signX, y)
        .lineTo(x, y)
        .lineTo(x, y - arm * signY);
    }
  }
  boundary.stroke({ color: 0xffffff, alpha: 0.16, width: 2 });

  boundary
    .rect(-halfWidth, -halfHeight, WORLD.width, WORLD.height)
    .stroke({ color: 0xffffff, alpha: 0.04, width: 1 });

  return boundary;
};

export const createStarfield = (textures: WorldTextures): Starfield => {
  const view = new Container();
  const random = mulberry32(0x5eed);

  // Far layers barely move, so they must cover well beyond the world bounds or
  // the sky would end mid-screen at the edges of the map.
  const spreadX = WORLD.width * 1.7;
  const spreadY = WORLD.height * 1.7;

  const layers: Layer[] = LAYER_DEPTHS.map((depth) => {
    const layer = new Container();
    layer.blendMode = "add";
    view.addChild(layer);
    return { view: layer, depth };
  });

  // Nebula sits in the deepest layer: huge, dim, and slow enough to read as
  // distance rather than as a moving object.
  for (let index = 0; index < 4; index += 1) {
    const nebula = new Sprite(textures.glow);
    nebula.anchor.set(0.5);
    nebula.tint = NEBULA_TINTS[index % NEBULA_TINTS.length];
    nebula.alpha = 0.05 + random() * 0.02;
    nebula.scale.set(6 + random() * 5);
    nebula.position.set((random() - 0.5) * spreadX, (random() - 0.5) * spreadY);
    layers[0].view.addChild(nebula);
  }

  // Only the nearest layer streaks. The middle one barely smears in reality,
  // and leaving it out halves the only per-frame cost this effect has.
  const nearLayer = layers[layers.length - 1];
  const streakers: Streaker[] = [];

  for (let index = 0; index < STAR_COUNT; index += 1) {
    const layer = layers[index % layers.length];
    const star = new Sprite(textures.star);
    star.anchor.set(0.5);
    star.position.set((random() - 0.5) * spreadX, (random() - 0.5) * spreadY);
    // Nearer layers get bigger, brighter stars — the cue that sells the depth.
    const scale = 0.12 + layer.depth * (0.1 + random() * 0.3);
    const alpha = 0.25 + layer.depth * random() * 0.7;
    star.scale.set(scale);
    star.alpha = alpha;
    star.tint = random() > 0.9 ? "#c4b5fd" : "#ffffff";
    layer.view.addChild(star);

    if (layer === nearLayer) {
      streakers.push({ sprite: star, baseScaleX: scale, baseAlpha: alpha });
    }
  }

  const foreground = new Container();
  foreground.addChild(buildGrid(), buildBoundary());
  view.addChild(foreground);

  const dustLayer = new Container();
  dustLayer.blendMode = "add";
  view.addChild(dustLayer);

  const dust: Dust[] = [];
  for (let index = 0; index < DUST_COUNT; index += 1) {
    const sprite = new Sprite(textures.spark);
    sprite.anchor.set(0.5);
    sprite.position.set(
      (random() - 0.5) * WORLD.width,
      (random() - 0.5) * WORLD.height,
    );
    const base = 0.15 + random() * 0.25;
    sprite.scale.set(base);
    sprite.tint = "#a78bfa";
    dustLayer.addChild(sprite);
    dust.push({
      sprite,
      speedX: (random() - 0.5) * 14,
      speedY: (random() - 0.5) * 14,
      phase: random() * Math.PI * 2,
      base,
    });
  }

  const halfWidth = WORLD.width / 2;
  const halfHeight = WORLD.height / 2;

  let streak = 0;
  let settled = true;

  return {
    view,
    update: (dt, cameraX, cameraY, heading, speedRatio) => {
      for (const layer of layers) {
        layer.view.position.set(
          cameraX * (1 - layer.depth),
          cameraY * (1 - layer.depth),
        );
      }

      // Windowed, not linear: cruising has to leave the sky completely alone.
      const target = clamp01(
        (speedRatio - STREAK_START) / (STREAK_FULL - STREAK_START),
      );
      streak += (target - streak) * (1 - Math.exp(-STREAK_RAMP * dt));

      if (streak > STREAK_EPSILON) {
        settled = false;
        const stretch = 1 + streak * STREAK_MAX;
        const fade = 1 - streak * STREAK_FADE;
        for (const star of streakers) {
          star.sprite.rotation = heading;
          star.sprite.scale.x = star.baseScaleX * stretch;
          star.sprite.alpha = star.baseAlpha * fade;
        }
      } else if (!settled) {
        // One pass back to rest, then nothing. Without it the stars would keep
        // their rotation and the sky's cross flares would swing with the ship
        // long after it stopped — the most visible way to get this wrong.
        settled = true;
        streak = 0;
        for (const star of streakers) {
          star.sprite.rotation = 0;
          star.sprite.scale.x = star.baseScaleX;
          star.sprite.alpha = star.baseAlpha;
        }
      }

      // Dust needs no such gate: it already writes every frame. Its flare-free
      // texture also stretches into a clean capsule, so it can go further.
      const dustStretch = 1 + streak * DUST_STREAK_MAX;
      for (const mote of dust) {
        mote.phase += dt;
        const { sprite } = mote;
        sprite.x += mote.speedX * dt;
        sprite.y += mote.speedY * dt;
        // Wrap instead of respawning: no allocation, and the field never thins out.
        if (sprite.x > halfWidth) sprite.x = -halfWidth;
        else if (sprite.x < -halfWidth) sprite.x = halfWidth;
        if (sprite.y > halfHeight) sprite.y = -halfHeight;
        else if (sprite.y < -halfHeight) sprite.y = halfHeight;
        sprite.rotation = streak === 0 ? 0 : heading;
        sprite.scale.x = mote.base * dustStretch;
        sprite.alpha =
          (0.2 + Math.sin(mote.phase * 1.6) * 0.12) *
          (1 - streak * STREAK_FADE);
      }
    },
    destroy: () => {
      view.destroy({ children: true });
    },
  };
};
