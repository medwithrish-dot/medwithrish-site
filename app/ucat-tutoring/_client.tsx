"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  Check,
  CheckCircle2,
  Clock3,
  Crown,
  HelpCircle,
  Loader2,
  Mail,
  MessageCircle,
  Percent,
  Sparkles,
  Target,
  X,
  Zap,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

type UcatTutorTier = "specialist" | "rish" | "complete-bundle";
type CheckoutStatus = "success" | "cancelled" | null;

interface UcatPackage {
  id: "ucat-specialist" | "ucat-rish" | "complete-bundle";
  tierKey: UcatTutorTier;
  name: string;
  shortLabel: string;
  badge?: string;
  price: number;
  tutor: string;
  durationLabel: string;
  description: string;
  features: string[];
}

const packages: Record<UcatTutorTier, UcatPackage> = {
  specialist: {
    id: "ucat-specialist",
    tierKey: "specialist",
    name: "UCAT Crash Course with Specialist",
    shortLabel: "Specialist",
    price: 100,
    tutor: "Experienced MedicForest UCAT Specialist",
    durationLabel: "4 hours intensive tuition",
    description:
      "Structured 1-to-1 breakdown covering VR, DM, QR and SJT timing, accuracy and markscheme strategies.",
    features: [
      "4 hours of structured 1-to-1 tuition with an experienced specialist",
      "Flexible split: 1hr across all 4 subtests or targeted to your weakest sections",
      "Step-by-step timed passage reading drills and question walkthroughs",
      "Official markscheme criteria and common pitfall analysis",
      "Actionable revision plan and homework tasks between sessions",
      "Flexible weekday and weekend session scheduling",
    ],
  },
  rish: {
    id: "ucat-rish",
    tierKey: "rish",
    name: "UCAT Crash Course with MedWithRish",
    shortLabel: "Rishoo",
    badge: "DIRECT WITH RISHOO",
    price: 140,
    tutor: "Direct with @medwithrish",
    durationLabel: "4 hours intensive tuition",
    description:
      "Direct 1-to-1 coaching with Rishoo focusing on high-yield mental maths, calculator shortcuts, and triage techniques.",
    features: [
      "4 hours direct 1-to-1 coaching with Rishoo (@medwithrish)",
      "High-yield mental maths and online calculator estimation techniques (Rishoo scored 890/900 in QR)",
      "Syllogism and logical puzzle decision-tree frameworks for Decision Making",
      "Verbal Reasoning speed-reading and keyword scanning rules",
      "Diagnostic breakdown pinpointing your personal time-drains",
      "Direct follow-up messaging and guidance between sessions",
    ],
  },
  "complete-bundle": {
    id: "complete-bundle",
    tierKey: "complete-bundle",
    name: "Complete Specialist Admissions Package",
    shortLabel: "Complete Package",
    badge: "MOST POPULAR · ALL-IN-ONE",
    price: 200,
    tutor: "MedicForest Admissions Specialist",
    durationLabel: "All-inclusive: 8 hrs tuition + PS review",
    description:
      "Complete end-to-end support covering UCAT, Personal Statement and Medical School Interviews from start to finish.",
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

const subtestBreakdown = [
  {
    title: "Verbal Reasoning (VR)",
    tag: "Speed & Inference",
    copy: "Master keyword scanning, passage mapping, and eliminating trap options in True / False / Can't Tell and author opinion questions.",
    points: ["Scanning techniques without reading whole passages", "Triage rules: which passages to skip immediately", "Inference vs direct fact extraction"],
  },
  {
    title: "Decision Making (DM)",
    tag: "Logic & Deduction",
    copy: "Systematic decision trees for syllogisms, logic puzzles, probability calculations and Venn diagrams.",
    points: ["Boolean truth rules for syllogisms", "Venn diagram intersection shortcuts", "Recognising weak arguments vs strong arguments"],
  },
  {
    title: "Quantitative Reasoning (QR)",
    tag: "890/900 Calculator Method",
    copy: "Rishoo's signature online calculator method (M+, M-, MRC) combined with mental estimation so you never run out of time.",
    points: ["Calculator memory shortcut drill", "Rough estimation for rapid answer elimination", "Percentage change and ratio fast tracks"],
  },
  {
    title: "Situational Judgement (SJT)",
    tag: "Band 1 Framework",
    copy: "GMC Good Medical Practice guidelines translated into clear scoring rules for ethics, candour, confidentiality and teamwork.",
    points: ["Hierarchy of patient safety and consent", "Very Appropriate vs Appropriate nuances", "Handling impaired colleagues and medical errors"],
  },
];

const ucatReviews = [
  {
    src: "/success-stories/story5.jpeg",
    tag: "2370 B2",
    headline: "2370 Band 2!",
    quote: "Rishoo’s support gave me the confidence and structure I needed. The advice was tailored to my application and made a huge difference.",
    sub: "Offers: Manchester",
  },
  {
    src: "/success-stories/story-2350-b1.png",
    tag: "2350 B1",
    headline: "2350 Band 1!!",
    quote: "The sectional timing strategies and question breakdowns transformed how I approached Quantitative Reasoning and Decision Making.",
    sub: "Offers: Bristol & Sheffield",
  },
  {
    src: "/success-stories/story-2410-b2.png",
    tag: "2410 B2",
    headline: "Top Percentile Score",
    quote: "Achieved a top national percentile score. The focused drills and feedback made all the difference.",
    sub: "Offers: King’s College London",
  },
  {
    src: "/success-stories/story-2340-b2.png",
    tag: "QR 900",
    headline: "900 in QR!",
    quote: "Scored 900 full marks in Quantitative Reasoning using the calculator shortcuts and mental maths estimation rules.",
    sub: "Offers: Newcastle",
  },
];

const faqs = [
  {
    q: "How are the 4 hours structured?",
    a: "You can choose either an even split (1 hour per subtest across VR, DM, QR and SJT) or allocate more time to your weakest sections (e.g. 2 hours QR and 2 hours VR). We adapt entirely to your needs.",
  },
  {
    q: "When do sessions take place?",
    a: "Sessions are arranged flexibly around your schedule, including weekdays, evenings and weekends. Once booked, we contact you directly by email to confirm dates that fit your test booking.",
  },
  {
    q: "What should I have prepared before the first session?",
    a: "Just your recent mock or mini-mock scores (from Medify, MedEntry, or official UCAT mocks) and a list of questions or sections where you struggle with timing or accuracy.",
  },
  {
    q: "Can I upgrade to the Complete Admissions Package later?",
    a: "Yes! If you start with UCAT tutoring and later want Personal Statement review and Med Interview coaching, you can easily upgrade.",
  },
];

export function UCATTutoringClient({
  checkoutStatus,
}: {
  checkoutStatus: CheckoutStatus;
}) {
  const [selectedTier, setSelectedTier] = useState<UcatTutorTier>("specialist");
  const [bookingPackageKey, setBookingPackageKey] =
    useState<UcatTutorTier>("specialist");
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

  const openBooking = (tier: UcatTutorTier) => {
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
          returnTo: "ucat",
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
        "\n\nUpcoming UCAT test date:\nCurrent mock scores / diagnostic:\nSubtests I need the most help with:\n\nThank you!"
    );

  const whatsappHrefForPackage = (pkg: UcatPackage) =>
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
            href="/resources"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            ← Back to resources
          </Link>

          {/* Checkout Status Banners */}
          {checkoutStatus === "success" && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-bold">Your UCAT Tutoring booking is confirmed!</p>
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

          {/* Hero Header */}
          <section className="mt-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                1-TO-1 UCAT CRASH COURSE
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                Proven 99th Percentile Methods
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Turn your UCAT preparation into a{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                high-percentile score.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Work 1-to-1 with <strong className="text-slate-900">@medwithrish</strong> or an experienced MedicForest UCAT Specialist to fix timing bottlenecks, master high-speed mental maths shortcuts, and target your weakest subtests.
            </p>

            {/* Feature Pills */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Calculator className="h-4 w-4" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900">890/900 QR Shortcuts</p>
                <p className="text-[11px] text-slate-500">Calculator memory & mental maths</p>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Zap className="h-4 w-4" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900">VR Speed Scanning</p>
                <p className="text-[11px] text-slate-500">Keyword indexing without full reading</p>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <Target className="h-4 w-4" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900">DM Decision Trees</p>
                <p className="text-[11px] text-slate-500">Syllogisms & logic puzzle shortcuts</p>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-3 shadow-2xs">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <Percent className="h-4 w-4" />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900">SJT Band 1 Logic</p>
                <p className="text-[11px] text-slate-500">GMC Good Medical Practice rules</p>
              </div>
            </div>
          </section>

          {/* Real Score Proof Carousel / Grid */}
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Verified Results</p>
                <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Real Student UCAT Scores</h2>
              </div>
              <span className="text-xs font-medium text-slate-500">Verified student messages</span>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {ucatReviews.map((rev) => (
                <div key={rev.tag} className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">{rev.tag}</span>
                      <span className="text-[11px] font-semibold text-emerald-600">Verified</span>
                    </div>
                    <div className="relative mt-3 h-32 w-full overflow-hidden rounded-xl bg-slate-900">
                      <Image
                        src={rev.src}
                        alt={rev.headline}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 250px"
                      />
                    </div>
                    <p className="mt-3 text-xs italic leading-relaxed text-slate-600">“{rev.quote}”</p>
                  </div>
                  <p className="mt-3 border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-500">{rev.sub}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Pricing & Packages Section */}
          <section className="mt-10" id="packages">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
                Transparent Pricing
              </span>
              <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                Choose your UCAT tutoring package
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Secure online Stripe checkout. All sessions are 1-to-1 and arranged around your test date.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Package 1: Specialist £100 */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div>
                  <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    SPECIALIST COACHING
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">UCAT with Specialist</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    With an experienced MedicForest UCAT Specialist.
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">£100</span>
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
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
                  >
                    Book with Specialist (£100)
                  </button>
                  <a
                    href={whatsappHrefForPackage(packages.specialist)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp question
                  </a>
                </div>
              </div>

              {/* Package 2: Rishoo £140 */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-blue-600 bg-white p-5 shadow-sm relative">
                <span className="absolute -top-3 right-4 rounded-full bg-blue-600 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-xs">
                  DIRECT WITH RISHOO
                </span>
                <div>
                  <span className="inline-block rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    FOUNDER 1-ON-1
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">UCAT with MedWithRish</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    Direct coaching with Rishoo (@medwithrish).
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-slate-900">£140</span>
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
                    className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700"
                  >
                    Book with Rishoo (£140)
                  </button>
                  <a
                    href={whatsappHrefForPackage(packages.rish)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp question
                  </a>
                </div>
              </div>

              {/* Package 3: Featured £200 Complete Package */}
              <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-600 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 shadow-md relative">
                <span className="absolute -top-3 right-4 rounded-full bg-emerald-700 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white shadow-xs">
                  ⭐ MOST POPULAR · SAVE £140+
                </span>
                <div>
                  <span className="inline-block rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                    COMPLETE ADMISSIONS
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">Complete Specialist Admissions Package</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    End-to-end guidance across UCAT, Personal Statement and Interviews.
                  </p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-emerald-900">£200</span>
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

          {/* Subtests Breakdown Section */}
          <section className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-2xs sm:p-8">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Curriculum & Method</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">What we cover across the 4 core subtests</h2>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {subtestBreakdown.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-[#f8fbff] p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700">{item.tag}</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{item.copy}</p>
                  <ul className="mt-3 space-y-1 text-xs text-slate-700">
                    {item.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-1.5">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-blue-600" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
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

          {/* Bottom CTA Banner */}
          <section className="mt-8 flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="text-lg font-bold sm:text-xl">Ready to raise your UCAT score?</h2>
              <p className="mt-1 text-xs text-blue-100 sm:text-sm">
                Book your 4-hour crash course today and we’ll arrange sessions to fit your target exam date.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openBooking("rish")}
                className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-700 shadow-xs transition hover:bg-blue-50"
              >
                Book with Rishoo (£140)
              </button>
              <button
                type="button"
                onClick={() => openBooking("complete-bundle")}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-600"
              >
                Complete Package (£200)
              </button>
            </div>
          </section>
        </div>

        {/* Founder Bio */}
        <div className="mt-12">
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
            aria-labelledby="ucat-booking-title"
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
            <h2 id="ucat-booking-title" className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
              Book your UCAT tuition
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
              <label htmlFor="ucat-booking-email" className="text-xs font-bold text-slate-800">
                Email address
              </label>
              <input
                id="ucat-booking-email"
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
                Used for your receipt and to arrange your session dates.
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

