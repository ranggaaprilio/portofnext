# Immersive 3D Portfolio Redesign — Design Spec

**Date:** 2026-07-25
**Status:** Approved (design sections reviewed and approved in brainstorming session)

## Goal

Elevate the portfolio (homepage + `/contact` page) from "refined dark minimal" to **immersive 3D minimal**: keep the existing dark aesthetic, content, and structure, but add an ambient Three.js particle scene behind the hero and a comprehensive spring-physics motion system across all sections.

## Decisions (locked during brainstorming)

| Question | Decision |
|---|---|
| Design direction | Immersive 3D, keep minimal aesthetic |
| Scope | Homepage + contact page |
| Hero 3D scene | Particle field with depth layers + mouse parallax |
| Performance/a11y | Full graceful degradation |
| Tech approach | `@react-three/fiber` + `drei` for 3D; keep framer-motion for DOM animation |

## Architecture

### New dependencies

- Production: `three`, `@react-three/fiber`, `@react-three/drei`
- Dev: `@types/three`

### New files

```
app/_components/
  three/
    particle-field.tsx      ← R3F scene: particles, rotation, mouse parallax
    hero-canvas.tsx         ← Canvas wrapper, camera, fog, regression config
    lazy-hero-canvas.tsx    ← next/dynamic wrapper + capability gate + error boundary
  ui/
    magnetic-button.tsx     ← spring-based magnetic hover wrapper for CTAs
    section-heading.tsx     ← shared animated eyebrow+title (extracted from about/main.tsx)
hooks/
  use-webgl-capable.ts      ← true only if ALL pass: fine pointer (matchMedia
                              '(pointer: fine)'), real WebGL context creation test,
                              not prefers-reduced-motion
  use-mouse-position.ts     ← normalized mouse coords (-1..1) in a ref (no re-renders)
```

### Data flow

- `LazyHeroCanvas` calls `useWebglCapable()`. If `true`, it dynamically imports `HeroCanvas` (pulling the entire three.js bundle) via `next/dynamic({ ssr: false })`. If `false`, it renders nothing and the existing CSS background (`background.tsx`) remains as the visual fallback.
- `useMousePosition` writes normalized coordinates into a ref. The R3F `useFrame` loop reads it every frame for parallax — no React state updates at 60fps.
- The 3D layer is purely ambient: it never communicates back to the DOM layer.

### Key boundary

The `three` package is only ever imported inside `hero-canvas.tsx` / `particle-field.tsx`, which are only reachable through the dynamic import in `lazy-hero-canvas.tsx`. No other file imports `three` directly. This guarantees the WebGL bundle never ships to mobile / no-WebGL / reduced-motion users.

## 3D Hero Scene (`ParticleField`)

- **~2,500 particles** in a wide, shallow 3D volume; single `BufferGeometry` + `PointsMaterial` (one draw call), additive blending.
- **Two depth layers**: far particles (small, dim, slow) and near particles (slightly larger, brand-tinted, faster) for true parallax depth.
- **Color**: ~5% of particles tinted with the brand HSL color; the rest white/gray at low opacity.
- **Camera**: fixed at z≈8, FOV ~60. The particle group slowly rotates (full turn ≈ 4 min) and tilts ±0.15 rad toward the mouse with eased lerp.
- **Fog** fades particles into the background at the edges, blending with the existing CSS radial glow.
- **Breathing**: particle size pulses on a slow sine wave.
- **Scroll fade**: canvas opacity driven by framer-motion `useScroll` on the hero; fades out as the user scrolls to About.
- **No click/drag interaction** — ambient only.
- **Runtime guards**: R3F performance regression (auto pixel-ratio step-down), pause rendering on `document.visibilitychange`, DPR capped at 2.

## Motion System (framer-motion)

Existing `expoOut` easing (`[0.16, 1, 0.3, 1]`) remains the signature ease.

### Hero

- Keep char-stagger name reveal; chars now rotateX-flip up instead of plain fade-up.
- Availability pill springs in with scale; green ping dot retained.
- CTAs become **magnetic buttons**: lean toward cursor within ~60px radius, spring back (`stiffness: 150, damping: 15`).
- Scroll cue fades out once scrolling begins.

### Scroll-linked choreography

- Section headers: eyebrow line draws in from left (scaleX), title slides up with blur→sharp reveal.
- Section content: staggered fade-up (existing pattern kept).
- **Scroll progress bar**: 2px brand-colored bar fixed at the top, driven by `useScroll`.

### Section upgrades

- **Experience cards**: hover lift + 3D tilt (`rotateX/rotateY` following cursor), border glows brand color.
- **Portrait**: continuous gentle float (y ±6px loop) + scroll parallax offset vs. bio column.
- **Skill chips**: staggered scale+blur reveal; hover → icon springs to brand color with scale pop.
- **Social icons**: magnetic + icon slides up on hover.

### Contact page

The contact page is a social-links card grid (no form). It gets:

- Same motion language: staggered entrance reveals for header copy and cards.
- Social cards: hover lift + 3D tilt (same card-tilt behavior as Experience cards), icon springs to brand color with scale pop, brand glow border.
- Keeps its existing CSS brand-glow background — no second WebGL canvas (one WebGL context total, YAGNI).

### Navbar

- Hides on scroll down, reveals on scroll up (spring); backdrop blur intensifies with scroll.

### Micro-interactions

- All hover states use spring physics instead of plain CSS transitions.

### Reduced motion

With `MotionConfig reducedMotion="user"` (already in `page.tsx`), everything collapses to simple opacity fades — no motion, no 3D tilt, no 3D scene.

## Performance, Error Handling & Testing

### Graceful degradation ladder

1. **Full experience**: desktop + WebGL + no reduced-motion → 3D scene + all animations.
2. **No WebGL / mobile**: canvas never mounts; CSS radial-glow background remains; DOM animations still run.
3. **Reduced motion**: fades only; `useWebglCapable` also returns false → no 3D.
4. **JS disabled / SEO**: all content is semantic server-rendered HTML; 3D and animations are pure enhancement. JSON-LD, aria labels, skip-link untouched.

### Error handling

- `LazyHeroCanvas` wraps the dynamic import in a React **error boundary**: WebGL context failure → canvas silently unmounts, CSS background remains.
- WebGL context-loss event → canvas unmounts gracefully (no frozen black frame).
- No user-facing error states: the 3D is ambient decoration; its absence is invisible by design.

### Performance budgets

- 3D bundle loads after first paint (dynamic import); never blocks LCP.
- Particle count ≤ 2,500; devicePixelRatio ≤ 2.
- Build warning-free; `pnpm lint` (Biome) clean.

### Testing

- `pnpm dev` smoke test: scene renders, parallax responds, no console errors.
- `pnpm build` passes (SSR-safety: no `window`/WebGL references in server components).
- Manual matrix: Chrome desktop (full), mobile emulation (fallback), emulated reduced motion (fade-only), slow 4G throttle (LCP unaffected).
- No unit-test infra exists in this repo; verification is manual + build/lint gates, consistent with current project setup.

## Explicitly out of scope

- No new content sections (no Projects showcase).
- No page transitions, custom cursor, text scramble, or marquee effects.
- No changes to `apps/devtools` sub-app.
- No GSAP/Lenis — single animation system (framer-motion).
