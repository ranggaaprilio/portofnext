# Phase 0 Research: Footer Built-With Note

**Feature**: `001-footer-built-with-note` | **Date**: 2026-07-25
**Inputs**: [spec.md](./spec.md), [plan.md](./plan.md), `.specify/memory/constitution.md` (v1.0.0)

This document resolves every `NEEDS CLARIFICATION` carried by the plan's Technical Context and
every open question the spec raised, before design begins. Each item is recorded as
**Decision / Rationale / Alternatives considered**. Evidence is limited to files that exist in
this repository.

Repository facts established while researching (all verified by reading the files, not assumed):

- `app/layout.tsx` is a Server Component (no `"use client"`) that renders
  `<html lang="en" className="dark"><body …>{children}</body></html>` and is the only module
  every route passes through.
- A `footer|Footer` search across all `*.tsx` files returns **no matches**; there is no
  `<footer>` element, no `contentinfo` landmark, and no footer component anywhere.
- `app/page.tsx` ends with `<AboutMe />`; `app/projects/page.tsx` ends with `<Projects />`
  (its last content is `#project-list` from `project-grid.tsx`); `app/contact/page.tsx` ends
  with `<Contact />`.
- `app/globals.css` defines the dark token set (`.dark` scope), including
  `--muted-foreground: 0 0% 64%`.
- `tailwind.config.ts` maps `text-muted-foreground` → `hsl(var(--muted-foreground))`.
- `package.json` `lint` script is `biome check app components hooks lib`.
- `apps/devtools/` is reached through a `next.config.mjs` rewrite to a static `index.html`.

---

## R1 — Where the credit attaches (resolves the FR-002 clarification)

**Decision**: Attach the credit to the **root layout** `app/layout.tsx`, as a single element
appended immediately after `{children}` inside `<body>`.

**Rationale**: The spec's clarification asked whether to attach to each route's existing
closing section or to establish one shared closing surface first. Per-route attachment is
rejected by the spec's own criteria: it needs three edits (violating SC-007's two-file bound),
it duplicates the string three times (the exact "string duplication" edge case the spec
warns about), and a route added later would silently miss the credit, which FR-003 and
SC-001 forbid. The root layout is already the one module that closes *every* route — it is
the existing shared surface, not a new one, so this satisfies FR-002's "rather than in a newly
introduced parallel footer" without creating a `Footer` component (constitution Principle II).
It yields exactly one touched production file.

**Alternatives considered**:
- *A new `app/_components/footer/main.tsx` component imported by each of the three route
  files.* Rejected: three route edits plus a new file, a new `Footer` surface (Principle II
  prohibition), and three import sites that can drift.
- *Append the line to the end of `AboutMe`, `Projects`, and `Contact` inside each existing
  component.* Rejected: three edits, three copies of the string, and nothing covers a future
  route. Also mixes a global concern into three unrelated section components.
- *Wrap `{children}` in a new `<div>` in the layout and put the credit inside that wrapper.*
  Rejected: an extra wrapper element changes the containing block for the fixed/absolute
  overlays (`Background` is `fixed inset-0`, `ScrollProgressBar` is `fixed`, `WarpFlash` is
  `fixed`, the navbar is `fixed`), risking the "footer obscured by or containing a fixed
  overlay" edge case in the spec for no benefit.
- *Add a `<footer>` inside each page's `<main>`.* Rejected: `<main>` is a landmark whose
  content is the page's primary content; a footer inside it is semantically wrong, and it is
  per-route duplication again.

## R2 — Element semantics and accessibility

**Decision**: A plain `<p>` containing a plain text node. No `role`, no `aria-label`, no
`aria-hidden`, no `<footer>`/`contentinfo` landmark, no heading, no `<small>`, no link, no
`<time>`.

**Rationale**: FR-005 requires plain non-interactive text; FR-007 requires that assistive
technology not announce it as a heading, list, navigation, or control, and that no redundant
label or landmark be added. A `<p>` is announced as ordinary paragraph text and adds no
landmark, which is exactly FR-007. Adding `role="contentinfo"` (a `<footer>` outside a
sectioning element) would create a new landmark — explicitly what FR-007 forbids for this
one-line note. `<small>` would be redundant with the type-scale treatment and would couple a
presentational choice to an element name; the class list already carries the size.
No `aria-hidden` because the text is real content that must be readable, and no `aria-label`
because a label on non-interactive text adds announceable name noise.

**Alternatives considered**:
- *`<footer>` (implicit `contentinfo` landmark).* Rejected: creates a landmark FR-007 forbids,
  and would imply this is the whole site footer when it is one line.
- *`<small>`.* Rejected: redundant with `text-xs`, and element choice should not encode style.
- *`<div>`.* Acceptable, but a `<p>` is the more accurate semantic for a sentence of prose and
  is what the spec's "short piece of text" description maps to.
- *Splitting the credit so `Next.js` and `Tailwind CSS` are `<span>`s or links.* Rejected: FR-005
  forbids links/compositions, and spans would break the exact-string plain-text search in SC-003
  if separators were introduced.

## R3 — Styling: which existing tokens and type step

**Decision**: One utility class list on the `<p>`:

```text
mx-auto w-full max-w-6xl px-6 pt-4 pb-8 text-center text-xs text-muted-foreground
```

**Rationale**: Every class maps to an existing token or scale step, satisfying FR-004 and
Principle I.
- `text-muted-foreground` → `hsl(var(--muted-foreground))` = `0 0% 64%`, the site's established
  "dimmed secondary text" value, already used for eyebrows in
  `app/_components/ui/section-heading.tsx`, for body copy in `contact/main.tsx`, and for chip
  labels in `about/skill.tsx`. It is lower-contrast than `--foreground` (`0 0% 98%`), which is
  the spec's "smaller and lower-contrast than body copy".
- `text-xs` is the smallest registered type step and is already used by the site's mono
  eyebrow style, so the credit is smaller than body (`text-base md:text-lg`).
- `mx-auto w-full max-w-6xl px-6` reproduces the exact horizontal frame every page section
  already uses (`mx-auto flex w-full max-w-6xl flex-col px-6` in `about/main.tsx`,
  `projects/main.tsx`, and `contact/main.tsx`), so the line aligns with the content gutters
  instead of introducing a second horizontal rhythm.
- `pt-4 pb-8` is spacing from the default Tailwind scale, not a new token; it provides the
  breathing room after the last section without changing that section's own padding
  (FR-010: nothing but the credit's own space changes).
- `text-center` matches the centered closing composition and, at narrow widths, produces a
  tidy wrapped second line rather than a ragged left-aligned orphan.

**Alternatives considered**:
- *`font-mono text-xs uppercase tracking-[0.3em]` (the eyebrow treatment).* Rejected: uppercase
  would break the exact string required by FR-001/SC-003 ("Built with Next.js and Tailwind
  CSS" — capitalization is part of the contract), and letter-spacing at 0.3em increases the
  chance of an awkward wrap and extra width at 320px (FR-009).
- *`text-sm`.* Rejected: too close to body size; the spec asks for smaller than body copy.
- *A new `--footer-foreground` token.* Rejected: FR-004 forbids new color values, and
  `--muted-foreground` already expresses this role.
- *`text-muted-foreground/70` or any opacity modifier.* Rejected: it invents a value rather than
  consuming one, and would drop contrast below the token's chosen level.
- *`truncate` / `line-clamp-1` / `whitespace-nowrap`.* Rejected explicitly by FR-009 and the
  spec's edge case: text must wrap, never truncate or ellipsize.
- *`py-8` (symmetric).* Acceptable alternative, but `pt-4 pb-8` gives a tighter join to the
  content above and a normal page-bottom margin, and keeps one visible line of height (SC-006).

## R4 — Rendering model: Server Component, no client boundary

**Decision**: Keep the credit inside `app/layout.tsx` as-is — a Server Component — with no
`"use client"`, no `motion.*` element, no hook, no dynamic import.

**Rationale**: FR-006 and SC-004 require the text in the server-delivered markup and readable
with JavaScript disabled; a Server Component guarantees this with no extra work. FR-008
requires no animation and no reveal, so none of `framer-motion`'s machinery is needed — and
adding `"use client"` to the root layout would push every route's shell across the client
boundary, which is a materially larger change than the feature (Principle III) and a
performance regression (`plan.md` Performance Goals: zero added JS).

**Alternatives considered**:
- *Wrap the line in `motion.p` with a fade-in.* Rejected: FR-008 forbids animation, and it
  would force `"use client"` on the root layout.
- *Render it from a small client component.* Rejected: needless client JS for static text, and
  a second file (SC-007 bound).
- *Load the string at runtime (env var, JSON, fetch).* Rejected: the spec states the text is
  hardcoded content with no CMS or localization layer; a runtime source would break the
  static-delivery guarantee of FR-006.

## R5 — Motion and reduced-motion behaviour

**Decision**: No motion, therefore no `useReducedMotion()` / `MotionConfig` work is required
for this element.

**Rationale**: FR-008 says the credit must not animate, fade, or reveal on scroll, and must
render immediately when reduced motion is requested. The simplest way to satisfy "appears
immediately" is to have nothing to animate. `app/page.tsx` and
`app/_components/projects/main.tsx` already set `MotionConfig reducedMotion="user"` for their
own sections; the layout-level credit sits outside that concern and is unaffected either way.
Note the surrounding sections use `whileInView` reveals — the credit must **not** join them,
because a `whileInView` reveal is precisely the fade-in FR-008 prohibits (and, being in the
layout, it has no viewport-observer parent to inherit from).

**Alternatives considered**:
- *Reuse the existing `revealVariants` from a section.* Rejected: violates FR-008.
- *Rely on `MotionConfig reducedMotion="user"` on the home route to neutralize a reveal.*
  Rejected: that config is route-local (absent on `/projects` and `/contact` here, present only
  where the section components set it), so behaviour would differ per route — breaking the
  consistency FR-003 implies.

## R6 — Wrapping, overflow, and the 320px constraint

**Decision**: Let the text wrap naturally with `text-center` and no width-forcing utilities;
`max-w-6xl` plus `px-6` keep it inside the viewport at every breakpoint.

**Rationale**: At 320px the string `Built with Next.js and Tailwind CSS` at `text-xs` is
roughly 200px of text within a 320 − 48 = 272px content box, so it either fits on one line or
wraps to two centered lines. Because there is no `truncate`, `overflow-hidden`, `nowrap`, or
fixed width, it can never overflow or ellipsize (FR-009). The containing `body` has no
horizontal padding of its own and the layout adds no `overflow-x` rule, so no new scroll
container is introduced. The class list adds no transform, no `fixed`, and no `z-index`, so
the credit cannot be caught under `Background` (`fixed inset-0 -z-10`), the fixed navbar, the
`ScrollProgressBar` (`fixed … z-[60]`), or `WarpFlash` (`fixed … z-[100]`), and it creates no
scroll-jump target (the spec's "interaction with fixed and animated elements" edge case).

**Alternatives considered**:
- *`break-words` / `hyphens-auto`.* Unnecessary: the string breaks cleanly at spaces and no
  single word exceeds the 272px content box.
- *`whitespace-nowrap`.* Rejected by FR-009.
- *A viewport-relative font size (`clamp(...)`).* Rejected: `text-xs` is a registered step and
  a `clamp` would be a bespoke type treatment (FR-004).

## R7 — Keeping the height change to exactly one line (SC-006)

**Decision**: Vertical space comes only from the credit's own `pt-4 pb-8`; no margin, padding,
`min-h`, or gap on any existing element is modified.

**Rationale**: FR-010 forbids changing the height, spacing, or alignment of any existing
element other than the space the credit occupies, and SC-006 bounds the page-height delta to
one text line. Because the element is appended after `{children}` in `<body>` — a sibling, not
a wrapper — no ancestor's box model, flex layout, or `min-h-screen` behaviour changes. The
`/contact` and `/projects` `<main>` elements use `min-h-screen`, which is unaffected by a
following sibling.

**Alternatives considered**:
- *Add `pb-8` to `<body>` and `pt-4` to the paragraph.* Rejected: two edits where one suffices,
  and `body` padding interacts with the fixed overlays' `inset-0` sizing (`Background` uses
  `fixed inset-0`, which is viewport-relative and thus unaffected, but the change is still
  needless surface area).
- *Wrap content in a `flex min-h-screen flex-col` shell to "pin" the footer.* Rejected: it is a
  layout redesign of every route and directly violates FR-010 and Principle III.

## R8 — Single source of the string (text-accuracy drift)

**Decision**: The string is a literal text node in `app/layout.tsx`, appearing exactly once in
the repository's rendered source. No constant is hoisted.

**Rationale**: The spec's "text accuracy drift" edge case asks only that the string live in one
obvious place so a future technology change is a one-line fix. With a single occurrence in the
one layout file, that is already true; hoisting a `BUILT_WITH` constant would add indirection
without removing any duplication. The spec's assumption of a hardcoded single static string is
honoured.

**Alternatives considered**:
- *A `const BUILT_WITH = "Built with Next.js and Tailwind CSS";` at module scope.* Acceptable but
  rejected as unnecessary indirection for one use; it also adds a name to review that earns
  nothing under Principle III.
- *Putting the string in `lib/` for "shared" access.* Rejected: there is one consumer; sharing
  infrastructure with a single consumer is exactly what Principle II says to avoid.

## R9 — Which Biome config governs the lint gate (FR-012 / SC-002)

**Decision**: Comply with `biome.json` (repository root), which is what
`pnpm lint` → `biome check app components hooks lib` actually loads. Treat `.biomerc.json` and
`.biomeignore` as legacy files that Biome does not read; do not modify any of the three.

**Rationale**: Biome auto-discovers `biome.json`/`biome.jsonc` in the working directory. The
root `biome.json` sets `formatter.indentStyle: "space"`, `indentWidth: 2`, double quotes (default),
semicolons (default), and `files.ignore: ["components/ui/**/*"]`. `.biomeignore` lists build
outputs including `tailwind.config.ts` and `components/ui/*`, but ignore-file support is newer
than the pinned Biome 1.9.4 config shape and the root `biome.json` already carries the only
directory ignore the script needs. The practical consequence for this feature: the new JSX must
be indented with two spaces, use double-quoted attributes, and keep line lengths within the
formatter's default width so that `biome check` (which is format-aware, not lint-only) passes
without a rewritten file. FR-012 additionally forbids suppressed or silenced findings, so no
`biome-ignore` comment is added.

**Alternatives considered**:
- *Edit `.biomerc.json` or `.biomeignore` to align configurations.* Rejected: FR-012 and
  Principle III forbid config churn as part of this feature; also flagged as configuration
  tampering risk. The feature must fit the existing gate, not the reverse.
- *Add a `biome-ignore` or disable a rule for the new line.* Rejected explicitly by FR-012.
- *Run `pnpm format` / `pnpm lint:fix` over the touched file as a shortcut.* Allowed by
  Principle V (Biome owns formatting) but unnecessary if the added markup is written in the
  form Biome emits; `pnpm lint` output is the authority in either case.

## R10 — Verification approach given the absent test harness

**Decision**: Verification = `pnpm lint` (hard gate) + `pnpm build:portfolio` (SSR/compile
gate) + grep-based string assertions against server HTML from a running server + a manual
visual/a11y smoke pass at 320/768/1440px, JS-off, and reduced motion. No test runner is added.

**Rationale**: The repository has no unit-test harness and the constitution names introducing
one a separately-approved change (Principle V). SC-002/SC-003 explicitly ask for a lint exit of
0 and a *plain-text search* of the page rather than visual inspection, which a scripted `grep`
over fetched HTML satisfies precisely — and it is also the check that catches the spec's
duplicate-rendering edge case (exactly one match per page).

**Alternatives considered**:
- *Add Vitest/Playwright to assert the footer.* Rejected: new dev dependencies (FR-011 forbids
  new runtime deps and the spirit covers tooling), and out of scope without approval.
- *`pnpm build` (devtools + portfolio) only.* Rejected as insufficient alone: it does not prove
  the string is in the delivered HTML nor that it appears exactly once per route.
- *Visual inspection only.* Rejected by SC-003, which requires a plain-text search.

## R11 — `apps/devtools/` isolation (FR-013)

**Decision**: Change nothing under `apps/devtools/`; the credit does not appear there.

**Rationale**: `next.config.mjs` rewrites `/devtools` and `/devtools/:path*` to a static
`apps/devtools/dist/index.html`, so the sub-application never renders the Next.js root layout.
`tsconfig.json` already excludes `apps/devtools`, and `pnpm lint` only scans
`app components hooks lib`. Nothing in the feature can reach it, satisfying FR-013 without any
guard code.

**Alternatives considered**:
- *Add an export or prop to suppress the credit on some routes.* Rejected: no route needs
  suppression (FR-003 says every route that renders a closing surface gets it, and the layout
  covers all of them); a suppression flag would be speculative complexity.

## R12 — Contract scope for Phase 1

**Decision**: The feature exposes no network API, CLI, or data interface. It exposes exactly
one **rendered-markup contract** — what browsers, crawlers, screen readers, and the lint gate
observe — documented in [`contracts/footer-credit.md`](./contracts/footer-credit.md). No
OpenAPI/JSON Schema document is produced.

**Rationale**: The plan template asks to create `contracts/` for interfaces "the project
exposes to users or other systems". Here the only consumer-visible interface is the HTML the
layout emits, plus the class/attribute surface that the accessibility and token requirements
constrain. Documenting it as a contract makes FR-001/004/005/006/007/009 testable statements
that `quickstart.md` can check one-to-one, instead of restating them in prose.

**Alternatives considered**:
- *Skip `contracts/` because the feature is "purely internal".* Rejected: the credit's output
  *is* a user- and crawler-facing surface with exact-string and semantics requirements, so a
  contract is meaningful, unlike a build script.
- *Author an OpenAPI/JSON Schema document.* Rejected: there is no endpoint or payload to
  describe; a schema would be empty ceremony.
