"use client";

import { type Project, WORLD } from "@/app/_components/projects/data";
import { MONO_STACK } from "@/app/_components/projects/world/tuning";
import { type ThreeEvent, useFrame, useLoader } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { type ModelRig, PX_PER_UNIT, modelFor } from "./config";
import type { Sim } from "./sim";

/** Brightness of a station nobody has flown near yet. */
const UNSEEN_LEVEL = 0.22;
const RING_RADIUS = WORLD.interactRadius / PX_PER_UNIT;
const PLACEHOLDER_ACCENT = "#a1a1aa";

type StationMaterial = THREE.MeshStandardMaterial & {
  userData: { baseColor: THREE.Color; baseEmissive: number };
};

/**
 * Clones the model and gives it private materials, so dimming or pulsing one
 * station never bleeds into another that happens to share a file.
 */
function prepareModel(source: THREE.Object3D) {
  const root = source.clone(true);
  // A sub-node (the fallback rock) carries its preview offset; drop it.
  root.position.set(0, 0, 0);
  const materials: StationMaterial[] = [];
  const clones = new Map<THREE.Material, StationMaterial>();
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const original = object.material as THREE.MeshStandardMaterial;
    let material = clones.get(original);
    if (!material) {
      material = original.clone() as StationMaterial;
      material.userData.baseColor = material.color.clone();
      material.userData.baseEmissive = material.emissiveIntensity;
      clones.set(original, material);
      materials.push(material);
    }
    object.material = material;
  });
  return { root, materials };
}

function createLabelTexture(text: string): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.font = `600 40px ${MONO_STACK}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#e4e4e7";
    ctx.fillText(text.toUpperCase(), canvas.width / 2, canvas.height / 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

type StationProps = {
  project: Project;
  sim: Sim;
  onActivate: (id: string) => void;
};

/**
 * One project in the world. States mirror the Pixi stations:
 *   unseen  dimmed model, faint label
 *   seen    full brightness once the ship has come within REVEAL_RADIUS
 *   active  proximity ring + scale bump while inside interact range
 */
const Station = ({ project, sim, onActivate }: StationProps) => {
  const config = modelFor(project.id);
  const gltf = useLoader(GLTFLoader, config.url);

  const { root, materials } = useMemo(() => {
    const source = config.node
      ? gltf.scene.getObjectByName(config.node)
      : gltf.scene;
    return prepareModel(source ?? gltf.scene);
  }, [gltf, config.node]);

  const label = useMemo(
    () => createLabelTexture(project.title),
    [project.title],
  );

  useEffect(
    () => () => {
      label.dispose();
      for (const material of materials) material.dispose();
    },
    [label, materials],
  );

  const pulses = useRef(new Map<string, number>());
  const rig = useMemo<ModelRig>(() => {
    const nodes = new Map<string, THREE.Object3D>();
    root.traverse((object) => {
      if (object.name) nodes.set(object.name, object);
    });
    return {
      node: (name) => nodes.get(name),
      pulse: (name, factor) => pulses.current.set(name, factor),
    };
  }, [root]);

  const bumpRef = useRef<THREE.Group>(null);
  const spinRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.MeshBasicMaterial>(null);
  const labelRef = useRef<THREE.SpriteMaterial>(null);
  const state = useRef({ seen: 0, ring: 0, scale: 1 });

  useFrame(() => {
    const { dt, elapsed } = sim;
    const s = state.current;
    // Frame-rate independent easing; the same curve the camera uses.
    const follow = 1 - Math.exp(-8 * dt);
    const active = sim.active.has(project.id);
    s.seen += ((sim.seen.has(project.id) ? 1 : 0) - s.seen) * follow;
    s.ring += ((active ? 0.9 : 0) - s.ring) * follow;
    s.scale += ((active ? 1.12 : 1) - s.scale) * follow;

    config.animate?.(rig, elapsed, dt);
    if (spinRef.current) spinRef.current.rotation.y += config.spin * dt;
    bumpRef.current?.scale.setScalar(s.scale);

    const level = UNSEEN_LEVEL + (1 - UNSEEN_LEVEL) * s.seen;
    for (const material of materials) {
      material.color.copy(material.userData.baseColor).multiplyScalar(level);
      material.emissiveIntensity =
        material.userData.baseEmissive *
        level *
        (pulses.current.get(material.name) ?? 1);
    }
    if (ringRef.current) ringRef.current.opacity = s.ring;
    if (labelRef.current) labelRef.current.opacity = 0.35 + 0.65 * s.seen;
  });

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onActivate(project.id);
  };

  return (
    // biome-ignore lint/a11y/useKeyWithClickEvents: a three.js group, not a DOM element; the keyboard path is E on the focused world surface
    <group
      position={[
        project.world.x / PX_PER_UNIT,
        0,
        project.world.y / PX_PER_UNIT,
      ]}
      onClick={handleClick}
    >
      <group ref={bumpRef}>
        <group ref={spinRef} position-y={config.offsetY} scale={config.scale}>
          <primitive object={root} />
        </group>
      </group>
      <mesh rotation-x={-Math.PI / 2}>
        <ringGeometry args={[RING_RADIUS - 0.06, RING_RADIUS, 64]} />
        <meshBasicMaterial
          ref={ringRef}
          color={project.isPlaceholder ? PLACEHOLDER_ACCENT : project.accent}
          transparent
          opacity={0}
          depthWrite={false}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
      {/* North of the model rather than above it: the camera looks down, so
          a label straight overhead would land on top of the station. */}
      <sprite
        position={[0, config.top * 0.5, -(config.top + 0.5)]}
        scale={[4.4, 0.825, 1]}
      >
        <spriteMaterial
          ref={labelRef}
          map={label}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </sprite>
    </group>
  );
};

type StationsProps = {
  projects: readonly Project[];
  sim: Sim;
  onActivate: (id: string) => void;
};

export const Stations = ({ projects, sim, onActivate }: StationsProps) => (
  <>
    {projects.map((project) => (
      <Station
        key={project.id}
        project={project}
        sim={sim}
        onActivate={onActivate}
      />
    ))}
  </>
);
