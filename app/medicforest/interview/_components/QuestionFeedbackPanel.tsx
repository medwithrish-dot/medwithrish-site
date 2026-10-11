"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { requestFeatureAccess } from "@/utils/medicforest/feature-access";
import { FREE_QUESTION_FEEDBACK_USED, type QuestionFeedbackAccess } from "../_lib/question-feedback";
import { stripSpeechPauseMarkers } from "../_lib/speech-delivery";
import { getWordCount } from "../_lib/question-bank-storage";

export function QuestionFeedbackPanel({ questionId, answer }: { questionId: string; answer: string }) {
  const [access, setAccess] = useState<QuestionFeedbackAccess | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestRunning = useRef(false);
  const feedbackSection = useRef<HTMLElement>(null);
  const cleanAnswer = stripSpeechPauseMarkers(answer).trim();
  const sameAnswer = access?.attempt?.answers[0]?.answer === cleanAnswer;
  const feedback = sameAnswer ? access?.attempt?.feedback : null;
  const retrying = sameAnswer && access?.attempt?.status !== "completed";
  const exhausted = Boolean(access && !access.isPremium && access.freeUsed);

  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const response = await fetch(`/api/interviews/question-feedback?question=${encodeURIComponent(questionId)}`, { cache: "no-store", signal: controller.signal });
        const payload = await response.json();
        if (!controller.signal.aborted && response.ok) setAccess(payload);
      } catch { /* Generating feedback performs a fresh server-side access check. */ }
    };
    void refresh();
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); window.removeEventListener("focus", refresh); };
  }, [questionId]);

  const generate = async () => {
    if (feedback) { feedbackSection.current?.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    if (exhausted && !retrying) { requestFeatureAccess("premium", "More personalised AI feedback", true); return; }
    if (requestRunning.current) return;
    requestRunning.current = true;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/interviews/question-feedback", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId, answer: cleanAnswer }),
      });
      const payload = await response.json();
      if (payload.upgradeRequired) {
        setAccess((current) => ({ isPremium: false, freeUsed: true, attempt: current?.attempt ?? null }));
        requestFeatureAccess("premium", "More personalised AI feedback", true);
        return;
      }
      if (response.status === 401) { requestFeatureAccess("free", "AI feedback", true); return; }
      if (!response.ok) throw new Error(payload.error ?? "AI feedback could not be generated. Please retry.");
      setAccess(payload);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "AI feedback could not be generated. Please retry.");
    } finally { requestRunning.current = false; setBusy(false); }
  };

  return <section ref={feedbackSection} className="rounded-xl border border-[#b9dcda] bg-white p-5 shadow-sm" aria-label="AI feedback">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h2 className="text-base font-black text-[#071923]">AI feedback</h2>
      <button type="button" onClick={() => void generate()} disabled={busy || (!exhausted && !feedback && getWordCount(cleanAnswer) < 20)}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#08787b] px-4 text-sm font-black text-white hover:bg-[#06696b] disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {busy ? "Generating feedback..." : feedback ? "View AI feedback" : "Generate AI feedback"}
      </button>
    </div>
    {access?.isPremium ? <p className="mt-3 text-sm text-[#4a6370]">Generate personalised feedback on your saved interview answers.</p>
      : <p className="mt-3 text-sm font-medium text-[#4a6370]">{exhausted ? FREE_QUESTION_FEEDBACK_USED : "Your free account includes one AI feedback report, once per account."}
        {exhausted && <button type="button" onClick={() => requestFeatureAccess("premium", "More personalised AI feedback", true)} className="ml-2 font-bold text-[#08787b] underline">Upgrade to Premium</button>}
      </p>}
    {!feedback && getWordCount(cleanAnswer) < 20 && <p className="mt-2 text-xs text-[#5d707a]">Write at least 20 words to receive useful feedback.</p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    {feedback && <div className="mt-4 space-y-4 text-sm leading-6 text-[#4a6370]">
      <p className="font-bold text-[#071923]">Practice score: {feedback.score}%</p><p>{feedback.summary}</p>
      {[{ title: "Strengths", items: feedback.strengths }, { title: "Areas to improve", items: feedback.weaknesses ?? [] }, { title: "Next steps", items: feedback.fixes ?? feedback.improvements }].filter((group) => group.items.length).map((group) => <div key={group.title}>
        <h3 className="font-bold text-[#071923]">{group.title}</h3><ul className="mt-2 list-disc space-y-1 pl-5">{group.items.map((item, index) => <li key={index}>{item}</li>)}</ul>
      </div>)}
      <p className="text-xs text-[#5d707a]">Practice feedback follows this question&apos;s mark scheme. It is not an admissions prediction.</p>
    </div>}
  </section>;
}
