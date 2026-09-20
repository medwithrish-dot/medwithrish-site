import Link from "next/link";
import { InterviewDeviceBanner } from "./InterviewDeviceBanner";

const links = [
  ["Dashboard", "/phloemai/interview/dashboard"],
  ["AI Interviews", "/phloemai/interview/ai-interviews"],
  ["Question Bank", "/phloemai/interview/question-bank"],
  ["Guides", "/phloemai/interview/guides"],
  ["1-1 Tutoring", "/phloemai/interview/tutoring"],
  ["Groups", "/phloemai/interview/groups"],
  ["Leaderboard", "/phloemai/interview/leaderboard"],
  ["Progress", "/phloemai/interview/progress"],
  ["Plan", "/phloemai/interview/plan"],
  ["Reports", "/phloemai/interview/reports"],
] as const;

export function InterviewMobileNav({ activeLabel }: { activeLabel: string }) {
  return (
    <><InterviewDeviceBanner /><nav aria-label="Interview navigation" className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#042724] px-4 py-3 lg:hidden">
      {links.map(([label, href]) => (
        <Link key={href} href={href} aria-current={activeLabel === label ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${activeLabel === label ? "bg-[#159a9d] text-white" : "text-[#cde1df] hover:bg-white/10 hover:text-white"}`}>
          {label}
        </Link>
      ))}
    </nav></>
  );
}
