import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// -- Shared Types ------------------------------------------------------------

export interface EmailRequest {
  from: string;
  subject: string;
  body: string;
}

export interface FieldErrors {
  from?: string;
  subject?: string;
  body?: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  fieldErrors?: FieldErrors;
}

// -- Validation --------------------------------------------------------------

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;
  return EMAIL_REGEX.test(email);
}

// -- Sanitization ------------------------------------------------------------

const HTML_TAG_RE = /<[^>]*>/g;
const ATTR_PATTERN_RE = /\bon\w+\s*=\s*"[^"]*"/gi;

export function sanitizeText(text: string): string {
  return text.replace(HTML_TAG_RE, "").replace(ATTR_PATTERN_RE, "").trim();
}

// -- Whitespace check --------------------------------------------------------

export function isWhitespaceOnly(value: string): boolean {
  return value.trim().length === 0;
}
