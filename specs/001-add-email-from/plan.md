# Implementation Plan: Contact Page Email Form via Brevo API

**Branch**: `001-add-email-from` | **Date**: 2025-07-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-add-email-from/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add a server-backed email contact form to the existing `/contact` page. A site visitor fills in three required fields — `from` (their email), `subject`, and `body` — and submits. The client validates inputs and POSTs to a Next.js API route handler (`app/api/contact/send/route.ts`), which sanitizes, re-validates, enforces rate limiting, and forwards a plain-text email through the Brevo v3 REST API (`POST /v3/smtp/email`). The visitor's email is set as `replyTo` in the Brevo payload; the envelope sender and recipient come from environment variables. Success/error feedback replaces or persists within the form in-place without page navigation.

## Technical Context

**Language/Version**: TypeScript 5.6 (strict mode), Node.js v21.4.0

**Primary Dependencies**: Next.js 14 (App Router), React 18, Tailwind CSS 3.x, native `fetch` (no additional HTTP library), Brevo v3 REST API

**Storage**: N/A — rate limiting uses an in-memory `Map<string, { count: number; windowStart: number }>` scoped to the API route module (per the constitution and spec, no Redis or external store needed for a portfolio site)

**Testing**: Manual verification via `curl` and browser-based form interaction (no test framework configured; constitution states "API changes must include manual verification steps")

**Target Platform**: Vercel serverless functions (Node.js runtime)

**Project Type**: web-service (Next.js App Router — frontend client component + backend API route handler)

**Performance Goals**: <5s end-to-end email delivery under normal Brevo latency (SC-003); <200ms client-side validation feedback (SC-002); Brevo API timeout at 10s (FR-010)

**Constraints**: No additional npm dependencies; native `fetch` only for Brevo calls; rate limiting must be in-memory (no Redis); form must match existing Tailwind design language; all environment variables validated at module load time

**Scale/Scope**: Single-page portfolio contact form; ≤5 requests per IP per 15-minute window; single recipient (site owner); ~tens of submissions/day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Next.js App Router & RSC First | ✅ PASS | Contact page (`app/contact/page.tsx`) uses RSC. The new form is a `"use client"` component under `app/_components/contact/`. API handler lives at `app/api/contact/send/route.ts`. Client never calls Brevo directly. |
| II. Component Architecture | ✅ PASS | Form component placed in `app/_components/contact/form.tsx` (co-located with existing `main.tsx`). Typed props via explicit interfaces. No prop-drilling beyond two levels. |
| III. Type Safety (NON-NEGOTIABLE) | ✅ PASS | All request/response shapes typed with explicit interfaces (`ContactFormState`, `EmailRequest`, `ApiResponse`). Runtime validation at the API edge. Environment variables validated at module load with assertions, not at call-site. |
| IV. External API Integration | ✅ PASS | Brevo API called server-side only. API key never reaches client. Every input validated and sanitized (HTML stripped) before forwarding. Brevo response normalized into app types before returning to client. |
| V. UI/UX Standards | ✅ PASS | Real-time validation feedback, loading spinner + disabled fields during submission, clear success/error messaging. Responsive at 320/768/1024/1440px. Form uses Tailwind backdrop-blur cards matching existing social links grid. No animation dependency beyond existing Framer Motion patterns already in the project. |

**Gate Result**: ALL PASS — no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-add-email-from/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
│   └── api-send-contact.json  # OpenAPI 3.1 schema for POST /api/contact/send
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
app/
├── _components/
│   └── contact/
│       ├── main.tsx              # [EXISTING] Server component — social links grid
│       └── form.tsx              # [NEW] Client component — email form with validation
├── api/
│   └── contact/
│       └── send/
│           └── route.ts          # [NEW] API route handler — POST endpoint
├── contact/
│   └── page.tsx                  # [EXISTING] — compose Navbar + Contact (RSC)
├── globals.css                   # [EXISTING] — may add form-specific utility classes
└── layout.tsx                    # [EXISTING]

lib/
└── utils.ts                      # [EXISTING] — may add validation/sanitization helpers
```

**Structure Decision**: Single Next.js App Router project. The feature touches only two net-new files (`form.tsx`, `route.ts`) and composes into the existing contact page without refactoring `main.tsx`. No new directories outside `app/` are needed. Validation helpers can be added to `lib/utils.ts` or inlined; the spec doesn't require a separate `lib/validation.ts` but the plan leaves that as an implementation detail.

## Complexity Tracking

> No constitution violations — this section is intentionally empty.
