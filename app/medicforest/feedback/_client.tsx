"use client";

import { useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
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
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (sending || !message.trim()) return;
    const website = new FormData(e.currentTarget as HTMLFormElement).get("website");
    setSending(true);
    setError("");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, email, website }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(result?.error || "Feedback could not be sent. Please try again.");
      }
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Feedback could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <MedicForestLandingShell>
      <div className="flex min-h-screen items-start bg-[#f7faf9] px-5 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
              <MessageSquare className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Help &amp; Support · MedicForest
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-[#0d2c2e] sm:text-5xl">
              Feedback &amp; Support
            </h1>
            <p className="mt-4 text-base leading-7 text-[#4a6568]">
              Have a question about Med interview tutoring, UCAT prep, or your MedicForest account?
              Reach out directly on Instagram or TikTok, email Rish, or send technical feedback below.
            </p>
          </div>

          {/* 3 Direct Support Channels Grid */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Instagram Option */}
            <a
              href="https://instagram.com/medwithrish_"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-pink-300 hover:shadow-xs"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-2xs transition group-hover:scale-105">
                  <FaInstagram className="h-5 w-5" />
                </div>
                <h2 className="mt-3.5 text-base font-bold text-slate-950">
                  Instagram DM
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-pink-600">
                  @medwithrish_
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Quick admissions questions, MMI tips and direct message replies.
                </p>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-pink-600 group-hover:underline">
                <span>Message on Instagram</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </a>

            {/* TikTok Option */}
            <a
              href="https://www.tiktok.com/@medwithrish"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-slate-400 hover:shadow-xs"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white shadow-2xs transition group-hover:scale-105">
                  <FaTiktok className="h-4 w-4" />
                </div>
                <h2 className="mt-3.5 text-base font-bold text-slate-950">
                  TikTok DM
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-slate-700">
                  @medwithrish
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  High-yield interview breakdowns, question walkthroughs and tips.
                </p>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 group-hover:underline">
                <span>Message on TikTok</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </a>

            {/* Email Option */}
            <a
              href="mailto:medwithrish@gmail.com"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-teal-300 hover:shadow-xs"
            >
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition group-hover:scale-105">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="mt-3.5 text-base font-bold text-slate-950">
                  Direct Email
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-teal-700">
                  medwithrish@gmail.com
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Detailed enquiries, 1-to-1 tutoring advice and account support.
                </p>
              </div>
              <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 group-hover:underline">
                <span>Send Email</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </a>
          </div>

          {submitted ? (
            <div className="rounded-2xl border border-teal-200 bg-white p-8 text-center shadow-sm">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-bold text-[#0d2c2e]">Thanks for your feedback!</h2>
              <p className="mt-3 text-sm leading-7 text-[#4a6568]">
                Your feedback has been sent directly to <strong>medwithrish@gmail.com</strong>.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="mailto:medwithrish@gmail.com"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  <Mail className="h-4 w-4" />
                  Email directly
                </a>
                <a
                  href="https://instagram.com/medwithrish_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-pink-300 hover:text-pink-600"
                >
                  <FaInstagram className="h-4 w-4" />
                  DM on Instagram
                </a>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setCategory("");
                    setMessage("");
                    setEmail("");
                    setError("");
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
              <div className="border-b border-slate-100 pb-5">
                <h2 className="text-lg font-bold text-slate-950">
                  Send platform feedback or report an issue
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Your feedback goes directly to our inbox and helps improve MedicForest.
                </p>
              </div>

              {/* Category */}
              <div className="mt-6">
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
                  Your message or feedback <span className="text-teal-700">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  maxLength={5000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what's working, what isn't, or what feature you'd love to see…"
                  className="mt-2 w-full resize-none rounded-xl border border-gray-200 bg-[#f9fdfb] px-4 py-3 text-sm leading-7 text-[#0d2c2e] placeholder-gray-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-200"
                />
              </div>

              {/* Optional email */}
              <div className="mt-5">
                <label htmlFor="replyEmail" className="block text-sm font-semibold text-[#0d2c2e]">
                  Your email{" "}
                  <span className="font-normal text-gray-400">(optional - so we can reply back)</span>
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

              <div className="sr-only" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>

              {error && (
                <p className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
                  {error}{" "}
                  <a href="mailto:medwithrish@gmail.com" className="font-bold underline">
                    Email us directly
                  </a>
                  .
                </p>
              )}

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={sending || !message.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Send className="h-4 w-4" aria-hidden="true" />
                  {sending ? "Sending feedback…" : "Send feedback"}
                </button>
                <p className="text-xs text-gray-400">
                  Or message on Instagram{" "}
                  <a
                    href="https://instagram.com/medwithrish_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-teal-700 hover:underline"
                  >
                    @medwithrish_
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </MedicForestLandingShell>
  );
}
