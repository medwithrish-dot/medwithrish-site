"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Crown,
  HelpCircle,
  Loader2,
  Mail,
  MessageCircle,
  Mic2,
  Quote,
  School,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

type InterviewTier = "specialist" | "rish" | "complete-bundle";
type CheckoutStatus = "success" | "cancelled" | null;

interface InterviewPackage {
  id: "interview-specialist" | "interview-rish" | "complete-bundle";
  name: string;
  shortLabel: string;
  badge?: string;
  price: number;
  tutor: string;
  durationLabel: string;
  description: string;
  features: string[];
}

const packages: Record<InterviewTier, InterviewPackage> = {
  specialist: {
    id: "interview-specialist",
    name: "1-1 Interview Coaching with Specialist",
    shortLabel: "Specialist",
    price: 100,
    tutor: "Experienced MedicForest Med Interview Tutor",
    durationLabel: "4 hours total · arranged around you",
    description:
      "Structured 1-to-1 coaching covering core answer structures and realistic mock simulations.",
    features: [
      "2 hours on answer structure, ethics, NHS hot topics and delivery",
      "2 full realistic mock interviews (MMI and panel formats)",
      "Detailed verbal and written feedback after each mock",
      "University-specific station preparation and scoring criteria",
      "Flexible weekday and weekend scheduling around your interview dates",
    ],
  },
  rish: {
    id: "interview-rish",
    name: "1-1 Interview Coaching with MedWithRish",
    shortLabel: "Rishoo",
    badge: "DIRECT WITH RISHOO",
    price: 140,
    tutor: "Direct 1-to-1 with @medwithrish",
    durationLabel: "4 hours total · arranged around you",
    description:
      "Direct personal coaching with Rishoo from foundational structure to your final university mock interviews.",
    features: [
      "4 hours direct 1-to-1 coaching with Rishoo (@medwithrish)",
      "2 hours on answer structure, ethical reasoning and confident delivery",
      "2 full realistic mock interviews with university-specific stations",
      "Actionable feedback breakdown and personalized question priorities",
      "Direct follow-up messaging and advice between sessions",
    ],
  },
  "complete-bundle": {
    id: "complete-bundle",
    name: "Complete Specialist Admissions Package",
    shortLabel: "Complete Package",
    badge: "⭐ MOST POPULAR · ALL-IN-ONE",
    price: 200,
    tutor: "MedicForest Admissions Specialist",
    durationLabel: "All-inclusive: 8 hrs tuition + PS review",
    description:
      "Comprehensive end-to-end guidance across UCAT, Personal Statement and Interview coaching with an experienced MedicForest Specialist.",
    features: [
      "4 hours 1-1 UCAT Crash Course across all 4 core subtests (VR, DM, QR, SJT)",
      "Personal Statement complete support: draft review, editing and line-by-line polish",
      "4 hours 1-1 Med Interview Tutoring (2 hrs technique mastery + 2 full realistic mocks)",
      "Detailed written feedback scorecard after each interview mock",
      "University shortlisting strategy and application guidance",
      "Priority tutor scheduling throughout your entire application cycle",
    ],
  },
};

const interviewFormats = [
  {
    icon: Mic2,
    title: "MMI practice",
    copy: "Timed stations, follow-up questions and realistic transitions between ethical dilemmas, data interpretation and motivation questions.",
  },
  {
    icon: UsersRound,
    title: "Panel interviews",
    copy: "Longer-form questioning testing depth, composure, natural conversational flow, and detailed reflection on work experience.",
  },
  {
    icon: School,
    title: "University-specific prep",
    copy: "Tailored station practice guided by the exact style and priorities of the medical schools on your UCAS application.",
  },
];

const faqs = [
  {
    q: "How are the 4 hours split?",
    a: "Usually 2 hours are dedicated to mastering foundational techniques (ethics, STARR reflection, answer structures, and NHS hot topics), followed by 2 full realistic mock interviews with station-by-station scorecards.",
  },
  {
    q: "Which medical schools do you cover?",
    a: "We cover every UK medical and dental school, including MMI universities (e.g. Manchester, Newcastle, Bristol, King's) and traditional panel universities (e.g. Oxford, Cambridge, UCL, Imperial).",
  },
  {
    q: "How soon can we schedule sessions?",
    a: "Sessions can be scheduled within days of booking. We offer flexible weekday, evening and weekend times to fit around school and your interview dates.",
  },
  {
    q: "Do I receive written feedback?",
    a: "Yes. After each mock interview, your tutor provides both immediate verbal breakdown and a detailed written scorecard highlighting strengths, weak points and station action items.",
  },
];

export function InterviewTutoringClient({
  checkoutStatus,
}: {
  checkoutStatus: CheckoutStatus;
}) {
  const [selectedTier, setSelectedTier] = useState<InterviewTier>("specialist");
  const [bookingPackageKey, setBookingPackageKey] =
    useState<InterviewTier>("specialist");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showContactFallback, setShowContactFallback] = useState(false);

  const activePackage = packages[bookingPackageKey];

  useEffect(() => {
    if (!bookingOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingCheckout) setBookingOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bookingOpen, loadingCheckout]);

  const openBooking = (tier: InterviewTier) => {
    setBookingPackageKey(tier);
    setCheckoutError(null);
    setShowContactFallback(false);
    setBookingOpen(true);
  };

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
          packageId: activePackage.id,
          email: bookingEmail.trim(),
          returnTo: "interview-tutoring",
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

  const bookingMailHref =
    "mailto:medwithrish@gmail.com?subject=" +
    encodeURIComponent(
      "Booking: " + activePackage.name + " (£" + activePackage.price + ")"
    ) +
    "&body=" +
    encodeURIComponent(
      "Hi Rishoo,\n\nI would like to book the " +
        activePackage.name +
        " (£" +
        activePackage.price +
        ").\nMy email: " +
        bookingEmail.trim() +
        "\n\nTarget universities / interview dates:\nAreas I want to focus on:\n\nThank you!"
    );

  const whatsappHrefForPackage = (pkg: InterviewPackage) =>
    "https://wa.me/447305422619?text=" +
    encodeURIComponent(
      "Hi Rishoo, I'm interested in the " + pkg.name + " (£" + pkg.price + ")."
    );

  return (
    <>
      <Navbar />

      <main className="min-h-screen medwithrish-bg px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Back Link */}
          <Link
            href="/interviews"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to Med Interview Hub
          </Link>

          {/* Checkout Status Notification */}
          {checkoutStatus === "success" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-bold">Your Interview Tutoring booking is confirmed!</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  We have received your payment. Rishoo or our team will email you shortly to confirm your session schedule.
                </p>
              </div>
            </div>
          )}

          {checkoutStatus === "cancelled" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold">Booking checkout was not completed.</p>
                <p className="mt-0.5 text-xs text-amber-700">
                  No payment was taken. You can book your package whenever you are ready.
                </p>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className="mt-6 grid grid-cols-1 items-center gap-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                1-TO-1 MED INTERVIEW TUTORING
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Personal coaching for your{" "}
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  strongest interview yet.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Work 1-to-1 with <strong className="text-slate-900">@medwithrish</strong> or an experienced MedicForest Specialist. Turn prepared answers into natural, mature, and confident performance - with realistic mock interviews and detailed scorecards.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#packages"
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
                >
                  View packages & pricing
                </a>
                <a
                  href="https://wa.me/447305422619"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Ask a question on WhatsApp
                </a>
              </div>
            </div>

            {/* Outcome Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xs lg:col-span-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <p className="text-xs font-bold text-slate-900">Verified Outcome</p>
                <span className="text-[11px] font-semibold text-emerald-600">4 / 4 Offers</span>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-950">
                  <Image
                    src="/success-stories/story1.jpeg"
                    alt="Student with four medicine offers"
                    fill
                    className="object-cover"
                    sizes="100px"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-extrabold text-slate-900">4 out of 4 Offers</p>
                  <p className="mt-1 text-xs italic text-slate-600">
                    “Forgot to update you but got all 4 offers! Once again thanks for all your help.”
                  </p>
                  <p className="mt-2 text-[11px] font-semibold text-slate-500">
                    Manchester · Newcastle · KCL · Liverpool
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Packages Section */}
          <section className="mt-10" id="packages">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                Transparent Pricing
              </span>
              <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
                Choose your Med interview package
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Secure online Stripe checkout. All sessions are arranged around your interview dates.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Package 1: Specialist £100 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div>
                  <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    SPECIALIST COACHING
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">Interview with Specialist</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    With an experienced MedicForest Med Interview Tutor.
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">£100</span>
                    <span className="text-xs text-slate-500">/ 4 hours total</span>
                  </div>

                  <ul className="mt-5 space-y-2 text-xs text-slate-700">
                    {packages.specialist.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => openBooking("specialist")}
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
                  >
                    Book with Specialist (£100)
                  </button>
                  <a
                    href={whatsappHrefForPackage(packages.specialist)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp question
                  </a>
                </div>
              </div>

              {/* Package 2: Rishoo £140 */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-blue-600 bg-white p-5 shadow-sm relative">
                <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                  DIRECT WITH RISHOO
                </span>
                <div>
                  <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    FOUNDER 1-ON-1
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">Interview with MedWithRish</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Direct coaching with Rishoo (@medwithrish).
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">£140</span>
                    <span className="text-xs text-slate-500">/ 4 hours total</span>
                  </div>

                  <ul className="mt-5 space-y-2 text-xs text-slate-700">
                    {packages.rish.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => openBooking("rish")}
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
                  >
                    Book with Rishoo (£140)
                  </button>
                  <a
                    href={whatsappHrefForPackage(packages.rish)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp question
                  </a>
                </div>
              </div>

              {/* Package 3: Featured £200 Complete Admissions */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-600 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 shadow-md relative">
                <span className="absolute -top-3 right-4 rounded-full bg-emerald-700 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs">
                  ⭐ MOST POPULAR · SAVE £140+
                </span>
                <div>
                  <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    COMPLETE ADMISSIONS
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">Complete Specialist Admissions Package</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    All-inclusive guidance across UCAT, Personal Statement and Interviews.
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-emerald-900">£200</span>
                    <span className="text-xs text-slate-500">/ 8 hrs tuition + PS</span>
                  </div>

                  <ul className="mt-5 space-y-2 text-xs text-slate-700">
                    {packages["complete-bundle"].features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => openBooking("complete-bundle")}
                    className="w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-800"
                  >
                    Book Complete Package (£200)
                  </button>
                  <a
                    href={whatsappHrefForPackage(packages["complete-bundle"])}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp question
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Formats Covered */}
          <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Tailored Preparation</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Built for the interview you are actually facing</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {interviewFormats.map(({ icon: Icon, title, copy }) => (
                <div key={title} className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="mt-3 text-sm font-bold text-slate-900">{title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{copy}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQs */}
          <section className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
            <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Frequently asked questions</h2>
            <div className="mt-6 divide-y divide-slate-100">
              {faqs.map((f) => (
                <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                  <h3 className="text-sm font-bold text-slate-900">{f.q}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Founder Bio */}
        <div className="mt-14">
          <Hero />
        </div>
      </main>

      {/* Stripe Booking Modal */}
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
            aria-labelledby="interview-booking-title"
            className="relative w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              disabled={loadingCheckout}
              aria-label="Close booking modal"
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <BadgeCheck className="h-3.5 w-3.5" />
              Secure Checkout
            </span>
            <h2 id="interview-booking-title" className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
              Book your interview tutoring
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Choose your package, enter your email, and continue to secure Stripe payment.
            </p>

            {/* In-Modal Package Switcher */}
            <div className="mt-4 grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setBookingPackageKey("specialist")}
                className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                  bookingPackageKey === "specialist"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Specialist · £100
              </button>
              <button
                type="button"
                onClick={() => setBookingPackageKey("rish")}
                className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                  bookingPackageKey === "rish"
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Rishoo · £140
              </button>
              <button
                type="button"
                onClick={() => setBookingPackageKey("complete-bundle")}
                className={`rounded-lg px-2 py-1.5 text-[11px] font-bold transition ${
                  bookingPackageKey === "complete-bundle"
                    ? "bg-emerald-700 text-white shadow-2xs"
                    : "text-slate-600 hover:bg-white"
                }`}
              >
                Complete · £200
              </button>
            </div>

            {/* Summary Box */}
            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{activePackage.name}</span>
                <span className="text-sm font-bold text-blue-700">£{activePackage.price}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">{activePackage.description}</p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="mt-4">
              <label htmlFor="interview-booking-email" className="text-xs font-bold text-slate-800">
                Email address
              </label>
              <input
                id="interview-booking-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={bookingEmail}
                onChange={(event) => setBookingEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Used for your receipt and to arrange your session schedule.
              </p>

              {checkoutError && (
                <div role="alert" className="mt-2.5 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingCheckout}
                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-60"
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Connecting to secure checkout…
                  </>
                ) : (
                  <>
                    Continue to secure payment (£{activePackage.price})
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {showContactFallback && (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-200 pt-3">
                <a
                  href={bookingMailHref}
                  className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email Rishoo
                </a>
                <a
                  href={whatsappHrefForPackage(activePackage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1 rounded-lg border border-slate-300 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            )}

            <p className="mt-3 text-center text-[10px] text-slate-400">
              Payments are securely encrypted and processed by Stripe.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

