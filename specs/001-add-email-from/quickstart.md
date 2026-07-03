# Quickstart: Contact Page Email Form via Brevo API

**Feature**: 001-add-email-from | **Phase**: 1 — Design | **Date**: 2025-07-15

## Prerequisites

- **Node.js**: v21.x (per `.nvmrc` / `package.json` `nodeVersion`)
- **pnpm**: 9.x (per `packageManager` field)
- **Brevo account**: A verified sender identity configured in your Brevo dashboard
- **Environment variables** (add to `.env.local` — do NOT commit):

```bash
BREVO_API_KEY="xkeysib-..."           # Brevo v3 API key
BREVO_SENDER_EMAIL="hello@yourdomain.com"  # Must be a verified Brevo sender
CONTACT_RECIPIENT_EMAIL="you@yourdomain.com"  # Where contact emails are delivered
```

- **Dependencies installed**: `pnpm install`
- **Dev server running**: `pnpm dev` (listens on `http://localhost:3000`)

---

## Step-by-Step Verification

### 1. Verify API Route Exists and Loads

```bash
# The route file must exist
ls -la app/api/contact/send/route.ts
```

### 2. Verify Environment Variables are Validated at Build

```bash
# Temporarily unset BREVO_API_KEY and check build output
# (re-set it after verification — this test confirms the module-level assertion fires)
BREVO_API_KEY="" pnpm build 2>&1 | grep -i "BREVO_API_KEY"
```

**Expected**: The build should fail or log a clear error about `BREVO_API_KEY` being required. Re-run with the correct env vars set: `pnpm build`.

### 3. API: Happy Path via curl

```bash
# Submit a valid contact form payload
curl -X POST http://localhost:3000/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "visitor@example.com",
    "subject": "Hello from the contact form",
    "body": "I would like to discuss a project opportunity."
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected**: HTTP 200, response body `{"success":true}`. The site owner receives an email at `CONTACT_RECIPIENT_EMAIL` with the visitor's email set as the reply-to address.

### 4. API: Validation Error (Missing Fields)

```bash
# Submit with empty body — should get 400 with field-level errors
curl -X POST http://localhost:3000/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{"from": "visitor@example.com", "subject": "Hi", "body": ""}' \
  -w "\nHTTP Status: %{http_code}\n" | python3 -m json.tool
```

**Expected**: HTTP 400, response body:
```json
{
  "success": false,
  "error": "Validation failed",
  "fieldErrors": {
    "body": "Message is required"
  }
}
```

Repeat for missing `from` and missing `subject`, verifying each produces the correct field-level error.

### 5. API: Validation Error (Whitespace-Only)

```bash
curl -X POST http://localhost:3000/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{"from": "visitor@example.com", "subject": "   ", "body": "Valid body"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected**: HTTP 400 with `fieldErrors.subject: "Subject is required"`.

### 6. API: Validation Error (Invalid Email)

```bash
curl -X POST http://localhost:3000/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{"from": "notanemail", "subject": "Hi", "body": "Valid body"}' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected**: HTTP 400 with `fieldErrors.from: "Please enter a valid email address"`.

### 7. API: Validation Error (Overlong Fields)

```bash
# Subject > 998 chars
LONG_SUBJECT=$(python3 -c "print('x' * 999)")
curl -X POST http://localhost:3000/api/contact/send \
  -H "Content-Type: application/json" \
  -d "{\"from\": \"v@e.com\", \"subject\": \"$LONG_SUBJECT\", \"body\": \"Hi\"}" \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected**: HTTP 400 with `fieldErrors.subject`.

### 8. API: Rate Limiting

```bash
# Send 6 rapid requests from the same IP (localhost)
for i in $(seq 1 6); do
  echo -n "Request $i: "
  curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3000/api/contact/send \
    -H "Content-Type: application/json" \
    -d '{"from": "v@e.com", "subject": "Test", "body": "Test body"}'
  echo ""
done
```

**Expected**: First 5 return 200 (or 400 if validation is strict). The 6th returns HTTP 429 with:
```json
{"success": false, "error": "Too many requests. Please try again later."}
```

### 9. API: HTML Sanitization

```bash
curl -X POST http://localhost:3000/api/contact/send \
  -H "Content-Type: application/json" \
  -d '{
    "from": "visitor@example.com",
    "subject": "<script>alert(\"xss\")</script>Safe Subject",
    "body": "<b>bold</b> <img src=x onerror=alert(1)> Plain text only"
  }' \
  -w "\nHTTP Status: %{http_code}\n"
```

**Expected**: HTTP 200. The email delivered to the site owner contains only "Safe Subject" as the subject and " Plain text only" as the body (or equivalent stripped output). No HTML tags or event handlers are present. Verify by inspecting the Brevo transactional email log or the received email.

### 10. API: Missing Environment Variables

```bash
# Temporarily run with BREVO_API_KEY unset
# (start a separate dev instance or test the build behavior)
BREVO_API_KEY="" node -e "
  // Simulate module load check
  if (!process.env.BREVO_API_KEY) {
    console.error('FATAL: BREVO_API_KEY is not set');
    process.exit(1);
  }
"
```

**Expected**: Process exits with code 1 and logs "FATAL: BREVO_API_KEY is not set".

### 11. Browser: Client-Side Validation

1. Open `http://localhost:3000/contact` in a browser (Chrome or Firefox).
2. Locate the contact form below the social links grid.
3. Click the submit button without filling any fields.
   - **Expected**: Inline errors appear under each field: "Email is required", "Subject is required", "Message is required".
4. Type `notanemail` in the email field and tab away (blur).
   - **Expected**: "Please enter a valid email address" appears.
5. Type an email longer than 254 characters.
   - **Expected**: Length error appears.
6. Fill in only whitespace in the subject field and submit.
   - **Expected**: "Subject is required" (same as empty).
7. Correct all errors and submit a valid form.
   - **Expected**: Submit button shows spinner + "Sending...", all fields are disabled.
   - **Expected (success)**: Form is replaced by "Your message has been sent. I'll get back to you soon."
   - **Expected (error, if Brevo is down)**: Error message appears above the form, fields re-enable with preserved values.

### 12. Browser: Responsive Design

1. Open Chrome DevTools and test at viewport widths: **320px**, **768px**, **1024px**, **1440px**.
2. At each breakpoint, verify:
   - The form is fully visible without horizontal scroll.
   - Labels/inputs stack vertically on mobile (320px) and sit comfortably on desktop (1024px+).
   - The submit button is tappable (minimum 44×44px touch target on mobile).
   - The form card uses backdrop blur and matches the visual style of the social links grid above it.

### 13. Browser: Success Message Persistence

1. Submit a valid form (success case).
2. **Expected**: Success message remains visible. Scrolling, resizing, or interacting with other page elements does not dismiss it.
3. Navigate away and back to `/contact`.
   - **Expected**: The form is visible again (fresh page load resets state).

### 14. Browser: Error Dismissal on Field Modification

1. Trigger an error (e.g., submit with empty fields or use a bad Brevo API key).
2. **Expected**: Error message is displayed above the form.
3. Type in any field.
   - **Expected**: Error message and field-level errors are cleared immediately on the first keystroke.

---

## Data Flow Verification

Refer to the [data model](./data-model.md) for entity definitions and [API contract](./contracts/api-send-contact.json) for the full request/response schema.

```
Browser (form.tsx)                    Server (route.ts)                   Brevo API
     │                                     │                                │
     │  POST /api/contact/send             │                                │
     │  { from, subject, body }            │                                │
     │ ──────────────────────────────────▶ │                                │
     │                                     │  validate fields (400 if bad)  │
     │                                     │  check rate limit (429 if hit) │
     │                                     │  assert env vars (500 if miss) │
     │                                     │  sanitize HTML                 │
     │                                     │                                │
     │                                     │  POST /v3/smtp/email           │
     │                                     │  { sender, to, replyTo,        │
     │                                     │    subject, textContent }       │
     │                                     │ ──────────────────────────────▶│
     │                                     │                                │
     │                                     │  ◀── HTTP 201 (or error) ──────│
     │                                     │                                │
     │  ◀── { success: true/false } ───── │                                │
     │                                     │                                │
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `curl` returns 500 "Service unavailable" | Missing env var | Verify `.env.local` has all three `BREVO_*` / `CONTACT_*` vars |
| Brevo returns 401 | Invalid or revoked API key | Regenerate the key in Brevo dashboard and update `.env.local` |
| Brevo returns 403 | `BREVO_SENDER_EMAIL` is not verified | Verify the sender email in Brevo dashboard (Settings → Senders) |
| Rate limiting doesn't trigger | In-memory store resets on hot reload | Use `pnpm build && pnpm start` for production-mode testing instead of `pnpm dev` |
| Form doesn't appear on `/contact` | Component not composed into page | Verify `app/contact/page.tsx` imports and renders `ContactForm` below `Contact` |
