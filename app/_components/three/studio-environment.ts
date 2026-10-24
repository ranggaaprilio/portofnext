"use client";

import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

const cache = new WeakMap<THREE.WebGLRenderer, THREE.Texture>();

/**
 * A prefiltered studio environment for metal hulls to reflect. Applied per
 * material rather than as scene.environment, so planets don't pick up studio
 * highlights. Built once per renderer and kept for its lifetime.
 */
export function useStudioEnvironment(): THREE.Texture {
  const gl = useThree((state) => state.gl);
  return useMemo(() => {
    let texture = cache.get(gl);
    if (!texture) {
      const pmrem = new THREE.PMREMGenerator(gl);
      texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      cache.set(gl, texture);
    }
    return texture;
  }, [gl]);
}
