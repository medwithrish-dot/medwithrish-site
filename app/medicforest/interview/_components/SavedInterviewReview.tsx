"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import type { InterviewAttempt } from "../_lib/interview-types";
import { AIInterviewReview } from "./AIInterviewReview";

type ReviewResponse = { attempt: InterviewAttempt | null; configured?: boolean; serverNow?: string };
type Action = "finish" | "generate" | "retry";

class ReviewRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function reviewRequest(path: string, method = "GET", body?: unknown): Promise<ReviewResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 55_000);
  try {
    const response = await fetch(path, { method, cache: "no-store", signal: controller.signal,
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new ReviewRequestError(result.error || "This request could not be completed. Please try again.", response.status);
    return result as ReviewResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("The request timed out. Your saved transcript is safe; please retry.");
    throw error;
  } finally { window.clearTimeout(timeout); }
}

export function SavedInterviewReview({ initialAttempt, configured: initialConfigured, serverNow, abandoned = false, hasLaterStation = false }: {
  initialAttempt: InterviewAttempt; configured: boolean; serverNow: string; abandoned?: boolean; hasLaterStation?: boolean;
}) {
  const router = useRouter();
  const [attempt, setAttempt] = useState(initialAttempt);
  const [configured, setConfigured] = useState(initialConfigured);
  const [now, setNow] = useState(() => Date.parse(serverNow));
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);
  const [notice, setNotice] = useState("");
  const [activeAttemptId, setActiveAttemptId] = useState("");
  const attemptRef = useRef(initialAttempt);
  const offsetRef = useRef(0);
  const liveRef = useRef(true);
  const actionLockRef = useRef(false);
  const finishAttemptedRef = useRef<string | null>(null);
  const retryCircuitRef = useRef<string | null>(null);
  const stationEnd = Date.parse(attempt.startedAt) + (attempt.preparationSeconds + attempt.stationSeconds) * 1000;
  const active = attempt.status === "in_progress" && now < stationEnd;
  const expired = attempt.status === "in_progress" && !active;
  const interviewHref = `/medicforest/interview/ai-interviews?attempt=${encodeURIComponent(attempt.id)}`;

  useEffect(() => {
    liveRef.current = true;
    offsetRef.current = Date.parse(serverNow) - Date.now();
    return () => { liveRef.current = false; };
  }, [serverNow]);

  useEffect(() => {
    if (attempt.status !== "in_progress") return;
    const interval = window.setInterval(() => setNow(Date.now() + offsetRef.current), 1000);
    return () => window.clearInterval(interval);
  }, [attempt.status]);

  const applyResponse = useCallback((response: ReviewResponse) => {
    if (response.serverNow) offsetRef.current = Date.parse(response.serverNow) - Date.now();
    if (response.attempt) attemptRef.current = response.attempt;
    if (!liveRef.current) return;
    if (response.attempt) setAttempt(response.attempt);
    if (response.configured !== undefined) setConfigured(response.configured);
    setNow(Date.now() + offsetRef.current);
  }, []);

  const runAction = useCallback(async (action: Action) => {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    setBusy(action === "retry" ? "Opening your new attempt…" : action === "generate" ? "Preparing your AI feedback…" : "Saving your station review…");
    setError("");
    setErrorStatus(0);
    setNotice("");
    setActiveAttemptId("");
    try {
      let current = attemptRef.current;
      if (current.status === "in_progress") {
        const latest = await reviewRequest(`/api/interviews/session?attempt=${encodeURIComponent(current.id)}`);
        applyResponse(latest);
        if (!latest.attempt) throw new Error("Your saved interview could not be found.");
        current = latest.attempt;
        if (current.status === "in_progress") {
          const deadline = Date.parse(current.startedAt) + (current.preparationSeconds + current.stationSeconds) * 1000;
          if (Date.now() + offsetRef.current < deadline) throw new Error("This station is still running. Resume it to continue your interview.");
          // Empty input preserves the latest account answers in the server's
          // merge, including changes made after this report was opened.
          const finished = await reviewRequest("/api/interviews/session", "PATCH", { attemptId: current.id, finish: true, answers: [], metrics: current.metrics });
          applyResponse(finished);
          if (!finished.attempt) throw new Error("Your station could not be saved. Please retry.");
          current = finished.attempt;
        }
      }
      if (action === "generate") {
        if (abandoned) throw new Error("This older attempt was ended without submission. Retry the station to receive feedback on a new answer.");
        const response = await reviewRequest("/api/interviews/feedback", "POST", { attemptId: current.id });
        applyResponse(response);
        if (liveRef.current && response.attempt?.status === "grading") setNotice("Your feedback is still being prepared. Check again in a moment.");
      } else if (action === "retry") {
        // Reuse the request's new circuit ID after a timeout. The reservation
        // RPC can return the same retry instead of spending another start.
        const circuitId = retryCircuitRef.current ?? crypto.randomUUID();
        retryCircuitRef.current = circuitId;
        const response = await reviewRequest("/api/interviews/session", "POST", {
          mode: current.mode, universitySlug: current.universitySlug ?? undefined,
          stationSlug: current.stationSlug, stationIndex: 0, stationCount: 1, circuitId,
        });
        if (!response.attempt) throw new Error("Your new station could not be opened. Please retry.");
        if (!liveRef.current) return;
        if (response.attempt.circuitId !== circuitId) {
          setActiveAttemptId(response.attempt.id);
          setNotice("You already have an active interview. Resume it before starting another attempt of this station.");
          return;
        }
        router.push(`/medicforest/interview/ai-interviews?attempt=${encodeURIComponent(response.attempt.id)}`);
      }
    } catch (failure) {
      if (liveRef.current) {
        setError(failure instanceof Error ? failure.message : "Your request could not be completed. Please retry.");
        setErrorStatus(failure instanceof ReviewRequestError ? failure.status : 0);
      }
      // A timed-out save or grading request may still have completed. Reconcile
      // once without requesting more AI, keeping the existing transcript on errors.
      if (action !== "retry") {
        try {
          const latest = await reviewRequest(`/api/interviews/session?attempt=${encodeURIComponent(attemptRef.current.id)}`);
          applyResponse(latest);
          if (liveRef.current && (action === "generate" ? latest.attempt?.feedback : latest.attempt && latest.attempt.status !== "in_progress")) setError("");
        } catch { /* The current saved transcript remains available. */ }
      }
    } finally {
      actionLockRef.current = false;
      if (liveRef.current) setBusy("");
    }
  }, [abandoned, applyResponse, router]);

  useEffect(() => {
    if (!expired || finishAttemptedRef.current === attempt.id) return;
    finishAttemptedRef.current = attempt.id;
    void runAction("finish");
  }, [attempt.id, expired, runAction]);

  return <>
    {error && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <p>{error}</p>
      {expired && <button type="button" className="mt-2 font-bold underline" disabled={Boolean(busy)} onClick={() => void runAction("finish")}>Retry saving review</button>}
      {errorStatus === 401 && <Link href="/medicforest/account" className="mt-2 inline-block font-bold underline">Sign in to your account</Link>}
      {errorStatus === 403 && <Link href="/medicforest/pricing" className="mt-2 inline-block font-bold underline">View membership options</Link>}
    </div>}
    {notice && <div role="status" className="mb-5 rounded-xl border border-[#cce2db] bg-[#edf7f2] p-4 text-sm leading-6 text-[#254f46]"><p>{notice}</p>{activeAttemptId && <Link href={`/medicforest/interview/ai-interviews?attempt=${encodeURIComponent(activeAttemptId)}`} className="mt-2 inline-flex items-center gap-2 font-bold underline">Resume active interview <ArrowRight size={15} /></Link>}</div>}
    {busy && <p role="status" className="mb-5 flex items-center gap-2 text-sm text-[#526b72]"><Loader2 size={17} className="animate-spin" />{busy}</p>}
    {active ? <section className="rounded-2xl border border-[#dce6e5] bg-white p-7"><p className="text-xs font-bold uppercase tracking-widest text-[#08787b]">Interview in progress</p><h1 className="mt-3 text-2xl font-bold text-[#042724]">{attempt.title}</h1><p className="mt-3 text-sm leading-7 text-[#526b72]">Your station is still running. Resume your interview to continue; your transcript and answer framework will be ready when it ends.</p><Link href={interviewHref} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-5 py-3 text-sm font-bold text-white">Resume station <ArrowRight size={16} /></Link></section> : <>
      {abandoned && <p className="mb-5 rounded-xl bg-white p-4 text-sm leading-6 text-[#526b72]">This older attempt was ended without submission. Your saved transcript and study guide are available, and you can retry the station.</p>}
      <AIInterviewReview attempt={attempt} configured={configured && !abandoned} busy={Boolean(busy)} onGenerate={() => void runAction("generate")} onRetry={() => void runAction("retry")} />
      {!hasLaterStation && !abandoned && attempt.completedAt && attempt.status !== "in_progress" && attempt.stationIndex + 1 < attempt.stationCount && <div className="mt-5 rounded-xl border border-[#cce2db] bg-[#edf7f2] p-5 text-sm leading-6 text-[#254f46]"><p>Your interview has more stations. Continue whenever you are ready.</p><Link href={interviewHref} className="mt-2 inline-flex items-center gap-2 font-bold underline">Continue this interview <ArrowRight size={16} /></Link></div>}
    </>}
  </>;
}
