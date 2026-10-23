"use client";

import { type Project, WORLD } from "@/app/_components/projects/data";
import { NEBULA_TINTS } from "@/app/_components/projects/world/tuning";
import { useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { ASTEROIDS_URL, PX_PER_UNIT } from "./config";

const STAR_COUNT = 1400;
const BELT_COUNT = 72;
/** Rocks keep this far (world px) from stations and from the spawn point. */
const BELT_CLEARANCE = 210;
const SUN_POSITION: [number, number, number] = [-120, -70, -110];

/** Deterministic, so the belt and the sky are the same on every visit. */
const mulberry32 = (seed: number) => {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** Soft white disc; tinted per use through the material colour. */
export function createSoftDotTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const half = size / 2;
    const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.35, "rgba(255,255,255,0.55)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

export const Lights = () => (
  <>
    <hemisphereLight args={["#cfd8ff", "#1a1020", 0.7]} />
    <directionalLight
      position={[-30, 40, 24]}
      intensity={2.4}
      color="#fff1e0"
    />
    <directionalLight
      position={[30, 12, -30]}
      intensity={0.9}
      color="#b9a6ff"
    />
  </>
);

/** Stars sit far below the flight plane, so they parallax against the camera. */
export const Starfield = () => {
  const { geometry, material } = useMemo(() => {
    const random = mulberry32(7);
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const tints = [
      new THREE.Color("#ffffff"),
      new THREE.Color("#c7d2ff"),
      new THREE.Color("#b9a6ff"),
    ];
    for (let i = 0; i < STAR_COUNT; i++) {
      positions[i * 3] = (random() - 0.5) * 190;
      positions[i * 3 + 1] = -12 - random() * 45;
      positions[i * 3 + 2] = (random() - 0.5) * 150;
      const tint = tints[Math.floor(random() * tints.length)] ?? tints[0];
      const brightness = 0.35 + random() * 0.65;
      colors[i * 3] = tint.r * brightness;
      colors[i * 3 + 1] = tint.g * brightness;
      colors[i * 3 + 2] = tint.b * brightness;
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const material = new THREE.PointsMaterial({
      size: 0.55,
      map: createSoftDotTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
    });
    return { geometry, material };
  }, []);

  useEffect(
    () => () => {
      geometry.dispose();
      material.map?.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  return <points geometry={geometry} material={material} />;
};

const CLOUDS: { position: [number, number, number]; size: number }[] = [
  { position: [-28, -48, -18], size: 80 },
  { position: [34, -52, 10], size: 90 },
  { position: [4, -46, 34], size: 70 },
];

/** A few huge, faint colour washes deep below everything else. */
export const Nebula = () => {
  const texture = useMemo(createSoftDotTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <>
      {CLOUDS.map((cloud, i) => (
        <mesh
          key={cloud.position.join()}
          position={cloud.position}
          rotation-x={-Math.PI / 2}
        >
          <planeGeometry args={[cloud.size, cloud.size]} />
          <meshBasicMaterial
            map={texture}
            color={NEBULA_TINTS[i % NEBULA_TINTS.length]}
            transparent
            opacity={0.16}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
};

/** Distant star, bright enough to bloom. Purely a landmark; lighting is separate. */
export const Sun = () => {
  const color = useMemo(() => new THREE.Color("#ffd9a0").multiplyScalar(4), []);
  const halo = useMemo(createSoftDotTexture, []);
  useEffect(() => () => halo.dispose(), [halo]);

  return (
    <group position={SUN_POSITION}>
      <mesh>
        <icosahedronGeometry args={[6, 2]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <sprite scale={[40, 40, 1]}>
        <spriteMaterial
          map={halo}
          color="#ffb070"
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
};

/** Faint outline of the surveyed sector, at the stations' plane. */
export const Bounds = () => {
  const points = useMemo(() => {
    const x = WORLD.width / 2 / PX_PER_UNIT;
    const z = WORLD.height / 2 / PX_PER_UNIT;
    return new Float32Array([-x, 0, -z, x, 0, -z, x, 0, z, -x, 0, z]);
  }, []);

  return (
    <lineLoop>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[points, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color="#ffffff" transparent opacity={0.08} />
    </lineLoop>
  );
};

type Rock = {
  x: number;
  y: number;
  z: number;
  scale: number;
  spin: THREE.Euler;
  rate: number;
};

/**
 * Loose rocks scattered between the stations: four shapes, each drawn as one
 * InstancedMesh. The rocks tumble slowly; the matrices are rewritten per frame,
 * which at ~70 instances is far cheaper than it sounds.
 */
export const AsteroidBelt = ({
  projects,
}: { projects: readonly Project[] }) => {
  const gltf = useLoader(GLTFLoader, ASTEROIDS_URL);
  const meshRefs = useRef<(THREE.InstancedMesh | null)[]>([]);

  const shapes = useMemo(() => {
    const result: {
      geometry: THREE.BufferGeometry;
      materials: THREE.Material[];
    }[] = [];
    for (let i = 0; i < 4; i++) {
      const node = gltf.scene.getObjectByName(`Rock${i}`);
      if (!node) continue;
      const parts: THREE.Mesh[] = [];
      node.traverse((child) => {
        if (child instanceof THREE.Mesh) parts.push(child);
      });
      // One primitive per terrain band in the export; merged with groups so
      // a single instanced draw keeps every band's material.
      const geometry = mergeGeometries(
        parts.map((part) => part.geometry),
        true,
      );
      if (geometry) {
        result.push({
          geometry,
          materials: parts.map((part) => part.material as THREE.Material),
        });
      }
    }
    return result;
  }, [gltf]);

  useEffect(
    () => () => {
      for (const shape of shapes) shape.geometry.dispose();
    },
    [shapes],
  );

  const rocks = useMemo(() => {
    const random = mulberry32(42);
    const halfW = WORLD.width / 2;
    const halfH = WORLD.height / 2;
    const perShape: Rock[][] = shapes.map(() => []);
    let attempts = 0;
    let placed = 0;
    while (placed < BELT_COUNT && attempts < BELT_COUNT * 20) {
      attempts++;
      const x = (random() * 2 - 1) * halfW;
      const y = (random() * 2 - 1) * halfH;
      const clear =
        Math.hypot(x, y) > BELT_CLEARANCE &&
        projects.every(
          (project) =>
            Math.hypot(project.world.x - x, project.world.y - y) >
            BELT_CLEARANCE,
        );
      if (!clear) continue;
      perShape[placed % shapes.length]?.push({
        x: x / PX_PER_UNIT,
        y: -3.5 + random() * 3,
        z: y / PX_PER_UNIT,
        scale: 0.18 + random() ** 2 * 0.55,
        spin: new THREE.Euler(random() * 6, random() * 6, random() * 6),
        rate: (random() - 0.5) * 0.6,
      });
      placed++;
    }
    return perShape;
  }, [projects, shapes]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((_, delta) => {
    for (let i = 0; i < rocks.length; i++) {
      const mesh = meshRefs.current[i];
      const list = rocks[i];
      if (!mesh || !list) continue;
      for (let j = 0; j < list.length; j++) {
        const rock = list[j];
        rock.spin.x += rock.rate * delta;
        rock.spin.y += rock.rate * 0.7 * delta;
        dummy.position.set(rock.x, rock.y, rock.z);
        dummy.rotation.copy(rock.spin);
        dummy.scale.setScalar(rock.scale);
        dummy.updateMatrix();
        mesh.setMatrixAt(j, dummy.matrix);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <>
      {shapes.map((shape, i) => (
        <instancedMesh
          key={shape.geometry.uuid}
          ref={(mesh) => {
            meshRefs.current[i] = mesh;
          }}
          args={[shape.geometry, shape.materials, rocks[i]?.length ?? 0]}
          frustumCulled={false}
        />
      ))}
    </>
  );
};
