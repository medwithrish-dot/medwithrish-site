import Link from "@/app/medicforest/_components/MedicForestLink";
import { ArrowRight, Clock3 } from "lucide-react";
import { interviewHistory, savedInterviewSummaries } from "@/utils/interviews/history";
import { filterSavedInterviewSource, groupSavedInterviews, savedInterviewHref } from "../_lib/saved-interviews";

export async function InterviewResumeList() {
  // Fetch unfinished work separately so older paused interviews remain visible
  // even when there are hundreds of newer completed attempts.
  const { attempts, message, signedIn } = await interviewHistory(undefined, true);
  if (!signedIn) return null;
  const saved = groupSavedInterviews(filterSavedInterviewSource(savedInterviewSummaries(attempts), "ai"));
  const resumable = saved.filter(attempt => attempt.canResume);
  const expired = saved.filter(attempt => !attempt.canResume);
  return <section aria-labelledby="resume-interviews-title" className="rounded-2xl border-2 border-[#b5d9cc] bg-[#edf7f1] p-6 sm:p-7">
    <div className="flex items-center gap-3"><Clock3 size={24} className="text-[#08787b]" /><h2 id="resume-interviews-title" className="text-xl font-bold text-[#123c39]">Continue your interview</h2></div>
    <p className="mt-2 text-sm leading-6 text-[#415f5c]">Use Save and exit during an AI interview to pause the timer. Your questions and answers stay saved here until you return.</p>
    {message ? <p role="status" className="mt-4 text-sm text-amber-950">{message}</p> : resumable.length ? <div className="mt-5 space-y-3">{resumable.map(attempt => <Link key={attempt.id} href={savedInterviewHref(attempt)} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#cfe3d9] bg-white p-5 hover:border-[#08787b]">
      <span><span className="block text-xs text-[#62777e]">{attempt.universityName}</span><span className="mt-1 block font-bold text-[#123c39]">{attempt.title}</span><span className="mt-2 block text-xs text-[#58716f]">{attempt.paused ? "Paused · Your remaining time is saved" : "In progress · Timer is running"}</span></span>
      <span className="inline-flex items-center gap-2 rounded-lg bg-[#08787b] px-4 py-2.5 text-sm font-bold text-white">Resume interview <ArrowRight size={16} /></span>
    </Link>)}</div> : <p className="mt-5 rounded-xl bg-white/80 p-4 text-sm text-[#58716f]">No interviews waiting to resume. Your next saved interview will appear here.</p>}
    {expired.length > 0 && <div className="mt-5"><p className="text-xs text-[#58716f]">These earlier interviews reached their time limit. Your saved answers are still available.</p>{expired.slice(0, 5).map(attempt => <Link key={attempt.id} href={savedInterviewHref(attempt)} className="mt-3 flex items-center justify-between gap-3 text-sm font-semibold text-[#08787b]"><span>{attempt.title}</span><span>Review saved answers →</span></Link>)}</div>}
    <Link href="/medicforest/interview/reports" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">View all saved interviews and feedback <ArrowRight size={16} /></Link>
  </section>;
}
