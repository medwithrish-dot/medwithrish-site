"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, BookOpen, Check, Circle, Loader2, Mic, MessageSquare } from "lucide-react";
import type { DashboardAnalytics } from "@/utils/interviews/dashboard-analytics";

export function InterviewPlanChecklist({ tasks, compact = false, available = true }: { tasks: DashboardAnalytics["todayPlan"]; compact?: boolean; available?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function toggle(task: DashboardAnalytics["todayPlan"][number]) {
    if (busy || task.kind === "station") return;
    setBusy(task.id); setError("");
    try {
      const response = await fetch("/api/interviews/preparation/tasks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId: task.id, completed: !task.completed }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your task could not be saved.");
      router.refresh();
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Your task could not be saved."); }
    finally { setBusy(null); }
  }

  return <div>
    <div className={compact ? "divide-y divide-[#e6eeee]" : "space-y-4"}>
      {tasks.map((task) => {
        const Icon = task.kind === "station" ? Mic : task.kind === "guide" ? BookOpen : MessageSquare;
        return <div key={task.id} className={compact ? "py-4 first:pt-0 last:pb-0" : "rounded-2xl border border-[#dce6e5] bg-white p-5"}>
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${task.completed ? "bg-[#e0f3eb] text-[#0b8563]" : "bg-[#edf5f4] text-[#08787b]"}`}>{task.completed ? <Check size={17} /> : <Icon size={17} />}</span>
            <div className="min-w-0 flex-1">
              <Link href={task.href} className="group flex items-start justify-between gap-2 text-sm font-bold text-[#123c39] hover:text-[#08787b]"><span>{task.title}</span><ArrowUpRight className="mt-0.5 shrink-0" size={15} /></Link>
              {!compact && <p className="mt-2 text-sm leading-6 text-[#62777e]">{task.description}</p>}
              <p className="mt-1 text-xs text-[#62777e]">{task.completed ? "Completed today" : `${task.minutes} min · ${task.kind === "station" ? "Interview practice" : task.kind === "guide" ? "Read and reflect" : "Review feedback"}`}</p>
              {task.kind !== "station" && <button type="button" disabled={!!busy || !available} onClick={() => void toggle(task)} className="mt-2 inline-flex min-h-8 items-center gap-2 text-xs font-semibold text-[#08787b] underline underline-offset-4 disabled:opacity-50">{busy === task.id ? <Loader2 size={13} className="animate-spin" /> : task.completed ? <Check size={13} /> : <Circle size={13} />}{task.completed ? "Mark as not done" : "Mark as done"}</button>}
            </div>
          </div>
        </div>;
      })}
    </div>
    {error && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-xs leading-5 text-amber-900">{error}</p>}
  </div>;
}
