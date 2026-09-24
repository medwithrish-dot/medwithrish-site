import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import {
  deriveInterviewQuestionProgress,
  type InterviewQuestionProgressRow,
} from "@/utils/interviews/question-bank-progress";

const colours = ["#0f9b7d", "#2477ef", "#ea5a1d", "#0f9b61", "#7c4dde", "#169dad", "#e9487f", "#f59e0b"];

export function InterviewQuestionProgressMini({
  rows,
  signedIn,
  available,
}: {
  rows: readonly InterviewQuestionProgressRow[];
  signedIn: boolean;
  available: boolean;
}) {
  const progress = deriveInterviewQuestionProgress(rows);

  return <section className="rounded-2xl border border-[#d7e3e1] bg-white p-5" aria-labelledby="question-progress-title">
    <div className="flex items-center justify-between gap-3">
      <h2 id="question-progress-title" className="flex items-center gap-2 text-sm font-bold text-[#173d3d]"><BookOpenCheck className="h-4 w-4 text-[#08787b]" /> Question progress</h2>
      <Link href="/medicforest/interview/question-bank" className="text-[10px] font-bold text-[#08787b]">Open bank</Link>
    </div>

    <div className="mt-4 flex items-end justify-between gap-3">
      <p><strong className="text-2xl font-bold tabular-nums text-[#153d3d]">{progress.percent}%</strong><span className="ml-2 text-[10px] text-[#718486]">{progress.completed} of {progress.total}</span></p>
      {progress.review > 0 && <span className="rounded-full bg-amber-50 px-2 py-1 text-[9px] font-bold text-amber-700">{progress.review} to review</span>}
    </div>
    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e6edec]" aria-hidden="true"><div className="h-full rounded-full bg-[#0f9b7d]" style={{ width: `${progress.percent}%` }} /></div>

    <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
      {progress.categories.map((category, index) => <Link
        key={category.category}
        href={`/medicforest/interview/question-bank?category=${encodeURIComponent(category.category)}`}
        className="group min-w-0"
        aria-label={`${category.label}: ${category.completed} of ${category.total} questions completed`}
      >
        <span className="flex items-center justify-between gap-2 text-[9px] leading-4 text-[#5f7775]"><span className="truncate font-semibold group-hover:text-[#08787b]">{category.label}</span><span className="shrink-0 tabular-nums">{category.completed}/{category.total}</span></span>
        <span className="mt-1 block h-1 overflow-hidden rounded-full bg-[#edf1f1]"><span className="block h-full rounded-full" style={{ width: `${category.percent}%`, backgroundColor: colours[index] }} /></span>
      </Link>)}
    </div>

    {!signedIn && <p className="mt-4 text-[10px] leading-5 text-[#718486]">Sign in to show your saved question progress here.</p>}
    {signedIn && !available && <p className="mt-4 text-[10px] leading-5 text-amber-700">Question progress will appear after the Supabase interview setup is run.</p>}
    <Link href="/medicforest/interview/question-bank" className="mt-4 inline-flex items-center gap-1 text-[10px] font-bold text-[#08787b]">Continue questions <ArrowRight className="h-3 w-3" /></Link>
  </section>;
}
