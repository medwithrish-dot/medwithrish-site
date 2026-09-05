"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Loader2, Mic, MicOff, RotateCcw, Sparkles, Trophy, Volume2, VolumeX } from "lucide-react";
import { interviewUniversities } from "../_data/universities";
import type { InterviewAnswer, InterviewAttempt, InterviewMode } from "../_lib/interview-types";
import { getTranscriptHints, useInterviewSpeech } from "../_lib/useInterviewSpeech";

type SessionResponse = { attempt: InterviewAttempt | null; serverNow?: string; configured?: boolean; isPremium?: boolean };
type StartOptions = { mode: InterviewMode; universitySlug?: string; stationSlug?: string; circuitId?: string; stationIndex?: number };
type LocalDraft = { answers: InterviewAnswer[]; questionIndex: number };

class InterviewRequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

async function requestSession(path: string, method = "GET", body?: unknown, signal?: AbortSignal): Promise<SessionResponse> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 55_000);
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  try {
    const response = await fetch(path, {
      method, cache: "no-store", signal: controller.signal,
      ...(body === undefined ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new InterviewRequestError(result.error || "Your request could not be completed. Please try again.", response.status);
    return result as SessionResponse;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError" && !signal?.aborted) throw new Error("The request timed out. Your saved answers are safe; please retry.");
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

const draftKey = (id: string) => `phloem-interview-draft:${id}`;
const formatTime = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;
const buttonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#08787b] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#065b5d] disabled:cursor-not-allowed disabled:opacity-50";
const secondaryClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#cfe0df] bg-white px-4 py-2 text-sm font-bold text-[#08787b] hover:bg-[#edf7f6] disabled:cursor-not-allowed disabled:opacity-50";

export function AIInterviewRunner({ initialUniversitySlug, initialStationSlug }: { initialUniversitySlug?: string; initialStationSlug?: string }) {
  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [universitySlug, setUniversitySlug] = useState(initialUniversitySlug ?? interviewUniversities[0]?.slug ?? "");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);
  const [saveWarning, setSaveWarning] = useState("");
  const [saved, setSaved] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [now, setNow] = useState(0);
  const [microphoneConsent, setMicrophoneConsent] = useState(false);
  const [readAloud, setReadAloud] = useState(true);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const attemptRef = useRef<InterviewAttempt | null>(null);
  const answersRef = useRef<InterviewAnswer[]>([]);
  const questionIndexRef = useRef(0);
  const clockOffsetRef = useRef(0);
  const savedSignatureRef = useRef("");
  const savePromiseRef = useRef<Promise<void> | null>(null);
  const submitLockRef = useRef(false);
  const actionLockRef = useRef(false);
  const expirySubmittedRef = useRef<string | null>(null);
  const spokenQuestionRef = useRef("");

  const persistLocal = useCallback((nextAnswers: InterviewAnswer[], index = questionIndexRef.current) => {
    const current = attemptRef.current;
    if (!current) return;
    try { localStorage.setItem(draftKey(current.id), JSON.stringify({ answers: nextAnswers, questionIndex: index })); }
    catch { /* Account autosave remains available when browser storage is disabled. */ }
  }, []);

  const replaceAnswers = useCallback((nextAnswers: InterviewAnswer[]) => {
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    setSaved(false);
    persistLocal(nextAnswers);
  }, [persistLocal]);

  const speech = useInterviewSpeech({ onTranscript: (text) => {
    const current = attemptRef.current;
    if (!current || current.status !== "in_progress") return;
    const index = questionIndexRef.current;
    replaceAnswers(answersRef.current.map((answer, answerIndex) => answerIndex === index
      ? { ...answer, answer: `${answer.answer}${answer.answer ? " " : ""}${text}`.slice(0, 6_000) }
      : answer));
  } });
  const { stop: stopListening, stopSpeaking, speak, voiceSupported } = speech;

  const applyResponse = useCallback((response: SessionResponse, restore = false) => {
    if (response.serverNow) clockOffsetRef.current = Date.parse(response.serverNow) - Date.now();
    setNow(Date.now() + clockOffsetRef.current);
    if (response.configured !== undefined) setConfigured(response.configured);
    if (response.isPremium !== undefined) setIsPremium(response.isPremium);
    const next = response.attempt;
    const changed = next?.id !== attemptRef.current?.id;
    attemptRef.current = next;
    setAttempt(next);
    if (!next) return;
    if (changed || restore) {
      let restoredAnswers = next.questions.map((question) => ({ question, answer: next.answers.find((item) => item.question === question)?.answer ?? "" }));
      let restoredIndex = 0;
      savedSignatureRef.current = JSON.stringify(restoredAnswers);
      if (next.status === "in_progress") {
        try {
          const stored = localStorage.getItem(draftKey(next.id));
          const draft = stored ? JSON.parse(stored) as LocalDraft : null;
          if (draft && Array.isArray(draft.answers)) {
            restoredAnswers = next.questions.map((question, index) => ({ question,
              answer: typeof draft.answers[index]?.answer === "string" && draft.answers[index].question === question
                ? draft.answers[index].answer.slice(0, 6_000) : restoredAnswers[index].answer,
            }));
            restoredIndex = Number.isInteger(draft.questionIndex) ? Math.min(Math.max(0, draft.questionIndex), next.questions.length - 1) : 0;
          }
        } catch { /* Recover the saved account transcript if the local draft is unavailable. */ }
      }
      answersRef.current = restoredAnswers;
      questionIndexRef.current = restoredIndex;
      setAnswers(restoredAnswers);
      setQuestionIndex(restoredIndex);
      setSaved(savedSignatureRef.current === JSON.stringify(restoredAnswers));
      expirySubmittedRef.current = null;
      spokenQuestionRef.current = "";
    }
    if (next.status === "completed") {
      try { localStorage.removeItem(draftKey(next.id)); } catch { /* Optional browser storage. */ }
    }
  }, []);

  const showError = useCallback((failure: unknown) => {
    setError(failure instanceof Error ? failure.message : "Something went wrong. Please try again.");
    setErrorStatus(failure instanceof InterviewRequestError ? failure.status : 0);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const attemptId = new URLSearchParams(window.location.search).get("attempt");
    requestSession(`/api/interviews/session${attemptId ? `?attempt=${encodeURIComponent(attemptId)}` : ""}`, "GET", undefined, controller.signal)
      .then((response) => { if (!controller.signal.aborted) applyResponse(response, true); })
      .catch((failure) => { if (!controller.signal.aborted) showError(failure); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [applyResponse, showError]);

  useEffect(() => {
    if (!attempt) return;
    const timer = window.setInterval(() => setNow(Date.now() + clockOffsetRef.current), 1000);
    return () => window.clearInterval(timer);
  }, [attempt?.id, attempt]);

  const saveDraft = useCallback(async () => {
    if (savePromiseRef.current) await savePromiseRef.current;
    const current = attemptRef.current;
    if (!current || current.status !== "in_progress") return;
    const snapshot = answersRef.current;
    const signature = JSON.stringify(snapshot);
    if (signature === savedSignatureRef.current) return;
    const pending = requestSession("/api/interviews/session", "PATCH", {
      attemptId: current.id, answers: snapshot,
      metrics: getTranscriptHints(snapshot.map((answer) => answer.answer).join(" ")),
    }).then((response) => {
      savedSignatureRef.current = signature;
      if (attemptRef.current?.id === current.id) {
        applyResponse(response);
        setSaved(JSON.stringify(answersRef.current) === signature);
        setSaveWarning("");
      }
    });
    savePromiseRef.current = pending;
    try { await pending; }
    finally { if (savePromiseRef.current === pending) savePromiseRef.current = null; }
  }, [applyResponse]);

  useEffect(() => {
    if (attempt?.status !== "in_progress") return;
    const timer = window.setInterval(() => {
      if (submitLockRef.current || actionLockRef.current) return;
      void saveDraft().catch(() => setSaveWarning("Account autosave is temporarily unavailable. Keep this page open and retry saving; a browser draft is also kept where storage is available."));
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [attempt?.id, attempt?.status, saveDraft]);

  useEffect(() => {
    if (attempt?.status !== "in_progress") return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    const handleVisibility = () => {
      setNow(Date.now() + clockOffsetRef.current);
      if (document.hidden) {
        stopSpeaking();
        void stopListening().then(() => saveDraft()).catch(() => setSaveWarning("Your browser draft is kept. Retry account saving when you return to this tab."));
      }
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeLeaving);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [attempt?.status, saveDraft, stopListening, stopSpeaking]);

  const submit = useCallback(async () => {
    const current = attemptRef.current;
    if (!current || submitLockRef.current || actionLockRef.current) return;
    submitLockRef.current = true;
    setBusy("Saving answers and preparing feedback…");
    setError("");
    setErrorStatus(0);
    try {
      stopSpeaking();
      await stopListening();
      if (getTranscriptHints(answersRef.current.map((answer) => answer.answer).join(" ")).wordCount < 20) throw new Error("Feedback needs at least 20 words. Add more while the station is open, or start another station if time has ended.");
      try { await saveDraft(); }
      catch (saveError) {
        const deadlinePassed = Date.now() + clockOffsetRef.current >= Date.parse(current.startedAt) + (current.preparationSeconds + current.stationSeconds) * 1000;
        if (!(saveError instanceof InterviewRequestError) || saveError.status !== 409 || !deadlinePassed) throw saveError;
        const latest = await requestSession(`/api/interviews/session?attempt=${encodeURIComponent(current.id)}`);
        if (!latest.attempt) throw saveError;
        applyResponse(latest);
        answersRef.current = latest.attempt.answers;
        setAnswers(latest.attempt.answers);
        savedSignatureRef.current = JSON.stringify(latest.attempt.answers);
        setSaveWarning("The answer window had closed. Feedback uses the last answers saved to your account.");
      }
      const response = await requestSession("/api/interviews/feedback", "POST", { attemptId: current.id });
      applyResponse(response);
      if (response.attempt?.status === "grading") setError("Feedback is still being prepared. Use Check feedback in a moment.");
    } catch (failure) {
      showError(failure);
      // A timed-out response may still have completed, or the provider may have
      // marked the saved attempt as retryable. Reconcile once; never poll the AI.
      try {
        const latest = await requestSession(`/api/interviews/session?attempt=${encodeURIComponent(current.id)}`);
        applyResponse(latest);
        if (latest.attempt?.status === "completed") setError("");
      } catch { /* Keep the original error and transcript so the user can retry. */ }
    }
    finally { submitLockRef.current = false; setBusy(""); }
  }, [applyResponse, saveDraft, showError, stopListening, stopSpeaking]);

  const preparationEnd = attempt ? Date.parse(attempt.startedAt) + attempt.preparationSeconds * 1000 : 0;
  const stationEnd = preparationEnd + (attempt?.stationSeconds ?? 0) * 1000;
  const preparing = Boolean(attempt?.status === "in_progress" && now < preparationEnd);
  const expired = Boolean(attempt && now >= stationEnd);
  const active = attempt?.status === "in_progress" && !preparing && !expired && !busy;
  const secondsRemaining = Math.max(0, Math.ceil(((preparing ? preparationEnd : stationEnd) - now) / 1000));
  const breakRemaining = attempt?.nextAvailableAt ? Math.max(0, Math.ceil((Date.parse(attempt.nextAvailableAt) - now) / 1000)) : 0;
  const question = attempt?.questions[questionIndex] ?? "";

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || !expired || expirySubmittedRef.current === attempt.id || submitLockRef.current || actionLockRef.current) return;
    expirySubmittedRef.current = attempt.id;
    void submit();
  }, [attempt, expired, now, submit]);

  useEffect(() => {
    if (!attempt || !active || !readAloud || !voiceSupported || !question) return;
    const key = `${attempt.id}:${questionIndex}`;
    if (spokenQuestionRef.current === key) return;
    spokenQuestionRef.current = key;
    void speak(question);
  }, [attempt, active, question, questionIndex, readAloud, speak, voiceSupported]);

  const startAttempt = async (options: StartOptions) => {
    if (actionLockRef.current || submitLockRef.current) return;
    actionLockRef.current = true;
    setBusy("Opening your interview…");
    setError("");
    setErrorStatus(0);
    setSaveWarning("");
    try {
      await speech.stop();
      speech.stopSpeaking();
      applyResponse(await requestSession("/api/interviews/session", "POST", options), true);
    } catch (failure) { showError(failure); }
    finally { actionLockRef.current = false; setBusy(""); }
  };

  const moveQuestion = async (index: number) => {
    if (!active || actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      speech.stopSpeaking();
      await speech.stop();
      questionIndexRef.current = index;
      setQuestionIndex(index);
      persistLocal(answersRef.current, index);
      // The next answer and station deadline stay responsive while the previous
      // transcript is saved. saveDraft serialises writes before final grading.
      void saveDraft().catch(() => setSaveWarning("Your answer is kept in this browser. Account autosave will retry shortly."));
    } catch { setSaveWarning("Your answer is kept in this browser. Account autosave will retry shortly."); }
    finally { actionLockRef.current = false; }
  };

  const leaveAttempt = async () => {
    if (!attempt || actionLockRef.current || submitLockRef.current) return;
    actionLockRef.current = true;
    setBusy("Closing this station…");
    try {
      await speech.stop();
      speech.stopSpeaking();
      if (savePromiseRef.current) await savePromiseRef.current.catch(() => {});
      if (attempt.status === "in_progress") await requestSession("/api/interviews/session", "DELETE", { attemptId: attempt.id });
      try { localStorage.removeItem(draftKey(attempt.id)); } catch { /* Optional browser storage. */ }
      attemptRef.current = null;
      setAttempt(null);
      setError("");
      setErrorStatus(0);
      setSaveWarning("");
      setConfirmAbandon(false);
    } catch (failure) { showError(failure); }
    finally { actionLockRef.current = false; setBusy(""); }
  };

  const selectedUniversity = interviewUniversities.find((university) => university.slug === universitySlug);
  const hints = useMemo(() => getTranscriptHints(answers.map((answer) => answer.answer).join(" ")), [answers]);

  return (
    <div className="space-y-5">
      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <p>{error}</p>
        {errorStatus === 401 && <Link href="/phloemai/account" className="mt-2 inline-block font-bold underline">Sign in to save your practice and join the leaderboard</Link>}
        {errorStatus === 403 && <Link href="/phloemai/pricing" className="mt-2 inline-block font-bold underline">View membership options</Link>}
      </div>}
      {!configured && <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">AI feedback is temporarily unavailable. Timed practice and saved transcripts still work. You can return to request feedback when it is available.</p>}
      {loading ? <div className="flex items-center gap-3 rounded-xl border border-[#cfe0df] bg-white p-6 text-sm text-[#314956]"><Loader2 className="h-5 w-5 animate-spin" /> Loading your saved interview…</div> : !attempt ? <>
        <section className="rounded-2xl border-2 border-[#159a9d] bg-[#edf7f6] p-5 sm:p-7">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#08787b]"><span className="rounded-full bg-white px-3 py-1">Free station</span><Trophy className="h-4 w-4" /> Leaderboard challenge</div>
          <h2 className="mt-4 text-2xl font-bold text-[#071923]">Why medicine?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#314956]">Tell your story, reflect on your experience and explain why medicine is right for you. Practise with spoken questions or type your answers, then receive feedback.</p>
          <p className="mt-3 text-sm leading-6 text-[#314956]">Your best eligible score can appear on the free station leaderboard. Scores stop at 99%, with increasingly demanding improvement at the top.</p>
          <div className="mt-5 flex flex-wrap items-center gap-4"><button type="button" disabled={Boolean(busy)} onClick={() => void startAttempt({ mode: "free" })} className={buttonClass}>Start free Why medicine station <ArrowRight className="h-4 w-4" /></button><Link href="/phloemai/interviews/leaderboard" className="text-sm font-bold text-[#08787b] underline underline-offset-4">See leaderboard</Link></div>
        </section>
        <section className="rounded-xl border border-[#cfe0df] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-bold text-[#071923]">Practise for your university</h2>
          <p className="mt-2 text-sm leading-6 text-[#314956]">Choose any awarding body in the UK medical degree list. Practice questions are original; formats and timings are shown with their sources.</p>
          <label htmlFor="interview-university" className="mt-5 block text-sm font-bold text-[#314956]">University or medical school</label>
          <select id="interview-university" value={universitySlug} onChange={(event) => setUniversitySlug(event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-[#cfe0df] bg-white px-3 text-sm text-[#071923]">{interviewUniversities.map((university) => <option key={university.slug} value={university.slug}>{university.name}</option>)}</select>
          {selectedUniversity && <div className="mt-4 rounded-lg bg-[#f4f8f8] p-4 text-sm leading-6 text-[#314956]">
            <p className="font-bold text-[#071923]">{selectedUniversity.format} · {selectedUniversity.stationCount} {selectedUniversity.stationCount === 1 ? "station" : "stations"}</p>
            <p>{formatTime(selectedUniversity.stationSeconds)} per station · {formatTime(selectedUniversity.preparationSeconds)} preparation · {formatTime(selectedUniversity.breakSeconds)} between stations</p>
            <p className="mt-2">{selectedUniversity.timingNote}</p>
            <div className="mt-2 flex flex-wrap gap-4"><a href={selectedUniversity.sourceUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#08787b] underline">Format source</a><a href={selectedUniversity.officialUrl} target="_blank" rel="noreferrer" className="font-semibold text-[#08787b] underline">University website</a></div>
          </div>}
          <button type="button" disabled={Boolean(busy) || !selectedUniversity} onClick={() => void startAttempt({ mode: "university", universitySlug })} className={`${buttonClass} mt-5`}>Start university interview <ArrowRight className="h-4 w-4" /></button>
          {!isPremium && <p className="mt-3 text-sm text-[#4a6370]">University interviews and extra stations require <Link href="/phloemai/pricing" className="font-semibold text-[#08787b] underline">membership</Link>.</p>}
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[#cfe0df] bg-white p-5"><h2 className="text-base font-bold text-[#071923]">Five-station practice circuit</h2><p className="mt-2 text-sm leading-6 text-[#314956]">Motivation, work experience, disability and access to medicine, equality and inclusion, and Ozempic. Eight minutes per station with two-minute breaks.</p><button type="button" disabled={Boolean(busy)} onClick={() => void startAttempt({ mode: "reference" })} className={`${secondaryClass} mt-4`}>Start practice circuit</button></div>
          {initialStationSlug ? <div className="rounded-xl border border-[#cfe0df] bg-white p-5"><h2 className="text-base font-bold capitalize text-[#071923]">{initialStationSlug.replaceAll("-", " ")}</h2><p className="mt-2 text-sm leading-6 text-[#314956]">Focus on this topic in one timed interview station, with saved answers and individual feedback.</p><button type="button" disabled={Boolean(busy)} onClick={() => void startAttempt({ mode: initialStationSlug === "why-medicine" || initialStationSlug === "motivation-question" ? "free" : "station", stationSlug: initialStationSlug })} className={`${secondaryClass} mt-4`}>Practise this station</button></div> : <div className="rounded-xl border border-[#cfe0df] bg-white p-5"><h2 className="text-base font-bold text-[#071923]">A focused interview</h2><p className="mt-2 text-sm leading-6 text-[#314956]">Choose voice or text. Your camera is never requested. Feedback focuses on your answers; accent, eye contact, movement and disability are not scored.</p><Link href="/phloemai/interviews/question-bank" className="mt-4 inline-block text-sm font-bold text-[#08787b] underline">Explore the question bank</Link></div>}
        </section>
      </> : <>
        <section className="overflow-hidden rounded-xl border border-[#cfe0df] bg-white">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#dce8e7] bg-[#edf7f6] p-5">
            <div><p className="text-xs font-bold uppercase tracking-wide text-[#08787b]">{attempt.mode === "free" ? "Free leaderboard station" : `Station ${attempt.stationIndex + 1} of ${attempt.stationCount}`}</p><h2 className="mt-1 text-xl font-bold text-[#071923]">{attempt.title}</h2></div>
            {attempt.status === "in_progress" ? <div role="timer" aria-label={`${preparing ? "Preparation" : "Station"} time remaining`} className="flex items-center gap-3 rounded-lg bg-white px-4 py-3"><Clock3 className="h-5 w-5 text-[#08787b]" /><div><p className="text-xs font-semibold text-[#4a6370]">{preparing ? "Preparation" : expired ? "Time complete" : "Time remaining"}</p><p className="font-mono text-2xl font-bold tabular-nums text-[#071923]">{formatTime(secondsRemaining)}</p></div></div> : <span className="rounded-full bg-white px-3 py-2 text-sm font-bold text-[#08787b]">{attempt.status === "completed" ? "Station complete" : "Feedback pending"}</span>}
          </header>
          {attempt.status === "in_progress" && <div className="h-1.5 bg-[#dcebea]" aria-hidden="true"><div className="h-full bg-[#159a9d] transition-[width] duration-1000" style={{ width: `${Math.min(100, Math.max(0, 100 * (1 - secondsRemaining / Math.max(1, preparing ? attempt.preparationSeconds : attempt.stationSeconds))))}%` }} /></div>}
          {attempt.status !== "completed" && <div className="p-5 sm:p-6">
            {preparing && <p className="mb-5 rounded-lg bg-[#f4f8f8] p-3 text-sm leading-6 text-[#314956]">Read the first question and gather your thoughts. Answering opens when preparation ends. The timer continues if you refresh or leave this tab.</p>}
            <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-wide text-[#08787b]">Question {questionIndex + 1} of {attempt.questions.length}</p><label className="flex items-center gap-2 text-xs font-semibold text-[#314956]"><input type="checkbox" checked={readAloud} onChange={(event) => { setReadAloud(event.target.checked); if (!event.target.checked) speech.stopSpeaking(); }} className="accent-[#08787b]" /> Read questions aloud</label></div>
            <div className="mt-4 rounded-2xl border border-[#cfe0df] bg-gradient-to-br from-[#edf7f6] via-white to-[#f0f5fc] p-5 sm:p-6">
              <div className="flex items-center gap-4"><div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#9dc9c5] bg-[#dcefed] shadow-[0_0_0_7px_rgba(21,154,157,0.05)]"><div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#159a9d] to-[#065b5d] text-white ${speech.speaking ? "motion-safe:animate-pulse" : ""}`}><Sparkles className="h-6 w-6" aria-hidden="true" /></div></div><div><p className="text-sm font-bold text-[#071923]">Your interviewer</p><p className="mt-1 flex items-center gap-2 text-xs font-medium text-[#4a6370]"><span className={`h-1.5 w-1.5 rounded-full ${speech.listening ? "bg-red-500" : "bg-[#159a9d]"}`} />{speech.speaking ? "Reading your question" : speech.listening ? "Listening to your answer" : preparing ? "Your preparation time" : expired ? "Station time complete" : "Ready when you are"}</p></div></div>
              <h3 className="mt-5 text-lg font-semibold leading-8 text-[#071923]">{question}</h3>
              <button type="button" disabled={!speech.voiceSupported || Boolean(busy)} onClick={() => speech.speaking ? speech.stopSpeaking() : void speech.speak(question)} className={`${secondaryClass} mt-4`}>{speech.speaking ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}{speech.speaking ? "Stop reading" : "Read question"}</button>
            </div>
            <label htmlFor="interview-answer" className="mt-6 block text-sm font-bold text-[#314956]">Your answer</label>
            <textarea id="interview-answer" value={answers[questionIndex]?.answer ?? ""} readOnly={!active || speech.listening} maxLength={6000} onChange={(event) => replaceAnswers(answersRef.current.map((answer, index) => index === questionIndex ? { ...answer, answer: event.target.value } : answer))} placeholder={preparing ? "Your answer opens after preparation." : "Speak using the microphone, or type your answer here…"} className="mt-2 min-h-56 w-full resize-y rounded-lg border border-[#cfe0df] bg-[#fcfefe] p-4 text-sm leading-7 text-[#071923] outline-none focus:border-[#08787b] focus:ring-2 focus:ring-[#159a9d]/20 read-only:bg-[#f4f8f8]" />
            <p className="mt-1 text-right text-xs text-[#4a6370]">{answers[questionIndex]?.answer.length ?? 0} / 6,000 characters</p>
            {speech.interimTranscript && <p className="mt-2 text-sm italic leading-6 text-[#4a6370]">Hearing: {speech.interimTranscript}</p>}
            {speech.error && <p role="status" className="mt-3 text-sm leading-6 text-amber-800">{speech.error}</p>}
            {speech.supported ? <div className="mt-4 space-y-3"><label className="flex items-start gap-2 text-xs leading-5 text-[#4a6370]"><input type="checkbox" checked={microphoneConsent} disabled={speech.listening} onChange={(event) => setMicrophoneConsent(event.target.checked)} className="mt-1 accent-[#08787b]" /><span>Enable microphone transcription. Your browser&apos;s speech service may process audio; this platform saves the transcript, not an audio or video recording.</span></label><button type="button" disabled={!active || !microphoneConsent} onClick={() => speech.listening ? void speech.stop() : speech.start()} className={speech.listening ? `${secondaryClass} border-red-300 text-red-700` : secondaryClass}>{speech.listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}{speech.listening ? "Stop microphone" : "Start microphone"}</button><span className="ml-3 text-xs text-[#4a6370]">{speech.listening ? "Listening · stop the microphone to edit transcription errors" : "Typing is always available during the station"}</span></div> : <p className="mt-3 text-sm text-[#4a6370]">Speech recognition is unavailable in this browser. You can complete the same station by typing.</p>}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e4ecec] pt-4"><p role="status" className="text-xs text-[#4a6370]">{saved ? "Saved to your account" : "Account autosave every 15 seconds"}</p><div className="flex flex-wrap gap-2">{questionIndex > 0 && <button type="button" disabled={!active} onClick={() => void moveQuestion(questionIndex - 1)} className={secondaryClass}>Previous question</button>}{questionIndex < attempt.questions.length - 1 && <button type="button" disabled={!active} onClick={() => void moveQuestion(questionIndex + 1)} className={secondaryClass}>Next question <ArrowRight className="h-4 w-4" /></button>}</div></div>
            <div className="mt-5 flex flex-wrap items-center gap-3"><button type="button" disabled={Boolean(busy) || preparing || hints.wordCount < 20} onClick={() => void submit()} className={buttonClass}>{attempt.status === "grading" ? "Check feedback" : attempt.status === "failed" || expired ? "Retry feedback" : "Finish station and get feedback"}</button>{saveWarning && <button type="button" disabled={Boolean(busy)} onClick={() => void saveDraft().catch(showError)} className={secondaryClass}>Retry save</button>}{hints.wordCount < 20 && <span className="text-xs text-[#4a6370]">At least 20 words needed for feedback</span>}</div>
          </div>}
          {attempt.feedback && <div className="space-y-6 p-5 sm:p-6">
            <div className="flex flex-wrap items-center gap-5"><div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-[#159a9d] bg-[#edf7f6] text-3xl font-bold text-[#08787b]">{attempt.feedback.score}%</div><div className="max-w-2xl"><h3 className="flex items-center gap-2 text-lg font-bold text-[#071923]"><CheckCircle2 className="h-5 w-5 text-[#08787b]" /> Your feedback</h3><p className="mt-2 text-sm leading-6 text-[#314956]">{attempt.feedback.summary}</p></div></div>
            <div className="grid gap-5 sm:grid-cols-2"><div><h4 className="font-bold text-[#08787b]">What worked well</h4><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#314956]">{attempt.feedback.strengths.map((item, index) => <li key={index}>{item}</li>)}</ul></div><div><h4 className="font-bold text-[#08787b]">What to work on next</h4><ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[#314956]">{attempt.feedback.improvements.map((item, index) => <li key={index}>{item}</li>)}</ul></div></div>
            {attempt.feedback.rubric.length > 0 && <details className="rounded-lg border border-[#cfe0df] p-4"><summary className="cursor-pointer text-sm font-bold text-[#08787b]">See assessment detail</summary><div className="mt-4 space-y-4">{attempt.feedback.rubric.map((item) => <div key={item.criterion}><p className="text-sm font-bold text-[#071923]">{item.criterion} · {item.score}</p><p className="mt-1 text-sm leading-6 text-[#314956]">{item.reason}</p></div>)}</div></details>}
            <div className="flex flex-wrap gap-4"><Link href={`/phloemai/interviews/reports/${attempt.id}`} className="text-sm font-bold text-[#08787b] underline">View saved report</Link>{attempt.mode === "free" && <Link href="/phloemai/interviews/leaderboard" className="text-sm font-bold text-[#08787b] underline">View free station leaderboard</Link>}</div>
          </div>}
        </section>
        {saveWarning && <p role="status" className="rounded-lg bg-amber-50 p-4 text-sm leading-6 text-amber-900">{saveWarning}</p>}
        <details className="rounded-xl border border-[#cfe0df] bg-white p-5"><summary className="cursor-pointer text-sm font-bold text-[#08787b]">Transcript practice hints</summary><p className="mt-3 text-sm leading-6 text-[#314956]">{hints.wordCount} words · {hints.fillerCount} possible fillers · {hints.repetitionCount} adjacent repeated words.</p><p className="mt-2 text-xs leading-5 text-[#4a6370]">These are optional text observations, not a measure of fluency or a stuttering assessment. Speech recognition can omit or introduce repetitions. These counts do not reduce your score. No camera, eye-contact or movement analysis is used.</p></details>
        {attempt.status === "completed" && attempt.stationIndex + 1 < attempt.stationCount && <section className="rounded-xl border border-[#cfe0df] bg-[#edf7f6] p-5"><h3 className="text-base font-bold text-[#071923]">{breakRemaining > 0 ? `Break · ${formatTime(breakRemaining)} remaining` : "Ready for the next station"}</h3><p className="mt-2 text-sm text-[#314956]">Station {attempt.stationIndex + 2} of {attempt.stationCount}. Take a breath and continue when the break ends.</p><button type="button" disabled={breakRemaining > 0 || Boolean(busy)} onClick={() => void startAttempt({ mode: attempt.mode, universitySlug: attempt.universitySlug ?? undefined, circuitId: attempt.circuitId, stationIndex: attempt.stationIndex + 1 })} className={`${buttonClass} mt-4`}>Continue to next station <ArrowRight className="h-4 w-4" /></button></section>}
        {attempt.status === "completed" ? <button type="button" disabled={Boolean(busy)} onClick={() => void leaveAttempt()} className={secondaryClass}><RotateCcw className="h-4 w-4" /> Choose another interview</button> : confirmAbandon ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-sm leading-6 text-amber-950">End this station without feedback? It will still count towards your practice allowance.</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={Boolean(busy)} onClick={() => void leaveAttempt()} className={secondaryClass}>End station</button><button type="button" disabled={Boolean(busy)} onClick={() => setConfirmAbandon(false)} className={secondaryClass}>Keep practising</button></div></div> : <button type="button" disabled={Boolean(busy)} onClick={() => setConfirmAbandon(true)} className="min-h-11 text-sm font-semibold text-[#4a6370] underline">End this station</button>}
      </>}
      {busy && <div role="status" className="flex items-center gap-3 rounded-lg bg-[#edf7f6] p-4 text-sm font-semibold text-[#08787b]"><Loader2 className="h-4 w-4 animate-spin" />{busy}</div>}
    </div>
  );
}

export default AIInterviewRunner;
