"use client";

import { BRAND_LIGHT } from "@/app/_components/projects/world/tuning";
import { SHIP_SCALE } from "@/app/_components/projects/world3d/config";
import type { NormalizedMouse } from "@/hooks/use-mouse-position";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { type RefObject, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { Flight } from "./camera-rig";
import { SHIP_HD_URL } from "./landing-models";
import { useStudioEnvironment } from "./studio-environment";
import { warpProgress } from "./warp";

/** Ship trails its camera-space slot by this rate, so camera moves read as flight. */
const TRAIL_RATE = 2.5; // per second
const BANK_GAIN = 0.35;
const BANK_MAX = 0.6;
const MOUSE_YAW = 0.35;
/** Three-quarter view of the hull instead of a flat look at the engines. */
const BASE_YAW = 0.55;
const REFLECTIONS = 0.6;

/**
 * The same craft as in /projects, escorting the reader down the page. It holds
 * a slot in camera space, lags behind camera moves and banks into them.
 */
const HeroShip = ({
  mouse,
  flight,
}: {
  mouse: RefObject<NormalizedMouse>;
  flight: RefObject<Flight>;
}) => {
  const gltf = useLoader(GLTFLoader, SHIP_HD_URL);
  const environment = useStudioEnvironment();
  const { root, glow } = useMemo(() => {
    const root = gltf.scene.clone(true);
    let glow: THREE.MeshStandardMaterial | null = null;
    root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      const material = object.material as THREE.MeshStandardMaterial;
      // The ship is the only user of this file, so its cached materials can be edited in place.
      material.envMap = environment;
      material.envMapIntensity = REFLECTIONS;
      if (material.name === "EngineGlow") {
        glow = glow ?? material.clone();
        object.material = glow;
      }
    });
    return { root, glow: glow as THREE.MeshStandardMaterial | null };
  }, [gltf, environment]);
  const baseGlow = useMemo(() => glow?.emissiveIntensity ?? 1, [glow]);
  useEffect(() => () => glow?.dispose(), [glow]);
  const camera = useThree((state) => state.camera);

  const groupRef = useRef<THREE.Group>(null);
  const bankRef = useRef<THREE.Group>(null);
  const motion = useRef({
    slot: new THREE.Vector3(),
    previous: new THREE.Vector3(),
    local: new THREE.Vector3(),
    inverse: new THREE.Quaternion(),
    bank: 0,
    ready: false,
  });

  useFrame(({ clock }, delta) => {
    const group = groupRef.current;
    const offset = flight.current?.ship;
    if (!group || !offset || delta === 0) return;
    const m = motion.current;
    const t = clock.elapsedTime;

    m.slot.copy(offset);
    m.slot.y += Math.sin(t * 1.6) * 0.12;
    // On a warp the ship pulls to the centre line and shoots on ahead.
    const w = warpProgress();
    const surge = w * w;
    m.slot.x *= 1 - surge;
    m.slot.y *= 1 - surge;
    m.slot.z -= surge * 40;
    camera.localToWorld(m.slot);

    if (!m.ready) {
      group.position.copy(m.slot);
      m.previous.copy(m.slot);
      m.ready = true;
    }
    // Trailing would leave it behind the lunging camera, so a warp locks it to its slot.
    if (w > 0) group.position.copy(m.slot);
    else group.position.lerp(m.slot, 1 - Math.exp(-TRAIL_RATE * delta));

    // Sideways speed in camera space drives the bank.
    m.local.subVectors(group.position, m.previous).divideScalar(delta);
    m.local.applyQuaternion(m.inverse.copy(camera.quaternion).invert());
    m.previous.copy(group.position);
    const bankTarget = THREE.MathUtils.clamp(
      -m.local.x * BANK_GAIN + Math.sin(t * 0.9) * 0.08,
      -BANK_MAX,
      BANK_MAX,
    );
    m.bank += (bankTarget - m.bank) * (1 - Math.exp(-5 * delta));

    group.quaternion.copy(camera.quaternion);
    group.rotateY(BASE_YAW + (mouse.current?.x ?? 0) * MOUSE_YAW);
    group.rotateX((mouse.current?.y ?? 0) * 0.15);
    if (bankRef.current) bankRef.current.rotation.z = m.bank;
    if (glow) {
      glow.emissiveIntensity =
        baseGlow * (0.85 + 0.1 * Math.sin(t * 31) + 0.05 * Math.sin(t * 17));
    }
  });

  return (
    <group ref={groupRef}>
      <group ref={bankRef} scale={SHIP_SCALE}>
        <primitive object={root} />
      </group>
      <pointLight
        position={[0, 1.2, 0.8]}
        color={BRAND_LIGHT}
        intensity={12}
        distance={6}
        decay={2}
      />
    </group>
  );
};

export default HeroShip;
