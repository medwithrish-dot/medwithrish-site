"use client";

import { useState } from "react";
import { CheckCircle2, Mail, MessageSquare, Send } from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

const FEEDBACK_CATEGORIES = [
  "Bug or technical issue",
  "Question bank content",
  "AI feedback quality",
  "Feature request",
  "General feedback",
  "Other",
];

export function FeedbackPageClient() {
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    const subject = encodeURIComponent(
      `[MedicForest Feedback] ${category || "General"}`
    );
    const body = encodeURIComponent(
      `Category: ${category || "Not specified"}\n\nMessage:\n${message}\n\nReply to: ${email || "not provided"}`
    );
    window.location.href = `mailto:medwithrish@gmail.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 800);
  }

  return (
    <MedicForestLandingShell>
      <div className="flex min-h-screen items-start bg-[#f7faf9] px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Help shape MedicForest
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight text-[#0d2c2e] sm:text-5xl">
              Share your feedback
            </h1>
            <p className="mt-4 text-base leading-7 text-[#4a6568]">
              Whether it&apos;s a bug, a feature idea, or a general thought — we read everything.
              Your feedback directly influences what we build next.
            </p>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-sm">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-[#0d2c2e]">Thanks for your feedback!</h2>
              <p className="mt-3 text-sm leading-7 text-[#4a6568]">
                Your email client should have opened with your message pre-filled and addressed to{" "}
                <strong>medwithrish@gmail.com</strong>. If it didn&apos;t open, you can email us
                directly.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <a
                  href="mailto:medwithrish@gmail.com"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  <Mail className="h-4 w-4" />
                  Email directly
                </a>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setCategory("");
                    setMessage("");
                    setEmail("");
                  }}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-700 transition hover:border-teal-300 hover:text-teal-700"
                >
                  Send another
                </button>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-10"
            >
              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-[#0d2c2e]">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-[#f9fdfb] px-4 py-3 text-sm text-[#0d2c2e] focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                >
                  <option value="">Select a category…</option>
                  {FEEDBACK_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div className="mt-5">
                <label htmlFor="message" className="block text-sm font-semibold text-[#0d2c2e]">
                  Your feedback <span className="text-teal-700">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's working, what isn't, or what you'd love to see…"
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-[#f9fdfb] px-4 py-3 text-sm leading-7 text-[#0d2c2e] placeholder-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>

              {/* Optional email */}
              <div className="mt-5">
                <label htmlFor="replyEmail" className="block text-sm font-semibold text-[#0d2c2e]">
                  Your email{" "}
                  <span className="font-normal text-gray-400">(optional — so we can reply)</span>
                </label>
                <input
                  id="replyEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-xl border border-gray-200 bg-[#f9fdfb] px-4 py-3 text-sm text-[#0d2c2e] placeholder-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {sending ? "Opening email…" : "Send feedback"}
                </button>
                <p className="text-xs text-gray-400">
                  Or email us at{" "}
                  <a
                    href="mailto:medwithrish@gmail.com"
                    className="font-semibold text-teal-700 hover:underline"
                  >
                    medwithrish@gmail.com
                  </a>
                </p>
              </div>
            </form>
          )}

          {/* Direct contact card */}
          <div className="mt-6 flex items-center gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
              <Mail className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#0d2c2e]">Contact MedWithRish directly</p>
              <a
                href="mailto:medwithrish@gmail.com"
                className="text-sm font-bold text-teal-700 hover:underline"
              >
                medwithrish@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </MedicForestLandingShell>
  );
}
