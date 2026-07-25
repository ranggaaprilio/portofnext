"use client";

import { useMousePosition } from "@/hooks/use-mouse-position";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import ParticleField from "./particle-field";

const FOG_COLOR = "#0a0a0a";

const HeroCanvas = () => {
  const mouse = useMousePosition();
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  useEffect(() => {
    const handleVisibility = () =>
      setFrameloop(document.hidden ? "never" : "always");
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 2]}
      frameloop={frameloop}
      performance={{ min: 0.5 }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[FOG_COLOR, 9, 18]} />
      <ParticleField mouse={mouse} />
    </Canvas>
  );
};

export default HeroCanvas;
