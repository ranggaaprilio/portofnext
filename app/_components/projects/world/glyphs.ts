import type { GlyphKey } from "@/app/_components/projects/data";
import { Graphics } from "pixi.js";

/**
 * The mark sitting inside each station core. Every glyph is a handful of
 * `Graphics` strokes drawn around the origin and sized to fit a ~22px box, so
 * a station reads as a distinct place on the map rather than one more circle.
 */

type GlyphPainter = (graphics: Graphics) => void;

const site: GlyphPainter = (g) => {
  g.roundRect(-10, -8, 20, 16, 3);
  g.moveTo(-10, -3).lineTo(10, -3);
  g.circle(-6.5, -5.5, 0.9);
  g.circle(-3.5, -5.5, 0.9);
};

const tools: GlyphPainter = (g) => {
  g.moveTo(-4, -6).lineTo(-10, 0).lineTo(-4, 6);
  g.moveTo(4, -6).lineTo(10, 0).lineTo(4, 6);
  g.moveTo(1.5, -7).lineTo(-1.5, 7);
};

const api: GlyphPainter = (g) => {
  g.moveTo(-7, -5).lineTo(7, 2);
  g.moveTo(-7, -5).lineTo(0, 7);
  g.moveTo(7, 2).lineTo(0, 7);
  g.circle(-7, -5, 1.8);
  g.circle(7, 2, 1.8);
  g.circle(0, 7, 1.8);
};

const mobile: GlyphPainter = (g) => {
  g.roundRect(-6, -9, 12, 18, 3);
  g.moveTo(-2, 6).lineTo(2, 6);
};

const data: GlyphPainter = (g) => {
  g.ellipse(0, -6, 9, 3.2);
  g.moveTo(-9, -6).lineTo(-9, 6);
  g.moveTo(9, -6).lineTo(9, 6);
  g.ellipse(0, 0, 9, 3.2);
  g.ellipse(0, 6, 9, 3.2);
};

/** A padlock rather than a question mark: it reads as "not yet", not "broken". */
const locked: GlyphPainter = (g) => {
  g.roundRect(-7, -1, 14, 11, 2.5);
  g.moveTo(-4, -1).lineTo(-4, -5).arc(0, -5, 4, Math.PI, 0).lineTo(4, -1);
};

const PAINTERS: Record<GlyphKey, GlyphPainter> = {
  site,
  tools,
  api,
  mobile,
  data,
  locked,
};

export const createGlyph = (key: GlyphKey, color: string): Graphics => {
  const graphics = new Graphics();
  PAINTERS[key](graphics);
  graphics.stroke({
    color,
    width: 1.6,
    alpha: 0.95,
    cap: "round",
    join: "round",
  });
  return graphics;
};
