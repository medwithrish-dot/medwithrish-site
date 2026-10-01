"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  FileText,
  TrendingUp,
  CheckCircle2,
  ZoomIn,
  X,
  Sparkles,
  MessageCircle,
  Mail,
  Loader2,
  Calendar,
  Target,
  MessageSquareCheck,
  HeartHandshake,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

type OutcomeStory = {
  src: string;
  alt: string;
  tag: string;
  scoreHeading: string;
  quote: string;
  authorName: string;
  authorInitial: string;
  offers: string;
};

const outcomeStories: OutcomeStory[] = [
  {
    src: "/success-stories/story5.jpeg",
    alt: "Student UCAT score 2370 Band 2 feedback screenshot",
    tag: "UCAT SCORE",
    scoreHeading: "2370 B2!",
    quote:
      "Rish’s support gave me the confidence and structure I needed. The advice was tailored to my application and made a huge difference.",
    authorName: "Year 12 student",
    authorInitial: "A",
    offers: "Offers: Manchester",
  },
  {
    src: "/success-stories/story-2350-b1.png",
    alt: "Student UCAT score 2350 Band 1 feedback screenshot",
    tag: "UCAT SCORE",
    scoreHeading: "2350 B1!!",
    quote:
      "The sectional timing strategies and question breakdowns transformed how I approached Quantitative Reasoning and Decision Making.",
    authorName: "Year 13 applicant",
    authorInitial: "M",
    offers: "Offers: Bristol & Sheffield",
  },
  {
    src: "/success-stories/story-2410-b2.png",
    alt: "Student UCAT score 2410 Band 2 national top percentile",
    tag: "UCAT SCORE",
    scoreHeading: "2410 B2!",
    quote:
      "Achieved a top national percentile score. The focused drills and feedback made all the difference.",
    authorName: "Medical applicant",
    authorInitial: "S",
    offers: "Offers: King’s College London",
  },
  {
    src: "/success-stories/story1.jpeg",
    alt: "Student secured four out of four medicine offers",
    tag: "MEDICINE OFFERS",
    scoreHeading: "4 / 4 Medicine Offers",
    quote:
      "From personal statement guidance right through to MMI prep, the coaching gave me complete clarity at every stage.",
    authorName: "Year 13 student",
    authorInitial: "K",
    offers: "Offers: Birmingham, Nottingham & Leicester",
  },
  {
    src: "/success-stories/story-2340-b2.png",
    alt: "Student UCAT score 2340 Band 2 with 900 in QR",
    tag: "UCAT SCORE",
    scoreHeading: "2340 B2 (QR 900!)",
    quote:
      "Scored 900 full marks in Quantitative Reasoning using the calculator shortcuts and mental maths estimation rules.",
    authorName: "Medical applicant",
    authorInitial: "H",
    offers: "Offers: Newcastle",
  },
];

type TutorTier = "rish" | "specialist";

type PackageInfo = {
  id: string;
  name: string;
  price: number;
  tutorLabel: string;
  durationLabel: string;
  description: string;
  features: string[];
};

function StudentOutcomesCard({
  onZoom,
}: {
  onZoom: (story: OutcomeStory) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % outcomeStories.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + outcomeStories.length) % outcomeStories.length);
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next, paused]);

  const active = outcomeStories[current];

  return (
    <div
      className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition sm:p-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Card Header with Prev / Next */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
        <div>
          <h3 className="text-base font-bold text-slate-900 sm:text-lg">
            Student outcomes
          </h3>
          <p className="text-xs font-medium text-slate-500">
            Real results. Real progress.
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous outcome"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next outcome"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Two-column Body: Screenshot Left, Testimonial Right */}
      <div className="mt-4 grid items-center gap-4 sm:grid-cols-[150px_1fr] sm:gap-5">
        {/* Left: Chat screenshot with click-to-zoom */}
        <div
          className="group relative h-56 w-full cursor-zoom-in overflow-hidden rounded-xl border border-slate-200/80 bg-[#0f172a] p-1.5 shadow-inner sm:h-64 sm:w-[150px]"
          onClick={() => onZoom(active)}
          title="Click to view full screenshot"
        >
          {outcomeStories.map((story, i) => (
            <div
              key={story.src}
              className={`absolute inset-1.5 flex items-center justify-center transition-opacity duration-500 ease-in-out ${
                i === current
                  ? "pointer-events-auto opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
              aria-hidden={i !== current}
            >
              <Image
                src={story.src}
                alt={story.alt}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 150px, 200px"
                priority={i === 0}
              />
            </div>
          ))}

          <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white opacity-0 backdrop-blur-xs transition group-hover:opacity-100">
            <ZoomIn className="h-3 w-3" />
            <span>Expand</span>
          </div>
        </div>

        {/* Right: Outcome Details */}
        <div className="flex flex-col justify-between py-1">
          <div>
            <span className="inline-flex items-center rounded-md border border-teal-200/70 bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800">
              {active.tag}
            </span>

            <h4 className="mt-2 text-2xl font-black text-slate-900">
              {active.scoreHeading}
            </h4>

            <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
              &ldquo;{active.quote}&rdquo;
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between pt-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white shadow-xs">
                {active.authorInitial}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {active.authorName}
                </p>
                <p className="text-[11px] font-medium text-slate-500">
                  {active.offers}
                </p>
              </div>
            </div>

            {/* Pagination dots */}
            <div className="flex items-center gap-1.5">
              {outcomeStories.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to outcome slide ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-4 bg-teal-600"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TutoringPageClient() {
  const [zoomedStory, setZoomedStory] = useState<OutcomeStory | null>(null);

  // Card-specific tutor selections for UCAT and Interviews
  const [ucatTutor, setUcatTutor] = useState<TutorTier>("rish");
  const [interviewTutor, setInterviewTutor] = useState<TutorTier>("rish");

  // Booking modal and checkout state
  const [bookingPackage, setBookingPackage] = useState<PackageInfo | null>(null);
  const [loadingCheckout, setLoadingCheckout] = useState(false);

  // Global tutor preference toggle
  const applyGlobalTutor = (tier: TutorTier) => {
    setUcatTutor(tier);
    setInterviewTutor(tier);
  };

  const handleStartBooking = async (pkg: PackageInfo) => {
    setBookingPackage(pkg);
    setLoadingCheckout(true);

    try {
      const response = await fetch("/api/stripe/create-tutoring-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId: pkg.id }),
      });

      const data = (await response.json()) as {
        configured?: boolean;
        url?: string;
      };

      if (data.configured && data.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // Gracefully fall back to the booking dialogue
    } finally {
      setLoadingCheckout(false);
    }
  };

  const currentUcatPackage: PackageInfo =
    ucatTutor === "rish"
      ? {
          id: "ucat-rish",
          name: "UCAT Crash Course with MedWithRish",
          price: 140,
          tutorLabel: "Direct 1–to–1 coaching with @medwithrish",
          durationLabel: "4 hours total intensive tuition",
          description:
            "Intensive 1–to–1 tuition covering 1hr 20 VR, 1hr 20 DM, 1hr 20 QR (or 1hr across all 4 subtests).",
          features: [
            "4 hours of direct 1–to–1 coaching with Rish",
            "Flexible allocation: 1hr 20 VR, 1hr 20 DM, 1hr 20 QR or 1hr VR, 1hr DM, 1hr QR, 1hr SJT",
            "High–yield mental maths and calculator estimation techniques",
            "Syllogism and logical puzzle decision–tree frameworks",
            "Tailored diagnostic breakdown targeting your weakest subtests",
            "Actionable revision plan and personalised question schedule",
          ],
        }
      : {
          id: "ucat-specialist",
          name: "UCAT Crash Course with MedicForest Specialist",
          price: 100,
          tutorLabel: "With an experienced MedicForest UCAT Specialist",
          durationLabel: "4 hours total intensive tuition",
          description:
            "Complete 4–hour subtest breakdown covering VR, DM, QR and SJT timing and accuracy strategy.",
          features: [
            "4 hours of structured 1–to–1 tuition with an experienced specialist",
            "Choose 1hr 20 VR, 1hr 20 DM, 1hr 20 QR or 1hr across all 4 sections",
            "Step–by–step question walkthroughs and timed passage reading drills",
            "Official markscheme criteria and common pitfall analysis",
            "Focused homework tasks with review between sessions",
          ],
        };

  const completeAdmissionsPackage: PackageInfo = {
    id: "complete-bundle",
    name: "Complete Admissions Package",
    price: 200,
    tutorLabel: "With a MedicForest Admissions Specialist",
    durationLabel: "All–inclusive package • 8 hours tuition + PS support",
    description:
      "All–inclusive support covering UCAT, Personal Statement and Interview coaching from start to finish.",
    features: [
      "4 hours UCAT Crash Course across all 4 core subtests",
      "Personal Statement complete support: brainstorming, draft review and line–by–line refinement",
      "4 hours 1–1 Interview Tutoring: 2 hrs technique mastery + 2 full realistic mock interviews",
      "Detailed written feedback and scorecard after each mock interview",
      "University shortlisting strategy and application guidance",
      "Priority scheduling and mentor messaging between sessions",
    ],
  };

  const currentInterviewPackage: PackageInfo =
    interviewTutor === "rish"
      ? {
          id: "interview-rish",
          name: "1–1 Interview Tutoring with MedWithRish",
          price: 140,
          tutorLabel: "Direct 1–to–1 coaching with @medwithrish",
          durationLabel: "4 hours total: 2 hrs coaching + 2 mock interviews",
          description:
            "Complete 1–to–1 interview preparation including 2 hrs on core basics and 2 realistic mock interviews with feedback.",
          features: [
            "2 hours on core basics, answer structures and ethical decision–making",
            "2 full realistic mock interviews (MMI and panel stations)",
            "Detailed verbal and written feedback after each mock",
            "University–specific station frameworks and scoring rubrics",
            "Techniques for NHS hot topics, STARR examples and reflective answers",
            "Direct post–session feedback summaries and practice tasks",
          ],
        }
      : {
          id: "interview-specialist",
          name: "1–1 Interview Tutoring with MedicForest Specialist",
          price: 100,
          tutorLabel: "With an experienced MedicForest Interview Specialist",
          durationLabel: "4 hours total: 2 hrs coaching + 2 mock interviews",
          description:
            "Complete 1–to–1 interview tutoring including 2 hrs on techniques and 2 realistic mock interviews with feedback.",
          features: [
            "2 hours on proven interview techniques and station confidence",
            "2 full realistic mock interviews simulating real medical school formats",
            "Actionable feedback and scoring breakdown after every station",
            "Model answers and structure guides for challenging questions",
            "Comprehensive review of ethics, communication and teamwork stations",
          ],
        };

  return (
    <MedicForestLandingShell>
      <div className="relative min-h-screen bg-[#f4faf7] px-6 py-8 sm:px-10 lg:py-10">
        {/* Soft background mint glow decoration */}
        <div
          className="pointer-events-none absolute right-0 top-0 -z-10 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-teal-200/35 via-emerald-100/25 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-6xl space-y-12">
          {/* Top Hero: Two-column layout matching design screenshot */}
          <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Left Column: Headlines, Copy & Feature Highlights */}
            <div>
              <span className="inline-flex items-center rounded-full border border-teal-100/90 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
                1–1 Tutoring
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Personalised support{" "}
                <span className="block text-[#0d5c4d] sm:inline">
                  for your medical journey.
                </span>
              </h1>

              <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
                Work directly with{" "}
                <strong className="font-bold text-slate-900">
                  @medwithrish
                </strong>{" "}
                — a leading medical admissions expert who has helped students
                achieve strong UCAT scores, secure multiple medicine offers, and
                ace their interviews.
              </p>

              {/* Three Circular Feature Bullets in a Row */}
              <div className="mt-7 grid grid-cols-3 gap-4 border-t border-slate-200/60 pt-6">
                <div className="flex flex-col items-start gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200/60 bg-teal-50 text-[#0d5c4d] shadow-2xs">
                    <User className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-800 sm:text-sm">
                    Tailored to your goals
                  </span>
                </div>

                <div className="flex flex-col items-start gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200/60 bg-teal-50 text-[#0d5c4d] shadow-2xs">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-800 sm:text-sm">
                    Practical, actionable advice
                  </span>
                </div>

                <div className="flex flex-col items-start gap-2.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-teal-200/60 bg-teal-50 text-[#0d5c4d] shadow-2xs">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold leading-snug text-slate-800 sm:text-sm">
                    Support at every stage
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Student outcomes transitioning carousel */}
            <StudentOutcomesCard onZoom={(story) => setZoomedStory(story)} />
          </div>

          {/* Tutoring Packages Section */}
          <section className="space-y-6 pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 sm:text-3xl">
                  Tutoring packages
                </h2>
                <p className="mt-1 text-sm font-medium text-slate-600 sm:text-base">
                  Choose the level of support that’s right for you.
                </p>
              </div>

              {/* Master Tutor Preference Switcher */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => applyGlobalTutor("rish")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    ucatTutor === "rish" && interviewTutor === "rish"
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  With @medwithrish (£140)
                </button>
                <button
                  type="button"
                  onClick={() => applyGlobalTutor("specialist")}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    ucatTutor === "specialist" && interviewTutor === "specialist"
                      ? "bg-[#0d5c4d] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  With Specialist (£100 / £200)
                </button>
              </div>
            </div>

            {/* 3 Packages Side-by-Side: UCAT | Featured Complete | Interviews */}
            <div className="grid gap-6 lg:grid-cols-3 lg:items-stretch">
              {/* Package 1: UCAT Crash Course */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    UCAT Crash Course
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Intensive 4–hour subtest strategy and timed question technique.
                  </p>

                  {/* Tutor Selector Pills */}
                  <div className="mt-4 flex rounded-lg border border-slate-200/80 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setUcatTutor("rish")}
                      className={`flex-1 rounded-md py-1 text-[11px] font-bold transition ${
                        ucatTutor === "rish"
                          ? "bg-white text-teal-800 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      MedWithRish (£140)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUcatTutor("specialist")}
                      className={`flex-1 rounded-md py-1 text-[11px] font-bold transition ${
                        ucatTutor === "specialist"
                          ? "bg-white text-teal-800 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Specialist (£100)
                    </button>
                  </div>

                  {/* Price Tag */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        £{currentUcatPackage.price}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        / 4–hour course
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-teal-700">
                      {currentUcatPackage.tutorLabel}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                    {currentUcatPackage.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                        <span className="text-xs font-medium leading-relaxed text-slate-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => handleStartBooking(currentUcatPackage)}
                    disabled={loadingCheckout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-700/80 bg-teal-50 px-4 py-3 text-xs font-bold text-teal-800 transition hover:bg-teal-100/70"
                  >
                    <span>Book UCAT Course</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Package 2 (FEATURED / STANDOUT): Complete Admissions Package */}
              <div className="relative flex flex-col justify-between rounded-2xl border-2 border-teal-600 bg-white p-6 shadow-md transition hover:shadow-lg">
                {/* Floating Top Badge */}
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0d5c4d] px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-white shadow-xs">
                    <Sparkles className="h-3 w-3 text-teal-200" />
                    MOST POPULAR — ALL–IN–ONE
                  </span>
                </div>

                <div>
                  <div className="mt-1 flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">
                      Complete Admissions Package
                    </h3>
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    Comprehensive 360° support across every stage of your medical application.
                  </p>

                  {/* Specialist Tag */}
                  <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50/70 px-3 py-1.5 text-center text-xs font-bold text-teal-800">
                    Full Admissions Bundle • MedicForest Specialist
                  </div>

                  {/* Price Tag */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-slate-900">
                        £{completeAdmissionsPackage.price}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        / complete package
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-emerald-700">
                      Best value — combines 4 hrs UCAT + PS + 4 hrs Interviews
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                    {completeAdmissionsPackage.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                        <span className="text-xs font-medium leading-relaxed text-slate-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => handleStartBooking(completeAdmissionsPackage)}
                    disabled={loadingCheckout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d5c4d] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#094338]"
                  >
                    <span>Book Complete Package</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Package 3: 1–1 Interview Tutoring */}
              <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div>
                  <h3 className="text-xl font-black text-slate-900">
                    1–1 Interview Tutoring
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    MMI and panel interview coaching with realistic mock simulations.
                  </p>

                  {/* Tutor Selector Pills */}
                  <div className="mt-4 flex rounded-lg border border-slate-200/80 bg-slate-50 p-0.5">
                    <button
                      type="button"
                      onClick={() => setInterviewTutor("rish")}
                      className={`flex-1 rounded-md py-1 text-[11px] font-bold transition ${
                        interviewTutor === "rish"
                          ? "bg-white text-teal-800 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      MedWithRish (£140)
                    </button>
                    <button
                      type="button"
                      onClick={() => setInterviewTutor("specialist")}
                      className={`flex-1 rounded-md py-1 text-[11px] font-bold transition ${
                        interviewTutor === "specialist"
                          ? "bg-white text-teal-800 shadow-2xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Specialist (£100)
                    </button>
                  </div>

                  {/* Price Tag */}
                  <div className="mt-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        £{currentInterviewPackage.price}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        / 4–hour package
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-medium text-teal-700">
                      {currentInterviewPackage.tutorLabel}
                    </p>
                  </div>

                  {/* Feature Checklist */}
                  <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-4">
                    {currentInterviewPackage.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-2.5">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-teal-600" />
                        <span className="text-xs font-medium leading-relaxed text-slate-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4">
                  <button
                    type="button"
                    onClick={() => handleStartBooking(currentInterviewPackage)}
                    disabled={loadingCheckout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-teal-700/80 bg-teal-50 px-4 py-3 text-xs font-bold text-teal-800 transition hover:bg-teal-100/70"
                  >
                    <span>Book Interview Tutoring</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* What's Included Section: 4 Compact Cards */}
          <section className="space-y-4 pt-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                What’s included
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-600">
                Every session is tailored to where you are and what you need most.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-[#0d5c4d]">
                  <Calendar className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-slate-900">
                  Personalised session plan
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Customised to your target universities, current scoring baseline and specific focus areas.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-[#0d5c4d]">
                  <Target className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-slate-900">
                  Targeted strategies
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Proven frameworks for time management, mental maths, MMI stations and ethical scenarios.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-[#0d5c4d]">
                  <MessageSquareCheck className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-slate-900">
                  Detailed feedback
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Honest, constructive analysis with clear next steps after every coaching session.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-teal-100 bg-teal-50 text-[#0d5c4d]">
                  <HeartHandshake className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-slate-900">
                  Ongoing support
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Direct follow–up between sessions to review homework drills, check answers and track progress.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Booking Dialogue / Modal */}
      {bookingPackage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          onClick={() => setBookingPackage(null)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setBookingPackage(null)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200"
              aria-label="Close booking modal"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
              Booking Enquiry
            </span>

            <h3 className="mt-3 text-xl font-black text-slate-900">
              {bookingPackage.name}
            </h3>
            <p className="mt-1 text-2xl font-black text-[#0d5c4d]">
              £{bookingPackage.price}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {bookingPackage.durationLabel}
            </p>

            <div className="mt-5 space-y-3">
              {loadingCheckout ? (
                <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-6 text-sm font-bold text-slate-600">
                  <Loader2 className="h-5 w-5 animate-spin text-teal-700" />
                  <span>Connecting to secure checkout…</span>
                </div>
              ) : (
                <>
                  <a
                    href={`mailto:medwithrish@gmail.com?subject=${encodeURIComponent(
                      `Booking: ${bookingPackage.name} (£${bookingPackage.price})`
                    )}&body=${encodeURIComponent(
                      `Hi Rish,\n\nI would like to book the ${bookingPackage.name} (£${bookingPackage.price}).\n\nTarget Universities:\nKey Areas / Dates:\n\nThank you!`
                    )}`}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d5c4d] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#094338]"
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email to confirm booking</span>
                  </a>

                  <a
                    href={`https://wa.me/447305422619?text=${encodeURIComponent(
                      `Hi Rish, I'm interested in booking the ${bookingPackage.name} (£${bookingPackage.price}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    <span>Message on WhatsApp</span>
                  </a>
                </>
              )}
            </div>

            <p className="mt-5 text-center text-xs text-slate-500">
              Sessions are arranged based on your availability. Weekdays and weekends available.
            </p>
          </div>
        </div>
      )}

      {/* Full Image Zoom Modal */}
      {zoomedStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          onClick={() => setZoomedStory(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-white p-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomedStory(null)}
              className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
              aria-label="Close zoomed image"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative h-[70vh] w-[85vw] max-w-2xl">
              <Image
                src={zoomedStory.src}
                alt={zoomedStory.alt}
                fill
                className="object-contain"
                sizes="90vw"
              />
            </div>
            <div className="px-3 py-2 text-center">
              <p className="text-sm font-bold text-slate-900">
                {zoomedStory.scoreHeading}
              </p>
              <p className="text-xs text-slate-500">{zoomedStory.quote}</p>
            </div>
          </div>
        </div>
      )}
    </MedicForestLandingShell>
  );
}
