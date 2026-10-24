"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";

/** Near, mid and far layers; the camera flying through them gives the parallax. */
const LAYERS = [
  { count: 600, size: 0.09, spread: 22 },
  { count: 1200, size: 0.06, spread: 34 },
  { count: 1600, size: 0.04, spread: 50 },
];
const Z_NEAR = 14;
const Z_FAR = -110;
const BRAND_TINT_RATIO = 0.05;

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

/**
 * Stars filling the whole flight path, in three depth layers. Each layer
 * twinkles on its own phase. `density` scales the counts (mobile runs at half).
 */
const Starfield = ({ density = 1 }: { density?: number }) => {
  const { layers, texture } = useMemo(() => {
    const brand = new THREE.Color("hsl(253, 55%, 57%)");
    const white = new THREE.Color("hsl(0, 0%, 85%)");
    const texture = createSoftCircleTexture();

    const layers = LAYERS.map(({ count: base, size, spread }) => {
      const count = Math.round(base * density);
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * spread * 2;
        positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.2;
        positions[i * 3 + 2] = Z_FAR + Math.random() * (Z_NEAR - Z_FAR);

        const color = Math.random() < BRAND_TINT_RATIO ? brand : white;
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const material = new THREE.PointsMaterial({
        size,
        map: texture,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        fog: false,
      });
      return { geometry, material, size };
    });

    return { layers, texture };
  }, [density]);

  useEffect(() => {
    return () => {
      for (const layer of layers) {
        layer.geometry.dispose();
        layer.material.dispose();
      }
      texture.dispose();
    };
  }, [layers, texture]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    layers.forEach((layer, i) => {
      layer.material.size = layer.size * (1 + 0.2 * Math.sin(t * 0.8 + i * 2));
    });
  });

  return (
    <>
      {layers.map((layer) => (
        <points
          key={layer.size}
          geometry={layer.geometry}
          material={layer.material}
        />
      ))}
    </>
  );
};

export default Starfield;
