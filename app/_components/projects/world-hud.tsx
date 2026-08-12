"use client";

import type { Project } from "@/app/_components/projects/data";
import Minimap, {
  type MinimapHandle,
} from "@/app/_components/projects/minimap";
import { expoOut } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import type { RefObject } from "react";

type WorldHudProps = {
  discoveredCount: number;
  total: number;
  nearby: Project | null;
  seen: ReadonlySet<string>;
  minimapRef: RefObject<MinimapHandle>;
  /** The most recent first-time discovery, or null once its toast has expired. */
  toast: Project | null;
  onOpenNearby: () => void;
};

/**
 * DOM overlay for the arcade world. Deliberately `absolute` inside the canvas
 * wrapper rather than `fixed` — the navbar hides and reveals on scroll, and a
 * fixed HUD would collide with it unpredictably.
 */
const WorldHud = ({
  discoveredCount,
  total,
  nearby,
  seen,
  minimapRef,
  toast,
  onOpenNearby,
}: WorldHudProps) => {
  const progress = total === 0 ? 0 : (discoveredCount / total) * 100;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <div className="absolute left-6 top-6">
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.3em] text-muted-foreground">
          discovered {discoveredCount}/{total}
        </p>
        <div className="mt-2 h-0.5 w-32 overflow-hidden rounded-full bg-border">
          <div
            className="h-full bg-brand shadow-[0_0_8px_hsl(var(--brand))] transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="absolute right-6 top-6 hidden md:block">
        <Minimap ref={minimapRef} seen={seen} />
      </div>

      <p className="absolute bottom-6 left-6 max-w-[16rem] font-mono text-[0.65rem] uppercase leading-relaxed tracking-[0.2em] text-muted-foreground">
        WASD / arrows fly · shift boosts · drag to fly · E opens · Esc closes
      </p>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.32, ease: expoOut }}
            className="absolute bottom-6 right-6 rounded-lg border border-border bg-card/90 px-4 py-2 backdrop-blur"
            style={{ borderColor: `${toast.accent}66` }}
          >
            <p className="font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">
              station found
            </p>
            <p className="mt-1 text-sm" style={{ color: toast.accent }}>
              {toast.title}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {nearby ? (
          <motion.div
            key={nearby.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: expoOut }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2"
          >
            <button
              type="button"
              onClick={onOpenNearby}
              className="pointer-events-auto rounded-full border border-border bg-card/90 px-4 py-2 text-sm backdrop-blur transition-colors hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <span className="font-mono text-xs text-brand">E</span>
              <span className="ml-2">{nearby.title}</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite">
        {nearby
          ? `Near ${nearby.title}. Press E to open its details.`
          : `Discovered ${discoveredCount} of ${total} projects.`}
      </p>
    </div>
  );
};

export default WorldHud;
