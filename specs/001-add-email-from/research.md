# Research Document: Contact Page Email Form via Brevo API

**Feature**: 001-add-email-from | **Phase**: 0 — Research | **Date**: 2025-07-15

## Research Items

### R1: Brevo v3 API — `sendTransacEmail` endpoint shape

**Decision**: Use `POST https://api.brevo.com/v3/smtp/email` with a JSON body conforming to Brevo's transactional email schema. The payload includes `sender` (verified identity from `BREVO_SENDER_EMAIL`), `to` (site owner from `CONTACT_RECIPIENT_EMAIL`), `replyTo` (visitor's email), `subject`, and `textContent` (plain-text sanitized body). No `htmlContent` is sent — v1 is plain-text only.

**Rationale**: Brevo requires a verified sender identity for `sender.email`; using the visitor's email there would cause 401/403 rejections. Setting the visitor's email as `replyTo` preserves the ability for the site owner to reply directly. Plain-text (`textContent`) eliminates HTML injection risk without additional sanitization complexity.

**Alternatives considered**:
- _Send both `textContent` and `htmlContent`_: Rejected — adds unnecessary complexity and attack surface for v1. A plain-text email is sufficient and safer.
- _Use Brevo SMTP instead of REST API_: Rejected — the REST API is simpler (no SMTP client library needed) and the constitution already specifies the REST endpoint.
- _Use Brevo Node.js SDK (`sib-api-v3-sdk`)**: Rejected per constitution constraint — no additional dependencies. Native `fetch` is sufficient.

**References**: [Brevo API docs — Send transactional email](https://developers.brevo.com/reference/sendtransacemail)

---

### R2: HTML sanitization approach

**Decision**: Strip all HTML tags and attribute-like patterns server-side using a regex-based approach: remove `<...>` tags and patterns like `onerror=`, `onclick=`, `href=javascript:`. Only the resulting plain text is forwarded as `textContent` to Brevo. No allowlist or HTML parsing library is used.

**Rationale**: The constitution mandates sanitization and the spec (C2) explicitly states "only plain text is sent as `textContent`." A regex strip is the simplest approach that eliminates injection risk entirely. Since no HTML email body is constructed, there is no need for a sophisticated HTML sanitizer like DOMPurify (which would also require a DOM environment or additional dependencies).

**Alternatives considered**:
- _DOMPurify (isomorphic)_: Rejected — adds an npm dependency for a problem already solved by plain-text-only approach.
- _Allowlist-based tag filtering_: Rejected — more complex, more error-prone, and unnecessary since we don't support HTML email.
- _No sanitization — rely on Brevo to handle_: Rejected — violates constitution principle IV and would allow malicious content through if Brevo's behavior changes.

---

### R3: Rate limiting implementation

**Decision**: Implement an in-memory `Map<string, { count: number; windowStart: number }>` scoped to the API route module. On each request, check the `x-forwarded-for` header (or `req.ip` fallback) against the map. If the count for the IP exceeds 5 within the current 15-minute window, return 429. Expired entries are cleaned on each request via iteration over the map.

**Rationale**: In-memory storage is acceptable for a portfolio site's traffic profile (per spec assumption). No Redis, no external store, no filesystem persistence. The map lives in the route handler module's scope and resets on cold starts (Vercel serverless), which is acceptable. The `x-forwarded-for` header is the standard way to identify client IPs behind Vercel's proxy.

**Alternatives considered**:
- _Vercel Edge Config or Upstash Redis_: Rejected — adds external services and cost for a portfolio site with single-digit daily traffic. Over-engineering.
- _Middleware-based rate limiting (Next.js `middleware.ts`)_: Rejected — middleware runs on every request including static assets; scoping to the single route is simpler and more targeted.
- _Token bucket algorithm_: Rejected — fixed window is simpler to implement and reason about, and the spec explicitly defines a 15-minute window with 5-request cap.

---

### R4: Client-side form validation strategy

**Decision**: Implement validation as a pure function `validateContactForm(data: EmailRequest) => FieldErrors` that returns a map of field-level error messages. Call this function on field blur (for email format) and on form submit (for all fields including required checks and whitespace-only detection). Use HTML5 attributes (`type="email"`, `required`, `maxLength`) as a first line of defense, but do not rely on them exclusively — the JS validation is the authoritative client-side check.

**Rationale**: HTML5 validation provides baseline accessibility and works without JS, but its styling and behavior are inconsistent across browsers. A JS validation layer gives full control over error messages, timing, and styling per the constitution's UI/UX standards. The pure-function approach makes validation testable independently of React state.

**Alternatives considered**:
- _React Hook Form or Formik_: Rejected — adds npm dependencies for a single three-field form. React `useState` + controlled inputs are sufficient per constitution constraint ("no state management library beyond React built-ins unless a demonstrated need exists").
- _Zod or Yup schema validation_: Rejected — same dependency concern. Three fields with straightforward rules don't warrant a schema library.
- _Server-only validation (no client-side)_: Rejected — violates FR-003 through FR-005 and degrades UX with unnecessary round-trips.

---

### R5: Loading state UX pattern

**Decision**: Use a single `status` state variable (`"idle" | "loading" | "success" | "error"`) to drive all UI transitions. During `"loading"`: the submit button shows a CSS-only spinner (Tailwind `animate-spin` on an SVG circle) + "Sending..." text, and all three form fields receive `disabled` attribute. On `"success"`: the entire form is replaced by the success message. On `"error"`: fields re-enable, error message appears above the form, and field values are preserved.

**Rationale**: A single status enum is the simplest state machine for this form. It prevents impossible states (e.g., "loading and success simultaneously"). CSS-only spinner avoids adding a spinner component dependency. Field disabling prevents duplicate submissions even if the user bypasses the button disable.

**Alternatives considered**:
- _Separate boolean flags (`isLoading`, `isSuccess`, `isError`)_: Rejected — allows impossible states and makes conditional rendering harder to reason about.
- _A spinner component from `@tabler/icons-react`_: Already a project dependency, so using it is acceptable. Decision: use a simple SVG circle with `animate-spin` for consistency with the lightweight approach; Tabler icons can be used if the design calls for it.
- _React Suspense / useTransition_: Rejected — overkill for a form submission; the form is a client component and doesn't benefit from RSC streaming.

---

### R6: Environment variable validation at startup

**Decision**: Add module-level assertions in `app/api/contact/send/route.ts` that throw during module evaluation (i.e., at build time / cold start) if `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, or `CONTACT_RECIPIENT_EMAIL` are missing or empty. Additionally, the route handler checks these again on the first request and returns a 500 with "Service unavailable" if any are missing (handles the case where env vars were set at build but removed at runtime on Vercel).

**Rationale**: Per constitution: "Environment variables accessed via `process.env` are validated at startup, not at call-site." Module-level assertions catch misconfiguration at build time. The runtime double-check is a defense-in-depth measure for Vercel deployments where build-time and runtime environments can diverge.

**Alternatives considered**:
- _Validate only at call-site_: Rejected — violates constitution III.
- _Use `next.config.mjs` `serverRuntimeConfig`_: Rejected — deprecated in Next.js 14 App Router; environment variables via `process.env` are the standard approach.
- _Zod schema for env vars_: Rejected — adds a dependency for a three-variable check; simple assertions are sufficient.

---

### R7: Error message lifecycle

**Decision**: Success messages persist until the user navigates away or refreshes the page (the form is replaced by the success message). Error messages persist until the user modifies any form field (detected via `onChange` handlers that clear the error state) or explicitly dismisses them. Neither auto-dismisses on a timer.

**Rationale**: Per spec C6. Auto-dismissing success messages could cause the user to miss confirmation. Auto-dismissing error messages could cause the user to lose context while reading or retrying. The field-modification trigger for clearing errors provides a natural UX: "I see the error, I'll fix it" — the act of typing clears the complaint.

**Alternatives considered**:
- _Toast notifications with auto-dismiss_: Rejected — spec explicitly says no auto-dismiss (C6). Toast would also be inconsistent with the in-place success replacement pattern.
- _Dismiss button on error_: Considered as an addition, not an alternative. Spec says errors persist until field modification OR explicit dismiss. Adding a small "✕" on the error banner is a minor enhancement that aligns with C6.

---

## Dependencies & Compatibility

| Dependency | Version | Risk | Mitigation |
|-----------|---------|------|------------|
| `next` | ^14.2.29 | Low — already in use | None needed |
| `react` | ^18.3.1 | Low — already in use | None needed |
| `tailwindcss` | ^3.4.13 | Low — already in use | None needed |
| Brevo v3 REST API | v3 | Low — stable API | Timeout handling (10s), error normalization |
| `@tabler/icons-react` | ^3.34.0 | Low — already in use, optional for spinner | CSS-only fallback available |

**No new npm dependencies are required.** The feature is implementable with the existing dependency set.

---

## Open Questions (Resolved)

| # | Question | Resolution |
|---|----------|------------|
| Q1 | Should we use a CSS-only spinner or a Tabler icon? | Defer to implementation: CSS-only spinner is sufficient and avoids adding markup; Tabler `Loader2` with `animate-spin` is acceptable if the design benefits from icon consistency. |
| Q2 | Where should validation/sanitization helpers live? | Inline in `route.ts` for server-side sanitization (keeps the route self-contained). Client-side validation can be a pure function in `form.tsx` or extracted to `lib/validation.ts` if it grows. No premature abstraction. |
