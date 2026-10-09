"use client";

import Link from "@/app/medicforest/_components/MedicForestLink";
import { useVisiblePathname } from "@/app/medicforest/_components/useVisiblePathname";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BadgePoundSterling,
  BarChart3,
  BookOpen,
  ClipboardList,
  Home,
  Mic,
  MessageSquare,
  Trophy,
  UserRound,
  UserRoundCheck,
  Users,
  Brain,
} from "lucide-react";
import { InterviewAreaSwitcher } from "../InterviewAreaSwitcher";
import { medicForestPublicHref } from "@/utils/medicforest/public-navigation";

type SidebarMode = "interview" | "landing";

const interviewPrimaryItems = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/medicforest/interview/dashboard",
  },
] as const;

const landingPrimaryItems = [
  { label: "About", icon: Home, href: "/about" },
  { label: "Pricing", icon: BadgePoundSterling, href: "/pricing" },
] as const;

const interviewSections = [
  {
    label: "Practice",
    items: [
      {
        label: "AI Interviews",
        icon: Mic,
        href: "/medicforest/interview/ai-interviews",
      },
      {
        label: "Question Bank",
        icon: ClipboardList,
        href: "/medicforest/interview/question-bank",
      },
      {
        label: "Guides",
        icon: BookOpen,
        href: "/medicforest/interview/guides",
      },
      {
        label: "1-1 Tutoring",
        icon: UserRoundCheck,
        href: "/medicforest/interview/tutoring",
      },
    ],
  },
  {
    label: "Community",
    items: [
      {
        label: "Groups",
        icon: Users,
        href: "/medicforest/interview/groups",
      },
      {
        label: "Leaderboard",
        icon: Trophy,
        href: "/medicforest/interview/leaderboard",
      },
    ],
  },
  {
    label: "Your practice",
    items: [
      { label: "Progress", icon: BarChart3, href: "/medicforest/interview/progress" },
      { label: "Plan", icon: ClipboardList, href: "/medicforest/interview/plan" },
      { label: "Reports", icon: BookOpen, href: "/medicforest/interview/reports" },
    ],
  },
] as const;

const landingSections = [
  {
    label: "Preparation",
    items: [
      { label: "UCAT", icon: Brain, href: "/ucat" },
      {
        label: "Med Interviews",
        icon: MessageSquare,
        href: "/interviews",
      },
      {
        label: "1-1 Tutoring",
        icon: UserRoundCheck,
        href: "/tutoring",
      },
      { label: "Resources", icon: BookOpen, href: "/resources" },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Feedback & Support", icon: MessageSquare, href: "/feedback" },
      { label: "Manage Account", icon: UserRound, href: "/account" },
    ],
  },
] as const;

export function getLandingActiveLabel(pathname: string) {
  const path = pathname.replace(/^\/medicforest/, "") || "/";

  if (path === "/about") return "About";
  if (path === "/pricing") return "Pricing";
  if (path.startsWith("/personal-statement")) return "Personal Statement";
  if (path === "/" || path.startsWith("/interviews")) return "Med Interviews";
  if (path.startsWith("/tutoring")) return "1-1 Tutoring";
  if (path.startsWith("/resources")) return "Resources";
  if (path.startsWith("/feedback")) return "Feedback & Support";
  if (path.startsWith("/account")) return "Manage Account";
  if (path.startsWith("/contact")) return "Manage Account";
  if (path.startsWith("/ucat")) return "UCAT";

  return "";
}

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
      prefetch={false}
      data-interview-sidebar-link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-[13px] font-semibold transition-colors ${
        active
          ? "bg-[#123f3b] text-[#89e4df] shadow-sm"
          : "text-slate-300 hover:bg-[#0b3431] hover:text-white"
      }`}
    >
      <Icon className="h-4.5 w-4.5 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function LegalLinks({ className = "mt-5" }: { className?: string }) {
  return (
    <div data-interview-sidebar-legal className={`${className} rounded-xl bg-white/[0.04] p-3`}>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        Legal
      </p>
      <div className="mt-2.5 space-y-1.5 text-[11px] font-bold">
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
          href="/medicforest-disclaimer"
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
  mode = "interview",
}: {
  activeLabel: string;
  showPremiumCard: boolean;
  mode?: SidebarMode;
}) {
  const pathname = useVisiblePathname();
  const primaryItems =
    mode === "landing" ? landingPrimaryItems : interviewPrimaryItems;
  const sections = mode === "landing" ? landingSections : interviewSections;
  const resolvedActiveLabel =
    mode === "landing" ? getLandingActiveLabel(pathname) : activeLabel;

  return (
    <aside className="hidden border-r border-[#093f3a] bg-[#042724] px-3 py-5 text-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
      <InterviewAreaSwitcher
        area={mode === "landing" ? "admissions" : "interviews"}
      />

      <nav className="mt-8 space-y-1.5">
        {primaryItems.map((item) => (
          <SidebarLink
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={mode === "landing" ? medicForestPublicHref(pathname, item.href) : item.href}
            active={resolvedActiveLabel === item.label}
          />
        ))}
      </nav>

      <div data-interview-sidebar-sections className="mt-7 space-y-7">
        {sections.map((section) => (
          <div key={section.label}>
            <p data-interview-sidebar-heading className="px-3 text-xs font-bold uppercase tracking-wide text-slate-500">
              {section.label}
            </p>
            <div className="mt-2.5 space-y-1.5">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={mode === "landing" ? medicForestPublicHref(pathname, item.href) : item.href}
                  active={resolvedActiveLabel === item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showPremiumCard && (
        <div data-interview-sidebar-upgrade className="mt-7 rounded-xl bg-white/[0.04] p-3.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#123f3b] text-[#8be5df]">
            <BadgeCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="mt-3 text-xs font-bold text-white">
            {mode === "landing"
              ? "Ready to see what costs you marks?"
              : "Upgrade to Premium"}
          </h2>
          <p className="mt-2 text-xs font-medium leading-5 text-slate-300">
            {mode === "landing"
              ? "Try our AI feedback to find your weak spots."
              : "Unlock more Med interview stations, deeper analytics and guided practice."}
          </p>
          <Link
            href={mode === "landing" ? medicForestPublicHref(pathname, "/interviews") : "/medicforest/pricing"}
            className="mt-4 flex h-9 w-full items-center justify-center rounded-lg bg-[#1aa0a5] text-xs font-bold text-white transition-colors hover:bg-[#14888c]"
          >
            {mode === "landing" ? "Start free" : "Upgrade to Premium"}
          </Link>
        </div>
      )}

      <LegalLinks className={showPremiumCard ? "mt-5" : "mt-7"} />
    </aside>
  );
}
