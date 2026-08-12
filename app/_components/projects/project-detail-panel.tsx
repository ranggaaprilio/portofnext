"use client";

import {
  type Project,
  STATUS_LABEL,
  isExternalLink,
} from "@/app/_components/projects/data";
import { Badge } from "@/components/ui/badge";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { expoOut } from "@/lib/motion";
import { motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])';

type ProjectDetailPanelProps = {
  project: Project;
  onClose: () => void;
};

/**
 * One panel serves both the arcade world and the grid, so project detail copy
 * lives in exactly one place. Rendered as a sibling of the page section, never
 * a descendant: an animating ancestor carries a transform, and a transformed
 * ancestor becomes the containing block for `position: fixed`.
 */
const ProjectDetailPanel = ({ project, onClose }: ProjectDetailPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const handleOutsideClick = useCallback(() => onClose(), [onClose]);
  useOutsideClick(panelRef, handleOutsideClick);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus({ preventScroll: true });

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable =
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      // `preventScroll` matters: globals.css sets `scroll-behavior: smooth`, so
      // a plain focus() would animate the viewport away from the reader.
      previouslyFocused.current?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return (
    <>
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[70] bg-background/70 backdrop-blur-sm"
      />

      {/* Centring is done with flex, not `-translate-y-1/2`: framer-motion
          writes its own inline transform, which would overwrite the utility
          class and drop the panel half a viewport too low. The wrapper stays
          click-through so the backdrop still receives outside clicks. */}
      <div className="pointer-events-none fixed inset-0 z-[71] flex items-center justify-center p-4">
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          // biome-ignore lint/a11y/useSemanticElements: <dialog> cannot be a framer-motion animated element with enter/exit transitions
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-panel-title"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ duration: 0.4, ease: expoOut }}
          className="pointer-events-auto max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-card p-8 outline-none"
        >
          <span
            aria-hidden="true"
            className="block h-1.5 w-10 rounded-full"
            style={{ backgroundColor: project.accent }}
          />

          <div className="mt-5 flex items-start justify-between gap-6">
            <div>
              <h2
                id="project-panel-title"
                className="font-display text-3xl tracking-[-0.02em]"
              >
                {project.title}
              </h2>
              {project.year || project.role ? (
                <p className="mt-3 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                  {[project.year, project.role].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close project details"
              className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              Esc
            </button>
          </div>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            {project.description}
          </p>

          {project.gallery?.length ? (
            <ul className="mt-8 flex flex-col gap-6">
              {project.gallery.map((shot, index) => (
                <li key={shot.src}>
                  <figure>
                    {/* The link is the only way to read these dense tables at
                        full size: inside a max-w-2xl panel the shots render at
                        roughly a third of their native width. */}
                    <a
                      href={shot.src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      <Image
                        src={shot.src}
                        alt={shot.alt}
                        width={shot.width}
                        height={shot.height}
                        sizes="(min-width: 768px) 640px, 100vw"
                        // Only the opener is worth blocking on: the rest sit
                        // below the fold of a scrolling panel.
                        loading={index === 0 ? "eager" : "lazy"}
                        className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.02]"
                      />
                    </a>
                    <figcaption className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {shot.caption}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant={project.isPlaceholder ? "outline" : "secondary"}>
              {STATUS_LABEL[project.status]}
            </Badge>
            {project.tech.map((tech) => (
              <Badge key={tech} variant="outline">
                {tech}
              </Badge>
            ))}
          </div>

          {project.links.demo || project.links.repo ? (
            <div className="mt-8 flex flex-wrap gap-4">
              {project.links.demo ? (
                <a
                  href={project.links.demo}
                  {...(isExternalLink(project.links.demo)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Open live&nbsp;↗
                </a>
              ) : null}
              {project.links.repo ? (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-border px-4 py-2 text-sm transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  View source&nbsp;↗
                </a>
              ) : null}
            </div>
          ) : null}
        </motion.div>
      </div>
    </>
  );
};

export default ProjectDetailPanel;
