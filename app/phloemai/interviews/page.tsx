import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Mic,
  Play,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { interviewHistory } from "@/utils/interviews/history";
import { InterviewShell } from "./_components/InterviewShell";
import { interviewUniversities } from "./_data/universities";

export const metadata: Metadata = {
  title: "Med Interviews | PhloemAI",
  description: "Practise medicine interviews with spoken answers, university rehearsals, study groups and feedback you can act on.",
  alternates: { canonical: "/phloemai/interviews" },
};

const routes = [
  { title: "AI interviews", description: "Think on your feet. Practise speaking, handle follow-ups and reflect on your answers.", href: "/phloemai/interviews/ai-interviews", label: "Enter the interview room", icon: Mic, tone: "bg-[#e1f4f0] text-[#08787b]" },
  { title: "Your universities", description: "Rehearse with school-specific timing, from MMI circuits to panel discussions.", href: "/phloemai/interviews/universities", label: "Explore all 42 entries", icon: GraduationCap, tone: "bg-[#eaf0fe] text-[#5473ad]" },
  { title: "Study groups", description: "Bring your friends, tackle a station together and learn from each other's answers.", href: "/phloemai/interviews/groups", label: "Find your people", icon: Users, tone: "bg-[#fcf0de] text-[#a07432]" },
  { title: "The leaderboard", description: "See the best free Why medicine? results and choose whether to share your own.", href: "/phloemai/interviews/leaderboard", label: "See the leaderboard", icon: Trophy, tone: "bg-[#f2eafb] text-[#8860ad]" },
] as const;

const statusLabels = {
  in_progress: "In progress",
  grading: "Feedback being prepared",
  completed: "Completed",
  failed: "Needs another try",
} as const;

export default async function Page() {
  const { attempts, message, signedIn } = await interviewHistory();
  const completed = attempts.filter((attempt) => attempt.status === "completed");
  const scored = completed.filter((attempt) => attempt.feedback !== null);
  const freeScores = scored.filter((attempt) => attempt.mode === "free").map((attempt) => attempt.feedback!.score);
  const average = scored.length ? Math.round(scored.reduce((sum, attempt) => sum + attempt.feedback!.score, 0) / scored.length) : null;
  const bestFree = freeScores.length ? Math.max(...freeScores) : null;
  const active = attempts.find((attempt) => attempt.status === "in_progress");
  const latestFeedback = scored[0]?.feedback;
  const recent = attempts.slice(0, 4);

  return (
    <InterviewShell title="Let's get you interview ready." subtitle="Find your voice, strengthen your reasoning, and turn every practice into something you can build on." activeLabel="Dashboard" eyebrow="Your interview workspace">
      {message && (
        <div role="status" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#cbdcde] bg-white px-5 py-4 text-sm text-[#4a6370]">
          <p>{message}</p>
          {!signedIn && <Link href="/phloemai/account" className="font-bold text-[#08787b]">Sign in <span aria-hidden="true">→</span></Link>}
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1.7fr_1fr]">
        <section className="relative overflow-hidden rounded-2xl bg-[#042724] px-6 py-8 text-white sm:px-9 sm:py-9">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full border-[40px] border-[#159a9d]/10" />
          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#66d1c5]/25 bg-[#159a9d]/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#a8eee4]"><span className="h-1.5 w-1.5 rounded-full bg-[#7ee8d6]" /> Your first station · Always free</span>
            <h2 className="mt-6 max-w-lg text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Why medicine?<br /><span className="text-[#8bded1]">Make it your answer.</span></h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-[#c0d8d4]">A thoughtful answer starts with your experience. Practise out loud, respond to follow-up questions, and get specific feedback on what to develop next.</p>
            <Link href="/phloemai/interviews/ai-interviews?station=why-medicine" className="mt-7 inline-flex items-center gap-3 rounded-xl bg-[#159a9d] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#20abad]"><Play className="h-4 w-4 fill-current" aria-hidden="true" /> Start your free station <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <p className="mt-4 text-xs leading-5 text-[#9fbbb6]">No subscription needed. Share your best score only when you choose.</p>
          </div>
        </section>
        <section className="flex flex-col rounded-2xl border border-[#d8e0e6] bg-white p-6 sm:p-7">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#08787b]"><Sparkles className="h-4 w-4" aria-hidden="true" /> Small steps, stronger answers</div>
          <h2 className="mt-4 text-xl font-bold text-[#042724]">{active ? "Pick up where you left off" : latestFeedback ? "Your next step" : "Build your first practice habit"}</h2>
          <p className="mt-3 flex-1 text-sm leading-7 text-[#4a6370]">{active ? `Your ${active.title} practice is still in progress. Return to your answers and continue when you're ready.` : latestFeedback?.improvements[0] ?? "Start with Why medicine?, read your feedback, then try one answer again with a clearer example. A little reflection makes the next attempt more useful."}</p>
          <div className="mt-6 space-y-3 border-t border-[#e7eef0] pt-5">
            {[
              { label: "Practise an answer", done: completed.length > 0 },
              { label: "Reflect on your feedback", done: false },
              { label: "Try your next station", done: false },
            ].map((step, index) => (
              <div key={step.label} className="flex items-center gap-3 text-sm text-[#314956]">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${step.done ? "bg-[#e1f4ef] text-[#08787b]" : "bg-[#f0f4f5] text-[#617984]"}`}>{step.done ? <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}</span>{step.label}
              </div>
            ))}
          </div>
          <Link href={active ? `/phloemai/interviews/ai-interviews?attempt=${active.id}` : latestFeedback ? `/phloemai/interviews/reports/${scored[0].id}` : "/phloemai/interviews/plan"} className="mt-6 inline-flex items-center justify-between rounded-xl border border-[#cfe0df] px-4 py-3 text-sm font-bold text-[#08787b] hover:bg-[#f2f9f7]">{active ? "Resume interview" : latestFeedback ? "Read your latest feedback" : "Open your practice plan"}<ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link>
        </section>
      </div>

      <section aria-label="Your saved practice statistics" className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Completed stations", value: String(completed.length), detail: "From your saved interview history", icon: ClipboardList },
          { label: "Average feedback score", value: average === null ? "—" : `${average}%`, detail: scored.length ? `Across ${scored.length} scored ${scored.length === 1 ? "station" : "stations"}` : "Complete a station to see your score", icon: CheckCircle2 },
          { label: "Best free station", value: bestFree === null ? "—" : `${bestFree}%`, detail: "Your personal Why medicine? best", icon: Trophy },
        ].map(({ label, value, detail, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-[#d8e0e6] bg-white px-6 py-5"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold text-[#4a6370]">{label}</p><Icon className="h-4 w-4 text-[#159a9d]" aria-hidden="true" /></div><p className="mt-3 text-3xl font-bold tracking-tight text-[#042724]">{value}</p><p className="mt-2 text-xs text-[#617984]">{detail}</p></div>
        ))}
      </section>

      <section className="mt-9">
        <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#08787b]">Make it a regular thing</p><h2 className="mt-2 text-xl font-bold text-[#042724]">Choose how you practise</h2></div><Link href="/phloemai/interviews/question-bank" className="text-xs font-bold text-[#08787b]">Browse the question bank <span aria-hidden="true">↗</span></Link></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {routes.map(({ title, description, href, label, icon: Icon, tone }) => (
            <Link key={href} href={href} className="group flex flex-col rounded-2xl border border-[#d8e0e6] bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-[#9bcac4] hover:shadow-sm"><span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><h3 className="mt-5 text-lg font-bold text-[#042724]">{title}</h3><p className="mt-2 flex-1 text-xs leading-6 text-[#4a6370]">{description}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#08787b]">{label}<ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" /></span></Link>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-[#d8e0e6] bg-white p-6">
          <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-bold text-[#042724]">Your recent practice</h2><Link href="/phloemai/interviews/reports" className="text-xs font-bold text-[#08787b]">All reports <span aria-hidden="true">↗</span></Link></div>
          {recent.length ? <div className="mt-5 divide-y divide-[#e7eef0]">{recent.map((attempt) => (
            <Link key={attempt.id} href={attempt.status === "in_progress" ? `/phloemai/interviews/ai-interviews?attempt=${attempt.id}` : `/phloemai/interviews/reports/${attempt.id}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eff7f5] text-[#08787b]"><Mic className="h-4 w-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-[#042724]">{attempt.title}</span><span className="mt-1 block text-xs text-[#617984]">{statusLabels[attempt.status]} · {new Date(attempt.startedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })}</span></span><span className="shrink-0 text-sm font-bold text-[#08787b]">{attempt.feedback ? `${attempt.feedback.score}%` : attempt.status === "in_progress" ? "Resume" : "View"}</span><ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#75918f]" aria-hidden="true" /></Link>
          ))}</div> : <div className="mt-5 rounded-xl border border-dashed border-[#cfdddf] bg-[#f8fbfa] px-5 py-8 text-center"><Mic className="mx-auto h-7 w-7 text-[#91b7af]" aria-hidden="true" /><h3 className="mt-4 text-sm font-bold text-[#042724]">Your first conversation goes here.</h3><p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-[#617984]">Completed stations and feedback will appear here as you practise. Start with the free Why medicine? station above.</p></div>}
        </section>
        <section className="rounded-2xl border border-[#d8e0e6] bg-[#f8fbfa] p-6">
          <div className="flex items-center gap-2 text-xs font-bold text-[#08787b]"><BookOpen className="h-4 w-4" aria-hidden="true" /> Prepare with purpose</div><h2 className="mt-4 text-lg font-bold text-[#042724]">Know what you are walking into.</h2><p className="mt-2 text-xs leading-6 text-[#4a6370]">Each university approaches interviews differently. Compare the format and timing, then bring your own experiences to the conversation.</p>
          <div className="mt-5 space-y-2">{["manchester", "oxford", "kings-college-london"].map((slug) => { const university = interviewUniversities.find((entry) => entry.slug === slug)!; return <Link key={slug} href={`/phloemai/interviews/universities/${slug}`} className="flex items-center justify-between gap-3 rounded-xl border border-[#dde8e7] bg-white px-4 py-3"><span className="min-w-0"><span className="block truncate text-xs font-bold text-[#042724]">{university.name}</span><span className="mt-1 block text-[10px] text-[#617984]">{university.format} · Format and practice notes</span></span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#08787b]" aria-hidden="true" /></Link>; })}</div>
          <Link href="/phloemai/interviews/guides" className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#08787b]">Read the preparation guides <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
        </section>
      </div>
    </InterviewShell>
  );
}
