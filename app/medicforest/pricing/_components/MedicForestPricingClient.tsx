"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  ShieldCheck,
  Users,
} from "lucide-react";
import { MedicForestLandingShell } from "@/app/medicforest/ucat/_components/MedicForestLandingShell";
import { MEDICFOREST_PREMIUM_MONTHLY_PRICE } from "@/utils/medicforest/premium-price";
import { medicForestPublicHref } from "@/utils/medicforest/public-navigation";
import { useVisiblePathname } from "@/app/medicforest/_components/useVisiblePathname";

const INTERVIEW_FREE_FEATURES = [
  "Unlimited Med interview question bank practice",
  "1 free 'Why Medicine?' AI attempt per account",
  "Free study groups and room practice",
  "University Med interview guides and station checklists",
  "Public leaderboard and community practice tools",
  "Basic progress tracking across completed questions",
];

const INTERVIEW_PREMIUM_FEATURES = [
  "Full AI Med interview station library",
  "Unlimited saved Med interview reports and transcripts",
  "AI feedback, scoring and mark scheme breakdowns",
  "Personalised Med interview plan and revision tasks",
  "MMI circuits, panel practice and university-specific stations",
  "Advanced analytics for timing, structure, confidence and improvement",
];

type CompareRow = {
  feature: string;
  free: boolean | string;
  premium: boolean | string;
};

const COMPARE_ROWS: CompareRow[] = [
  {
    feature: "Med interview question bank practice",
    free: true,
    premium: true,
  },
  {
    feature: "AI 'Why Medicine?' interview attempt",
    free: "1 attempt per account",
    premium: true,
  },
  {
    feature: "Full AI Med interview station library",
    free: false,
    premium: true,
  },
  {
    feature: "Saved interview reports and transcripts",
    free: false,
    premium: true,
  },
  {
    feature: "AI feedback, scoring and mark scheme breakdowns",
    free: "Sample feedback",
    premium: true,
  },
  {
    feature: "Personalised Med interview plan and revision tasks",
    free: false,
    premium: true,
  },
  {
    feature: "MMI circuits, panel practice and university-specific stations",
    free: false,
    premium: true,
  },
  {
    feature: "Advanced analytics for timing, structure, and confidence",
    free: false,
    premium: true,
  },
  {
    feature: "Free study groups and room practice",
    free: true,
    premium: true,
  },
  {
    feature: "University Med interview guides and station checklists",
    free: true,
    premium: true,
  },
  {
    feature: "Public leaderboard and community practice tools",
    free: true,
    premium: true,
  },
  {
    feature: "Basic progress tracking across completed questions",
    free: true,
    premium: true,
  },
];

export function MedicForestPricingPage() {
  const router = useRouter();
  const pathname = useVisiblePathname();
  const [premiumCheckoutLoading, setPremiumCheckoutLoading] = useState(false);
  const [premiumCheckoutError, setPremiumCheckoutError] = useState<string | null>(null);
  const [checkoutReturnStatus, setCheckoutReturnStatus] = useState<"idle" | "syncing" | "error">("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "success") return;

    const controller = new AbortController();
    const sessionId = params.get("session_id");
    if (!sessionId) {
      queueMicrotask(() => {
        if (!controller.signal.aborted) setCheckoutReturnStatus("error");
      });
      return () => controller.abort();
    }

    queueMicrotask(() => {
      if (!controller.signal.aborted) setCheckoutReturnStatus("syncing");
    });

    async function confirmCheckout() {
      try {
        const response = await fetch("/api/stripe/sync-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
          signal: controller.signal,
        });
        const result = (await response.json()) as { currentPlan?: string };
        if (!response.ok || result.currentPlan !== "premium") {
          throw new Error("Checkout is still being confirmed.");
        }
        if (!controller.signal.aborted) {
          router.replace(
            window.location.hostname === "medicforest.com"
              ? "/interviews/dashboard"
              : "/medicforest/interview/dashboard"
          );
        }
      } catch {
        if (!controller.signal.aborted) setCheckoutReturnStatus("error");
      }
    }

    void confirmCheckout();
    return () => controller.abort();
  }, [router]);

  const handlePremiumCheckout = async () => {
    if (new URLSearchParams(window.location.search).get("checkout") === "success") return;
    setPremiumCheckoutLoading(true);
    setPremiumCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ returnTo: "interviews" }),
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
      <div className="min-h-screen bg-[#f7faf8] text-slate-900 pb-16">
        <main className="mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10">
          {/* Back Navigation Link */}
          <div>
            <Link
              href={medicForestPublicHref(pathname, "/interviews")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-800 transition hover:text-teal-950 sm:text-sm"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              <span>Back to Med Interviews</span>
            </Link>
          </div>

          {/* Hero Header with Medical Stethoscope Art */}
          <div className="mt-5 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-wider text-teal-700 sm:text-xs">
                Med Interview Platform Pricing
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[40px] lg:leading-[1.15]">
                Choose the plan that fits your preparation.
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                Start with a free plan to practise and explore, or upgrade to Premium for the full AI Med interview platform, saved reports and advanced analytics.
              </p>
            </div>

            {/* Right illustration: Minimal mint doctor / stethoscope graphic */}
            <div className="hidden lg:flex items-center justify-end shrink-0">
              <div className="relative flex h-32 w-48 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-emerald-100/60 blur-2xl" />
                <svg
                  viewBox="0 0 160 130"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="relative z-10 h-28 w-44 text-teal-600/75"
                >
                  {/* Subtle sparkle radiate marks */}
                  <line x1="28" y1="28" x2="38" y2="38" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                  <line x1="56" y1="14" x2="58" y2="28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
                  <line x1="88" y1="22" x2="98" y2="14" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

                  {/* Stethoscope */}
                  <path
                    d="M92 34 C92 64, 126 64, 126 34"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="92" cy="32" r="3" fill="currentColor" />
                  <circle cx="126" cy="32" r="3" fill="currentColor" />
                  <path
                    d="M109 60 C109 84, 120 102, 142 102"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="142" cy="102" r="9" stroke="currentColor" strokeWidth="3.5" fill="#f7faf8" />
                  <circle cx="142" cy="102" r="4" fill="currentColor" />
                </svg>
              </div>
            </div>
          </div>

          {/* 3 Trust Badges Row */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 sm:text-sm">
                  No card needed for free plan
                </p>
                <p className="text-[11px] text-slate-500">
                  Get started instantly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 sm:text-sm">
                  Cancel anytime
                </p>
                <p className="text-[11px] text-slate-500">
                  No long-term commitment.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 sm:text-sm">
                  Built for realistic med interview prep
                </p>
                <p className="text-[11px] text-slate-500">
                  Trusted by thousands of future doctors.
                </p>
              </div>
            </div>
          </div>

          {/* Checkout Return Status Alerts */}
          {checkoutReturnStatus === "syncing" && (
            <p role="status" className="mt-6 rounded-xl border border-teal-200 bg-teal-50 p-4 text-xs font-bold text-teal-900 sm:text-sm">
              Confirming your Premium access…
            </p>
          )}
          {checkoutReturnStatus === "error" && (
            <p role="alert" className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-bold text-amber-900 sm:text-sm">
              Your checkout could not be confirmed yet. Refresh this page to try syncing it again before starting another payment.
            </p>
          )}

          {/* Two Plan Cards Grid */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Free Plan Card */}
            <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8">
              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  Free Plan
                </h2>

                <div className="mt-3">
                  <div className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                    GBP 0
                  </div>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    No card needed.
                  </p>
                </div>

                <ul className="mt-6 space-y-3 pb-6 text-xs text-slate-700 sm:text-sm">
                  {INTERVIEW_FREE_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/medicforest/interview/dashboard"
                className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#0c6b5e] px-5 text-sm font-bold text-white shadow-xs transition hover:bg-[#084e45]"
              >
                <span>Launch Med Interview Platform</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* MedicForest Premium Card */}
            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-teal-500 bg-white p-6 shadow-sm ring-4 ring-teal-500/10 sm:p-8">
              <div className="absolute right-6 top-6 sm:right-8 sm:top-8">
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/90 px-3 py-1 text-xs font-bold text-teal-800">
                  ★ Most Popular
                </span>
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                  MedicForest Premium
                </h2>

                {/* Price with subtle launch sale offer */}
                <div className="mt-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-lg font-bold text-slate-400 line-through sm:text-xl">
                      GBP 30
                    </span>
                    <span className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                      {MEDICFOREST_PREMIUM_MONTHLY_PRICE.label}
                    </span>
                    <span className="text-xs font-semibold text-slate-500 sm:text-sm">
                      / month
                    </span>
                  </div>

                  {/* Subtle Launch Offer Pill */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                      Launch offer 50% off!
                    </span>
                    <span className="text-slate-500 font-medium">
                      Limited time, buy now
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                  <strong className="text-slate-900">Everything you need</strong> for realistic, structured and effective Med interview preparation.
                </p>

                <ul className="mt-5 space-y-3 pb-6 text-xs text-slate-700 sm:text-sm">
                  {INTERVIEW_PREMIUM_FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <span className="leading-snug">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => void handlePremiumCheckout()}
                  disabled={premiumCheckoutLoading || checkoutReturnStatus !== "idle"}
                  className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-bold text-white shadow-xs transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-teal-300"
                >
                  <span>{premiumCheckoutLoading ? "Opening checkout..." : "Upgrade to Premium"}</span>
                  {!premiumCheckoutLoading && <ArrowRight className="h-4 w-4" />}
                </button>
                {premiumCheckoutError && (
                  <p className="mt-2 text-center text-xs font-semibold text-red-600">
                    {premiumCheckoutError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Compare Plans Table */}
          <section className="mt-12 sm:mt-16">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Compare plans
              </h2>
              <p className="text-xs text-slate-500">
                See what&apos;s included in each plan and find the best option for your preparation.
              </p>
            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
              {/* Table Header */}
              <div className="grid grid-cols-12 border-b border-slate-200/80 bg-slate-50/80 px-4 py-3.5 text-xs font-bold text-slate-600 sm:px-6">
                <div className="col-span-6 text-left">Feature</div>
                <div className="col-span-3 text-center">Free Plan</div>
                <div className="col-span-3 text-center">Premium</div>
              </div>

              {/* Table Rows */}
              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                {COMPARE_ROWS.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-12 items-center px-4 py-3 transition hover:bg-slate-50/50 sm:px-6"
                  >
                    <div className="col-span-6 font-medium text-slate-800 pr-2">
                      {row.feature}
                    </div>

                    <div className="col-span-3 flex items-center justify-center text-center text-xs font-semibold text-slate-600">
                      {row.free === true ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : row.free === false ? (
                        <span className="font-bold text-slate-300">-</span>
                      ) : (
                        <span>{row.free}</span>
                      )}
                    </div>

                    <div className="col-span-3 flex items-center justify-center text-center text-xs font-semibold text-slate-600">
                      {row.premium === true ? (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </span>
                      ) : (
                        <span>{row.premium}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Legal / AI Disclaimer Note */}
          <div className="mt-8 rounded-xl border border-slate-200/80 bg-slate-50/80 p-4 text-xs font-medium leading-5 text-slate-600">
            MedicForest is an independent educational tool. AI feedback and progress
            estimates are not guarantees of admissions or Med interview outcomes.
            Practice telemetry is used to provide feedback and progress tracking. Read the{" "}
            <Link href="/privacy-policy" className="font-bold text-slate-900 underline underline-offset-2">
              Privacy Policy
            </Link>
            ,{" "}
            <Link href="/terms-and-conditions" className="font-bold text-slate-900 underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/medicforest-disclaimer" className="font-bold text-slate-900 underline underline-offset-2">
              AI/Data Disclaimer
            </Link>
            .
          </div>
        </main>
      </div>
    </MedicForestLandingShell>
  );
}
