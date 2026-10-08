"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Crown,
  GraduationCap,
  HelpCircle,
  Loader2,
  Mail,
  MessageCircle,
  Mic2,
  Sparkles,
  Target,
  X,
  Zap,
  ZoomIn,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

type CheckoutStatus = "success" | "cancelled" | null;
type ServiceCategory = "all" | "ucat" | "interview" | "bundle";

type PackageId =
  | "ucat-specialist"
  | "ucat-rish"
  | "interview-specialist"
  | "interview-rish"
  | "complete-bundle";

interface TutoringPackage {
  id: PackageId;
  category: "ucat" | "interview" | "bundle";
  name: string;
  badge?: string;
  price: number;
  tutor: string;
  durationLabel: string;
  description: string;
  features: string[];
}

const allTutoringPackages: TutoringPackage[] = [
  {
    id: "ucat-specialist",
    category: "ucat",
    name: "UCAT Crash Course with Specialist",
    price: 100,
    tutor: "Experienced MedicForest UCAT Specialist",
    durationLabel: "4 hours total intensive tuition",
    description:
      "Subtest breakdown across VR, DM, QR and SJT timing and accuracy strategy.",
    features: [
      "4 hours 1-to-1 tuition with an experienced specialist",
      "Tailored split across VR, DM, QR & SJT",
      "Step-by-step passage reading and question drills",
      "Official markscheme criteria and common pitfall analysis",
      "Flexible weekday and weekend scheduling",
    ],
  },
  {
    id: "ucat-rish",
    category: "ucat",
    name: "UCAT Crash Course with MedWithRish",
    badge: "DIRECT WITH RISH",
    price: 140,
    tutor: "Direct 1-to-1 with @medwithrish",
    durationLabel: "4 hours total intensive tuition",
    description:
      "Direct personal coaching with Rish focusing on high-speed mental maths, calculator shortcuts, and triage techniques.",
    features: [
      "4 hours direct 1-to-1 coaching with Rish",
      "High-yield mental maths & calculator estimation (Rish scored 890 in QR)",
      "Syllogism and logical puzzle decision-tree frameworks",
      "Verbal Reasoning speed-reading and keyword scanning rules",
      "Diagnostic breakdown targeting weakest subtests",
    ],
  },
  {
    id: "interview-specialist",
    category: "interview",
    name: "1-1 Interview Coaching with Specialist",
    price: 100,
    tutor: "Experienced MedicForest Med Interview Tutor",
    durationLabel: "4 hours total (2 hrs coaching + 2 mock interviews)",
    description:
      "Structured coaching covering core interview techniques and realistic mock simulations.",
    features: [
      "2 hours on answer structure, ethics, and confident delivery",
      "2 full realistic mock interviews (MMI and panel formats)",
      "Detailed verbal and written feedback after each mock",
      "University-specific station preparation and scoring criteria",
      "Dates arranged around your interview invitations",
    ],
  },
  {
    id: "interview-rish",
    category: "interview",
    name: "1-1 Interview Coaching with MedWithRish",
    badge: "DIRECT WITH RISH",
    price: 140,
    tutor: "Direct 1-to-1 with @medwithrish",
    durationLabel: "4 hours total (2 hrs coaching + 2 mock interviews)",
    description:
      "Direct personal coaching with Rish from foundational structure to your final university mock interviews.",
    features: [
      "4 hours direct 1-to-1 coaching with Rish",
      "2 hours on answer structure, ethical reasoning and delivery",
      "2 full realistic mock interviews tailored to your target universities",
      "Actionable feedback breakdown and personalized question priorities",
      "Direct follow-up messaging and advice between sessions",
    ],
  },
  {
    id: "complete-bundle",
    category: "bundle",
    name: "Complete Specialist Admissions Package",
    badge: "⭐ MOST POPULAR · ALL-IN-ONE",
    price: 200,
    tutor: "MedicForest Admissions Specialist",
    durationLabel: "All-inclusive: 8 hrs tuition + PS review",
    description:
      "End-to-end guidance across your entire medical school application with an experienced MedicForest Specialist.",
    features: [
      "4 hours 1-1 UCAT Crash Course across all 4 core subtests (VR, DM, QR, SJT)",
      "Personal Statement complete support: draft review, editing and line-by-line polish",
      "4 hours 1-1 Med Interview Tutoring (2 hrs technique mastery + 2 full realistic mocks)",
      "Detailed written feedback scorecard after each interview mock",
      "University shortlisting strategy and application guidance",
      "Priority tutor scheduling and ongoing support throughout your application",
    ],
  },
];

const outcomeStories = [
  {
    src: "/success-stories/story1.jpeg",
    alt: "Student secured four out of four medicine offers",
    tag: "MEDICINE OFFERS",
    scoreHeading: "4 / 4 Medicine Offers",
    quote: "From personal statement guidance right through to MMI prep, the coaching gave me complete clarity at every stage.",
    authorName: "Year 13 applicant",
    offers: "Offers: Manchester, Newcastle, KCL, Liverpool",
  },
  {
    src: "/success-stories/story5.jpeg",
    alt: "Student UCAT score 2370 Band 2 feedback screenshot",
    tag: "UCAT SCORE",
    scoreHeading: "2370 B2!",
    quote: "Rish’s support gave me the confidence and structure I needed. The advice was tailored to my application and made a huge difference.",
    authorName: "Year 12 student",
    offers: "Offers: Manchester",
  },
  {
    src: "/success-stories/story-2350-b1.png",
    alt: "Student UCAT score 2350 Band 1 feedback screenshot",
    tag: "UCAT SCORE",
    scoreHeading: "2350 B1!!",
    quote: "The sectional timing strategies and question breakdowns transformed how I approached Quantitative Reasoning and Decision Making.",
    authorName: "Year 13 applicant",
    offers: "Offers: Bristol & Sheffield",
  },
  {
    src: "/success-stories/story-2410-b2.png",
    alt: "Student UCAT score 2410 Band 2 national top percentile",
    tag: "UCAT SCORE",
    scoreHeading: "2410 B2!",
    quote: "Achieved a top national percentile score. The focused drills and feedback made all the difference.",
    authorName: "Medical applicant",
    offers: "Offers: King’s College London",
  },
  {
    src: "/success-stories/story-2340-b2.png",
    alt: "Student UCAT score 2340 Band 2 with 900 in QR",
    tag: "UCAT SCORE",
    scoreHeading: "2340 B2 (QR 900!)",
    quote: "Scored 900 full marks in Quantitative Reasoning using the calculator shortcuts and mental maths estimation rules.",
    authorName: "Medical applicant",
    offers: "Offers: Newcastle",
  },
];

export function TutoringPageClient({
  checkoutStatus,
}: {
  checkoutStatus: CheckoutStatus;
}) {
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>("all");
  const [bookingPackage, setBookingPackage] = useState<TutoringPackage>(
    allTutoringPackages[4] // default to Complete Bundle
  );
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showContactFallback, setShowContactFallback] = useState(false);

  // Outcome story carousel state
  const [storyIndex, setStoryIndex] = useState(0);
  const [zoomStory, setZoomStory] = useState<(typeof outcomeStories)[0] | null>(null);

  const nextStory = useCallback(() => {
    setStoryIndex((prev) => (prev + 1) % outcomeStories.length);
  }, []);

  const prevStory = useCallback(() => {
    setStoryIndex((prev) => (prev - 1 + outcomeStories.length) % outcomeStories.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      nextStory();
    }, 4500);
    return () => clearInterval(timer);
  }, [nextStory]);

  useEffect(() => {
    if (!bookingOpen && !zoomStory) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!loadingCheckout) setBookingOpen(false);
        setZoomStory(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bookingOpen, loadingCheckout, zoomStory]);

  const startBooking = (pkg: TutoringPackage) => {
    setBookingPackage(pkg);
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
          packageId: bookingPackage.id,
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

  const bookingMailHref =
    "mailto:medwithrish@gmail.com?subject=" +
    encodeURIComponent(
      "Booking: " + bookingPackage.name + " (£" + bookingPackage.price + ")"
    ) +
    "&body=" +
    encodeURIComponent(
      "Hi Rish,\n\nI would like to book the " +
        bookingPackage.name +
        " (£" +
        bookingPackage.price +
        ").\nMy email: " +
        bookingEmail.trim() +
        "\n\nTarget universities / exam dates:\nAreas I need help with:\n\nThank you!"
    );

  const whatsappHrefForPackage = (pkg: TutoringPackage) =>
    "https://wa.me/447305422619?text=" +
    encodeURIComponent(
      "Hi Rish, I'm interested in the " + pkg.name + " (£" + pkg.price + ")."
    );

  const filteredPackages =
    activeCategory === "all"
      ? allTutoringPackages
      : activeCategory === "bundle"
      ? allTutoringPackages.filter((p) => p.category === "bundle")
      : allTutoringPackages.filter(
          (p) => p.category === activeCategory || p.category === "bundle"
        );

  const currentStory = outcomeStories[storyIndex];

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7fafe] px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Checkout Status Notification */}
          {checkoutStatus === "success" && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-sm font-bold">Booking payment complete!</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  Thank you! We will use your checkout email to contact you and schedule your tutoring sessions.
                </p>
              </div>
            </div>
          )}

          {checkoutStatus === "cancelled" && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-900 shadow-sm">
              <HelpCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-bold">Booking was not completed.</p>
                <p className="mt-0.5 text-xs text-amber-700">
                  No payment was taken. You can browse and choose your package whenever you are ready.
                </p>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <section className="rounded-3xl border border-blue-100 bg-gradient-to-b from-white to-[#f4f8fd] p-6 shadow-sm sm:p-10">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                1-TO-1 ADMISSIONS TUTORING
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />
                350+ Students Taught
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              1-to-1 medical school admissions coaching with{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                proven results.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Work 1-to-1 with <strong className="text-slate-900">@medwithrish</strong> or an experienced MedicForest Specialist. Get structured preparation across UCAT, Personal Statement and Medical School Interviews with realistic mock practice and transparent pricing.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href="#packages"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                Browse packages & pricing
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
              <Link
                href="/ucat-tutoring"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                UCAT Crash Course
              </Link>
              <Link
                href="/interview-tutoring"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Med Interview Tutoring
              </Link>
            </div>
          </section>

          {/* Social Proof Outcome Story Slider */}
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">Student Outcomes</p>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">Real messages. Real offers. Real results.</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevStory}
                  aria-label="Previous story"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={nextStory}
                  aria-label="Next story"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 items-center gap-5 sm:grid-cols-[140px_1fr]">
              <div
                className="group relative h-48 w-full cursor-zoom-in overflow-hidden rounded-2xl bg-slate-950 sm:w-[140px]"
                onClick={() => setZoomStory(currentStory)}
                title="Click to zoom screenshot"
              >
                <Image
                  src={currentStory.src}
                  alt={currentStory.alt}
                  fill
                  className="object-cover transition group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 140px"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                  <span className="flex items-center gap-1 rounded-md bg-white/90 px-2 py-1 text-[10px] font-bold text-slate-900">
                    <ZoomIn className="h-3 w-3" /> Zoom
                  </span>
                </div>
              </div>

              <div>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700">
                  {currentStory.tag}
                </span>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {currentStory.scoreHeading}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  “{currentStory.quote}”
                </p>
                <div className="mt-3 border-t border-slate-100 pt-2 text-xs">
                  <p className="font-bold text-slate-800">{currentStory.offers}</p>
                  <p className="text-[11px] text-slate-500">{currentStory.authorName}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing & Packages Section */}
          <section className="mt-10" id="packages">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-600">All Packages</p>
                <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
                  Transparent 1-to-1 Tutoring Packages
                </h2>
                <p className="mt-0.5 text-xs text-slate-600 sm:text-sm">
                  Select a category or browse all available coaching tiers below.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
                {(
                  [
                    ["all", "All Packages"],
                    ["ucat", "UCAT"],
                    ["interview", "Med Interviews"],
                    ["bundle", "Complete Bundle"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                      activeCategory === key
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Packages Grid */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => {
                const isBundle = pkg.id === "complete-bundle";
                const isRish = pkg.id.includes("rish");

                return (
                  <div
                    key={pkg.id}
                    className={`flex flex-col justify-between rounded-2xl p-5 shadow-xs transition ${
                      isBundle
                        ? "border-2 border-emerald-600 bg-gradient-to-b from-emerald-50/40 via-white to-white md:col-span-2 lg:col-span-1 shadow-md"
                        : isRish
                        ? "border-2 border-blue-600 bg-white"
                        : "border border-slate-200 bg-white"
                    }`}
                  >
                    <div>
                      {pkg.badge && (
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            isBundle
                              ? "bg-emerald-700 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {pkg.badge}
                        </span>
                      )}
                      <h3 className="mt-2 text-base font-bold text-slate-900">{pkg.name}</h3>
                      <p className="mt-0.5 text-xs text-slate-500">{pkg.tutor}</p>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-slate-900">£{pkg.price}</span>
                        <span className="text-xs text-slate-500">one-off</span>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{pkg.description}</p>

                      <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                        {pkg.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-2">
                            <CheckCircle2
                              className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                                isBundle
                                  ? "text-emerald-600"
                                  : isRish
                                  ? "text-blue-600"
                                  : "text-slate-600"
                              }`}
                            />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => startBooking(pkg)}
                        className={`w-full rounded-xl py-2.5 text-xs font-bold text-white shadow-xs transition ${
                          isBundle
                            ? "bg-emerald-700 hover:bg-emerald-800"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        Book {pkg.name} (£{pkg.price})
                      </button>
                      <a
                        href={whatsappHrefForPackage(pkg)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        WhatsApp question
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Quick Links to Specialized Pages */}
          <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              href="/ucat-tutoring"
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-2xs transition hover:border-blue-300 hover:shadow-xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">UCAT Crash Course</h3>
              <p className="mt-1 text-xs text-slate-500">
                890/900 QR calculator technique, VR timing drills and DM logic trees.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                Explore UCAT Tutoring →
              </span>
            </Link>

            <Link
              href="/interview-tutoring"
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-2xs transition hover:border-blue-300 hover:shadow-xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Mic2 className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Med Interview Coaching</h3>
              <p className="mt-1 text-xs text-slate-500">
                MMI circuits, panel questioning, ethics frameworks and written scorecards.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
                Explore Interview Tutoring →
              </span>
            </Link>

            <Link
              href="/personal-statement-session"
              className="rounded-2xl border border-blue-100 bg-white p-5 shadow-2xs transition hover:border-blue-300 hover:shadow-xs"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <GraduationCap className="h-4 w-4" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">Personal Statement Support</h3>
              <p className="mt-1 text-xs text-slate-500">
                Line-by-line critique, structure refinement, and deeper reflection.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                Explore Personal Statement →
              </span>
            </Link>
          </section>
        </div>

        {/* Founder Bio */}
        <div className="mt-14">
          <Hero />
        </div>
      </main>

      {/* Booking Checkout Modal */}
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
            aria-labelledby="tutoring-booking-title"
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
            <h2 id="tutoring-booking-title" className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
              Book your tutoring package
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Confirm your package, enter your email, and continue to secure Stripe payment.
            </p>

            <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{bookingPackage.name}</span>
                <span className="text-sm font-bold text-blue-700">£{bookingPackage.price}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-600">{bookingPackage.description}</p>
              <p className="mt-1 font-semibold text-slate-700">{bookingPackage.tutor}</p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="mt-4">
              <label htmlFor="tutoring-booking-email" className="text-xs font-bold text-slate-800">
                Email address
              </label>
              <input
                id="tutoring-booking-email"
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
                Used for your receipt and to arrange session times with you.
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
                    Continue to secure payment (£{bookingPackage.price})
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
                  Email Rish
                </a>
                <a
                  href={whatsappHrefForPackage(bookingPackage)}
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

      {/* Screenshot Zoom Modal */}
      {zoomStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomStory(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            <button
              type="button"
              onClick={() => setZoomStory(null)}
              className="absolute -top-10 right-0 text-white"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative h-[80vh] w-[80vw] max-w-md">
              <Image
                src={zoomStory.src}
                alt={zoomStory.alt}
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

