import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPhloemEntitlements } from "@/utils/phloemai/premium-access";
import { InterviewAccountControls } from "../InterviewAccountControls";
import { InterviewSidebar } from "./InterviewSidebar";

const mobileLinks = [
  ["Dashboard", "/phloemai/interviews"],
  ["AI Interviews", "/phloemai/interviews/ai-interviews"],
  ["Question Bank", "/phloemai/interviews/question-bank"],
  ["Universities", "/phloemai/interviews/universities"],
  ["Guides", "/phloemai/interviews/guides"],
  ["Groups", "/phloemai/interviews/groups"],
  ["Leaderboard", "/phloemai/interviews/leaderboard"],
  ["Progress", "/phloemai/interviews/progress"],
  ["Plan", "/phloemai/interviews/plan"],
  ["Reports", "/phloemai/interviews/reports"],
] as const;

export type InterviewShellProps = {
  title: string;
  subtitle: string;
  activeLabel: string;
  eyebrow?: string;
  heroHeader?: boolean;
  children: ReactNode;
};

export async function InterviewShell({
  title,
  subtitle,
  activeLabel,
  eyebrow = "Med Interviews",
  heroHeader = false,
  children,
}: InterviewShellProps) {
  const { isPremium } = await getPhloemEntitlements();

  return (
    <main className="phloem-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923]">
      <a href="#interview-content" className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-bold text-[#08787b] focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to page content</a>
      <div className="grid min-h-screen lg:grid-cols-[230px_1fr]">
        <InterviewSidebar activeLabel={activeLabel} showPremiumCard={!isPremium} />
        <div className="min-w-0">
          <nav aria-label="Interview navigation" className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#042724] px-4 py-3 lg:hidden">
            {mobileLinks.map(([label, href]) => (
              <Link key={href} href={href} aria-current={activeLabel === label ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${activeLabel === label ? "bg-[#159a9d] text-white" : "text-[#cde1df] hover:bg-white/10 hover:text-white"}`}>
                {label}
              </Link>
            ))}
          </nav>
          <section id="interview-content" className="mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
            <header className={`flex flex-col gap-5 sm:flex-row sm:justify-between ${heroHeader ? "sm:items-center" : "border-b border-[#d3dfe1] pb-7 sm:items-start"}`}>
              <div className="min-w-0">
                {activeLabel !== "Dashboard" && <Link href="/phloemai/interviews" className="inline-flex items-center gap-2 text-xs font-bold text-[#08787b] hover:text-[#042724]">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Interview dashboard
                </Link>}
                {!heroHeader && <>
                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#08787b]">{eyebrow}</p>
                <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-[#042724] sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-[#4a6370]">{subtitle}</p>
                </>}
              </div>
              <InterviewAccountControls />
            </header>
            <div className="mt-7">{children}</div>
          </section>
        </div>
      </div>
    </main>
  );
}
