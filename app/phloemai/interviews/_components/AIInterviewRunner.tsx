"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { findInterviewStation, interviewStations } from "../_data/interview-stations";
import { previewInterviewFeedback } from "../_data/interview-preview";
import type { InterviewAnswer, InterviewAttempt, InterviewMode } from "../_lib/interview-types";
import { getTranscriptHints, useInterviewSpeech } from "../_lib/useInterviewSpeech";
import { ANSWER_SILENCE_MS, DONE_PROMPT, followUpsEnabled, parseDoneReply, questionTransition } from "../_lib/station-flow";
import { useInterviewDevices } from "../_lib/useInterviewDevices";
import { AIInterviewSetup, type InterviewRoomPlan } from "./AIInterviewSetup";
import { AIInterviewCall } from "./AIInterviewCall";
import { AIInterviewReview } from "./AIInterviewReview";
import styles from "./AIInterviewRoom.module.css";

type SessionResponse = { attempt: InterviewAttempt | null; serverNow?: string; configured?: boolean; isPremium?: boolean; usedSavedAnswers?: boolean; followUp?: string; questionIndex?: number; source?: "ai" | "practice" | "saved" };
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

export function AIInterviewRunner({ initialUniversitySlug, initialStationSlug, initialMockCircuit = false }: { initialUniversitySlug?: string; initialStationSlug?: string; initialMockCircuit?: boolean }) {
  const [attempt, setAttempt] = useState<InterviewAttempt | null>(null);
  const [answers, setAnswers] = useState<InterviewAnswer[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [errorStatus, setErrorStatus] = useState(0);
  const [saveWarning, setSaveWarning] = useState("");
  const [saved, setSaved] = useState(false);
  const [followUpBusy, setFollowUpBusy] = useState(false);
  const [followUpNotice, setFollowUpNotice] = useState("");
  const [awaitingDone, setAwaitingDone] = useState(false);
  const [micWanted, setMicWanted] = useState(false);
  const [entryReady, setEntryReady] = useState("");
  const [prompting, setPrompting] = useState(false);
  const awaitingDoneRef = useRef(false);
  const promptingRef = useRef(false);
  const completionLockRef = useRef(false);
  const confirmationPendingRef = useRef(false);
  const onSilenceRef = useRef<() => void>(() => {});
  const completeAnswerRef = useRef<() => void>(() => {});
  const [configured, setConfigured] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [now, setNow] = useState(0);
  const [readAloud, setReadAloud] = useState(true);
  const [voiceRate, setVoiceRate] = useState(0.95);
  const [preview, setPreview] = useState(false);
  const [roomPlan, setRoomPlan] = useState<InterviewRoomPlan | null>(null);
  const [continuationSlug, setContinuationSlug] = useState("");
  const [reviewRequested, setReviewRequested] = useState(false);
  const previewRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  const planRef = useRef<InterviewRoomPlan | null>(null);
  const devices = useInterviewDevices();
  const { stopCamera, stopMicCheck, requestMicrophone, cancelMicrophoneRequest } = devices;
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
  const followUpRequestRef = useRef<AbortController | null>(null);

  useEffect(() => () => followUpRequestRef.current?.abort(), []);

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

  const speech = useInterviewSpeech({ rate: voiceRate, answerKey: `${attempt?.id ?? "preview"}:${questionIndex}`, silenceMs: ANSWER_SILENCE_MS, onSilence: () => onSilenceRef.current(), onTranscript: (text) => {
    const current = attemptRef.current;
    if (!current || current.status !== "in_progress" || completionLockRef.current) return;
    if (awaitingDoneRef.current) {
      const reply = parseDoneReply(text);
      awaitingDoneRef.current = false;
      setAwaitingDone(false);
      if (reply.done) { completeAnswerRef.current(); return; }
      text = reply.continuation;
      if (!text) return;
    }
    const index = questionIndexRef.current;
    replaceAnswers(answersRef.current.map((answer, answerIndex) => answerIndex === index
      ? { ...answer, answer: `${answer.answer}${answer.answer ? " " : ""}${text}`.slice(0, 6_000) }
      : answer));
  } });
  const { start: startListening, stop: stopListening, stopSpeaking, speak, voiceSupported } = speech;

  const applyResponse = useCallback((response: SessionResponse, restore = false) => {
    if (response.serverNow) clockOffsetRef.current = Date.parse(response.serverNow) - Date.now();
    setNow(Date.now() + clockOffsetRef.current);
    if (response.configured !== undefined) setConfigured(response.configured);
    if (response.isPremium !== undefined) setIsPremium(response.isPremium);
    const next = response.attempt;
    const previous = attemptRef.current;
    const changed = next?.id !== previous?.id;
    const questionsChanged = Boolean(next && !changed && JSON.stringify(next.questions) !== JSON.stringify(previous?.questions));
    attemptRef.current = next;
    setAttempt(next);
    if (!next) return;
    if (!previewRef.current) window.history?.replaceState(null, "", `/phloemai/interviews/ai-interviews?attempt=${next.id}`);
    if (questionsChanged && !restore) {
      // Match by question text: inserting a probe must never shift a candidate's
      // answer onto a different question, including an unsaved typed answer.
      const currentQuestion = previous?.questions[questionIndexRef.current];
      const merged = next.questions.map((question) => ({ question,
        answer: answersRef.current.find((item) => item.question === question)?.answer
          ?? next.answers.find((item) => item.question === question)?.answer ?? "",
      }));
      const index = Math.max(0, next.questions.indexOf(currentQuestion ?? ""));
      answersRef.current = merged;
      questionIndexRef.current = index;
      setAnswers(merged);
      setQuestionIndex(index);
      setSaved(false);
      if (!previewRef.current) {
        try { localStorage.setItem(draftKey(next.id), JSON.stringify({ answers: merged, questionIndex: index })); }
        catch { /* Account autosave remains available. */ }
      }
    }
    if (changed || restore) {
      let restoredAnswers = next.questions.map((question) => ({ question, answer: next.answers.find((item) => item.question === question)?.answer ?? "" }));
      let restoredIndex = 0;
      savedSignatureRef.current = JSON.stringify(restoredAnswers);
      if (next.status === "in_progress") {
        try {
          const stored = previewRef.current ? null : localStorage.getItem(draftKey(next.id));
          const draft = stored ? JSON.parse(stored) as LocalDraft : null;
          if (draft && Array.isArray(draft.answers)) {
            restoredAnswers = next.questions.map((question, index) => {
              const localAnswer = draft.answers.find((item) => item?.question === question);
              return { question, answer: typeof localAnswer?.answer === "string"
                ? localAnswer.answer.slice(0, 6_000) : restoredAnswers[index].answer };
            });
            const localQuestion = Number.isInteger(draft.questionIndex) ? draft.answers[draft.questionIndex]?.question : undefined;
            restoredIndex = Math.max(0, next.questions.indexOf(localQuestion ?? ""));
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
      awaitingDoneRef.current = false;
      setAwaitingDone(false);
      promptingRef.current = false;
      setPrompting(false);
      setFollowUpNotice("");
    }
    if (next.status !== "in_progress" && !previewRef.current) {
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
      if (submitLockRef.current || actionLockRef.current || followUpRequestRef.current) return;
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
        setMicWanted(false);
        promptingRef.current = false;
        setPrompting(false);
        cancelMicrophoneRequest();
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
  }, [attempt?.status, saveDraft, stopListening, stopSpeaking, cancelMicrophoneRequest]);

  const finishStation = useCallback(async () => {
    const current = attemptRef.current;
    if (!current || submitLockRef.current || actionLockRef.current) return;
    submitLockRef.current = true;
    setMicWanted(false);
    followUpRequestRef.current?.abort();
    setBusy("Saving your station…");
    setReviewRequested(true);
    setError("");
    setErrorStatus(0);
    try {
      cancelMicrophoneRequest();
      stopSpeaking();
      await stopListening();
      stopCamera();
      stopMicCheck();
      if (previewRef.current) {
        applyResponse({ attempt: { ...current, status: "submitted", completedAt: new Date().toISOString(), answers: answersRef.current, feedback: null, nextAvailableAt: null } });
        return;
      }
      while (savePromiseRef.current) await savePromiseRef.current.catch(() => {});
      const response = await requestSession("/api/interviews/session", "PATCH", {
        attemptId: current.id, answers: answersRef.current, finish: true,
        metrics: getTranscriptHints(answersRef.current.map((answer) => answer.answer).join(" ")),
      });
      applyResponse(response, true);
      setSaveWarning(response.usedSavedAnswers ? "The answer window had closed. This review shows the last answers saved to your account." : "");
    } catch (failure) {
      showError(failure);
      // A timed-out finish may still have saved. Keep the browser draft unless
      // the server confirms that the attempt is locked and ready to review.
      try {
        const latest = await requestSession(`/api/interviews/session?attempt=${encodeURIComponent(current.id)}`);
        if (latest.attempt && latest.attempt.status !== "in_progress") {
          applyResponse(latest, true);
          setError("");
        }
      } catch { /* Keep the local transcript available so the user can retry saving. */ }
    } finally { submitLockRef.current = false; setBusy(""); }
  }, [applyResponse, showError, stopListening, stopSpeaking, stopCamera, stopMicCheck, cancelMicrophoneRequest]);

  const generateFeedback = async () => {
    const current = attemptRef.current;
    if (!current || current.status === "in_progress" || actionLockRef.current || submitLockRef.current) return;
    submitLockRef.current = true;
    setBusy("Preparing your feedback…");
    setError("");
    setErrorStatus(0);
    try {
      if (previewRef.current) {
        applyResponse({ attempt: { ...current, status: "completed", feedback: previewInterviewFeedback } });
        return;
      }
      applyResponse(await requestSession("/api/interviews/feedback", "POST", { attemptId: current.id }));
    } catch (failure) {
      showError(failure);
      try {
        const latest = await requestSession(`/api/interviews/session?attempt=${encodeURIComponent(current.id)}`);
        applyResponse(latest);
        if (latest.attempt?.feedback) setError("");
      } catch { /* The review stays available if feedback cannot be loaded. */ }
    } finally { submitLockRef.current = false; setBusy(""); }
  };

  const preparationEnd = attempt ? Date.parse(attempt.startedAt) + attempt.preparationSeconds * 1000 : 0;
  const stationEnd = preparationEnd + (attempt?.stationSeconds ?? 0) * 1000;
  const preparing = Boolean(attempt?.status === "in_progress" && now < preparationEnd);
  const expired = Boolean(attempt && now >= stationEnd);
  const reviewing = Boolean(attempt && (reviewRequested || attempt.status !== "in_progress" || expired));
  const active = attempt?.status === "in_progress" && !reviewing && !preparing && !expired && !busy && !followUpBusy;
  const secondsRemaining = Math.max(0, Math.ceil(((preparing ? preparationEnd : stationEnd) - now) / 1000));
  const breakRemaining = attempt?.nextAvailableAt ? Math.max(0, Math.ceil((Date.parse(attempt.nextAvailableAt) - now) / 1000)) : 0;
  const question = attempt?.questions[questionIndex] ?? "";
  const originalQuestions: readonly string[] = useMemo(() => attempt
    ? attempt.questionIds?.some(Boolean)
      ? attempt.questions.filter((_, index) => Boolean(attempt.questionIds?.[index]))
      : findInterviewStation(attempt.stationSlug)?.questions ?? []
    : [], [attempt]);
  const followingQuestion = attempt?.questions[questionIndex + 1];
  const followUpAvailable = !preview && Boolean(attempt && followUpsEnabled(attempt.stationSlug)) && originalQuestions.includes(question)
    && (!followingQuestion || originalQuestions.includes(followingQuestion));
  const microphoneRoomId = !loading && attempt?.status === "in_progress" && !reviewing ? attempt.id : null;

  useEffect(() => {
    if (!microphoneRoomId) return;
    let cancelled = false;
    const permission = devices.microphonePermission === "granted" ? Promise.resolve(true) : requestMicrophone();
    void permission.then((permitted) => {
      if (cancelled || document.hidden || attemptRef.current?.id !== microphoneRoomId) return;
      setEntryReady(microphoneRoomId);
      setMicWanted(permitted);
    });
    return () => { cancelled = true; cancelMicrophoneRequest(); };
    // Permission changes belong to this single entry request, not a new prompt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [microphoneRoomId, requestMicrophone, cancelMicrophoneRequest]);

  const toggleMicrophone = async () => {
    if (!active || actionLockRef.current || submitLockRef.current || !speech.supported) return;
    if ((micWanted && !speech.error) || speech.listening) { setMicWanted(false); await stopListening(); return; }
    const current = attemptRef.current;
    const index = questionIndexRef.current;
    if (!current) return;
    const permitted = devices.microphonePermission === "granted" || await requestMicrophone();
    const deadline = Date.parse(current.startedAt) + (current.preparationSeconds + current.stationSeconds) * 1000;
    if (!permitted || attemptRef.current?.id !== current.id || attemptRef.current.status !== "in_progress"
      || questionIndexRef.current !== index || actionLockRef.current || submitLockRef.current || document.hidden
      || Date.now() + clockOffsetRef.current >= deadline) return;
    setMicWanted(true);
    if (!promptingRef.current && !speech.speaking && !confirmationPendingRef.current) speech.start();
  };

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || !expired || expirySubmittedRef.current === attempt.id || submitLockRef.current || actionLockRef.current) return;
    expirySubmittedRef.current = attempt.id;
    void finishStation();
  }, [attempt, expired, now, finishStation]);

  useEffect(() => {
    if (!attempt || !active || entryReady !== attempt.id || !question) return;
    const key = `${attempt.id}:${questionIndex}`;
    if (spokenQuestionRef.current === key) return;
    spokenQuestionRef.current = key;
    if (!readAloud || !voiceSupported) return;
    promptingRef.current = true;
    const transition = questionTransition(questionIndex, !originalQuestions.includes(question));
    void speak([transition, question].filter(Boolean).join(" "), () => {
      if (spokenQuestionRef.current !== key) return;
      promptingRef.current = false;
      setPrompting(false);
    });
  }, [attempt, active, entryReady, question, questionIndex, readAloud, speak, voiceSupported, originalQuestions]);

  useEffect(() => {
    if (!active || !micWanted || promptingRef.current || confirmationPendingRef.current || speech.speaking || speech.listening || (speech.error && !speech.error.startsWith("Read-aloud")) || document.hidden
      || actionLockRef.current || submitLockRef.current || completionLockRef.current || spokenQuestionRef.current !== `${attempt?.id}:${questionIndex}`) return;
    startListening();
  }, [active, micWanted, prompting, speech.speaking, speech.listening, speech.error, startListening, questionIndex, attempt?.id, awaitingDone]);

  const startAttempt = async (options: StartOptions, asPreview = previewRef.current, plan = planRef.current) => {
    if (actionLockRef.current || submitLockRef.current) return;
    actionLockRef.current = true;
    setBusy("Opening your interview…");
    setError("");
    setErrorStatus(0);
    setSaveWarning("");
    try {
      cancelMicrophoneRequest();
      stopMicCheck();
      // Invoke getUserMedia during the Start button gesture, before any await.
      // This also avoids consuming a fresh station's time in a permission prompt.
      const microphone = requestMicrophone();
      speech.stopSpeaking();
      await speech.stop();
      await microphone;
      if (!mountedRef.current || document.hidden) return;
      previewRef.current = asPreview;
      setPreview(asPreview);
      if (asPreview && plan) {
        planRef.current = plan;
        setRoomPlan(plan);
        clockOffsetRef.current = 0;
        const station = findInterviewStation(options.stationSlug ?? plan.stationSlugs[0])!;
        applyResponse({ attempt: {
          id: `preview-${crypto.randomUUID()}`, mode: plan.mode, universitySlug: plan.universitySlug ?? null,
          stationSlug: station.slug, title: station.lobbyTitle, status: "in_progress", startedAt: new Date().toISOString(), completedAt: null,
          preparationSeconds: 0, stationSeconds: plan.stationSeconds, breakSeconds: 0,
          stationIndex: options.stationIndex ?? 0, stationCount: plan.stationSlugs.length,
          questions: [...station.questions], answers: [], feedback: null, metrics: {}, nextAvailableAt: null,
          circuitId: options.circuitId ?? `preview-${crypto.randomUUID()}`,
        } }, true);
        setReviewRequested(false);
      } else {
        const response = await requestSession("/api/interviews/session", "POST", options);
        const resumed = response.attempt;
        const matchesPlan = resumed && plan && resumed.circuitId === options.circuitId && resumed.stationSlug === options.stationSlug && resumed.stationCount === plan.stationSlugs.length && resumed.mode === plan.mode && resumed.universitySlug === (plan.universitySlug ?? null);
        if (resumed && matchesPlan) {
          planRef.current = plan;
          setRoomPlan(plan);
          try { localStorage.setItem(planKey(resumed.circuitId), JSON.stringify(plan)); }
          catch { setSaveWarning("Your station selection is kept for this visit. Browser storage is unavailable, so return to setup if you reload before the next station."); }
        } else if (resumed && plan) {
          planRef.current = null;
          setRoomPlan(null);
          setSaveWarning("You already had an active interview, so we’ve resumed it with its saved settings.");
        }
        applyResponse(response, true);
        setReviewRequested(false);
      }
    } catch (failure) { showError(failure); }
    finally { actionLockRef.current = false; setBusy(""); setNow(Date.now() + clockOffsetRef.current); }
  };

  const moveQuestion = async (index: number) => {
    if (!active || actionLockRef.current || !attempt || index !== questionIndexRef.current + 1 || index >= attempt.questions.length) return;
    actionLockRef.current = true;
    try {
      speech.stopSpeaking();
      await speech.stop();
      questionIndexRef.current = index;
      setQuestionIndex(index);
      setFollowUpNotice("");
      persistLocal(answersRef.current, index);
      // The next answer and station deadline stay responsive while the previous
      // transcript is saved. saveDraft serialises writes before final grading.
      void saveDraft().catch(() => setSaveWarning("Your answer is kept in this browser. Account autosave will retry shortly."));
    } catch { setSaveWarning("Your answer is kept in this browser. Account autosave will retry shortly."); }
    finally { actionLockRef.current = false; setNow(Date.now() + clockOffsetRef.current); }
  };

  const askFollowUp = async () => {
    const current = attemptRef.current;
    if (!current || !active || !followUpAvailable || followUpRequestRef.current || actionLockRef.current || submitLockRef.current) return;
    const sourceQuestion = current.questions[questionIndexRef.current];
    const controller = new AbortController();
    followUpRequestRef.current = controller;
    setFollowUpBusy(true);
    setFollowUpNotice("");
    try {
      cancelMicrophoneRequest();
      stopSpeaking();
      await stopListening();
      const answer = answersRef.current.find((item) => item.question === sourceQuestion)?.answer ?? "";
      if (getTranscriptHints(answer).wordCount < 20) return false;
      await saveDraft();
      if (controller.signal.aborted) return;
      const response = await requestSession("/api/interviews/follow-up", "POST", { attemptId: current.id, question: sourceQuestion }, controller.signal);
      if (controller.signal.aborted || attemptRef.current?.id !== current.id || attemptRef.current.status !== "in_progress" || submitLockRef.current) return;
      applyResponse(response);
      const index = response.attempt?.questions.indexOf(response.followUp ?? "") ?? -1;
      if (index >= 0) {
        questionIndexRef.current = index;
        setQuestionIndex(index);
        persistLocal(answersRef.current, index);
      }
      setFollowUpNotice(response.source === "practice"
        ? "AI is unavailable, so this is a guided practice follow-up. Your answer has been saved."
        : "A follow-up on your answer.");
      return index >= 0;
    } catch (failure) {
      if (!controller.signal.aborted) setFollowUpNotice(failure instanceof Error ? failure.message : "A follow-up could not be prepared. You can continue with the station questions.");
    } finally {
      if (followUpRequestRef.current === controller) {
        followUpRequestRef.current = null;
        setFollowUpBusy(false);
      }
    }
  };

  const requestDone = async () => {
    if (!active || awaitingDoneRef.current || confirmationPendingRef.current || completionLockRef.current || promptingRef.current || document.hidden) return;
    const currentId = attemptRef.current?.id;
    const index = questionIndexRef.current;
    confirmationPendingRef.current = true;
    try {
      await stopListening(); // Flush the answer before interpreting any yes/no reply.
      if (submitLockRef.current || attemptRef.current?.id !== currentId || attemptRef.current?.status !== "in_progress" || questionIndexRef.current !== index) return;
      if (!answersRef.current[index]?.answer.trim()) return;
      awaitingDoneRef.current = true;
      setAwaitingDone(true);
      if (readAloud && voiceSupported) {
        promptingRef.current = true;
        setPrompting(true);
        void speak(DONE_PROMPT, () => { promptingRef.current = false; setPrompting(false); });
      }
    } finally { confirmationPendingRef.current = false; }
  };

  const completeAnswer = async () => {
    if (!active || completionLockRef.current || actionLockRef.current || submitLockRef.current) return;
    completionLockRef.current = true;
    awaitingDoneRef.current = false;
    setAwaitingDone(false);
    promptingRef.current = false;
    setPrompting(false);
    try {
      stopSpeaking();
      await stopListening();
      if (await askFollowUp()) return;
      if (questionIndexRef.current + 1 < (attemptRef.current?.questions.length ?? 0)) await moveQuestion(questionIndexRef.current + 1);
      else await finishStation();
    } finally { completionLockRef.current = false; }
  };

  const keepAnswering = () => {
    awaitingDoneRef.current = false;
    setAwaitingDone(false);
    stopSpeaking();
    promptingRef.current = false;
    setPrompting(false);
  };
  useEffect(() => {
    onSilenceRef.current = () => {
      if (!micWanted) return;
      // Some browsers leave even a short yes/no reply as interim text.
      // Flush it after the pause so confirmation never needs a button click.
      if (awaitingDoneRef.current) void stopListening();
      else void requestDone();
    };
    completeAnswerRef.current = () => { void completeAnswer(); };
  });

  const leaveAttempt = async () => {
    if (!attempt || actionLockRef.current || submitLockRef.current) return;
    actionLockRef.current = true;
    followUpRequestRef.current?.abort();
    setBusy("Closing this station…");
    try {
      cancelMicrophoneRequest();
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
      setReviewRequested(false);
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
    if (!enabled) { speech.stopSpeaking(); promptingRef.current = false; setPrompting(false); }
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
  const retryStation = () => {
    if (!attempt || attempt.status === "in_progress" || actionLockRef.current || submitLockRef.current) return;
    const plan: InterviewRoomPlan = {
      mode: attempt.mode, universitySlug: attempt.universitySlug ?? undefined,
      stationSlugs: [attempt.stationSlug], preparationSeconds: attempt.preparationSeconds,
      stationSeconds: attempt.stationSeconds, breakSeconds: attempt.breakSeconds,
    };
    // Keep the current circuit plan intact if opening the retry fails.
    void startAttempt({ mode: plan.mode, universitySlug: plan.universitySlug, stationSlug: attempt.stationSlug, stationCount: 1, circuitId: crypto.randomUUID() }, previewRef.current, plan);
  };
  const step = !attempt ? 0 : reviewing ? 2 : 1;

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
    {!configured && !preview && !reviewing && <p role="status" className={styles.previewBanner}>AI feedback is paused. Timed practice and saved answers are available.</p>}
    {loading ? <div className={styles.statusCard}><Loader2 size={19} className="animate-spin" /> Getting your interview space ready…</div> : !attempt ? <AIInterviewSetup
      initialUniversitySlug={initialUniversitySlug} initialStationSlug={initialStationSlug} initialPlan={roomPlan} initialMockCircuit={initialMockCircuit}
      devices={devices} readAloud={readAloud} setReadAloud={setVoiceEnabled} voiceRate={voiceRate} setVoiceRate={setVoiceRate}
      voiceSupported={speech.voiceSupported} speaking={speech.speaking} onStopVoice={speech.stopSpeaking} onTestVoice={() => { devices.stopMicCheck(); if (speech.speaking) speech.stopSpeaking(); else void speech.speak("Welcome to your Phloem interview. Take a breath, and tell me a little about what brought you to medicine."); }}
      speechSupported={speech.supported}
      isPremium={isPremium} busy={Boolean(busy)} onStart={beginRoom}
    /> : reviewing ? <AIInterviewReview key={attempt.id}
      attempt={{ ...attempt, answers }} preview={preview} configured={configured} onRetry={retryStation} onGenerate={() => void generateFeedback()}
      onNext={attempt.stationIndex + 1 < attempt.stationCount && roomPlan && attempt.completedAt ? nextStation : undefined}
      breakRemaining={breakRemaining} busy={Boolean(busy)}
    /> : <>
      {preview && <div className={styles.previewBanner}><Sparkles size={16} /><span><strong>You’re in preview.</strong> Explore the room and sample feedback. This won’t use an attempt or save anything to your account.</span></div>}
      <AIInterviewCall key={attempt.id} attempt={attempt} answers={answers} questionIndex={questionIndex}
        preparing={preparing} expired={expired} active={Boolean(active)} secondsRemaining={secondsRemaining}
        speech={speech} devices={devices} saved={saved} busy={busy} preview={preview} readAloud={readAloud}
        onToggleMicrophone={() => void toggleMicrophone()} setReadAloud={setVoiceEnabled}
        followUpBusy={followUpBusy} followUpNotice={followUpNotice} awaitingDone={awaitingDone} prompting={prompting || speech.speaking} micWanted={micWanted}
        onReadQuestion={() => { if (speech.speaking) { stopSpeaking(); promptingRef.current = false; setPrompting(false); } else { promptingRef.current = true; setPrompting(true); void speak(question, () => { promptingRef.current = false; setPrompting(false); }); } }}
        onDone={() => void requestDone()} onConfirmDone={() => void completeAnswer()} onKeepAnswering={keepAnswering}
        onAnswer={(value) => replaceAnswers(answersRef.current.map((answer, index) => index === questionIndex ? { ...answer, answer: value } : answer))}
        onSubmit={() => void finishStation()} onLeave={() => void leaveAttempt()} wordCount={hints.wordCount}
        onSkipPreparation={() => { if (preview) applyResponse({ attempt: { ...attempt, startedAt: new Date(Date.now() - attempt.preparationSeconds * 1000).toISOString() } }); }}
      />
    </>}
    {reviewing && attempt?.completedAt && attempt.stationIndex + 1 < attempt.stationCount && !roomPlan && <section className={styles.joinBar}><div><strong>Continue your circuit</strong><p>Your remaining topic choices aren’t available on this device. Choose a topic for your next station.</p><label className={styles.universityChoice}>Next station<select aria-label="Next station topic" value={continuationSlug || interviewStations[(attempt.stationIndex + 1) % interviewStations.length].slug} onChange={(event) => setContinuationSlug(event.target.value)}>{interviewStations.map((station) => <option key={station.slug} value={station.slug}>{station.title}</option>)}</select></label></div><button type="button" className={styles.primaryButton} disabled={Boolean(busy) || breakRemaining > 0} onClick={nextStation}>{breakRemaining > 0 ? "Your break is still running" : "Continue to next station"}<ArrowRight size={16} /></button></section>}
    {reviewing && attempt?.status === "in_progress" && !busy && <div role="status" className={styles.statusCard}><div><strong>Your transcript is still in this browser.</strong><p>Save the finished station before retrying or leaving this page.</p><button type="button" className={styles.primaryButton} onClick={() => void finishStation()}>Retry saving station</button></div></div>}
    {saveWarning && <div role="status" className={styles.previewBanner}><span>{saveWarning}</span>{attempt?.status === "in_progress" && <button type="button" disabled={Boolean(busy)} onClick={() => void saveDraft().catch(showError)}>Retry save</button>}</div>}
    {busy && <div role="status" className={styles.statusCard}><Loader2 size={18} className="animate-spin" />{busy}</div>}
    {!attempt && speech.error && <p role="status" className={styles.deviceError}>{speech.error}</p>}
  </div>;
}

export default AIInterviewRunner;
