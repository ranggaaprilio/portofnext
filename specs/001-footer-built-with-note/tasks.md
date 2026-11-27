---
description: "Task list for the Footer Built-With Note feature"
---

# Tasks: Footer Built-With Note

**Feature Branch**: `001-footer-built-with-note`
**Input**: Design documents from `/specs/001-footer-built-with-note/`
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/footer-credit.md](./contracts/footer-credit.md), [quickstart.md](./quickstart.md)

**Tests**: Intentionally **omitted**. The specification states that the repository has no unit-test
harness and that introducing one is a separately-approved change (constitution Principle V,
`research.md` R10). Verification is therefore expressed as concrete gate tasks — `pnpm lint`,
`pnpm build:portfolio`, scripted plain-text assertions against server-delivered HTML, and a manual
responsive/a11y smoke pass — each mapped to a contract clause (`C-1`…`C-8`) and a validation rule
(`VR-001`…`VR-017`).

**Design shape**: one additive edit in `app/layout.tsx` (the root Server Component) appends a plain
`<p>` after `{children}`, so every route inherits the credit from a single source. No new file, no
new component, no new dependency, no new token (`plan.md` Structure Decision, `research.md` R1–R3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Single-project Next.js App Router web application at the repository root:

- Application source: `app/` (`app/layout.tsx`, `app/page.tsx`, `app/projects/page.tsx`, `app/contact/page.tsx`, `app/_components/`, `app/globals.css`)
- Shared primitives: `components/ui/` · hooks: `hooks/` · utilities: `lib/` (all untouched by this feature)
- Config: `package.json`, `tailwind.config.ts`, `biome.json`, `next.config.mjs`, `mise.toml`
- Feature docs: `specs/001-footer-built-with-note/`
- Out of scope: `apps/devtools/` (FR-013)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish a trustworthy baseline on the untouched tree so every later assertion is a
delta, not a guess.

- [ ] T001 Confirm the pinned toolchain and installed dependencies — `node -v` → `v21.4.0`, `pnpm -v` → `9.12.1`, `pnpm install` idempotent, and `app/layout.tsx` present at the repository root (prerequisite for every gate in `quickstart.md`)
- [ ] T002 [P] Run the lint gate on the untouched tree — `pnpm lint` (`biome check app components hooks lib`) must exit `0` with zero errors and zero warnings, proving any later diagnostic belongs to this change (baseline for SC-002 / VR-015)
- [ ] T003 [P] Capture pre-change baselines for the deltas required later: full-page height of `/`, `/projects`, `/contact` at 1440/768/320 px, and the per-route count of `text-muted-foreground` occurrences in the delivered HTML (baseline for SC-006 and `quickstart.md` V-7)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm the design's load-bearing facts in the real repository before touching
`app/layout.tsx`. If any of these is false, the plan's single-file placement is wrong and
implementation must pause.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Verify `app/layout.tsx` is a Server Component with no `"use client"` directive whose `<body>` renders `{children}` as a direct child — the structural precondition for FR-006 (server-delivered text) and FR-010 (no ancestor layout change)
- [ ] T005 Verify there is no existing `<footer>` element, `contentinfo` landmark, or footer component (`grep -rn -E "footer|Footer" app components hooks lib`); record that `app/page.tsx` ends with `AboutMe`, `app/projects/page.tsx` with `Projects`, and `app/contact/page.tsx` with `Contact`, and that `app/layout.tsx` is the only module every route passes through (resolves FR-002 to the shared layout surface, `research.md` R1)
- [ ] T006 Verify the pinned class list resolves to existing tokens only — `text-muted-foreground` → `hsl(var(--muted-foreground))` in `tailwind.config.ts` and `--muted-foreground: 0 0% 64%` in `app/globals.css`'s `.dark` scope; `text-xs` a registered step; and confirm root `biome.json` (two-space indent, double quotes) governs the `pnpm lint` formatting check (`research.md` R3, R9)

**Checkpoint**: Placement, semantics, tokens, and toolchain confirmed — user story work can begin.

---

## Phase 3: User Story 1 - See the build credit at the end of the home page (Priority: P1) 🎯 MVP

**Goal**: A visitor on `/` scrolls to the end of the content and reads one subdued line stating the
site is built with Next.js and Tailwind CSS.

**Independent Test**: Load `/`, scroll past the last section (`03 — Skills`), and confirm the exact
string `Built with Next.js and Tailwind CSS` is the final content of the page, rendered smaller and
dimmer than body copy, and present in the raw HTML with JavaScript disabled.

### Implementation for User Story 1

- [ ] T007 [US1] Append the credit to `app/layout.tsx` as a sibling immediately after `{children}` inside `<body>`: a plain `<p>` containing the literal text `Built with Next.js and Tailwind CSS` with the class list `mx-auto w-full max-w-6xl px-6 pt-4 pb-8 text-center text-xs text-muted-foreground`; no `role`, `aria-*`, `href`, handler, `tabIndex`, icon, or motion wrapper; two-space indentation and double-quoted attributes so `biome check` passes unformatted-free (`research.md` R2–R5)
- [ ] T008 [US1] Verify single-source ownership of the string — `grep -rn "Built with Next.js and Tailwind CSS" app components hooks lib` returns exactly one match, in `app/layout.tsx` (VR-004, `research.md` R8)
- [ ] T009 [US1] Run `pnpm lint`; if Biome reports a formatting diff in the new markup, apply `pnpm lint:fix` and re-run until exit `0` with zero errors and zero warnings and no added `biome-ignore` (FR-012, VR-015)
- [ ] T010 [US1] Run `pnpm build:portfolio` and confirm `/` compiles and prerenders with no TypeScript or prerender error and no new client bundle attributable to the credit (FR-006, Principle V)
- [ ] T011 [US1] Start the production server (`pnpm start`) and assert the plain-text count on `/` is exactly `1` in the raw HTML fetched by `curl` with no JavaScript executed (FR-001, FR-006, SC-003, SC-004, VR-001/002/003)
- [ ] T012 [US1] Inspect the delivered markup region on `/` and confirm contract C-4/C-5: a `<p>` with a contiguous text node, the exact class list, and no `role`, `aria-label`, `aria-labelledby`, `aria-hidden`, `href`, `onClick`, or `tabIndex` (FR-004, FR-005, FR-007)

**Checkpoint**: User Story 1 is fully functional and independently demonstrable on `/`.

---

## Phase 4: User Story 2 - Find the same credit on every page (Priority: P2)

**Goal**: The identical credit appears in the same closing position on `/`, `/projects`, and
`/contact`, supplied by one shared surface with no per-route copies.

**Independent Test**: Visit each route, search the delivered HTML for the string, and confirm
exactly one match per page and unchanged surrounding closing content — with no code change beyond
T007.

### Implementation for User Story 2

- [ ] T013 [P] [US2] Verify `/projects` delivers exactly one plain-text match of the string, and that `#project-list`, the "All projects" grid, and every previously rendered string are still present in the same order above it (FR-003, FR-002, VR-003, VR-016)
- [ ] T014 [P] [US2] Verify `/contact` delivers exactly one plain-text match of the string, and that the social-link card grid and all previously rendered strings are still present in the same order above it (FR-003, FR-002, VR-003, VR-016)
- [ ] T015 [US2] Confirm the change surface is one file — `git --no-pager diff --name-only` lists only `app/layout.tsx`, with `app/page.tsx`, `app/projects/page.tsx`, `app/contact/page.tsx`, and every file under `app/_components/` absent (SC-001, SC-007, VR-013)
- [ ] T016 [US2] Confirm the shared-origin guarantee by inspection: no route file or section component contains the string, the credit follows all of `{children}` so a route added later inherits it with no edit, and client-side navigation between routes neither duplicates nor drops it (FR-002, FR-003, C-2, C-3)

**Checkpoint**: User Stories 1 and 2 both hold — every existing route shows exactly one credit from a single source.

---

## Phase 5: User Story 3 - The credit stays out of the way on small screens (Priority: P3)

**Goal**: The credit is unobtrusive and safe on narrow viewports and for assistive technology —
no overflow, no truncation, no focus stop, no animation, and no extra announcement.

**Independent Test**: Render all three routes at 320/768/1440 px with a screen reader and
reduced-motion enabled, and confirm no horizontal scroll, no overlap, full wrapped text, plain-text
announcement, and no focus target — with no code change beyond T007.

### Implementation for User Story 3

- [ ] T017 [P] [US3] Audit the class list added in T007 for wrap safety: no `truncate`, `line-clamp-*`, `whitespace-nowrap`, `overflow-hidden`, fixed width, or arbitrary value; text must wrap and never ellipsize (FR-009, C-5, VR-011)
- [ ] T018 [P] [US3] Check responsive overflow on `/`, `/projects`, and `/contact` at 320, 768, and 1440 px using `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, confirming it is `true` at every width and that the credit overlaps no neighbouring element or fixed overlay (`Background`, navbar, `ScrollProgressBar`, `WarpFlash`) (SC-005, C-7, VR-011/012)
- [ ] T019 [US3] Verify accessibility behaviour on the rendered page: tab from the top of each route and confirm the credit never receives focus, and that the accessibility tree announces it as ordinary text — not a heading, list, landmark, button, or link — with no accessible name (FR-005, FR-007, C-4, VR-005/006)
- [ ] T020 [US3] Verify absence of motion — `grep -nE "motion|whileInView|IntersectionObserver|useReducedMotion|\"use client\"" app/layout.tsx` returns nothing attributable to the credit, and with the OS reduced-motion setting enabled the credit is fully visible immediately on every route with no fade or reveal (FR-008, C-6, VR-008)

**Checkpoint**: All three user stories are independently satisfied; the credit is safe to ship at every width and with assistive technology.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Close the gates and the spec's edge cases; confirm the change introduced nothing
beyond the one line of copy.

- [ ] T021 Run the final lint gate — `pnpm lint` exits `0`, zero errors, zero warnings, no `biome-ignore` or silenced finding anywhere in the change (SC-002, FR-012, VR-015)
- [ ] T022 Re-run `pnpm build:portfolio` after all edits and confirm the build output adds no client chunk, icon, image, or asset for the credit (FR-011, SC-008)
- [ ] T023 [P] Confirm no configuration or dependency drift — `git --no-pager diff --stat package.json tailwind.config.ts app/globals.css biome.json .biomerc.json .biomeignore next.config.mjs` is empty (SC-008, VR-014, C-8)
- [ ] T024 [P] Confirm `apps/devtools/` is untouched (`git --no-pager diff --name-only -- apps/devtools` is empty) and the credit does not appear in the devtools sub-application served through the `next.config.mjs` rewrite (FR-013, VR-017)
- [ ] T025 Measure the height delta at 1440 px on each route against the T003 baseline: the credit occupies at most one text line and the page grows by no more than that line, with no existing element's spacing or alignment changed (SC-006, FR-010, VR-012)
- [ ] T026 Walk the `quickstart.md` definition-of-done checklist (V-1, V-2, V-3, V-5, V-6, V-7, V-8, V-9, V-10, V-11, V-12) and record the actual observed results — not the expectations — then stop the server started in T011
- [ ] T027 Confirm the feature documents remain consistent with the shipped change and that no doc, spec, sitemap, metadata, or OpenGraph file was modified (spec assumption: no metadata changes; VR-016)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion (T002's clean baseline makes T004–T006 meaningful) — **BLOCKS all user stories**, because a false foundational fact invalidates the single-file placement.
- **User Stories (Phases 3–5)**: All depend on Foundational completion. US1 contains the only code edit; US2 and US3 are verification-only slices over the same edit, so they can proceed in parallel with each other once T007–T010 land.
- **Polish (Phase 6)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Starts after Phase 2; delivers the actual edit. No dependency on other stories.
- **User Story 2 (P2)**: Starts after Phase 2, but its assertions require T007 to exist; it may integrate with US1 and remains independently testable (visit one route, count one match).
- **User Story 3 (P3)**: Starts after Phase 2, requires T007 to exist; it may integrate with US1/US2 and remains independently testable (one route at one width, one a11y pass).

### Within Each User Story

- Implementation before verification: T007 precedes T008–T012; T007–T010 precede T013–T020.
- The string must exist in exactly one place before any occurrence count is trusted (T008 before T011/T013/T014).
- `pnpm lint` (T009) must be green before the build gate (T010), and the build before HTTP assertions (T011).
- Story complete before moving to the next priority when working sequentially.

### Parallel Opportunities

- T002 and T003 (baseline lint, baseline measurements) run in parallel.
- T013 and T014 (per-route assertions on `/projects` and `/contact`) run in parallel — different routes, no shared state.
- T017 and T018 (class audit, responsive checks) run in parallel.
- T023 and T024 (config drift, devtools isolation) run in parallel.
- After T007, US2 and US3 verification can be split across two people; there are no file-level conflicts because only `app/layout.tsx` is ever written.

---

## Parallel Example: Baseline and Per-Route Verification

```bash
# Phase 1 — capture baselines together (Task T002, T003):
pnpm lint; echo "exit=$?"
# then, with a pre-change build served locally, record page heights and
# per-route "text-muted-foreground" counts for the later deltas

# Phase 4 — assert both remaining routes together (Task T013, T014):
for path in /projects /contact; do
  count=$(curl -s "http://localhost:3000${path}" | grep -o "Built with Next.js and Tailwind CSS" | wc -l)
  echo "${path} -> ${count}"
done
```

```bash
# Phase 6 — configuration drift and devtools isolation together (Task T023, T024):
git --no-pager diff --stat package.json tailwind.config.ts app/globals.css biome.json .biomerc.json .biomeignore next.config.mjs
git --no-pager diff --name-only -- apps/devtools
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup — clean lint baseline and pre-change measurements.
2. Complete Phase 2: Foundational — confirm layout ownership, tokens, and Biome formatting rules.
3. Complete Phase 3: User Story 1 — one additive edit in `app/layout.tsx`, then lint, build, and the
   `/` SSR assertion.
4. **STOP and VALIDATE**: confirm the credit on `/` exactly once, in raw HTML, with the contracted
   semantics and classes.
5. Ship/demo the MVP: the entire request — one quiet line at the end of the page — is delivered.

### Incremental Delivery

1. Setup + Foundational → baselines and confirmed design facts.
2. US1 → lint, build, `/` verified → demo (MVP).
3. US2 → `/projects` and `/contact` verified, diff still one file → demo the site-wide credit.
4. US3 → 320/768/1440 overflow checks, screen-reader and reduced-motion pass → demo on mobile.
5. Polish → final gates, config/devtools drift checks, height-delta measurement, quickstart walk.

### Parallel Team Strategy

With two reviewers after T007 lands:

- Developer/Reviewer A: Phase 4 (`/projects`, `/contact` occurrence and content-preservation checks).
- Developer/Reviewer B: Phase 5 (class audit, responsive overflow, a11y, reduced motion).
- Both converge on Phase 6 gates, which must be run once, last, on the final tree.

No story writes a second file, so no merge conflict is possible; the risk to manage is a second
copy of the string appearing, which T008 and T015 detect.

---

## Notes

- [P] tasks touch different files or different routes, and share no mutable state.
- [Story] labels map tasks to US1 (line exists on `/`), US2 (line exists on every route), US3
  (line is unobtrusive and safe) for traceability to `spec.md`.
- Only `app/layout.tsx` is written; everything else is read-only verification, so the change stays
  inside SC-007's two-file bound and FR-013's devtools exclusion.
- No task requires a dependency, an icon, an asset, a token, or a color literal — if one appears to,
  the design has drifted from `research.md` R3/R11.
- Verify failures against the contract (`C-1`…`C-8`) before changing anything; never resolve a
  failure by editing `biome.json`, `.biomerc.json`, `.biomeignore`, `tailwind.config.ts`, or
  `app/globals.css` (C-8).
- Stop at each checkpoint to validate the story independently, and commit after each logical group
  (implementation, US1 verification, US2 verification, US3 verification, polish).
- Avoid: a `Footer` component, per-route copies of the string, any animation wrapper, `"use client"`
  in the root layout, and `truncate`/`nowrap` utilities — each is a named rejection in
  `research.md`.
