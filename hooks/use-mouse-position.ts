"use client";

import { type RefObject, useEffect, useRef } from "react";

export type NormalizedMouse = { x: number; y: number };

/**
 * Tracks the pointer as normalized coordinates in [-1, 1] (y-up),
 * written into a ref — safe to read every frame without re-rendering.
 */
export function useMousePosition(): RefObject<NormalizedMouse> {
  const mouse = useRef<NormalizedMouse>({ x: 0, y: 0 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return mouse;
}
