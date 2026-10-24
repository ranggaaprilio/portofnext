/**
 * The landing page as a flight path. The camera travels down -Z; each page
 * section has a pose the camera settles into while that section is on screen.
 * Props (planets, station, rocks) sit off to the sides of each pose so the
 * DOM text in the middle stays readable.
 */

export type Vec3 = [number, number, number];

export type Waypoint = {
  /** DOM id of the section this pose belongs to; null = top of the page. */
  section: string | null;
  camera: Vec3;
  target: Vec3;
  /** Ship position in camera space (x right, y up, -z forward). */
  ship: Vec3;
};

export const WAYPOINTS: readonly Waypoint[] = [
  {
    section: null,
    camera: [0, 0, 8],
    target: [0, 0, 0],
    ship: [3.4, -1.6, -6],
  },
  {
    section: "about",
    camera: [0, 0.5, -18],
    target: [3, -0.5, -32],
    ship: [4.6, -2.4, -8],
  },
  {
    section: "experience",
    camera: [0, 1, -44],
    target: [2, 0.5, -58],
    ship: [4.6, -2.4, -8],
  },
  {
    section: "skills",
    camera: [0, 0, -68],
    target: [0, 0, -84],
    ship: [4.6, -2.4, -8],
  },
];

/** The camera reaches a section's pose when the section top is this far down the viewport. */
export const ARRIVE_VIEWPORT_RATIO = 0.35;

export const PROP_POSITIONS = {
  mars: [-13, 4, -11] as Vec3,
  terra: [8.5, 1.5, -34] as Vec3,
  station: [6, 3, -60] as Vec3,
  rocks: [0, 0, -92] as Vec3,
};
