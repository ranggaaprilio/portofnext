"use client";

import type { NormalizedMouse } from "@/hooks/use-mouse-position";
import { useFrame } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 2500;
const BRAND_TINT_RATIO = 0.05;
const BASE_SIZE = 0.06;
const SLOW_SPIN_RADIANS_PER_SECOND = (Math.PI * 2) / 240;
const MOUSE_TILT_RANGE = 0.15;
const TILT_LERP = 0.05;

function createSoftCircleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

type ParticleFieldProps = {
  mouse: RefObject<NormalizedMouse>;
};

const ParticleField = ({ mouse }: ParticleFieldProps) => {
  const tiltGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);

  const { geometry, material, texture } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const brand = new THREE.Color("hsl(253, 55%, 57%)");
    const white = new THREE.Color("hsl(0, 0%, 85%)");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;

      const color = Math.random() < BRAND_TINT_RATIO ? brand : white;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const texture = createSoftCircleTexture();
    const material = new THREE.PointsMaterial({
      size: BASE_SIZE,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    return { geometry, material, texture };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [geometry, material, texture]);

  useFrame((_state, delta) => {
    const t = _state.clock.elapsedTime;

    if (spinGroup.current) {
      spinGroup.current.rotation.y += SLOW_SPIN_RADIANS_PER_SECOND * delta;
    }

    if (tiltGroup.current && mouse.current) {
      const targetX = mouse.current.y * MOUSE_TILT_RANGE;
      const targetY = mouse.current.x * MOUSE_TILT_RANGE;
      tiltGroup.current.rotation.x = THREE.MathUtils.lerp(
        tiltGroup.current.rotation.x,
        targetX,
        TILT_LERP,
      );
      tiltGroup.current.rotation.y = THREE.MathUtils.lerp(
        tiltGroup.current.rotation.y,
        targetY,
        TILT_LERP,
      );
    }

    material.size = BASE_SIZE * (1 + 0.2 * Math.sin(t * 0.8));
  });

  return (
    <group ref={tiltGroup}>
      <group ref={spinGroup}>
        <points geometry={geometry} material={material} />
      </group>
    </group>
  );
};

export default ParticleField;
