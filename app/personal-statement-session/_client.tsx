"use client";

import Link from "next/link";
import { useState, type FormEvent, useEffect } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  Mail,
  MessageCircle,
  Sparkles,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

type CheckoutStatus = "success" | "cancelled" | null;

const pillars = [
  {
    title: "Insight & Reflection",
    copy: "Admissions tutors look for reflection, not a list of activities. We show you how to analyse what you learned from clinical shadowing and work experience.",
  },
  {
    title: "Structure & Cohesion",
    copy: "Ensure every paragraph links seamlessly, with strong opening hooks that avoid tired clichés like 'I have wanted to be a doctor since age 6'.",
  },
  {
    title: "Line-by-Line Polish",
    copy: "Every character counts in the UCAS limit. We cut wordiness, tighten phrasing, and make your voice sound mature, confident, and genuine.",
  },
];

export function PersonalStatementClient({
  checkoutStatus,
}: {
  checkoutStatus: CheckoutStatus;
}) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showContactFallback, setShowContactFallback] = useState(false);

  useEffect(() => {
    if (!bookingOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingCheckout) setBookingOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bookingOpen, loadingCheckout]);

  const handleCheckoutSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoadingCheckout(true);
    setCheckoutError(null);
    setShowContactFallback(false);

    try {
      const response = await fetch("/api/stripe/create-tutoring-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: "complete-bundle",
          email: bookingEmail.trim(),
          returnTo: "tutoring",
        }),
      });
      const data = (await response.json()) as {
        configured?: boolean;
        url?: string;
        error?: string;
      };

      if (response.ok && data.configured && data.url) {
        window.location.href = data.url;
        return;
      }

      setCheckoutError(
        response.ok
          ? "Online payment is temporarily unavailable. Contact us below and we will arrange your booking."
          : data.error ?? "We could not start checkout. Please try again."
      );
      setShowContactFallback(response.ok);
    } catch {
      setCheckoutError(
        "We could not connect to secure checkout. Contact us below or try again."
      );
      setShowContactFallback(true);
    } finally {
      setLoadingCheckout(false);
    }
  };

  const psWhatsappHref =
    "https://wa.me/447305422619?text=" +
    encodeURIComponent(
      "Hi Rish, I'm interested in personal statement review and support."
    );

  const psEmailHref =
    "mailto:medwithrish@gmail.com?subject=" +
    encodeURIComponent("Personal Statement Review & Support") +
    "&body=" +
    encodeURIComponent(
      "Hi Rish,\n\nI would like support with my Medicine/Dentistry personal statement.\n\nTarget course: Medicine / Dentistry\nCurrent draft status: Outline / First draft / Nearly finished\nAny specific deadlines: October 15\n\nThank you!"
    );

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7fafe] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/personal-statements-guide"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Personal Statements Guide
          </Link>

          {/* Status Banners */}
          {checkoutStatus === "success" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-bold">Your booking is confirmed!</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  We have received your payment and will email you shortly to review your personal statement draft.
                </p>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className="mt-6 rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-[#f4f8fd] p-6 shadow-sm sm:p-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              PERSONAL STATEMENT SUPPORT
            </span>

            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Turn your draft into a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                standout personal statement.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Get dedicated 1-to-1 feedback on structure, tone, and clinical reflection. We help you highlight work experience, academic drive, and genuine motivation without falling into cliché patterns.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={psWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Message Rish on WhatsApp
              </a>
              <a
                href={psEmailHref}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                <Mail className="h-3.5 w-3.5" />
                Send draft by email
              </a>
            </div>
          </section>

          {/* Three Key Areas */}
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">{p.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{p.copy}</p>
              </div>
            ))}
          </section>

          {/* Featured Options */}
          <section className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Standalone PS Review Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div>
                <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                  DEDICATED DRAFT REVIEW
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  Personal Statement Review & Consultation
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Detailed line-by-line mark-up, structural rewrite suggestions, and 1-to-1 consultation with Rish.
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <span>Comprehensive line-by-line mark-up & critique</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <span>Removal of clichés & character limit optimization</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <span>Deepening reflection on medical work experience</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                    <span>Follow-up review of your second draft</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <a
                  href={psWhatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Arrange via WhatsApp
                </a>
              </div>
            </div>

            {/* Featured Complete Admissions Package */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-600 bg-gradient-to-b from-emerald-50/40 via-white to-white p-6 shadow-md relative">
              <span className="absolute -top-3 right-4 rounded-full bg-emerald-700 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                ⭐ ALL-IN-ONE · BEST VALUE
              </span>
              <div>
                <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                  ALL-INCLUSIVE ADMISSIONS
                </span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  Complete Specialist Admissions Package
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Includes full Personal Statement support PLUS 4 hours UCAT tuition and 4 hours Med Interview coaching.
                </p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-emerald-900">£200</span>
                  <span className="text-xs text-slate-500">/ one-off payment</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-slate-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>Personal Statement: full draft review, edit & line-by-line polish</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>4 hours 1-1 UCAT Crash Course across all 4 sections</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>4 hours 1-1 Med Interview Tutoring (2 hrs technique + 2 mocks)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    <span>Priority tutor scheduling throughout your whole application</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setBookingOpen(true)}
                  className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
                >
                  Book Complete Package for £200
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-14">
          <Hero />
        </div>
      </main>

      {/* Stripe Booking Modal for Complete Package */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loadingCheckout) setBookingOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              disabled={loadingCheckout}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              <BadgeCheck className="h-3.5 w-3.5" />
              Secure Checkout
            </span>
            <h2 className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
              Complete Admissions Package (£200)
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Includes full Personal Statement review + 4 hrs UCAT + 4 hrs Med Interviews.
            </p>

            <form onSubmit={handleCheckoutSubmit} className="mt-4">
              <label htmlFor="ps-booking-email" className="text-xs font-bold text-slate-800">
                Email address
              </label>
              <input
                id="ps-booking-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={bookingEmail}
                onChange={(event) => setBookingEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/15"
              />

              {checkoutError && (
                <div role="alert" className="mt-2.5 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingCheckout}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800 disabled:opacity-60"
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting to secure checkout…
                  </>
                ) : (
                  <>
                    Continue to secure payment (£200)
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-3 text-center text-[10px] text-slate-400">
              Payments are securely encrypted and processed by Stripe.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

