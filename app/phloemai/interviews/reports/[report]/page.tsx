import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Lightbulb, MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { toInterviewAttempt, validId } from "@/utils/interviews/server";
import { InterviewShell } from "../../_components/InterviewShell";

export const metadata = { title: "Your interview feedback | PhloemAI" };
export default async function Page({ params }: { params: Promise<{ report: string }> }) {
  const { report } = await params;
  if (!validId(report)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <InterviewShell title="Your private feedback" subtitle="Sign in to view your saved interview." activeLabel="Reports"><Link className="font-bold text-teal-700 underline" href="/phloemai/account">Sign in to your account</Link></InterviewShell>;
  const { data, error } = await supabase.from("interview_attempts").select("*").eq("id", report).eq("user_id", user.id).maybeSingle();
  if (error) return <InterviewShell title="Your interview report" subtitle="Your report could not be loaded right now. Please try again shortly." activeLabel="Reports"><Link href="/phloemai/interviews/reports" className="font-bold text-teal-700 underline">Back to reports</Link></InterviewShell>;
  if (!data) notFound();
  const attempt = toInterviewAttempt(data);
  const feedback = attempt.feedback;
  return <InterviewShell title={attempt.title} subtitle={`${new Date(attempt.startedAt).toLocaleDateString("en-GB", { timeZone: "Europe/London" })} · Your private interview report`} activeLabel="Reports">
    {feedback ? <>
      <section className="flex flex-col gap-6 rounded-3xl bg-[#042724] p-8 text-white sm:flex-row sm:items-center"><div className="shrink-0"><p className="text-xs font-bold uppercase tracking-widest text-[#a6d8cd]">Practice score</p><p className="mt-3 text-6xl font-bold tabular-nums">{feedback.score}<span className="text-3xl">%</span></p><p className="mt-3 text-xs text-teal-100/70">Capped at 99%</p></div><div className="sm:border-l sm:border-white/15 sm:pl-8"><h2 className="font-bold">Your feedback</h2><p className="mt-3 text-sm leading-7 text-teal-50/80">{feedback.summary}</p></div></section>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">{[{ title: "Keep building on", icon: CheckCircle2, items: feedback.strengths }, { title: "Try next time", icon: Lightbulb, items: feedback.improvements }].map((section) => <section key={section.title} className="rounded-2xl border border-[#dce6e5] bg-white p-7"><section.icon size={24} className="text-[#159a9d]" /><h2 className="mt-4 text-lg font-bold">{section.title}</h2><ul className="mt-4 space-y-4">{section.items.map((item) => <li key={item} className="flex gap-3 text-sm leading-7 text-[#526b72]"><span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#159a9d]" />{item}</li>)}</ul></section>)}</div>
      <section className="mt-6 rounded-2xl border border-[#dce6e5] bg-white p-7"><h2 className="text-lg font-bold">What went into your score</h2><p className="mt-2 text-sm text-[#62777e]">Five equally weighted rubric scores, then the same fixed logarithmic conversion used for every candidate.</p><div className="mt-6 grid gap-5">{feedback.rubric.map((row) => <div key={row.criterion} className="rounded-xl bg-[#f5f9f8] p-5"><div className="flex justify-between gap-4 text-sm font-bold"><span>{row.criterion}</span><span className="text-[#08787b]">{row.score}/100</span></div><p className="mt-2 text-sm leading-6 text-[#526b72]">{row.reason}</p></div>)}</div></section>
    </> : <section className="rounded-2xl border border-[#dce6e5] bg-white p-7"><h2 className="font-bold">{data.last_error === "abandoned" ? "This station was ended" : "Your answers are saved"}</h2><p className="mt-3 text-sm leading-6 text-[#526b72]">{data.last_error === "abandoned" ? "This attempt has no score. You can start a new station when you are ready." : "Resume this station or retry feedback to complete your report."}</p><Link href={data.last_error === "abandoned" ? "/phloemai/interviews/ai-interviews" : `/phloemai/interviews/ai-interviews?attempt=${attempt.id}`} className="mt-5 inline-flex items-center gap-2 font-bold text-[#08787b]">{data.last_error === "abandoned" ? "Start a new station" : "Open interview"}<ArrowRight size={16} /></Link></section>}
    <section className="mt-6 rounded-2xl border border-[#dce6e5] bg-white p-7"><div className="flex items-center gap-3"><MessageSquare size={22} className="text-[#159a9d]" /><h2 className="text-lg font-bold">Your saved answers</h2></div><p className="mt-2 text-xs leading-6 text-[#62777e]">Only you can see this transcript. Voice observations are optional coaching cues and do not affect the score.</p><div className="mt-6 space-y-6">{attempt.questions.map((question) => <div key={question}><h3 className="text-sm font-bold">{question}</h3><p className="mt-3 whitespace-pre-wrap rounded-xl bg-[#f5f9f8] p-5 text-sm leading-7 text-[#526b72]">{attempt.answers.find((a) => a.question === question)?.answer || "No answer saved for this question."}</p></div>)}</div></section>
    <div className="mt-6 flex flex-wrap gap-5"><Link href={`/phloemai/interviews/ai-interviews?station=${attempt.stationSlug}`} className="inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-5 py-3 text-sm font-bold text-white">Practise again <ArrowRight size={16} /></Link>{attempt.mode === "free" && feedback && <Link href="/phloemai/interviews/leaderboard" className="rounded-xl border border-[#cfe0df] bg-white px-5 py-3 text-sm font-bold text-[#08787b]">Share your best score</Link>}</div>
  </InterviewShell>;
}
