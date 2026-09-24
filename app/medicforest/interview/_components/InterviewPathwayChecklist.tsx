"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  changePathwayStation,
  derivePathwayProgress,
  INTERVIEW_PATHWAY,
  PATHWAY_GUEST_KEY,
  sanitisePathwayProgress,
} from "@/utils/interviews/pathway";

type Props = {
  userId: string | null;
  initialCompleted: string[];
  available: boolean;
};

export function InterviewPathwayChecklist({
  userId,
  initialCompleted,
  available,
}: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [ready, setReady] = useState(Boolean(userId && available));
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const progress = derivePathwayProgress(completed);

  useEffect(() => {
    let active = true;

    async function restore() {
      if (pending.current) return;
      try {
        let ids: string[];
        if (userId) {
          const response = await fetch("/api/interviews/preparation/pathway", {
            cache: "no-store",
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || "Your pathway could not be loaded.");
          }
          if (data.userId !== userId) {
            throw new Error("Your account has changed. Refresh to continue.");
          }
          ids = sanitisePathwayProgress(data.completedTaskIds);
        } else {
          if (!available) throw new Error("Your pathway is currently unavailable.");
          ids = sanitisePathwayProgress(
            JSON.parse(localStorage.getItem(PATHWAY_GUEST_KEY) ?? "[]")
          );
        }

        if (active && !pending.current) {
          setCompleted(ids);
          setReady(true);
          setError("");
        }
      } catch (failure) {
        if (active) {
          setReady(false);
          setError(
            failure instanceof Error
              ? failure.message
              : "Your pathway could not be loaded."
          );
        }
      }
    }

    void restore();
    window.addEventListener("focus", restore);
    window.addEventListener("pageshow", restore);
    if (!userId) window.addEventListener("storage", restore);
    return () => {
      active = false;
      window.removeEventListener("focus", restore);
      window.removeEventListener("pageshow", restore);
      window.removeEventListener("storage", restore);
    };
  }, [available, userId]);

  async function toggle(stationId: string, done: boolean) {
    if (!ready || pending.current) return;
    pending.current = true;
    setBusy(stationId);
    setError("");

    try {
      let ids = changePathwayStation(completed, stationId, done).completedTaskIds;
      if (userId) {
        const response = await fetch("/api/interviews/preparation/pathway", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stationId,
            completed: done,
            expectedUserId: userId,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Your pathway could not be saved.");
        }
        ids = sanitisePathwayProgress(data.completedTaskIds);
      } else {
        localStorage.setItem(PATHWAY_GUEST_KEY, JSON.stringify(ids));
      }
      setCompleted(ids);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Your pathway could not be saved."
      );
    } finally {
      pending.current = false;
      setBusy(null);
    }
  }

  return (
    <>
      <ol className="mt-5 divide-y divide-[#e6edec]">
        {INTERVIEW_PATHWAY.map((station, index) => {
          const state = progress.stations[index];
          const disabled = !ready || Boolean(busy) || (!state.unlocked && !state.complete);
          return (
            <li key={station.id} className="py-3">
              <label
                className={`flex items-start gap-3 ${
                  disabled ? "cursor-not-allowed opacity-55" : "cursor-pointer"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[10px] font-bold transition ${
                    state.complete
                      ? "border-[#17866d] bg-[#17866d] text-white"
                      : "border-[#bfd0ca] bg-white text-[#638478]"
                  }`}
                >
                  {busy === station.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : state.complete ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={state.complete}
                  disabled={disabled}
                  onChange={(event) =>
                    void toggle(station.id, event.target.checked)
                  }
                />
                <span className="min-w-0">
                  <span
                    className={`block text-xs font-semibold ${
                      state.complete
                        ? "text-[#78908a] line-through decoration-[#78908a]"
                        : "text-[#34584e]"
                    }`}
                  >
                    {station.title}
                  </span>
                  <span
                    className={`mt-1 block text-[10px] leading-5 ${
                      state.complete
                        ? "text-[#91a29e] line-through decoration-[#91a29e]"
                        : "text-[#718581]"
                    }`}
                  >
                    {station.description}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-[#687d80]">
        {progress.allComplete
          ? "Pathway complete — you are ready to bring it together in mock interviews."
          : "Tick each step in order. Your progress is saved and carries over each day."}
      </p>
      {!userId && (
        <p className="mt-2 text-[10px] leading-5 text-[#718581]">
          Progress is saved in this browser.{" "}
          <Link href="/medicforest/account" className="font-bold text-[#08787b] underline">
            Sign in
          </Link>{" "}
          to save it to your account.
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
          {error}
        </p>
      )}
    </>
  );
}
