import {
  type GlyphKey,
  type Project,
  WORLD,
} from "@/app/_components/projects/data";
import { createGlyph } from "@/app/_components/projects/world/glyphs";
import type { WorldTextures } from "@/app/_components/projects/world/textures";
import {
  MONO_STACK,
  REVEAL_RADIUS,
} from "@/app/_components/projects/world/tuning";
import { Circle, Container, Graphics, Sprite, Text } from "pixi.js";

/**
 * A project rendered as an orbital station: halo, counter-rotating rings, a
 * hexagonal core carrying the project's glyph, and one orbiting satellite per
 * technology in its stack — the decoration is driven by real data, not noise.
 *
 * Three states stack up as you approach:
 *   unseen   dim silhouette, no readable detail
 *   seen     lit permanently once you pass within REVEAL_RADIUS
 *   active   proximity ring + scale bump; this is the state that drives the HUD
 */

type Satellite = {
  sprite: Sprite;
  radius: number;
  speed: number;
  phase: number;
};

type Station = {
  project: Project;
  container: Container;
  halo: Sprite;
  rings: Graphics[];
  proximityRing: Graphics;
  discoveredMark: Graphics;
  label: Text;
  meta: Text;
  satellites: Satellite[];
  scale: number;
  targetScale: number;
  ringAlpha: number;
  targetRingAlpha: number;
  seen: boolean;
  seenProgress: number;
  discovered: boolean;
  pulsePhase: number;
};

export type StationSystem = {
  view: Container;
  /** Returns the id of the nearest station inside interact range, or null. */
  update: (
    dt: number,
    elapsed: number,
    playerX: number,
    playerY: number,
  ) => string | null;
  markDiscovered: (id: string) => void;
  destroy: () => void;
};

type StationCallbacks = {
  onSeen: (id: string) => void;
  onActivate: (id: string) => void;
};

const glyphFor = (project: Project): GlyphKey =>
  project.isPlaceholder ? "locked" : (project.icon ?? "site");

/** Pixi has no dashed stroke, so a locked ring is drawn as spaced arcs. */
const dashedCircle = (
  graphics: Graphics,
  radius: number,
  segments: number,
  gap: number,
): void => {
  const step = (Math.PI * 2) / segments;
  for (let index = 0; index < segments; index += 1) {
    const start = index * step;
    graphics.arc(0, 0, radius, start, start + step - gap);
  }
};

const hexagon = (radius: number): number[] => {
  const points: number[] = [];
  for (let index = 0; index < 6; index += 1) {
    const angle = (index / 6) * Math.PI * 2 - Math.PI / 2;
    points.push(Math.cos(angle) * radius, Math.sin(angle) * radius);
  }
  return points;
};

const buildStation = (
  project: Project,
  textures: WorldTextures,
  callbacks: StationCallbacks,
): Station => {
  const locked = project.isPlaceholder === true;
  const tone = locked ? "#52525b" : project.accent;

  const container = new Container();
  container.position.set(project.world.x, project.world.y);

  const halo = new Sprite(textures.glow);
  halo.anchor.set(0.5);
  halo.tint = tone;
  halo.blendMode = "add";
  halo.scale.set(locked ? 0.9 : 1.5);
  halo.alpha = locked ? 0.12 : 0.28;

  const rings: Graphics[] = [];
  if (locked) {
    const ring = new Graphics();
    dashedCircle(ring, WORLD.nodeRadius + 16, 14, 0.16);
    ring.stroke({ color: tone, width: 1.5, alpha: 0.55 });
    rings.push(ring);
  } else {
    const outer = new Graphics()
      .ellipse(0, 0, WORLD.nodeRadius + 26, (WORLD.nodeRadius + 26) * 0.36)
      .stroke({ color: tone, width: 1.5, alpha: 0.4 });
    const inner = new Graphics()
      .ellipse(0, 0, WORLD.nodeRadius + 14, (WORLD.nodeRadius + 14) * 0.62)
      .stroke({ color: tone, width: 1, alpha: 0.28 });
    inner.rotation = 0.9;
    rings.push(outer, inner);
  }

  const proximityRing = new Graphics()
    .circle(0, 0, WORLD.nodeRadius + 10)
    .stroke({ color: tone, width: 2, alpha: 1 });
  proximityRing.alpha = 0;

  const core = new Graphics()
    .poly(hexagon(WORLD.nodeRadius))
    .fill({ color: tone, alpha: locked ? 0.06 : 0.16 })
    .poly(hexagon(WORLD.nodeRadius))
    .stroke({ color: tone, width: 2, alpha: locked ? 0.5 : 0.9 });

  const glyph = createGlyph(glyphFor(project), locked ? "#a1a1aa" : "#ffffff");
  glyph.alpha = locked ? 0.6 : 0.9;

  const label = new Text({
    text: project.title,
    style: {
      fontFamily: MONO_STACK,
      fontSize: 13,
      fill: locked ? "#71717a" : "#e4e4e7",
      letterSpacing: 1,
    },
  });
  label.anchor.set(0.5, 0);
  label.position.set(0, WORLD.nodeRadius + 30);

  const metaText = [project.year, locked ? "locked" : project.status]
    .filter(Boolean)
    .join(" · ");
  const meta = new Text({
    text: metaText.toUpperCase(),
    style: {
      fontFamily: MONO_STACK,
      fontSize: 9,
      fill: "#71717a",
      letterSpacing: 2,
    },
  });
  meta.anchor.set(0.5, 0);
  meta.position.set(0, WORLD.nodeRadius + 48);

  const discoveredMark = new Graphics()
    .circle(0, 0, 3)
    .fill({ color: tone, alpha: 1 });
  discoveredMark.position.set(0, -(WORLD.nodeRadius + 22));
  discoveredMark.visible = false;

  container.addChild(halo, ...rings, proximityRing, core, glyph);

  const satellites: Satellite[] = [];
  if (!locked) {
    const count = Math.min(project.tech.length, 4);
    for (let index = 0; index < count; index += 1) {
      const sprite = new Sprite(textures.spark);
      sprite.anchor.set(0.5);
      sprite.tint = tone;
      sprite.blendMode = "add";
      sprite.scale.set(0.5);
      container.addChild(sprite);
      satellites.push({
        sprite,
        radius: WORLD.nodeRadius + 20 + index * 9,
        speed: 0.55 - index * 0.08,
        phase: (index / count) * Math.PI * 2,
      });
    }
  }

  container.addChild(discoveredMark, label, meta);

  container.eventMode = "static";
  container.cursor = "pointer";
  container.hitArea = new Circle(0, 0, WORLD.nodeRadius + 8);
  container.on("pointertap", () => callbacks.onActivate(project.id));

  return {
    project,
    container,
    halo,
    rings,
    proximityRing,
    discoveredMark,
    label,
    meta,
    satellites,
    scale: 1,
    targetScale: 1,
    ringAlpha: 0,
    targetRingAlpha: 0,
    seen: false,
    seenProgress: 0,
    discovered: false,
    // Staggered from world position so the field breathes out of sync.
    pulsePhase: (project.world.x + project.world.y) * 0.01,
  };
};

export const createStations = (
  projects: readonly Project[],
  textures: WorldTextures,
  callbacks: StationCallbacks,
): StationSystem => {
  const view = new Container();
  const stations = projects.map((project) => {
    const station = buildStation(project, textures, callbacks);
    view.addChild(station.container);
    return station;
  });

  const interactSq = WORLD.interactRadius ** 2;
  const releaseSq = WORLD.releaseRadius ** 2;
  const revealSq = REVEAL_RADIUS ** 2;

  return {
    view,
    update: (dt, elapsed, playerX, playerY) => {
      // Frame-rate independent easing; the same curve the camera uses.
      const follow = 1 - Math.exp(-8 * dt);

      let nearestId: string | null = null;
      let nearestDistanceSq = Number.POSITIVE_INFINITY;

      for (const station of stations) {
        const dx = station.project.world.x - playerX;
        const dy = station.project.world.y - playerY;
        const distanceSq = dx * dx + dy * dy;

        if (!station.seen && distanceSq < revealSq) {
          station.seen = true;
          callbacks.onSeen(station.project.id);
        }
        station.seenProgress +=
          ((station.seen ? 1 : 0) - station.seenProgress) * follow;

        const wasActive = station.targetRingAlpha > 0;
        // Hysteresis: a wider release radius stops the prompt flickering when
        // the avatar idles right on the boundary.
        const isActive = wasActive
          ? distanceSq < releaseSq
          : distanceSq < interactSq;

        station.targetRingAlpha = isActive ? 0.9 : 0;
        station.targetScale = isActive ? 1.12 : 1;

        if (isActive && distanceSq < nearestDistanceSq) {
          nearestDistanceSq = distanceSq;
          nearestId = station.project.id;
        }

        station.ringAlpha +=
          (station.targetRingAlpha - station.ringAlpha) * follow;
        station.scale += (station.targetScale - station.scale) * follow;

        station.proximityRing.alpha = station.ringAlpha;
        station.container.scale.set(station.scale);
        // An unseen station still has to be readable — it dims, it does not hide.
        station.container.alpha = 0.5 + 0.5 * station.seenProgress;

        const locked = station.project.isPlaceholder === true;
        const breathe = Math.sin(elapsed * 1.4 + station.pulsePhase) * 0.05;
        station.halo.alpha =
          (locked ? 0.16 : 0.34 + breathe + station.ringAlpha * 0.45) *
          (0.65 + 0.35 * station.seenProgress);
        station.halo.scale.set(
          (locked ? 0.9 : 1.5) + station.ringAlpha * 0.35 + breathe,
        );

        for (let index = 0; index < station.rings.length; index += 1) {
          const direction = index % 2 === 0 ? 1 : -1;
          station.rings[index].rotation += dt * 0.3 * direction;
        }

        for (const satellite of station.satellites) {
          const angle = elapsed * satellite.speed + satellite.phase;
          satellite.sprite.position.set(
            Math.cos(angle) * satellite.radius,
            // Squashed vertically so the orbits read as tilted, not flat.
            Math.sin(angle) * satellite.radius * 0.42,
          );
          satellite.sprite.alpha = 0.35 + Math.sin(angle) * 0.25;
        }

        station.label.alpha = 0.62 + station.ringAlpha * 0.38;
        station.meta.alpha = 0.4 + station.ringAlpha * 0.6;
      }

      return nearestId;
    },
    markDiscovered: (id) => {
      const station = stations.find((entry) => entry.project.id === id);
      if (!station || station.discovered) return;
      station.discovered = true;
      station.discoveredMark.visible = true;
      station.proximityRing.tint = 0xffffff;
    },
    destroy: () => {
      view.destroy({ children: true });
    },
  };
};
