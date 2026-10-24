import type { ModelRig } from "@/app/_components/projects/world3d/config";

/**
 * The semi-realistic landing set built by `blender/hd/*`. Kept apart from the
 * low-poly /projects models so the arcade world stays light. Node and material
 * names come from those scripts; renaming one there means renaming it here.
 */

export type LandingModel = {
  url: string;
  /** Blender units → world units. */
  scale: number;
  /** Whole-model turn about Y, rad/s. */
  spin: number;
  /** Glow shell around a planet, in model units (planets are radius 3). */
  atmosphere?: { color: string; radius: number; intensity: number };
  /** Strength of studio reflections on metal parts; planets leave it unset. */
  reflections?: number;
  animate?: (rig: ModelRig, elapsed: number, dt: number) => void;
};

export const SHIP_HD_URL = "/models/hd/ship.glb";
export const ASTEROIDS_HD_URL = "/models/hd/asteroids.glb";

export const LANDING_MODELS = {
  mars: {
    url: "/models/hd/planet-mars.glb",
    scale: 0.8,
    spin: 0.03,
    atmosphere: { color: "#ff9b6b", radius: 3.12, intensity: 0.7 },
  },
  terra: {
    url: "/models/hd/planet-terra.glb",
    scale: 1,
    spin: 0.02,
    atmosphere: { color: "#6fb6ff", radius: 3.2, intensity: 1.3 },
    animate: (rig, _t, dt) => {
      const clouds = rig.node("Clouds");
      if (clouds) clouds.rotation.y += dt * 0.008;
    },
  },
  station: {
    url: "/models/hd/station.glb",
    scale: 0.7,
    spin: 0,
    reflections: 0.5,
    animate: (rig, t, dt) => {
      const ring = rig.node("Ring");
      if (ring) ring.rotation.y += dt * 0.15;
      rig.pulse("DockLights", Math.sin(t * 3) > 0.6 ? 1 : 0.15);
    },
  },
} satisfies Record<string, LandingModel>;
