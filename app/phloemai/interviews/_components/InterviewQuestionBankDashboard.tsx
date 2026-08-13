import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  ClipboardList,
  Flame,
  MessageSquare,
  ShieldQuestion,
  Users,
  Zap,
} from "lucide-react";
import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { InterviewAccountControls } from "../InterviewAccountControls";
import { InterviewSidebar } from "./InterviewWorkspacePage";

const stats = [
  { label: "Prompts attempted", value: "42", icon: ClipboardList },
  { label: "Average score", value: "71%", icon: BarChart3 },
  { label: "Practice time", value: "5h 32m", icon: Bell },
] as const;

const promptBanks = [
  {
    label: "Ethics",
    meta: "Confidentiality, capacity, consent",
    score: "72%",
    href: "/phloemai/interviews/stations/ethics-confidentiality",
  },
  {
    label: "Motivation",
    meta: "Personal why and reflection",
    score: "81%",
    href: "/phloemai/interviews/stations/motivation-question",
  },
  {
    label: "NHS hot topics",
    meta: "Waiting lists and workforce",
    score: "68%",
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
] as const;

const plan = [
  {
    label: "Motivation question",
    status: "Completed",
    done: true,
    href: "/phloemai/interviews/stations/motivation-question",
  },
  {
    label: "Ethics AI station",
    status: "8 mins",
    done: false,
    href: "/phloemai/interviews/stations/ethics-ai-station",
  },
  {
    label: "Hot topic: NHS waiting lists",
    status: "8 mins",
    done: false,
    href: "/phloemai/interviews/stations/nhs-waiting-lists",
  },
] as const;

const themes = [
  { label: "Communication", value: 84, colour: "bg-[#129a72]", icon: MessageSquare },
  { label: "Motivation", value: 79, colour: "bg-[#129a72]", icon: Zap },
  { label: "Teamwork", value: 73, colour: "bg-[#159a9d]", icon: Users },
  { label: "Ethics", value: 72, colour: "bg-[#f59e0b]", icon: ShieldQuestion },
  { label: "NHS Knowledge", value: 68, colour: "bg-[#ef7a45]", icon: BookOpen },
  { label: "Hot Topics", value: 62, colour: "bg-[#ef4444]", icon: Flame },
] as const;

const recentPrompts = [
  {
    label: "Manchester Mock #2",
    meta: "3 days ago",
    score: "78%",
    colour: "text-[#129a72]",
    icon: ClipboardList,
    href: "/phloemai/interviews/reports/manchester-mock-2",
  },
  {
    label: "Ethics - Resource Allocation",
    meta: "5 days ago",
    score: "72%",
    colour: "text-[#e07a2f]",
    icon: BookOpen,
    href: "/phloemai/interviews/reports/ethics-resource-allocation",
  },
  {
    label: "Motivation - Personal Why",
    meta: "1 week ago",
    score: "81%",
    colour: "text-[#129a72]",
    icon: MessageSquare,
    href: "/phloemai/interviews/reports/motivation-personal-why",
  },
] as const;

function ProgressRing() {
  return (
    <div className="relative h-[140px] w-[140px] shrink-0">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(#159a9d 0deg 281deg, #d8e7e7 281deg 360deg)",
        }}
      />
      <div className="absolute inset-[10px] flex flex-col items-center justify-center rounded-full bg-white">
        <span className="text-[34px] font-bold leading-none text-[#071923]">
          78<span className="text-xl">%</span>
        </span>
        <span className="mt-2 text-xs font-semibold text-[#4a6370]">
          Bank readiness
        </span>
      </div>
    </div>
  );
}

function PanelTitle({
  title,
  action,
  actionHref,
}: {
  title: string;
  action?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex w-full items-center justify-between gap-4">
      <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
        {title}
      </h2>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="text-xs font-semibold text-[#08787b] hover:text-[#042724]"
        >
          {action}
        </Link>
      )}
      {action && !actionHref && (
        <span className="text-xs font-semibold text-[#08787b]">{action}</span>
      )}
    </div>
  );
}

export async function InterviewQuestionBankDashboard() {
  const { isPremium } = await getPhloemEntitlements();

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={!isPremium}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-6 lg:py-5">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link
                href="/phloemai/interviews"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                Med Interviews
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-[#071923]">
                Question Bank
              </h1>
              <p className="mt-2 text-sm font-medium text-[#314956]">
                Browse prompts by theme, station type and university style.
              </p>
            </div>
            <InterviewAccountControls />
          </header>

          <section className="mt-5 grid min-h-[184px] gap-5 rounded-xl border border-[#cfe0df] bg-white p-5 shadow-sm lg:grid-cols-[150px_1px_minmax(0,1fr)] lg:items-center">
            <div className="flex justify-center lg:justify-start">
              <ProgressRing />
            </div>
            <div className="hidden h-[132px] w-px bg-[#d8e0e6] lg:block" />
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#071923]">
                Pick the right prompt, then practise it properly.
              </h2>
              <p className="mt-2 text-sm font-medium text-[#314956]">
                Start with ethics, then rotate through motivation, NHS knowledge
                and university-style stations.
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="grid min-w-0 grid-cols-[38px_minmax(0,1fr)] items-center gap-3"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#cfe0df] bg-[#edf7f6] text-[#08787b] shadow-sm">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-lg font-bold text-[#071923]">
                          {stat.value}
                        </span>
                        <span className="mt-0.5 block text-xs font-medium leading-5 text-[#4a6370]">
                          {stat.label}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-5 grid gap-4 xl:grid-cols-3">
            <article className="min-h-[254px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Your next best action" />
              <div className="mt-5 flex gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#cfe0df] bg-[#edf7f6] text-[#08787b] shadow-sm">
                  <ShieldQuestion className="h-7 w-7" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#071923]">
                    Ethics - Confidentiality
                  </h3>
                  <p className="mt-2 max-w-[290px] text-sm font-medium leading-6 text-[#314956]">
                    Your weaker area is ethics scenario structure. Start here.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-[#edf7f6] px-3 py-2 text-xs font-semibold text-[#08787b]">
                      8 mins
                    </span>
                    <span className="rounded-lg bg-[#edf7f6] px-3 py-2 text-xs font-semibold text-[#08787b]">
                      AI Station
                    </span>
                  </div>
                </div>
              </div>
              <Link
                href="/phloemai/interviews/stations/ethics-confidentiality"
                className="mt-5 flex h-10 items-center justify-center gap-3 rounded-lg bg-[#159a9d] px-4 text-sm font-bold text-white transition-colors hover:bg-[#08787b]"
              >
                Start prompt
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[254px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Prompt banks" />
              <div className="mt-5 overflow-hidden rounded-lg border border-[#d8e0e6]">
                {promptBanks.map((bank, index) => (
                  <Link
                    href={bank.href}
                    key={bank.label}
                    className={`grid grid-cols-[minmax(0,1fr)_52px_16px] items-center gap-3 bg-white px-3 py-3 transition-colors hover:bg-[#f4f8f8] ${
                      index === promptBanks.length - 1
                        ? ""
                        : "border-b border-[#e4eaee]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#071923]">
                        {bank.label}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-[#4a6370]">
                        {bank.meta}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-[#08787b]">
                      {bank.score}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <Link
                href="/phloemai/interviews/universities"
                className="mt-5 flex items-center justify-between text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                Browse university prompts
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[254px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Today's plan" action="1 / 3 done" />
              <div className="mt-5 overflow-hidden rounded-lg border border-[#d8e0e6]">
                {plan.map((item, index) => (
                  <Link
                    href={item.href}
                    key={item.label}
                    className={`grid grid-cols-[26px_minmax(0,1fr)_72px_14px] items-center gap-3 bg-white px-3 py-3 transition-colors hover:bg-[#f4f8f8] ${
                      index === plan.length - 1 ? "" : "border-b border-[#e4eaee]"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full border ${
                        item.done
                          ? "border-[#129a72] bg-[#129a72] text-white"
                          : "border-[#b8c8cf] bg-white text-transparent"
                      }`}
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="truncate text-sm font-medium text-[#071923]">
                      {item.label}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        item.done ? "text-[#129a72]" : "text-[#4a6370]"
                      }`}
                    >
                      {item.status}
                    </span>
                    <ChevronRight className="h-4 w-4 text-[#4a6370]" aria-hidden="true" />
                  </Link>
                ))}
              </div>
              <Link
                href="/phloemai/interviews/plan"
                className="mt-5 flex items-center justify-between text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                View full plan
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[250px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle title="Question themes" />
              <div className="mt-5 space-y-2.5">
                {themes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="grid grid-cols-[24px_minmax(86px,1fr)_86px_34px] items-center gap-2"
                    >
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#edf7f6] text-[#08787b]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="truncate text-sm font-medium text-[#071923]">
                        {item.label}
                      </span>
                      <span className="h-1.5 overflow-hidden rounded-full bg-[#e3eaee]">
                        <span
                          className={`block h-full rounded-full ${item.colour}`}
                          style={{ width: `${item.value}%` }}
                        />
                      </span>
                      <span className="text-right text-sm font-bold text-[#071923]">
                        {item.value}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/phloemai/interviews/progress"
                className="mt-6 flex items-center gap-3 text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                View progress
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>

            <article className="min-h-[250px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <PanelTitle
                title="Recent performance"
                action="View all"
                actionHref="/phloemai/interviews/reports"
              />
              <div className="mt-5 space-y-4">
                {recentPrompts.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      href={item.href}
                      key={item.label}
                      className="grid grid-cols-[34px_minmax(0,1fr)_42px] items-center gap-3 rounded-lg transition-colors hover:bg-[#f4f8f8]"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#edf7f6] text-[#08787b]">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-[#071923]">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs font-medium text-[#4a6370]">
                          {item.meta}
                        </span>
                      </span>
                      <span className={`text-sm font-bold ${item.colour}`}>
                        {item.score}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </article>

            <article className="flex min-h-[250px] flex-col rounded-xl border border-[#cfe0df] bg-[#f7fbfb] p-5 text-center shadow-sm">
              <PanelTitle title="Weekly insight" />
              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#cfe0df] bg-white text-[#08787b] shadow-sm">
                  <BarChart3 className="h-7 w-7" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-base font-bold text-[#071923]">
                  Ethics is your best next lift
                </h3>
                <p className="mt-3 max-w-[260px] text-sm font-medium leading-6 text-[#314956]">
                  Improving confidentiality structure should raise your
                  question-bank readiness fastest.
                </p>
                <Link
                  href="/phloemai/interviews/reports"
                  className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-[#9bcac8] bg-white px-5 text-sm font-bold text-[#08787b] transition-colors hover:border-[#159a9d] hover:bg-[#edf7f6]"
                >
                  See full report
                </Link>
              </div>
            </article>
          </section>
        </section>
      </div>
    </main>
  );
}
