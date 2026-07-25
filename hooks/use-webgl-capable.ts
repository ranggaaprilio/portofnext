"use client";

import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const FINE_POINTER_QUERY = "(pointer: fine)";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/**
 * True only when the device can comfortably run the ambient WebGL scene:
 * fine pointer (desktop-like), working WebGL context, no reduced-motion.
 * Server render and first client render both return false to avoid
 * hydration mismatch.
 */
export function useWebglCapable(): boolean {
  const [capable, setCapable] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia(FINE_POINTER_QUERY).matches;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    setCapable(finePointer && !reducedMotion && supportsWebGL());
  }, []);

  return capable;
}
