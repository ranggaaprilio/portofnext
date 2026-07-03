---
description: "Task list: Contact Page Email Form via Brevo API"
---

# Tasks: Contact Page Email Form via Brevo API

**Input**: Design documents from `/specs/001-add-email-from/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT included — the plan specifies manual verification via `curl` and browser-based form interaction. No test framework is configured.

**Organization**: Tasks are grouped by user story. Since this feature spans only two net-new files (`app/_components/contact/form.tsx` and `app/api/contact/send/route.ts`), each user story adds an incremental layer of functionality to one or both files. Stories are ordered by priority and MUST be implemented sequentially when they touch the same file.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the directory structure for the new API route and verify existing integration points.

- [ ] T001 Create API route directory `app/api/contact/send/` (new directory; `app/api/` does not yet exist)
- [ ] T002 [P] Verify existing files that will be modified or composed into: `app/contact/page.tsx`, `app/_components/contact/main.tsx`, `lib/utils.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared helper functions and type definitions that both the client form and API route depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Add `isValidEmail` helper to `lib/utils.ts` — validates email format per RFC 5321 (max 254 chars, standard email regex)
- [ ] T004 [P] Add `sanitizeText` helper to `lib/utils.ts` — strips HTML tags and attribute-like patterns, returns plain text
- [ ] T005 [P] Add shared type interfaces to `lib/utils.ts`: `EmailRequest { from, subject, body }`, `ApiResponse { success, message, fieldErrors? }`, `FieldErrors { from?, subject?, body? }`

**Checkpoint**: Foundation ready — both the form component and API route can now import shared validation logic and types.

---

## Phase 3: User Story 1 - Submit Contact Email (Priority: P1) 🎯 MVP

**Goal**: A site visitor fills out the contact form with their email, subject, and message, submits, and the system delivers the email via Brevo API. Success confirmation is displayed.

**Independent Test**: Fill in all three fields with valid data, submit the form, and verify the email arrives at the site owner's inbox. The form is replaced with a success message.

### Implementation for User Story 1

- [ ] T006 [US1] Create API route handler at `app/api/contact/send/route.ts`:
  - Export `POST` handler that reads `EmailRequest` body from the request
  - Add module-level assertions for `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `CONTACT_RECIPIENT_EMAIL` (throw at module evaluation time if missing/empty)
  - Construct Brevo payload: `sender` from `BREVO_SENDER_EMAIL`, `to` from `CONTACT_RECIPIENT_EMAIL`, `replyTo` from visitor's `from`, `subject`, `textContent`
  - Call `POST https://api.brevo.com/v3/smtp/email` via native `fetch` with `api-key` header
  - On Brevo 2xx: return `{ success: true, message: "Your message has been sent. I'll get back to you soon." }`
  - On any failure: return `{ success: false, message: "Something went wrong. Please try again." }` (generic, no internal leak)
  - Log errors to `console.error` without sensitive data (no API key, no full Brevo response body)

- [ ] T007 [US1] Create form client component at `app/_components/contact/form.tsx`:
  - Add `"use client"` directive
  - Render three fields: `from` (type="email", label="Email"), `subject` (type="text", label="Subject"), `body` (textarea, label="Message")
  - Manage form state via `useState` with typed `ContactFormState` (fields: `from`, `subject`, `body`; status: `idle | loading | success | error`; `fieldErrors`: `FieldErrors`; `generalError`: `string | null`)
  - On submit: POST to `/api/contact/send` with JSON body `{ from, subject, body }`
  - On success response: set status to `success`, display confirmation message in place of the form
  - On error response: set status to `error`, display `generalError` message above the form, preserve field values

- [ ] T008 [US1] Compose `Form` component into `app/contact/page.tsx` below the existing `<Contact />` (social links grid), wrapped in the same relative `z-10` section with consistent padding

**Checkpoint**: End-to-end email delivery works. A visitor can submit the form and the site owner receives the email. Basic error feedback is displayed.

---

## Phase 4: User Story 2 - Client-Side Validation (Priority: P1)

**Goal**: The form prevents submission with invalid data and provides immediate inline feedback before any API call is made.

**Independent Test**: Attempt to submit the form with empty fields, invalid email, overlong content, or whitespace-only values. Verify inline errors appear beneath each field without a network request being made.

### Implementation for User Story 2

- [ ] T009 [US2] Add client-side validation to `app/_components/contact/form.tsx`:
  - On form submit (before fetch): validate all three fields
  - Required check: empty or whitespace-only → `"[Label] is required"`
  - Email format: invalid email → `"Please enter a valid email address"` (use `isValidEmail` from `lib/utils.ts`)
  - Max length: `from` > 254 chars, `subject` > 998 chars, `body` > 10,000 chars → `"[Label] is too long"`
  - On validation failure: set `fieldErrors` state, prevent API call, focus the first invalid field
  - Clear individual `fieldErrors` entries when the user modifies the corresponding field (onChange)
  - Clear all `fieldErrors` when user explicitly dismisses/resets

**Checkpoint**: Form validates all inputs client-side with instant feedback. No invalid requests reach the API route under normal use.

---

## Phase 5: User Story 3 - Server-Side Error Handling (Priority: P2)

**Goal**: The API route is resilient — it validates inputs server-side, sanitizes content, enforces rate limits, handles Brevo failures gracefully, and returns safe error responses. The client displays errors while preserving form data for retry.

**Independent Test**: Temporarily unset `BREVO_API_KEY` and verify submitting the form shows "Something went wrong. Please try again." while preserving entered data. Test rate limiting by submitting more than 5 times in 15 minutes.

### Implementation for User Story 3

- [ ] T010 [US3] Add server-side request validation to `app/api/contact/send/route.ts`:
  - Validate all three fields are present and non-empty (treat whitespace-only as empty)
  - Validate `from` is a well-formed email via `isValidEmail` from `lib/utils.ts`
  - Validate max lengths: `from` ≤ 254, `subject` ≤ 998, `body` ≤ 10,000
  - On validation failure: return `400` with `{ success: false, fieldErrors: { from?, subject?, body? } }`

- [ ] T011 [US3] Apply `sanitizeText` from `lib/utils.ts` to `subject` and `body` in the route handler before constructing the Brevo payload (FR-008)

- [ ] T012 [US3] Add in-memory rate limiting to `app/api/contact/send/route.ts`:
  - Create module-scoped `Map<string, { count: number; windowStart: number }>`
  - On each request: extract IP from `x-forwarded-for` header (fallback to `req.headers.get("x-real-ip")` or `"unknown"`)
  - Clean expired entries (windowStart > 15 min ago) before checking
  - If count ≥ 5 within the current 15-minute window: return `429` with `{ success: false, message: "Too many requests. Please try again later." }`
  - Otherwise: increment count and proceed

- [ ] T013 [US3] Add 10-second timeout to the Brevo fetch in `app/api/contact/send/route.ts`:
  - Create `AbortController`, call `setTimeout(() => controller.abort(), 10_000)`
  - Pass `controller.signal` to the fetch call
  - On `AbortError`: catch and return `{ success: false, message: "Something went wrong. Please try again." }`

- [ ] T014 [US3] Add error normalization in `app/api/contact/send/route.ts`:
  - All caught errors (fetch failures, Brevo 4xx/5xx, timeouts, network errors) map to `{ success: false, message: "Something went wrong. Please try again." }`
  - Log `console.error` with sanitized context (no API key, no full response bodies)
  - Return generic messages only — never expose internal stack traces or Brevo error details

- [ ] T015 [US3] Update `app/_components/contact/form.tsx` error handling:
  - On 429 response: display rate-limit message from API response, preserve form data
  - On 400 response: map `fieldErrors` from API response to form field error state
  - On 500 / network error / other: display generic error message above the form, preserve form data
  - Ensure error messages persist until user modifies any form field (per FR-019)

**Checkpoint**: The API route is hardened — server-side validation, sanitization, rate limiting, and timeout are all in place. The client handles every error category gracefully with data preservation.

---

## Phase 6: User Story 4 - Submission Loading State (Priority: P3)

**Goal**: During form submission, the submit button shows a loading indicator and all fields are disabled to prevent duplicate submissions.

**Independent Test**: Submit a valid form and observe the submit button displays a spinner with "Sending..." text and all fields are non-interactive until the request completes. On error, fields re-enable for retry.

### Implementation for User Story 4

- [ ] T016 [US4] Add loading state to `app/_components/contact/form.tsx`:
  - When `status === "loading"`: disable all three input fields (`disabled` attribute) and the submit button
  - Replace submit button text with a loading spinner + "Sending..." label
  - On success (`status === "success"`): form is already replaced by the success message (US1), no further action needed
  - On error (`status === "error"`): re-enable all fields and restore submit button to normal state
  - Ensure the loading spinner uses Tailwind's `animate-spin` (no additional icon library needed; a simple CSS-only spinner or SVG is sufficient)

**Checkpoint**: Double-submission is prevented and the loading state provides clear visual feedback during the request.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Visual design alignment, responsive verification, and final validation.

- [ ] T017 Style `app/_components/contact/form.tsx` to match the existing contact page design:
  - Card container with `rounded-3xl`, `border border-white/10`, `bg-white/[0.04]`, `backdrop-blur`, `shadow-2xl shadow-black/20`
  - Accent color: `var(--palette-2)` for focus rings, the submit button background, and the success icon
  - Submit button: `bg-[var(--palette-2)] text-white font-semibold rounded-2xl` with hover scale/opacity transition
  - Input fields: dark background (`bg-black/30`), white/white-80 text, `border border-white/10` with `focus:border-[var(--palette-2)]/70` focus ring
  - Section heading: "Send a Message" or similar, styled consistently with the existing "Contact" section heading
  - Form sits below the social links grid with appropriate vertical spacing (`mt-20` or similar)

- [ ] T018 Verify responsive layout at 320px, 768px, 1024px, and 1440px viewport widths:
  - Form card width: `w-full max-w-2xl mx-auto`
  - Ensure input fields and button are comfortably tappable on mobile (min 44px touch targets)
  - Stack vertically on narrow viewports with adequate spacing
  - Font sizes scale appropriately across breakpoints

- [ ] T019 [P] Verify security: confirm no `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, or `CONTACT_RECIPIENT_EMAIL` values appear in client-side bundle (check browser devtools Network tab and Sources tab)
- [ ] T020 [P] Run through quickstart.md validation steps: verify build passes with valid env vars, verify build fails or logs clearly when env vars are missing, manual `curl` test of the API endpoint, manual browser test of the full form flow

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — MVP delivery
- **User Story 2 (Phase 4)**: Depends on US1 (modifies same `form.tsx`)
- **User Story 3 (Phase 5)**: Depends on US1 (modifies same `route.ts` and `form.tsx`). Can run in parallel with US2 since they touch different primary files (US2: form.tsx, US3: route.ts primarily), but US3 also touches form.tsx for error display (T015), so sequential after US2 is safest.
- **User Story 4 (Phase 6)**: Depends on US1, US2, US3 (modifies `form.tsx` loading behavior which interacts with validation and error states)
- **Polish (Phase 7)**: Depends on all user stories being complete

### Within Each User Story

- API route before form component (within US1): the form POSTs to the route, so the route endpoint should exist first for testing via `curl`
- Core implementation before error handling
- Error handling before loading state (loading state interacts with error/success state transitions)

### Parallel Opportunities

- T001 and T002 can run in parallel (different concerns)
- T003, T004, T005 can run in parallel (different helpers/types, though all in `lib/utils.ts` — combine into a single commit)
- T019 and T020 can run in parallel (different verification concerns)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test end-to-end with `curl` and browser — email must arrive at owner's inbox
5. Deploy/demo the MVP

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → MVP: emails can be sent!
3. Add User Story 2 → Test independently → Client-side validation prevents bad submissions
4. Add User Story 3 → Test independently → Server hardened, errors handled gracefully
5. Add User Story 4 → Test independently → Polished loading UX
6. Polish (Phase 7) → Visual design matches, responsive verified, security confirmed

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- The two primary files (`form.tsx`, `route.ts`) are modified across multiple phases — each phase adds an incremental layer
- Commit after each phase (or after each task within a phase)
- Stop at any checkpoint to validate the story independently before proceeding
- Manual testing via `curl` and browser is the verification method (no automated test suite)
