"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Check, X } from "lucide-react";
import { MedicForestLandingShell } from "../../ucat/_components/MedicForestLandingShell";

const INTERVIEW_FREE_FEATURES = [
  "Why Medicine? AI interview station",
  "Complete GMC-aligned markschemes and scoring rubrics",
  "550+ question bank with search and filtering",
  "Study circles and collaborative practice groups",
  "Public leaderboard participation and score sharing",
  "Interview guides, university profiles and hot topics",
];

const INTERVIEW_PREMIUM_FEATURES = [
  "All free plan features included",
  "Full AI interview station practice across all topics",
  "Adaptive AI follow-up questions and probing",
  "Saved interview attempt history and review reports",
  "Structured multi-station mock circuits with timed delivery",
  "Performance tracking, theme breakdown and weekly insights",
  "Realistic speech recognition and audio playback",
];

const INTERVIEW_PRICING_ROWS: [string, string, string][] = [
  ["Why Medicine? station", "Unlimited", "Unlimited"],
  ["Question bank access", "550+ questions", "550+ questions"],
  ["Study groups & leaderboard", "Included", "Included"],
  ["Interview guides & criteria", "Included", "Included"],
  ["All AI interview topics", "Limited", "Unlimited"],
  ["AI follow-up questions", "Limited", "Included"],
  ["Saved feedback reports", "Latest attempt", "Unlimited history"],
  ["Full mock circuits", "Not included", "Included"],
  ["Speech-to-text practice", "Supported", "Supported"],
  ["Theme & weakness analytics", "Basic", "Advanced"],
];

function PricingComparisonValue({
  value,
  featured = false,
}: {
  value: string;
  featured?: boolean;
}) {
  if (value === "Included" || value === "Unlimited" || value === "Supported") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200">
        <Check className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Included</span>
      </span>
    );
  }

  if (value === "Not included") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400 ring-1 ring-slate-200">
        <X className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }

  if (value === "Advanced") {
    return (
      <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-black text-white shadow-sm shadow-blue-900/20">
        Advanced
      </span>
    );
  }

  if (value === "Limited" || value === "Basic") {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
        {value}
      </span>
    );
  }

  return (
    <span
      className={`text-sm font-black ${
        featured ? "text-blue-700" : "text-slate-600"
      }`}
    >
      {value}
    </span>
  );
}

export function MedicForestPricingPage() {
  const router = useRouter();
  const [premiumCheckoutLoading, setPremiumCheckoutLoading] = useState(false);
  const [premiumCheckoutError, setPremiumCheckoutError] = useState<string | null>(null);

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
        router.push("/medicforest/interview/dashboard");
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
    <MedicForestLandingShell>
      <div className="bg-white text-[#0b1143]">
        <section className="bg-[#050b1f] px-5 py-6 text-white lg:px-6">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/medicforest/interview/ai-interviews"
              className="inline-flex items-center gap-2 text-sm font-black text-blue-100 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Interviews
            </Link>
            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_330px] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                  Interview platform pricing
                </p>
                <h1 className="mt-2 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">
                  See exactly what you get before you upgrade.
                </h1>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-200">
                  Start with free question-bank practice, study groups and a
                  Why Medicine? interview attempt. Upgrade when you want the
                  full AI interview platform, saved reports and deeper
                  improvement analytics.
                </p>
              </div>
              <div className="rounded-xl border border-blue-300/40 bg-white/10 p-4 shadow-lg shadow-blue-950/20">
                <p className="text-xs font-black uppercase tracking-wide text-blue-100">
                  Premium
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-3xl font-black">GBP 14.99</span>
                  <span className="pb-1 text-sm font-bold text-slate-300">
                    / month
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-300">
                  Cancel through billing management. No card is needed for the
                  free interview plan.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-6 lg:px-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-blue-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black">Free Plan</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  Start here
                </span>
              </div>
              <div className="mt-3 text-4xl font-black">GBP 0</div>
              <p className="mt-2 text-sm font-bold text-slate-500">
                No card needed.
              </p>
              <ul className="mt-4 flex-1 space-y-2.5 pb-5 text-sm font-semibold text-slate-700">
                {INTERVIEW_FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/medicforest/interview/dashboard"
                className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
              >
                Launch Interview Platform
              </Link>
            </div>

            <div className="relative flex flex-col rounded-xl border-2 border-blue-500 bg-gradient-to-br from-white via-blue-50/70 to-indigo-50 p-5 shadow-xl shadow-blue-900/10">
              <div className="absolute right-4 top-0 -translate-y-1/2 rounded-full bg-blue-600 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-white shadow-lg shadow-blue-900/20">
                Upgrade
              </div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-black">MedicForest Premium</h2>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                  Full interview prep
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-4xl font-black">GBP 14.99</span>
                <span className="pb-2 text-base font-black text-slate-500">
                  / month
                </span>
              </div>
              <p className="mt-2 text-sm font-black text-blue-700">
                Best for full AI stations, realistic circuits and feedback you
                can use after every attempt.
              </p>
              <ul className="mt-4 flex-1 space-y-2.5 pb-5 text-sm font-semibold text-slate-700">
                {INTERVIEW_PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => void handlePremiumCheckout()}
                disabled={premiumCheckoutLoading}
                className="mt-auto h-11 rounded-lg bg-blue-600 px-5 text-sm font-black text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
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

          <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-500 sm:grid-cols-[1.2fr_1fr_1fr]">
              <span>Plan comparison</span>
              <span>Free Plan</span>
              <span className="text-blue-700">Premium</span>
            </div>
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold leading-5 text-slate-500">
                The free plan is built for regular interview practice. Premium
                adds the full AI feedback loop, saved reports, circuits and
                advanced analytics for serious interview preparation.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {INTERVIEW_PRICING_ROWS.map(([feature, freeValue, premiumValue]) => (
                <div
                  key={feature}
                  className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[1.2fr_1fr_1fr] sm:items-center"
                >
                  <p className="font-black text-slate-950">{feature}</p>
                  <div>
                    <PricingComparisonValue value={freeValue} />
                  </div>
                  <div>
                    <PricingComparisonValue value={premiumValue} featured />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-900">
            MedicForest is an independent educational tool. AI feedback and progress
            estimates are not guarantees of admissions or interview outcomes.
            Practice telemetry is used to
            provide feedback and progress tracking. Read the{" "}
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
        </section>
      </div>
    </MedicForestLandingShell>
  );
}
