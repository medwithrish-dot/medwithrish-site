import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BarChart3, BookOpen, CalendarDays, CheckCircle2, ClipboardList, Clock3, GraduationCap, Lightbulb, Mic, Play, Sparkles, Target, TrendingUp, Trophy, Users } from "lucide-react";
import type { getInterviewDashboardData } from "@/utils/interviews/dashboard-data";
import { InterviewPlanChecklist } from "./InterviewPlanChecklist";
import { InterviewPreparationSetup } from "./InterviewPreparationSetup";

type DashboardData = Awaited<ReturnType<typeof getInterviewDashboardData>>;
const panel = "min-w-0 rounded-2xl border border-[#d4e1e2] bg-white p-5 shadow-[0_2px_5px_rgba(4,39,36,0.025)] sm:p-6";
const base = "/phloemai/interviews";

function PanelHeading({ title, href, action, icon }: { title: string; href?: string; action?: string; icon?: ReactNode }) {
  return <div className="flex items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.09em] text-[#08787b]">{icon}{title}</h2>{href && action && <Link href={href} className="shrink-0 text-xs font-semibold text-[#08787b] underline-offset-4 hover:underline">{action}</Link>}</div>;
}

function PracticeRing({ score, count }: { score: number | null; count: number }) {
  const circumference = 2 * Math.PI * 51;
  return <div className="my-6 flex items-center gap-5">
    <div role="img" aria-label={score === null ? "No scored practice yet" : `Recent practice score ${score} percent, from ${count} scored ${count === 1 ? "station" : "stations"}`} className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90" aria-hidden="true"><circle cx="64" cy="64" r="51" fill="none" stroke="#e5efed" strokeWidth="10" /><circle cx="64" cy="64" r="51" fill="none" stroke="#159a9d" strokeWidth="10" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - (score ?? 0) / 100)} opacity={score === null ? 0 : 1} /></svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-3xl font-bold tabular-nums tracking-tight text-[#042724]">{score === null ? "—" : <>{score}<span className="ml-0.5 text-lg">%</span></>}</span><span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#617a7a]">Recent score</span></div>
    </div>
    <div className="min-w-0"><p className="text-sm font-bold leading-6 text-[#173d3d]">Recent practice score</p><p className="mt-2 text-xs leading-5 text-[#61777b]">{count ? `Average of your ${count} most recent scored ${count === 1 ? "station" : "stations"}.` : "Complete your first station to start building a picture of your practice."}</p>{count > 0 && <p className="mt-2 text-[10px] leading-4 text-[#718788]">A practice measure, not an admissions prediction.</p>}</div>
  </div>;
}

function dateLabel(date: string | null | undefined) {
  return date ? new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" }) : "Date not set";
}
function practiceDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}m` : ""}`;
}

export function InterviewDashboard({ data }: { data: DashboardData }) {
  const { analytics, profile, signedIn, available, message } = data;
  const { stats, nextAction, targets, themes, strengths, weaknesses, recentPerformance, weeklyInsight } = analytics;
  const measuredThemes = themes.filter((theme) => theme.averageScore !== null);
  const firstStrength = strengths[0];
  const firstWeakness = weaknesses[0];
  const completedToday = analytics.todayPlan.filter((task) => task.completed).length;
  const targetProgress = stats.weeklyTarget > 0 ? Math.min(100, stats.weekCompleted / stats.weeklyTarget * 100) : 0;

  return <div className="space-y-5">
    <section aria-labelledby="free-station-title" className="relative overflow-hidden rounded-2xl bg-[#042724] p-6 text-white sm:p-7">
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-80 w-80 rounded-full border-[44px] border-[#159a9d]/10" />
      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl"><p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#9de5db]"><span className="h-1.5 w-1.5 rounded-full bg-[#9de5db]" /> Your free interview station</p><h2 id="free-station-title" className="mt-3 text-3xl font-bold tracking-tight">Why medicine? <span className="text-[#a7e9dc]">Start with your story.</span></h2><p className="mt-3 max-w-xl text-sm leading-6 text-[#c0d9d4]">Practise your answer, respond to follow-up questions and get feedback you can act on. Your personal best can join the leaderboard when you choose.</p></div>
        <div className="shrink-0"><Link href={`${base}/ai-interviews?station=why-medicine`} className="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-[#b9f4db] px-5 py-3.5 text-sm font-bold text-[#042724] transition-colors hover:bg-white"><Play className="h-4 w-4 fill-current" aria-hidden="true" /> Start your free station <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><p className="mt-3 text-center text-xs text-[#afcec7]">{stats.bestFreeScore === null ? "No subscription needed" : `Your best free station: ${stats.bestFreeScore}%`}</p></div>
      </div>
    </section>

    {message && <div role="status" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#cbdcde] bg-white px-5 py-4 text-sm leading-6 text-[#4a6370]"><p>{message}</p>{!signedIn && <Link href="/phloemai/account" className="inline-flex items-center gap-2 font-bold text-[#08787b]">Sign in to personalise your dashboard <ArrowRight className="h-4 w-4" /></Link>}</div>}
    <div id="preparation-settings" className="scroll-mt-5"><InterviewPreparationSetup key={profile?.updatedAt ?? "new"} initialProfile={profile} signedIn={signedIn} available={available} variant={profile ? "compact" : "full"} /></div>

    <section aria-label="Your practice statistics" className="grid gap-3 sm:grid-cols-3">
      {[
        { label: "Stations completed", value: String(stats.completedCount), detail: `${stats.scoredCount} with saved AI feedback`, icon: ClipboardList, tone: "bg-[#e6f3ed] text-[#128065]" },
        { label: "Average practice score", value: stats.averageScore === null ? "—" : `${stats.averageScore}%`, detail: stats.scoredCount ? `Across ${stats.scoredCount} scored ${stats.scoredCount === 1 ? "station" : "stations"}` : "Your first score will appear here", icon: BarChart3, tone: "bg-[#e6f3f6] text-[#08787b]" },
        { label: "Practice time", value: practiceDuration(stats.practiceMinutes), detail: stats.practiceTimeEstimated ? "Completed answer time · includes estimates" : "Time answering completed stations", icon: Clock3, tone: "bg-[#fdf1df] text-[#a3742d]" },
      ].map(({ label, value, detail, icon: Icon, tone }) => <div key={label} className={`${panel} flex items-center gap-4`}><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" aria-hidden="true" /></span><div className="min-w-0"><p className="text-xs font-semibold text-[#61777b]">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums text-[#042724]">{value}</p><p className="mt-1 text-[10px] leading-4 text-[#718788]">{detail}</p></div></div>)}
    </section>
    {data.historyLimited && <p className="px-1 text-[10px] leading-5 text-[#718788]">Practice totals cover your full saved history. Recent trends and suggestions use your latest 500 stations.</p>}

    <div className="grid items-start gap-5 xl:grid-cols-3">
      <section className={panel}>
        <PanelHeading title="Your next best action" icon={<Sparkles className="h-4 w-4" aria-hidden="true" />} />
        <PracticeRing score={stats.recentAverage} count={stats.recentSampleSize} />
        <div className="border-t border-[#e4eceb] pt-5"><h3 className="text-base font-bold leading-6 text-[#042724]">{nextAction.title}</h3><p className="mt-2 text-xs leading-6 text-[#61777b]">{nextAction.description}</p><Link href={nextAction.href} className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-[#08787b] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#042724]"><span>{nextAction.reason === "resume" ? "Continue your station" : "Take your next step"}</span><ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" /></Link></div>
      </section>

      <section className={panel}>
        <PanelHeading title="Your interviews" action="Edit dates" href="#preparation-settings" icon={<GraduationCap className="h-4 w-4" aria-hidden="true" />} />
        {targets.length > 0 ? <div className="mt-5 space-y-3">{targets.map((university) => <article key={university.universitySlug} className="rounded-xl border border-[#dce7e6] bg-[#fafcfc] p-4">
          <div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e4f0ed] text-[#08787b]"><GraduationCap className="h-4 w-4" aria-hidden="true" /></span><div className="min-w-0"><Link href={university.href} className="text-sm font-bold leading-5 text-[#173d3d] hover:underline">{university.name}</Link><p className="mt-1 flex items-center gap-1.5 text-[10px] text-[#718788]"><CalendarDays className="h-3 w-3 shrink-0" aria-hidden="true" />{dateLabel(university.interviewDate)}</p></div></div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2"><span className={`rounded-md px-2 py-1 text-[10px] font-bold ${university.dateStatus === "today" || (university.daysUntil !== null && university.daysUntil > 0 && university.daysUntil <= 7) ? "bg-[#fff0d9] text-[#946821]" : "bg-[#edf3f2] text-[#567472]"}`}>{university.dateStatus === "today" ? "Interview today" : university.dateStatus === "past" ? "Interview date passed" : university.daysUntil === null ? "Add your interview date" : university.daysUntil === 1 ? "1 day to go" : `${university.daysUntil} days to go`}</span><Link href={`${base}/ai-interviews?university=${encodeURIComponent(university.universitySlug)}`} className="inline-flex items-center gap-1 text-xs font-bold text-[#08787b]">Practise <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div>
          <p className="mt-3 text-[10px] leading-4 text-[#718788]">{university.averageScore === null ? "No scored practice for this university yet" : `${university.averageScore}% average · ${university.sampleSize} recent scored ${university.sampleSize === 1 ? "station" : "stations"}`}</p>
        </article>)}</div> : <div className="mt-5 rounded-xl border border-dashed border-[#cddedb] bg-[#f8fbfa] px-4 py-7 text-center"><GraduationCap className="mx-auto h-8 w-8 text-[#9dbbb5]" aria-hidden="true" /><h3 className="mt-3 text-sm font-bold text-[#173d3d]">Bring your universities into view</h3><p className="mt-2 text-xs leading-6 text-[#61777b]">Add the schools you are applying to and any interview dates. Your countdowns and university practice will appear here.</p><Link href="#preparation-settings" className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#08787b]">Choose your universities <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div>}
        <Link href={`${base}/universities`} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#08787b]">Explore university formats <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </section>

      <section className={panel}>
        <PanelHeading title="Today's plan" action="View plan" href={`${base}/plan`} icon={<Target className="h-4 w-4" aria-hidden="true" />} />
        <div className="mt-5 flex items-center justify-between gap-3"><p className="text-xs leading-5 text-[#61777b]">Small steps for your next conversation.</p><span className="shrink-0 rounded-full bg-[#e9f5ef] px-2.5 py-1 text-[10px] font-bold text-[#08735b]">{completedToday}/{analytics.todayPlan.length} done</span></div>
        <div className="mt-4"><InterviewPlanChecklist tasks={analytics.todayPlan} compact available={available && signedIn} /></div>
        <p className="mt-4 border-t border-[#e6edec] pt-4 text-[10px] leading-5 text-[#718788]">Completed stations update automatically. You decide when a guide or feedback review is done.</p>
      </section>

      <section className={panel}>
        <PanelHeading title="Strengths & weaknesses" action="View progress" href={`${base}/progress`} icon={<BarChart3 className="h-4 w-4" aria-hidden="true" />} />
        {measuredThemes.length ? <>
          <div className="mt-5 space-y-4">{measuredThemes.map((theme) => <div key={theme.theme}><div className="flex items-baseline justify-between gap-3"><span className="text-xs font-semibold text-[#314f51]">{theme.label}</span><span className="text-xs font-bold tabular-nums text-[#08787b]">{theme.averageScore}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#eaf1ef]"><div className="h-full rounded-full bg-[#159a9d]" style={{ width: `${theme.averageScore}%` }} /></div><p className="mt-1.5 text-[10px] text-[#7b8e8e]">{theme.sampleSize} scored {theme.sampleSize === 1 ? "station · early evidence" : "stations in this average"}</p></div>)}</div>
          {(firstStrength || firstWeakness) && <div className="mt-5 space-y-2 border-t border-[#e5edeb] pt-4">{firstStrength && <p className="flex items-start gap-2 text-xs leading-5 text-[#376b57]"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span>Current strength: <strong>{firstStrength.label}</strong></span></p>}{firstWeakness && firstWeakness.theme !== firstStrength?.theme && <p className="flex items-start gap-2 text-xs leading-5 text-[#8b7139]"><Target className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span>Next area to develop: <strong>{firstWeakness.label}</strong></span></p>}</div>}
          <p className="mt-4 text-[10px] leading-5 text-[#718788]">Theme averages use up to five recent scored stations. Comparisons need at least two scores per theme.</p>
        </> : <div className="mt-5 rounded-xl bg-[#f7faf9] p-5"><BarChart3 className="h-7 w-7 text-[#8eb6ae]" aria-hidden="true" /><h3 className="mt-4 text-sm font-bold text-[#173d3d]">Build evidence of your progress</h3><p className="mt-2 text-xs leading-6 text-[#61777b]">Your scored practice will reveal patterns across interview themes. Complete a station to start; strengths and areas to develop need at least two scores per theme.</p><Link href={`${base}/ai-interviews?station=why-medicine`} className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-[#08787b]">Start your first station <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div>}
      </section>

      <section className={panel}>
        <PanelHeading title="Recent performance" action="All reports" href={`${base}/reports`} icon={<ClipboardList className="h-4 w-4" aria-hidden="true" />} />
        {recentPerformance.length ? <div className="mt-5 divide-y divide-[#e5edeb]">{recentPerformance.slice(0, 5).map((attempt) => <Link key={attempt.id} href={attempt.href} className="group flex items-center gap-3 py-4 first:pt-0 last:pb-0"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#edf6f3] text-[#08787b]"><Mic className="h-4 w-4" aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-xs font-bold leading-5 text-[#173d3d] group-hover:text-[#08787b]">{attempt.title}</span><span className="mt-1 block text-[10px] text-[#718788]">{new Date(attempt.completedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "Europe/London" })}</span></span><span className="shrink-0 text-sm font-bold tabular-nums text-[#08787b]">{attempt.score === null ? "View" : `${attempt.score}%`}</span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#809893]" aria-hidden="true" /></Link>)}</div> : <div className="mt-5 rounded-xl border border-dashed border-[#cddedb] bg-[#f8fbfa] px-4 py-8 text-center"><Mic className="mx-auto h-7 w-7 text-[#9dbbb5]" aria-hidden="true" /><h3 className="mt-4 text-sm font-bold text-[#173d3d]">Your practice story starts here</h3><p className="mt-2 text-xs leading-6 text-[#61777b]">Your completed interviews and feedback will appear here. Each report keeps your answers and next steps together.</p></div>}
        <Link href={`${base}/reports`} className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-[#08787b]">Open your interview history <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </section>

      <section className={`${panel} !border-[#c9ded7] !bg-[#f0f7f3]`}>
        <PanelHeading title="This week's insight" icon={<Lightbulb className="h-4 w-4" aria-hidden="true" />} />
        <div className="mt-5 flex items-end justify-between gap-3"><div><p className="text-3xl font-bold tabular-nums text-[#173d3d]">{stats.weekCompleted}</p><p className="mt-1 text-xs font-semibold text-[#61777b]">{stats.weekCompleted === 1 ? "station completed in the last 7 days" : "stations completed in the last 7 days"}</p></div>{weeklyInsight.changePoints !== null && <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold ${weeklyInsight.changePoints >= 0 ? "bg-[#dbefdf] text-[#357348]" : "bg-[#f5ead6] text-[#927132]"}`}><TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />{weeklyInsight.changePoints > 0 ? "+" : ""}{weeklyInsight.changePoints} pts</span>}</div>
        {profile && <div className="mt-4"><div className="mb-2 flex justify-between gap-3 text-[10px] font-semibold text-[#637d70]"><span>Your weekly goal</span><span>{stats.weekCompleted}/{stats.weeklyTarget} stations</span></div><div className="h-2 overflow-hidden rounded-full bg-[#dcebe1]"><div className="h-full rounded-full bg-[#6da983]" style={{ width: `${targetProgress}%` }} /></div></div>}
        <p className="mt-5 text-xs leading-6 text-[#476b59]">{weeklyInsight.message}</p>
        {weeklyInsight.currentCount > 0 && <p className="mt-3 text-[10px] leading-5 text-[#6e897a]">Last 7 days: {weeklyInsight.currentCount} scored {weeklyInsight.currentCount === 1 ? "station" : "stations"}{weeklyInsight.currentAverage === null ? "" : ` · ${weeklyInsight.currentAverage}% average`}. {weeklyInsight.previousCount > 0 ? `Previous 7 days: ${weeklyInsight.previousCount} scored ${weeklyInsight.previousCount === 1 ? "station" : "stations"}.` : "A weekly comparison appears after you build more history."}</p>}
        {analytics.latestFeedback && <div className="mt-5 border-t border-[#d5e5da] pt-4"><p className="text-[10px] font-bold uppercase tracking-wider text-[#61806c]">From your latest feedback</p><p className="mt-2 text-xs leading-6 text-[#476b59]">{analytics.latestFeedback}</p></div>}
        <Link href={profile ? `${base}/progress` : "#preparation-settings"} className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#42744f]">{profile ? "Explore your progress" : "Set your weekly practice goal"}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link>
      </section>
    </div>

    <nav aria-label="More ways to prepare" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[
        { title: "Practise with friends", label: "Open your study groups", href: `${base}/groups`, icon: Users },
        { title: "Explore questions", label: "Find a theme to work on", href: `${base}/question-bank`, icon: BookOpen },
        { title: "University formats", label: "Check your interview format", href: `${base}/universities`, icon: GraduationCap },
        { title: "Your free station best", label: "Visit the Why medicine? leaderboard", href: `${base}/leaderboard`, icon: Trophy },
      ].map(({ title, label, href, icon: Icon }) => <Link key={href} href={href} className="group flex items-center gap-3 rounded-xl border border-[#d7e3e1] bg-white p-4 transition-colors hover:border-[#9fc5bb] hover:bg-[#f8fcfa]"><Icon className="h-5 w-5 shrink-0 text-[#5a9184]" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block text-xs font-bold text-[#173d3d]">{title}</span><span className="mt-1 block text-[10px] leading-4 text-[#718788]">{label}</span></span><ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[#6b958b]" aria-hidden="true" /></Link>)}
    </nav>
  </div>;
}
