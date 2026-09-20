import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { interviewAiConfigured } from "@/utils/interviews/gemini";
import { toInterviewAttempt, validId } from "@/utils/interviews/server";
import { InterviewShell } from "../../_components/InterviewShell";
import { SavedInterviewReview } from "../../_components/SavedInterviewReview";
import { findInterviewStation } from "../../_data/interview-stations";

export const metadata = { title: "Your saved interview review | PhloemAI" };

export default async function Page({ params }: { params: Promise<{ report: string }> }) {
  const { report } = await params;
  if (!validId(report)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <InterviewShell title="Your private interview review" subtitle="Sign in to view your saved interview." activeLabel="Reports"><Link className="font-bold text-teal-700 underline" href="/phloemai/account">Sign in to your account</Link></InterviewShell>;
  const { data, error } = await supabase.from("interview_attempts").select("*").eq("id", report).eq("user_id", user.id).maybeSingle();
  if (error) return <InterviewShell title="Your interview review" subtitle="Your saved interview could not be loaded right now. Please try again shortly." activeLabel="Reports"><Link href="/phloemai/interview/reports" className="font-bold text-teal-700 underline">Back to saved interviews</Link></InterviewShell>;
  if (!data) notFound();
  const attempt = toInterviewAttempt(data);
  const { data: stations, error: stationsError } = await supabase.from("interview_attempts")
    .select("id,title,station_slug,station_index,status,completed_at").eq("user_id", user.id).eq("circuit_id", attempt.circuitId).order("station_index");
  const currentIndex = stations?.findIndex((station) => station.id === attempt.id) ?? -1;
  const previous = stations?.[currentIndex - 1];
  const next = stations?.[currentIndex + 1];
  return <InterviewShell title={attempt.stationCount > 1 ? "Your interview" : attempt.title} subtitle="Your saved transcript, answer framework and optional AI feedback." activeLabel="Reports" heroHeader>
    {stationsError && <p role="alert" className="mb-4 text-sm">The other stations could not be loaded. Refresh to try again.</p>}
    {stations && attempt.stationCount > 1 && <nav aria-label="Interview stations" className="mb-6 border-y border-[#d7e3e1] bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm"><strong>{stations.length} of {attempt.stationCount} stations saved</strong><div className="flex gap-4">
        {previous && <Link className="font-semibold text-[#08787b] underline" href={`/phloemai/interview/reports/${previous.id}`}>Previous station</Link>}
        {next && <Link className="font-semibold text-[#08787b] underline" href={`/phloemai/interview/reports/${next.id}`}>Next station</Link>}
      </div></div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{stations.map((station) => <li key={station.id}><Link aria-current={station.id === attempt.id ? "page" : undefined} href={`/phloemai/interview/reports/${station.id}`} className={`block h-full rounded-md border p-3 text-sm ${station.id === attempt.id ? "border-[#08787b] bg-[#eaf6f2] text-[#084d48]" : "border-[#d7e3e1] text-[#526b72] hover:bg-[#f5f9f8]"}`}><strong className="block">{station.station_index + 1}. {findInterviewStation(station.station_slug)?.title ?? station.title}</strong><span className="mt-1 block text-xs">{station.completed_at ? "Completed" : station.status === "in_progress" ? "In progress" : "Ended"}</span></Link></li>)}</ol>
    </nav>}
    <SavedInterviewReview key={attempt.id} initialAttempt={attempt} configured={interviewAiConfigured()} serverNow={new Date().toISOString()} abandoned={data.last_error === "abandoned"} hasLaterStation={Boolean(next)} />
  </InterviewShell>;
}
