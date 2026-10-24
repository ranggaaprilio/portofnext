"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { warpProgress } from "./warp";

const COUNT = 500;
const NEAR = -4;
const FAR = -140;
const SPEED = 260; // units per second at full warp
const MAX_LENGTH = 30;

/**
 * Hyperspace streaks: line segments in a tunnel around the camera that rush
 * past and stretch as the jump builds. Hidden and idle until a warp starts.
 */
const WarpLines = () => {
  const camera = useThree((state) => state.camera);
  const groupRef = useRef<THREE.Group>(null);

  const { geometry, material, seeds } = useMemo(() => {
    const seeds = Array.from({ length: COUNT }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.5 + Math.random() * 14;
      return {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        z: FAR + Math.random() * (NEAR - FAR),
      };
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(COUNT * 6), 3),
    );
    const material = new THREE.LineBasicMaterial({
      // Over 1.0 so the streaks clear the bloom threshold.
      color: new THREE.Color("#c4b5fd").multiplyScalar(2.2),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      toneMapped: false,
    });
    return { geometry, material, seeds };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_state, delta) => {
    const group = groupRef.current;
    const w = warpProgress();
    if (!group) return;
    group.visible = w > 0;
    if (w === 0) return;

    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);

    const ease = w * w;
    const length = 0.2 + ease * MAX_LENGTH;
    const positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      const seed = seeds[i];
      seed.z += SPEED * ease * delta;
      if (seed.z > NEAR) seed.z = FAR + (seed.z - NEAR);
      positions.set(
        [seed.x, seed.y, seed.z, seed.x, seed.y, seed.z - length],
        i * 6,
      );
    }
    geometry.attributes.position.needsUpdate = true;
    material.opacity = Math.min(w / 0.3, 1);
  });

  return (
    <group ref={groupRef} visible={false}>
      <lineSegments
        geometry={geometry}
        material={material}
        frustumCulled={false}
      />
    </group>
  );
};

export default WarpLines;
