# Data Model: Contact Page Email Form via Brevo API

**Feature**: 001-add-email-from | **Phase**: 1 — Design | **Date**: 2025-07-15

## Entities

### 1. ContactFormState (Client-Side)

The form's entire UI state, managed via React `useState` in the client component.

```typescript
interface ContactFormState {
  /** The visitor's email address. Max 254 chars per RFC 5321. */
  from: string;
  /** Email subject line. Max 998 chars. */
  subject: string;
  /** Plain-text message body. Max 10,000 chars. */
  body: string;
  /** Current submission lifecycle state. */
  status: "idle" | "loading" | "success" | "error";
  /** Per-field validation error messages. Keyed by field name. */
  fieldErrors: Partial<Record<"from" | "subject" | "body", string>>;
  /** Non-field error message (e.g., rate limiting, network error, server error). */
  generalError: string | null;
}
```

**Initial State**:
```typescript
const INITIAL_STATE: ContactFormState = {
  from: "",
  subject: "",
  body: "",
  status: "idle",
  fieldErrors: {},
  generalError: null,
};
```

**Validation Rules** (applied client-side and server-side):

| Field | Rule | Error Message |
|-------|------|---------------|
| `from` | Required (non-empty, non-whitespace) | "Email is required" |
| `from` | Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (basic email regex) | "Please enter a valid email address" |
| `from` | Max 254 characters | "Email must be 254 characters or fewer" |
| `subject` | Required (non-empty, non-whitespace) | "Subject is required" |
| `subject` | Max 998 characters | "Subject must be 998 characters or fewer" |
| `body` | Required (non-empty, non-whitespace) | "Message is required" |
| `body` | Max 10,000 characters | "Message must be 10,000 characters or fewer" |

**Whitespace handling**: `value.trim() === ""` is treated as empty. All whitespace characters (spaces, tabs, newlines) are stripped before the emptiness check per spec C7.

---

### 2. EmailRequest (Client → Server)

The normalized JSON payload sent from the client to the API route. Only three fields; no metadata or timestamps are sent by the client.

```typescript
interface EmailRequest {
  from: string;
  subject: string;
  body: string;
}
```

**Constraints**: Same field-level validation rules as `ContactFormState` are applied server-side. The server MUST NOT trust that the client has already validated.

---

### 3. BrevoPayload (Server → Brevo API)

Constructed server-side and never returned to the client. Conforms to Brevo's `sendTransacEmail` schema.

```typescript
interface BrevoPayload {
  sender: {
    name: string;   // Extracted from BREVO_SENDER_EMAIL local part, or hardcoded brand name
    email: string;  // BREVO_SENDER_EMAIL (verified sender)
  };
  to: Array<{
    email: string;  // CONTACT_RECIPIENT_EMAIL (site owner)
  }>;
  replyTo: {
    email: string;  // Visitor's "from" email (sanitized)
  };
  subject: string;      // Sanitized subject (HTML stripped)
  textContent: string;  // Sanitized body (HTML stripped, plain text only)
}
```

**Sanitization rules** (applied to `subject` and `textContent` before insertion):
1. Strip all text matching `<[^>]*>` (HTML tags).
2. Strip attribute-like patterns: `on\w+\s*=\s*["'][^"']*["']`, `href\s*=\s*["']javascript:[^"']*["']`.
3. The result is plain text safe for `textContent`.

---

### 4. ApiResponse (Server → Client)

The normalized JSON response shape returned by the API route handler.

```typescript
type ApiResponse =
  | ApiSuccessResponse
  | ApiErrorResponse;

interface ApiSuccessResponse {
  success: true;
}

interface ApiErrorResponse {
  success: false;
  error: string;                          // Human-readable message for the client
  fieldErrors?: Record<string, string>;   // Present for 400 validation errors
}
```

**HTTP Status Codes**:

| Status | Condition | `success` | `error` | `fieldErrors` |
|--------|-----------|-----------|---------|---------------|
| 200 | Email sent via Brevo | `true` | — | — |
| 400 | Missing/invalid fields | `false` | "Validation failed" | `{ field: "message" }` |
| 429 | Rate limit exceeded | `false` | "Too many requests. Please try again later." | — |
| 500 | Brevo API error, timeout, missing env vars | `false` | "Something went wrong. Please try again." or "Service unavailable" | — |

**Security constraint**: The `error` string in 500 responses MUST be generic — never include raw Brevo error details, stack traces, or environment variable names.

---

### 5. RateLimitEntry (In-Memory Store)

```typescript
interface RateLimitEntry {
  count: number;          // Number of requests in the current window
  windowStart: number;    // Epoch ms when the current 15-minute window started
}

// Stored in:
// const rateLimitStore: Map<string, RateLimitEntry> = new Map();
// Keyed by client IP (derived from x-forwarded-for header).
```

**Behavior**:
- On each request: if `Date.now() - entry.windowStart > 15 * 60 * 1000`, reset `count` to 1 and `windowStart` to now.
- If `entry.count >= 5` within the window, return 429.
- Otherwise, increment `entry.count`.
- Expired entries (window older than 15 minutes) are cleaned on each request via iteration and `Map.delete()`.

---

## State Transitions

### Client-Side Form Status

```
┌──────────────────────────────────────────────────┐
│                    idle                           │
│  (form visible, empty or user is filling in)     │
└──────┬────────────────────────────┬──────────────┘
       │ submit (valid)             │ submit (invalid)
       ▼                            ▼
┌──────────────┐           ┌────────────────────┐
│   loading    │           │  idle (fieldErrors │
│ (fields      │           │   displayed)       │
│  disabled)   │           └────────────────────┘
└──┬───────┬───┘
   │       │
   │ fetch resolves (2xx)       fetch rejects or non-2xx
   ▼                            ▼
┌──────────────┐       ┌──────────────────────────┐
│   success    │       │         error             │
│ (form hidden,│       │ (generalError displayed,  │
│  message     │       │  fields re-enabled,       │
│  displayed)  │       │  values preserved)        │
└──────────────┘       └─────────┬────────────────┘
                                 │ user modifies any field
                                 ▼
                        ┌──────────────┐
                        │     idle      │
                        │ (error cleared│
                        │  on change)   │
                        └──────────────┘
```

**Transition rules**:
1. `idle` → `loading`: Only when `fieldErrors` is empty (all client-side validation passes).
2. `loading` → `success`: When fetch returns HTTP 200 with `{ success: true }`. Form clears to `INITIAL_STATE` with status `"success"`.
3. `loading` → `error`: When fetch rejects (network error), returns non-2xx, or times out. `generalError` is set. `from`, `subject`, `body` values are preserved.
4. `error` → `idle`: When user types in any field (via `onChange`), `fieldErrors` and `generalError` are cleared.
5. `loading` → (any): Double-submit is impossible because fields are disabled and status is checked before calling fetch.

---

## Relationships

```
┌─────────────────────┐       POST /api/contact/send      ┌──────────────────────┐
│  ContactFormState   │ ──────────────────────────────────▶│  API Route Handler   │
│  (client component) │                                     │  (server-side)       │
│                     │◀────────────────────────────────── │                      │
│  app/_components/   │       ApiResponse (JSON)           │  app/api/contact/    │
│  contact/form.tsx   │                                     │  send/route.ts       │
└─────────────────────┘                                     └──────────┬───────────┘
                                                                       │
                                                                       │ POST /v3/smtp/email
                                                                       │ (native fetch, 10s timeout)
                                                                       ▼
                                                            ┌──────────────────────┐
                                                            │   Brevo v3 REST API  │
                                                            │   api.brevo.com      │
                                                            └──────────────────────┘
```

**Key invariants**:
- The Brevo API key and recipient email are never serialized in any response to the client.
- The client never constructs a `BrevoPayload` — only the server does.
- The `EmailRequest` sent by the client is a subset of `ContactFormState` (only the three data fields, no UI state).
