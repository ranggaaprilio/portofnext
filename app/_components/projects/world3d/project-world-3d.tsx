"use client";

import { type Project, WORLD } from "@/app/_components/projects/data";
import {
  ACCEL,
  BOOST_ACCEL_MULT,
  BOOST_DAMPING_MULT,
  BOOST_DRAG_RATIO,
  BOOST_RAMP,
  BOOST_ZOOM,
  CAMERA_LAG,
  DAMPING,
  DRAG_RANGE,
  HITSTOP_DURATION,
  HITSTOP_SCALE,
  INTRO_DURATION,
  INTRO_FIT,
  INTRO_SKIP_RATE,
  INTRO_ZOOM_MIN,
  LOOK_AHEAD,
  LOOK_AHEAD_MAX,
  MAX_DELTA,
  MAX_SPEED,
  REVEAL_RADIUS,
  SHAKE_DECAY,
  SHAKE_DISCOVER,
  SHAKE_EPSILON,
  SHAKE_FREQ_A,
  SHAKE_FREQ_B,
  SPEED_ZOOM,
  ZOOM_LAG,
} from "@/app/_components/projects/world/tuning";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import {
  type MutableRefObject,
  type RefObject,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  ASTEROIDS_URL,
  BOOST_FOV,
  CAMERA_FOV,
  CAMERA_PITCH,
  PX_PER_UNIT,
  SHIP_ALTITUDE,
  SHIP_PARALLAX,
  SHIP_URL,
  STATION_MODELS,
  modelFor,
} from "./config";
import { Bloom, Burst } from "./effects";
import {
  AsteroidBelt,
  Bounds,
  Lights,
  Nebula,
  Starfield,
  Sun,
} from "./environment";
import { Ship } from "./ship";
import { type Input, type Sim, createSim } from "./sim";
import { Stations } from "./stations";

useLoader.preload(GLTFLoader, [
  SHIP_URL,
  ASTEROIDS_URL,
  ...Object.values(STATION_MODELS).map((model) => model.url),
]);

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

/** Same reveal curve as the Pixi world: arrives with near-zero slope. */
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

/** The camera aims a little above the stations, between them and the ship. */
const LOOK_HEIGHT = SHIP_ALTITUDE * 0.6;

type Callbacks = {
  onProximity: (id: string | null) => void;
  onSeen: (id: string) => void;
  onDiscover: (id: string) => void;
  onActivate: (id: string) => void;
  onFrame: (
    playerX: number,
    playerY: number,
    focusScreenX: number,
    focusScreenY: number,
  ) => void;
};

type RigProps = {
  projects: readonly Project[];
  sim: Sim;
  input: Input;
  callbacksRef: MutableRefObject<Callbacks>;
};

/**
 * Input, physics, proximity and the camera — a straight port of the Pixi
 * ticker, still in world pixels and on the same tuning constants. Runs at
 * priority -1, so every other frame callback reads this frame's `sim`.
 */
const Rig = ({ projects, sim, input, callbacksRef }: RigProps) => {
  const { camera, size } = useThree();
  const view = useRef({
    zoom: 1,
    rawElapsed: 0,
    shake: 0,
    hitstop: 0,
    introTime: 0,
    introZoom: 0,
  });
  const focus = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const v = view.current;
    const keys = input.keys;
    const { stick } = input;
    const rawDt = Math.min(delta, MAX_DELTA);
    v.rawElapsed += rawDt;

    // Hitstop is a time scale, not a stopped loop, so everything fed by `dt`
    // slows together and then resumes.
    let dt = rawDt;
    if (v.hitstop > 0) {
      v.hitstop -= rawDt;
      dt = rawDt * HITSTOP_SCALE;
    }
    sim.dt = dt;
    sim.elapsed += dt;

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

    const boosting =
      keys.has("Shift") || keys.has(" ") || stick.magnitude > BOOST_DRAG_RATIO;
    sim.boost +=
      ((boosting ? 1 : 0) - sim.boost) * (1 - Math.exp(-BOOST_RAMP * dt));

    const { player, velocity } = sim;
    const accel = ACCEL * (1 + (BOOST_ACCEL_MULT - 1) * sim.boost);
    velocity.x += ix * accel * dt;
    velocity.y += iy * accel * dt;
    const damping = DAMPING * (1 + (BOOST_DAMPING_MULT - 1) * sim.boost);
    const decay = Math.exp(-damping * dt);
    velocity.x *= decay;
    velocity.y *= decay;
    const speedSq = velocity.x ** 2 + velocity.y ** 2;
    if (speedSq > MAX_SPEED ** 2) {
      const scale = MAX_SPEED / Math.sqrt(speedSq);
      velocity.x *= scale;
      velocity.y *= scale;
    }

    const halfWidth = WORLD.width / 2;
    const halfHeight = WORLD.height / 2;
    const limitX = halfWidth - WORLD.avatarRadius;
    const limitY = halfHeight - WORLD.avatarRadius;
    player.x = clamp(player.x + velocity.x * dt, -limitX, limitX);
    player.y = clamp(player.y + velocity.y * dt, -limitY, limitY);
    sim.speedRatio = Math.min(
      Math.hypot(velocity.x, velocity.y) / MAX_SPEED,
      1,
    );

    // Proximity, with the same reveal radius and release hysteresis.
    let nearest: Project | null = null;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;
    for (const project of projects) {
      const dx = project.world.x - player.x;
      const dy = project.world.y - player.y;
      const distanceSq = dx * dx + dy * dy;
      if (!sim.seen.has(project.id) && distanceSq < REVEAL_RADIUS ** 2) {
        sim.seen.add(project.id);
        callbacksRef.current.onSeen(project.id);
      }
      const wasActive = sim.active.has(project.id);
      const isActive = wasActive
        ? distanceSq < WORLD.releaseRadius ** 2
        : distanceSq < WORLD.interactRadius ** 2;
      if (isActive) sim.active.add(project.id);
      else sim.active.delete(project.id);
      if (isActive && distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearest = project;
      }
    }

    const nearestId = nearest?.id ?? null;
    if (nearestId !== sim.nearestId) {
      sim.nearestId = nearestId;
      callbacksRef.current.onProximity(nearestId);
    }
    if (nearest && !sim.discovered.has(nearest.id)) {
      sim.discovered.add(nearest.id);
      sim.burst = {
        serial: sim.burst.serial + 1,
        x: nearest.world.x,
        y: nearest.world.y,
        color: nearest.isPlaceholder ? "#a1a1aa" : nearest.accent,
      };
      v.shake = SHAKE_DISCOVER;
      v.hitstop = HITSTOP_DURATION;
      callbacksRef.current.onDiscover(nearest.id);
    }

    // Camera: lead the ship, ease the zoom with speed, intro fly-in.
    const follow = 1 - Math.exp(-CAMERA_LAG * dt);
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
    sim.camera.x += (player.x + leadX - sim.camera.x) * follow;
    sim.camera.y += (player.y + leadY - sim.camera.y) * follow;

    const zoomFloor = SPEED_ZOOM + (BOOST_ZOOM - SPEED_ZOOM) * sim.boost;
    const targetZoom = 1 - (1 - zoomFloor) * sim.speedRatio;
    if (v.introTime < INTRO_DURATION) {
      if (v.introTime === 0) {
        v.introZoom = clamp(
          Math.min(size.width / WORLD.width, size.height / WORLD.height) *
            INTRO_FIT,
          INTRO_ZOOM_MIN,
          targetZoom,
        );
        v.zoom = v.introZoom;
      }
      v.introTime = Math.min(
        v.introTime + rawDt * (input.introSkip ? INTRO_SKIP_RATE : 1),
        INTRO_DURATION,
      );
      v.zoom =
        v.introZoom +
        (targetZoom - v.introZoom) * easeOutCubic(v.introTime / INTRO_DURATION);
    } else {
      v.zoom += (targetZoom - v.zoom) * (1 - Math.exp(-ZOOM_LAG * dt));
    }

    const viewHalfWidth = size.width / (2 * v.zoom);
    const viewHalfHeight = size.height / (2 * v.zoom);
    sim.camera.x =
      viewHalfWidth < halfWidth
        ? clamp(
            sim.camera.x,
            -halfWidth + viewHalfWidth,
            halfWidth - viewHalfWidth,
          )
        : 0;
    sim.camera.y =
      viewHalfHeight < halfHeight
        ? clamp(
            sim.camera.y,
            -halfHeight + viewHalfHeight,
            halfHeight - viewHalfHeight,
          )
        : 0;

    let shakeX = 0;
    let shakeY = 0;
    if (v.shake > 0) {
      v.shake *= Math.exp(-SHAKE_DECAY * rawDt);
      if (v.shake < SHAKE_EPSILON) v.shake = 0;
      shakeX = v.shake * Math.sin(v.rawElapsed * SHAKE_FREQ_A);
      shakeY = v.shake * Math.sin(v.rawElapsed * SHAKE_FREQ_B + 1.7);
    }

    const perspective = camera as THREE.PerspectiveCamera;
    const fov = CAMERA_FOV + BOOST_FOV * sim.boost;
    if (Math.abs(perspective.fov - fov) > 0.01) {
      perspective.fov = fov;
      perspective.updateProjectionMatrix();
    }
    // Distance at which one world px spans one screen px at zoom 1, using the
    // base FOV so the boost widening still reads as a widening.
    const halfFov = THREE.MathUtils.degToRad(CAMERA_FOV) / 2;
    const distance = size.height / PX_PER_UNIT / 2 / Math.tan(halfFov) / v.zoom;
    // Shake is screen-space px, so it is divided by zoom to stay constant on screen.
    const targetX = (sim.camera.x + shakeX / v.zoom) / PX_PER_UNIT;
    const targetZ = (sim.camera.y + shakeY / v.zoom) / PX_PER_UNIT;
    perspective.position.set(
      targetX,
      LOOK_HEIGHT + distance * Math.sin(CAMERA_PITCH),
      targetZ + distance * Math.cos(CAMERA_PITCH),
    );
    perspective.lookAt(targetX, LOOK_HEIGHT, targetZ);
    perspective.updateMatrixWorld();

    // The preview card anchors above the nearest station, else above the ship.
    if (nearest) {
      focus.set(
        nearest.world.x / PX_PER_UNIT,
        modelFor(nearest.id).top,
        nearest.world.y / PX_PER_UNIT,
      );
    } else {
      focus.set(
        player.x / PX_PER_UNIT,
        SHIP_ALTITUDE,
        player.y / PX_PER_UNIT + SHIP_PARALLAX,
      );
    }
    focus.project(perspective);
    callbacksRef.current.onFrame(
      player.x,
      player.y,
      ((focus.x + 1) / 2) * size.width,
      ((1 - focus.y) / 2) * size.height,
    );
  }, -1);

  return null;
};

type ProjectWorldProps = {
  projects: readonly Project[];
  /** Owned by the parent so it can return focus here after the panel closes. */
  hostRef: RefObject<HTMLDivElement>;
  paused: boolean;
} & Callbacks;

const releaseInput = (input: Input) => {
  input.keys.clear();
  input.stick.x = 0;
  input.stick.y = 0;
  input.stick.magnitude = 0;
};

/**
 * The 3D project world. A drop-in for the Pixi `ProjectWorld`: same props,
 * same callbacks, same controls. Only reachable through the dynamic import in
 * lazy-project-world.tsx, so three.js never lands in the shared chunk.
 */
const ProjectWorld3D = ({
  projects,
  hostRef,
  paused,
  onProximity,
  onSeen,
  onDiscover,
  onActivate,
  onFrame,
}: ProjectWorldProps) => {
  // Refreshed every render so the listeners can stay mounted and never tear
  // the canvas down just because a parent callback changed.
  const callbacksRef = useRef<Callbacks>({
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

  const [sim] = useState(createSim);
  const [input] = useState<Input>(() => ({
    keys: new Set(),
    stick: { x: 0, y: 0, magnitude: 0 },
    introSkip: false,
  }));

  const runFlags = useRef({ visible: true, onScreen: true, unpaused: true });
  const [running, setRunning] = useState(true);
  const syncRunning = useCallback(() => {
    const { visible, onScreen, unpaused } = runFlags.current;
    const run = visible && onScreen && unpaused;
    if (!run) releaseInput(input);
    setRunning(run);
  }, [input]);

  // Labels are drawn to canvas textures, which cannot wait for a web font on
  // their own: resolve fonts first or they bake in the fallback face.
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) setFontsReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const dragOrigin = { x: 0, y: 0 };
    let dragging = false;

    // Listeners live on the focusable host, not on window, so arrow keys and
    // space only drive the game while it actually has focus.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) event.preventDefault();
      input.keys.add(normalizeKey(event.key));
      input.introSkip = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      input.keys.delete(normalizeKey(event.key));
      if (event.key === "e" || event.key === "E" || event.key === "Enter") {
        if (sim.nearestId) callbacksRef.current.onActivate(sim.nearestId);
      }
    };
    const handleBlur = () => {
      releaseInput(input);
      dragging = false;
    };
    const handlePointerDown = (event: PointerEvent) => {
      dragging = true;
      dragOrigin.x = event.clientX;
      dragOrigin.y = event.clientY;
      host.focus({ preventScroll: true });
      input.introSkip = true;
    };
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      // Clamped radially, so a full diagonal pull is the same distance as a
      // straight one when it comes to triggering boost.
      const pullX = (event.clientX - dragOrigin.x) / DRAG_RANGE;
      const pullY = (event.clientY - dragOrigin.y) / DRAG_RANGE;
      const magnitude = Math.hypot(pullX, pullY);
      const scale = magnitude > 1 ? 1 / magnitude : 1;
      input.stick.magnitude = magnitude;
      input.stick.x = pullX * scale;
      input.stick.y = pullY * scale;
    };
    const handlePointerEnd = () => {
      dragging = false;
      input.stick.x = 0;
      input.stick.y = 0;
      input.stick.magnitude = 0;
    };
    const handleVisibilityChange = () => {
      runFlags.current.visible = !document.hidden;
      syncRunning();
    };
    const observer = new IntersectionObserver(
      (entries) => {
        runFlags.current.onScreen = entries[0]?.isIntersecting ?? true;
        syncRunning();
      },
      { threshold: 0 },
    );

    host.addEventListener("keydown", handleKeyDown);
    host.addEventListener("keyup", handleKeyUp);
    host.addEventListener("blur", handleBlur);
    host.addEventListener("pointerdown", handlePointerDown);
    host.addEventListener("pointermove", handlePointerMove, { passive: true });
    host.addEventListener("pointerup", handlePointerEnd);
    host.addEventListener("pointercancel", handlePointerEnd);
    host.addEventListener("pointerleave", handlePointerEnd);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    observer.observe(host);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      host.removeEventListener("keydown", handleKeyDown);
      host.removeEventListener("keyup", handleKeyUp);
      host.removeEventListener("blur", handleBlur);
      host.removeEventListener("pointerdown", handlePointerDown);
      host.removeEventListener("pointermove", handlePointerMove);
      host.removeEventListener("pointerup", handlePointerEnd);
      host.removeEventListener("pointercancel", handlePointerEnd);
      host.removeEventListener("pointerleave", handlePointerEnd);
    };
  }, [hostRef, input, sim, syncRunning]);

  useEffect(() => {
    runFlags.current.unpaused = !paused;
    syncRunning();
  }, [paused, syncRunning]);

  const activate = useCallback(
    (id: string) => callbacksRef.current.onActivate(id),
    [],
  );

  return (
    <div
      ref={hostRef}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the game surface must be focusable so key events reach the frame loop instead of scrolling the page
      tabIndex={0}
      role="application"
      aria-label="Interactive project world. Use the arrow keys or W A S D to fly, press E to open the nearest project, hold Shift or Space to boost. Every project is also listed below this game."
      className="relative h-[min(78vh,760px)] w-full overflow-hidden rounded-xl border border-border bg-[#050505] outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {fontsReady ? (
        <Canvas
          aria-hidden="true"
          frameloop={running ? "always" : "never"}
          dpr={[1, 2]}
          camera={{
            fov: CAMERA_FOV,
            near: 0.1,
            far: 400,
            position: [0, 30, 20],
          }}
          gl={{ antialias: false, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping;
          }}
        >
          <color attach="background" args={["#050505"]} />
          <Suspense fallback={null}>
            <Rig
              projects={projects}
              sim={sim}
              input={input}
              callbacksRef={callbacksRef}
            />
            <Lights />
            <Starfield />
            <Nebula />
            <Sun />
            <Bounds />
            <AsteroidBelt projects={projects} />
            <Stations projects={projects} sim={sim} onActivate={activate} />
            <Ship sim={sim} />
            <Burst sim={sim} />
            <Bloom />
          </Suspense>
        </Canvas>
      ) : null}
    </div>
  );
};

export default ProjectWorld3D;
