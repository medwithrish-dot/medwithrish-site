import Link from "@/app/medicforest/_components/MedicForestLink";
import { DENTISTRY_STATIONS, DENTISTRY_QUESTIONS } from "../_data/dentistry-question-bank";
import type { InterviewQuestionProgressRow } from "@/utils/interviews/question-bank-progress";

export function DentistryPathway({ rows = [] }: { rows?: readonly InterviewQuestionProgressRow[] }) {
  const completed = new Set(rows.filter(row => row.status === "completed").map(row => row.question_id));
  return <div className="mt-5 space-y-3">
    {DENTISTRY_STATIONS.map((station, index) => {
      const questions = DENTISTRY_QUESTIONS.filter(question => question.tags.includes(station.slug));
      const done = questions.filter(question => completed.has(question.id)).length;
      return <Link key={station.slug} href={`/medicforest/interview/question-bank?question=${questions[0].id}`} className="flex items-center gap-3 rounded-xl border border-[#d7e3e1] bg-white p-4 hover:bg-[#edf7f6]">
        <span className="text-xs font-bold text-[#08787b]">{String(index + 1).padStart(2, "0")}</span>
        <span className="flex-1 text-sm font-semibold">{station.title}</span>
        <span className="text-xs text-[#62777e]">{done}/{questions.length}</span>
      </Link>;
    })}
    <Link href="/medicforest/interview/guides" className="inline-block text-sm font-bold text-[#08787b] underline">Prepare for hands-on and group stations</Link>
  </div>;
}
