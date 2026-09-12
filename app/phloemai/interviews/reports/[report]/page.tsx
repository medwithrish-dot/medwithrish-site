import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { interviewAiConfigured } from "@/utils/interviews/gemini";
import { toInterviewAttempt, validId } from "@/utils/interviews/server";
import { InterviewShell } from "../../_components/InterviewShell";
import { SavedInterviewReview } from "../../_components/SavedInterviewReview";

export const metadata = { title: "Your saved interview review | PhloemAI" };

export default async function Page({ params }: { params: Promise<{ report: string }> }) {
  const { report } = await params;
  if (!validId(report)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <InterviewShell title="Your private interview review" subtitle="Sign in to view your saved interview." activeLabel="Reports"><Link className="font-bold text-teal-700 underline" href="/phloemai/account">Sign in to your account</Link></InterviewShell>;
  const { data, error } = await supabase.from("interview_attempts").select("*").eq("id", report).eq("user_id", user.id).maybeSingle();
  if (error) return <InterviewShell title="Your interview review" subtitle="Your saved interview could not be loaded right now. Please try again shortly." activeLabel="Reports"><Link href="/phloemai/interviews/reports" className="font-bold text-teal-700 underline">Back to saved interviews</Link></InterviewShell>;
  if (!data) notFound();
  const attempt = toInterviewAttempt(data);
  return <InterviewShell title={attempt.title} subtitle="Your saved transcript, answer framework and optional AI feedback." activeLabel="Reports" heroHeader>
    <SavedInterviewReview key={attempt.id} initialAttempt={attempt} configured={interviewAiConfigured()} serverNow={new Date().toISOString()} abandoned={data.last_error === "abandoned"} />
  </InterviewShell>;
}
