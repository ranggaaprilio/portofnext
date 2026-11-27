# Phase 1 Data Model: Footer Built-With Note

**Feature**: `001-footer-built-with-note` | **Date**: 2026-07-25
**Inputs**: [spec.md](./spec.md), [plan.md](./plan.md), [research.md](./research.md)

This feature introduces no database, no API payload, no persisted record, and no runtime
state. The spec's `Key Entities` section names exactly one entity — the **Footer Credit Line**.
Because the requirement set is fundamentally about *where* and *how often* that value appears,
this model also captures the second entity the requirements imply: the **Route** (page) that
hosts it. Everything below is derived from the spec's functional requirements and the
placement decision recorded in `research.md` R1.

Scope note: this is a **compile-time / render-time** model made of constant values, not a
data-store model. Nothing here is fetched, mutated, or persisted; the "state transitions"
section therefore records the render lifecycle and explicitly asserts the absence of mutable
state.

---

## Entity 1: Footer Credit Line

The single static content value the visitor reads. One instance exists in the codebase
(`app/layout.tsx`) and renders once per route.

| Field | Type | Value / Source | Mutability | Notes |
|---|---|---|---|---|
| `text` | `string` (literal text node) | `Built with Next.js and Tailwind CSS` | Immutable (source constant) | The one user-visible payload. Exact wording, capitalization, and spacing are contractual (FR-001). |
| `tagName` | `"p"` | literal | Immutable | Chosen in `research.md` R2: announced as ordinary text, adds no landmark, heading, list, or control (FR-007). |
| `className` | `string` (utility class list) | `mx-auto w-full max-w-6xl px-6 pt-4 pb-8 text-center text-xs text-muted-foreground` | Immutable | Fully resolved in `research.md` R3. Every value from an existing token or the default scale (FR-004). |
| `owner` | module path | `app/layout.tsx` | Immutable | Sole owner and sole source of the string (`research.md` R8). Also the shared closing surface (`research.md` R1). |
| `domPosition` | enum: `last-child-of-body` | after `{children}` inside `<body>` | Immutable | The final piece of page content on every route (FR-002, FR-003). |
| `interactive` | `false` | — | Immutable | No href, onClick, tabIndex, role, or tooltip (FR-005). |
| `announcedAsLandmark` | `false` | — | Immutable | No `role="contentinfo"`, no `<footer>`, no `aria-label` (FR-007). |
| `animates` | `false` | — | Immutable | No motion wrapper, no reveal, no scroll dependence (FR-008). |
| `wraps` | `true` | natural text flow | Immutable | No `truncate`/`nowrap`/`line-clamp`/`overflow-hidden` (FR-009). |
| `colorSource` | `token` | `--muted-foreground` via `text-muted-foreground` | Immutable | `hsl(0 0% 64%)`; never a hex/rgb/hsl literal (FR-004). |
| `typeStep` | enum: `text-xs` | smallest registered scale step | Immutable | Subordinate to body copy (`text-base md:text-lg`) (FR-004). |
| `runtimeAssets` | empty set | — | Immutable | No icon, image, font, script, or dependency added (FR-011). |

**Identity**: the credit is a singleton. There is exactly one `owner`, therefore exactly one
`text` occurrence in rendered source, therefore exactly one instance per page. Identity is
enforced structurally (single definition site), not by a key or id.

**Relationships**:
- **Consumed by** `1..N` *Route* entities (see Entity 2) — a one-to-many relationship where
  the credit is the single "one" side. This is the structural guarantee behind SC-001: adding
  a route adds a consumer, never a copy.
- **Has no** relationship to projects, skills, social links, contact data, metadata, JSON-LD,
  sitemap entries, analytics, or any other entity in the application. The spec states this
  explicitly and it must remain true (no metadata or structured-data coupling).

---

## Entity 2: Route (host page)

Included because FR-003 and SC-001 are stated per route, and because the placement decision
in `research.md` R1 is only provable against the concrete route set.

| Field | Type | Value / Source | Notes |
|---|---|---|---|
| `path` | `string` | `/`, `/projects`, `/contact` | The three routes that exist today. `app/sitemap.xml` lists these three plus a legacy `/about` entry (see Validation VR-016). |
| `entry` | module | `app/page.tsx`, `app/projects/page.tsx`, `app/contact/page.tsx` | Each is untouched by this feature (SC-007). |
| `lastSection` | module | `AboutMe`, `Projects`, `Contact` respectively | The route's own closing content, preserved verbatim and in order (FR-002). |
| `wrappedBy` | module | `app/layout.tsx` | Every route renders inside the root layout — the shared closing surface. |
| `creditCount` | integer | `1` | Exactly one instance; `0` or `2` is a failure (SC-001, SC-003). |
| `rendersInSsr` | `boolean` | `true` | Layout is a Server Component; the text is in the delivered HTML (FR-006, SC-004). |
| `viewportChecks` | widths | `320`, `768`, `1440` px | No horizontal scrollbar, no overlap, at most one line at 1440 (SC-005, SC-006). |

**Out-of-scope "routes"**: `apps/devtools/` is served by the `next.config.mjs` rewrite to a
static `index.html` and never renders the React layout, so it is not a Route in this model
and the credit must not appear there (FR-013, `research.md` R11).

---

## Relationships (summary)

```text
Footer Credit Line (1)  ──renders on──▶  Route (1..N)
        │
        └── owned by ──▶ app/layout.tsx   (single definition site)

Route  ──wrapped by──▶  app/layout.tsx  ──appends credit after {children}──▶  last DOM node
Route  ──owns──▶        lastSection (untouched; ordering preserved)
```

Cardinality rules:
- `Footer Credit Line` : `Route` = **1 : N** (one definition, many consumers).
- `Footer Credit Line` : `definition site` = **1 : 1** (singleton, no duplicates).
- `Route` that renders the shared layout : credits rendered = **1 : 1** (never 0, never 2).
- `Route` in `apps/devtools/` : credits = **1 : 0** (excluded by construction).

---

## Validation Rules

Each rule is a testable assertion derived from a spec requirement; `quickstart.md` maps them
to concrete checks. "MUST" mirrors the spec's normative language.

### Content

- **VR-001 (FR-001)** The rendered text MUST equal exactly `Built with Next.js and Tailwind CSS`:
  identical wording, capitalization, and single-space separation; `Next.js` and `Tailwind CSS`
  spelled as those projects spell them. No trailing colon, period, dash, year, version, or
  emoji.
- **VR-002 (SC-003)** A plain-text search of the delivered HTML MUST match the string on 100%
  of routes — not visual inspection alone.
- **VR-003 (FR-003, SC-001)** Exactly one match per page. Zero matches or two matches on any
  single page is a failure.
- **VR-004 (spec edge case)** The string MUST exist in exactly one source location
  (`app/layout.tsx`), so correcting it after a technology change is a one-line edit.

### Semantics & accessibility

- **VR-005 (FR-005)** The element MUST be non-interactive: no `href`, `onClick`, `tabIndex`,
  `role="button"`, tooltip trigger, or icon composition. It MUST NOT appear in the tab order.
- **VR-006 (FR-007)** It MUST NOT be announced as a heading, list, list item, navigation, or
  control; it MUST NOT introduce a landmark (`<footer>`/`contentinfo`) or an accessible name
  (`aria-label`, `aria-labelledby`). It MUST NOT be `aria-hidden` — it is real content.
- **VR-007 (FR-006, SC-004)** The text MUST be present in the server-delivered markup and
  readable with JavaScript disabled. No client boundary, hook, or effect may gate it.
- **VR-008 (FR-008)** It MUST NOT animate, fade, reveal on scroll, or depend on
  `IntersectionObserver`; with reduced motion requested it appears immediately (trivially
  satisfied by having no motion).

### Presentation

- **VR-009 (FR-004)** Color and type MUST come from existing tokens and scale:
  `text-muted-foreground` and `text-xs`. No hex/`rgb()`/`hsl()` literal, no new CSS custom
  property, no `dark:` prefix, no bespoke font family, tracking, or `clamp()` size.
- **VR-010 (FR-004)** The credit MUST be visually subordinate: smaller and lower-contrast than
  body copy (`--muted-foreground` 64% lightness vs `--foreground` 98%).
- **VR-011 (FR-009)** At a 320px viewport it MUST wrap rather than overflow or truncate: no
  `truncate`, `line-clamp-*`, `whitespace-nowrap`, `overflow-hidden`, or fixed width; no
  horizontal scrollbar at 320, 768, or 1440px (SC-005).
- **VR-012 (FR-010, SC-006)** No existing element's height, spacing, or alignment may change
  except the space the credit occupies; at 1440px the credit MUST occupy at most one text line
  and the page-height delta MUST be no more than that line.

### Placement & change surface

- **VR-013 (FR-002, SC-007)** The credit MUST render inside the existing shared closing surface
  (`app/layout.tsx`) as the last content of `<body>`; existing closing content, its order, and
  its styling MUST be preserved. At most two source files may be touched; no existing rendered
  text may be altered or removed.
- **VR-014 (FR-011, SC-008)** Zero new runtime dependencies, icons, images, fonts, color
  literals, or assets. `package.json` and `tailwind.config.ts` are unchanged.
- **VR-015 (FR-012, SC-002)** `pnpm lint` (`biome check app components hooks lib`) MUST exit `0`
  with zero errors and zero warnings, and no suppressed/silenced finding (no `biome-ignore`
  added for this change).
- **VR-016 (FR-003, SC-001)** Every route listed by the running app — today `/`, `/projects`,
  `/contact` — MUST show the credit. `app/sitemap.xml`'s legacy `/about` entry is pre-existing
  metadata and is out of scope; the feature MUST NOT add or edit sitemap entries (spec
  assumption: no metadata changes). If an `/about` route is introduced later, the layout
  supplies the credit with no further edit.
- **VR-017 (FR-013)** Nothing under `apps/devtools/` may change, and the credit MUST NOT appear
  in the devtools sub-application (it is served statically via rewrite).

---

## State Transitions

The entity is **immutable and stateless**. There is no create/update/delete lifecycle, no
runtime mutation, no persistence, and no user-editable field at runtime (spec: "not user-editable
at runtime, and is not persisted or fetched"). The only meaningful "transition" is the render
lifecycle, which is one-directional and repeats per request:

| From | Trigger | To | Guarantee |
|---|---|---|---|
| — | Authoring: one literal added to `app/layout.tsx` | **Defined** | Occurs once, at build time, in a single source location (VR-004). |
| Defined | A request for any route (SSR / static prerender) | **Rendered** | Emitted inside `<body>` after `{children}`, present in the HTML with JS off (VR-007). |
| Rendered | Client hydration (if any) | **Rendered (unchanged)** | No state, no effect, no re-render path touches it; hydration output is identical to SSR output, so there is no mismatch. |
| Rendered | Reduced-motion preference | **Rendered (unchanged)** | No motion exists to suppress (VR-008). |
| Rendered | Viewport resize 1440 → 768 → 320 px | **Rendered (wrapped, unchanged content)** | Reflow only; text wraps, never truncates; no horizontal overflow (VR-011). |
| Rendered | Route change within the app | **Unmounted → Rendered on the next route** | The layout persists across client navigations, so the credit is not remounted, duplicated, or lost (VR-003). |

**Forbidden transitions** (each would violate a requirement):

- `Defined` → `Duplicated` (a second copy anywhere) — violates VR-003.
- `Rendered` → `Absent` on any route — violates VR-003/SC-001.
- `Rendered` → `Hidden until scroll/animation` — violates VR-008.
- `Rendered` → `Interactive` (upgraded to link/button) — violates VR-005.
- `Rendered` → `Runtime-supplied` (env var, fetch, CMS) — violates VR-007 and the spec's
  single-static-string assumption.
