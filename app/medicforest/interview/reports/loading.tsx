import { InterviewShell } from "../_components/InterviewShell";

export default function ReportsLoading() {
  return (
    <InterviewShell
      title="A clearer picture of your progress."
      subtitle="Your answers, feedback and next steps, saved in one place."
      activeLabel="Reports"
    >
      <div className="space-y-6">
        <div className="overflow-hidden rounded-2xl border border-[#dce6e5] bg-white p-6">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-100" />
          <div className="mt-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex h-20 animate-pulse items-center rounded-xl bg-slate-50 p-4" />
            ))}
          </div>
        </div>
      </div>
    </InterviewShell>
  );
}
