"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BadgePoundSterling,
  BarChart3,
  BookOpen,
  Brain,
  CircleHelp,
  ClipboardList,
  Home,
  Mic,
  MessageSquare,
  Trophy,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { InterviewAreaSwitcher } from "../InterviewAreaSwitcher";

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
        label: "Interviews",
        icon: MessageSquare,
        href: "/interviews",
      },
      {
        label: "1-1 Tutoring",
        icon: UserRoundCheck,
        href: "/tutoring",
      },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Feedback", icon: MessageSquare, href: "/feedback" },
      { label: "Contact us", icon: CircleHelp, href: "/contact" },
    ],
  },
] as const;

export function getLandingActiveLabel(pathname: string) {
  const path = pathname.replace(/^\/medicforest/, "") || "/";

  if (path === "/about") return "About";
  if (path === "/pricing") return "Pricing";
  if (path.startsWith("/personal-statement")) return "Personal Statement";
  if (path.startsWith("/interviews")) return "Interviews";
  if (path.startsWith("/tutoring")) return "1-1 Tutoring";
  if (path.startsWith("/resources")) return "Resources";
  if (path.startsWith("/feedback")) return "Feedback";
  if (path.startsWith("/contact")) return "Contact us";
  if (path === "/" || path.startsWith("/ucat")) return "UCAT";

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
      data-interview-sidebar-link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-semibold transition-colors ${
        active
          ? "bg-white/[0.07] text-[#8be5df]"
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
    <div data-interview-sidebar-legal className={`${className} rounded-xl bg-white/[0.04] p-4`}>
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
  const pathname = usePathname();
  const primaryItems =
    mode === "landing" ? landingPrimaryItems : interviewPrimaryItems;
  const sections = mode === "landing" ? landingSections : interviewSections;
  const resolvedActiveLabel =
    mode === "landing" ? getLandingActiveLabel(pathname) : activeLabel;

  return (
    <aside className="hidden border-r border-[#093f3a] bg-[#042724] px-4 py-5 text-slate-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:block lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
      <InterviewAreaSwitcher
        area={mode === "landing" ? "admissions" : "interviews"}
      />

      <nav className="mt-8 space-y-2">
        {primaryItems.map((item) => (
          <SidebarLink
            key={item.label}
            icon={item.icon}
            label={item.label}
            href={item.href}
            active={resolvedActiveLabel === item.label}
          />
        ))}
      </nav>

      <div data-interview-sidebar-sections className="mt-8 space-y-8">
        {sections.map((section) => (
          <div key={section.label}>
            <p data-interview-sidebar-heading className="px-4 text-xs font-bold uppercase tracking-wide text-slate-500">
              {section.label}
            </p>
            <div className="mt-3 space-y-2">
              {section.items.map((item) => (
                <SidebarLink
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  href={item.href}
                  active={resolvedActiveLabel === item.label}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {showPremiumCard && (
        <div data-interview-sidebar-upgrade className="mt-8 rounded-xl bg-white/[0.04] p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#123f3b] text-[#8be5df]">
            <BadgeCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-sm font-bold text-white">
            {mode === "landing"
              ? "Ready to see what costs you marks?"
              : "Upgrade to Premium"}
          </h2>
          <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
            {mode === "landing"
              ? "Start with the free UCAT diagnostic. No card needed."
              : "Unlock more interview stations, deeper analytics and guided practice."}
          </p>
          <Link
            href={mode === "landing" ? "/ucat/dashboard" : "/medicforest/pricing"}
            className="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-[#1aa0a5] text-sm font-bold text-white transition-colors hover:bg-[#14888c]"
          >
            {mode === "landing" ? "Start free" : "Upgrade to Premium"}
          </Link>
        </div>
      )}

      <LegalLinks className={showPremiumCard ? "mt-5" : "mt-8"} />
    </aside>
  );
}
