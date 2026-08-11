import { Texture } from "pixi.js";

/**
 * Every sprite in the world is drawn here at runtime — there is not a single
 * image file behind the arcade. Canvas 2D gives soft radial falloffs that
 * `Graphics` cannot express, and a white source means one texture can serve
 * every project once it is tinted with `project.accent`.
 *
 * One set is built per mount and destroyed with the renderer, so React's
 * StrictMode double-effect can never leave a stale GPU texture behind.
 */

export type WorldTextures = {
  /** Soft round falloff. Halos, engine glow, light radius, nebula. */
  glow: Texture;
  /** Small dot for pooled particles and constellation pulses. */
  spark: Texture;
  /** Dot plus a faint four-point flare, for the parallax starfield. */
  star: Texture;
  /** Transparent centre, dark edges. Screen-space overlay. */
  vignette: Texture;
  destroy: () => void;
};

const createCanvas = (size: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
};

const drawGlow = (size: number): HTMLCanvasElement => {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  // A plain two-stop gradient reads as a hard disc; the middle stops are what
  // make it look like light rather than a blurred circle.
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.18, "rgba(255,255,255,0.55)");
  gradient.addColorStop(0.45, "rgba(255,255,255,0.16)");
  gradient.addColorStop(0.75, "rgba(255,255,255,0.03)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

const drawSpark = (size: number): HTMLCanvasElement => {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,0.5)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

const drawStar = (size: number): HTMLCanvasElement => {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const half = size / 2;

  const flareH = ctx.createLinearGradient(0, half, size, half);
  flareH.addColorStop(0, "rgba(255,255,255,0)");
  flareH.addColorStop(0.5, "rgba(255,255,255,0.5)");
  flareH.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = flareH;
  ctx.fillRect(0, half - 0.75, size, 1.5);

  const flareV = ctx.createLinearGradient(half, 0, half, size);
  flareV.addColorStop(0, "rgba(255,255,255,0)");
  flareV.addColorStop(0.5, "rgba(255,255,255,0.5)");
  flareV.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = flareV;
  ctx.fillRect(half - 0.75, 0, 1.5, size);

  const core = ctx.createRadialGradient(half, half, 0, half, half, half * 0.4);
  core.addColorStop(0, "rgba(255,255,255,1)");
  core.addColorStop(0.4, "rgba(255,255,255,0.6)");
  core.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);

  return canvas;
};

const drawVignette = (size: number): HTMLCanvasElement => {
  const canvas = createCanvas(size);
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const half = size / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop(0.55, "rgba(0,0,0,0)");
  gradient.addColorStop(0.8, "rgba(0,0,0,0.26)");
  gradient.addColorStop(1, "rgba(0,0,0,0.6)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return canvas;
};

export const createWorldTextures = (): WorldTextures => {
  // skipCache: the cache is keyed by source and these canvases are unique per
  // mount anyway, so skipping it keeps Pixi's global cache clean across
  // remounts instead of accumulating one entry per visit to the page.
  const glow = Texture.from(drawGlow(256), true);
  const spark = Texture.from(drawSpark(32), true);
  const star = Texture.from(drawStar(64), true);
  const vignette = Texture.from(drawVignette(512), true);

  return {
    glow,
    spark,
    star,
    vignette,
    destroy: () => {
      for (const texture of [glow, spark, star, vignette]) {
        texture.destroy(true);
      }
    },
  };
};
