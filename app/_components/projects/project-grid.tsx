"use client";

import {
  PROJECTS,
  type Project,
  STATUS_LABEL,
  isExternalLink,
} from "@/app/_components/projects/data";
import TiltCard from "@/app/_components/ui/tilt-card";
import { Badge } from "@/components/ui/badge";
import { expoOut } from "@/lib/motion";
import { type Variants, motion } from "framer-motion";
import Image from "next/image";

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

/**
 * The always-rendered, crawlable, keyboard-navigable representation of every
 * project. The Pixi world is an enhancement on top of this list, never a
 * replacement for it — the anchors below are what search engines follow, so
 * they must exist in the server-rendered HTML rather than appear on click.
 */
const ProjectGrid = ({ onOpen }: { onOpen: (project: Project) => void }) => (
  <motion.ul
    id="project-list"
    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
  >
    {PROJECTS.map((project) => (
      <li key={project.id} className="h-full">
        <TiltCard variants={revealVariants} className="h-full">
          <article
            className={`flex h-full flex-col rounded-xl border bg-card p-6 transition-colors ${
              project.isPlaceholder
                ? "border-dashed border-border/60"
                : "border-border hover:border-brand/40"
            }`}
          >
            {/* Decorative on purpose: the shot repeats what the heading and
                tagline already say, and the detail panel carries the described
                copy of the same image. */}
            {project.gallery?.[0] ? (
              <div className="-mx-6 -mt-6 mb-6 overflow-hidden rounded-t-xl border-b border-border bg-muted">
                <Image
                  src={project.gallery[0].src}
                  alt=""
                  width={project.gallery[0].width}
                  height={project.gallery[0].height}
                  sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 90vw"
                  className="h-40 w-full object-cover object-top"
                />
              </div>
            ) : null}

            <span
              aria-hidden="true"
              className="h-1.5 w-8 rounded-full"
              style={{ backgroundColor: project.accent }}
            />

            <h4 className="mt-5 font-display text-xl tracking-[-0.01em]">
              {project.title}
            </h4>

            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {project.tagline}
            </p>

            {project.year || project.role ? (
              <p className="mt-5 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
                {[project.year, project.role].filter(Boolean).join(" · ")}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant={project.isPlaceholder ? "outline" : "secondary"}>
                {STATUS_LABEL[project.status]}
              </Badge>
              {project.tech.map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
              <button
                type="button"
                onClick={() => onOpen(project)}
                className="rounded-lg border border-border px-3 py-1.5 transition-colors hover:border-brand/40 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Details
              </button>

              {project.links.demo ? (
                <a
                  href={project.links.demo}
                  {...(isExternalLink(project.links.demo)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-muted-foreground transition-colors hover:text-brand"
                >
                  Live&nbsp;↗
                </a>
              ) : null}

              {project.links.repo ? (
                <a
                  href={project.links.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-brand"
                >
                  Source&nbsp;↗
                </a>
              ) : null}
            </div>
          </article>
        </TiltCard>
      </li>
    ))}
  </motion.ul>
);

export default ProjectGrid;
