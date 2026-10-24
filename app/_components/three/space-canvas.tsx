"use client";

import { useMousePosition } from "@/hooks/use-mouse-position";
import { Canvas } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Bloom from "./bloom";
import CameraRig, { type Flight } from "./camera-rig";
import HeroShip from "./hero-ship";
import { LANDING_MODELS } from "./landing-models";
import { RockCluster, SpaceProp } from "./space-prop";
import Starfield from "./starfield";
import { setWarpReady } from "./warp";
import WarpLines from "./warp-lines";
import { PROP_POSITIONS, type Vec3 } from "./waypoints";

/** Matches the page's --background, so the canvas edge never shows. */
const SPACE_COLOR = "#0a0a0a";
/** Sun to the right of the camera: planets lit mostly face-on with a terminator on their left. */
const SUN_POSITION: [number, number, number] = [25, 10, 25];
/**
 * Props further than this from the camera fade into the background colour, so
 * each section only shows its own set piece. Atmosphere shells read the same fog.
 */
const FADE: [number, number] = [26, 40];

/** One hard sun for crisp terminators plus a faint cool fill for the night sides. */
const SpaceLights = () => {
  return (
    <>
      <directionalLight
        position={SUN_POSITION}
        intensity={3.2}
        color="#fff4e6"
      />
      <hemisphereLight args={["#8fa6ff", "#05060a", 0.08]} />
    </>
  );
};

const COARSE_POINTER_QUERY = "(pointer: coarse)";
/** Aspect ratio the layout was composed for; narrower screens squeeze in. */
const DESIGN_ASPECT = 1.5;
const MIN_SQUEEZE = 0.45;

const squeezeFor = (width: number, height: number) =>
  THREE.MathUtils.clamp(width / height / DESIGN_ASPECT, MIN_SQUEEZE, 1);

/**
 * How narrow the screen is (1 = desktop landscape) and whether this is a
 * touch device, which gets the light render path: no bloom, fewer stars,
 * lower pixel ratio.
 */
function useViewport() {
  const [viewport, setViewport] = useState(() => ({
    squeeze: squeezeFor(window.innerWidth, window.innerHeight),
    lowPower: window.matchMedia(COARSE_POINTER_QUERY).matches,
  }));
  useEffect(() => {
    const handleResize = () => {
      const squeeze = squeezeFor(window.innerWidth, window.innerHeight);
      setViewport((current) =>
        current.squeeze === squeeze ? current : { ...current, squeeze },
      );
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return viewport;
}

/** True once the browser is idle, so below-the-fold models don't compete with first paint. */
function useIdle(): boolean {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(() => setIdle(true), {
        timeout: 2000,
      });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(() => setIdle(true), 1200);
    return () => clearTimeout(id);
  }, []);
  return idle;
}

const SpaceCanvas = () => {
  const mouse = useMousePosition();
  const flight = useRef<Flight>({ ship: new THREE.Vector3() });
  const idle = useIdle();
  const { squeeze, lowPower } = useViewport();
  const at = (p: Vec3): Vec3 => [p[0] * squeeze, p[1], p[2]];
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    setWarpReady(true);
    return () => setWarpReady(false);
  }, []);

  useEffect(() => {
    const handleVisibility = () =>
      setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60, near: 0.1, far: 200 }}
      dpr={lowPower ? [1, 1.5] : [1, 2]}
      frameloop={frameloop}
      performance={{ min: 0.5 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.NeutralToneMapping;
      }}
    >
      <color attach="background" args={[SPACE_COLOR]} />
      <fog attach="fog" args={[SPACE_COLOR, ...FADE]} />
      <SpaceLights />
      {!lowPower && <Bloom />}
      <CameraRig mouse={mouse} flight={flight} squeeze={squeeze} />
      <Starfield density={lowPower ? 0.5 : 1} />
      <WarpLines />
      <Suspense fallback={null}>
        <HeroShip mouse={mouse} flight={flight} />
        <SpaceProp
          config={LANDING_MODELS.mars}
          position={at(PROP_POSITIONS.mars)}
        />
      </Suspense>
      {idle && (
        <Suspense fallback={null}>
          <SpaceProp
            config={LANDING_MODELS.terra}
            position={at(PROP_POSITIONS.terra)}
          />
          <SpaceProp
            config={LANDING_MODELS.station}
            position={at(PROP_POSITIONS.station)}
          />
          <RockCluster position={PROP_POSITIONS.rocks} squeeze={squeeze} />
        </Suspense>
      )}
    </Canvas>
  );
};

export default SpaceCanvas;
