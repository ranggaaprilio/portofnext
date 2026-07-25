# Portfolio UI/UX Modernization — Refined Dark Minimal

## Goal
Full visual overhaul of the Next.js 14 portfolio to a **Refined Dark Minimal** standard (Linear/Vercel-esque): near-black palette, strong typographic hierarchy, one restrained accent, subtle motion. Content and page structure stay the same.

## Design System (locked)

### Color tokens (`app/globals.css`, `.dark` scope — site is dark-only)
```css
--background: 0 0% 4%;          /* #0a0a0b near-black */
--foreground: 0 0% 98%;
--card: 0 0% 6%;                /* elevated surface */
--card-foreground: 0 0% 98%;
--popover: 0 0% 6%;
--popover-foreground: 0 0% 98%;
--primary: 0 0% 98%;            /* white-on-dark buttons */
--primary-foreground: 0 0% 9%;
--secondary: 0 0% 10%;
--secondary-foreground: 0 0% 98%;
--muted: 0 0% 10%;
--muted-foreground: 0 0% 64%;   /* secondary text */
--accent: 0 0% 10%;             /* shadcn-conventional subtle hover surface */
--accent-foreground: 0 0% 98%;
--brand: 253 55% 57%;           /* THE one accent — refined violet (evolution of old #4c3bcf) */
--brand-foreground: 0 0% 98%;
--destructive: 0 62% 50%;
--destructive-foreground: 0 0% 98%;
--border: 0 0% 14%;             /* hairline borders */
--input: 0 0% 16%;
--ring: 253 55% 57%;
--radius: 0.75rem;
```
- Add `colors.brand` (+`brand-foreground`) to `tailwind.config.ts`. Keep shadcn `accent` as subtle surface (do NOT point it at violet).
- **Delete** the legacy `--palette-1/2/4` variables. All `var(--palette-*)` references get rewritten in their owning units (navbar, hero, contact, page.tsx). Final grep must return zero matches for `palette-`.

### Typography (`app/layout.tsx` + `tailwind.config.ts`)
- `Inter` (body, existing) → `--font-inter` variable
- `Space_Grotesk` (display/headings) → `--font-display`
- `JetBrains_Mono` (eyebrows, labels, meta) → `--font-mono`
- All via `next/font/google` with `variable` + `display: "swap"`; apply via CSS variables on `<body>`, NOT `inter.className`.
- Tailwind `fontFamily`: `sans: ["var(--font-inter)"]`, `display: ["var(--font-display)"]`, `mono: ["var(--font-mono)"]`
- Scale: hero name `clamp(2.75rem, 8vw, 6.5rem)` tracking `-0.04em`; section headings `text-4xl md:text-5xl` tracking `-0.02em`; eyebrows `font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground`; body `text-base md:text-lg leading-relaxed`.

### Section header pattern (reuse everywhere)
```
[mono eyebrow, e.g. "01 — ABOUT"]  →  [display heading]  →  [muted one-liner]
```

### Motion language
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out) everywhere; replace all `easeIn`/`easeInOut` and linear SplitText easing.
- Reveals: `initial={{ opacity: 0, y: 24 }}` → `whileInView={{ opacity: 1, y: 0 }}`, `viewport={{ once: true, margin: "-80px" }}`, duration 0.6, stagger children 0.08s.
- NO scale-on-hover nav links, NO drop-shadows on text, NO typewriter.
- Respect `prefers-reduced-motion` (framer-motion `useReducedMotion` or `MotionConfig reducedMotion="user"` in the top client boundary).

### Background
Replace the WebGL `FloatingLines` with a cheap static treatment: near-black base + faint radial brand-tinted glow top-center (~6% opacity, blur-3xl) + optional ultra-faint grid/noise via CSS. New `app/_components/background.tsx`. Remove `<FloatingLines>` from `app/page.tsx`.

### Skills icons
Replace the CDN coloured-icons (`ci-*` classes, dheereshagrwal CDN stylesheet in `layout.tsx <head>`) with **local `react-icons/si` Simple Icons**, rendered monochrome (`text-muted-foreground`, hover `text-foreground` or `text-brand`). Delete the `<link>` from `layout.tsx`. Display as a responsive wrapped grid of bordered chips (icon + label), not an infinite marquee. Delete `components/LogoLoop.jsx` and the `scroll-x` keyframes in globals.css.

## Execution units

### U1 — Foundation (runs FIRST, owns shared files)
- **Files owned**: `app/globals.css`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, new `app/_components/background.tsx`
- Replace dark tokens with the table above; delete `--palette-*`, `scroll-x`/`scroll-x-reverse` keyframes + `.animate-scroll-x` classes (skills rewrite makes them dead).
- Wire the 3 fonts via `next/font/google`; keep `className="dark"` on `<html>`; remove the coloured-icons CDN `<link>`.
- `page.tsx`: remove FloatingLines import/usage; mount new `<Background />`; keep Navbar/Hero/AboutMe/SpeedInsights structure.
- `Background`: `fixed inset-0 -z-10`, near-black + radial `bg-brand/5` glow + faint grid (CSS `background-image` linear-gradients, ~40px cells, white at 2-3% opacity, masked radially). Static only — no JS animation.

### U2 — Navbar (parallel after U1)
- **Files owned**: `app/_components/navbar/main.tsx`
- Wordmark: `"rangga.dev"` in `font-mono` (drop "PORTOFOLIO").
- Fixed top; transparent at top of page → on scroll (>8px): `bg-background/70 backdrop-blur-md border-b border-border`. Use a scroll listener or framer-motion `useScroll`.
- Desktop links: `text-sm text-muted-foreground hover:text-foreground transition-colors` — remove all `hover:scale-105` and `var(--palette-2)`.
- Right side: GitHub icon link + "Contact" button (`bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm`).
- Mobile: hamburger → full-screen overlay (`bg-background/95 backdrop-blur`), staggered `font-display text-3xl` links, close on navigate. Keep aria attributes.

### U3 — Hero (parallel after U1)
- **Files owned**: `app/_components/hero/main.tsx`
- Layout: centered column, `min-h-screen`, max-w-4xl.
- Top: availability pill (`border border-border rounded-full`, green pulse dot, mono text "Available for work").
- Name: `font-display font-bold tracking-[-0.04em]`, clamp scale, staggered word/char reveal (framer-motion, expo-out easing). No drop-shadow.
- Role line: static `text-xl md:text-2xl text-muted-foreground` — "Fullstack Developer" with `text-brand` on one word max. **Remove TypewriterEffectSmooth.**
- One-sentence value prop (muted, max-w-xl): reuse existing bio copy tone — 6 years, React/Vue/Node/TypeScript/Golang.
- CTAs: primary white pill "View my work" → `#about`; ghost bordered pill "Get in touch" → `/contact`.
- Bottom: subtle scroll cue (animated chevron or mono "scroll" text).
- Keep the skip-to-content link.

### U4 — About + Skills (parallel after U1)
- **Files owned**: `app/_components/about/main.tsx`, `app/_components/about/skill.tsx`
- Section header pattern with mono eyebrow "01 — ABOUT".
- Bio column: keep existing text content; portrait in a `rounded-2xl border border-border` card, no BackgroundGradient wrapper.
- **Remove**: Meteors, BackgroundGradient, PixelTransition, BlurText usages; replace heading reveal with standard expo-out motion.
- Social icons: bordered square chips, muted → foreground hover.
- Move the JSON-LD `useEffect` injection to a plain `<script type="application/ld+json">` tag rendered in the component (SSR-safe, no DOM churn) — keep the schema data identical.
- Skills (`skill.tsx`): rewrite as responsive grid (`grid-cols-3 sm:grid-cols-4 lg:grid-cols-6`) of chips (`flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2`), icons from `react-icons/si` (SiTypescript, SiGo, SiNodedotjs, SiPostgresql, SiReact, SiJavascript, SiVuedotjs, SiPhp, SiElasticsearch, SiOracle, SiRedis, SiTailwindcss, SiPython, SiMysql, SiDocker, SiSocketdotio, SiLaravel, SiApachekafka, SiGraphql, SiMicrosoftsqlserver — verify each export exists in installed react-icons version; drop any missing). No `@ts-expect-error`, no LogoLoop.

### U5 — Contact (parallel after U1)
- **Files owned**: `app/_components/contact/main.tsx`, `app/contact/page.tsx`
- `app/contact/page.tsx`: replace the hardcoded `rgba(76,59,207,0.28)` dual-gradient fixed div with the shared `<Background />` component (import from `app/_components/background`).
- Keep structure/copy. Align tokens: eyebrow → `font-mono text-xs uppercase tracking-[0.3em] text-brand`; glow → `bg-brand/10` max-w-xl (toned down); heading → `font-display tracking-tight`.
- Cards: `rounded-xl border border-border bg-card p-5`, hover `border-brand/40 transition-colors`, icon muted → brand on hover. No scale transforms.

### U6 — Cleanup + deps (runs LAST, after U2–U5 merge)
- Delete dead files: `app/_components/about/project.tsx`, `app/_components/hero/animated-emoji.tsx`, `app/_components/hero/emoji/` PNGs, `components/ui/FloatingLines.jsx` + `.css`, `components/LogoLoop.jsx`, and any ui/ components no longer imported after U2–U5 (candidates: aurora-background, background-gradient, meteor, pixel-transition, blur-text, split-text, typewriter-effect, sparkles, 3d-card, apple-cards-carousel, card-stack, glowing-effect, chart, badge — VERIFY each with grep before deleting).
- `package.json`: remove now-unused deps ONLY after import grep returns zero (candidates: `three`, `tsparticles*`, `gsap`, `recharts`, duplicate `motion` vs `framer-motion` — keep `framer-motion`). Run `pnpm install` after.
- Fix metadata inconsistency in `layout.tsx`: description says "6 years", openGraph/twitter say "4 years" — unify to 6.
- Final greps: zero matches for `palette-`, `ci-`, `FloatingLines`, `LogoLoop`, `@ts-expect-error`.

## Verification (after U6)
1. `pnpm build` → exit 0
2. `pnpm lint` (biome) → clean on changed files
3. `lsp_diagnostics` on all changed files → clean
4. Visual smoke: dev server + screenshot home & `/contact` (dark, desktop + mobile viewport)

## MUST NOT
- No new UI component libraries (radix/shadcn installs) — restyle what exists.
- No light-mode work — site stays dark-only.
- No content/copy rewrites beyond what's specified (navbar wordmark, hero value prop).
- No `as any`, `@ts-ignore`, `@ts-expect-error`.
- Do not touch `apps/` (devtools subapp) or its build.
