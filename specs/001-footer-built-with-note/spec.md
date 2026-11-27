# Feature Specification: Footer Built-With Note

**Feature Branch**: `001-footer-built-with-note`

**Created**: 2026-07-25

**Status**: Draft

**Input**: User description: "Add a small, subtle line to the site footer that reads 'Built with Next.js and Tailwind CSS'. Reuse the existing footer component and its styling; keep the change minimal. `pnpm lint` (biome) must pass."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See the build credit at the end of the home page (Priority: P1)

A visitor scrolls to the very bottom of the home page and reads one quiet line stating that the site is built with Next.js and Tailwind CSS.

**Why this priority**: This is the entire request. If only this story ships, the feature has delivered its value: the credit exists, it is visible, and it looks like part of the site rather than an addition bolted onto it.

**Independent Test**: Run the site, load the home route, scroll to the end of the page content, and confirm the exact string "Built with Next.js and Tailwind CSS" is rendered as the last piece of page content, in a subdued style consistent with the surrounding closing content. Delivers a complete, demonstrable credit line on the primary route.

**Acceptance Scenarios**:

1. **Given** a visitor on the home route, **When** they scroll past the last content section, **Then** the line "Built with Next.js and Tailwind CSS" is the final visible text on the page.
2. **Given** the home route rendered at a desktop width, **When** the footer area is inspected, **Then** the credit appears on a single line, set smaller and dimmer than body copy, and occupies no more vertical space than the single line it contains.
3. **Given** the page is loaded with JavaScript disabled, **When** the footer area is read, **Then** the credit text is still present in the delivered markup.

---

### User Story 2 - Find the same credit on every page (Priority: P2)

A visitor lands on any route of the site — home, projects, or contact — and finds the identical build credit in the same place at the end of the page.

**Why this priority**: A site-wide statement that appears on only one route looks like an oversight. Consistency across routes is what makes it a footer rather than a decorative paragraph, but the feature is still valuable with a single route.

**Independent Test**: Visit each existing route in turn, scroll to the end of the content, and confirm the same string appears in the same relative position with the same styling on every one of them, with no duplicate copies on a single page. Delivers a coherent, site-wide credit.

**Acceptance Scenarios**:

1. **Given** the home, projects, and contact routes, **When** each is viewed in turn, **Then** each shows exactly one instance of the credit in its closing content.
2. **Given** any single route, **When** the page is searched for the credit string, **Then** exactly one match is present.
3. **Given** a route has been added or is later added to the site, **When** it renders its closing content, **Then** the credit is supplied by the same shared closing surface rather than by a copy-pasted block.

---

### User Story 3 - The credit stays out of the way on small screens (Priority: P3)

A visitor on a phone or a screen reader encounters the credit without it crowding the layout, breaking the line awkwardly, or interrupting the content around it.

**Why this priority**: The request asks for a *small, subtle* line. Getting it in place matters most; making it unobtrusive at narrow widths and for assistive technology is the polish that keeps the addition from being a regression.

**Independent Test**: Load the affected routes at a narrow mobile width and with a screen reader or accessibility inspector, and confirm the credit wraps or scales without causing horizontal scrolling, overlaps nothing, and is announced as ordinary footer text. Delivers a credit that is safe to ship on all devices.

**Acceptance Scenarios**:

1. **Given** a 320px-wide viewport, **When** the footer is rendered, **Then** the credit stays within the viewport, causes no horizontal scroll, and overlaps no adjacent element.
2. **Given** a screen reader, **When** the end of the page is reached, **Then** the credit is read as a short piece of text in the page's closing region, is not announced as a heading, button, or link, and adds no repeated label noise.
3. **Given** the operating system's reduced-motion setting is enabled, **When** the page loads, **Then** the credit appears immediately with no reveal animation.

---

### Edge Cases

- **No existing footer to extend**: the repository currently has no dedicated footer component and no `<footer>` element; each route simply ends with its last content section. The credit therefore has to attach to whichever closing surface the site already renders, and the placement must be decided before implementation rather than invented ad hoc (see FR-002 and the open clarification).
- **Route with no closing section**: a future route that renders neither a footer nor a closing section would silently lose the credit. The shared mechanism must be a single place to add, not a per-page repetition.
- **Very long viewing context** (zoomed text at 200% or a large system font): the line may need to wrap. It must wrap gracefully rather than overflow or truncate, and the text must remain complete — no ellipsis, no `truncate` class.
- **Text accuracy drift**: the credit names two specific technologies. If either is ever replaced, the credit becomes false. The string must live in a single, obvious location so it can be corrected in one edit.
- **String duplication**: a copy of the credit added both inside a section and in a wrapper would render the line twice on the same page, which reads as a bug. Duplicate rendering must be detectable by a plain page search.
- **Interaction with fixed and animated elements**: the footer must not be obscured by any fixed overlay or clipped by a transformed ancestor, and must not introduce a new scroll-jump target.
- **Lint failure**: a change that passes visually but fails the repository's lint gate is not complete (see SC-002).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST display the exact string `Built with Next.js and Tailwind CSS` — identical wording, capitalization, and spacing, with "Next.js" and "Tailwind CSS" spelled as their projects spell them.
- **FR-002**: The credit MUST be rendered inside the existing footer/closing surface of the site rather than in a newly introduced parallel footer. Existing closing content, its order, and its styling MUST be preserved. [NEEDS CLARIFICATION: the repository has no dedicated footer component today — should the credit attach to the existing page-closing section on each route (the contact block on `/contact`, the end of the about/skills content on `/`, the project list on `/projects`), or should a single shared footer surface be established first as part of this feature?]
- **FR-003**: The credit MUST appear on every route of the site that renders a footer or closing surface, exactly once per page.
- **FR-004**: The credit MUST be styled as subordinate text — smaller and lower-contrast than body copy — using the site's existing design tokens and utility classes for color, type, and spacing. No new color values, hardcoded hex/rgb/hsl literals, or bespoke font treatments may be introduced.
- **FR-005**: The credit MUST be plain, non-interactive text. It MUST NOT be a link, button, tooltip trigger, or icon composition.
- **FR-006**: The credit MUST be present in server-delivered markup and readable with JavaScript disabled.
- **FR-007**: The credit MUST NOT be announced as a heading, list, navigation, or control by assistive technology, and MUST NOT add a redundant accessible label or landmark.
- **FR-008**: The credit MUST NOT animate, fade, or reveal on scroll, and MUST render immediately when reduced motion is requested.
- **FR-009**: The credit MUST NOT introduce horizontal overflow at a 320px viewport width, and MUST wrap rather than truncate when space is insufficient.
- **FR-010**: Adding the credit MUST NOT change the height, spacing, or alignment of any existing element other than the space the credit itself occupies.
- **FR-011**: The feature MUST NOT add a runtime dependency, a new icon library, or any new asset.
- **FR-012**: The change MUST leave `pnpm lint` (`biome check app components hooks lib`) exiting clean, with no suppressed or silenced findings.
- **FR-013**: The feature MUST NOT modify the independent `apps/devtools/` sub-application.

### Key Entities *(include if this feature involves data)*

- **Footer credit line**: a single static content value consisting of the displayed text, its position as the last element of the site's closing surface, and its presentational role as subdued footer text. It has no relationships to other data, is not user-editable at runtime, and is not persisted or fetched.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the site's routes display the credit exactly once; zero routes display it twice and zero routes omit it.
- **SC-002**: `pnpm lint` exits with code 0 and reports zero errors and zero warnings for the change.
- **SC-003**: The rendered page text contains the exact sequence `Built with Next.js and Tailwind CSS` — verified by a plain-text search of the page, not by visual inspection alone — on 100% of routes.
- **SC-004**: With JavaScript disabled, the credit is still present in 100% of tested routes.
- **SC-005**: At 320px, 768px, and 1440px viewport widths, the page has no horizontal scrollbar and the credit does not overlap any neighbouring element.
- **SC-006**: The credit occupies at most one text line at 1440px, and introducing it changes the documented page height by no more than the height of that one line.
- **SC-007**: The number of source files touched by the change is at most two, and no existing rendered text is altered or removed.
- **SC-008**: Zero new dependencies, icons, images, or color literals are added, confirmed by a review of the change.

## Assumptions

- **Primary audience** is a human visitor or a prospective client/recruiter reading the site; the credit exists to signal the technology stack, not to serve search engines or analytics.
- **Existing footer surface is reused.** Per the project constitution's reuse principle, the credit is added to the surface that already closes the page rather than in a new footer component, new route-level wrapper, or `*-v2` variant. The exact surface is the subject of the open clarification in FR-002.
- **Single static string.** The text is hardcoded content in the owning component — the site has no CMS or localization layer, and adding one is out of scope.
- **No decorative extras.** No logo marks, framework icons, copyright notice, year, "made with ♥" phrasing, or version number accompanies the line; only the requested sentence is added.
- **Visual treatment follows existing conventions.** Subdued text is expressed with the site's established muted foreground token and an existing small type step, matching how other secondary text is already styled; the dark-only theme is unchanged.
- **Scope is the portfolio app only.** `apps/devtools/` is a separate application with its own toolchain and is explicitly out of scope.
- **Verification is lint plus a manual smoke pass.** The repository has no unit-test harness and introducing one is a separately-approved change, so acceptance is confirmed by the lint gate, a build check where the closing surface sits in a route, and visual review at desktop, mobile, and reduced-motion settings.
- **Placement at the very end** of the page's content, after all existing sections, is acceptable and expected; the credit is not moved into the navbar, a modal, or a settings/about page.
- **No new analytics, tracking, headings, or metadata** are added; the feature does not affect page titles, descriptions, structured data, or sitemap entries.
