"use client";

import { BRAND_LIGHT } from "@/app/_components/projects/world/tuning";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  PX_PER_UNIT,
  SHIP_ALTITUDE,
  SHIP_PARALLAX,
  SHIP_SCALE,
  SHIP_URL,
} from "./config";
import type { Sim } from "./sim";

/** Below this speed (px/s) the ship keeps its last heading instead of jittering. */
const TURN_MIN_SPEED = 12;
const TURN_RATE = 10; // per second
const BANK_MAX = 0.55; // radians
const BANK_GAIN = 0.9;

const wrapAngle = (angle: number) =>
  Math.atan2(Math.sin(angle), Math.cos(angle));

/**
 * The craft you steer: eases round to its velocity, banks into turns, and its
 * engine glow follows speed and boost. Carries a soft lamp so whatever it flies
 * over is lit from above, like the light pool on the Pixi avatar.
 */
export const Ship = ({ sim }: { sim: Sim }) => {
  const gltf = useLoader(GLTFLoader, SHIP_URL);

  const { root, glow } = useMemo(() => {
    const root = gltf.scene.clone(true);
    let glow: THREE.MeshStandardMaterial | null = null;
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material as THREE.MeshStandardMaterial;
      if (material.name === "EngineGlow") {
        glow = material.clone();
        object.material = glow;
      }
    });
    return { root, glow: glow as THREE.MeshStandardMaterial | null };
  }, [gltf]);

  const baseGlow = useMemo(() => glow?.emissiveIntensity ?? 1, [glow]);
  useEffect(() => () => glow?.dispose(), [glow]);

  const yawRef = useRef<THREE.Group>(null);
  const bankRef = useRef<THREE.Group>(null);
  const motion = useRef({ heading: 0, bank: 0 });

  useFrame(() => {
    const { dt, player, velocity } = sim;
    const m = motion.current;

    let turn = 0;
    if (Math.hypot(velocity.x, velocity.y) > TURN_MIN_SPEED) {
      // Model nose is -Z; world px y maps to +Z.
      const target = Math.atan2(-velocity.x, -velocity.y);
      turn = wrapAngle(target - m.heading);
      m.heading = wrapAngle(m.heading + turn * (1 - Math.exp(-TURN_RATE * dt)));
    }
    const bankTarget = THREE.MathUtils.clamp(
      turn * BANK_GAIN,
      -BANK_MAX,
      BANK_MAX,
    );
    m.bank += (bankTarget - m.bank) * (1 - Math.exp(-6 * dt));

    yawRef.current?.position.set(
      player.x / PX_PER_UNIT,
      SHIP_ALTITUDE + Math.sin(sim.elapsed * 2) * 0.06,
      player.y / PX_PER_UNIT + SHIP_PARALLAX,
    );
    if (yawRef.current) yawRef.current.rotation.y = m.heading;
    if (bankRef.current) bankRef.current.rotation.z = m.bank;

    if (glow) {
      glow.emissiveIntensity =
        baseGlow * (0.4 + 1.2 * sim.speedRatio + 1.6 * sim.boost);
    }
  });

  return (
    <group ref={yawRef}>
      <group ref={bankRef} scale={SHIP_SCALE}>
        <primitive object={root} />
      </group>
      <pointLight
        position={[0, -0.6, 0]}
        color={BRAND_LIGHT}
        intensity={30}
        distance={9}
        decay={2}
      />
    </group>
  );
};
