"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { findInterviewStation, interviewStations } from "../_data/interview-stations";
import { previewInterviewFeedback } from "../_data/interview-preview";
import type { InterviewAnswer, InterviewAttempt, InterviewMode } from "../_lib/interview-types";
import { getTranscriptHints, useInterviewSpeech } from "../_lib/useInterviewSpeech";
import { useInterviewDevices } from "../_lib/useInterviewDevices";
import { AIInterviewSetup, type InterviewRoomPlan } from "./AIInterviewSetup";
import { AIInterviewCall } from "./AIInterviewCall";
import { AIInterviewFeedback } from "./AIInterviewFeedback";
import styles from "./AIInterviewRoom.module.css";

type SessionResponse = { attempt: InterviewAttempt | null; serverNow?: string; configured?: boolean; isPremium?: boolean };
type StartOptions = { mode: InterviewMode; universitySlug?: string; stationSlug?: string; circuitId?: string; stationIndex?: number; stationCount?: number };
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
const planKey = (id: string) => `phloem-interview-plan:${id}`;

export function AIInterviewRunner({ initialUniversitySlug, initialStationSlug }: { initialUniversitySlug?: string; initialStationSlug?: string }) {
  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
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
  const [voiceRate, setVoiceRate] = useState(0.95);
  const [preview, setPreview] = useState(false);
  const [roomPlan, setRoomPlan] = useState<InterviewRoomPlan | null>(null);
  const [continuationSlug, setContinuationSlug] = useState("");
  const previewRef = useRef(false);
  const planRef = useRef<InterviewRoomPlan | null>(null);
  const devices = useInterviewDevices();
  const { stopCamera, stopMicCheck } = devices;
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
    if (!current || previewRef.current) return;
    try { localStorage.setItem(draftKey(current.id), JSON.stringify({ answers: nextAnswers, questionIndex: index })); }
    catch { /* Account autosave remains available when browser storage is disabled. */ }
  }, []);

  const replaceAnswers = useCallback((nextAnswers: InterviewAnswer[]) => {
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    setSaved(false);
    persistLocal(nextAnswers);
  }, [persistLocal]);

  const speech = useInterviewSpeech({ rate: voiceRate, onTranscript: (text) => {
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
          const stored = previewRef.current ? null : localStorage.getItem(draftKey(next.id));
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
      if (!previewRef.current && !planRef.current) {
        try {
          const raw = localStorage.getItem(planKey(next.circuitId));
          const plan = raw ? JSON.parse(raw) as InterviewRoomPlan : null;
          if (plan && Array.isArray(plan.stationSlugs) && plan.stationSlugs.length === next.stationCount && plan.stationSlugs.every((slug) => typeof slug === "string" && findInterviewStation(slug))) {
            planRef.current = plan;
            setRoomPlan(plan);
          }
        } catch { /* A circuit can continue with its default topics if browser storage is unavailable. */ }
      }
      expirySubmittedRef.current = null;
      spokenQuestionRef.current = "";
    }
    if (next.status === "completed" && !previewRef.current) {
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
      .catch((failure) => { if (!controller.signal.aborted && !(failure instanceof InterviewRequestError && failure.status === 401)) showError(failure); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [applyResponse, showError]);

  const clockDeadline = attempt?.status === "in_progress"
    ? Date.parse(attempt.startedAt) + (attempt.preparationSeconds + attempt.stationSeconds) * 1000
    : attempt?.nextAvailableAt ? Date.parse(attempt.nextAvailableAt) : 0;
  useEffect(() => {
    if (clockDeadline <= Date.now() + clockOffsetRef.current) return;
    const timer = window.setInterval(() => {
      const currentTime = Date.now() + clockOffsetRef.current;
      setNow(currentTime);
      if (currentTime >= clockDeadline) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [clockDeadline]);

  const saveDraft = useCallback(async () => {
    // Every waiter must recheck the lock: several events can queue behind the
    // same request. A failed earlier save must not prevent saving the latest text.
    while (savePromiseRef.current) await savePromiseRef.current.catch(() => {});
    const current = attemptRef.current;
    if (!current || current.status !== "in_progress" || previewRef.current) return;
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
    if (attempt?.status !== "in_progress" || preview) return;
    const timer = window.setInterval(() => {
      if (submitLockRef.current || actionLockRef.current) return;
      void saveDraft().catch(() => setSaveWarning("Account autosave is temporarily unavailable. Keep this page open and retry saving; a browser draft is also kept where storage is available."));
    }, 15_000);
    return () => window.clearInterval(timer);
  }, [attempt?.id, attempt?.status, saveDraft, preview]);

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
      stopCamera();
      stopMicCheck();
      if (previewRef.current) {
        applyResponse({ attempt: { ...current, status: "completed", completedAt: new Date().toISOString(), answers: answersRef.current, feedback: previewInterviewFeedback, nextAvailableAt: null } });
        return;
      }
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
  }, [applyResponse, saveDraft, showError, stopListening, stopSpeaking, stopCamera, stopMicCheck]);

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

  const startAttempt = async (options: StartOptions, asPreview = previewRef.current, plan = planRef.current) => {
    if (actionLockRef.current || submitLockRef.current) return;
    actionLockRef.current = true;
    setBusy("Opening your interview…");
    setError("");
    setErrorStatus(0);
    setSaveWarning("");
    try {
      await speech.stop();
      speech.stopSpeaking();
      stopMicCheck();
      previewRef.current = asPreview;
      setPreview(asPreview);
      if (asPreview && plan) {
        clockOffsetRef.current = 0;
        const station = findInterviewStation(options.stationSlug ?? plan.stationSlugs[0])!;
        applyResponse({ attempt: {
          id: `preview-${crypto.randomUUID()}`, mode: plan.mode, universitySlug: plan.universitySlug ?? null,
          stationSlug: station.slug, title: station.title, status: "in_progress", startedAt: new Date().toISOString(), completedAt: null,
          preparationSeconds: plan.preparationSeconds, stationSeconds: plan.stationSeconds, breakSeconds: 0,
          stationIndex: options.stationIndex ?? 0, stationCount: plan.stationSlugs.length,
          questions: [...station.questions], answers: [], feedback: null, metrics: {}, nextAvailableAt: null,
          circuitId: options.circuitId ?? `preview-${crypto.randomUUID()}`,
        } }, true);
      } else {
        const response = await requestSession("/api/interviews/session", "POST", options);
        const resumed = response.attempt;
        const matchesPlan = resumed && plan && resumed.circuitId === options.circuitId && resumed.stationSlug === options.stationSlug && resumed.stationCount === plan.stationSlugs.length && resumed.mode === plan.mode && resumed.universitySlug === (plan.universitySlug ?? null);
        if (resumed && matchesPlan) {
          try { localStorage.setItem(planKey(resumed.circuitId), JSON.stringify(plan)); }
          catch { setSaveWarning("Your station selection is kept for this visit. Browser storage is unavailable, so return to setup if you reload before the next station."); }
        } else if (resumed && plan) {
          planRef.current = null;
          setRoomPlan(null);
          setSaveWarning("You already had an active interview, so we’ve resumed it with its saved settings.");
        }
        applyResponse(response, true);
      }
    } catch (failure) { showError(failure); }
    finally { actionLockRef.current = false; setBusy(""); }
  };

  const moveQuestion = async (index: number) => {
    if (!active || actionLockRef.current || !attempt || index < 0 || index >= attempt.questions.length) return;
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
      stopCamera();
      stopMicCheck();
      if (attempt.status === "in_progress" && !previewRef.current) await requestSession("/api/interviews/session", "DELETE", { attemptId: attempt.id });
      if (!previewRef.current) {
        try { localStorage.removeItem(draftKey(attempt.id)); localStorage.removeItem(planKey(attempt.circuitId)); } catch { /* Optional browser storage. */ }
      }
      attemptRef.current = null;
      setAttempt(null);
      setError("");
      setErrorStatus(0);
      setSaveWarning("");
      previewRef.current = false;
      setPreview(false);
      planRef.current = null;
    } catch (failure) { showError(failure); }
    finally { actionLockRef.current = false; setBusy(""); }
  };

  const hints = useMemo(() => getTranscriptHints(answers.map((answer) => answer.answer).join(" ")), [answers]);
  const setVoiceEnabled = (enabled: boolean) => {
    setReadAloud(enabled);
    if (!enabled) speech.stopSpeaking();
    else spokenQuestionRef.current = "";
  };
  const beginRoom = (plan: InterviewRoomPlan, asPreview: boolean) => {
    if (actionLockRef.current || submitLockRef.current) return;
    planRef.current = plan;
    setRoomPlan(plan);
    void startAttempt({ mode: plan.mode, universitySlug: plan.universitySlug, stationSlug: plan.stationSlugs[0], stationCount: plan.stationSlugs.length, circuitId: crypto.randomUUID() }, asPreview, plan);
  };
  const nextStation = () => {
    if (!attempt) return;
    const stationSlug = roomPlan?.stationSlugs[attempt.stationIndex + 1] ?? (continuationSlug || interviewStations[(attempt.stationIndex + 1) % interviewStations.length].slug);
    void startAttempt({ mode: attempt.mode, universitySlug: attempt.universitySlug ?? undefined, circuitId: attempt.circuitId, stationIndex: attempt.stationIndex + 1, stationSlug, stationCount: roomPlan?.stationSlugs.length });
    setContinuationSlug("");
  };
  const step = !attempt ? 0 : attempt.status === "completed" ? 2 : 1;

  return <div className={styles.experience}>
    <nav aria-label="Interview steps" className={styles.steps}>
      <span data-active={step === 0} aria-current={step === 0 ? "step" : undefined}><span>01</span> Make it yours</span><i aria-hidden="true" />
      <span data-active={step === 1} aria-current={step === 1 ? "step" : undefined}><span>02</span> Your interview</span><i aria-hidden="true" />
      <span data-active={step === 2} aria-current={step === 2 ? "step" : undefined}><span>03</span> Reflect & grow</span>
    </nav>
    {error && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <p>{error}</p>
      {errorStatus === 401 && <Link href="/phloemai/account" className="mt-2 inline-block font-bold underline">Sign in to start your scored interview</Link>}
      {errorStatus === 403 && <Link href="/phloemai/pricing" className="mt-2 inline-block font-bold underline">View membership options</Link>}
    </div>}
    {!configured && !preview && <p role="status" className={styles.previewBanner}>AI feedback is temporarily unavailable. Saved transcripts and timed practice still work; return later to request feedback.</p>}
    {loading ? <div className={styles.statusCard}><Loader2 size={19} className="animate-spin" /> Getting your interview space ready…</div> : !attempt ? <AIInterviewSetup
      initialUniversitySlug={initialUniversitySlug} initialStationSlug={initialStationSlug} initialPlan={roomPlan}
      devices={devices} readAloud={readAloud} setReadAloud={setVoiceEnabled} voiceRate={voiceRate} setVoiceRate={setVoiceRate}
      voiceSupported={speech.voiceSupported} speaking={speech.speaking} onStopVoice={speech.stopSpeaking} onTestVoice={() => { devices.stopMicCheck(); if (speech.speaking) speech.stopSpeaking(); else void speech.speak("Welcome to your Phloem interview. Take a breath, and tell me a little about what brought you to medicine."); }}
      microphoneConsent={microphoneConsent} setMicrophoneConsent={setMicrophoneConsent} speechSupported={speech.supported}
      isPremium={isPremium} busy={Boolean(busy)} onStart={beginRoom}
    /> : attempt.status === "completed" && attempt.feedback ? <AIInterviewFeedback key={attempt.id}
      attempt={attempt} preview={preview} onRetry={() => void leaveAttempt()}
      onNext={attempt.stationIndex + 1 < attempt.stationCount && roomPlan ? nextStation : undefined}
      breakRemaining={breakRemaining} busy={Boolean(busy)}
    /> : <>
      {preview && <div className={styles.previewBanner}><Sparkles size={16} /><span><strong>You’re in preview.</strong> Explore the room and sample feedback. This won’t use an attempt or save anything to your account.</span></div>}
      <AIInterviewCall key={attempt.id} attempt={attempt} answers={answers} questionIndex={questionIndex}
        preparing={preparing} expired={expired} active={Boolean(active)} secondsRemaining={secondsRemaining}
        speech={speech} devices={devices} saved={saved} busy={busy} preview={preview} readAloud={readAloud}
        microphoneConsent={microphoneConsent} setMicrophoneConsent={setMicrophoneConsent} setReadAloud={setVoiceEnabled}
        onAnswer={(value) => replaceAnswers(answersRef.current.map((answer, index) => index === questionIndex ? { ...answer, answer: value } : answer))}
        onQuestion={(index) => void moveQuestion(index)} onSubmit={() => void submit()} onLeave={() => void leaveAttempt()} wordCount={hints.wordCount}
        onSkipPreparation={() => { if (preview) applyResponse({ attempt: { ...attempt, startedAt: new Date(Date.now() - attempt.preparationSeconds * 1000).toISOString() } }); }}
      />
      {(attempt.status === "grading" || attempt.status === "failed" || expired) && <div className={styles.statusCard}>
        <div><strong>{attempt.status === "grading" ? "Your feedback is being prepared." : "Your station has ended."}</strong><p>{hints.wordCount < 20 ? "There wasn’t enough answer text to mark this station. You can return to setup and try again." : "Your transcript is kept. Check or retry your feedback when you’re ready."}</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" disabled={Boolean(busy) || hints.wordCount < 20} className={styles.primaryButton} onClick={() => void submit()}>{attempt.status === "grading" ? "Check feedback" : "Retry feedback"}<ArrowRight size={15} /></button><button type="button" className={styles.secondaryButton} disabled={Boolean(busy)} onClick={() => void leaveAttempt()}>Back to setup</button></div></div>
      </div>}
    </>}
    {attempt?.status === "completed" && attempt.stationIndex + 1 < attempt.stationCount && !roomPlan && <section className={styles.joinBar}><div><strong>Continue your circuit</strong><p>Your remaining topic choices aren’t available on this device. Choose a topic for your next station.</p><label className={styles.universityChoice}>Next station<select aria-label="Next station topic" value={continuationSlug || interviewStations[(attempt.stationIndex + 1) % interviewStations.length].slug} onChange={(event) => setContinuationSlug(event.target.value)}>{interviewStations.map((station) => <option key={station.slug} value={station.slug}>{station.title}</option>)}</select></label></div><button type="button" className={styles.primaryButton} disabled={Boolean(busy) || breakRemaining > 0} onClick={nextStation}>{breakRemaining > 0 ? "Your break is still running" : "Continue to next station"}<ArrowRight size={16} /></button></section>}
    {saveWarning && <div role="status" className={styles.previewBanner}><span>{saveWarning}</span>{attempt?.status === "in_progress" && <button type="button" disabled={Boolean(busy)} onClick={() => void saveDraft().catch(showError)}>Retry save</button>}</div>}
    {busy && <div role="status" className={styles.statusCard}><Loader2 size={18} className="animate-spin" />{busy}</div>}
    {!attempt && speech.error && <p role="status" className={styles.deviceError}>{speech.error}</p>}
  </div>;
}

export default AIInterviewRunner;
