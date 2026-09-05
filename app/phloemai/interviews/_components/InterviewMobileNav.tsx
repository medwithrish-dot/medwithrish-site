import Link from "next/link";

const links = [
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

export function InterviewMobileNav({ activeLabel }: { activeLabel: string }) {
  return (
    <nav aria-label="Interview navigation" className="flex gap-2 overflow-x-auto border-b border-white/10 bg-[#042724] px-4 py-3 lg:hidden">
      {links.map(([label, href]) => (
        <Link key={href} href={href} aria-current={activeLabel === label ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${activeLabel === label ? "bg-[#159a9d] text-white" : "text-[#cde1df] hover:bg-white/10 hover:text-white"}`}>
          {label}
        </Link>
      ))}
    </nav>
  );
}
