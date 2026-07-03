"use client";

import { useState } from "react";
import {
  type ApiResponse,
  type EmailRequest,
  type FieldErrors,
  isValidEmail,
} from "@/lib/utils";

interface ContactFormState {
  from: string;
  subject: string;
  body: string;
  status: "idle" | "loading" | "success" | "error";
  fieldErrors: FieldErrors;
  generalError: string | null;
}

const MAX_FROM = 254;
const MAX_SUBJECT = 998;
const MAX_BODY = 10_000;

function validateField(
  name: keyof EmailRequest,
  value: string,
): string | undefined {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    const labels: Record<keyof EmailRequest, string> = {
      from: "Email",
      subject: "Subject",
      body: "Message",
    };
    return `${labels[name]} is required`;
  }

  if (name === "from") {
    if (value.length > MAX_FROM) return "Email is too long";
    if (!isValidEmail(value)) return "Please enter a valid email address";
  }

  if (name === "subject" && value.length > MAX_SUBJECT) {
    return "Subject is too long";
  }

  if (name === "body" && value.length > MAX_BODY) {
    return "Message is too long";
  }

  return undefined;
}

function validateAll(state: ContactFormState): FieldErrors {
  const errors: FieldErrors = {};
  const fromErr = validateField("from", state.from);
  if (fromErr) errors.from = fromErr;
  const subjectErr = validateField("subject", state.subject);
  if (subjectErr) errors.subject = subjectErr;
  const bodyErr = validateField("body", state.body);
  if (bodyErr) errors.body = bodyErr;
  return errors;
}

const Spinner = () => (
  <svg
    className="mr-2 h-5 w-5 animate-spin text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export default function ContactForm() {
  const [state, setState] = useState<ContactFormState>({
    from: "",
    subject: "",
    body: "",
    status: "idle",
    fieldErrors: {},
    generalError: null,
  });

  const setField = (name: keyof EmailRequest, value: string) => {
    setState((prev) => ({
      ...prev,
      [name]: value,
      // Clear field-level error when user modifies the field
      fieldErrors: prev.fieldErrors[name]
        ? { ...prev.fieldErrors, [name]: undefined }
        : prev.fieldErrors,
      // Clear general error on any modification
      generalError: null,
      // Reset to idle if was in error state
      status: prev.status === "error" ? "idle" : prev.status,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    const errors = validateAll(state);
    if (Object.keys(errors).length > 0) {
      setState((prev) => ({ ...prev, fieldErrors: errors }));
      return;
    }

    setState((prev) => ({ ...prev, status: "loading", fieldErrors: {}, generalError: null }));

    try {
      const res = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: state.from.trim(),
          subject: state.subject.trim(),
          body: state.body,
        }),
      });

      const data: ApiResponse = await res.json();

      if (data.success) {
        setState({
          from: "",
          subject: "",
          body: "",
          status: "success",
          fieldErrors: {},
          generalError: null,
        });
      } else if (res.status === 400 && data.fieldErrors) {
        setState((prev) => ({
          ...prev,
          status: "error",
          fieldErrors: data.fieldErrors || {},
          generalError: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          status: "error",
          generalError: data.message || "Something went wrong. Please try again.",
        }));
      }
    } catch {
      setState((prev) => ({
        ...prev,
        status: "error",
        generalError: "Network error. Please check your connection.",
      }));
    }
  };

  const isDisabled = state.status === "loading";

  if (state.status === "success") {
    return (
      <section className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-28 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--palette-2)]/15 text-[var(--palette-2)]">
            <svg
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white">Message Sent!</h3>
          <p className="mt-3 text-base leading-relaxed text-gray-300">
            Your message has been sent. I&apos;ll get back to you soon.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 mx-auto w-full max-w-2xl px-6 pb-28">
      <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur sm:p-10">
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.35em] text-[var(--palette-2)]">
          Get in Touch
        </p>
        <h2 className="mb-8 text-3xl font-bold tracking-tight text-white">
          Send a Message
        </h2>

        {state.generalError && (
          <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-3 text-sm text-red-300">
            {state.generalError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* From field */}
          <div>
            <label
              htmlFor="contact-from"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Email
            </label>
            <input
              id="contact-from"
              type="email"
              value={state.from}
              onChange={(e) => setField("from", e.target.value)}
              disabled={isDisabled}
              maxLength={MAX_FROM + 10}
              placeholder="Your Body Email"
              className={`w-full rounded-2xl border bg-black/30 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--palette-2)]/70 ${
                state.fieldErrors.from
                  ? "border-red-500/70"
                  : "border-white/10"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            />
            {state.fieldErrors.from && (
              <p className="mt-1.5 text-sm text-red-400">
                {state.fieldErrors.from}
              </p>
            )}
          </div>

          {/* Subject field */}
          <div>
            <label
              htmlFor="contact-subject"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Subject
            </label>
            <input
              id="contact-subject"
              type="text"
              value={state.subject}
              onChange={(e) => setField("subject", e.target.value)}
              disabled={isDisabled}
              maxLength={MAX_SUBJECT + 10}
              placeholder="What's this about?"
              className={`w-full rounded-2xl border bg-black/30 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--palette-2)]/70 ${
                state.fieldErrors.subject
                  ? "border-red-500/70"
                  : "border-white/10"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            />
            {state.fieldErrors.subject && (
              <p className="mt-1.5 text-sm text-red-400">
                {state.fieldErrors.subject}
              </p>
            )}
          </div>

          {/* Body field */}
          <div>
            <label
              htmlFor="contact-body"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              Message
            </label>
            <textarea
              id="contact-body"
              rows={5}
              value={state.body}
              onChange={(e) => setField("body", e.target.value)}
              disabled={isDisabled}
              maxLength={MAX_BODY + 100}
              placeholder="Your message..."
              className={`w-full resize-y rounded-2xl border bg-black/30 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--palette-2)]/70 ${
                state.fieldErrors.body
                  ? "border-red-500/70"
                  : "border-white/10"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            />
            {state.fieldErrors.body && (
              <p className="mt-1.5 text-sm text-red-400">
                {state.fieldErrors.body}
              </p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isDisabled}
            className="flex w-full items-center justify-center rounded-2xl bg-[var(--palette-2)] px-6 py-3.5 text-base font-semibold text-white shadow-lg transition duration-300 hover:scale-[1.02] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--palette-2)]/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDisabled ? (
              <>
                <Spinner />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
