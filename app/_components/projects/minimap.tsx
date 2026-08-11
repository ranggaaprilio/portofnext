"use client";

import { PROJECTS, WORLD } from "@/app/_components/projects/data";
import { forwardRef, useImperativeHandle, useRef } from "react";

/**
 * Sector map for the arcade HUD. Stations stay dim until the ship has seen
 * them, so the map fills in as you explore rather than handing you the answer.
 *
 * The player dot moves through an imperative handle rather than props: the
 * world writes to it 60 times a second, and routing that through React state
 * would re-render the whole projects section on every frame.
 */

export type MinimapHandle = { setPlayer: (x: number, y: number) => void };

const WIDTH = 148;
const HEIGHT = Math.round((WIDTH * WORLD.height) / WORLD.width);

type MinimapProps = { seen: ReadonlySet<string> };

const Minimap = forwardRef<MinimapHandle, MinimapProps>(({ seen }, ref) => {
  const dotRef = useRef<SVGGElement>(null);

  useImperativeHandle(ref, () => ({
    setPlayer: (x, y) => {
      const dot = dotRef.current;
      if (!dot) return;
      dot.style.transform = `translate(${(x * WIDTH) / WORLD.width}px, ${
        (y * HEIGHT) / WORLD.height
      }px)`;
    },
  }));

  return (
    <svg
      // World space maps straight onto the viewBox, so a station's coordinates
      // need nothing but a scale factor.
      viewBox={`${-WIDTH / 2} ${-HEIGHT / 2} ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      aria-hidden="true"
      className="rounded-lg border border-border/80 bg-background/70 backdrop-blur"
    >
      <title>Sector map</title>
      {PROJECTS.map((project) => {
        const isSeen = seen.has(project.id);
        return (
          <circle
            key={project.id}
            cx={(project.world.x * WIDTH) / WORLD.width}
            cy={(project.world.y * HEIGHT) / WORLD.height}
            r={isSeen ? 3 : 2}
            fill={isSeen ? project.accent : "transparent"}
            stroke={isSeen ? "transparent" : "#3f3f46"}
            strokeWidth={1}
            opacity={isSeen ? 0.95 : 0.7}
          />
        );
      })}
      <g ref={dotRef}>
        <circle r={4.5} fill="#7c5cf0" opacity={0.25} />
        <circle r={2} fill="#fafafa" />
      </g>
    </svg>
  );
});

Minimap.displayName = "Minimap";

export default Minimap;
