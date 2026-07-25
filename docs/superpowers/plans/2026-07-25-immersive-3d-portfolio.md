# Immersive 3D Portfolio Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an ambient Three.js particle-field hero scene and a comprehensive spring-physics motion system across the homepage and `/contact` page while keeping the "refined dark minimal" aesthetic.

**Architecture:** `@react-three/fiber` (v8, React 18 compat) renders a lazy-loaded particle scene behind the hero. `framer-motion` (already installed) handles all DOM animation — magnetic buttons, 3D card tilts, scroll-linked reveals, and a scroll progress bar. A capability gate (`useWebglCapable`) ensures the WebGL bundle never ships to mobile / no-WebGL / reduced-motion users.

**Tech Stack:** Next 14 App Router, React 18, Tailwind CSS, framer-motion v11, three.js + R3F v8, Biome.

## Global Constraints

- **React 18.3.1** → `@react-three/fiber` MUST be v8 (`@^8.18.0`); v9 requires React 19 and will break the build
- No `three` imports outside `app/_components/three/` — WebGL bundle isolation
- Biome style: double quotes, semicolons, organized imports; `pnpm lint` must pass after every task
- Signature ease everywhere: `const expoOut = [0.16, 1, 0.3, 1] as const;`
- **No git commits** — user reviews and commits manually; executing agent must NOT run `git add`/`git commit` without explicit user confirmation
- Brand color: `hsl(253, 55%, 57%)`; background: `#0a0a0a` (from `--background: 0 0% 4%`)
- All new client components must start with `"use client";`
- framer-motion v11 APIs only
- Reduced-motion guards: `useReducedMotion()` in pointer-driven components (`MagneticButton`, `TiltCard`); `MotionConfig reducedMotion="user"` (already in `page.tsx`) handles variant animations
- **Deliberate spec deviation:** `@react-three/drei` was listed in the design spec but is intentionally dropped here. Plain `THREE.PointsMaterial` + a procedurally generated soft-circle sprite texture covers the scene, keeps native fog support, and avoids a ~120 KB lazy bundle. (YAGNI.)

---

### Task 1: Dependencies + Capability Hooks

**Files:**
- Create: `hooks/use-webgl-capable.ts`
- Create: `hooks/use-mouse-position.ts`

**Interfaces:**
- Produces: `useWebglCapable(): boolean` — true only on fine-pointer + working WebGL + no reduced-motion; computed once on mount (server-first-render always false to avoid hydration mismatch)
- Produces: `useMousePosition(): RefObject<NormalizedMouse>` — `{ x: number; y: number }` in [-1, 1] (y-up), written into a ref on every `pointermove` (no React re-renders)

- [ ] **Step 1: Install dependencies**

```bash
pnpm add three @react-three/fiber@^8.18.0
pnpm add -D @types/three
```

- [ ] **Step 2: Create `hooks/use-webgl-capable.ts`**

```ts
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
```

- [ ] **Step 3: Create `hooks/use-mouse-position.ts`**

```ts
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
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return mouse;
}
```

- [ ] **Step 4: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass with zero errors.

---

### Task 2: 3D Scene (ParticleField + HeroCanvas)

**Files:**
- Create: `app/_components/three/particle-field.tsx`
- Create: `app/_components/three/hero-canvas.tsx`

**Interfaces:**
- Consumes: `useMousePosition()` from Task 1 (`NormalizedMouse` ref)
- Produces: `HeroCanvas` (default export) — a `<Canvas>` with fog + `ParticleField`, pauses on tab-hidden, DPR-capped

- [ ] **Step 1: Create `app/_components/three/particle-field.tsx`**

```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { NormalizedMouse } from "@/hooks/use-mouse-position";
import type { RefObject } from "react";

const PARTICLE_COUNT = 2500;
const BRAND_TINT_RATIO = 0.05;
const BASE_SIZE = 0.06;
const SLOW_SPIN_RADIANS_PER_SECOND = (Math.PI * 2) / 240;
const MOUSE_TILT_RANGE = 0.15;
const TILT_LERP = 0.05;

function createSoftCircleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,0.6)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(canvas);
}

type ParticleFieldProps = {
  mouse: RefObject<NormalizedMouse>;
};

const ParticleField = ({ mouse }: ParticleFieldProps) => {
  const tiltGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);

  const { geometry, material, texture } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const brand = new THREE.Color("hsl(253, 55%, 57%)");
    const white = new THREE.Color("hsl(0, 0%, 85%)");

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;

      const color = Math.random() < BRAND_TINT_RATIO ? brand : white;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3),
    );
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const texture = createSoftCircleTexture();
    const material = new THREE.PointsMaterial({
      size: BASE_SIZE,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    return { geometry, material, texture };
  }, []);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [geometry, material, texture]);

  useFrame((_state, delta) => {
    const t = _state.clock.elapsedTime;

    if (spinGroup.current) {
      spinGroup.current.rotation.y +=
        SLOW_SPIN_RADIANS_PER_SECOND * delta;
    }

    if (tiltGroup.current && mouse.current) {
      const targetX = mouse.current.y * MOUSE_TILT_RANGE;
      const targetY = mouse.current.x * MOUSE_TILT_RANGE;
      tiltGroup.current.rotation.x = THREE.MathUtils.lerp(
        tiltGroup.current.rotation.x,
        targetX,
        TILT_LERP,
      );
      tiltGroup.current.rotation.y = THREE.MathUtils.lerp(
        tiltGroup.current.rotation.y,
        targetY,
        TILT_LERP,
      );
    }

    material.size = BASE_SIZE * (1 + 0.2 * Math.sin(t * 0.8));
  });

  return (
    <group ref={tiltGroup}>
      <group ref={spinGroup}>
        <points geometry={geometry} material={material} />
      </group>
    </group>
  );
};

export default ParticleField;
```

- [ ] **Step 2: Create `app/_components/three/hero-canvas.tsx`**

```tsx
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
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <fog attach="fog" args={[FOG_COLOR, 9, 18]} />
      <ParticleField mouse={mouse} />
    </Canvas>
  );
};

export default HeroCanvas;
```

- [ ] **Step 3: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass. (No runtime test possible without mounting — verified in Task 3.)

---

### Task 3: LazyHeroCanvas + Hero Mount

**Files:**
- Create: `app/_components/three/lazy-hero-canvas.tsx`
- Modify: `app/_components/hero/main.tsx` (add import + mount + z-index)

**Interfaces:**
- Consumes: `useWebglCapable()` from Task 1, `HeroCanvas` from Task 2
- Produces: `LazyHeroCanvas` (default export) — dynamically imports `HeroCanvas` only on capable devices, wraps in error boundary, fades on scroll

- [ ] **Step 1: Create `app/_components/three/lazy-hero-canvas.tsx`**

```tsx
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
```

- [ ] **Step 2: Mount in `app/_components/hero/main.tsx`**

Add the import at the top of the file (after existing imports, before `const expoOut`):

```ts
import LazyHeroCanvas from "@/app/_components/three/lazy-hero-canvas";
```

Inside the `<header>` element, right after the opening `<header ...>` tag, add `<LazyHeroCanvas />` as the first child.

On the content `<div>` (the one with `className="mx-auto flex w-full max-w-4xl..."`), add `relative z-10` to the className so it renders above the canvas:

```tsx
<div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center">
```

- [ ] **Step 3: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass. Then `pnpm dev` — open homepage, confirm particles render (desktop) or CSS background shows (mobile emulation), no console errors.

---

### Task 4: MagneticButton + Hero Motion Upgrades

**Files:**
- Create: `app/_components/ui/magnetic-button.tsx`
- Modify: `app/_components/hero/main.tsx` (full replacement below)

**Interfaces:**
- Consumes: `LazyHeroCanvas` from Task 3 (already mounted)
- Produces: `MagneticButton` (default export) — spring-based magnetic wrapper for any child element

- [ ] **Step 1: Create `app/_components/ui/magnetic-button.tsx`**

```tsx
"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { type PointerEvent, type ReactNode, useRef } from "react";

type MagneticButtonProps = {
  children: ReactNode;
  className?: string;
  strength?: number;
};

const MagneticButton = ({
  children,
  className,
  strength = 0.35,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handlePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (shouldReduceMotion || event.pointerType !== "mouse" || !ref.current)
      return;
    const rect = ref.current.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const handlePointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: springX, y: springY, display: "inline-block" }}
      className={className}
    >
      {children}
    </motion.span>
  );
};

export default MagneticButton;
```

- [ ] **Step 2: Replace `app/_components/hero/main.tsx` entirely**

This replaces the entire file. The result preserves the LazyHeroCanvas mount from Task 3 and adds rotateX char reveals, magnetic CTAs, and scroll-driven scroll-cue fade.

```tsx
"use client";

import LazyHeroCanvas from "@/app/_components/three/lazy-hero-canvas";
import MagneticButton from "@/app/_components/ui/magnetic-button";
import { type Variants, motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

const expoOut = [0.16, 1, 0.3, 1] as const;

const NAME = "Rangga Aprilio Utama";

const nameContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.15 } },
};

const charVariants: Variants = {
  hidden: { opacity: 0, y: 24, rotateX: -90 },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const staggerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.5 } },
};

const Hero = () => {
  const { scrollY } = useScroll();
  const cueOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  return (
    <header
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
      aria-label="Hero Section"
    >
      <LazyHeroCanvas />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center [perspective:800px]">
        {/* Availability pill */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: expoOut }}
          className="flex items-center gap-2.5 rounded-full border border-border px-4 py-1.5"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Available for work
          </span>
        </motion.div>

        {/* Name — staggered char reveal with rotateX */}
        <motion.h1
          variants={nameContainerVariants}
          initial="hidden"
          animate="visible"
          aria-label={NAME}
          className="font-display font-bold tracking-[-0.04em] text-[clamp(2.75rem,8vw,6.5rem)] leading-[1.05]"
        >
          {NAME.split(" ").map((word) => (
            <span
              key={word}
              aria-hidden="true"
              className="inline-block whitespace-nowrap [&:not(:last-child)]:mr-[0.25em]"
            >
              {word.split("").map((char, charIndex) => (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: name is static, order never changes
                  key={`${word}-${charIndex}`}
                  variants={charVariants}
                  className="inline-block origin-bottom"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>

        <motion.div
          variants={staggerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          {/* Role line */}
          <motion.p
            variants={revealVariants}
            itemProp="jobTitle"
            className="text-xl text-muted-foreground md:text-2xl"
          >
            Fullstack <span className="text-brand">Developer</span>
          </motion.p>

          {/* Value prop */}
          <motion.p
            variants={revealVariants}
            className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            I build reliable web systems end to end — 6 years of experience
            across React, Vue, Node.js, TypeScript, and Golang.
          </motion.p>

          {/* CTAs — magnetic */}
          <motion.div
            variants={revealVariants}
            className="mt-2 flex flex-wrap items-center justify-center gap-4"
          >
            <MagneticButton>
              <a
                href="#about"
                className="block rounded-full bg-primary px-6 py-3 text-sm text-primary-foreground transition-colors hover:bg-primary/90"
              >
                View my work
              </a>
            </MagneticButton>
            <MagneticButton>
              <Link
                href="/contact"
                className="block rounded-full border border-border px-6 py-3 text-sm text-foreground transition-colors hover:border-foreground/40"
              >
                Get in touch
              </Link>
            </MagneticButton>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue — entrance animation inside, scroll fade outside */}
      <motion.div
        style={{ opacity: cueOpacity }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6, ease: expoOut }}
          className="flex flex-col items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Scroll to about section"
        >
          <span className="font-mono text-xs uppercase tracking-[0.3em]">
            scroll
          </span>
          <motion.svg
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: 1.6,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </motion.svg>
        </motion.a>
      </motion.div>

      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
      >
        Skip to main content
      </a>
    </header>
  );
};

export default Hero;
```

- [ ] **Step 3: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass. `pnpm dev` — char-flip entrance, magnetic CTAs on hover, scroll cue fades as you scroll.

---

### Task 5: Navbar Hide/Reveal + Scroll Progress Bar

**Files:**
- Create: `app/_components/ui/scroll-progress-bar.tsx`
- Modify: `app/_components/navbar/main.tsx` (3 precise edits)
- Modify: `app/page.tsx` (mount progress bar)

**Interfaces:**
- Produces: `ScrollProgressBar` (default export) — fixed 2px brand bar driven by page `useScroll`
- Modifies: Navbar — hides on scroll-down, reveals on scroll-up, two-tier backdrop blur

- [ ] **Step 1: Create `app/_components/ui/scroll-progress-bar.tsx`**

```tsx
"use client";

import { motion, useScroll, useSpring } from "framer-motion";

const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[60] h-0.5 origin-left bg-brand"
    />
  );
};

export default ScrollProgressBar;
```

- [ ] **Step 2: Edit `app/_components/navbar/main.tsx`**

**Edit A — Add imports.** Replace the existing framer-motion import line:

```tsx
import { AnimatePresence, type Variants, motion, useMotionValueEvent, useScroll } from "framer-motion";
```

**Edit B — Replace state + useEffect.** Find this block:

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => setIsScrolled(window.scrollY > 8);
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
```

Replace with:

```tsx
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [isScrolled, setIsScrolled] = useState(false);
const [isDeepScrolled, setIsDeepScrolled] = useState(false);
const [isHidden, setIsHidden] = useState(false);
const { scrollY } = useScroll();

useMotionValueEvent(scrollY, "change", (latest) => {
  const previous = scrollY.getPrevious() ?? 0;
  setIsScrolled(latest > 8);
  setIsDeepScrolled(latest > 300);
  if (!isMenuOpen) {
    setIsHidden(latest > previous && latest > 150);
  }
});
```

**Edit C — Hamburger onClick.** Replace:

```tsx
onClick={() => setIsMenuOpen(!isMenuOpen)}
```

with:

```tsx
onClick={() => { setIsMenuOpen(!isMenuOpen); setIsHidden(false); }}
```

**Edit D — nav → motion.nav.** Replace the opening `<nav` tag and its `className` with:

```tsx
<motion.nav
  variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
  animate={isHidden ? "hidden" : "visible"}
  transition={{ duration: 0.35, ease: expoOut }}
  className={`fixed top-0 left-0 z-50 w-full transition-colors duration-300 ${
    isDeepScrolled
      ? "bg-background/85 backdrop-blur-xl border-b border-border"
      : isScrolled
        ? "bg-background/70 backdrop-blur-md border-b border-border"
        : "bg-transparent"
  }`}
  aria-label="Main navigation"
>
```

And replace the closing `</nav>` with `</motion.nav>`.

- [ ] **Step 3: Mount progress bar in `app/page.tsx`**

Add import:

```tsx
import ScrollProgressBar from "@/app/_components/ui/scroll-progress-bar";
```

Add `<ScrollProgressBar />` after `<SpeedInsights />` inside `<MotionConfig>`:

```tsx
<MotionConfig reducedMotion="user">
  <SpeedInsights />
  <ScrollProgressBar />
  <Background />
  ...
```

- [ ] **Step 4: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass. `pnpm dev` — navbar hides on scroll-down (past 150px), reveals on scroll-up, blur intensifies at 300px, progress bar tracks scroll.

---

### Task 6: SectionHeading + TiltCard + Experience Cards

**Files:**
- Create: `app/_components/ui/section-heading.tsx`
- Create: `app/_components/ui/tilt-card.tsx`
- Modify: `app/_components/about/main.tsx` (import SectionHeading, swap 3 usages, swap experience cards to TiltCard)

**Interfaces:**
- Produces: `SectionHeading({ eyebrow, title })` — animated eyebrow (scaleX draw) + blur→sharp title
- Produces: `TiltCard({ children, className?, variants? })` — 3D tilt on mouse follow, lift on hover, supports framer-motion variants for stagger entrance

- [ ] **Step 1: Create `app/_components/ui/section-heading.tsx`**

```tsx
"use client";

import { type Variants, motion } from "framer-motion";

const expoOut = [0.16, 1, 0.3, 1] as const;

const eyebrowVariants: Variants = {
  hidden: { opacity: 0, scaleX: 0 },
  visible: {
    opacity: 1,
    scaleX: 1,
    transition: { duration: 0.5, ease: expoOut },
  },
};

const titleVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: expoOut },
  },
};

const SectionHeading = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <>
    <motion.p
      variants={eyebrowVariants}
      className="origin-left font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
    >
      {eyebrow}
    </motion.p>
    <motion.h2
      variants={titleVariants}
      className="mt-3 font-display text-4xl tracking-[-0.02em] md:text-5xl"
    >
      {title}
    </motion.h2>
  </>
);

export default SectionHeading;
```

- [ ] **Step 2: Create `app/_components/ui/tilt-card.tsx`**

```tsx
"use client";

import {
  type Variants,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { type PointerEvent, type ReactNode, useRef } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  variants?: Variants;
};

const TiltCard = ({ children, className, variants }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), {
    stiffness: 200,
    damping: 20,
  });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || event.pointerType !== "mouse" || !ref.current)
      return;
    const rect = ref.current.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const handlePointerLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={{ y: -4 }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default TiltCard;
```

- [ ] **Step 3: Edit `app/_components/about/main.tsx`**

**Edit A — Add import.** After the existing `import { Badge }` line, add:

```tsx
import SectionHeading from "@/app/_components/ui/section-heading";
import TiltCard from "@/app/_components/ui/tilt-card";
```

**Edit B — Remove local `SectionHeader` component.** Delete this entire block (lines ~135-156):

```tsx
const SectionHeader = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <>
    <motion.p
      variants={revealVariants}
      className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground"
    >
      {eyebrow}
    </motion.p>
    <motion.h2
      variants={revealVariants}
      className="mt-3 font-display text-4xl md:text-5xl tracking-[-0.02em]"
    >
      {title}
    </motion.h2>
  </>
);
```

**Edit C — Swap 3 SectionHeader usages to SectionHeading.** Replace each:

```tsx
<SectionHeader eyebrow="01 — About" title="About Me" />
```
→
```tsx
<SectionHeading eyebrow="01 — About" title="About Me" />
```

```tsx
<SectionHeader eyebrow="02 — Experience" title="Work Experience" />
```
→
```tsx
<SectionHeading eyebrow="02 — Experience" title="Work Experience" />
```

```tsx
<SectionHeader eyebrow="03 — Skills" title="Skills and Abilities" />
```
→
```tsx
<SectionHeading eyebrow="03 — Skills" title="Skills and Abilities" />
```

**Edit D — Swap experience cards to TiltCard.** In the experience `.map()`, replace:

```tsx
<motion.div
  key={job.name}
  variants={revealVariants}
  className="rounded-xl border border-border bg-card p-6"
>
```

with:

```tsx
<TiltCard
  key={job.name}
  variants={revealVariants}
  className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
>
```

And replace the closing `</motion.div>` (the one closing this card, not the section) with `</TiltCard>`.

- [ ] **Step 4: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass. `pnpm dev` — section headings animate with eyebrow draw + blur title, experience cards tilt on mouse follow and glow on hover.

---

### Task 7: About Extras (Portrait Parallax, Skills, Socials)

**Files:**
- Modify: `app/_components/about/main.tsx` (portrait float + parallax, socials magnetic)
- Modify: `app/_components/about/skill.tsx` (chip variants + hover pop)

**Interfaces:**
- Consumes: `MagneticButton` from Task 4
- Consumes: `TiltCard` from Task 6 (not used here — portrait uses inline motion instead)

- [ ] **Step 1: Edit `app/_components/about/main.tsx`**

**Edit A — Add imports.** Add to framer-motion import: `useScroll, useTransform`. Add to react import: `useRef`. Add MagneticButton import:

```tsx
import MagneticButton from "@/app/_components/ui/magnetic-button";
```

**Edit B — Add parallax refs.** Inside the `AboutMe` component, before the return, add:

```tsx
const aboutSectionRef = useRef<HTMLElement>(null);
const { scrollYProgress: aboutScrollProgress } = useScroll({
  target: aboutSectionRef,
  offset: ["start end", "end start"],
});
const portraitParallaxY = useTransform(aboutScrollProgress, [0, 1], [40, -40]);
```

**Edit C — Add ref to about section.** On the `<motion.section id="about" ...>` element, add:

```tsx
ref={aboutSectionRef}
```

**Edit D — Replace portrait + socials block.** Find this block (the right column of the About section grid):

```tsx
{/* Portrait + socials */}
<motion.div
  variants={revealVariants}
  className="flex h-fit flex-col items-center gap-8"
>
  <div className="rounded-2xl border border-border bg-card p-2">
    <Image
      src="/assets/aboutMe.png"
      width={400}
      height={400}
      alt="Rangga Aprilio Utama's profile picture"
      itemProp="image"
      className="rounded-xl"
    />
  </div>

  <nav className="flex gap-4" aria-label="Social Media Links">
    {socials.map(({ href, label, Icon }) => (
      <a
        key={href}
        href={href}
        aria-label={label}
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </a>
    ))}
  </nav>
</motion.div>
```

Replace with:

```tsx
{/* Portrait + socials */}
<motion.div
  variants={revealVariants}
  className="flex h-fit flex-col items-center gap-8"
>
  <motion.div
    style={{ y: portraitParallaxY }}
    className="rounded-2xl border border-border bg-card p-2"
  >
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{
        duration: 6,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <Image
        src="/assets/aboutMe.png"
        width={400}
        height={400}
        alt="Rangga Aprilio Utama's profile picture"
        itemProp="image"
        className="rounded-xl"
      />
    </motion.div>
  </motion.div>

  <nav className="flex gap-4" aria-label="Social Media Links">
    {socials.map(({ href, label, Icon }) => (
      <MagneticButton key={href}>
        <a
          href={href}
          aria-label={label}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
        >
          <Icon
            className="h-5 w-5 transition-transform group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      </MagneticButton>
    ))}
  </nav>
</motion.div>
```

- [ ] **Step 2: Edit `app/_components/about/skill.tsx`**

**Edit A — Update chip variants.** Replace the `chipVariants` object:

```tsx
const chipVariants: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.8, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: expoOut },
  },
};
```

**Edit B — Add hover pop to skill chips.** In the `.map()` return, add `whileHover={{ scale: 1.05 }}` to the `<motion.li>`:

```tsx
<motion.li
  key={label}
  variants={chipVariants}
  whileHover={{ scale: 1.05 }}
  className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
>
```

- [ ] **Step 3: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass. `pnpm dev` — portrait floats gently and shifts on scroll, social icons lean toward cursor, skill chips reveal with scale+blur and pop on hover.

---

### Task 8: Contact Page Motion

**Files:**
- Modify: `app/_components/contact/main.tsx` (full replacement)

**Interfaces:**
- Consumes: `TiltCard` from Task 6

- [ ] **Step 1: Replace `app/_components/contact/main.tsx` entirely**

Convert from server component to client component with staggered entrance, TiltCard cards, and icon scale pop.

```tsx
"use client";

import TiltCard from "@/app/_components/ui/tilt-card";
import { type Variants, motion } from "framer-motion";
import type { IconType } from "react-icons";
import { FaGithub, FaInstagram, FaLinkedinIn, FaMedium } from "react-icons/fa";
import { SiThreads } from "react-icons/si";

const expoOut = [0.16, 1, 0.3, 1] as const;

const socialLinks: Array<{
  name: string;
  handle: string;
  href: string;
  description: string;
  Icon: IconType;
}> = [
  {
    name: "LinkedIn",
    handle: "ranggaaprilio",
    href: "https://www.linkedin.com/in/ranggaaprilio",
    description: "Connect with me professionally and explore my work history.",
    Icon: FaLinkedinIn,
  },
  {
    name: "Threads",
    handle: "@ranggaaprilio",
    href: "https://www.threads.com/@ranggaaprilio",
    description:
      "Follow my thoughts on tech, development, and product building.",
    Icon: SiThreads,
  },
  {
    name: "GitHub",
    handle: "ranggaaprilio",
    href: "https://github.com/ranggaaprilio",
    description: "See my code, open-source projects, and experiments.",
    Icon: FaGithub,
  },
  {
    name: "Instagram",
    handle: "@ranggaaprilio",
    href: "https://instagram.com/ranggaaprilio",
    description: "Follow behind-the-scenes moments and personal updates.",
    Icon: FaInstagram,
  },
  {
    name: "Medium",
    handle: "@ranggaaprillio",
    href: "https://medium.com/@ranggaaprillio",
    description: "Read my articles, tutorials, and development notes.",
    Icon: FaMedium,
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: expoOut },
  },
};

const gridVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const Contact = () => {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 py-28 text-center"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-72 max-w-xl rounded-full bg-brand/10 blur-3xl"
        aria-hidden="true"
      />

      <motion.p
        variants={revealVariants}
        className="mb-4 font-mono text-xs uppercase tracking-[0.3em] text-brand"
      >
        Contact
      </motion.p>
      <motion.h1
        variants={revealVariants}
        className="max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl"
      >
        Let&apos;s connect and build something great.
      </motion.h1>
      <motion.p
        variants={revealVariants}
        className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg"
      >
        You can reach me through these social channels. I&apos;m always open to
        discussing web development, collaboration, and new opportunities.
      </motion.p>

      <motion.div
        variants={gridVariants}
        className="mt-14 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        {socialLinks.map(({ name, handle, href, description, Icon }) => (
          <TiltCard key={name} variants={revealVariants} className="h-full">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${name} profile`}
              className="group block h-full rounded-xl border border-border bg-card p-5 text-left transition-colors hover:border-brand/40"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground transition-colors group-hover:text-brand">
                <Icon
                  className="h-7 w-7 transition-transform group-hover:scale-110"
                  aria-hidden="true"
                />
              </div>
              <h2 className="text-2xl font-semibold">{name}</h2>
              <p className="mt-1 text-sm font-medium text-brand">{handle}</p>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </a>
          </TiltCard>
        ))}
      </motion.div>
    </motion.section>
  );
};

export default Contact;
```

- [ ] **Step 2: Verify**

```bash
pnpm lint
pnpm build:portfolio
```

Expected: both pass. `pnpm dev` — open `/contact`, cards stagger in, tilt on hover, icons scale on hover.

---

### Task 9: Final Verification Matrix

**Files:** No code changes.

- [ ] **Step 1: Full build + lint**

```bash
pnpm lint
pnpm build
```

Expected: `pnpm lint` passes on `app components hooks lib` (includes all new files). `pnpm build` passes (includes `apps/devtools` build + full Next.js build). Zero errors, zero warnings.

- [ ] **Step 2: Manual smoke test — Chrome desktop (full experience)**

1. Open `localhost:3000` — particles render behind hero, mouse parallax works
2. Char-flip name entrance, magnetic CTAs, scroll cue fades on scroll
3. Scroll progress bar tracks page scroll
4. Navbar hides on scroll-down (past 150px), reveals on scroll-up, blur intensifies at 300px
5. Section headings animate with eyebrow draw + blur title on scroll-into-view
6. Experience cards tilt on mouse follow, glow on hover
7. Portrait floats gently, shifts on scroll; social icons lean toward cursor
8. Skill chips reveal with scale+blur, pop on hover
9. Open `/contact` — cards stagger in, tilt on hover, icons scale

- [ ] **Step 3: Manual smoke test — mobile emulation (fallback)**

1. DevTools → device toolbar (e.g. iPhone 14)
2. No WebGL canvas (CSS radial glow visible instead)
3. All DOM animations still run (staggered reveals, etc.)
4. No console errors

- [ ] **Step 4: Manual smoke test — reduced motion**

1. DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce
2. All motion collapses to opacity fades (no transforms, no 3D tilt, no 3D scene)
3. Content fully readable and functional

- [ ] **Step 5: Manual smoke test — slow 4G**

1. DevTools → Network → Slow 4G
2. LCP (hero text) renders before 3D bundle loads (lazy import)
3. No layout shift, no frozen frames

- [ ] **Step 6: Verify no stray `three` imports**

```bash
rg "from ['\"]three" app components hooks lib --include="*.ts" --include="*.tsx"
```

Expected: only matches in `app/_components/three/particle-field.tsx` and `app/_components/three/hero-canvas.tsx`.

---

## Task Dependency Graph

```
Task 1 (deps + hooks)
  └─→ Task 2 (3D scene: ParticleField + HeroCanvas)
        └─→ Task 3 (LazyHeroCanvas + hero mount)
              └─→ Task 4 (MagneticButton + hero motion)
                    └─→ Task 7 (about extras: portrait, skills, socials)
  └─→ Task 5 (navbar + progress bar)
  └─→ Task 6 (SectionHeading + TiltCard + experience cards)
        └─→ Task 7 (about extras)
        └─→ Task 8 (contact page)
              ↑ Task 6 (TiltCard)
Task 9 (final verification) — after all tasks
```

Tasks 5 and 6 can run in parallel after Task 1. Task 7 depends on Tasks 4 and 6. Task 8 depends on Task 6.
