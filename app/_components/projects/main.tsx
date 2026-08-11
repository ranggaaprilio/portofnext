"use client";

import {
  PROJECTS,
  PROJECT_TOTAL,
  REAL_PROJECTS,
  SITE_ORIGIN,
  findProject,
  toAbsoluteUrl,
} from "@/app/_components/projects/data";
import LazyProjectWorld from "@/app/_components/projects/lazy-project-world";
import type { MinimapHandle } from "@/app/_components/projects/minimap";
import ProjectDetailPanel from "@/app/_components/projects/project-detail-panel";
import ProjectGrid from "@/app/_components/projects/project-grid";
import WorldHud from "@/app/_components/projects/world-hud";
import WorldPreviewCard, {
  type PreviewCardHandle,
} from "@/app/_components/projects/world-preview-card";
import SectionHeading from "@/app/_components/ui/section-heading";
import { useWebglCapable } from "@/hooks/use-webgl-capable";
import { expoOut } from "@/lib/motion";
import {
  AnimatePresence,
  MotionConfig,
  type Variants,
  motion,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type ViewMode = "game" | "list";

const VIEW_STORAGE_KEY = "projects-view";

const sectionVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const collectionJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Projects — Rangga Aprilio Utama",
  url: `${SITE_ORIGIN}/projects`,
  mainEntity: {
    "@type": "ItemList",
    itemListElement: REAL_PROJECTS.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareApplication",
        name: project.title,
        description: project.tagline,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        ...(project.links.demo
          ? { url: toAbsoluteUrl(project.links.demo) }
          : {}),
        ...(project.links.repo ? { codeRepository: project.links.repo } : {}),
        author: { "@type": "Person", name: "Rangga Aprilio Utama" },
      },
    })),
  },
};

const Projects = () => {
  const capable = useWebglCapable();
  const worldHostRef = useRef<HTMLDivElement>(null);
  const minimapRef = useRef<MinimapHandle>(null);
  const previewRef = useRef<PreviewCardHandle>(null);

  const [mode, setMode] = useState<ViewMode>("game");
  const [discovered, setDiscovered] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [seen, setSeen] = useState<ReadonlySet<string>>(() => new Set());
  const [nearbyId, setNearbyId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [toastId, setToastId] = useState<string | null>(null);

  // Read after mount, never during render, so server and client agree.
  useEffect(() => {
    const stored = window.sessionStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === "list" || stored === "game") setMode(stored);
  }, []);

  const changeMode = useCallback((next: ViewMode) => {
    setMode(next);
    window.sessionStorage.setItem(VIEW_STORAGE_KEY, next);
  }, []);

  const handleDiscover = useCallback((id: string) => {
    // Replaced, never mutated — an in-place add would not re-render the HUD.
    setDiscovered((previous) =>
      previous.has(id) ? previous : new Set(previous).add(id),
    );
    setToastId(id);
  }, []);

  const handleSeen = useCallback((id: string) => {
    setSeen((previous) =>
      previous.has(id) ? previous : new Set(previous).add(id),
    );
  }, []);

  // Written to from the Pixi ticker: the overlays move themselves, so a frame
  // costs two style writes instead of a React render.
  const handleFrame = useCallback(
    (
      playerX: number,
      playerY: number,
      focusScreenX: number,
      focusScreenY: number,
    ) => {
      minimapRef.current?.setPlayer(playerX, playerY);
      previewRef.current?.setPosition(focusScreenX, focusScreenY);
    },
    [],
  );

  useEffect(() => {
    if (!toastId) return;
    const timer = window.setTimeout(() => setToastId(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastId]);

  // Focus restoration is the panel's job: it remembers whatever was focused
  // when it opened, so closing returns you to the world surface or to the grid
  // card you opened it from, rather than always jumping to the world.
  const handleClose = useCallback(() => setActiveId(null), []);

  const openNearby = useCallback(() => {
    if (nearbyId) setActiveId(nearbyId);
  }, [nearbyId]);

  const effectiveMode: ViewMode = capable ? mode : "list";
  const activeProject = findProject(activeId);
  const nearbyProject = findProject(nearbyId);
  const toastProject = findProject(toastId);

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        id="projects"
        aria-label="Projects"
        className="mx-auto flex w-full max-w-6xl flex-col px-6 py-24"
        variants={sectionVariants}
        initial="hidden"
        animate="visible"
      >
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD serialized from a static object, no user input
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionJsonLd),
          }}
        />

        <SectionHeading eyebrow="04 — Projects" title="Things I have built" />

        <motion.p
          variants={revealVariants}
          className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {effectiveMode === "game"
            ? "Walk the world below to find each project, or read the plain list underneath it — both show exactly the same thing. The game is a desktop extra; nothing lives only inside it."
            : "Every project is listed below. On a desktop browser with motion enabled, this page also becomes a small world you can walk around to find them."}
        </motion.p>

        <a
          href="#project-list"
          className="sr-only mt-4 focus:not-sr-only focus:inline-block focus:rounded-lg focus:border focus:border-brand focus:px-3 focus:py-1.5 focus:text-sm"
        >
          Skip the game and jump to the project list
        </a>

        <motion.div
          variants={revealVariants}
          // The toggle only exists on fine-pointer devices, and the gate that
          // decides that is false for one tick after mount. Reserving its height
          // in CSS rather than JS keeps desktop free of layout shift without
          // leaving a dead 40px gap on every touch device.
          className="mt-10 flex items-center justify-between gap-4 [@media(pointer:fine)]:min-h-10"
        >
          {capable ? (
            <div
              className="inline-flex rounded-full border border-border p-1"
              // biome-ignore lint/a11y/useSemanticElements: <fieldset> brings form semantics and default styling this two-button toggle does not want
              role="group"
              aria-label="Project view"
            >
              {(["game", "list"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => changeMode(option)}
                  aria-pressed={mode === option}
                  className={`rounded-full px-4 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    mode === option
                      ? "bg-brand text-brand-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>

        {effectiveMode === "game" ? (
          <motion.div variants={revealVariants} className="relative mt-6">
            <LazyProjectWorld
              projects={PROJECTS}
              hostRef={worldHostRef}
              paused={activeId !== null}
              onProximity={setNearbyId}
              onSeen={handleSeen}
              onDiscover={handleDiscover}
              onActivate={setActiveId}
              onFrame={handleFrame}
            />
            <WorldPreviewCard ref={previewRef} project={nearbyProject} />
            <WorldHud
              discoveredCount={discovered.size}
              total={PROJECT_TOTAL}
              nearby={nearbyProject}
              seen={seen}
              minimapRef={minimapRef}
              toast={toastProject}
              onOpenNearby={openNearby}
            />
          </motion.div>
        ) : null}

        <motion.h3
          variants={revealVariants}
          className="mt-16 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
        >
          All projects
        </motion.h3>

        <motion.div variants={gridVariants} className="mt-6">
          <ProjectGrid onOpen={(project) => setActiveId(project.id)} />
        </motion.div>
      </motion.section>

      {/* Sibling, not a child: an animating section carries a transform, and a
          transformed ancestor becomes the containing block for fixed children. */}
      <AnimatePresence>
        {activeProject ? (
          <ProjectDetailPanel
            key={activeProject.id}
            project={activeProject}
            onClose={handleClose}
          />
        ) : null}
      </AnimatePresence>
    </MotionConfig>
  );
};

export default Projects;
