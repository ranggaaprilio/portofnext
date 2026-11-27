# Implementation Plan: Footer Built-With Note

**Branch**: `001-footer-built-with-note` | **Date**: 2026-07-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-footer-built-with-note/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Render the exact string `Built with Next.js and Tailwind CSS` as a single, subdued line of
plain text at the very end of every route's content, without adding a parallel footer, a new
component file, a dependency, or any client-side JavaScript.

The research finding that drives the whole design: **the repository contains no `<footer>`,
no `contentinfo` landmark, and no footer component** (`grep` for `footer|Footer` over all
`*.tsx` returns no matches). Each route simply stops after its last section
(`app/page.tsx` → `AboutMe`, `app/projects/page.tsx` → `#project-list`, `app/contact/page.tsx`
→ `Contact`). The only surface that already closes *every* route, present and future, is the
root layout `app/layout.tsx`, which is a Server Component wrapping `{children}` in
`<html><body>`. The credit therefore attaches there, immediately after `{children}`, as a
server-rendered `<p className="mx-auto w-full max-w-6xl px-6 pt-4 pb-8 text-center text-xs
text-muted-foreground">`.

That resolves the FR-002 open clarification in favour of "establish the shared closing
surface as part of this feature, in the one file that already owns it" — with a diff of
exactly one production file, zero new files, zero new tokens, zero new dependencies, and no
per-route copies to drift apart.

## Technical Context

**Language/Version**: TypeScript 5.6 in `strict` mode (`tsconfig.json`), React 18.3,
Next.js 14.2 App Router. Toolchain pinned by `mise.toml`: Node 21.4.0, pnpm 9.12.1.

**Primary Dependencies**: Next.js 14.2 (`app/` router, Server Components), Tailwind CSS 3.4
with the shadcn-style token layer (`app/globals.css` `.dark` scope + `tailwind.config.ts`
semantic aliases), Biome 1.9.4 as the single lint/format authority. `framer-motion` is
present but **not used** by this feature.

**Storage**: N/A — the credit is a hardcoded content value in the layout module. No CMS, no
fetch, no persistence, no cookies, no environment variables.

**Testing**: No unit-test harness exists in this repository and introducing one is a
separately-approved change (constitution Principle V). Verification is therefore
`pnpm lint` (`biome check app components hooks lib`) + `pnpm build:portfolio` + a
grep-based check of the server-delivered HTML (`curl` against `pnpm dev` / `pnpm start`)
+ a manual smoke pass at 320/768/1440px, with JS disabled, and with reduced motion
requested. See [quickstart.md](./quickstart.md).

**Target Platform**: Public, statically prerendered Next.js web app (dark-only), served to
evergreen browsers and crawlers. Content must be readable with JavaScript disabled. The
`apps/devtools/` Vite sub-application is a separate toolchain and is explicitly out of
scope (FR-013).

**Performance Goals**: Zero added JavaScript and zero added hydration — the line ships only
in the server-rendered HTML of an existing Server Component. No new client boundary, no new
render-blocking asset, no Cumulative Layout Shift beyond the single line the credit itself
occupies (SC-006).

**Constraints**: Subordinate styling from existing tokens only — no hex/`rgb()`/`hsl()`
literals, no new palette entries, no bespoke font treatment (FR-004). Plain non-interactive
text: no link, button, tooltip, icon, or heading (FR-005, FR-007). No landmark, no
`aria-label`, no `aria-hidden` (FR-007). No animation or scroll reveal (FR-008). No
horizontal overflow at 320px; must wrap, never truncate (FR-009). At most two source files
touched, no existing rendered text altered or removed (SC-007). No new dependency, icon,
image, or color literal (FR-011, SC-008). `apps/devtools/` untouched (FR-013).

**Scale/Scope**: Three existing routes — `/`, `/projects`, `/contact` — plus any route added
later; one shared surface supplies the credit to all of them exactly once. One production
file modified (`app/layout.tsx`); ~10 lines of markup, ~1 visible line of copy.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Gates derived from `.specify/memory/constitution.md` v1.0.0.

### Pre-Design Gate (before Phase 0)

| # | Principle | Gate | Status | Evidence / reasoning |
|---|-----------|------|--------|----------------------|
| I | Design-Token Fidelity | No literal colors, no new palette, no light-mode branch; typography from the established scale | **PASS** | The line uses `text-muted-foreground` (→ `hsl(var(--muted-foreground))`) and `text-xs`, both already used across `app/_components/ui/section-heading.tsx` and `app/_components/about/main.tsx`. No `.dark` variable is added, no `dark:` prefix, no hex/rgb/hsl literal. |
| II | Reuse Before Creation | The change lands in the surface that already exists; no `Footer` variant, `*-v2`, or parallel copy; no second visual dialect | **PASS** | No footer exists today, so "the owning surface" is the app-wide closing surface that does exist: `app/layout.tsx`'s `{children}` slot. Zero new files, and the styling reuses the same token classes as the surrounding sections. |
| III | Minimal, Reviewable Change | Smallest edit that satisfies the spec; no incidental refactor; `apps/devtools/` untouched; no dead code | **PASS** | One file, additive-only: an element appended after `{children}`. No existing line is reordered, reformatted, renamed, or removed. `apps/devtools/` is not opened. |
| IV | Accessible and Degradable by Default | Server-rendered semantic text, readable with JS off; no `aria-*` noise; no animation that needs gating | **PASS** | `app/layout.tsx` is a Server Component with no `"use client"`, so the text is in the delivered markup (FR-006). A plain `<p>` is announced as ordinary text — no landmark, no heading, no control (FR-007). No motion at all, so no `useReducedMotion()` gate is required (FR-008). No `@ts-ignore`, `as any`, or `biome-ignore`. |
| V | Lint and Build Are Gates (NON-NEGOTIABLE) | `pnpm lint` clean; `pnpm build` where SSR/compilation is in question; verification is lint + build + manual smoke | **PASS (by plan)** | The change touches SSR output via the root layout, so both gates apply: `pnpm lint` (zero errors, zero warnings, nothing suppressed) and `pnpm build:portfolio`. Manual smoke covers the three routes at three widths, JS-off, and reduced motion. Exact commands and expected outcomes are in [quickstart.md](./quickstart.md). |

**Gate result: PASS.** No violation requires justification, so the Complexity Tracking table
stays empty.

### Post-Design Re-Check (after Phase 1)

| # | Principle | Re-check after `research.md`, `data-model.md`, `contracts/footer-credit.md`, `quickstart.md` | Status |
|---|-----------|--------------------------------------------------------------------------------------------------|--------|
| I | Design-Token Fidelity | Research R3 fixed the class list to token-backed utilities only; the DOM contract (C-5) forbids arbitrary values and literals. | **PASS** |
| II | Reuse Before Creation | Research R1/R2 kept the change inside `app/layout.tsx`; the contract asserts a single shared origin (C-2, C-3) and the data model records the layout module as sole owner. | **PASS** |
| III | Minimal, Reviewable Change | Design still yields 1 production file / 0 new files; data-model validation rules VR-013 encodes the "≤2 files, additive only" bound. | **PASS** |
| IV | Accessible and Degradable by Default | Contract C-4/C-6 require a single non-interactive, non-landmark element present in SSR HTML; quickstart validates JS-off and screen-reader behaviour. | **PASS** |
| V | Lint and Build Are Gates | Quickstart makes `pnpm lint` and the build the first two gates, before any visual check, with zero-tolerance assertions. | **PASS** |

## Project Structure

### Documentation (this feature)

```text
specs/001-footer-built-with-note/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── footer-credit.md # Rendered-markup contract for the credit line
├── spec.md              # Input feature specification
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── layout.tsx                     # MODIFIED — the only production file touched.
│                                  #   Server Component; credit appended after {children}
├── globals.css                    # UNTOUCHED — no new token, no palette change
├── page.tsx                       # UNTOUCHED — home route entry
├── projects/page.tsx              # UNTOUCHED — projects route entry
├── contact/page.tsx               # UNTOUCHED — contact route entry
└── _components/
    ├── about/main.tsx             # UNTOUCHED — current last section on /
    ├── projects/main.tsx          # UNTOUCHED — current last section on /projects
    ├── contact/main.tsx           # UNTOUCHED — current last section on /contact
    └── ui/                        # UNTOUCHED — no new primitive is introduced

components/ui/                     # UNTOUCHED — generated primitives, Biome-ignored
hooks/                             # UNTOUCHED
lib/                               # UNTOUCHED

tailwind.config.ts                 # UNTOUCHED — no new color, font, or animation key
biome.json                         # UNTOUCHED — no rule disabled, no ignore added
apps/devtools/                     # UNTOUCHED — out of scope (FR-013)
```

**Structure Decision**: Single-project Next.js App Router web application (no backend, no
API layer, no mobile client), so the template's "Option 1/2/3" trees are all replaced by the
concrete `app/` layout above.

The feature's single edit point is **`app/layout.tsx`**, the root Server Component that
already renders `<html lang="en" className="dark"><body …>{children}</body></html>` for every
route. Adding the credit immediately after `{children}` makes the root layout the one shared
closing surface, which is what satisfies:

- FR-003 / SC-001 (exactly one credit on every route) — `app/page.tsx`,
  `app/projects/page.tsx`, and `app/contact/page.tsx` do **not** each get a copy; they
  inherit the single instance from the layout, so a route added later is covered for free.
- SC-007 (at most two source files touched) — one file is touched: `app/layout.tsx`.
- FR-002 (no newly introduced parallel footer) — no `Footer` component is created; the
  existing app-wide wrapper absorbs the line.
- FR-013 — `apps/devtools/` is served through a `next.config.mjs` rewrite to a static
  `index.html`, so it never renders the React layout and is unaffected.

No test directories are added: `pnpm lint`, `pnpm build:portfolio`, and the scripted
grep checks in [quickstart.md](./quickstart.md) are this repository's verification
mechanism, per constitution Principle V.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No Constitution Check gate failed, in the pre-design pass or the post-design re-check, so
this table is intentionally empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| _(none)_ | _(no gate was violated)_ | _(no deviation to justify)_ |

## Phase Outputs

- **Phase 0** → [research.md](./research.md): resolves the FR-002 placement clarification and
  every other unknown in the Technical Context above (element semantics, token choice,
  rendering model, motion, wrapping, spacing, Biome config resolution, contract scope,
  string ownership, devtools isolation).
- **Phase 1** → [data-model.md](./data-model.md) (the two entities and their validation
  rules), [contracts/footer-credit.md](./contracts/footer-credit.md) (the rendered-markup
  contract this feature exposes to browsers, crawlers, and assistive technology), and
  [quickstart.md](./quickstart.md) (runnable end-to-end validation).
- **Phase 2** (not produced here) → `tasks.md`, via `/speckit-tasks`.
