"use client";

import type { Project } from "@/app/_components/projects/data";
import dynamic from "next/dynamic";
import { Component, type ReactNode, type RefObject } from "react";

// The only route to project-world.tsx, and therefore to pixi.js. Importing it
// statically anywhere would move the renderer into the shared client chunk.
const ProjectWorld = dynamic(() => import("./project-world"), { ssr: false });

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

type LazyProjectWorldProps = {
  projects: readonly Project[];
  hostRef: RefObject<HTMLDivElement>;
  paused: boolean;
  onProximity: (id: string | null) => void;
  onSeen: (id: string) => void;
  onDiscover: (id: string) => void;
  onActivate: (id: string) => void;
  onFrame: (
    playerX: number,
    playerY: number,
    focusScreenX: number,
    focusScreenY: number,
  ) => void;
};

const LazyProjectWorld = (props: LazyProjectWorldProps) => (
  <CanvasErrorBoundary>
    <ProjectWorld {...props} />
  </CanvasErrorBoundary>
);

export default LazyProjectWorld;
