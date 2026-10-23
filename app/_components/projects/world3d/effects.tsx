"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { PX_PER_UNIT } from "./config";
import { createSoftDotTexture } from "./environment";
import type { Sim } from "./sim";

const BURST_COUNT = 64;
const BURST_LIFE = 0.8; // seconds
const BURST_DRAG = 2.5; // per second

/**
 * Discovery burst: a puff of accent-coloured sparks at the station, restarted
 * whenever the rig bumps `sim.burst.serial`. Runs on the hitstop-scaled dt, so
 * it hangs at its origin for the beat of the impact.
 */
export const Burst = ({ sim }: { sim: Sim }) => {
  const { geometry, material, velocities } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(BURST_COUNT * 3), 3),
    );
    const material = new THREE.PointsMaterial({
      size: 0.45,
      map: createSoftDotTexture(),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return {
      geometry,
      material,
      velocities: new Float32Array(BURST_COUNT * 3),
    };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  const state = useRef({ serial: 0, life: 0 });

  useFrame(() => {
    const s = state.current;
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    const array = positions.array as Float32Array;

    if (sim.burst.serial !== s.serial) {
      s.serial = sim.burst.serial;
      s.life = BURST_LIFE;
      // Brighter than 1 so the sparks bloom.
      material.color.set(sim.burst.color).multiplyScalar(3);
      const x = sim.burst.x / PX_PER_UNIT;
      const z = sim.burst.y / PX_PER_UNIT;
      for (let i = 0; i < BURST_COUNT; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const speed = 4 + Math.random() * 6;
        array[i * 3] = x;
        array[i * 3 + 1] = 1;
        array[i * 3 + 2] = z;
        velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
        velocities[i * 3 + 1] = Math.abs(Math.cos(phi)) * speed * 0.6;
        velocities[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
      }
    }

    if (s.life <= 0) return;
    const dt = sim.dt;
    s.life -= dt;
    const drag = Math.exp(-BURST_DRAG * dt);
    for (let i = 0; i < BURST_COUNT * 3; i++) {
      array[i] += velocities[i] * dt;
      velocities[i] *= drag;
    }
    positions.needsUpdate = true;
    material.opacity = Math.max(s.life / BURST_LIFE, 0);
  });

  return (
    <points geometry={geometry} material={material} frustumCulled={false} />
  );
};

/**
 * Bloom over the whole scene. Takes over rendering (priority 1), so R3F stops
 * drawing on its own. Only HDR values above the threshold glow — emissive
 * strengths from the Blender export, the sun and the sparks — while lit hull
 * stays crisp.
 */
export const Bloom = () => {
  const { gl, scene, camera, size } = useThree();

  const composer = useMemo(() => {
    // Multisampled target: the composer otherwise loses the canvas antialias.
    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const composer = new EffectComposer(gl, target);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(new THREE.Vector2(1, 1), 0.85, 0.55, 1),
    );
    composer.addPass(new OutputPass());
    return composer;
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame((_, delta) => composer.render(delta), 1);
  return null;
};
