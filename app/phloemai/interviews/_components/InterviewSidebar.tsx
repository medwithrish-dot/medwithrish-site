"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  ClipboardList,
  Home,
  Landmark,
  Mic,
  Trophy,
  Users,
} from "lucide-react";
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
