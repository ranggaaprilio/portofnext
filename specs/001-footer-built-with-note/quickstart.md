# Quickstart: Validating the Footer Built-With Note

**Feature**: `001-footer-built-with-note` | **Date**: 2026-07-25
**Artifacts**: [spec.md](./spec.md) · [plan.md](./plan.md) · [research.md](./research.md) ·
[data-model.md](./data-model.md) · [contracts/footer-credit.md](./contracts/footer-credit.md)

A runnable guide that proves the feature end-to-end. Each step states what it validates, the
command, and the expected outcome. Assertions are written against the contract clauses
(`C-1`…`C-8`) and the validation rules (`VR-001`…`VR-017`) rather than restating them — open
[`contracts/footer-credit.md`](./contracts/footer-credit.md) for the normative wording and
[`data-model.md`](./data-model.md) for entity/field detail. This guide contains no
implementation code and no file diffs; writing the change is the implement phase's job.

---

## Prerequisites

| Item | Requirement | How to confirm |
|---|---|---|
| Toolchain | Node 21.4.0, pnpm 9.12.1 (pinned in `mise.toml` / `package.json`) | `node -v` → `v21.4.0`; `pnpm -v` → `9.12.1` |
| Dependencies installed | `node_modules/` present | `pnpm install` (idempotent; run if unsure) |
| Working directory | Repository root (contains `app/`, `specs/`, `biome.json`) | `ls app/layout.tsx` succeeds |
| Implementation applied | The credit exists in `app/layout.tsx` | `grep -n "Built with Next.js and Tailwind CSS" app/layout.tsx` returns exactly one line |
| Network (optional) | A free local port for `pnpm dev` / `pnpm start` (default 3000) | `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000` after starting |

Notes that keep the run honest:

- This repository has **no unit-test harness**, and adding one is a separately-approved change
  (constitution Principle V). Validation is therefore lint + build + scripted HTML assertions +
  a manual browser pass — which is exactly what SC-002 and SC-003 ask for.
- Every command below is read-only with respect to source. None of them rewrites a project file.
- If a step fails, the corresponding contract clause and validation rule tell you what
  invariant broke; do not "fix" a failure by editing `biome.json`, `.biomerc.json`,
  `.biomeignore`, `tailwind.config.ts`, or `app/globals.css` (contract C-8).

---

## V-1 — Lint gate (C-8 · FR-012 · SC-002 · VR-015)

```bash
pnpm lint
```

**Expected**: exit code `0`, zero errors, zero warnings, no suppressed findings, and no
`biome-ignore` comment introduced for the credit.

```bash
pnpm lint; echo "exit=$?"
```

**Fail if**: any diagnostic is printed, the exit code is non-zero, or the change added a
`biome-ignore`. Biome also enforces formatting, so a formatting mismatch in the new markup
surfaces here — if it does, run `pnpm lint:fix` and re-run V-1; do not hand-tune config.

---

## V-2 — Change surface (C-3 · C-8 · FR-002 · FR-013 · SC-007)

Confirm the diff is a single additive edit and that no forbidden file moved.

```bash
git --no-pager diff --stat
git --no-pager diff --name-only
```

**Expected**:

- Exactly one modified production file: `app/layout.tsx` (the spec allows at most two).
- `package.json`, `tailwind.config.ts`, `app/globals.css`, `biome.json`, `.biomerc.json`,
  `.biomeignore`, and `next.config.mjs` are **not** listed.
- Nothing under `apps/devtools/` is listed.
- `app/page.tsx`, `app/projects/page.tsx`, `app/contact/page.tsx`, and every file under
  `app/_components/` are **not** listed.

The credit must exist in exactly one source location (VR-004):

```bash
grep -rn "Built with Next.js and Tailwind CSS" app components hooks lib
```

**Expected**: exactly **one** match, in `app/layout.tsx`. Zero matches means the change is
missing; two or more means a duplicate copy exists (the spec's "string duplication" edge case).

---

## V-3 — Build gate (C-6 · C-8 · FR-006 · Principle V)

```bash
pnpm build:portfolio
```

**Expected**: the Next.js build completes with no errors; `/`, `/projects`, and `/contact`
prerender or render successfully. The layout is a Server Component, so the credit is compiled
into the output — no client chunk is added for it.

**Fail if**: TypeScript errors, a prerender error, or any new client bundle entry attributable
to the credit. (`pnpm build` — devtools + portfolio — is also acceptable; the devtools build is
unaffected by this feature.)

---

## V-4 — Start the server for HTML assertions

Use the production server so the assertions test what ships:

```bash
pnpm start          # expects a prior V-3 build; serves http://localhost:3000
```

`pnpm dev` also works if you have not built; results must agree, and production is the one that
counts for SC-003/SC-004.

Leave it running for V-5 through V-8, then stop it with the PID you started
(`ps aux | grep "next start"` → `kill <PID>`).

---

## V-5 — Exact string on every route (C-1 · C-2 · FR-001 · FR-003 · SC-001 · SC-003 · VR-001/002/003)

Search the delivered HTML as plain text — not visually:

```bash
for path in / /projects /contact; do
  count=$(curl -s "http://localhost:3000${path}" | grep -o "Built with Next.js and Tailwind CSS" | wc -l)
  echo "${path} -> ${count}"
done
```

**Expected**: `1` for each of `/`, `/projects`, `/contact`. A `0` is a missing credit; anything
above `1` is a duplicate render (C-2).

The match is the whole clause C-1 payload, so this single command proves the exact wording,
capitalization, and spacing, and that the string is contiguous in the HTML rather than
interpolated across markup.

---

## V-6 — Server-delivered, no client gating (C-6 · FR-006 · SC-004 · VR-007)

The previous step already fetched raw HTML with no JavaScript executed. To be explicit that the
text is not injected later:

```bash
curl -s http://localhost:3000/ | grep -c "Built with Next.js and Tailwind CSS"
```

**Expected**: `1` from a plain `curl` (no JS engine involved), on each of the three routes.

Also confirm the emitting surface stayed a Server Component:

```bash
head -n 3 app/layout.tsx
```

**Expected**: no `"use client"` directive. If `"use client"` appears at the top of
`app/layout.tsx`, contract C-6 is violated.

---

## V-7 — Semantics and class surface (C-4 · C-5 · FR-004/005/007 · VR-005/006/009)

Inspect the element as delivered, e.g. by reading the credit's markup region in the rendered
HTML and checking it against contract C-4 (element, absence of `role`/`aria-*`, no `href`) and
C-5 (the exact class list).

Practical checks:

```bash
# Exactly one element carries the muted, extra-small, centered treatment on the page
curl -s http://localhost:3000/ | grep -o "text-muted-foreground" | wc -l
```

**Expected**: the count increases by exactly one relative to the pre-change page (the credit is
the only new consumer on `/`). Do not treat the absolute number as a target — other sections
also use `text-muted-foreground`; the delta is the assertion.

Then verify by reading the source region (no diff, just the invariant): the element is a `<p>`,
contains the string as a text node, carries the class list in C-5, and has **no** `role`,
`aria-label`, `aria-labelledby`, `aria-hidden`, `href`, `onClick`, or `tabIndex`.

Manual assistive-technology check (SC-003-adjacent, VR-006):

1. Tab through `/` from the top. The credit must **never** receive focus.
2. With a screen reader or the accessibility tree inspector, move to the end of the page. The
   credit is announced as ordinary text — not a heading, list, landmark, "footer", button, or
   link — and adds no extra label.

**Fail if**: it is announced as a landmark or heading, has an accessible name, is focusable, or
carries any class/value outside contract C-5.

---

## V-8 — No motion, reduced motion honoured (C-6 · FR-008 · VR-008)

```bash
grep -n "motion\|whileInView\|IntersectionObserver\|useReducedMotion" app/layout.tsx
```

**Expected**: no match related to the credit (an absent layout-level animation wrapper). The
credit must not reuse the `revealVariants` / `whileInView` pattern used by the sections.

Manual check:

1. Enable the OS "reduce motion" setting (macOS: System Settings → Accessibility → Display →
   Reduce motion; Windows: Settings → Accessibility → Visual effects → Animation effects = off).
2. Reload `/` and each other route, scrolling to the bottom.

**Expected**: the credit is fully visible immediately, with no fade, slide, blur, or
scroll-triggered reveal, on every route — identical behaviour with reduce-motion on and off.

---

## V-9 — Tokens and no new assets (C-5 · C-8 · FR-004 · FR-011 · SC-008 · VR-009/014)

```bash
grep -n "Built with Next.js and Tailwind CSS" -A 2 -B 2 app/layout.tsx
```

**Read the region and confirm**: color and type come only from `text-muted-foreground` and
`text-xs`; there is no `#hex`, `rgb(`, `hsl(`, `text-[...]` arbitrary value, `dark:` prefix, or
bespoke font/tracking utility; no icon component, image, or animation utility accompanies it.

```bash
git --no-pager diff --stat package.json tailwind.config.ts app/globals.css
```

**Expected**: empty output (no changes to dependencies, tokens, or the palette).

---

## V-10 — Responsive behaviour, 1440 / 768 / 320 (C-7 · FR-009 · FR-010 · SC-005 · SC-006 · VR-011/012)

In a browser, with devtools device emulation (or by resizing), check each route at each width:

| Width | Check | Expected |
|---|---|---|
| 1440px | Credit height | At most one text line |
| 1440px | Horizontal alignment | Sits inside the same `max-w-6xl`/`px-6` gutters as the sections above |
| 1440px | Page-height delta | No more than that one line versus the pre-change page |
| 768px | Horizontal scrollbar | Absent |
| 768px | Overlap | No overlap with the section above or any fixed overlay |
| 320px | Horizontal scrollbar | Absent |
| 320px | Text completeness | Full string visible; wraps (possibly to two centered lines); no ellipsis, no clipping |

Console check for overflow (run in the page context while at 320px):

```js
document.documentElement.scrollWidth <= document.documentElement.clientWidth
```

**Expected**: `true` at 320, 768, and 1440px on every route. Also confirm nothing is obscured by
the fixed overlays (`Background`, navbar, scroll progress bar, warp flash) by scrolling to the
bottom and visually checking the line is fully visible.

---

## V-11 — Preservation of existing content (C-3 · FR-002 · SC-007 · VR-012)

For each route, confirm the existing closing content is unchanged in content, order, and style:

- `/` — the Skills section (`03 — Skills`, the skills chip grid) is still the last section, above
  the credit.
- `/projects` — `#project-list` (the "All projects" grid) is still the last block, above the
  credit.
- `/contact` — the social-link card grid is still the last block, above the credit.

**Expected**: every previously rendered string is still present and in the same relative order;
the credit is the **only** new text on each page, and it is the final content of `<body>`
(contract C-3).

---

## V-12 — Devtools isolation (C-8 · FR-013 · VR-017)

```bash
git --no-pager diff --name-only -- apps/devtools
```

**Expected**: empty output. `apps/devtools/` is served through the `next.config.mjs` rewrite to a
static `index.html` and never renders the Next.js layout, so the credit must not appear there
and nothing in that sub-application should have changed.

---

## Definition of done checklist

- [ ] V-1 `pnpm lint` exits `0`, zero errors/warnings, nothing suppressed (SC-002)
- [ ] V-2 one modified production file; exactly one source occurrence of the string (SC-007)
- [ ] V-3 `pnpm build:portfolio` succeeds
- [ ] V-5 / V-6 exactly one plain-text match per route in server HTML (SC-001, SC-003, SC-004)
- [ ] V-7 plain `<p>`, no landmark/heading/label, not focusable (FR-005, FR-007)
- [ ] V-8 no animation; instant under reduced motion (FR-008)
- [ ] V-9 tokens only; no new dependency/asset/color literal (FR-004, FR-011, SC-008)
- [ ] V-10 no horizontal overflow at 320/768/1440; one line at 1440 (SC-005, SC-006)
- [ ] V-11 existing content and order preserved (FR-002, FR-010)
- [ ] V-12 `apps/devtools/` untouched (FR-013)

When every box is checked, the feature satisfies contract clauses C-1…C-8 and the run is
complete. Stop the server started in V-4 and report the actual results — not the expectations.
