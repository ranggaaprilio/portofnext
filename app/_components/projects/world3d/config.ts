import type * as THREE from "three";

/**
 * Scale and per-model setup for the three.js project world.
 *
 * Physics, proximity and the camera all keep running in the same world-pixel
 * space the Pixi world used (see `data.ts` WORLD and `world/tuning.ts`), so
 * every tuning constant carries over unchanged. Only rendering converts.
 */

/** World pixels per three.js unit. At zoom 1 the view is roughly 1:1 with screen px. */
export const PX_PER_UNIT = 40;

/** The ship flies above the station tops, so it can pass over a planet. */
export const SHIP_ALTITUDE = 3.4;
export const SHIP_SCALE = 0.55;

/** Camera looks down at the flight plane from behind the ship. */
export const CAMERA_PITCH = (58 * Math.PI) / 180;
export const CAMERA_FOV = 40;
/** Extra field of view at full boost, for a sense of rush. */
export const BOOST_FOV = 7;

/**
 * Seen from the pitched camera, something at SHIP_ALTITUDE appears this much
 * further "north" (-Z) than a point on the station plane. The ship is drawn
 * shifted south by it, so it looks like it sits over its logical position and
 * proximity matches what you see.
 */
export const SHIP_PARALLAX = SHIP_ALTITUDE / Math.tan(CAMERA_PITCH);

export const SHIP_URL = "/models/ship.glb";
export const ASTEROIDS_URL = "/models/asteroids.glb";

/** Handle a model's animate() gets: named nodes, plus emissive pulsing by material name. */
export type ModelRig = {
  node: (name: string) => THREE.Object3D | undefined;
  /** Sets a material's emissive intensity to its exported value × factor. */
  pulse: (materialName: string, factor: number) => void;
};

export type StationModel = {
  url: string;
  /** Optional sub-node to use instead of the whole scene. */
  node?: string;
  /** Blender units → world units. */
  scale: number;
  /** Shifts the model so its visual centre sits at y = 0. */
  offsetY: number;
  /** Whole-model turn about Y, rad/s. Planets turn; built structures hold still. */
  spin: number;
  /** Height of the label and the preview-card anchor, world units after scaling. */
  top: number;
  animate?: (rig: ModelRig, elapsed: number, dt: number) => void;
};

const wave = (t: number, speed: number) => 0.5 + 0.5 * Math.sin(t * speed);

/**
 * Keyed by project id. Node and material names come from the scripts in
 * `blender/`; renaming one there means renaming it here.
 */
export const STATION_MODELS: Record<string, StationModel> = {
  "aprilio-dev": {
    url: "/models/station-hub.glb",
    scale: 0.6,
    offsetY: 0,
    spin: 0,
    top: 1.8,
    animate: (rig, t, dt) => {
      const ring = rig.node("Ring");
      if (ring) ring.rotation.y += dt * 0.25;
      rig.pulse("DockLights", 0.4 + 0.6 * wave(t, 3));
    },
  },
  "offline-devtools": {
    url: "/models/asteroid-workshop.glb",
    scale: 0.6,
    offsetY: -0.4,
    spin: 0.04,
    top: 2.2,
    animate: (rig, t) => {
      const crane = rig.node("Crane");
      if (crane) crane.rotation.y = Math.sin(t * 0.6) * 0.9;
      rig.pulse("Floodlight", 0.8 + 0.2 * Math.sin(t * 13) * Math.sin(t * 7));
    },
  },
  leadmanager: {
    url: "/models/planet-radar.glb",
    scale: 0.55,
    offsetY: 0,
    spin: 0.06,
    top: 2.7,
    animate: (rig, t, dt) => {
      const head = rig.node("RadarHead");
      if (head) head.rotation.y += dt * 1.2;
      rig.pulse("RadarLight", 0.3 + 0.7 * wave(t, 4) ** 4);
    },
  },
  "bid-ocean": {
    url: "/models/planet-ocean.glb",
    scale: 0.55,
    offsetY: 0,
    spin: 0.05,
    top: 2.9,
    animate: (rig, t, dt) => {
      const lamp = rig.node("LighthouseLamp");
      if (lamp) lamp.rotation.y += dt * 1.5;
      rig.pulse("Beacon", 0.4 + 0.6 * wave(t, 2.5));
    },
  },
  silancar: {
    url: "/models/planet-satellite.glb",
    scale: 0.6,
    offsetY: 0,
    spin: 0.04,
    top: 2.4,
    animate: (rig, t, dt) => {
      const speeds = [0.5, 0.35, 0.6];
      for (let i = 0; i < speeds.length; i++) {
        rig.node(`Orbit${i}`)?.rotateY(dt * speeds[i]);
      }
      rig.pulse("Geofence", 0.55 + 0.45 * wave(t, 1.6));
      rig.pulse("SatLight", wave(t, 5) > 0.8 ? 1 : 0.2);
    },
  },
  keyles: {
    url: "/models/vault-gate.glb",
    scale: 0.55,
    offsetY: -2.8 * 0.55,
    spin: 0,
    top: 2.0,
    animate: (rig, t, dt) => {
      const outer = rig.node("LockRingOuter");
      const inner = rig.node("LockRingInner");
      const crystal = rig.node("Crystal");
      if (outer) outer.rotation.z += dt * 0.6;
      if (inner) inner.rotation.z -= dt * 0.9;
      if (crystal) {
        crystal.rotation.y += dt * 1.2;
        crystal.position.y = 2.8 + Math.sin(t * 1.5) * 0.12;
      }
    },
  },
};

/** Anything without a dedicated model, placeholders included, is a lone rock. */
export const FALLBACK_MODEL: StationModel = {
  url: ASTEROIDS_URL,
  node: "Rock0",
  scale: 1.3,
  offsetY: 0,
  spin: 0.1,
  top: 1.6,
};

export const modelFor = (projectId: string): StationModel =>
  STATION_MODELS[projectId] ?? FALLBACK_MODEL;
