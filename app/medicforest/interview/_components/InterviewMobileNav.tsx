"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { InterviewDeviceBanner } from "./InterviewDeviceBanner";
import { getLandingActiveLabel } from "./InterviewSidebar";

const interviewLinks = [
  ["Dashboard", "/medicforest/interview/dashboard"],
  ["AI Interviews", "/medicforest/interview/ai-interviews"],
  ["Question Bank", "/medicforest/interview/question-bank"],
  ["Guides", "/medicforest/interview/guides"],
  ["1-1 Tutoring", "/medicforest/interview/tutoring"],
  ["Groups", "/medicforest/interview/groups"],
  ["Leaderboard", "/medicforest/interview/leaderboard"],
  ["Progress", "/medicforest/interview/progress"],
  ["Plan", "/medicforest/interview/plan"],
  ["Reports", "/medicforest/interview/reports"],
] as const;

const landingLinks = [
  ["About", "/about"],
  ["Pricing", "/pricing"],
  ["UCAT", "/ucat"],
  ["Personal Statement", "/personal-statement"],
  ["Interviews", "/interviews"],
  ["1-1 Tutoring", "/tutoring"],
  ["Resources", "/resources"],
  ["Feedback", "/feedback"],
  ["Contact us", "/contact"],
] as const;

export function InterviewMobileNav({
  activeLabel = "",
  mode = "interview",
}: {
  activeLabel?: string;
  mode?: "interview" | "landing";
}) {
  const pathname = usePathname();
  const links = mode === "landing" ? landingLinks : interviewLinks;
  const currentActive =
    activeLabel || (mode === "landing" ? getLandingActiveLabel(pathname) : "");

  return (
    <>
      <InterviewDeviceBanner />
      <nav
        aria-label={
          mode === "landing" ? "MedicForest navigation" : "Interview navigation"
        }
        className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#042724] px-4 py-3 lg:hidden"
      >
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            aria-current={currentActive === label ? "page" : undefined}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              currentActive === label
                ? "bg-[#159a9d] text-white"
                : "text-[#cde1df] hover:bg-white/10 hover:text-white"
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
