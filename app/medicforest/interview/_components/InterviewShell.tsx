import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { InterviewAccountControls } from "../InterviewAccountControls";
import { InterviewSidebar } from "./InterviewSidebar";
import { InterviewMobileNav } from "./InterviewMobileNav";

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
  const { isPremium } = await getMedicForestEntitlements();

  return (
    <main data-interview-shell className="medicforest-dashboard-compact flex-1 bg-[#eef1f3] text-[#071923] lg:fixed lg:inset-0 lg:h-[100dvh] lg:overflow-hidden">
      <a href="#interview-content" className="sr-only z-50 rounded-lg bg-white px-4 py-3 font-bold text-[#08787b] focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to page content</a>
      <div data-interview-shell-grid className="grid min-h-[100dvh] lg:h-full lg:min-h-0 lg:grid-cols-[230px_1fr]">
        <InterviewSidebar activeLabel={activeLabel} showPremiumCard={!isPremium} />
        <div data-interview-shell-main className="min-w-0 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
          <InterviewMobileNav activeLabel={activeLabel} />
          <section id="interview-content" className="mx-auto w-full max-w-[1600px] px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
            <header className={`flex flex-col gap-5 sm:flex-row sm:justify-between ${heroHeader ? "sm:items-center" : "border-b border-[#d3dfe1] pb-7 sm:items-start"}`}>
              <div className="min-w-0">
                {activeLabel !== "Dashboard" && <Link href="/medicforest/interview/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-[#08787b] hover:text-[#042724]">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Med Interview dashboard
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
