import { InterviewShell } from "../../_components/InterviewShell";

export default function ReportDetailLoading() {
  return (
    <InterviewShell
      title="Loading your interview report…"
      subtitle="Retrieving your conversation transcript, markschemes and feedback."
      activeLabel="Reports"
      heroHeader
    >
      <div className="space-y-6">
        <div className="h-28 animate-pulse rounded-2xl bg-white p-6 border border-[#dce6e5]" />
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="h-96 animate-pulse rounded-2xl bg-white border border-[#dce6e5]" />
          <div className="h-96 animate-pulse rounded-2xl bg-white border border-[#dce6e5]" />
        </div>
      </div>
    </InterviewShell>
  );
}
