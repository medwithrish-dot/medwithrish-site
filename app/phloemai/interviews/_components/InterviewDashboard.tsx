import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, GraduationCap, Mic, Settings2, Sparkles, TrendingUp } from "lucide-react";
import type { getInterviewDashboardData } from "@/utils/interviews/dashboard-data";
import { InterviewPlanChecklist } from "./InterviewPlanChecklist";
import { InterviewPreparationSetup } from "./InterviewPreparationSetup";

type DashboardData = Awaited<ReturnType<typeof getInterviewDashboardData>>;
const base = "/phloemai/interviews";
const panel = "rounded-2xl border border-[#d7e3e1] bg-white";

function dateLabel(date: string | null | undefined) {
  return date ? new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }) : "Date not added";
}

function practiceDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
}

export function InterviewDashboard({ data }: { data: DashboardData }) {
  const { analytics, profile, signedIn, available, message } = data;
  const { stats, nextAction, targets, recentPerformance, weeklyInsight } = analytics;
  const completedToday = analytics.todayPlan.filter((task) => task.completed).length;
  const targetProgress = stats.weeklyTarget > 0 ? Math.min(100, stats.weekCompleted / stats.weeklyTarget * 100) : 0;
  const latest = recentPerformance[0];

  return <div className="space-y-5">
    {message && signedIn && <div role="status" className="rounded-xl border border-[#cbdcde] bg-white px-5 py-3 text-xs leading-5 text-[#526b72]"><p>{message}</p></div>}

    <section aria-labelledby="next-step-title" className="overflow-hidden rounded-2xl bg-[#042724] text-white">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_270px]">
        <div className="p-6 sm:p-7">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9de5db]"><Sparkles className="h-3.5 w-3.5" /> Your next step</p>
          <h2 id="next-step-title" className="mt-3 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">{nextAction.title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#bdd5d0]">{nextAction.description}</p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href={nextAction.href} className="inline-flex min-h-11 items-center gap-3 rounded-xl bg-[#b9f4db] px-5 py-3 text-sm font-bold text-[#042724] hover:bg-white">{nextAction.reason === "resume" ? "Continue interview" : "Start next step"}<ArrowRight className="h-4 w-4" /></Link>
            <Link href={`${base}/ai-interviews`} className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#b8d9d2] hover:text-white">See all interview options <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
        </div>
        <div className="flex flex-col justify-center border-t border-white/10 bg-white/[0.035] p-6 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8fb9af]">This week</p>
          <div className="mt-3 flex items-end gap-2"><strong className="text-4xl font-bold tabular-nums">{stats.weekCompleted}</strong><span className="pb-1 text-xs text-[#a9c7c0]">of {stats.weeklyTarget} stations</span></div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#9de5bd]" style={{ width: `${targetProgress}%` }} /></div>
          <p className="mt-4 text-xs leading-5 text-[#a9c7c0]">{weeklyInsight.message}</p>
        </div>
      </div>
    </section>

    <section aria-label="Practice overview" className={`${panel} grid divide-y divide-[#e5eceb] sm:grid-cols-3 sm:divide-x sm:divide-y-0`}>
      {[
        ["Stations", String(stats.completedCount), "completed"],
        ["Average score", stats.averageScore === null ? "—" : `${stats.averageScore}%`, stats.scoredCount ? `${stats.scoredCount} marked` : "complete a station"],
        ["Practice time", practiceDuration(stats.practiceMinutes), "total"],
      ].map(([label, value, detail]) => <div key={label} className="flex items-baseline justify-between gap-4 px-5 py-4 sm:block"><p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#708684]">{label}</p><p className="sm:mt-2"><strong className="text-xl font-bold tabular-nums text-[#153d3d]">{value}</strong><span className="ml-2 text-[10px] text-[#7a8d8c]">{detail}</span></p></div>)}
    </section>
    {data.historyLimited && <p className="px-1 text-[10px] leading-5 text-[#718788]">Recent suggestions use your latest 500 stations.</p>}

    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,.65fr)]">
      <section className={`${panel} p-5 sm:p-6`} aria-labelledby="today-title">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#08787b]">Today</p><h2 id="today-title" className="mt-2 text-lg font-bold text-[#173d3d]">Your practice plan</h2><p className="mt-1 text-xs text-[#687d80]">Finish these in any order. Keep it manageable.</p></div>
          <span className="rounded-full bg-[#e9f5ef] px-3 py-1.5 text-[10px] font-bold text-[#08735b]">{completedToday}/{analytics.todayPlan.length} done</span>
        </div>
        <div className="mt-5"><InterviewPlanChecklist tasks={analytics.todayPlan} compact available={available && signedIn} /></div>
        <Link href={`${base}/plan`} className="mt-5 inline-flex items-center gap-2 border-t border-[#e6edec] pt-4 text-xs font-bold text-[#08787b]">View your full plan <ArrowRight className="h-3.5 w-3.5" /></Link>
      </section>

      <div className="space-y-5">
        <section className={`${panel} p-5`} aria-labelledby="interviews-title">
          <div className="flex items-center justify-between gap-3"><h2 id="interviews-title" className="flex items-center gap-2 text-sm font-bold text-[#173d3d]"><GraduationCap className="h-4 w-4 text-[#08787b]" /> Your interviews</h2><Link href="#preparation-settings" className="text-[10px] font-bold text-[#08787b]">Edit</Link></div>
          {targets.length ? <div className="mt-4 divide-y divide-[#e7eeee]">{targets.slice(0, 3).map((university) => <Link key={university.universitySlug} href={`${base}/ai-interviews?university=${encodeURIComponent(university.universitySlug)}`} className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf5f2] text-[#08787b]"><GraduationCap className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#284b4c] group-hover:text-[#08787b]">{university.name}</strong><span className="mt-1 flex items-center gap-1 text-[10px] text-[#748789]"><CalendarDays className="h-3 w-3" />{dateLabel(university.interviewDate)}</span></span><ChevronRight className="h-4 w-4 text-[#91a4a1]" /></Link>)}</div> : <div className="mt-4 rounded-xl bg-[#f5f9f8] p-4"><p className="text-xs font-bold text-[#315553]">No universities added yet</p><p className="mt-1 text-[10px] leading-5 text-[#718486]">Add the schools you’re preparing for to keep their practice links here.</p><Link href="#preparation-settings" className="mt-3 inline-flex text-[10px] font-bold text-[#08787b]">Add universities <ArrowRight className="ml-1 h-3 w-3" /></Link></div>}
          {targets.length > 3 && <p className="mt-3 text-[10px] text-[#788b8b]">+ {targets.length - 3} more in your preparation settings</p>}
        </section>

        <section className={`${panel} p-5`} aria-labelledby="latest-title">
          <div className="flex items-center justify-between gap-3"><h2 id="latest-title" className="flex items-center gap-2 text-sm font-bold text-[#173d3d]"><TrendingUp className="h-4 w-4 text-[#08787b]" /> Latest progress</h2><Link href={`${base}/reports`} className="text-[10px] font-bold text-[#08787b]">All reports</Link></div>
          {latest ? <Link href={latest.href} className="mt-4 flex items-center gap-3 rounded-xl bg-[#f3f8f6] p-4"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#08787b]"><Mic className="h-4 w-4" /></span><span className="min-w-0 flex-1"><strong className="block truncate text-xs text-[#284b4c]">{latest.title}</strong><span className="mt-1 block text-[10px] text-[#748789]">{new Date(latest.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })}</span></span><strong className="text-lg text-[#08787b]">{latest.score === null ? "View" : `${latest.score}%`}</strong></Link> : <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#f5f9f8] p-4"><CheckCircle2 className="h-5 w-5 shrink-0 text-[#8eaaa6]" /><p className="text-[10px] leading-5 text-[#718486]">Complete an interview to see your latest score and feedback here.</p></div>}
          {analytics.latestFeedback && <p className="mt-3 border-l-2 border-[#a6cec2] pl-3 text-[10px] leading-5 text-[#617a76]">{analytics.latestFeedback}</p>}
        </section>
      </div>
    </div>

    <section className="rounded-2xl border border-[#d7e3e1] bg-[#f7faf9]" id="preparation-settings">
      <details>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 marker:hidden sm:px-6">
          <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#08787b]"><Settings2 className="h-4 w-4" /></span><span><strong className="block text-xs text-[#294e4c]">Preparation settings</strong><span className="mt-1 block text-[10px] text-[#718486]">Universities, interview dates, focus areas and weekly target</span></span></span>
          <span className="text-[10px] font-bold text-[#08787b]">Open settings</span>
        </summary>
        <div className="border-t border-[#dfe8e6] p-3"><InterviewPreparationSetup key={profile?.updatedAt ?? "new"} initialProfile={profile} signedIn={signedIn} available={available} variant="compact" /></div>
      </details>
    </section>

    <nav aria-label="Interview shortcuts" className="flex flex-wrap gap-x-6 gap-y-3 px-1 text-xs font-semibold text-[#617a79]">
      <Link href={`${base}/question-bank`} className="hover:text-[#08787b]">Question bank</Link>
      <Link href={`${base}/universities`} className="hover:text-[#08787b]">University formats</Link>
      <Link href={`${base}/progress`} className="hover:text-[#08787b]">Detailed progress</Link>
      <Link href={`${base}/groups`} className="hover:text-[#08787b]">Study groups</Link>
    </nav>
  </div>;
}
