/**
 * Mutable per-frame state shared by everything inside the Canvas. The rig
 * writes it first each frame; stations, ship and effects only read it. It is
 * a plain object in a ref, never React state — 60fps must not re-render.
 *
 * Positions are world pixels (x right, y down), as in `data.ts`.
 */
export type Sim = {
  player: { x: number; y: number };
  velocity: { x: number; y: number };
  camera: { x: number; y: number };
  /** 0..1, eased. */
  boost: number;
  /** Speed over MAX_SPEED, 0..1. */
  speedRatio: number;
  /** Hitstop-scaled frame delta, seconds. */
  dt: number;
  elapsed: number;
  seen: Set<string>;
  /** Stations inside interact range, with release hysteresis. */
  active: Set<string>;
  discovered: Set<string>;
  nearestId: string | null;
  /** Bumped on every discovery so the burst effect can tell a new one apart. */
  burst: { serial: number; x: number; y: number; color: string };
};

export type Input = {
  keys: Set<string>;
  /** `magnitude` is the *unclamped* pull, which is what boost reads. */
  stick: { x: number; y: number; magnitude: number };
  introSkip: boolean;
};

export const createSim = (): Sim => ({
  player: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  camera: { x: 0, y: 0 },
  boost: 0,
  speedRatio: 0,
  dt: 0,
  elapsed: 0,
  seen: new Set(),
  active: new Set(),
  discovered: new Set(),
  nearestId: null,
  burst: { serial: 0, x: 0, y: 0, color: "#ffffff" },
});
