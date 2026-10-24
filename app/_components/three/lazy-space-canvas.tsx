"use client";

import { useWebglCapable } from "@/hooks/use-webgl-capable";
import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

const SpaceCanvas = dynamic(() => import("./space-canvas"), { ssr: false });

type ErrorBoundaryProps = { children: ReactNode };
type ErrorBoundaryState = { hasError: boolean };

class CanvasErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    return this.state.hasError ? null : this.props.children;
  }

  componentDidCatch(error: Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("CanvasErrorBoundary caught:", error);
    }
  }
}

/**
 * Full-page space scene pinned behind the content. Sized to the large
 * viewport (lvh) so the mobile address bar showing/hiding doesn't resize the
 * canvas. Falls back to the plain CSS Background (rendered underneath) when
 * WebGL isn't a good fit.
 */
const LazySpaceCanvas = () => {
  const capable = useWebglCapable({ allowTouch: true });

  if (!capable) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh"
    >
      <CanvasErrorBoundary>
        <SpaceCanvas />
      </CanvasErrorBoundary>
    </div>
  );
};

export default LazySpaceCanvas;
