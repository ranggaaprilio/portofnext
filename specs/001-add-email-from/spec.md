# Feature Specification: Contact Page Email Form via Brevo API

**Feature Branch**: `001-add-email-from`

**Created**: 2025-07-15

**Status**: Draft

**Input**: User description: "add email form in contact page using brevo api ,field from ,subject, and body are required"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit Contact Email (Priority: P1)

A site visitor fills out the contact form on the `/contact` page with their email address ("from"), a subject line, and a message body, then submits the form. The system sends the email via the Brevo API and confirms successful delivery to the visitor.

**Why this priority**: This is the core feature — delivering the email from the visitor to the site owner. Without this, the feature has no value.

**Independent Test**: Can be fully tested by filling in all three required fields and submitting the form, then verifying the email arrives at the owner's inbox via Brevo. Delivers the fundamental value of enabling visitors to contact the site owner.

**Acceptance Scenarios**:

1. **Given** a visitor is on the contact page with all three fields (from, subject, body) filled in, **When** they submit the form, **Then** the email is sent via Brevo API and a success message is displayed to the visitor.
2. **Given** a visitor submits the form, **When** the Brevo API responds successfully (HTTP 2xx), **Then** the form is cleared and a confirmation message appears.

---

### User Story 2 - Client-Side Validation (Priority: P1)

The form prevents submission when any required field is missing or the email format is invalid, providing immediate feedback to the visitor before any API call is made.

**Why this priority**: Prevents unnecessary API calls and gives users instant corrective feedback. Essential for a polished user experience and aligns with the constitution's UX standards.

**Independent Test**: Can be tested by attempting to submit the form with empty fields or an invalid email address and verifying inline error messages appear without making any network request.

**Acceptance Scenarios**:

1. **Given** the visitor leaves the "from" field empty, **When** they attempt to submit, **Then** a validation error indicates the email is required.
2. **Given** the visitor enters an invalid email format (e.g., "notanemail"), **When** they blur the field or submit, **Then** a validation error indicates a valid email is required.
3. **Given** the visitor leaves the subject field empty, **When** they attempt to submit, **Then** a validation error indicates the subject is required.
4. **Given** the visitor leaves the body field empty, **When** they attempt to submit, **Then** a validation error indicates the message body is required.

---

### User Story 3 - Server-Side Error Handling (Priority: P2)

When the Brevo API call fails (network error, rate limiting, invalid API key, etc.), the system displays a user-friendly error message and allows the visitor to retry without losing their form data.

**Why this priority**: Ensures resilience. While Brevo outages are rare, a broken form with no feedback would reflect poorly on the portfolio.

**Independent Test**: Can be tested by temporarily misconfiguring the Brevo API key and verifying that submitting the form shows a clear error message while preserving the entered data.

**Acceptance Scenarios**:

1. **Given** the Brevo API returns an error (4xx/5xx), **When** a visitor submits the form, **Then** a generic error message is displayed (without exposing API internals) and the form data is preserved for retry.
2. **Given** the API route receives a request with missing fields (bypassing client validation), **When** processed, **Then** a 400 response with specific field-level errors is returned.

---

### User Story 4 - Submission Loading State (Priority: P3)

While the email is being sent, the submit button shows a loading indicator and all form fields are disabled to prevent duplicate submissions.

**Why this priority**: Polishes the experience and prevents double-submission bugs. Lower priority because the form is functional without it, but it's required by the constitution's UX standards.

**Independent Test**: Can be tested by submitting the form and observing that the submit button changes to a loading state and fields become non-interactive until the request completes.

**Acceptance Scenarios**:

1. **Given** the visitor submits a valid form, **When** the request is in-flight, **Then** the submit button displays a loading spinner and all fields are disabled.
2. **Given** the request completes (success or error), **When** the loading state ends, **Then** fields are re-enabled or the form is reset (on success).

---

### Edge Cases

- What happens when the visitor enters an email exceeding 254 characters (the maximum valid email length)?
- What happens when the subject or body content contains only whitespace?
- How does the system handle a Brevo API timeout (request hangs)?
- What happens if the visitor double-clicks the submit button rapidly?
- What happens when the visitor's network connection is lost mid-submission?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display an email form on the `/contact` page with three fields: "from" (email), "subject" (text), and "body" (textarea).
- **FR-002**: System MUST require all three fields before allowing submission.
- **FR-003**: System MUST validate the "from" field contains a well-formed email address on the client.
- **FR-004**: System MUST send form data to a Next.js API route handler (`app/api/`) that invokes the Brevo v3 REST API server-side.
- **FR-005**: API route handler MUST validate all three required fields server-side and return 400 with descriptive errors if validation fails.
- **FR-006**: API route handler MUST construct the Brevo transactional email payload using the authenticated user's verified sender identity and the site owner as the recipient.
- **FR-007**: API route handler MUST sanitize inputs before forwarding to Brevo (strip HTML/scripts from subject and body to prevent injection).
- **FR-008**: System MUST display a success confirmation to the visitor after the email is sent.
- **FR-009**: System MUST display a user-friendly error message when the API call fails, without leaking API keys, raw error responses, or internal stack traces.
- **FR-010**: System MUST preserve form field values when an error occurs so the visitor can retry.
- **FR-011**: System MUST show a loading state on the submit button and disable all fields during submission to prevent duplicate sends.
- **FR-012**: The Brevo API key (`BREVO_API_KEY`) MUST be stored as an environment variable, validated at startup, and never exposed to the client.
- **FR-013**: The form MUST be implemented as a client component (`"use client"`) while the API route handler remains a server component (per RSC conventions).
- **FR-014**: The form MUST be responsive and match the existing contact page visual design (Tailwind CSS, backdrop blur cards, brand color palette).

### Key Entities

- **ContactForm**: The client-side form state. Key attributes: `from` (string, email), `subject` (string), `body` (string), `status` (idle | loading | success | error), `fieldErrors` (record of field-level validation messages).
- **EmailRequest**: The normalized request shape sent from client to the API route. Fields: `from`, `subject`, `body`.
- **BrevoPayload**: The server-side payload shape conforming to Brevo's `sendTransacEmail` endpoint. Includes `sender`, `to`, `subject`, `htmlContent`/`textContent`. Built server-side and never returned to the client.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor can complete and submit the contact form in under 60 seconds on a standard connection.
- **SC-002**: Form validation errors appear within 200ms of field interaction (blur/submit).
- **SC-003**: Successful email delivery occurs within 5 seconds of form submission under normal Brevo API response times.
- **SC-004**: The form is fully usable on viewport widths of 320px, 768px, 1024px, and 1440px.
- **SC-005**: No Brevo API key or internal error details are visible in the client-side network tab, page source, or any error message.

## Assumptions

- The Brevo account is already provisioned with a verified sender identity (the "from" address used as the sender in the Brevo payload).
- The site owner's recipient email address is known and will be configured via environment variable (`CONTACT_RECIPIENT_EMAIL`).
- The existing contact page layout (social links grid) will remain and the form will be added below it as a new section.
- The Brevo v3 REST API (`https://api.brevo.com/v3/smtp/email`) is the integration endpoint, consistent with the constitution's specified stack.
- The form does not require CAPTCHA or spam protection for the initial release; this can be added in a future iteration.
- The site uses a single recipient (the site owner); there is no need for CC, BCC, or multiple recipients.
- The email body will be sent as plain text (`textContent`) to keep the initial implementation simple.
