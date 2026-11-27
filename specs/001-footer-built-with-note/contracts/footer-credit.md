# Contract: Rendered Footer Credit

**Feature**: `001-footer-built-with-note` | **Date**: 2026-07-25
**Type**: Rendered-markup / UI contract (server-delivered HTML + class & attribute surface)
**Consumers**: browsers, the DOM, crawlers and plain-text search, assistive technology, and the
`biome check` gate.

**Why a markup contract and not OpenAPI/JSON Schema**: the feature exposes no HTTP endpoint, no
CLI, and no serialized payload (see `research.md` R12). Its only external interface is the HTML
the root layout emits and the class/attribute surface that the accessibility and design-token
requirements constrain. This file states that interface as testable clauses; the field-level
detail lives in [`../data-model.md`](../data-model.md) and the runnable checks in
[`../quickstart.md`](../quickstart.md).

This is the only contract file for this feature. There are no API, CLI, event, or file-format
contracts to define.

---

## Contract clauses

### C-1 — Text payload (FR-001, SC-003)

The rendered page MUST contain exactly this character sequence, as a single contiguous text node:

```text
Built with Next.js and Tailwind CSS
```

- Exact wording, capitalization, and single-space separation. The `B` of `Built` is uppercase;
  `Next.js` keeps its dot and lowercase `js`; `Tailwind CSS` keeps the space and uppercase `CSS`.
- No leading/trailing whitespace inside the text itself, no trailing punctuation, no year, no
  version, no `made with ♥`, no emoji, no additional sentence.
- Must be findable by a plain-text search of the delivered HTML (SC-003), i.e. it must not be
  assembled from interpolated fragments that insert markup between the words.
- **Verification**: `quickstart.md` step V-5.

### C-2 — Occurrence count (FR-003, SC-001)

On every route the site serves, the contract string MUST occur **exactly once** in the rendered
text.

| Route | Expected occurrences |
|---|---|
| `/` | 1 |
| `/projects` | 1 |
| `/contact` | 1 |
| any route added later | 1 |
| `apps/devtools/` (served statically via rewrite) | 0 |

- `0` on an in-scope route is a failure (credit missing).
- `2` or more on any single page is a failure (duplicate rendering — the spec's "string
  duplication" edge case; detectable by plain page search).
- **Verification**: `quickstart.md` step V-5.

### C-3 — Single shared origin (FR-002, VR-013)

The credit MUST be emitted by **one** place: `app/layout.tsx`, appended after `{children}`
inside `<body>`. Route files and section components MUST NOT contain the string.

- Existing closing content of each route — `AboutMe` (`/`), `Projects` (`/projects`),
  `Contact` (`/contact`) — MUST render unchanged, in the same order, with the same styling.
- No new `Footer` component, no `*-v2` variant, no parallel closing surface.
- The element MUST be the last piece of page content: it follows all of `{children}`.
- **Verification**: `quickstart.md` steps V-2 and V-11.

### C-4 — Element semantics (FR-005, FR-007)

| Property | Required value | Prohibited |
|---|---|---|
| Element | `<p>` containing a text node | `<footer>`, `<h1>`–`<h6>`, `<ul>`/`<ol>`/`<li>`, `<a>`, `<button>`, `<nav>`, `<aside>` |
| `role` | absent | `contentinfo`, `note`, `button`, `link`, `heading` |
| Accessible name | none | `aria-label`, `aria-labelledby`, `title` used as a name |
| Visibility to AT | present and readable | `aria-hidden="true"` (this is real content, not decoration) |
| Interaction | none | `href`, `onClick`, `onKeyDown`, `tabIndex`, tooltip trigger |
| Tab order | not focusable | appearing in the tab sequence |

The credit is announced as a short piece of ordinary text in the page's closing region. It
introduces no landmark, heading, list, or control, and adds no repeated label noise.

- **Verification**: `quickstart.md` step V-7.

### C-5 — Class surface (FR-004, FR-011)

The element's class list MUST be exactly the following set, and MUST contain no literal values:

```text
mx-auto w-full max-w-6xl px-6 pt-4 pb-8 text-center text-xs text-muted-foreground
```

Constraints this encodes:

- **Color** comes only from `text-muted-foreground` → `hsl(var(--muted-foreground))`
  (`0 0% 64%` in the `.dark` scope of `app/globals.css`). No `text-[#...]`, `text-[rgb(...)]`,
  `text-[hsl(...)]`, arbitrary opacity, or `dark:` variant.
- **Type** comes only from `text-xs`, the smallest registered step, making the credit smaller
  than body copy (`text-base md:text-lg`) → subordinate (VR-010).
- **Frame** `mx-auto w-full max-w-6xl px-6` matches the horizontal gutters every page section
  already uses, so the credit aligns with existing content and introduces no second rhythm.
- **Spacing** `pt-4 pb-8` is default-scale spacing; it is the only vertical space the feature
  adds, keeping the page-height delta to this one line (SC-006) and leaving every existing
  element's box untouched (FR-010).
- **Wrap safety**: no `truncate`, `line-clamp-*`, `whitespace-nowrap`, `overflow-hidden`, fixed
  width, or `break-*` override — the text must wrap, never truncate or ellipsize (FR-009).
- **No new assets or dependencies**: no icon component, no image, no font utility, no animation
  utility, no new Tailwind key, no new CSS custom property (FR-011, SC-008).

- **Verification**: `quickstart.md` steps V-7 and V-9.

### C-6 — Delivery and motion (FR-006, FR-008, SC-004)

- The text MUST be present in the server-delivered HTML response for each route; disabling
  JavaScript MUST NOT remove or hide it.
- The emitting surface MUST remain a Server Component: no `"use client"` added to
  `app/layout.tsx`, no hook, no effect, no dynamic import, no `motion.*` element.
- The credit MUST NOT animate, fade, translate, or reveal on scroll, and MUST appear
  immediately when the OS reduced-motion setting is enabled. It MUST NOT reuse the
  `revealVariants` / `whileInView` pattern used by the surrounding sections.
- **Verification**: `quickstart.md` steps V-6 and V-8.

### C-7 — Layout and responsive behaviour (FR-009, FR-010, SC-005, SC-006)

| Width | Expected |
|---|---|
| 1440px | Credit on at most one text line; aligned with the content gutters; page-height delta ≤ one line |
| 768px | No horizontal scrollbar; no overlap with adjacent content; wraps at most once |
| 320px | Stays within the viewport; no horizontal scrollbar; wraps gracefully with the full text intact; overlaps nothing |

Additional layout guarantees:

- The credit adds no transform, `fixed`/`sticky` positioning, or `z-index`, so it cannot be
  obscured by `Background` (`fixed inset-0 -z-10`), the fixed navbar, `ScrollProgressBar`
  (`fixed z-[60]`), or `WarpFlash` (`fixed z-[100]`), and it creates no scroll-jump target.
- It is a sibling of `{children}` in `<body>`, not a wrapper, so no ancestor's layout,
  `min-h-screen`, flex behaviour, or containing block changes.
- **Verification**: `quickstart.md` step V-10.

### C-8 — Change surface and gates (FR-012, FR-013, SC-002, SC-007, SC-008)

- Source files touched: **at most two**; the plan's design touches **one**
  (`app/layout.tsx`), additively.
- No existing rendered text altered or removed; no rename, reorder, or reformat of untouched code.
- `package.json`, `tailwind.config.ts`, `app/globals.css`, `biome.json`, `.biomerc.json`,
  `.biomeignore`, `next.config.mjs` unchanged.
- Nothing under `apps/devtools/` changed; the credit does not appear there.
- `pnpm lint` (`biome check app components hooks lib`) exits `0` with zero errors and zero
  warnings, with no added `biome-ignore` suppression. `pnpm build:portfolio` succeeds.
- **Verification**: `quickstart.md` steps V-1, V-2, V-3, V-9, and V-12.

---

## Requirement → clause traceability

| Clause | Requirements satisfied |
|---|---|
| C-1 | FR-001, SC-003 |
| C-2 | FR-003, SC-001 |
| C-3 | FR-002, VR-013 |
| C-4 | FR-005, FR-007 |
| C-5 | FR-004, FR-009, FR-011, SC-008, VR-010 |
| C-6 | FR-006, FR-008, SC-004 |
| C-7 | FR-009, FR-010, SC-005, SC-006 |
| C-8 | FR-012, FR-013, SC-002, SC-007, SC-008 |

## Non-goals (explicitly not part of this contract)

- Copyright text, a year, version numbers, a logo, framework icons, "made with ♥" phrasing, or
  any second line (spec assumption: "No decorative extras").
- A `<footer>` landmark, site navigation in the footer, or footer links.
- Metadata, OpenGraph, JSON-LD, sitemap, or analytics changes (spec assumption: "No new
  analytics, tracking, headings, or metadata").
- Any change to `apps/devtools/` or to the legacy `/about` sitemap entry.
- Styling variants per route: the credit is identical everywhere by construction (C-3).
