import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ClipboardList,
  Home,
  Landmark,
  Mic,
  Trophy,
  Users,
} from "lucide-react";
import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { InterviewAccountControls } from "../InterviewAccountControls";
import { InterviewAreaSwitcher } from "../InterviewAreaSwitcher";

const sidebarSections = [
  {
    label: "Practice",
    items: [
      {
        label: "AI Interviews",
        icon: Mic,
        href: "/phloemai/interviews/ai-interviews",
      },
      {
        label: "Question Bank",
        icon: ClipboardList,
        href: "/phloemai/interviews/question-bank",
      },
      {
        label: "Universities",
        icon: Landmark,
        href: "/phloemai/interviews/universities",
      },
      {
        label: "Guides",
        icon: BookOpen,
        href: "/phloemai/interviews/guides",
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        label: "Groups",
        icon: Users,
        href: "/phloemai/interviews/groups",
      },
      {
        label: "Leaderboard",
        icon: Trophy,
        href: "/phloemai/interviews/leaderboard",
      },
    ],
  },
] as const;

function SidebarLink({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
        active
          ? "bg-[#123f3b] text-[#8be5df]"
          : "text-slate-300 hover:bg-[#0b3431] hover:text-white"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </Link>
  );
}

function LegalLinks({ className = "mt-5" }: { className?: string }) {
  return (
    <div
      className={`${className} rounded-xl border border-white/10 bg-[#082f2c] p-4 shadow-sm`}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        Legal
      </p>
      <div className="mt-3 space-y-2 text-xs font-bold">
        <Link
          href="/terms-and-conditions"
          className="block text-slate-300 hover:text-white"
        >
          Terms and Conditions
        </Link>
        <Link
          href="/privacy-policy"
          className="block text-slate-300 hover:text-white"
        >
          Privacy Policy
        </Link>
        <Link
          href="/phloemai-disclaimer"
          className="block text-slate-300 hover:text-white"
        >
          AI/Data Disclaimer
        </Link>
      </div>
    </div>
  );
}

export function InterviewSidebar({
  activeLabel,
  showPremiumCard,
}: {
  activeLabel: string;
  showPremiumCard: boolean;
}) {
  return (
    <aside className="hidden border-r border-[#093f3a] bg-[#042724] px-4 py-5 text-slate-100 lg:block">
      <InterviewAreaSwitcher />

      <nav className="mt-8 space-y-2">
        <SidebarLink
          icon={Home}
          label="Dashboard"
          href="/phloemai/interviews"
          active={activeLabel === "Dashboard"}
        />
      </nav>

      <div className="mt-8 space-y-8">
        {sidebarSections.map((section) => (
          <div key={section.label}>
            <p className="px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              {section.label}
            </p>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={activeLabel === item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showPremiumCard && (
        <div className="mt-8 rounded-xl border border-white/10 bg-[#082f2c] p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123f3b] text-[#8be5df]">
            <BadgeCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-sm font-bold text-white">
            Upgrade to Premium
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
            Unlock more interview stations, deeper analytics and guided
            practice.
          </p>
          <Link
            href="/phloemai/pricing"
            className="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-[#1aa0a5] text-sm font-bold text-white transition-colors hover:bg-[#14888c]"
          >
            Upgrade to Premium
          </Link>
        </div>
      )}

      <LegalLinks className={showPremiumCard ? "mt-5" : "mt-8"} />
    </aside>
  );
}

type WorkspaceStat = {
  label: string;
  value: string;
};

type WorkspaceCard = {
  title: string;
  description: string;
  href: string;
  action: string;
};

type WorkspaceRow = {
  label: string;
  meta: string;
  href: string;
};

export type InterviewWorkspacePageProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  activeLabel: string;
  primaryAction?: WorkspaceCard;
  stats?: readonly WorkspaceStat[];
  cards: readonly WorkspaceCard[];
  rows?: readonly WorkspaceRow[];
};

const fallbackStats = [
  { label: "Readiness", value: "78%" },
  { label: "Stations", value: "42" },
  { label: "Practice", value: "5h 32m" },
] as const;

export async function InterviewWorkspacePage({
  title,
  subtitle,
  eyebrow = "Med Interviews",
  activeLabel,
  primaryAction,
  stats = fallbackStats,
  cards,
  rows = [],
}: InterviewWorkspacePageProps) {
  const { isPremium } = await getPhloemEntitlements();

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel={activeLabel}
          showPremiumCard={!isPremium}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link
                href="/phloemai/interviews"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#08787b] hover:text-[#042724]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Dashboard
              </Link>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                {eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-[#071923]">
                {title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#314956]">
                {subtitle}
              </p>
            </div>
            <InterviewAccountControls />
          </header>

          <section className="mt-6 rounded-xl border border-[#cfe0df] bg-white p-5 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-[#d8e0e6] bg-[#f7fbfb] p-4"
                >
                  <p className="text-xs font-bold uppercase tracking-wide text-[#08787b]">
                    {stat.label}
                  </p>
                  <p className="mt-3 text-2xl font-bold text-[#071923]">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            {primaryAction && (
              <Link
                href={primaryAction.href}
                className="mt-5 flex min-h-16 items-center justify-between rounded-lg border border-[#cfe0df] bg-[#edf7f6] p-4 text-left transition-colors hover:border-[#159a9d] hover:bg-white"
              >
                <span>
                  <span className="block text-base font-bold text-[#071923]">
                    {primaryAction.title}
                  </span>
                  <span className="mt-1 block text-sm font-medium leading-6 text-[#314956]">
                    {primaryAction.description}
                  </span>
                </span>
                <span className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#159a9d] text-white">
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </span>
              </Link>
            )}
          </section>

          <section className="mt-5 grid gap-4 xl:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="min-h-[190px] rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm transition-colors hover:border-[#159a9d] hover:bg-[#f7fbfb]"
              >
                <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                  {card.title}
                </h2>
                <p className="mt-5 text-sm font-medium leading-6 text-[#314956]">
                  {card.description}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">
                  {card.action}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </section>

          {rows.length > 0 && (
            <section className="mt-5 rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-[0.08em] text-[#08787b]">
                Current list
              </h2>
              <div className="mt-5 overflow-hidden rounded-lg border border-[#d8e0e6]">
                {rows.map((row, index) => (
                  <Link
                    key={row.label}
                    href={row.href}
                    className={`flex items-center justify-between gap-4 bg-white px-4 py-3 transition-colors hover:bg-[#f4f8f8] ${
                      index === rows.length - 1 ? "" : "border-b border-[#e4eaee]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-[#071923]">
                        {row.label}
                      </span>
                      <span className="mt-1 block truncate text-xs font-medium text-[#4a6370]">
                        {row.meta}
                      </span>
                    </span>
                    <ArrowRight
                      className="h-4 w-4 shrink-0 text-[#4a6370]"
                      aria-hidden="true"
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>
      </div>
    </main>
  );
}
