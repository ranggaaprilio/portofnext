# Rangga Aprilio Utama — Portfolio Constitution

## Core Principles

### I. Next.js App Router & RSC First
- All pages and API routes follow Next.js 14 App Router conventions (`app/` directory).
- Server Components are the default; `"use client"` is opt-in only when interactivity (state, effects, event handlers) is required.
- API routes live under `app/api/` as route handlers; external service integrations (e.g., Brevo) are encapsulated here, never directly called from client components.

### II. Component Architecture
- Reusable UI primitives live in `components/ui/` and are framework-agnostic (no app-specific data-fetching or business logic).
- Page-specific composition lives in `app/_components/<feature>/` (e.g., `app/_components/contact/main.tsx`).
- Components accept typed props via explicit TypeScript interfaces; no prop-drilling beyond two levels — compose or lift state instead.

### III. Type Safety (NON-NEGOTIABLE)
- TypeScript `strict` mode is enabled; `any` requires an explicit justification comment.
- API request/response shapes are typed with explicit interfaces. Runtime validation (e.g., checking required fields) guards type boundaries at the API edge.
- Environment variables accessed via `process.env` are validated at startup, not at call-site.

### IV. External API Integration
- All third-party API calls (e.g., Brevo) are invoked server-side only; API keys and secrets never reach the client.
- API route handlers validate and sanitize every input before forwarding to external services. Required fields (`from`, `subject`, `body`) are checked server-side with clear error responses.
- External API responses are normalized into the app's own types before returning to the client — the app never leaks third-party response shapes to the frontend.

### V. UI/UX Standards
- The site is a personal brand portfolio: every interaction must feel polished, performant, and accessible.
- Animations (Framer Motion, GSAP, react-spring) must respect `prefers-reduced-motion`; no animation should block interaction.
- Forms provide real-time validation feedback, loading states during submission, and clear success/error messaging.
- Responsive design is mandatory: mobile-first, tested at 320px, 768px, 1024px, and 1440px breakpoints.

## Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.x (strict) |
| UI | React 18, Tailwind CSS 3.x |
| Animations | Framer Motion, GSAP, react-spring |
| Linting/Formatting | Biome |
| Package Manager | pnpm 9.x |
| Email API | Brevo (SendinBlue) v3 REST API |

### Constraints
- No additional CSS framework beyond Tailwind; no CSS-in-JS.
- No state management library beyond React built-ins (useState, useReducer, useContext) unless a demonstrated need exists.
- Node.js version pinned to v21.x (per `package.json` `nodeVersion`).

## Development Workflow

- **Lint before commit**: `pnpm lint` must pass. Run `pnpm lint:fix` for auto-fixes.
- **Format on save**: Biome formatting rules apply; run `pnpm format` to batch-fix.
- **API changes**: New or modified API routes must include manual verification steps (curl or browser test). Unit tests for validation logic are encouraged.
- **Environment variables**: Document new variables in a local `.env.example` (do not commit `.env`). The Brevo API key must never be logged or exposed in error messages.

## Governance

- This constitution defines non-negotiable standards for the portfolio codebase. All feature work and code review must reference these principles.
- Amendments require: (1) documented rationale, (2) impact analysis on existing code, (3) migration plan if the change breaks existing patterns.
- For day-to-day development guidance and feature-specific plans, refer to the active plan in `.specify/` and `CLAUDE.md`.

**Version**: 1.0.0 | **Ratified**: 2025-07-15 | **Last Amended**: 2025-07-15
