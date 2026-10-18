import Link from "@/app/medicforest/_components/MedicForestLink";
import { ArrowRight, BookOpen } from "lucide-react";
import { interviewHistory, savedInterviewSummaries } from "@/utils/interviews/history";
import { SavedInterviewList } from "./SavedInterviewList";

async function savedInterviewHistory() {
  const { attempts, message, nextCursor } = await interviewHistory();
  return { attempts, message, nextCursor, savedAttempts: savedInterviewSummaries(attempts) };
}

export async function InterviewHistoryViews() {
  const { attempts, message, savedAttempts, nextCursor } = await savedInterviewHistory();
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
            Choose AI interviews or Question bank below. Resume paused interviews, or revisit saved answers and feedback.
          </p>
        </div>
        {!attempts.length ? (
          <EmptyHistory />
        ) : (
          <SavedInterviewList key={savedAttempts[0]?.id} attempts={savedAttempts} nextCursor={nextCursor} />
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
      <p className="mt-2 text-sm text-[#62777e]">Complete your first Med interview to start building your progress.</p>
      <Link href="/medicforest/interview/ai-interviews" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-5 py-3 text-sm font-bold text-white">
        Try the free station <ArrowRight size={16} />
      </Link>
    </div>
  );
}
