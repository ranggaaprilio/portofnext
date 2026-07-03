# Feature Specification: Contact Page Email Form via Brevo API

**Feature Branch**: `001-add-email-from`

**Created**: 2025-07-15

**Status**: Clarified

**Input**: User description: "add email form in contact page using brevo api ,field from ,subject, and body are required"

## Clarifications

The following decisions were made to resolve ambiguities in the original feature description. Each is integrated into the sections below.

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| C1 | How does the visitor's "from" email map to the Brevo payload, given that Brevo requires a verified sender identity? | The visitor's "from" email is set as `replyTo` in the Brevo payload. The envelope `sender` is a pre-verified identity stored in `BREVO_SENDER_EMAIL`. The recipient is the site owner via `CONTACT_RECIPIENT_EMAIL`. | Brevo's `sendTransacEmail` endpoint enforces sender verification. Using `replyTo` preserves the visitor's identity for direct reply while complying with Brevo's constraints. |
| C2 | What degree of input sanitization is applied? | All HTML tags and attribute-like patterns are stripped from subject and body server-side before forwarding to Brevo. Only plain text is sent as `textContent`. No HTML email body is constructed. | The constitution mandates sanitization; plain-text-only eliminates injection risk entirely and is the simplest correct approach for v1. |
| C3 | Are there maximum field lengths? | Yes: `from` ≤ 254 chars (per RFC 5321), `subject` ≤ 998 chars, `body` ≤ 10,000 chars. These are enforced both client-side and server-side. | Prevents resource exhaustion and aligns with Brevo API payload limits. |
| C4 | Should the API route implement rate limiting? | Yes: 5 requests per IP per 15-minute window, enforced via an in-memory store. | Prevents abuse without adding external dependencies. CAPTCHA remains deferred per the assumptions. |
| C5 | What is the Brevo API timeout? | 10 seconds. If Brevo does not respond within 10 seconds, the request is aborted and a timeout error is returned to the client. | Aligns with SC-003 (5-second normal delivery) while allowing headroom for latency variance. |
| C6 | How long do success/error messages persist? | Success messages persist until the form is reset (on success the form clears). Error messages persist until the user modifies any form field or explicitly dismisses them. Neither auto-dismisses on a timer. | Prevents the user from missing confirmation on success and preserves error context for retry. |
| C7 | What constitutes a whitespace-only submission? | Fields containing only whitespace (spaces, tabs, newlines) are treated as empty and fail validation with the same error as a missing field. | Consistent with the intent of "required" — the field must contain meaningful content. |
| C8 | How is the Brevo API key validated at startup? | The API route handler checks for the presence and non-empty value of `BREVO_API_KEY` on the first request. If missing, it returns a 500 with a generic "Service unavailable" message and logs the misconfiguration. | Per constitution: validate at startup. A build-time check is also added via a module-level assertion in the route file. |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit Contact Email (Priority: P1)

A site visitor fills out the contact form on the `/contact` page with their email address ("from"), a subject line, and a message body, then submits the form. The system sends the email via the Brevo API and confirms successful delivery to the visitor.

**Why this priority**: This is the core feature — delivering the email from the visitor to the site owner. Without this, the feature has no value.

**Independent Test**: Can be fully tested by filling in all three required fields and submitting the form, then verifying the email arrives at the owner's inbox via Brevo. Delivers the fundamental value of enabling visitors to contact the site owner.

**Acceptance Scenarios**:

1. **Given** a visitor is on the contact page with all three fields (from, subject, body) filled in, **When** they submit the form, **Then** the email is sent via Brevo API with the visitor's email as `replyTo` and the owner as recipient, and a success message is displayed to the visitor.
2. **Given** a visitor submits the form, **When** the Brevo API responds successfully (HTTP 2xx), **Then** the form fields are cleared and a confirmation message ("Your message has been sent. I'll get back to you soon.") appears in place of the form.

---

### User Story 2 - Client-Side Validation (Priority: P1)

The form prevents submission when any required field is missing, the email format is invalid, any field exceeds its maximum length, or any field contains only whitespace. Feedback is provided immediately to the visitor before any API call is made.

**Why this priority**: Prevents unnecessary API calls and gives users instant corrective feedback. Essential for a polished user experience and aligns with the constitution's UX standards.

**Independent Test**: Can be tested by attempting to submit the form with empty fields, an invalid email address, overlong content, or whitespace-only values, and verifying inline error messages appear without making any network request.

**Acceptance Scenarios**:

1. **Given** the visitor leaves the "from" field empty, **When** they attempt to submit, **Then** a validation error "Email is required" is displayed beneath the field.
2. **Given** the visitor enters an invalid email format (e.g., "notanemail"), **When** they blur the field or submit, **Then** a validation error "Please enter a valid email address" is displayed.
3. **Given** the visitor enters an email exceeding 254 characters, **When** they type or submit, **Then** a validation error indicates the email is too long.
4. **Given** the visitor leaves the subject field empty, **When** they attempt to submit, **Then** a validation error "Subject is required" is displayed.
5. **Given** the visitor enters a subject containing only whitespace, **When** they submit, **Then** a validation error "Subject is required" is displayed (whitespace-only is treated as empty).
6. **Given** the visitor leaves the body field empty, **When** they attempt to submit, **Then** a validation error "Message is required" is displayed.
7. **Given** the visitor enters a body exceeding 10,000 characters, **When** they type or submit, **Then** a validation error indicates the message is too long.

---

### User Story 3 - Server-Side Error Handling (Priority: P2)

When the Brevo API call fails (network error, rate limiting, invalid API key, timeout, etc.), the system displays a user-friendly error message and allows the visitor to retry without losing their form data.

**Why this priority**: Ensures resilience. While Brevo outages are rare, a broken form with no feedback would reflect poorly on the portfolio.

**Independent Test**: Can be tested by temporarily misconfiguring the Brevo API key and verifying that submitting the form shows a clear error message while preserving the entered data.

**Acceptance Scenarios**:

1. **Given** the Brevo API returns an error (4xx/5xx), **When** a visitor submits the form, **Then** a generic error message ("Something went wrong. Please try again.") is displayed and the form data is preserved for retry.
2. **Given** the Brevo API does not respond within 10 seconds, **When** the timeout is reached, **Then** the request is aborted and the same generic error message is displayed with form data preserved.
3. **Given** the API route receives a request with missing or invalid fields (bypassing client validation), **When** processed, **Then** a 400 response with specific field-level error messages is returned.
4. **Given** the visitor exceeds the rate limit (5 requests / 15 min), **When** they submit the form, **Then** a 429 response is returned with the message "Too many requests. Please try again later." and form data is preserved.
5. **Given** the `BREVO_API_KEY` environment variable is missing or empty, **When** the API route is first invoked, **Then** it returns a 500 with "Service unavailable" (no internal details leaked) and logs the misconfiguration to the server console.

---

### User Story 4 - Submission Loading State (Priority: P3)

While the email is being sent, the submit button shows a loading indicator and all form fields are disabled to prevent duplicate submissions.

**Why this priority**: Polishes the experience and prevents double-submission bugs. Lower priority because the form is functional without it, but it's required by the constitution's UX standards.

**Independent Test**: Can be tested by submitting the form and observing that the submit button changes to a loading state and fields become non-interactive until the request completes.

**Acceptance Scenarios**:

1. **Given** the visitor submits a valid form, **When** the request is in-flight, **Then** the submit button displays a loading spinner with the text "Sending..." and all three form fields are disabled.
2. **Given** the request completes (success or error), **When** the loading state ends, **Then** on success the form is cleared and the success message replaces the form; on error the fields are re-enabled and the error message is displayed above the form.

---

### Edge Cases

- What happens when the visitor enters an email exceeding 254 characters? → Rejected by client-side validation with a length error.
- What happens when the subject or body content contains only whitespace? → Treated as empty; validation error triggered.
- How does the system handle a Brevo API timeout (request hangs)? → Aborted after 10 seconds; generic error displayed; form data preserved.
- What happens if the visitor double-clicks the submit button rapidly? → Prevented by the loading state: button is disabled and fields are non-interactive during submission.
- What happens when the visitor's network connection is lost mid-submission? → The fetch promise rejects; caught by the error handler; generic error message displayed (likely a network error message like "Network error. Please check your connection.").
- What happens if the Brevo API key is revoked between deployments? → The module-level check passes at build time; at runtime, Brevo returns 401; the route handler maps this to the generic error message.
- What happens if `CONTACT_RECIPIENT_EMAIL` is missing? → Server-side validation fails with a 500 "Service unavailable" (same as missing API key).
- What happens if the request body exceeds Next.js's default body parser limit (4MB)? → Next.js returns a 413; the client displays the generic error.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an email form on the `/contact` page below the existing social links grid, with three fields: "from" (email input), "subject" (text input), and "body" (textarea).
- **FR-002**: System MUST require all three fields before allowing submission.
- **FR-003**: System MUST validate the "from" field contains a well-formed email address on the client.
- **FR-004**: System MUST enforce maximum character lengths on the client: `from` ≤ 254, `subject` ≤ 998, `body` ≤ 10,000.
- **FR-005**: System MUST treat whitespace-only field values as empty for validation purposes.
- **FR-006**: System MUST send form data to a Next.js API route handler (`app/api/contact/send/route.ts`) that invokes the Brevo v3 REST API (`POST https://api.brevo.com/v3/smtp/email`) server-side.
- **FR-007**: API route handler MUST validate all three required fields and their maximum lengths server-side, returning 400 with field-level error messages if validation fails.
- **FR-008**: API route handler MUST strip HTML tags and attribute-like patterns from subject and body before constructing the Brevo payload.
- **FR-009**: API route handler MUST construct the Brevo payload with: `sender` = `BREVO_SENDER_EMAIL` (verified sender), `to` = `CONTACT_RECIPIENT_EMAIL` (site owner), `replyTo` = visitor's "from" email, `subject` = sanitized subject, `textContent` = sanitized body.
- **FR-010**: API route handler MUST abort the Brevo request after 10 seconds and return a timeout error to the client.
- **FR-011**: API route handler MUST enforce rate limiting of 5 requests per IP per 15-minute window, returning 429 when exceeded.
- **FR-012**: System MUST display a success confirmation ("Your message has been sent. I'll get back to you soon.") to the visitor after the email is sent, replacing the form.
- **FR-013**: System MUST display a user-friendly error message when the API call fails, without leaking API keys, raw error responses, or internal stack traces.
- **FR-014**: System MUST preserve form field values when an error occurs so the visitor can retry.
- **FR-015**: System MUST show a loading state (spinner + "Sending..." text) on the submit button and disable all fields during submission to prevent duplicate sends.
- **FR-016**: The Brevo API key (`BREVO_API_KEY`), sender email (`BREVO_SENDER_EMAIL`), and recipient email (`CONTACT_RECIPIENT_EMAIL`) MUST be stored as environment variables, validated at module load time (build), and never exposed to the client.
- **FR-017**: The form MUST be implemented as a client component (`"use client"`) while the API route handler remains a server component (per RSC conventions).
- **FR-018**: The form MUST be responsive and match the existing contact page visual design (Tailwind CSS, backdrop blur cards, `var(--palette-2)` accent color, radial gradient background).
- **FR-019**: Success messages MUST persist until the user navigates away or the page is refreshed. Error messages MUST persist until the user modifies any form field.
- **FR-020**: The API route handler MUST log errors to the server console (without sensitive data) for debugging purposes.

### Key Entities

- **ContactForm**: The client-side form state. Key attributes: `from` (string, email, max 254 chars), `subject` (string, max 998 chars), `body` (string, max 10,000 chars), `status` (idle | loading | success | error), `fieldErrors` (record of field-level validation messages), `generalError` (string | null, for non-field errors like rate limiting).
- **EmailRequest**: The normalized request shape sent from client to the API route. Fields: `from`, `subject`, `body`. All plain-text strings.
- **BrevoPayload**: The server-side payload shape conforming to Brevo's `sendTransacEmail` endpoint. Includes `sender` (from env), `to` (from env), `replyTo` (from visitor), `subject`, `textContent`. Built server-side and never returned to the client.
- **RateLimitEntry**: In-memory record for rate limiting. Key attributes: `ip` (string), `count` (number), `windowStart` (timestamp). Expired entries are cleaned on each request.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can complete and submit the contact form in under 60 seconds on a standard connection.
- **SC-002**: Form validation errors appear within 200ms of field interaction (blur/submit).
- **SC-003**: Successful email delivery occurs within 5 seconds of form submission under normal Brevo API response times.
- **SC-004**: The form is fully usable on viewport widths of 320px, 768px, 1024px, and 1440px.
- **SC-005**: No Brevo API key, sender email, recipient email, or internal error details are visible in the client-side network tab, page source, or any error message.
- **SC-006**: A single visitor cannot submit more than 5 emails in a 15-minute window.

---

## Assumptions

- The Brevo account is already provisioned with a verified sender identity (configured via `BREVO_SENDER_EMAIL`).
- The site owner's recipient email address is known and configured via `CONTACT_RECIPIENT_EMAIL`.
- The existing contact page layout (social links grid) will remain above the fold and the form will be added below it as a new section.
- The Brevo v3 REST API (`https://api.brevo.com/v3/smtp/email`) is the integration endpoint, consistent with the constitution's specified stack.
- The form does not require CAPTCHA or spam protection for the initial release; rate limiting provides basic abuse prevention. CAPTCHA can be added in a future iteration.
- The site uses a single recipient (the site owner); there is no need for CC, BCC, or multiple recipients.
- The email body will be sent as plain text (`textContent`) only to keep the initial implementation simple and secure.
- Rate limiting uses an in-memory store (not Redis/persistent storage), which means limits reset on server restart and are per-instance. This is acceptable for a portfolio site's traffic profile.
- The form is a single-page experience: no navigation to a separate "thank you" page; success replaces the form in-place.
