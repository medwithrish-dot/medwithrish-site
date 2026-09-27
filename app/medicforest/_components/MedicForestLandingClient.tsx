"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Brain,
  Check,
  CheckCircle,
  Eye,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  UserRound,
} from "lucide-react";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";
import { MedicForestLandingShell } from "@/app/medicforest/ucat/_components/MedicForestLandingShell";
import { MedicForestLogo as MedicForestBrandLogo } from "@/app/medicforest/_components/MedicForestLogo";

const MEDICFOREST_FREE_FEATURES = [
  "Question bank practice",
  "Skills trainers",
  "Free QR diagnostic",
  "Limited weakness diagnosis",
  "Strength diagnosis",
  "1 lifetime AI diagnostic credit",
];

const MEDICFOREST_PREMIUM_FEATURES = [
  "Random question-bank diagnostic mocks",
  "Advanced weakness + strength diagnosis",
  "Deeper issue causes, evidence and specific fixes",
  "Personalised study plan and drills",
  "1 AI diagnostic credit every 24 hours",
  "Progress tracking over time",
];


function RedesignedTutorHero() {
  const router = useRouter();
  const [hasLandingDiagnosticReport, setHasLandingDiagnosticReport] =
    useState(false);
  const [premiumCheckoutLoading, setPremiumCheckoutLoading] = useState(false);
  const [premiumCheckoutError, setPremiumCheckoutError] = useState<string | null>(null);
  const featureCards = [
    {
      title: "Timing patterns",
      text: "See where you spent too long, and how it affected your accuracy.",
      icon: Timer,
      iconWrap: "bg-blue-50 text-blue-600",
    },
    {
      title: "Confidence patterns",
      text: "See where uncertainty, answer changes and timing combine to cost marks.",
      icon: CheckCircle,
      iconWrap: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "AI mistake diagnosis",
      text: "MedicForest explains the habit behind the miss, not just the right answer.",
      icon: Brain,
      iconWrap: "bg-violet-50 text-violet-600",
    },
    {
      title: "Personalised next step",
      text: "Get a focused recommendation for what to work on in the next question set.",
      icon: Target,
      iconWrap: "bg-orange-50 text-orange-600",
    },
  ];

  const productCards = [
    {
      title: "UCAT",
      status: "Work in progress",
      text: "Full-length practice, AI diagnosis, progress insights and personalised coaching.",
      icon: Brain,
      action: "Open UCAT dashboard",
      href: "/medicforest/ucat/dashboard",
      active: true,
    },
    {
      title: "Medicine Interview",
      status: "Work in progress",
      text: "Realistic MMI and panel preparation with answer feedback.",
      icon: UserRound,
      action: "Open interview dashboard",
      href: "/medicforest/interview/dashboard",
      active: true,
    },
    {
      title: "Dentistry Interview",
      status: "Coming Soon",
      text: "Dentistry-specific interview practice with confidence scoring.",
      icon: BadgeCheck,
      action: "Notify Me",
      active: false,
    },
  ];

  useEffect(() => {
    if (!hasSupabaseConfig()) return;

    let mounted = true;
    const supabase = createSupabaseClient();

    async function loadLandingDiagnosticStatus() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data } = await supabase
        .from("diagnostic_attempts")
        .select("completed_at")
        .eq("user_id", session.user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mounted) {
        setHasLandingDiagnosticReport(Boolean(data));
      }
    }

    void loadLandingDiagnosticStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePremiumCheckout = async () => {
    setPremiumCheckoutLoading(true);
    setPremiumCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (response.status === 401) {
        router.push("/medicforest/ucat/dashboard");
        setPremiumCheckoutLoading(false);
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setPremiumCheckoutLoading(false), 8000);
    } catch (error) {
      setPremiumCheckoutError(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setPremiumCheckoutLoading(false);
    }
  };

  return (
    <div className="bg-white">
      <section className="bg-[#050b1f] text-white">
        <div className="mx-auto max-w-5xl px-5 pt-4 pb-4 lg:px-6 lg:pt-5">
          <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_0.72fr]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                <Activity className="h-3 w-3" aria-hidden="true" />
                AI Medical Admissions Tutor
              </div>

              <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                Meet <span className="text-blue-500">Forest</span>
              </h1>

              <p className="mt-3 max-w-lg text-lg font-bold leading-tight text-white sm:text-xl">
                The <em className="italic">free</em> UCAT question bank and AI tutor that shows why you
                lose marks.
              </p>

              <p className="mt-3 max-w-lg text-xs leading-5 text-slate-200">
                MedicForest analyses your timing, confidence and answer changes
                to diagnose mistakes and recommend exactly what to work on next.
              </p>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/medicforest/ucat/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-base font-bold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-500"
                >
                  Log in / Launch UCAT Platform
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <Link
                  href="/medicforest/ucat/dashboard"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-400/45 bg-blue-500/10 px-6 text-base font-bold text-blue-100 transition-colors hover:border-blue-300 hover:bg-blue-500/20"
                >
                  <Target className="h-4 w-4" aria-hidden="true" />
                  Start Free Diagnostic
                </Link>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                (built by @medwithrish - leading medical admissions expert)
              </p>

              <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-3">
                {[
                  {
                    step: "1",
                    title: "Diagnostic",
                    text: "Complete a short timed UCAT set.",
                  },
                  {
                    step: "2",
                    title: "Fixes",
                    text: "Get your personalised study plan tasks.",
                  },
                  {
                    step: "3",
                    title: "Improve",
                    text: "Practise targeted tasks and track gains.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.step}
                    className={`flex gap-2 ${
                      index < 2 ? "sm:border-r sm:border-white/10 sm:pr-4" : ""
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-400/45 bg-slate-950/70 p-3 shadow-xl shadow-blue-950/20">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <MedicForestBrandLogo className="h-9 w-[118px]" onDark />
                  <div>
                    <h2 className="text-base font-black text-white">AI Diagnosis</h2>
                    <p className="text-[11px] text-slate-400">Based on your attempt</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-right">
                  <div className="text-[11px] font-bold text-white">UCAT Practice</div>
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-300">
                    Live Analysis
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-xl border border-red-400/25 bg-red-500/8 p-2.5">
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/12 text-red-300 ring-1 ring-red-400/25">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-red-300">Major issues</h3>
                      <ul className="mt-1 space-y-0.5 text-[11px] leading-4 text-slate-100">
                        <li>Spent too long reading extra information</li>
                        <li>Slow with calculator</li>
                        <li>18s over target</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/8 p-2">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 shrink-0 text-cyan-200" aria-hidden="true" />
                      <h3 className="text-[11px] font-bold text-cyan-200">Minor issues</h3>
                    </div>
                    <ul className="mt-1 space-y-0.5 text-[10px] leading-3 text-slate-100">
                      <li>Read stem before question</li>
                      <li>Re-read stem despite correct answer</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/8 p-2">
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-200" aria-hidden="true" />
                      <h3 className="text-[11px] font-bold text-emerald-200">Strengths</h3>
                    </div>
                    <ul className="mt-1 space-y-0.5 text-[10px] leading-3 text-slate-100">
                      <li>Triaging</li>
                      <li>Correctly identified difficult questions</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-violet-400/25 bg-violet-500/8 p-2.5">
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/12 text-violet-200 ring-1 ring-violet-400/25">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-violet-200">
                        Study Plan
                      </h3>
                      <ul className="mt-1 space-y-0.5 text-[11px] leading-4 text-slate-100">
                        <li>Calculator speed practice</li>
                        <li>7-minute timed QR sets until 85%+</li>
                        <li>Read the question before mining the stem</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                Based on timing, confidence and answer-change behaviour.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-6">
        <h2 className="text-center text-2xl font-black text-slate-950">
          What your normal question bank misses
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${feature.iconWrap}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-black text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-700">
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-center text-2xl font-black text-slate-950">
            Why this feels different
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
                <Brain className="h-4 w-4" aria-hidden="true" />
                Ordinary question banks
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-3 h-3 w-16 rounded-full bg-slate-200" />
                <div className="mb-2 h-2 w-48 rounded-full bg-slate-200" />
                <div className="h-2 w-72 max-w-full rounded-full bg-slate-200" />
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                  You got it wrong. The answer is C.
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate-600">
                Tells you what you got wrong.
              </p>
            </div>

            <div className="rounded-xl border border-blue-500 bg-white p-5 shadow-sm shadow-blue-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-700">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                MedicForest
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-3 flex flex-wrap gap-2">
                  {["Timing", "Confidence", "Answer change", "Question type"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-base font-semibold leading-7 text-slate-900">
                  You changed from the correct answer near the end after spending
                  too long on a distractor. Low confidence across similar questions
                  suggests this is a skill to prioritise.
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-slate-700">
                Shows you why and what to work on next.
              </p>
            </div>
          </div>
        </div>

        <div id="pricing" className="mt-7 scroll-mt-24 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Start with a free diagnostic.
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Try the core tools first. Upgrade for mock diagnostics, deeper fixes and daily AI feedback.
          </p>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl gap-5 lg:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-blue-500 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-950">Free Diagnostic</h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                Best for trying MedicForest
              </span>
            </div>
            <div className="mt-2 text-3xl font-black text-slate-950">GBP 0</div>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              No card needed.
            </p>
            <ul className="mt-4 flex-1 space-y-2 pb-5 text-sm text-slate-700">
              {MEDICFOREST_FREE_FEATURES.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={hasLandingDiagnosticReport ? "/medicforest/ucat/report" : "/medicforest/ucat/dashboard"}
              className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              {hasLandingDiagnosticReport ? "View Report" : "Start Free Diagnostic"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl border border-violet-300 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-950">MedicForest Premium</h3>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                Premium
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
              <span className="text-3xl font-black text-slate-950">GBP 14.99</span>
              <span className="pb-1 text-sm font-bold text-slate-500">/ month</span>
            </div>
            <p className="mt-2 w-fit rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
              Best for full UCAT prep
            </p>
            <ul className="mt-4 flex-1 space-y-2 pb-5 text-sm text-slate-700">
              {MEDICFOREST_PREMIUM_FEATURES.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void handlePremiumCheckout()}
              disabled={premiumCheckoutLoading}
              className="mt-auto h-10 w-full rounded-lg bg-violet-600 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {premiumCheckoutLoading ? "Opening checkout..." : "Upgrade to Premium"}
            </button>
            {premiumCheckoutError && (
              <p className="mt-3 text-xs font-bold leading-5 text-red-600">
                {premiumCheckoutError}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-900">
          MedicForest is an independent educational tool. AI feedback and progress
          estimates are not guarantees of UCAT, admissions or interview outcomes.
          Practice telemetry is used to provide feedback and progress tracking. Read the{" "}
          <Link href="/privacy-policy" className="font-black underline">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/terms-and-conditions" className="font-black underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/medicforest-disclaimer" className="font-black underline">
            AI/Data Disclaimer
          </Link>
          .
        </div>

        <div className="mt-7 text-center">
          <h2 className="text-xl font-black text-slate-950">
            Choose your preparation dashboard.
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            UCAT and medicine interview preparation are both in private preview.
          </p>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {productCards.map((product) => {
            const Icon = product.icon;
            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        product.active
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950">{product.title}</h3>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          product.active
                            ? "bg-blue-600 text-white"
                            : "bg-violet-50 text-violet-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 min-h-12 text-xs leading-5 text-slate-700">
                  {product.text}
                </p>
                <div
                  className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold ${
                    product.active
                      ? "bg-blue-600 text-white"
                      : "border border-violet-300 text-violet-700"
                  }`}
                >
                  {product.action}
                  {product.active && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </div>
              </>
            );

            return product.active && product.href ? (
              <Link
                key={product.title}
                href={product.href}
                className="rounded-xl border border-blue-500 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {content}
              </Link>
            ) : (
              <div
                key={product.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {content}
              </div>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 border-t border-slate-200 pt-5 text-xs text-slate-700 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Private by design",
              text: "Only the practice data needed for your feedback is used.",
            },
            {
              icon: ShieldCheck,
              title: "Clear explanations",
              text: "See the evidence behind every recommended next step.",
            },
            {
              icon: UserRound,
              title: "You are in control",
              text: "Choose your pace and update your plan whenever you want.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 leading-5">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TutorHero() {
  return <RedesignedTutorHero />;
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function MedicForestLandingPage({
  lockedArea = null,
}: {
  lockedArea?: "ucat" | "interview" | null;
}) {
  const lockedDashboard =
    lockedArea === "interview"
      ? {
          label: "Medicine interview dashboard",
          next: "/medicforest/interview/dashboard",
        }
      : lockedArea === "ucat"
        ? { label: "UCAT dashboard", next: "/medicforest/ucat/dashboard" }
        : null;

  return (
    <MedicForestLandingShell>
      <TutorHero />
      {lockedDashboard && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 px-5 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-lock-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-cyan-100 bg-white p-6 text-slate-950 shadow-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-widest text-cyan-700">
              Work in progress
            </p>
            <h2 id="preview-lock-title" className="mt-2 text-2xl font-black">
              The {lockedDashboard.label} is currently locked.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This area is still being polished. If you have the private access
              key, you can open the preview on this browser.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
              <Link
                href={`/medicforest/access?next=${encodeURIComponent(lockedDashboard.next)}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                Enter access key
              </Link>
              <Link
                href="/medicforest"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700"
              >
                Not yet
              </Link>
            </div>
          </div>
        </div>
      )}
    </MedicForestLandingShell>
  );
}
