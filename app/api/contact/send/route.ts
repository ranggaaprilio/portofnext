import { type EmailRequest, isWhitespaceOnly, isValidEmail, sanitizeText } from "@/lib/utils";

// Module-level validation — throws at build time if misconfigured
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL;
const CONTACT_RECIPIENT_EMAIL = process.env.CONTACT_RECIPIENT_EMAIL;

if (!BREVO_API_KEY || BREVO_API_KEY.trim().length === 0) {
  throw new Error("BREVO_API_KEY environment variable is missing or empty");
}
if (!BREVO_SENDER_EMAIL || BREVO_SENDER_EMAIL.trim().length === 0) {
  throw new Error("BREVO_SENDER_EMAIL environment variable is missing or empty");
}
if (!CONTACT_RECIPIENT_EMAIL || CONTACT_RECIPIENT_EMAIL.trim().length === 0) {
  throw new Error("CONTACT_RECIPIENT_EMAIL environment variable is missing or empty");
}

// -- Rate Limiting -----------------------------------------------------------

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function checkRateLimit(ip: string): boolean {
  // Clean expired entries
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitStore.delete(key);
    }
  }

  const existing = rateLimitStore.get(ip);
  if (!existing || now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return true;
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return false;
  }

  existing.count += 1;
  return true;
}

// -- Field Validation --------------------------------------------------------

function validateFields(body: EmailRequest): Record<string, string> | null {
  const errors: Record<string, string> = {};

  if (!body.from || isWhitespaceOnly(body.from)) {
    errors.from = "Email is required";
  } else if (body.from.length > 254) {
    errors.from = "Email is too long";
  } else if (!isValidEmail(body.from)) {
    errors.from = "Please enter a valid email address";
  }

  if (!body.subject || isWhitespaceOnly(body.subject)) {
    errors.subject = "Subject is required";
  } else if (body.subject.length > 998) {
    errors.subject = "Subject is too long";
  }

  if (!body.body || isWhitespaceOnly(body.body)) {
    errors.body = "Message is required";
  } else if (body.body.length > 10_000) {
    errors.body = "Message is too long";
  }

  return Object.keys(errors).length > 0 ? errors : null;
}

// -- POST Handler ------------------------------------------------------------

export async function POST(request: Request) {
  // Runtime env check (in case build-time check was bypassed)
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL || !CONTACT_RECIPIENT_EMAIL) {
    console.error("Brevo environment variables are not configured");
    return Response.json(
      { success: false, message: "Service unavailable" },
      { status: 500 },
    );
  }

  // Rate limiting
  const ip = getClientIP(request);
  if (!checkRateLimit(ip)) {
    return Response.json(
      { success: false, message: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  // Parse and validate body
  let reqBody: EmailRequest;
  try {
    reqBody = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const fieldErrors = validateFields(reqBody);
  if (fieldErrors) {
    return Response.json(
      { success: false, fieldErrors },
      { status: 400 },
    );
  }

  // Sanitize
  const sanitizedSubject = sanitizeText(reqBody.subject);
  const sanitizedBody = sanitizeText(reqBody.body);

  // Build Brevo payload
  const brevoPayload = {
    sender: { email: BREVO_SENDER_EMAIL },
    to: [{ email: CONTACT_RECIPIENT_EMAIL }],
    replyTo: { email: reqBody.from.trim() },
    subject: sanitizedSubject,
    textContent: sanitizedBody,
  };

  // Send to Brevo with 10s timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(brevoPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return Response.json({
        success: true,
        message: "Your message has been sent. I'll get back to you soon.",
      });
    }

    console.error(`Brevo API error: ${res.status} ${res.statusText}`);
    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 502 },
    );
  } catch (err: unknown) {
    clearTimeout(timeoutId);

    if (err instanceof Error && err.name === "AbortError") {
      console.error("Brevo API request timed out");
    } else if (err instanceof Error) {
      console.error(`Brevo API request failed: ${err.message}`);
    } else {
      console.error("Brevo API request failed with unknown error");
    }

    return Response.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 502 },
    );
  }
}
