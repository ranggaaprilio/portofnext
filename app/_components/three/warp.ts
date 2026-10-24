/**
 * Shared state for the hyperspace jump from the landing page to /projects.
 * The DOM button starts it; the canvas and the flash overlay read it. Kept as
 * a plain module so the canvas can poll it every frame without re-renders.
 */

export const WARP_MS = 1400;

let ready = false;
let startedAt: number | null = null;
const listeners = new Set<() => void>();

/** The canvas calls this while it is mounted; without it the button is a plain link. */
export function setWarpReady(value: boolean) {
  ready = value;
  if (!value) startedAt = null;
}

/** Starts the jump. Returns false (caller should just navigate) if no canvas can play it. */
export function startWarp(): boolean {
  if (!ready || startedAt !== null) return false;
  startedAt = performance.now();
  for (const listener of Array.from(listeners)) listener();
  return true;
}

/** 0 before the jump, rising to 1 when it ends. */
export function warpProgress(): number {
  if (startedAt === null) return 0;
  return Math.min((performance.now() - startedAt) / WARP_MS, 1);
}

export function onWarp(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
