"use client";

import type { NormalizedMouse } from "@/hooks/use-mouse-position";
import { useFrame, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useRef } from "react";
import * as THREE from "three";
import { warpProgress } from "./warp";
import { ARRIVE_VIEWPORT_RATIO, WAYPOINTS } from "./waypoints";

/** Written by the camera rig every frame, read by the ship. */
export type Flight = { ship: THREE.Vector3 };

const FOLLOW_RATE = 4; // per second
const MOUSE_LOOK = 0.8;
const MOUSE_SHIFT = 0.3;
/** How far the camera lunges forward, and how much wider it sees, during a warp. */
const WARP_DISTANCE = 90;
const WARP_FOV = 45;
const BASE_FOV = 60;
/** Added at full squeeze, so a phone in portrait still sees the planets beside the text. */
const PORTRAIT_EXTRA_FOV = 25;
const SHIP_PORTRAIT_DEPTH = 1.2;
const SHIP_PORTRAIT_DROP = 2.4;

const smoothstep = (t: number) => t * t * (3 - 2 * t);

/** Scroll position (px) at which the camera should sit on each waypoint. */
function measureStops(): number[] {
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );
  let previous = 0;
  return WAYPOINTS.map(({ section }) => {
    if (!section) return 0;
    const element = document.getElementById(section);
    if (!element) return previous;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const stop = THREE.MathUtils.clamp(
      top - window.innerHeight * ARRIVE_VIEWPORT_RATIO,
      previous,
      maxScroll,
    );
    previous = stop;
    return stop;
  });
}

/**
 * Flies the camera between waypoints as the page scrolls. Poses are blended
 * piecewise between the two stops around the current scroll position, then
 * eased, so fast scrolling still glides.
 */
const CameraRig = ({
  mouse,
  flight,
  squeeze,
}: {
  mouse: RefObject<NormalizedMouse>;
  flight: RefObject<Flight>;
  /** 1 on wide screens, smaller on narrow ones: pulls the ship in and widens the view. */
  squeeze: number;
}) => {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const baseFov = BASE_FOV + (1 - squeeze) * PORTRAIT_EXTRA_FOV;
  const stops = useRef<number[]>([]);
  const current = useRef<{ position: THREE.Vector3; target: THREE.Vector3 }>();
  const scratch = useRef({
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    ship: new THREE.Vector3(),
    a: new THREE.Vector3(),
    b: new THREE.Vector3(),
    forward: new THREE.Vector3(),
  });

  useEffect(() => {
    const update = () => {
      stops.current = measureStops();
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(document.body);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useFrame((_state, delta) => {
    const s = scratch.current;
    const y = window.scrollY;
    const list = stops.current;

    let i = 0;
    while (i < list.length - 2 && y >= list[i + 1]) i++;
    const span = (list[i + 1] ?? 0) - (list[i] ?? 0);
    const t =
      span > 0
        ? smoothstep(THREE.MathUtils.clamp((y - list[i]) / span, 0, 1))
        : 0;
    const from = WAYPOINTS[i];
    const to = WAYPOINTS[Math.min(i + 1, WAYPOINTS.length - 1)];

    s.position.lerpVectors(
      s.a.fromArray(from.camera),
      s.b.fromArray(to.camera),
      t,
    );
    s.target.lerpVectors(
      s.a.fromArray(from.target),
      s.b.fromArray(to.target),
      t,
    );
    s.ship.lerpVectors(s.a.fromArray(from.ship), s.b.fromArray(to.ship), t);
    // Narrow screens: pull the ship in, drop it into the empty space under the
    // buttons, and park it further out so it stays small.
    s.ship.x *= squeeze;
    s.ship.y *= 1 + (1 - squeeze) * SHIP_PORTRAIT_DROP;
    s.ship.z *= 1 + (1 - squeeze) * SHIP_PORTRAIT_DEPTH;

    const m = mouse.current;
    if (m) {
      s.position.x += m.x * MOUSE_SHIFT;
      s.position.y += m.y * MOUSE_SHIFT;
      s.target.x += m.x * MOUSE_LOOK;
      s.target.y += m.y * MOUSE_LOOK;
    }

    if (!current.current) {
      current.current = {
        position: s.position.clone(),
        target: s.target.clone(),
      };
      flight.current?.ship.copy(s.ship);
    }
    const follow = 1 - Math.exp(-FOLLOW_RATE * delta);
    current.current.position.lerp(s.position, follow);
    current.current.target.lerp(s.target, follow);

    camera.position.copy(current.current.position);
    camera.lookAt(current.current.target);
    flight.current?.ship.lerp(s.ship, follow);

    // Slow wind-up, then a hard lunge: cubic on distance, smoothstep on FOV.
    const w = warpProgress();
    if (w > 0) {
      camera.getWorldDirection(s.forward);
      camera.position.addScaledVector(s.forward, w * w * w * WARP_DISTANCE);
    }
    const fov = baseFov + smoothstep(w) * WARP_FOV;
    if (camera.fov !== fov) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }
  });

  return null;
};

export default CameraRig;
