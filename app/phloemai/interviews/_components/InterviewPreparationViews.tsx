import Link from "next/link";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Target, TrendingUp } from "lucide-react";
import { getInterviewDashboardData } from "@/utils/interviews/dashboard-data";
import { InterviewPlanChecklist } from "./InterviewPlanChecklist";
import { InterviewPreparationSetup } from "./InterviewPreparationSetup";

export async function InterviewPreparationViews({ view }: { view: "plan" | "progress" | "notifications" }) {
  const { analytics, profile, signedIn, available, message, historyLimited } = await getInterviewDashboardData();
  const { stats, weeklyInsight } = analytics;
  const due = analytics.targets.filter((target) => target.daysUntil !== null && target.daysUntil >= 0 && target.daysUntil <= 14);
  return <div className="space-y-6">
    {message && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">{message}{!signedIn && <> <Link href="/phloemai/account" className="font-bold underline">Sign in</Link></>}</p>}

    {view === "plan" ? <>
      <section className="rounded-3xl bg-[#042724] p-7 text-white sm:p-9">
        <Target className="text-[#b9f4db]" size={28} />
        <h2 className="mt-4 text-3xl font-bold">A plan that fits your next step.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-teal-50/75">Your selected focus areas and saved practice help shape this plan. Interview tasks complete when feedback is saved; mark reading and review tasks when you have done them.</p>
        <div className="mt-6 flex flex-wrap gap-5 text-sm"><span>{analytics.todayPlan.filter((task) => task.completed).length} / {analytics.todayPlan.length} tasks completed today</span><span className="text-[#b9f4db]">{stats.weekCompleted} / {stats.weeklyTarget} stations in the last 7 days</span></div>
      </section>
      <InterviewPlanChecklist tasks={analytics.todayPlan} available={signedIn && available} />
      <p className="text-xs leading-6 text-[#62777e]">Today follows the UK calendar. Completed tasks reset on a new day. Your weekly target counts completed interviews in the last seven days, not reading tasks.</p>
      <InterviewPreparationSetup initialProfile={profile} signedIn={signedIn} available={available} variant="compact" />
    </> : view === "progress" ? <>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { title: "Completed stations", value: String(stats.completedCount), note: "Saved completed interviews" },
          { title: "Recent practice score", value: stats.recentAverage === null ? "—" : `${stats.recentAverage}%`, note: stats.recentSampleSize ? `From your latest ${stats.recentSampleSize} scored stations` : "Complete a station to see a score" },
          { title: stats.practiceTimeEstimated ? "Estimated practice time" : "Practice time", value: `${Math.floor(stats.practiceMinutes / 60)}h ${stats.practiceMinutes % 60}m`, note: stats.practiceTimeEstimated ? "Older attempts use a capped time estimate" : "Answering time, excluding preparation and feedback generation" },
        ].map((item) => <section key={item.title} className="rounded-2xl border border-[#dce6e5] bg-white p-6"><p className="text-xs font-semibold text-[#62777e]">{item.title}</p><p className="mt-3 text-4xl font-bold text-[#123c39]">{item.value}</p><p className="mt-3 text-xs leading-5 text-[#62777e]">{item.note}</p></section>)}
      </div>
      <section className="rounded-2xl border border-[#dce6e5] bg-white p-7">
        <h2 className="text-lg font-bold">Your practice by theme</h2>
        <p className="mt-2 text-sm leading-6 text-[#62777e]">Each score averages the latest five scored attempts in that theme. At least two attempts are needed before a theme is identified as a strength or an area to develop.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">{analytics.themes.map((theme) => <div key={theme.theme} className="rounded-xl bg-[#f5f9f8] p-5"><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">{theme.label}</h3><span className="font-bold text-[#08787b]">{theme.averageScore === null ? "—" : `${theme.averageScore}%`}</span></div><div className="mt-4 h-2 rounded-full bg-[#e0eae7]"><div className="h-2 rounded-full bg-[#159a9d]" style={{ width: `${theme.averageScore ?? 0}%` }} /></div><p className="mt-3 text-xs text-[#62777e]">{theme.sampleSize === 0 ? "Not practised yet" : theme.sampleSize === 1 ? "1 scored attempt · more practice needed for a pattern" : `${theme.sampleSize} recent scored attempts`}</p></div>)}</div>
      </section>
      <section className="rounded-2xl bg-[#e4f0ed] p-7"><TrendingUp className="text-[#08787b]" size={26} /><h2 className="mt-4 text-xl font-bold">Your weekly insight</h2><p className="mt-3 text-sm leading-7 text-[#415f5c]">{weeklyInsight.message}</p><p className="mt-3 text-xs leading-6 text-[#62777e]">Last 7 days: {weeklyInsight.currentCount} scored stations. Previous 7 days: {weeklyInsight.previousCount}. Score changes are percentage points, not an admissions prediction.</p><Link href="/phloemai/interviews/reports" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#08787b]">Explore your reports <ArrowRight size={16} /></Link></section>
      {historyLimited && <p className="text-xs text-[#62777e]">Lifetime totals include all saved attempts. Theme and recent activity details use your latest 500 attempts.</p>}
    </> : <>
      <section className="rounded-2xl border border-[#dce6e5] bg-white p-7"><div className="flex items-center gap-3"><CalendarDays className="text-[#08787b]" size={23} /><h2 className="text-lg font-bold">Your upcoming interviews</h2></div>
        {due.length ? <div className="mt-5 divide-y divide-[#e7eeee]">{due.map((target) => <Link key={target.universitySlug} href={target.href} className="flex items-center justify-between gap-4 py-4"><span><span className="block text-sm font-bold">{target.name}</span><span className="mt-1 block text-xs text-[#62777e]">{target.daysUntil === 0 ? "Today" : `${target.daysUntil} days to go`} · {target.interviewDate}</span></span><ArrowRight className="shrink-0 text-[#08787b]" size={18} /></Link>)}</div> : <p className="mt-4 text-sm leading-7 text-[#62777e]">{profile?.targets.length ? "No confirmed interview dates in the next two weeks. You can update your dates below." : "Add your target universities and optional dates to see upcoming interview reminders here."}</p>}
      </section>
      <section className="rounded-2xl border border-[#dce6e5] bg-white p-7"><div className="flex items-center gap-3"><CheckCircle2 className="text-[#08787b]" size={23} /><h2 className="text-lg font-bold">Feedback ready to review</h2></div>{analytics.recentPerformance.length ? <div className="mt-5 divide-y divide-[#e7eeee]">{analytics.recentPerformance.slice(0, 5).map((attempt) => <Link href={attempt.href} key={attempt.id} className="flex items-center justify-between gap-4 py-4"><span><span className="block text-sm font-semibold">{attempt.title}</span><span className="mt-1 block text-xs text-[#62777e]">{new Date(attempt.completedAt).toLocaleDateString("en-GB", { timeZone: "Europe/London" })}</span></span><span className="font-bold text-[#08787b]">{attempt.score}%</span></Link>)}</div> : <div className="mt-5 rounded-xl bg-[#f5f9f8] p-5"><Clock3 className="text-[#8bab9f]" size={24} /><p className="mt-3 text-sm text-[#62777e]">Your completed interview feedback will appear here.</p><Link href="/phloemai/interviews/ai-interviews?station=why-medicine" className="mt-4 inline-flex text-sm font-bold text-[#08787b]">Start the free station →</Link></div>}</section>
      <InterviewPreparationSetup initialProfile={profile} signedIn={signedIn} available={available} variant="compact" />
    </>}
  </div>;
}
