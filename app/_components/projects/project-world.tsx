"use client";

import { type Project, WORLD } from "@/app/_components/projects/data";
import { createAvatar } from "@/app/_components/projects/world/avatar";
import { createConstellation } from "@/app/_components/projects/world/constellation";
import { createParticles } from "@/app/_components/projects/world/particles";
import { createStarfield } from "@/app/_components/projects/world/starfield";
import { createStations } from "@/app/_components/projects/world/stations";
import {
  type WorldTextures,
  createWorldTextures,
} from "@/app/_components/projects/world/textures";
import {
  ACCEL,
  CAMERA_LAG,
  DAMPING,
  DRAG_RANGE,
  LOOK_AHEAD,
  LOOK_AHEAD_MAX,
  MAX_DELTA,
  MAX_SPEED,
  SPEED_ZOOM,
  ZOOM_LAG,
} from "@/app/_components/projects/world/tuning";
import { Application, Container, Sprite, type Ticker } from "pixi.js";
import { type RefObject, useEffect, useRef } from "react";

const SCROLL_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  " ",
  "PageUp",
  "PageDown",
  "Home",
  "End",
]);

const normalizeKey = (key: string) =>
  key.length === 1 ? key.toLowerCase() : key;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

type ProjectWorldProps = {
  projects: readonly Project[];
  /** Owned by the parent so it can return focus here after the panel closes. */
  hostRef: RefObject<HTMLDivElement>;
  paused: boolean;
  onProximity: (id: string | null) => void;
  /** Fired once per station, the moment it comes within reveal range. */
  onSeen: (id: string) => void;
  onDiscover: (id: string) => void;
  onActivate: (id: string) => void;
  /**
   * Per-frame telemetry for the DOM overlays. Deliberately primitives and
   * deliberately not React state: the minimap and the in-world card write
   * straight to their own elements, so 60fps costs zero re-renders.
   */
  onFrame: (
    playerX: number,
    playerY: number,
    focusScreenX: number,
    focusScreenY: number,
  ) => void;
};

/**
 * The arcade world. Every Pixi object lives in a ref or an effect closure —
 * nothing renderer-owned is ever put in React state, and the frame loop only
 * calls back into React when the nearest node changes, when a station is first
 * seen, or when one is discovered for the first time.
 *
 * The scene is assembled from `world/*`; this file owns input, physics, the
 * camera and the lifecycle, and nothing that is merely decorative.
 */
const ProjectWorld = ({
  projects,
  hostRef,
  paused,
  onProximity,
  onSeen,
  onDiscover,
  onActivate,
  onFrame,
}: ProjectWorldProps) => {
  const appRef = useRef<Application | null>(null);
  const runFlagsRef = useRef({ visible: true, onScreen: true, unpaused: true });
  const syncRunningRef = useRef<() => void>(() => {});
  const nearestIdRef = useRef<string | null>(null);

  // Refreshed every render so the mount effect can stay on empty deps and
  // never tear the canvas down just because a parent callback changed.
  const callbacksRef = useRef({
    onProximity,
    onSeen,
    onDiscover,
    onActivate,
    onFrame,
  });
  useEffect(() => {
    callbacksRef.current = {
      onProximity,
      onSeen,
      onDiscover,
      onActivate,
      onFrame,
    };
  }, [onProximity, onSeen, onDiscover, onActivate, onFrame]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let cancelled = false;
    const app = new Application();

    const keys = new Set<string>();
    const discovered = new Set<string>();
    const seen = new Set<string>();
    const world = new Container();
    const overlay = new Container();

    const player = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    const camera = { x: 0, y: 0 };
    const stick = { x: 0, y: 0 };
    const dragOrigin = { x: 0, y: 0 };
    let dragging = false;
    let zoom = 1;
    let elapsed = 0;
    let textures: WorldTextures | null = null;
    let releaseOverlay: (() => void) | null = null;

    const halfWidth = WORLD.width / 2;
    const halfHeight = WORLD.height / 2;

    // Listeners live on the focusable host, not on window, so arrow keys and
    // space only drive the game while the canvas actually has focus.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) event.preventDefault();
      keys.add(normalizeKey(event.key));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      keys.delete(normalizeKey(event.key));
      if (event.key === "e" || event.key === "E" || event.key === "Enter") {
        const id = nearestIdRef.current;
        if (id) callbacksRef.current.onActivate(id);
      }
    };

    const handleBlur = () => {
      keys.clear();
      stick.x = 0;
      stick.y = 0;
      dragging = false;
    };

    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      dragOrigin.x = event.clientX;
      dragOrigin.y = event.clientY;
      host.focus({ preventScroll: true });
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      stick.x = clamp((event.clientX - dragOrigin.x) / DRAG_RANGE, -1, 1);
      stick.y = clamp((event.clientY - dragOrigin.y) / DRAG_RANGE, -1, 1);
    };

    const handlePointerEnd = () => {
      dragging = false;
      stick.x = 0;
      stick.y = 0;
    };

    const handleVisibilityChange = () => {
      runFlagsRef.current.visible = !document.hidden;
      syncRunningRef.current();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        runFlagsRef.current.onScreen = entries[0]?.isIntersecting ?? true;
        syncRunningRef.current();
      },
      { threshold: 0 },
    );

    const ready = (async () => {
      await app.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        preference: "webgl",
        powerPreference: "high-performance",
        autoStart: false,
        sharedTicker: false,
      });
      if (cancelled) return;

      // Pixi text cannot read CSS variables, so the font has to be resolved
      // before the first Text is measured or labels bake in the fallback.
      await document.fonts.ready;
      if (cancelled) return;

      textures = createWorldTextures();
      const starfield = createStarfield(textures);
      const constellation = createConstellation(projects, textures);
      const particles = createParticles(textures);
      const stations = createStations(projects, textures, {
        onSeen: (id) => {
          seen.add(id);
          constellation.setSeen(seen);
          callbacksRef.current.onSeen(id);
        },
        onActivate: (id) => callbacksRef.current.onActivate(id),
      });
      const avatar = createAvatar(textures, particles);

      world.addChild(
        starfield.view,
        constellation.view,
        stations.view,
        particles.view,
        avatar.view,
      );

      const vignette = new Sprite(textures.vignette);
      overlay.addChild(vignette);
      app.stage.addChild(world, overlay);

      const resizeOverlay = () => {
        vignette.width = app.screen.width;
        vignette.height = app.screen.height;
      };
      resizeOverlay();
      app.renderer.on("resize", resizeOverlay);
      releaseOverlay = () => app.renderer.off("resize", resizeOverlay);

      const update = (ticker: Ticker) => {
        const dt = Math.min(ticker.deltaMS / 1000, MAX_DELTA);
        elapsed += dt;

        let ix =
          (keys.has("d") || keys.has("ArrowRight") ? 1 : 0) -
          (keys.has("a") || keys.has("ArrowLeft") ? 1 : 0);
        let iy =
          (keys.has("s") || keys.has("ArrowDown") ? 1 : 0) -
          (keys.has("w") || keys.has("ArrowUp") ? 1 : 0);
        ix += stick.x;
        iy += stick.y;

        const magnitudeSq = ix * ix + iy * iy;
        if (magnitudeSq > 1) {
          const magnitude = Math.sqrt(magnitudeSq);
          ix /= magnitude;
          iy /= magnitude;
        }

        velocity.x += ix * ACCEL * dt;
        velocity.y += iy * ACCEL * dt;

        const decay = Math.exp(-DAMPING * dt);
        velocity.x *= decay;
        velocity.y *= decay;

        const speedSq = velocity.x ** 2 + velocity.y ** 2;
        if (speedSq > MAX_SPEED ** 2) {
          const scale = MAX_SPEED / Math.sqrt(speedSq);
          velocity.x *= scale;
          velocity.y *= scale;
        }

        const limitX = halfWidth - WORLD.avatarRadius;
        const limitY = halfHeight - WORLD.avatarRadius;
        player.x = clamp(player.x + velocity.x * dt, -limitX, limitX);
        player.y = clamp(player.y + velocity.y * dt, -limitY, limitY);

        const follow = 1 - Math.exp(-CAMERA_LAG * dt);
        const speedRatio = Math.min(
          Math.hypot(velocity.x, velocity.y) / MAX_SPEED,
          1,
        );

        // Lead the ship rather than centring it: the view opens up in the
        // direction of travel, which is what makes the map feel navigable.
        const leadX = clamp(
          velocity.x * LOOK_AHEAD,
          -LOOK_AHEAD_MAX,
          LOOK_AHEAD_MAX,
        );
        const leadY = clamp(
          velocity.y * LOOK_AHEAD,
          -LOOK_AHEAD_MAX,
          LOOK_AHEAD_MAX,
        );
        camera.x += (player.x + leadX - camera.x) * follow;
        camera.y += (player.y + leadY - camera.y) * follow;

        const targetZoom = 1 - (1 - SPEED_ZOOM) * speedRatio;
        zoom += (targetZoom - zoom) * (1 - Math.exp(-ZOOM_LAG * dt));

        // Keep the void outside the surveyed sector off screen whenever the
        // viewport is narrower than the world.
        const viewHalfWidth = app.screen.width / (2 * zoom);
        const viewHalfHeight = app.screen.height / (2 * zoom);
        camera.x =
          viewHalfWidth < halfWidth
            ? clamp(
                camera.x,
                -halfWidth + viewHalfWidth,
                halfWidth - viewHalfWidth,
              )
            : 0;
        camera.y =
          viewHalfHeight < halfHeight
            ? clamp(
                camera.y,
                -halfHeight + viewHalfHeight,
                halfHeight - viewHalfHeight,
              )
            : 0;

        world.scale.set(zoom);
        // Rounded: a sub-pixel camera offset makes Pixi text shimmer.
        world.position.set(
          Math.round(app.screen.width / 2 - camera.x * zoom),
          Math.round(app.screen.height / 2 - camera.y * zoom),
        );

        starfield.update(dt, camera.x, camera.y);
        constellation.update(elapsed);
        const nearestId = stations.update(dt, elapsed, player.x, player.y);
        avatar.update(dt, player.x, player.y, velocity.x, velocity.y);
        particles.update(dt);

        const nearest = nearestId
          ? (projects.find((entry) => entry.id === nearestId) ?? null)
          : null;

        if (nearestId !== nearestIdRef.current) {
          nearestIdRef.current = nearestId;
          callbacksRef.current.onProximity(nearestId);
        }
        if (nearest && !discovered.has(nearest.id)) {
          discovered.add(nearest.id);
          stations.markDiscovered(nearest.id);
          particles.burst(
            nearest.world.x,
            nearest.world.y,
            nearest.isPlaceholder ? "#a1a1aa" : nearest.accent,
          );
          callbacksRef.current.onDiscover(nearest.id);
        }

        // The card anchors to the nearest station, falling back to the ship so
        // it never animates in from a stale corner of the screen.
        const focusX = nearest ? nearest.world.x : player.x;
        const focusY = nearest ? nearest.world.y : player.y;
        callbacksRef.current.onFrame(
          player.x,
          player.y,
          world.position.x + focusX * zoom,
          world.position.y + focusY * zoom,
        );
      };

      app.canvas.setAttribute("aria-hidden", "true");
      // Deliberately left non-focusable: a focusable canvas swallows the click
      // focus that belongs to the host, which costs the focus ring and leaves
      // the detail panel restoring focus onto the canvas instead of the host.
      app.canvas.style.display = "block";
      host.appendChild(app.canvas);

      app.ticker.add(update);
      appRef.current = app;

      syncRunningRef.current = () => {
        const { visible, onScreen, unpaused } = runFlagsRef.current;
        if (visible && onScreen && unpaused) {
          app.ticker.start();
        } else {
          app.ticker.stop();
          keys.clear();
          stick.x = 0;
          stick.y = 0;
          dragging = false;
        }
      };
      syncRunningRef.current();

      host.addEventListener("keydown", handleKeyDown);
      host.addEventListener("keyup", handleKeyUp);
      host.addEventListener("blur", handleBlur);
      app.canvas.addEventListener("pointerdown", handlePointerDown);
      app.canvas.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });
      app.canvas.addEventListener("pointerup", handlePointerEnd);
      app.canvas.addEventListener("pointercancel", handlePointerEnd);
      app.canvas.addEventListener("pointerleave", handlePointerEnd);
      document.addEventListener("visibilitychange", handleVisibilityChange);
      observer.observe(host);
    })();

    return () => {
      cancelled = true;
      appRef.current = null;
      syncRunningRef.current = () => {};
      nearestIdRef.current = null;
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      host.removeEventListener("keydown", handleKeyDown);
      host.removeEventListener("keyup", handleKeyUp);
      host.removeEventListener("blur", handleBlur);

      // destroy() throws on a half-initialised Application, so wait for init to
      // settle. This also makes React StrictMode's double-effect safe: each
      // mount owns its own `app` closure and tears exactly that one down.
      void ready
        .catch(() => {})
        .finally(() => {
          releaseOverlay?.();
          const canvas = app.canvas;
          if (canvas) {
            canvas.removeEventListener("pointerdown", handlePointerDown);
            canvas.removeEventListener("pointermove", handlePointerMove);
            canvas.removeEventListener("pointerup", handlePointerEnd);
            canvas.removeEventListener("pointercancel", handlePointerEnd);
            canvas.removeEventListener("pointerleave", handlePointerEnd);
          }
          app.ticker.stop();
          app.destroy(
            { removeView: true },
            { children: true, texture: true, textureSource: true },
          );
          // Belt and braces: the stage teardown above already releases every
          // texture that a sprite still holds, but this mount generated them,
          // so it takes responsibility for the whole set. Texture.destroy is a
          // no-op the second time round.
          textures?.destroy();
        });
    };
  }, [projects, hostRef]);

  useEffect(() => {
    runFlagsRef.current.unpaused = !paused;
    syncRunningRef.current();
  }, [paused]);

  return (
    <div
      ref={hostRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the game surface must be focusable so key events reach the frame loop instead of scrolling the page
      tabIndex={0}
      role="application"
      aria-label="Interactive project world. Use the arrow keys or W A S D to fly, press E to open the nearest project. Every project is also listed below this game."
      className="relative h-[min(78vh,760px)] w-full overflow-hidden rounded-xl border border-border bg-[#050505] outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    />
  );
};

export default ProjectWorld;
