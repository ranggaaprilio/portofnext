import type { ParticleSystem } from "@/app/_components/projects/world/particles";
import type { WorldTextures } from "@/app/_components/projects/world/textures";
import {
  BRAND,
  BRAND_LIGHT,
  MAX_SPEED,
  TRAIL_INTERVAL,
} from "@/app/_components/projects/world/tuning";
import { Container, Graphics, Sprite } from "pixi.js";

/**
 * The thing you actually steer: a small craft that turns towards its heading,
 * burns brighter the faster it goes, and carries a soft lamp that gives the
 * dark map a readable pool of light around the player.
 */

export type Avatar = {
  view: Container;
  /**
   * Returns the smoothed heading. The starfield streaks along it, and it has to
   * be *this* value rather than a fresh atan2: the ship eases into a turn, so a
   * raw heading would make the sky snap while the ship was still coming round.
   */
  update: (
    dt: number,
    x: number,
    y: number,
    vx: number,
    vy: number,
    boost: number,
  ) => number;
  destroy: () => void;
};

/** Below this the heading is meaningless, so the ship keeps its last facing. */
const HEADING_THRESHOLD = 24; // px/s

/** Shortest signed angle between headings, so the ship never turns the long way. */
const angleDelta = (from: number, to: number): number => {
  let delta = (to - from) % (Math.PI * 2);
  if (delta > Math.PI) delta -= Math.PI * 2;
  if (delta < -Math.PI) delta += Math.PI * 2;
  return delta;
};

export const createAvatar = (
  textures: WorldTextures,
  particles: ParticleSystem,
): Avatar => {
  const view = new Container();

  const lamp = new Sprite(textures.glow);
  lamp.anchor.set(0.5);
  lamp.tint = BRAND_LIGHT;
  lamp.blendMode = "add";
  lamp.scale.set(2.6);
  lamp.alpha = 0.1;

  // The craft is a child of a rotating hull so the lamp stays axis-aligned.
  const hull = new Container();

  const engineGlow = new Sprite(textures.glow);
  engineGlow.anchor.set(0.5);
  engineGlow.tint = BRAND_LIGHT;
  engineGlow.blendMode = "add";
  engineGlow.position.set(-12, 0);
  engineGlow.scale.set(0.3);
  engineGlow.alpha = 0.3;

  const ship = new Graphics()
    .poly([15, 0, -9, 9, -4, 0, -9, -9])
    .fill({ color: BRAND, alpha: 0.95 })
    .poly([15, 0, -9, 9, -4, 0, -9, -9])
    .stroke({ color: 0xfafafa, width: 1.5, alpha: 0.9 });

  const cockpit = new Graphics()
    .circle(3, 0, 2.6)
    .fill({ color: 0xfafafa, alpha: 0.95 });

  hull.addChild(engineGlow, ship, cockpit);
  view.addChild(lamp, hull);

  let heading = 0;
  let trailTimer = 0;

  return {
    view,
    update: (dt, x, y, vx, vy, boost) => {
      view.position.set(x, y);

      const speed = Math.hypot(vx, vy);
      // Boost raises the actual speed rather than this ceiling, so the glow and
      // the trail below follow it without needing to know about boost at all.
      const speedRatio = Math.min(speed / MAX_SPEED, 1);

      if (speed > HEADING_THRESHOLD) {
        const target = Math.atan2(vy, vx);
        heading += angleDelta(heading, target) * (1 - Math.exp(-12 * dt));
        hull.rotation = heading;
      }

      engineGlow.scale.set(0.25 + speedRatio * 0.5);
      engineGlow.alpha = 0.25 + speedRatio * 0.55;
      lamp.alpha = 0.09 + speedRatio * 0.05;

      if (speedRatio <= 0.06) {
        trailTimer = 0;
        // The last heading, not zero: the ship keeps its facing while drifting.
        return heading;
      }

      // Denser under boost, but floored — a vanishing interval would turn the
      // loop below into a long one on a single frame.
      const interval = Math.max(TRAIL_INTERVAL * (1 - boost * 0.4), 0.006);

      trailTimer += dt;
      while (trailTimer >= interval) {
        trailTimer -= interval;
        // Emitted in world space behind the ship, with a little scatter and a
        // velocity opposing travel so the trail hangs where the ship has been.
        const backX = x - Math.cos(heading) * 12;
        const backY = y - Math.sin(heading) * 12;
        particles.emit(
          backX + (Math.random() - 0.5) * 4,
          backY + (Math.random() - 0.5) * 4,
          -vx * 0.12 + (Math.random() - 0.5) * 30,
          -vy * 0.12 + (Math.random() - 0.5) * 30,
          // Burns whiter under boost: the mix tips from half brand-violet to
          // mostly white, which reads as a hotter exhaust without a new colour.
          Math.random() > 0.5 + boost * 0.35 ? BRAND_LIGHT : "#ffffff",
          0.35 + Math.random() * 0.3,
          0.2 + speedRatio * 0.35,
        );
      }

      return heading;
    },
    destroy: () => {
      view.destroy({ children: true });
    },
  };
};
