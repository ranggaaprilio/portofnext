<!--
Sync Impact Report
==================
Version change: (unpopulated template) → 1.0.0
Bump rationale: Initial ratification. The file previously held only the
unfilled template placeholders, so this is the first adoption of concrete
principles — a MAJOR version by the rules below (redefining an unratified
document as a governed one).

Modified principles (template slot → adopted name):
  - Principle 1 → I. Design-Token Fidelity
  - Principle 2 → II. Reuse Before Creation
  - Principle 3 → III. Minimal, Reviewable Change
  - Principle 4 → IV. Accessible and Degradable by Default
  - Principle 5 → V. Lint and Build Are Gates (NON-NEGOTIABLE)

Added sections (filling template slots 2 and 3):
  - Technology & Structure Constraints
  - Development Workflow & Quality Gates

Removed sections: none.

Templates reviewed:
  - .specify/templates/plan-template.md   ✅ aligned, no edit required
    ("Constitution Check" gate derives its items from this file)
  - .specify/templates/spec-template.md   ✅ aligned, no edit required
  - .specify/templates/tasks-template.md  ✅ aligned, no edit required
    (tests remain optional, matching the absent test harness documented here)
  - .specify/templates/constitution-template.md ⚠ unchanged by design

Follow-up TODOs: none. No placeholder tokens were deferred.

Derived from repository evidence only: package.json, biome.json, .biomerc.json,
app/globals.css, tailwind.config.ts, tsconfig.json, mise.toml, README.md, and
the existing app/, hooks/, lib/ sources. Dates use the ISO date of ratification.
-->

# Rangga Aprilio Utama Portfolio Constitution

## Core Principles

### I. Design-Token Fidelity

Color, spacing, and typography MUST come from the token layer, never from
literals inside components. The single source of truth is the `.dark` scope in
`app/globals.css` (`--background`, `--foreground`, `--card`, `--muted-foreground`,
`--border`, `--brand`, `--radius`, and siblings), surfaced through the semantic
Tailwind aliases declared in `tailwind.config.ts` (`bg-background`,
`text-muted-foreground`, `border-border`, `text-brand`, `bg-card`, ...).

- Components MUST NOT hardcode hex, `rgb()`/`hsl()` values, or one-off palette
  colors. Repeating an arbitrary value more than once is a signal to promote it
  to a token.
- `--brand` (violet `253 55% 57%`) is the only accent. Any new hue MUST be
  justified as a semantic token added to `app/globals.css` and
  `tailwind.config.ts` in the same change.
- Typography MUST use the registered families (`font-sans` → `--font-inter`,
  `font-display` → `--font-display`, `font-mono` → `--font-mono`) and the
  established scale: mono uppercase eyebrow at `text-xs tracking-[0.3em]`,
  display headings at `text-4xl md:text-5xl`, body at
  `text-base md:text-lg leading-relaxed`.
- The site is dark-only. There MUST be no light-mode branch, `dark:` prefix
  proliferation, or theme toggle added without an explicit product decision.

**Rationale**: A hand-tuned, near-black aesthetic degrades quickly when values
leak inline. Tokens keep the palette auditable and let a single edit restyle the
whole surface.

### II. Reuse Before Creation

When a change belongs to a surface that already exists, it MUST be made in that
component. New files are reserved for genuinely new surfaces.

- Extend the owning component in place instead of forking it. `Footer` variants,
  `*-v2`, `*-new`, and parallel copies of an existing block are prohibited.
- New styling MUST reuse the classes, wrappers, and primitives already on the
  target surface (`bg-card`, `border-border`, `text-muted-foreground`,
  `TiltCard`, `SectionHeading`, `MagneticButton`) rather than introducing a
  second visual dialect next to the first.
- New runtime dependencies require a stated need that an existing dependency
  cannot meet. Piling on a second animation, icon, or styling library is
  prohibited; the current stack already covers these roles.
- Shared logic belongs in `hooks/` or `lib/` when a second consumer appears, not
  duplicated inline.

**Rationale**: This codebase already carries the components each section needs.
Reuse keeps the design system coherent and confines review to the real delta.

### III. Minimal, Reviewable Change

Every change MUST be the smallest edit that satisfies the stated requirement.

- Do not refactor, reorder, or reformat code you were not asked to touch.
  Incidental cleanup bundled into a feature change is prohibited; it belongs in
  its own change.
- Do not rename public components, props, exports, or files as a side effect of
  an unrelated feature.
- Delete what you replaced. Leaving dead components, unused imports, or
  commented-out blocks behind is prohibited.
- Stay out of `apps/devtools/` unless the request explicitly names it; it is a
  separate Vite application with its own toolchain and build.

**Rationale**: A heavily hand-tuned 3D portfolio cannot absorb broad diffs
safely. A tight diff is the cheapest form of regression protection available
here and keeps every review line intentional.

### IV. Accessible and Degradable by Default

Content MUST be delivered as server-rendered semantic HTML; 3D and motion are
decoration layered on top.

- All user-visible content MUST be present in the markup and readable with
  JavaScript disabled. Nothing may be reachable only inside a WebGL scene or an
  animation.
- Expensive enhancement MUST be gated. WebGL and pointer-dependent behavior route
  through `useWebglCapable()` / `next/dynamic` with a CSS fallback; motion
  respects `MotionConfig reducedMotion="user"` and `useReducedMotion()`.
- Interactive elements MUST have an accessible name — visible text, or
  `aria-label` as used by the navbar and social links — and decorative elements
  MUST be marked `aria-hidden="true"`. The skip link and `#main-content` target
  MUST be preserved on every page.
- Hero text used for staggered character reveals MUST expose the real string via
  `aria-label`, matching the existing `Hero` pattern.
- No `@ts-ignore`, `@ts-expect-error`, `as any`, or bare `any`. A
  `biome-ignore` is acceptable only alongside a comment that explains why the
  rule is wrong for that line, as the existing JSON-LD and static-key sites do.

**Rationale**: Search engines, screen readers, and reduced-motion users are all
first-class — they must never depend on the ambient scene that most visitors
see.

### V. Lint and Build Are Gates (NON-NEGOTIABLE)

A change is not complete until the repository's automated gates pass.

- `pnpm lint` (`biome check app components hooks lib`) MUST exit clean for every
  touched file. Warnings are treated as failures; fix them rather than silencing
  them.
- Biome owns formatting (double quotes, semicolons, 2-space indent). Do not run a
  competing formatter over project files.
- `pnpm build` (`build:devtools` + `build:portfolio`) MUST pass for any change
  touching routing, data modules, or the `three`/Pixi surfaces, and MUST be
  verified whenever SSR safety is in question.
- Because this repository has no unit-test harness, verification is
  lint + build + a manual smoke pass of the affected route. Introducing a test
  runner is a deliberate, separately-approved change, not a drive-by addition.

**Rationale**: With no automated test suite, the linter and the compiler are the
only mechanical guards against regressions. Treating them as hard gates is what
keeps that trade-off safe.

## Technology & Structure Constraints

- **Framework**: Next.js 14 App Router, React 18, TypeScript in `strict` mode
  with `@/*` mapped to the repository root.
- **Styling**: Tailwind CSS 3 with the shadcn-compatible token layer; `cn()` from
  `lib/utils.ts` for conditional classes. `components/ui/` holds generated
  primitives and is Biome-ignored — prefer composing over editing those files.
- **Motion**: `framer-motion` is the only animation system. Signature easing is
  `expoOut` (`lib/motion.ts`, `cubic-bezier(0.16, 1, 0.3, 1)`). A second
  animation library is prohibited.
- **3D**: `three` + `@react-three/fiber` + Pixi are imported only inside lazily
  loaded client boundaries; never from a server component and never from a route
  entry.
- **Component layout**: route-scoped UI lives in `app/_components/<area>/main.tsx`
  with a default export; reusable cross-section primitives live in
  `app/_components/ui/`; generic shadcn primitives in `components/ui/`; hooks in
  `hooks/`; pure helpers in `lib/`. `"use client"` is added only when the file
  actually needs browser APIs, state, or motion.
- **Content**: copy, links, and section data are typed constants in the owning
  component's module. There is no CMS; text edits are code edits and are
  reviewed as such.
- **Toolchain**: Node 21.4.0 and pnpm 9.12.1, pinned in `mise.toml` and
  `package.json`. `pnpm` is the only supported package manager.
- **Scope isolation**: `apps/devtools/` is an independent sub-application served
  by rewrite; the portfolio's principles apply to it only when it is explicitly
  in scope.

## Development Workflow & Quality Gates

1. **Specify before building.** Non-trivial work enters through the Spec-Driven
   Development flow (`specify → plan → tasks → implement`). A change that alters
   behavior beyond a trivial copy or styling tweak MUST have a spec and plan
   before implementation begins.
2. **Locate the owning surface first.** Before writing code, identify the
   component that already renders the surface in question and confirm the change
   belongs there (Principle II). If no owner exists, say so and justify the new
   file.
3. **Implement the minimum.** Apply the smallest edit that satisfies the spec,
   reusing existing tokens and classes (Principles I and III).
4. **Run the gates.** Execute `pnpm lint`; run `pnpm build` when the change can
   affect compilation, routing, or SSR (Principle V). Report the actual result,
   not an expectation.
5. **Smoke the affected route.** Load the touched page in `pnpm dev` and confirm
   the change renders at desktop and mobile widths, in the reduced-motion
   configuration where motion is involved, and in the no-WebGL fallback where 3D
   is involved.
6. **Review against this document.** Every review MUST confirm token fidelity,
   reuse, minimal diff, accessibility, and a clean lint. A diff that violates a
   principle MUST be revised or the principle amended first.
7. **Commit in conventional form.** Use the repository's convention —
   `feat(<area>): …`, `fix(<area>): …`, `refactor: …`, `chore: …` — one logical
   change per commit.

## Governance

- This constitution supersedes conflicting local habit, prior review comments,
  and ad-hoc instruction. Where guidance conflicts, this document wins and the
  other artifact is corrected.
- **Amendments** require a written proposal stating the principle affected, the
  motivation, and the migration impact on existing code. An amendment takes
  effect when it is committed to this file with an incremented version and an
  updated Sync Impact Report.
- **Versioning** is semantic: MAJOR for removing or redefining a principle in a
  way that invalidates existing practice; MINOR for adding a principle or
  materially expanding guidance; PATCH for clarifications, wording, and typo
  fixes that change no expectation.
- **Compliance review**: every change is checked against the five principles at
  review time. Complexity or deviation MUST be justified in the change
  description; unjustified deviation is a block, not a note. Dependent templates
  (`plan-template.md`, `spec-template.md`, `tasks-template.md`) MUST be
  re-checked whenever this file changes.
- **Runtime guidance** lives in `README.md` (setup, tooling), `CLAUDE.md`
  (agent context), and the design records under `docs/superpowers/specs/` and
  `.sisyphus/plans/`. Those documents describe how; this constitution states
  what must remain true.

**Version**: 1.0.0 | **Ratified**: 2026-07-25 | **Last Amended**: 2026-07-25
