"use client";

import type { Project } from "@/app/_components/projects/data";
import { expoOut } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { forwardRef, useImperativeHandle, useRef } from "react";

/**
 * The card that floats beside the station you are standing next to. It is
 * purely a preview — `aria-hidden`, never focusable — because it moves with the
 * camera, and a moving focus target is a keyboard trap in slow motion. The HUD
 * button underneath is the real, stable control.
 *
 * Its position is written straight to the wrapper's transform from the Pixi
 * ticker; React only decides *which* project is showing.
 */

export type PreviewCardHandle = {
  setPosition: (x: number, y: number) => void;
};

type PreviewCardProps = { project: Project | null };

const WorldPreviewCard = forwardRef<PreviewCardHandle, PreviewCardProps>(
  ({ project }, ref) => {
    const anchorRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      setPosition: (x, y) => {
        const anchor = anchorRef.current;
        if (!anchor) return;
        anchor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      },
    }));

    return (
      <div
        ref={anchorRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 will-change-transform"
      >
        {/* The static offset lives on its own element: the card itself is
            transformed by Framer Motion, and the two would overwrite each
            other on a single node. */}
        <div className="-translate-x-1/2 -translate-y-[calc(100%_+_78px)]">
          <AnimatePresence>
            {project ? (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.24, ease: expoOut }}
                className="w-56 rounded-xl border border-border bg-card/90 p-4 backdrop-blur"
                style={{ borderColor: `${project.accent}55` }}
              >
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground">
                  {[project.year, project.role].filter(Boolean).join(" · ") ||
                    "Reserved slot"}
                </p>
                <p className="mt-2 font-display text-base leading-tight">
                  {project.title}
                </p>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {project.tagline}
                </p>

                {project.tech.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {project.tech.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-full border border-border px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : null}

                <p className="mt-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-brand">
                  Press E
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    );
  },
);

WorldPreviewCard.displayName = "WorldPreviewCard";

export default WorldPreviewCard;
