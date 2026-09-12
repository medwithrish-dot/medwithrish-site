import Link from "next/link";
import { ArrowRight, BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import { interviewHistory } from "@/utils/interviews/history";
import { interviewStations } from "../_data/interview-stations";
import { interviewUniversities } from "../_data/universities";
import { SavedInterviewList } from "./SavedInterviewList";
import { canResumeSavedInterview } from "../_lib/saved-interviews";

const universityNames = new Map(interviewUniversities.map((university) => [university.slug, university.name]));

async function savedInterviewHistory() {
  const { attempts, message } = await interviewHistory();
  const loadedAt = Date.now();
  const savedAttempts = attempts.map((attempt) => ({
    id: attempt.id,
    title: attempt.title,
    stationSlug: attempt.stationSlug,
    universitySlug: attempt.universitySlug,
    universityName: attempt.universitySlug ? universityNames.get(attempt.universitySlug) ?? attempt.universitySlug.replaceAll("-", " ") : "General practice",
    status: attempt.status,
    canResume: canResumeSavedInterview(attempt, loadedAt),
    feedbackScore: attempt.feedback?.score ?? null,
    startedAtLabel: new Date(attempt.startedAt).toLocaleString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
  }));
  return { attempts, message, savedAttempts };
}

export async function InterviewHistoryViews({ view }: { view: "reports" | "progress" | "plan" | "notifications" }) {
  const { attempts, message, savedAttempts } = await savedInterviewHistory();
  const completed = attempts.filter((a) => a.status === "completed" && a.feedback);
  return <div className="space-y-6">
    {message && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">{message} <Link href="/phloemai/account" className="font-bold underline">Account</Link></p>}
    {view === "plan" ? <><div className="rounded-3xl bg-[#042724] p-8 text-white"><Sparkles className="text-[#b9f4db]" size={28} /><h2 className="mt-5 text-2xl font-bold">Your next five conversations</h2><p className="mt-3 max-w-xl text-sm leading-7 text-teal-50/75">Work through motivation, reflection, inclusion and a hot topic at your own pace. Completed stations are marked from your saved history.</p></div><div className="grid gap-4">{interviewStations.slice(0, 5).map((station, i) => { const done = completed.find((a) => a.stationSlug === station.slug); return <Link key={station.slug} href={`/phloemai/interviews/ai-interviews?station=${station.slug}`} className="flex items-center gap-5 rounded-2xl border border-[#dce6e5] bg-white p-6 hover:border-[#159a9d]"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold ${done ? "bg-teal-100 text-teal-800" : "bg-[#f1f5f4] text-[#62777e]"}`}>{done ? <CheckCircle2 size={22} /> : `0${i + 1}`}</span><span className="flex-1"><span className="block font-bold">{station.title}</span><span className="mt-1 block text-xs text-[#62777e]">{done ? `Completed · latest score ${done.feedback!.score}%` : i === 0 ? "Free · 8 minutes" : "Premium · 8 minutes"}</span></span><ArrowRight size={18} className="text-[#08787b]" /></Link>; })}</div></> : view === "progress" ? <><div className="grid gap-4 sm:grid-cols-3">{[{ label: "Completed stations", value: completed.length }, { label: "Average score", value: completed.length ? `${Math.round(completed.reduce((s, a) => s + a.feedback!.score, 0) / completed.length)}%` : "—" }, { label: "Themes practised", value: new Set(completed.map((a) => a.stationSlug)).size }].map((s) => <div key={s.label} className="rounded-2xl border border-[#dce6e5] bg-white p-6"><p className="text-sm text-[#62777e]">{s.label}</p><p className="mt-3 text-4xl font-bold text-[#08787b]">{s.value}</p></div>)}</div><section className="rounded-2xl border border-[#dce6e5] bg-white p-7"><h2 className="text-lg font-bold">What your practice is telling you</h2><p className="mt-2 text-sm text-[#62777e]">Average practice scores by station, based on your saved feedback.</p><div className="mt-7 space-y-6">{interviewStations.map((station) => { const rows = completed.filter((a) => a.stationSlug === station.slug); if (!rows.length) return null; const score = Math.round(rows.reduce((s, a) => s + a.feedback!.score, 0) / rows.length); return <div key={station.slug}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-semibold">{station.title}</span><span className="text-[#08787b]">{score}% · {rows.length} attempts</span></div><div className="h-2 rounded-full bg-[#eaf0ef]"><div className="h-2 rounded-full bg-[#159a9d]" style={{ width: `${score}%` }} /></div></div>; })}</div>{!completed.length && <EmptyHistory />}</section><Link href="/phloemai/interviews/reports" className="inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">Read your individual feedback <ArrowRight size={16} /></Link></> : <section className="overflow-hidden rounded-2xl border border-[#dce6e5] bg-white">
      <div className="border-b border-[#e6edec] p-6">
        <h2 className="font-bold">{view === "notifications" ? "Your interview updates" : "Your saved interviews"}</h2>
        <p className="mt-2 text-sm leading-6 text-[#62777e]">{view === "notifications" ? "Feedback and stations to pick up, drawn from your own activity." : "Every saved attempt stays here when you retry a station. Revisit your transcript, answer framework and feedback, or find a particular university below."}</p>
      </div>
      {!attempts.length ? <EmptyHistory /> : <SavedInterviewList attempts={view === "notifications" ? savedAttempts.slice(0, 20) : savedAttempts} showFilters={view === "reports"} />}
    </section>}
  </div>;
}
function EmptyHistory() { return <div className="px-6 py-14 text-center"><BookOpen className="mx-auto text-[#9bb4b1]" size={32} /><h3 className="mt-5 font-bold">Ready when you are</h3><p className="mt-2 text-sm text-[#62777e]">Complete your first interview to start building your progress.</p><Link href="/phloemai/interviews/ai-interviews" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-5 py-3 text-sm font-bold text-white">Try the free station <ArrowRight size={16} /></Link></div>; }
