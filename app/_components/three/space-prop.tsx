"use client";

import type { ModelRig } from "@/app/_components/projects/world3d/config";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import Atmosphere from "./atmosphere";
import { ASTEROIDS_HD_URL, type LandingModel } from "./landing-models";
import { useStudioEnvironment } from "./studio-environment";
import type { Vec3 } from "./waypoints";

type PropMaterial = THREE.MeshStandardMaterial & {
  userData: { baseEmissive: number };
};

/** One of the landing models as set dressing, animated by its config. */
export const SpaceProp = ({
  config,
  position,
}: {
  config: LandingModel;
  position: Vec3;
}) => {
  const gltf = useLoader(GLTFLoader, config.url);
  const environment = useStudioEnvironment();

  const { root, materials } = useMemo(() => {
    const root = gltf.scene.clone(true);
    const materials = new Map<string, PropMaterial>();
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const original = object.material as THREE.MeshStandardMaterial;
      let material = materials.get(original.name);
      if (!material) {
        material = original.clone() as PropMaterial;
        material.userData.baseEmissive = material.emissiveIntensity;
        if (config.reflections) {
          material.envMap = environment;
          material.envMapIntensity = config.reflections;
        }
        materials.set(original.name, material);
      }
      object.material = material;
    });
    return { root, materials };
  }, [gltf, environment, config.reflections]);

  useEffect(
    () => () => {
      for (const material of Array.from(materials.values())) {
        material.dispose();
      }
    },
    [materials],
  );

  const rig = useMemo<ModelRig>(() => {
    const nodes = new Map<string, THREE.Object3D>();
    root.traverse((object) => {
      if (object.name) nodes.set(object.name, object);
    });
    return {
      node: (name) => nodes.get(name),
      pulse: (name, factor) => {
        const material = materials.get(name);
        if (material) {
          material.emissiveIntensity = material.userData.baseEmissive * factor;
        }
      },
    };
  }, [root, materials]);

  const spinRef = useRef<THREE.Group>(null);

  useFrame(({ clock }, delta) => {
    config.animate?.(rig, clock.elapsedTime, delta);
    if (spinRef.current) spinRef.current.rotation.y += config.spin * delta;
  });

  return (
    <group position={position} scale={config.scale}>
      <group ref={spinRef}>
        <primitive object={root} />
      </group>
      {config.atmosphere && <Atmosphere {...config.atmosphere} />}
    </group>
  );
};

const ROCK_COUNT = 14;

/** A loose ring of tumbling rocks around a point, for the Skills stop. */
export const RockCluster = ({
  position,
  squeeze = 1,
}: {
  position: Vec3;
  /** Horizontal spread factor; narrow screens pull the ring in. */
  squeeze?: number;
}) => {
  const gltf = useLoader(GLTFLoader, ASTEROIDS_HD_URL);
  const groupRef = useRef<THREE.Group>(null);

  const rocks = useMemo(() => {
    const shapes = [0, 1, 2, 3]
      .map((i) => gltf.scene.getObjectByName(`Rock${i}`))
      .filter((node): node is THREE.Object3D => !!node);
    return Array.from({ length: ROCK_COUNT }, (_, i) => {
      const object = shapes[i % shapes.length].clone(true);
      const angle = (i / ROCK_COUNT) * Math.PI * 2;
      // Wide, flat ellipse so the rocks frame the text instead of crossing it.
      const radius = 11 + (i % 3) * 1.8;
      object.position.set(
        Math.cos(angle) * radius * 1.3 * squeeze,
        Math.sin(angle) * radius * 0.55,
        Math.sin(angle * 2) * 2,
      );
      object.scale.setScalar(0.6 + ((i * 37) % 10) / 10);
      return { object, rate: 0.2 + ((i * 13) % 7) / 20 };
    });
  }, [gltf, squeeze]);

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * 0.015;
    for (const rock of rocks) {
      rock.object.rotation.x += delta * rock.rate;
      rock.object.rotation.y += delta * rock.rate * 0.7;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {rocks.map((rock) => (
        <primitive key={rock.object.uuid} object={rock.object} />
      ))}
    </group>
  );
};
