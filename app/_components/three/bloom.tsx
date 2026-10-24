"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const STRENGTH = 0.55;
const RADIUS = 0.45;
/** Only HDR-bright pixels (engines, lights, star cores) bloom. */
const THRESHOLD = 0.85;

/**
 * Takes over rendering (useFrame priority 1) to add a soft bloom, so engine
 * glow, station lights and the brightest stars read as light sources.
 */
const Bloom = () => {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);

  const composer = useMemo(() => {
    // Half-float + MSAA target: keeps HDR values for the bloom and the edges antialiased.
    const target = new THREE.WebGLRenderTarget(1, 1, {
      type: THREE.HalfFloatType,
      samples: 4,
    });
    const composer = new EffectComposer(gl, target);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
      new UnrealBloomPass(
        new THREE.Vector2(256, 256),
        STRENGTH,
        RADIUS,
        THRESHOLD,
      ),
    );
    composer.addPass(new OutputPass());
    return composer;
  }, [gl, scene, camera]);

  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);

  useEffect(() => () => composer.dispose(), [composer]);

  useFrame((_state, delta) => composer.render(delta), 1);

  return null;
};

export default Bloom;
