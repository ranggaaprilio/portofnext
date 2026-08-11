/**
 * Every magic number the arcade world runs on, in one place.
 *
 * Keep this module free of `pixi.js` imports — `project-world.tsx` is the only
 * route to the renderer chunk, and a value import here would leak it wider.
 */

/** Avatar movement. */
export const ACCEL = 1800; // px/s²
export const MAX_SPEED = 420; // px/s
export const DAMPING = 8; // per second
export const DRAG_RANGE = 80; // px of pointer travel for a full-tilt virtual stick

/** Camera. */
export const CAMERA_LAG = 8; // per second
/** Seconds of velocity added to the camera target, so the view leads the ship. */
export const LOOK_AHEAD = 0.16;
export const LOOK_AHEAD_MAX = 140; // px, keeps the lead from running away
/** Zoom eases from 1 (idle) to this at full speed — a small sense of rush. */
export const SPEED_ZOOM = 0.94;
export const ZOOM_LAG = 3; // per second

/** clamp: deltaMS spikes hugely after a tab switch. */
export const MAX_DELTA = 1 / 30;

/**
 * A station lights up from this far away, well before it is interactable.
 * Generous on purpose: this is a portfolio, so the projects have to be legible
 * from the starting position — the reveal is flavour, not a puzzle.
 */
export const REVEAL_RADIUS = 640;

/** Particle budget. Sized so the whole world stays comfortably inside 60fps. */
export const PARTICLE_POOL = 240;
export const SHOCKWAVE_POOL = 4;
export const TRAIL_INTERVAL = 0.018; // seconds between thruster puffs
export const STAR_COUNT = 380;
export const DUST_COUNT = 70;

export const MONO_STACK =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';

/** Palette shared by the procedural art. CSS hex — Pixi v8 accepts strings. */
export const BRAND = "#7c5cf0";
export const BRAND_LIGHT = "#a78bfa";
export const NEBULA_TINTS = ["#7c5cf0", "#41b883", "#e05fa8"] as const;
