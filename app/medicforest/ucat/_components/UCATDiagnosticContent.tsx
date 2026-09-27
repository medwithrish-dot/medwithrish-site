"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle,
  Clock3,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";
import {
  type DashboardDiagnostic,
  formatDiagnosticReportDate,
  formatDigitalCountdown,
  getAiDiagnosticCreditDisplay,
  getNextAiDiagnosticCreditAt,
  isFreeQrDiagnostic,
} from "../_lib/ucatDiagnostics";

export type UCATDiagnosticContentProps = {
  isPremium: boolean;
  latestDiagnostic: DashboardDiagnostic | null;
  diagnosticHistory: DashboardDiagnostic[];
  plan: string;
  diagnosticCredits: number;
  aiDiagnosticLastUsedAt?: string | null;
};

const timingPrompts = [
  [
    "Best before starting a study session",
    "Know where to focus your time for maximum impact.",
    BarChart3,
  ],
  [
    "After a few practice sets",
    "Measure your progress and adjust your plan.",
    Clock3,
  ],
  [
    "When scores feel stuck",
    "Get fresh insights to break through plateaus.",
    Target,
  ],
] as const;

const diagnosticTools = [
  {
    title: "Score movement pending",
    text: "Complete and mark diagnostics so MedicForest can compare your points and deciles over time.",
    cta: "View progress",
    icon: Target,
    iconClass: "bg-indigo-50 text-blue-600",
    href: "/medicforest/ucat/progress",
    linkClass: "border-blue-100 text-blue-600 hover:bg-blue-50",
  },
  {
    title: "Personalised feedback",
    text: "Get AI-powered insights and targeted recommendations based on your results.",
    cta: "See insights",
    icon: Sparkles,
    iconClass: "bg-violet-50 text-violet-600",
    href: "/medicforest/ucat/report",
    linkClass: "border-violet-100 text-violet-600 hover:bg-violet-50",
  },
] as const;

const approachSteps = [
  {
    title: "Sit a focused diagnostic",
    text: "A 10-15 minute timed set targets specific question styles to record genuine performance signals.",
  },
  {
    title: "Detect underlying issues",
    text: "MedicForest analyses response latency, calculator habits and decision confidence to isolate root causes.",
  },
  {
    title: "Review actionable feedback",
    text: "Detailed report cards and AI guidance translate raw marks into tangible coaching advice.",
  },
  {
    title: "Drill personalised study tasks",
    text: "Targeted trainers and question sets address identified weaknesses before your next full practice.",
  },
] as const;

function sectionBadgeStyle(code: string) {
  switch (code.toUpperCase()) {
    case "VR":
      return "bg-blue-50 text-blue-600";
    case "DM":
      return "bg-indigo-50 text-indigo-600";
    case "QR":
      return "bg-emerald-50 text-emerald-600";
    case "SJT":
      return "bg-violet-50 text-violet-600";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

/**
 * Isolated countdown component that only re-renders itself every second
 * when cooling down, leaving the surrounding diagnostic dashboard stable.
 */
function AiDiagnosticCreditCountdownBadge({
  plan,
  diagnosticCredits,
  lastUsedAt,
}: {
  plan: string;
  diagnosticCredits: number;
  lastUsedAt?: string | null;
}) {
  const [now, setNow] = useState(() => Date.now());
  const nextAvailableAt = getNextAiDiagnosticCreditAt(lastUsedAt);

  useEffect(() => {
    if (plan.toLowerCase() !== "premium" || !nextAvailableAt) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [nextAvailableAt, plan]);

  const creditDisplay = getAiDiagnosticCreditDisplay({
    plan,
    diagnosticCredits,
    lastUsedAt,
    now,
  });

  const creditIsCoolingDown = creditDisplay.status.startsWith("Available in");
  const creditIsAvailable = creditDisplay.status === "Available";

  const creditStatusClass = creditIsAvailable
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : creditIsCoolingDown
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-600";

  const creditTimerText = creditIsCoolingDown
    ? creditDisplay.status
    : creditIsAvailable
      ? "Available"
      : plan.toLowerCase() === "premium"
        ? "Refresh pending"
        : "Upgrade for a daily refresh";

  return { creditDisplay, creditIsAvailable, creditStatusClass, creditTimerText };
}

export function UCATDiagnosticContent({
  isPremium,
  latestDiagnostic,
  diagnosticHistory,
  plan,
  diagnosticCredits,
  aiDiagnosticLastUsedAt,
}: UCATDiagnosticContentProps) {
  const hasDiagnostic = Boolean(latestDiagnostic);
  const diagnosticFeaturesUnlocked =
    isPremium || isFreeQrDiagnostic(latestDiagnostic);

  const {
    creditDisplay,
    creditIsAvailable,
    creditStatusClass,
    creditTimerText,
  } = AiDiagnosticCreditCountdownBadge({
    plan,
    diagnosticCredits,
    lastUsedAt: aiDiagnosticLastUsedAt,
  });

  const latestReportHref = latestDiagnostic
    ? `/medicforest/ucat/report?attempt=${encodeURIComponent(latestDiagnostic.id)}`
    : "/medicforest/ucat/report";

  const creditCtaHref =
    !isPremium && diagnosticCredits <= 0
      ? "/medicforest/pricing"
      : hasDiagnostic
        ? latestReportHref
        : "/medicforest/ucat/question-bank/qr?diagnostic=free-qr";

  const creditCtaLabel =
    !isPremium && diagnosticCredits <= 0
      ? "View plans"
      : hasDiagnostic
        ? "Open AI report"
        : "Start diagnostic";

  const recentDiagnostics = diagnosticHistory.slice(0, 6);

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1.85fr_1fr]">
          <div>
            <p className="px-1 text-xs font-black uppercase tracking-wide text-blue-600">
              Start your diagnostic
            </p>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 p-5 text-white shadow-sm">
                <span className="relative inline-flex rounded-lg bg-emerald-900/25 px-3 py-2 text-[11px] font-black uppercase">
                  {hasDiagnostic ? "Report ready" : "Free first-read"}
                </span>
                <h2 className="relative mt-6 text-xl font-black">
                  {hasDiagnostic ? "View free diagnostic report" : "Start free diagnostic"}
                </h2>
                <p className="relative mt-2 max-w-[19rem] text-sm font-bold leading-6 text-emerald-50">
                  {hasDiagnostic
                    ? "Your latest diagnostic is saved with issues, strengths and next steps."
                    : "A fixed QR first-read to uncover key areas for improvement."}
                </p>
                <ul className="relative mt-5 space-y-2 text-sm font-bold text-emerald-50">
                  {(hasDiagnostic
                    ? [
                        `${latestDiagnostic?.section ?? "QR"} diagnostic saved`,
                        diagnosticFeaturesUnlocked
                          ? "Report and study tasks ready"
                          : "Report ready; study plan locked",
                        latestDiagnostic?.aiFeedbackText
                          ? "AI feedback ready"
                          : "AI feedback status saved",
                      ]
                    : [
                        "14 QR questions",
                        "10 minutes",
                        "1 lifetime AI feedback credit",
                      ]
                  ).map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={hasDiagnostic ? latestReportHref : "/medicforest/ucat/question-bank/qr?diagnostic=free-qr"}
                  className="relative mt-auto flex h-11 items-center justify-center gap-3 rounded-lg bg-white px-5 text-sm font-black text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
                >
                  {hasDiagnostic ? "View report" : "Start free diagnostic"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-950 p-5 text-white shadow-sm">
                <span className="relative inline-flex rounded-lg bg-white/15 px-3 py-2 text-[11px] font-black uppercase">
                  Premium diagnostic
                </span>
                <h2 className="relative mt-6 text-xl font-black">
                  Mock diagnostic
                </h2>
                <p className="relative mt-2 max-w-[21rem] text-sm font-bold leading-6 text-blue-50">
                  Run a UCAT-style diagnostic sourced from random uncompleted
                  question-bank items.
                </p>
                <ul className="relative mb-8 mt-5 space-y-2 text-sm font-bold text-blue-50">
                  {[
                    "Full mock: VR 44, DM 35, QR 36, SJT 69",
                    "Random source from each question bank",
                    "Completed questions are saved to progress",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/medicforest/ucat/mocks/full"
                  className="relative mt-auto flex h-11 items-center justify-center gap-3 rounded-lg bg-white px-5 text-sm font-black text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                >
                  Choose mock
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <aside className="border-t border-slate-200 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xs font-black uppercase tracking-wide">
                Latest diagnostic
              </h2>
              <span className={`text-xs font-black ${hasDiagnostic ? "text-emerald-600" : "text-slate-500"}`}>
                {hasDiagnostic ? "Saved" : "Empty"}
              </span>
            </div>
            {hasDiagnostic ? (
              <div className="mt-7 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <h3 className="max-w-sm text-xl font-black leading-tight">
                  {latestDiagnostic?.section ?? "UCAT"} diagnostic report ready
                </h3>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-emerald-900">
                  Open the saved report to review issues, study tasks and AI
                  feedback status.
                </p>
              </div>
            ) : (
              <div className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <h3 className="max-w-sm text-xl font-black leading-tight">
                  No diagnostic completed yet
                </h3>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-600">
                  Mark a practice set or run a diagnostic to populate this panel with real data.
                </p>
              </div>
            )}
            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-600">
              {hasDiagnostic
                ? latestDiagnostic?.aiFeedbackText
                  ? "AI feedback is saved with this diagnostic."
                  : "Open the report to generate AI feedback for this diagnostic."
                : "AI feedback will stay empty until there is saved practice or diagnostic data."}
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3 xl:grid-cols-3">
              {([
                [
                  "Status",
                  hasDiagnostic
                    ? latestDiagnostic?.aiFeedbackText
                      ? "AI ready"
                      : "Report ready"
                    : "No data",
                  Activity,
                  hasDiagnostic ? "text-emerald-600" : "text-slate-500",
                ],
                [
                  "Last updated",
                  hasDiagnostic
                    ? formatDiagnosticReportDate(latestDiagnostic?.completedAt ?? null)
                    : "Never",
                  Clock3,
                  hasDiagnostic ? "text-blue-600" : "text-slate-500",
                ],
                [
                  "Accuracy",
                  hasDiagnostic ? `${latestDiagnostic?.accuracy ?? 0}%` : "-",
                  BarChart3,
                  hasDiagnostic ? "text-violet-600" : "text-slate-500",
                ],
              ] as const).map(([label, value, Icon, colorClass]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-5 w-5 ${colorClass}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-700">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-slate-500">
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={latestReportHref}
              className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              {hasDiagnostic ? "Open latest report" : "View full report"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.3fr]">
        {diagnosticTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <section
              key={tool.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.iconClass}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black">{tool.title}</h2>
                  <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                    {tool.text}
                  </p>
                  <Link
                    href={tool.href}
                    className={`mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-black ${tool.linkClass}`}
                  >
                    {tool.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        <section className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-sm">
          <div className="flex h-full flex-col gap-4 p-4">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <BadgeCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black">AI diagnostic credit</h2>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${creditStatusClass}`}>
                    {creditIsAvailable ? "Ready now" : creditDisplay.status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
                  Turn a saved diagnostic into a written AI report with specific
                  fixes, issue causes and next tasks.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={creditCtaHref}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-xs font-black text-white transition-colors hover:bg-blue-700"
                  >
                    {creditCtaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/medicforest/account"
                    className="inline-flex min-h-10 items-center justify-center rounded-lg border border-blue-100 bg-white px-5 py-2 text-xs font-black text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Credit settings
                  </Link>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white bg-white/85 p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                      Daily AI report
                    </p>
                    <p className="mt-1 text-3xl font-black leading-none text-blue-600">
                      {creditDisplay.value}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-black ${
                      isPremium
                        ? "bg-violet-50 text-violet-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {isPremium ? "Premium" : "Free"}
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-bold leading-4 text-slate-500">
                  {creditDisplay.helper}
                </p>
              </div>
              <div className="rounded-xl border border-white bg-white/85 p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                      Refresh
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-black text-slate-900">
                      {creditTimerText}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.85fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-black">Recent diagnostic history</h2>
            <Link
              href="/medicforest/ucat/report"
              className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
            >
              View all history
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            {recentDiagnostics.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  No diagnostics recorded yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Completed diagnostics will appear here after they are saved.
                </p>
              </div>
            ) : (
              recentDiagnostics.map((item, index) => {
                const badgeClass = sectionBadgeStyle(item.section);
                const reportHref = `/medicforest/ucat/report?attempt=${encodeURIComponent(item.id)}`;
                const aiReady = Boolean(item.aiFeedbackText);
                return (
                  <div
                    key={item.id}
                    className="grid gap-4 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-2 text-xs font-black ${badgeClass}`}
                      >
                        {item.section}
                      </span>
                      <div>
                        <p className="text-sm font-black">
                          {index === 0 ? "Latest diagnostic" : `Previous diagnostic ${index}`}
                        </p>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {formatDiagnosticReportDate(item.completedAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                        aiReady
                          ? "bg-emerald-50 text-emerald-700"
                          : item.aiFeedbackStatus === "queued_no_api_key"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-violet-50 text-violet-700"
                      }`}
                    >
                      {aiReady ? "AI ready" : item.aiFeedbackStatus === "queued_no_api_key" ? "Queued" : "AI needed"}
                    </span>
                    <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                      {item.accuracy}%
                    </span>
                    <Link
                      href={reportHref}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-blue-600 hover:bg-blue-50"
                    >
                      Open full report
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black">
            When to run a diagnostic
          </h2>
          <div className="relative mt-5 space-y-5 before:absolute before:bottom-6 before:left-6 before:top-6 before:w-px before:bg-slate-200">
            {timingPrompts.map(([title, text, Icon]) => (
              <div key={title} className="relative flex gap-4">
                <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-blue-600">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-black">{title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-600">
          How diagnostics work
        </h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {approachSteps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                {index + 1}
              </span>
              <h3 className="mt-3 text-sm font-black text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-xs font-medium leading-5 text-slate-500">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
