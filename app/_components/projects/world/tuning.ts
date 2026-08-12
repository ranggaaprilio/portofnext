/**
 * Every magic number the arcade world runs on, in one place.
 *
 * Keep this module free of `pixi.js` imports — `project-world.tsx` is the only
 * route to the renderer chunk, and a value import here would leak it wider.
 */

/** Avatar movement. */
export const ACCEL = 1800; // px/s²
/**
 * Safety clamp, not a target. The ship is a damped first-order system, so what
 * it actually reaches is ACCEL/DAMPING — ~210px/s cruising, ~430px/s boosted.
 * This sits just above the boosted figure, which also makes it the denominator
 * that lets `speedRatio` span its full 0..1 range under boost. Raise it and the
 * engine glow, the trail and the speed-zoom all lose their reach.
 */
export const MAX_SPEED = 460; // px/s
export const DAMPING = 8; // per second
export const DRAG_RANGE = 80; // px of pointer travel for a full-tilt virtual stick

/** Boost. Multiplies the accel and *lowers* the damping — see MAX_SPEED. */
export const BOOST_ACCEL_MULT = 1.6;
export const BOOST_DAMPING_MULT = 0.8; // less drag ⇒ higher terminal speed
export const BOOST_RAMP = 7; // per second, easing on the 0..1 boost value
/** Stick magnitude, in DRAG_RANGE units, that counts as flooring it. */
export const BOOST_DRAG_RATIO = 1.6;

/** Camera. */
export const CAMERA_LAG = 8; // per second
/** Seconds of velocity added to the camera target, so the view leads the ship. */
export const LOOK_AHEAD = 0.16;
export const LOOK_AHEAD_MAX = 140; // px, keeps the lead from running away
/** Zoom eases from 1 (idle) to this at full speed — a small sense of rush. */
export const SPEED_ZOOM = 0.94;
/** …and to this at full boost. Blended as a coefficient, never as the ratio. */
export const BOOST_ZOOM = 0.86;
export const ZOOM_LAG = 3; // per second

/**
 * Intro fly-in: the sector is framed whole, then the camera settles onto the
 * ship. The zoom it starts from is derived from the viewport rather than fixed,
 * because "the whole world fits" is a different number on every window size.
 */
export const INTRO_DURATION = 1.4; // seconds
export const INTRO_FIT = 0.94; // fraction of the fit-the-world zoom
export const INTRO_ZOOM_MIN = 0.34;
/** Touch any control and the reveal hurries to its end instead of snapping. */
export const INTRO_SKIP_RATE = 4;

/**
 * Star streak. Deliberately windowed rather than linear in speedRatio: cruising
 * must produce exactly zero streak, or the sky reads as permanent motion blur.
 * That makes the streak a boost-exclusive effect, which is what gives boost its
 * own visual signature.
 */
export const STREAK_START = 0.58; // speedRatio where streaking begins…
export const STREAK_FULL = 0.94; // …and where it tops out
/**
 * Extra x-scale at full streak, so stars stretch to 2.6x. Above roughly that,
 * the star texture's vertical flare bar (1.5px in a 64px canvas) widens into a
 * stroke across the middle of the streak and the whole thing reads as a
 * squashed cross instead of a line.
 */
export const STREAK_MAX = 1.6;
/** Dust uses the flare-free spark texture, so it can stretch further. */
export const DUST_STREAK_MAX = 2.4;
export const STREAK_FADE = 0.3; // additive blend only gets brighter as it stretches
export const STREAK_RAMP = 5; // per second
/** Below this the streak settles back to base exactly once, then stops writing. */
export const STREAK_EPSILON = 0.004;

/**
 * Impact, fired on a first discovery. Hitstop is a time scale rather than a
 * stopped ticker, so every system downstream of `dt` slows together.
 */
export const SHAKE_DISCOVER = 7; // px, screen space
export const SHAKE_DECAY = 9; // per second
/** rad/s. Keep both below ~70 or they alias into a visible beat at 60fps. */
export const SHAKE_FREQ_A = 42;
export const SHAKE_FREQ_B = 57;
export const SHAKE_EPSILON = 0.08; // px; exp() never reaches zero on its own
export const HITSTOP_DURATION = 0.05; // seconds
export const HITSTOP_SCALE = 0.22;

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

/**
 * Placeholder stations read as dormant hardware rather than as empty slots:
 * an irregular flicker, a stepper motor that keeps stalling, and the occasional
 * spark. Every value here is driven by `elapsed` and the station's own phase —
 * no Math.random() in the frame loop, which at 60Hz reads as static, not fault.
 */
/** Must match the segment count `dashedCircle` draws, or the quantised ring drifts. */
export const DORMANT_RING_SEGMENTS = 14;
/**
 * The dashed ring has 14-fold rotational symmetry, so quantising to one segment
 * would render it *visually motionless*. Subdividing gives distinct poses.
 */
export const DORMANT_RING_SUBSTEPS = 3;
export const DORMANT_RING_SPEED = 0.22; // rad/s, before quantisation
export const DORMANT_FLICKER_FLOOR = 0.42;
export const DORMANT_DIP_CHANCE = 0.72; // noise threshold for a dropout
export const DORMANT_STALL_THRESHOLD = -0.55; // …and for the ring seizing up
export const DORMANT_SPARK_MIN = 2.4; // seconds between sparks
export const DORMANT_SPARK_MAX = 5.5;
export const DORMANT_SPARK_COUNT = 5;
/** Sparks draw at full brightness regardless of station alpha, so gate on range. */
export const DORMANT_SPARK_RANGE = 900; // px

export const MONO_STACK =
  '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace';

/** Palette shared by the procedural art. CSS hex — Pixi v8 accepts strings. */
export const BRAND = "#7c5cf0";
export const BRAND_LIGHT = "#a78bfa";
export const NEBULA_TINTS = ["#7c5cf0", "#41b883", "#e05fa8"] as const;
