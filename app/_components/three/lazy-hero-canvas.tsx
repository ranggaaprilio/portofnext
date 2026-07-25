"use client";

import { useWebglCapable } from "@/hooks/use-webgl-capable";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";

const HeroCanvas = dynamic(() => import("./hero-canvas"), { ssr: false });

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

const LazyHeroCanvas = () => {
  const capable = useWebglCapable();
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  if (!capable) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity }}
      className="pointer-events-none absolute inset-0"
    >
      <CanvasErrorBoundary>
        <HeroCanvas />
      </CanvasErrorBoundary>
    </motion.div>
  );
};

export default LazyHeroCanvas;
