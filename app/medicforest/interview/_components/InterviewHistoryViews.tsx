import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
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
    circuitId: attempt.circuitId,
    stationIndex: attempt.stationIndex,
    stationCount: attempt.stationCount,
    title: interviewStations.find((station) => station.slug === attempt.stationSlug)?.title ?? attempt.title,
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

export async function InterviewHistoryViews() {
  const { attempts, message, savedAttempts } = await savedInterviewHistory();
  return (
    <div className="space-y-6">
      {message && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
          {message} <Link href="/medicforest/account" className="font-bold underline">Account</Link>
        </p>
      )}
      <section className="overflow-hidden rounded-2xl border border-[#dce6e5] bg-white">
        <div className="border-b border-[#e6edec] p-6">
          <h2 className="font-bold">Your saved interviews</h2>
          <p className="mt-2 text-sm leading-6 text-[#62777e]">
            Every saved attempt stays here when you retry a station. Revisit your transcript, answer framework and feedback, or find a particular university below.
          </p>
        </div>
        {!attempts.length ? (
          <EmptyHistory />
        ) : (
          <SavedInterviewList attempts={savedAttempts} />
        )}
      </section>
    </div>
  );
}

function EmptyHistory() {
  return (
    <div className="px-6 py-14 text-center">
      <BookOpen className="mx-auto text-[#9bb4b1]" size={32} />
      <h3 className="mt-5 font-bold">Ready when you are</h3>
      <p className="mt-2 text-sm text-[#62777e]">Complete your first interview to start building your progress.</p>
      <Link href="/medicforest/interview/ai-interviews" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-5 py-3 text-sm font-bold text-white">
        Try the free station <ArrowRight size={16} />
      </Link>
    </div>
  );
}
