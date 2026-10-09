"use client";

import Image from "next/image";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Clock3,
  Crown,
  GraduationCap,
  Loader2,
  Mail,
  MessageCircle,
  Mic2,
  Quote,
  School,
  Sparkles,
  Target,
  UserRoundCheck,
  UsersRound,
  X,
} from "lucide-react";

type TutorTier = "specialist" | "rish";
type PackageId = "interview-specialist" | "interview-rish" | "complete-bundle";
type CheckoutStatus = "success" | "cancelled" | null;

interface TutoringPackage {
  id: PackageId;
  name: string;
  shortLabel: string;
  badge?: string;
  tutor: string;
  price: number;
  durationLabel: string;
  description: string;
  features: string[];
}

const interviewPackages: Record<TutorTier, TutoringPackage> = {
  specialist: {
    id: "interview-specialist",
    name: "1-1 Interview Coaching with Specialist",
    shortLabel: "Specialist",
    tutor: "MedicForest Med Interview Specialist",
    price: 100,
    durationLabel: "4 hours total · arranged around you",
    description:
      "Structured 1-to-1 coaching with an experienced MedicForest Med Interview tutor covering technique and realistic mock practice.",
    features: [
      "2 hours on answer structure, ethics, NHS hot topics and confident delivery",
      "2 full realistic mock interviews (MMI and panel formats)",
      "Detailed verbal and written feedback after each mock",
      "University-specific station preparation and scoring criteria",
      "Flexible weekday and weekend scheduling around your interview dates",
    ],
  },
  rish: {
    id: "interview-rish",
    name: "1-1 Interview Coaching with @medwithrish",
    shortLabel: "Rish",
    tutor: "Direct with @medwithrish",
    price: 140,
    durationLabel: "4 hours total · arranged around you",
    description:
      "Direct personal coaching with Rish from foundational structure to your final university mock interviews.",
    features: [
      "4 hours direct 1-to-1 coaching with Rish",
      "2 hours on answer structure, ethical reasoning and confident delivery",
      "2 full realistic mock interviews with university-specific stations",
      "Actionable feedback breakdown and personalized question priorities",
      "Direct follow-up messaging and advice between sessions",
    ],
  },
};

const completeAdmissionsPackage: TutoringPackage = {
  id: "complete-bundle",
  name: "MedicForest Complete Specialist Admissions Package",
  shortLabel: "Complete Admissions Package",
  badge: "MOST POPULAR · ALL-IN-ONE",
  tutor: "MedicForest Admissions Specialist",
  price: 200,
  durationLabel: "All-inclusive: 8 hrs tuition + PS review",
  description:
    "Comprehensive end-to-end guidance across UCAT, Personal Statement and Interview coaching with an experienced MedicForest Specialist.",
  features: [
    "4 hours 1-1 UCAT Crash Course across all 4 core subtests (VR, DM, QR, SJT)",
    "Personal Statement complete support: draft review, editing and line-by-line polish",
    "4 hours 1-1 Med Interview Tutoring (2 hrs technique mastery + 2 full realistic mocks)",
    "Detailed written feedback scorecard after each interview mock",
    "University shortlisting strategy and application guidance",
    "Priority tutor scheduling and ongoing support throughout your application",
  ],
};

const allPackagesMap: Record<PackageId, TutoringPackage> = {
  "interview-specialist": interviewPackages.specialist,
  "interview-rish": interviewPackages.rish,
  "complete-bundle": completeAdmissionsPackage,
};

const heroFeatures = [
  { icon: Target, label: "Tailored to your universities" },
  { icon: Mic2, label: "Realistic mock practice" },
  { icon: BadgeCheck, label: "Feedback you can use" },
];

const sessionPlan = [
  {
    number: "01",
    title: "Build the foundations",
    copy: "Sharpen answer structure, reflection, ethics and the examples that make your answers personal.",
  },
  {
    number: "02",
    title: "Practise under pressure",
    copy: "Complete two realistic mock interviews shaped around your target universities and format.",
  },
  {
    number: "03",
    title: "Leave with a plan",
    copy: "Use detailed feedback and clear priorities to focus every practice session that follows.",
  },
];

const interviewFormats = [
  {
    icon: Mic2,
    title: "MMI practice",
    copy: "Timed stations, follow-up questions and realistic transitions between topics.",
  },
  {
    icon: UsersRound,
    title: "Panel interviews",
    copy: "Longer-form questioning that tests depth, composure and natural conversation.",
  },
  {
    icon: School,
    title: "University-specific prep",
    copy: "Practice guided by the style and priorities of the medical schools on your list.",
  },
];

const generalWhatsappHref =
  "https://wa.me/447305422619?text=Hi%20Rish%2C%20I%E2%80%99m%20interested%20in%20tutoring.";

export function InterviewTutoringPageClient({
  checkoutStatus,
}: {
  checkoutStatus: CheckoutStatus;
}) {
  const [interviewTier, setInterviewTier] = useState<TutorTier>("specialist");
  const [bookingPackageId, setBookingPackageId] =
    useState<PackageId>("interview-specialist");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingEmail, setBookingEmail] = useState("");
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [showContactFallback, setShowContactFallback] = useState(false);

  const selectedInterviewPackage = interviewPackages[interviewTier];
  const activeBookingPackage = allPackagesMap[bookingPackageId];

  useEffect(() => {
    if (!bookingOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loadingCheckout) setBookingOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [bookingOpen, loadingCheckout]);

  const startBooking = (packageId?: PackageId) => {
    const targetId = packageId ?? selectedInterviewPackage.id;
    setBookingPackageId(targetId);
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
          packageId: activeBookingPackage.id,
          email: bookingEmail.trim(),
          returnTo: "interviews",
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
      "Booking: " + activeBookingPackage.name + " (£" + activeBookingPackage.price + ")"
    ) +
    "&body=" +
    encodeURIComponent(
      "Hi Rish,\n\nI would like to book the " +
        activeBookingPackage.name +
        " (£" +
        activeBookingPackage.price +
        ").\nMy email: " +
        bookingEmail.trim() +
        "\n\nTarget universities:\nInterview / test dates (if known):\nAreas I would like help with:\n\nThank you!"
    );

  const whatsappHrefForPackage = (pkg: TutoringPackage) =>
    "https://wa.me/447305422619?text=" +
    encodeURIComponent(
      "Hi Rish, I'm interested in the " + pkg.name + " (£" + pkg.price + ")."
    );

  return (
    <div className="relative isolate w-full max-w-full overflow-x-clip pb-10 sm:pb-14">
      {/* Ambient decorative glow strictly contained */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-8 -z-10 h-72 overflow-hidden"
      >
        <div className="absolute -right-12 -top-12 h-64 w-64 rounded-full bg-[#bce9dc]/40 blur-3xl" />
        <div className="absolute left-1/4 top-6 h-40 w-40 rounded-full bg-white/70 blur-3xl" />
      </div>

      {checkoutStatus === "success" && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#9bd5c8] bg-[#e8f8f3] p-3 text-[#074f44]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold sm:text-sm">Your booking payment is complete.</p>
            <p className="mt-0.5 text-xs text-[#1c6459]">
              We&apos;ll use your checkout email to arrange your sessions and next steps.
            </p>
          </div>
        </div>
      )}

      {checkoutStatus === "cancelled" && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#e4cf9b] bg-[#fff9e9] p-3 text-[#6d5112]">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs font-bold sm:text-sm">Your booking was not completed.</p>
            <p className="mt-0.5 text-xs text-[#7e6221]">
              No payment was taken. You can choose your package again whenever you&apos;re ready.
            </p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="grid grid-cols-1 items-center gap-5 lg:grid-cols-12 lg:gap-7">
        <div className="min-w-0 lg:col-span-7">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#9bded3] bg-[#ecfbf7] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-[#07665d]">
            <Sparkles className="h-3 w-3" aria-hidden="true" />
            1-1 Med Interview Tutoring
          </span>
          <h1 className="mt-2 text-2xl font-bold leading-tight tracking-tight text-[#071923] sm:text-3xl lg:text-[2.25rem]">
            Personal coaching for your{" "}
            <span className="text-[#08756a]">strongest interview yet.</span>
          </h1>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-[#46606b] sm:text-sm">
            Work with an experienced <strong className="font-bold text-[#071923]">MedicForest specialist</strong> or directly with{" "}
            <strong className="font-bold text-[#071923]">@medwithrish</strong> to turn prepared answers into confident, natural performance—tailored to your target universities.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#d6e4e2] pt-3">
            {heroFeatures.map(({ icon: Icon, label }) => (
              <div key={label} className="min-w-0">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#b8e6dd] bg-[#effbf8] text-[#08756a] sm:h-8 sm:w-8">
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                </div>
                <p className="mt-1 text-[0.68rem] font-bold leading-tight text-[#19323c] sm:text-xs">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Outcome Card */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[#d6e2e2] bg-white shadow-xs lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[#e5eded] px-3.5 py-2 sm:px-4">
            <div>
              <p className="text-xs font-bold text-[#071923]">Student outcome</p>
              <p className="text-[0.62rem] font-medium text-[#69808a]">Real message · Real result</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f7f2] px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[#08756a]">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              Verified
            </span>
          </div>
          <div className="grid grid-cols-1 items-center gap-3 p-3 sm:grid-cols-[120px_1fr] sm:p-4">
            <div className="relative h-36 w-full shrink-0 overflow-hidden rounded-xl bg-[#101817] sm:w-[120px]">
              <Image
                src="/success-stories/story1.jpeg"
                alt="Message from a student confirming four medical school offers"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 640px) 90vw, 120px"
              />
            </div>
            <div className="min-w-0">
              <span className="inline-block rounded-md border border-[#afe4da] bg-[#effbf8] px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-[#08756a]">
                Medicine offers
              </span>
              <p className="mt-1 text-xl font-bold tracking-tight text-[#071923] sm:text-2xl">4 out of 4</p>
              <p className="mt-1 text-[0.72rem] leading-snug text-[#4b626d]">
                “Forgot to update you but got all 4 offers! Once again thanks for all your help.”
              </p>
              <div className="mt-2 border-t border-[#e5eded] pt-1.5 text-[0.64rem]">
                <p className="font-bold text-[#1b333d]">Manchester · Newcastle · KCL · Liverpool</p>
                <p className="text-[#71858d]">Med Interview tutoring student</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="mt-8 sm:mt-11" id="package">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.66rem] font-bold uppercase tracking-widest text-[#08756a]">Packages & Pricing</p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight text-[#071923] sm:text-2xl">
              Choose your preparation package
            </h2>
            <p className="mt-0.5 text-xs text-[#526a74]">
              Select focused 1-1 interview coaching or the all-in-one Complete Admissions Package.
            </p>
          </div>
          <div className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border border-[#cbdedb] bg-white px-2.5 py-1 text-[0.68rem] font-bold text-[#38545d] shadow-xs">
            <Clock3 className="h-3 w-3 text-[#08756a]" aria-hidden="true" />
            Flexible dates · Arranged around you
          </div>
        </div>

        {/* 2-Card Comparative Grid */}
        <div className="mt-4 grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
          {/* Card 1: 1-1 Interview Coaching Options (Specialist £100 vs Rish £140) */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#91cec4] bg-white p-4 shadow-xs sm:p-5">
            <div aria-hidden="true" className="pointer-events-none absolute right-[-3rem] top-[-3rem] h-32 w-32 rounded-full bg-[#dff5ef]" />
            <div className="relative min-w-0">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#effaf7] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-[#08756a]">
                  <Mic2 className="h-3 w-3" />
                  1-1 Interview Coaching
                </span>
                <span className="text-[0.66rem] font-medium text-[#657e87]">4 hours total</span>
              </div>

              {/* Tier Toggle Switch */}
              <div className="mt-3 grid grid-cols-2 rounded-xl border border-[#d8e5e3] bg-[#f3f7f6] p-1">
                <button
                  type="button"
                  onClick={() => setInterviewTier("specialist")}
                  className={`rounded-lg px-2 py-1.5 text-xs font-bold transition ${
                    interviewTier === "specialist"
                      ? "bg-[#08756a] text-white shadow-xs"
                      : "text-[#4d626b] hover:bg-white hover:text-[#17333b]"
                  }`}
                >
                  Specialist · £100
                </button>
                <button
                  type="button"
                  onClick={() => setInterviewTier("rish")}
                  className={`rounded-lg px-2 py-1.5 text-xs font-bold transition ${
                    interviewTier === "rish"
                      ? "bg-[#08756a] text-white shadow-xs"
                      : "text-[#4d626b] hover:bg-white hover:text-[#17333b]"
                  }`}
                >
                  With Rish · £140
                </button>
              </div>

              <div className="mt-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#071923] sm:text-base">{selectedInterviewPackage.name}</h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#506873]">
                    {selectedInterviewPackage.description}
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-[#c6e3dd] bg-[#effaf7] px-2.5 py-1.5 text-right">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-[#08756a]">One-off</p>
                  <p className="text-xl font-bold leading-tight text-[#071923]">£{selectedInterviewPackage.price}</p>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5">
                {selectedInterviewPackage.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 rounded-lg bg-[#f5f8f7] px-2.5 py-1.5 text-xs leading-snug text-[#314b55]">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0d9b89]" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-4 border-t border-[#e5eded] pt-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => startBooking(selectedInterviewPackage.id)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#08756a] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#055c54]"
                >
                  Book with {selectedInterviewPackage.shortLabel} for £{selectedInterviewPackage.price}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <a
                  href={whatsappHrefForPackage(selectedInterviewPackage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#b7d4cf] bg-white px-3 py-2 text-xs font-bold text-[#07665d] transition hover:border-[#08756a] hover:bg-[#f4fbf9]"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  Ask question
                </a>
              </div>
              <p className="mt-1.5 text-[0.64rem] text-[#72868d]">
                Includes 2 hours coaching + 2 mock interviews. Dates arranged directly with you.
              </p>
            </div>
          </div>

          {/* Card 2: Distinct Featured £200 MedicForest Specialist Complete Admissions Package */}
          <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#08756a] bg-gradient-to-b from-[#f2fbf8] via-white to-[#f4fbf9] p-4 shadow-[0_8px_30px_rgba(8,117,106,0.12)] sm:p-5">
            {/* Top Standout Ribbon */}
            <div className="absolute right-0 top-0">
              <span className="inline-flex items-center gap-1 rounded-bl-xl bg-[#08756a] px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-white shadow-xs">
                <Crown className="h-3 w-3 text-amber-300" />
                MOST POPULAR · ALL-IN-ONE
              </span>
            </div>

            <div className="relative min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#d8f3eb] px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-wider text-[#065b52]">
                  <Sparkles className="h-3 w-3 text-[#08756a]" />
                  Full Admissions Support
                </span>
                <span className="text-[0.66rem] font-bold text-[#08756a]">Save £140+ vs separate</span>
              </div>

              <div className="mt-2.5 flex items-start justify-between gap-3">
                <div className="min-w-0 pr-10 sm:pr-0">
                  <h3 className="text-sm font-bold text-[#071923] sm:text-base">
                    MedicForest Specialist Complete Admissions Package
                  </h3>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#43625e]">
                    End-to-end guidance across your whole application with a dedicated MedicForest Specialist.
                  </p>
                </div>
                <div className="shrink-0 rounded-xl border border-[#9bded3] bg-[#dff6f0] px-2.5 py-1.5 text-right">
                  <p className="text-[0.6rem] font-bold uppercase tracking-wider text-[#07665d]">Total bundle</p>
                  <p className="text-xl font-bold leading-tight text-[#063f38]">£200</p>
                  <p className="text-[0.6rem] text-[#4d7a74]">one-off payment</p>
                </div>
              </div>

              {/* 3 Step Inclusion Highlights */}
              <div className="mt-3 space-y-1.5">
                <div className="rounded-xl border border-[#b2e4d9] bg-white p-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#08756a] text-[0.6rem] font-bold text-white">1</span>
                    <p className="text-xs font-bold text-[#071923]">4 Hours 1-1 UCAT Crash Course</p>
                  </div>
                  <p className="mt-0.5 pl-5.5 text-[0.7rem] leading-snug text-[#4d6664]">
                    Master VR, DM, QR & SJT timing and high-yield question frameworks.
                  </p>
                </div>

                <div className="rounded-xl border border-[#b2e4d9] bg-white p-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#08756a] text-[0.6rem] font-bold text-white">2</span>
                    <p className="text-xs font-bold text-[#071923]">Personal Statement Complete Review</p>
                  </div>
                  <p className="mt-0.5 pl-5.5 text-[0.7rem] leading-snug text-[#4d6664]">
                    Draft analysis, structural critique, line-by-line feedback and polish.
                  </p>
                </div>

                <div className="rounded-xl border border-[#b2e4d9] bg-white p-2">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#08756a] text-[0.6rem] font-bold text-white">3</span>
                    <p className="text-xs font-bold text-[#071923]">4 Hours 1-1 Med Interview Tutoring</p>
                  </div>
                  <p className="mt-0.5 pl-5.5 text-[0.7rem] leading-snug text-[#4d6664]">
                    2 hrs technique mastery + 2 full realistic mock interviews with scorecards.
                  </p>
                </div>
              </div>

              <ul className="mt-2.5 space-y-1">
                <li className="flex items-center gap-1.5 text-[0.7rem] text-[#2c4e49]">
                  <Check className="h-3 w-3 shrink-0 text-[#08756a]" />
                  <span>Priority tutor matching and mentor messaging support</span>
                </li>
                <li className="flex items-center gap-1.5 text-[0.7rem] text-[#2c4e49]">
                  <Check className="h-3 w-3 shrink-0 text-[#08756a]" />
                  <span>University shortlisting strategy & application guidance</span>
                </li>
              </ul>
            </div>

            <div className="relative mt-4 border-t border-[#bce2da] pt-3">
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => startBooking("complete-bundle")}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#08756a] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#065b52]"
                >
                  Book Complete Package for £200
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <a
                  href={whatsappHrefForPackage(completeAdmissionsPackage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#08756a]/30 bg-white px-3 py-2 text-xs font-bold text-[#07665d] transition hover:bg-[#effbf8]"
                >
                  <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
              <p className="mt-1.5 text-[0.64rem] text-[#4d726c]">
                Secure Stripe checkout · Wired directly to the £200 Complete Admissions Package.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mt-8 rounded-2xl bg-[#052d29] p-4 text-white shadow-xs sm:mt-10 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#8be4d9]" aria-hidden="true" />
            <h3 className="text-xs font-bold sm:text-sm">How your 1-1 interview coaching works</h3>
          </div>
          <span className="hidden text-[0.66rem] text-[#a5ebe3] sm:inline-block">
            Built around your medical school deadlines
          </span>
        </div>

        <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {sessionPlan.map((step) => (
            <div key={step.number} className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#4d8e86] bg-[#0a3c37] text-[0.6rem] font-bold text-[#9ce8df]">
                {step.number}
              </span>
              <p className="mt-2 text-xs font-bold text-white">{step.title}</p>
              <p className="mt-1 text-[0.7rem] leading-relaxed text-[#bed5d2]">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Made Personal Section */}
      <section className="mt-5 rounded-2xl border border-[#d5e2e1] bg-white p-4 shadow-xs sm:p-5">
        <div className="max-w-xl">
          <p className="text-[0.66rem] font-bold uppercase tracking-wider text-[#08756a]">Made personal</p>
          <h2 className="mt-0.5 text-sm font-bold tracking-tight text-[#071923] sm:text-base">
            Built for the interview you&apos;re actually facing.
          </h2>
          <p className="mt-0.5 text-xs text-[#587079]">
            No generic scripts. Your sessions focus on the specific formats, medical schools and stations you need to sharpen.
          </p>
        </div>
        <div className="mt-3.5 grid grid-cols-1 gap-3 md:grid-cols-3">
          {interviewFormats.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="rounded-xl border border-[#e0e9e8] bg-[#f4f8f7] p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-[#08756a] shadow-xs">
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
              </div>
              <h3 className="mt-2 text-xs font-bold text-[#142d36]">{title}</h3>
              <p className="mt-0.5 text-[0.7rem] leading-relaxed text-[#5a7078]">{copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="mt-5 flex flex-col gap-3 rounded-2xl bg-[#dff3ee] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="text-xs font-bold text-[#062f2b] sm:text-sm">Ready to make your preparation count?</h2>
          <p className="mt-0.5 text-[0.72rem] text-[#365d59]">
            Choose your package, book securely, and we&apos;ll arrange your dates directly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => startBooking(selectedInterviewPackage.id)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#08756a] bg-white px-3 py-2 text-xs font-bold text-[#08756a] shadow-xs transition hover:bg-[#f2faf7]"
          >
            Book Interview Package (£{selectedInterviewPackage.price})
          </button>
          <button
            type="button"
            onClick={() => startBooking("complete-bundle")}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#08756a] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#055c54]"
          >
            Book Complete Package (£200)
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* Booking Checkout Modal */}
      {bookingOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#021d1a]/70 p-4 backdrop-blur-xs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loadingCheckout) setBookingOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-booking-title"
            className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-2xl sm:p-6"
          >
            <button
              type="button"
              onClick={() => setBookingOpen(false)}
              disabled={loadingCheckout}
              aria-label="Close booking"
              className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f5f4] text-[#526a72] transition hover:bg-[#e4eeec] disabled:cursor-wait disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            <span className="inline-flex items-center gap-1 rounded-full bg-[#e9f8f4] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-wider text-[#08756a]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Secure booking
            </span>
            <h2 id="interview-booking-title" className="mt-1.5 pr-8 text-base font-bold tracking-tight text-[#071923] sm:text-lg">
              Book your tutoring package
            </h2>
            <p className="mt-0.5 text-xs text-[#5c7179]">
              Select your package, enter your email and continue to Stripe payment.
            </p>

            {/* Package switcher inside modal */}
            <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl border border-[#d8e5e3] bg-[#f3f7f6] p-1">
              <button
                type="button"
                onClick={() => setBookingPackageId("interview-specialist")}
                className={`rounded-lg px-1.5 py-1.5 text-[0.68rem] font-bold transition ${
                  bookingPackageId === "interview-specialist"
                    ? "bg-[#08756a] text-white shadow-xs"
                    : "text-[#4d626b] hover:bg-white"
                }`}
              >
                Specialist · £100
              </button>
              <button
                type="button"
                onClick={() => setBookingPackageId("interview-rish")}
                className={`rounded-lg px-1.5 py-1.5 text-[0.68rem] font-bold transition ${
                  bookingPackageId === "interview-rish"
                    ? "bg-[#08756a] text-white shadow-xs"
                    : "text-[#4d626b] hover:bg-white"
                }`}
              >
                Rish · £140
              </button>
              <button
                type="button"
                onClick={() => setBookingPackageId("complete-bundle")}
                className={`rounded-lg px-1.5 py-1.5 text-[0.68rem] font-bold transition ${
                  bookingPackageId === "complete-bundle"
                    ? "bg-[#08756a] text-white shadow-xs"
                    : "text-[#4d626b] hover:bg-white"
                }`}
              >
                Complete · £200
              </button>
            </div>

            <div className="mt-2.5 rounded-xl border border-[#cbe4de] bg-[#f2faf7] p-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#071923]">{activeBookingPackage.name}</span>
                <span className="text-sm font-bold text-[#08756a]">£{activeBookingPackage.price}</span>
              </div>
              <p className="mt-0.5 text-[0.7rem] text-[#4f6b64]">{activeBookingPackage.description}</p>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="mt-3.5">
              <label htmlFor="interview-tutoring-email" className="text-xs font-bold text-[#223b44]">
                Email address
              </label>
              <input
                id="interview-tutoring-email"
                type="email"
                required
                autoFocus
                autoComplete="email"
                value={bookingEmail}
                onChange={(event) => setBookingEmail(event.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-xl border border-[#c9d9d7] bg-white px-3 py-2 text-xs text-[#071923] outline-none transition placeholder:text-[#93a3a8] focus:border-[#169789] focus:ring-2 focus:ring-[#169789]/15"
              />
              <p className="mt-1 text-[0.64rem] text-[#74868c]">
                Used for your receipt and to arrange your session schedule with you.
              </p>

              {checkoutError && (
                <div role="alert" className="mt-2 rounded-lg border border-[#efc5bf] bg-[#fff2f0] px-2.5 py-1.5 text-xs text-[#8a352b]">
                  {checkoutError}
                </div>
              )}

              <button
                type="submit"
                disabled={loadingCheckout}
                className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#08756a] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#055c54] disabled:cursor-wait disabled:opacity-70"
              >
                {loadingCheckout ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    Connecting to secure checkout…
                  </>
                ) : (
                  <>
                    Continue to secure payment (£{activeBookingPackage.price})
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            {showContactFallback && (
              <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-[#e3ebea] pt-2.5">
                <a
                  href={bookingMailHref}
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#bed4d0] px-2.5 py-1.5 text-xs font-bold text-[#07665d] hover:bg-[#f4fbf9]"
                >
                  <Mail className="h-3 w-3" aria-hidden="true" />
                  Email Rish
                </a>
                <a
                  href={whatsappHrefForPackage(activeBookingPackage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-lg border border-[#bed4d0] px-2.5 py-1.5 text-xs font-bold text-[#07665d] hover:bg-[#f4fbf9]"
                >
                  <MessageCircle className="h-3 w-3" aria-hidden="true" />
                  WhatsApp
                </a>
              </div>
            )}

            <p className="mt-2.5 text-center text-[0.6rem] text-[#7b8b90]">
              Card details are entered securely on Stripe&apos;s encrypted checkout page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
