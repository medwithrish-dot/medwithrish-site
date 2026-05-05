"use client";

import {
  type RefObject,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  createClient as createSupabaseClient,
  hasSupabaseConfig,
} from "@/utils/supabase/client";
import { ClientPremiumGate } from "./ClientPremiumGate";
import {
  fetchUCATQuestion,
  getPassageSections,
  type QuestionData,
} from "../_lib/ucatQuestion";
import {
  CALIB_PHASES,
  type AttentionTrackingSnapshot,
  useAttentionTracker,
} from "../_lib/useAttentionTracker";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Bookmark,
  Brain,
  Check,
  CheckCircle,
  ChevronDown,
  Clock3,
  Eye,
  Goal,
  Home,
  Info,
  LockKeyhole,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  UserRound,
  Wrench,
  Zap,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

// ── PhloemAI Logo (landing hero) ─────────────────────────────────────────────

function PhloemAILogo({ compact = false }: { compact?: boolean } = {}) {
  return (
    <div
      className={`${
        compact ? "w-9 h-9 rounded-xl" : "w-16 h-16 rounded-2xl"
      } bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-lg border border-blue-500/20`}
    >
      <svg
        className={`${compact ? "w-5 h-5" : "w-8 h-8"} text-white`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    </div>
  );
}

// ── Eye Tracking Demo ─────────────────────────────────────────────────────────

// All class strings are explicit so Tailwind can extract them at build time.
const ZONE = {
  sectionA: {
    label: "Section A",
    active_box: "border-blue-400 bg-blue-50",
    inactive_box: "border-slate-200 bg-white",
    badge: "text-blue-600",
    dot: "bg-blue-500",
    active_stat: "border-blue-300 bg-blue-50 text-blue-600",
    inactive_stat: "border-slate-200 bg-white text-slate-400",
    tracking: "text-blue-600",
  },
  sectionB: {
    label: "Section B",
    active_box: "border-cyan-400 bg-cyan-50",
    inactive_box: "border-slate-200 bg-white",
    badge: "text-cyan-600",
    dot: "bg-cyan-500",
    active_stat: "border-cyan-300 bg-cyan-50 text-cyan-600",
    inactive_stat: "border-slate-200 bg-white text-slate-400",
    tracking: "text-cyan-600",
  },
  question: {
    label: "Question",
    active_box: "border-violet-400 bg-violet-50",
    inactive_box: "border-slate-200 bg-white",
    badge: "text-violet-600",
    dot: "bg-violet-500",
    active_stat: "border-violet-300 bg-violet-50 text-violet-600",
    inactive_stat: "border-slate-200 bg-white text-slate-400",
    tracking: "text-violet-600",
  },
  answers: {
    label: "Answers",
    active_box: "border-green-400 bg-green-50",
    inactive_box: "border-slate-200 bg-white",
    badge: "text-green-600",
    dot: "bg-green-500",
    active_stat: "border-green-300 bg-green-50 text-green-600",
    inactive_stat: "border-slate-200 bg-white text-slate-400",
    tracking: "text-green-600",
  },
} as const;

type ZoneId = keyof typeof ZONE;
type AnswerChoiceEvent = { key: AnswerKey; at: number };

const ZONE_IDS: ZoneId[] = ["sectionA", "sectionB", "question", "answers"];

// ── Question type (from /api/rishbot/question) ────────────────────────────────

type AnswerKey = "A" | "B" | "C" | "D";
const ANSWER_KEYS: AnswerKey[] = ["A", "B", "C", "D"];
const emptyAnswerTimes = (): Record<AnswerKey, number> => ({
  A: 0,
  B: 0,
  C: 0,
  D: 0,
});
type FeedbackInsights = {
  result: string;
  issues: string[];
  metrics: { label: string; value: string }[];
};
const emptyFeedbackInsights = (): FeedbackInsights => ({
  result: "",
  issues: [],
  metrics: [],
});

type SessionState =
  | "idle"
  | "loading"
  | "active"
  | "answered";

// ── EyeTrackingDemo ───────────────────────────────────────────────────────────

export function AttentionTrackingDemo() {
  const [state, setState] = useState<SessionState>("idle");
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [selected, setSelected] = useState<AnswerKey | null>(null);
  const [confirmedAnswer, setConfirmedAnswer] = useState<AnswerKey | null>(null);
  const [feedbackInsights, setFeedbackInsights] = useState<FeedbackInsights>(emptyFeedbackInsights);
  const [timeLeft, setTimeLeft] = useState(120);
  const sectionARef = useRef<HTMLParagraphElement>(null);
  const sectionBRef = useRef<HTMLParagraphElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);
  const zoneElements = useMemo(
    () =>
      ({
        sectionA: sectionARef,
        sectionB: sectionBRef,
        question: questionRef,
        answers: answersRef,
      }) as Record<ZoneId, RefObject<Element | null>>,
    []
  );
  const tracker = useAttentionTracker<ZoneId>({
    zoneIds: ZONE_IDS,
    zoneElements,
    isActive: state === "active",
  });
  const activeZone = tracker.activeZone;
  const calibCountdown = tracker.calibCountdown;
  const calibPhase = tracker.calibPhase;
  const eyeStatus = tracker.eyeStatus;
  const finishAttempt = tracker.finishAttempt;
  const getAttentionSnapshot = tracker.getSnapshot;
  const gazeDataReceived = tracker.dataReceived;
  const gazePos = tracker.pointer;
  const resetAttentionAttempt = tracker.resetAttempt;
  const resetAttentionTracker = tracker.resetTracker;
  const ringLabel = tracker.trackingMode === "mouse" ? "Cursor ring" : "Tracking ring";
  const setShowGazeRing = tracker.setShowRing;
  const showGazeRing = tracker.showRing;
  const beginEyeTracking = tracker.startEyeTracking;
  const beginMouseTracking = tracker.startMouseTracking;
  const beginPracticeOnly = tracker.startPracticeOnly;
  const trackingActive = tracker.trackingActive;
  const trackingLabel =
    tracker.trackingMode === "mouse" ? "Mouse tracking active" : "Eye tracking active";
  const wgError = tracker.error;
  const zonePcts = tracker.zonePcts;
  const answerSelectionHistoryRef = useRef<AnswerChoiceEvent[]>([]);
  const answerSwitchCountRef = useRef(0);
  const answerHoverTimesRef = useRef<Record<AnswerKey, number>>(emptyAnswerTimes());
  const answerHoverSwitchCountRef = useRef(0);
  const currentAnswerHoverRef = useRef<{ key: AnswerKey; startedAt: number } | null>(null);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<SessionState>("idle");

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const finalizeAnswerHover = useCallback((now = Date.now()) => {
    const hover = currentAnswerHoverRef.current;
    if (!hover) return;

    answerHoverTimesRef.current[hover.key] += Math.max(0, now - hover.startedAt);
    currentAnswerHoverRef.current = null;
  }, []);

  const resetAnswerTelemetry = useCallback(() => {
    answerSelectionHistoryRef.current = [];
    answerSwitchCountRef.current = 0;
    answerHoverTimesRef.current = emptyAnswerTimes();
    answerHoverSwitchCountRef.current = 0;
    currentAnswerHoverRef.current = null;
  }, []);

  const fetchQuestion = useCallback(async () => {
    setState("loading");
    try {
      const data = await fetchUCATQuestion();
      const now = Date.now();
      setQuestion(data);
      setSelected(null);
      setConfirmedAnswer(null);
      setFeedbackInsights(emptyFeedbackInsights());
      setTimeLeft(120);
      resetAttentionAttempt(now);
      resetAnswerTelemetry();
      stateRef.current = "active";
      setState("active");
    } catch {
      stateRef.current = "idle";
      setState("idle");
    }
  }, [resetAnswerTelemetry, resetAttentionAttempt]);

  const startEyeTracking = useCallback(() => {
    void beginEyeTracking(fetchQuestion);
  }, [beginEyeTracking, fetchQuestion]);

  const startMouseTracking = useCallback(() => {
    beginMouseTracking();
    void fetchQuestion();
  }, [beginMouseTracking, fetchQuestion]);

  const startPracticeOnly = useCallback(() => {
    beginPracticeOnly();
    void fetchQuestion();
  }, [beginPracticeOnly, fetchQuestion]);

  const reset = () => {
    resetAttentionTracker();
    setSelected(null);
    setConfirmedAnswer(null);
    setFeedbackInsights(emptyFeedbackInsights());
    setQuestion(null);
    resetAnswerTelemetry();
    stateRef.current = "idle";
    setState("idle");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const buildFeedbackInsights = useCallback(
    (
      finalAnswer: AnswerKey | null,
      finalZoneTimes: Record<ZoneId, number>,
      focusSnapshot: AttentionTrackingSnapshot<ZoneId>
    ): FeedbackInsights => {
      if (!question) return emptyFeedbackInsights();

      const correct = finalAnswer === question.correct;
      const result = !finalAnswer
        ? `No answer was confirmed. The correct answer was ${question.correct}. ${question.explanation}`
        : correct
        ? `Correct. ${question.explanation}`
        : `The correct answer was ${question.correct}. ${question.explanation}`;

      const finalTotal = Object.values(finalZoneTimes).reduce((sum, value) => sum + value, 0);
      const finalZonePcts = Object.fromEntries(
        ZONE_IDS.map((id) => [
          id,
          finalTotal > 0 ? Math.round((finalZoneTimes[id] / finalTotal) * 100) : 0,
        ])
      ) as Record<ZoneId, number>;
      const earlyTimes = { ...focusSnapshot.earlyZoneTimes };
      const earlyTotal = Object.values(earlyTimes).reduce((sum, value) => sum + value, 0);
      let earlyDominant: ZoneId | null = null;
      let earlyDominantPct = 0;

      for (const id of ZONE_IDS) {
        const pct = earlyTotal > 0 ? Math.round((earlyTimes[id] / earlyTotal) * 100) : 0;
        if (pct > earlyDominantPct) {
          earlyDominant = id;
          earlyDominantPct = pct;
        }
      }

      const firstRegion = focusSnapshot.firstPrimaryRegion;
      const regionTransitions = focusSnapshot.regionTransitions;
      const sectionQuestionFlips = regionTransitions.filter(
        ({ from, to }) =>
          ((from === "sectionA" || from === "sectionB") && to === "question") ||
          (from === "question" && (to === "sectionA" || to === "sectionB"))
      ).length;
      const sectionASectionBFlips = regionTransitions.filter(
        ({ from, to }) =>
          (from === "sectionA" && to === "sectionB") ||
          (from === "sectionB" && to === "sectionA")
      ).length;
      const sectionARevisits = regionTransitions.filter(
        ({ to }) => to === "sectionA"
      ).length;
      const sectionBToAPct =
        finalZonePcts.sectionA > 0
          ? Math.round((finalZonePcts.sectionB / finalZonePcts.sectionA) * 100)
          : finalZonePcts.sectionB > 0
          ? 999
          : 0;
      const answerHoverSeconds = Math.round(
        Object.values(answerHoverTimesRef.current).reduce((sum, value) => sum + value, 0) / 1000
      );
      const hoveredOptionCount = ANSWER_KEYS.filter(
        (key) => answerHoverTimesRef.current[key] > 250
      ).length;
      const answerSwitches = answerSwitchCountRef.current;
      const regionSwitches = focusSnapshot.regionSwitchCount;
      const answerHoverSwitches = answerHoverSwitchCountRef.current;

      const issues: string[] = [];
      if (!finalAnswer) {
        issues.push("No answer was confirmed before the timer ended.");
      }

      if (!focusSnapshot.dataReceived) {
        issues.push("Attention tracking data was not recorded for this attempt.");
      } else {
        if (firstRegion === "sectionA" || (earlyDominant === "sectionA" && earlyDominantPct >= 50)) {
          issues.push(
            `Early focus leaned Section A-first${earlyDominant ? ` (${earlyDominantPct}% of the first 10s)` : ""}.`
          );
        }
        if (finalZonePcts.sectionB < finalZonePcts.sectionA) {
          issues.push(
            `Uneven focus: focus on Section B was only ${sectionBToAPct}% of Section A.`
          );
        }
        if (sectionARevisits >= 3) {
          issues.push(
            `${sectionARevisits} returns to Section A suggest you may be re-checking background context instead of mining Section B for the answer cue.`
          );
        }
        if (finalZonePcts.sectionB < 15 && !correct) {
          issues.push("Section B received very little focus, even though it often contains the decisive keyword or condition.");
        }
        if (finalZonePcts.question < 8) {
          issues.push("QUESTION received very little stable focus time.");
        }
        if (sectionQuestionFlips >= 4) {
          issues.push(`${sectionQuestionFlips} passage/question flips suggest you may have been re-checking the ask repeatedly.`);
        } else if (regionSwitches >= 8) {
          issues.push(`${regionSwitches} total region switches suggest a scattered reading path.`);
        }
        if (finalZonePcts.answers < 10 && !correct) {
          issues.push("ANSWERS received little review time before the final choice.");
        }
      }

      if (answerSwitches >= 2) {
        issues.push(`${answerSwitches} answer-choice switches before confirming.`);
      }
      if (answerHoverSeconds >= 6 && hoveredOptionCount >= 2) {
        issues.push(`Hovered across ${hoveredOptionCount} answer options for about ${answerHoverSeconds}s.`);
      }
      if (answerHoverSwitches >= 3) {
        issues.push(`${answerHoverSwitches} answer hover switches before confirming.`);
      }
      if (issues.length === 0) {
        issues.push("No major focus issues detected in this attempt.");
      }

      return {
        result,
        issues,
        metrics: [
          {
            label: "First focus",
            value: firstRegion ? ZONE[firstRegion].label : "UNKNOWN",
          },
          {
            label: "Region switches",
            value: String(regionSwitches),
          },
          {
            label: "Uneven focus",
            value: finalZonePcts.sectionA > 0 ? `B was only ${sectionBToAPct}% of A` : "N/A",
          },
          {
            label: "A/B flips",
            value: String(sectionASectionBFlips),
          },
          {
            label: "A revisits",
            value: String(sectionARevisits),
          },
          {
            label: "Passage/Q flips",
            value: String(sectionQuestionFlips),
          },
          {
            label: "Answer switches",
            value: String(answerSwitches),
          },
        ],
      };
    },
    [question]
  );

  // ── Idle state ──────────────────────────────────────────────────────────────
  const finishQuestion = useCallback(
    (finalAnswer: AnswerKey | null) => {
      if (stateRef.current !== "active") return;
      if (timerIdRef.current) clearInterval(timerIdRef.current);

      const now = Date.now();
      const finalZoneTimes = finishAttempt(now);
      const focusSnapshot = getAttentionSnapshot();
      finalizeAnswerHover(now);
      setConfirmedAnswer(finalAnswer);
      setFeedbackInsights(buildFeedbackInsights(finalAnswer, finalZoneTimes, focusSnapshot));
      stateRef.current = "answered";
      setState("answered");
    },
    [buildFeedbackInsights, finalizeAnswerHover, finishAttempt, getAttentionSnapshot]
  );

  // Countdown timer
  useEffect(() => {
    if (state !== "active") return;
    timerIdRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finishQuestion(null);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [finishQuestion, state]);

  const selectAnswer = useCallback((key: AnswerKey) => {
    if (state !== "active") return;

    const now = Date.now();
    if (selected && selected !== key) {
      answerSwitchCountRef.current += 1;
    }
    if (selected !== key) {
      answerSelectionHistoryRef.current.push({ key, at: now });
    }
    setSelected(key);
  }, [selected, state]);

  const confirmAnswer = useCallback(() => {
    if (state !== "active" || !selected) return;
    finishQuestion(selected);
  }, [finishQuestion, selected, state]);

  const handleAnswerHoverStart = useCallback((key: AnswerKey) => {
    if (stateRef.current !== "active") return;

    const now = Date.now();
    const current = currentAnswerHoverRef.current;
    if (current?.key === key) return;

    if (current) {
      answerHoverTimesRef.current[current.key] += Math.max(0, now - current.startedAt);
      answerHoverSwitchCountRef.current += 1;
    }

    currentAnswerHoverRef.current = { key, startedAt: now };
  }, []);

  const handleAnswerHoverEnd = useCallback((key: AnswerKey) => {
    const current = currentAnswerHoverRef.current;
    if (!current || current.key !== key) return;
    finalizeAnswerHover();
  }, [finalizeAnswerHover]);

  if (state === "idle" && eyeStatus === "idle") {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div>
            <div className="mb-3 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2">
              <p className="text-xs font-semibold text-blue-700">
                Mouse tracking is recommended on desktop: it is more precise, faster to start, and does not need webcam permission.
              </p>
            </div>
            <h3 className="text-slate-900 font-bold text-base">
              DEMO - Choose your attention tracker
            </h3>
            <p className="text-slate-700 text-sm mt-1 leading-relaxed">
              PhloemAI can estimate which zone you focus on during each question -{" "}
              <span className="text-slate-900 font-medium">Section A</span>,{" "}
              <span className="text-slate-900 font-medium">Section B</span>,{" "}
              <span className="text-slate-900 font-medium">Question</span>,{" "}
              or <span className="text-slate-900 font-medium">Answers</span>. It shows{" "}
              <em>how</em> you read, not just what you got wrong.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Choose mouse tracking for precise cursor data, eye tracking for the webcam experiment, or practice-only with no attention data.
              Modes are mutually exclusive so the question screen stays calm.
            </p>
          </div>
        </div>
        {wgError && (
          <p className="text-xs text-red-500">
            Could not load eye-tracking. Try mouse tracking or practice-only below.
          </p>
        )}
        <div className="space-y-2">
          <button
            onClick={startMouseTracking}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            Start with Mouse Tracking →
          </button>
          <button
            onClick={startEyeTracking}
            className="w-full py-2 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-800 text-sm font-semibold shadow-sm hover:border-amber-500 hover:bg-amber-100 transition-colors cursor-pointer"
          >
            Enable Eye Tracking + Start →
          </button>
          <button
            onClick={startPracticeOnly}
            className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 text-sm hover:text-slate-900 hover:border-slate-400 transition-colors cursor-pointer"
          >
            Practice only - no tracking
          </button>
        </div>
      </div>
    );
  }

  // ── Loading WebGazer ────────────────────────────────────────────────────────
  if (eyeStatus === "enabling") {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center space-y-3">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-700 text-sm">Loading eye-tracking…</p>
        <p className="text-slate-400 text-xs">Webcam permission prompt may appear</p>
      </div>
    );
  }

  // ── Calibration ─────────────────────────────────────────────────────────────
  if (eyeStatus === "calibrating") {
    const phase = CALIB_PHASES[calibPhase];
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950">
        {/* Instructions pinned to top */}
        <div className="absolute top-6 left-0 right-0 flex flex-col items-center gap-3">
          <p className="text-white font-bold text-lg">Eye Tracking Calibration</p>
          <p className="text-slate-400 text-sm">
            Look at the dot - <span className="text-blue-400 font-medium">{phase.label}</span>
          </p>
          {/* Phase progress dots */}
          <div className="flex gap-2">
            {CALIB_PHASES.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${
                  i < calibPhase ? "bg-blue-600" : i === calibPhase ? "bg-white" : "bg-slate-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Moving calibration dot */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${phase.x}%`, top: `${phase.y}%` }}
        >
          <div className="relative flex items-center justify-center">
            <div
              className="absolute w-20 h-20 rounded-full border border-blue-500/30 animate-ping"
              style={{ animationDuration: "1.2s" }}
            />
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shadow-md">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            </div>
          </div>
          {/* Countdown under the dot */}
          <div className="text-center mt-4 text-4xl font-black text-blue-400 tabular-nums">
            {calibCountdown > 0 ? calibCountdown : "✓"}
          </div>
        </div>

        <p className="absolute bottom-4 left-0 right-0 text-center text-slate-600 text-xs">
          Webcam preview bottom-right · no video stored
        </p>
      </div>
    );
  }

  // ── Fetching question ───────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center space-y-3">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-700 text-sm">Generating UCAT question…</p>
      </div>
    );
  }

  // ── Active question ─────────────────────────────────────────────────────────
  if ((state === "active" || state === "answered") && question) {
    const timeCritical = timeLeft < 30 && state === "active";
    const passageSections = getPassageSections(question);
    return (
      <>
        {trackingActive && showGazeRing && gazePos && state === "active" && (
          <div
            style={{
              position: "fixed",
              zIndex: 9999,
              pointerEvents: "none",
              left: gazePos.x - 22,
              top: gazePos.y - 22,
              width: 44,
              height: 44,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1.5px solid rgba(148,163,184,0.55)",
                background: "rgba(255,255,255,0.03)",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(148,163,184,0.7)",
              }}
            />
          </div>
        )}

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
              Verbal Reasoning
            </span>
            {trackingActive && state === "active" && (
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                {trackingLabel}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {trackingActive && state === "active" && (
              <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showGazeRing}
                  onChange={(event) => setShowGazeRing(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                />
                {ringLabel}
              </label>
            )}
            <span
              className={`font-mono font-bold text-sm transition-colors ${
                state === "answered"
                  ? "text-slate-400"
                  : timeCritical
                  ? "text-red-500 animate-pulse"
                  : "text-slate-900"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Passage */}
          <div
            className={`rounded-xl p-4 border transition-all duration-300 ${
              (activeZone === "sectionA" || activeZone === "sectionB") && state === "active"
                ? ZONE[activeZone].active_box
                : ZONE.sectionA.inactive_box
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  (activeZone === "sectionA" || activeZone === "sectionB") && state === "active"
                    ? ZONE[activeZone].badge
                    : "text-slate-500"
                }`}
              >
                Passage
              </span>
              {(activeZone === "sectionA" || activeZone === "sectionB") && state === "active" && (
                <span className={`flex items-center gap-1 text-xs animate-pulse ${ZONE[activeZone].tracking}`}>
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${ZONE[activeZone].dot}`} />
                  tracking {ZONE[activeZone].label}
                </span>
              )}
            </div>
            <p
              ref={sectionARef}
              className={`-mx-1 rounded-lg px-1 py-0.5 text-slate-800 text-sm leading-relaxed transition-colors ${
                activeZone === "sectionA" && state === "active"
                  ? "bg-blue-100/60 ring-1 ring-blue-200"
                  : ""
              }`}
            >
              {passageSections.sectionA}
            </p>
            <p
              ref={sectionBRef}
              className={`-mx-1 mt-4 rounded-lg px-1 py-0.5 text-slate-800 text-sm leading-relaxed transition-colors ${
                activeZone === "sectionB" && state === "active"
                  ? "bg-cyan-100/70 ring-1 ring-cyan-200"
                  : ""
              }`}
            >
              {passageSections.sectionB}
            </p>
          </div>

          {/* Question wording */}
          <div
            ref={questionRef}
            className={`rounded-xl p-3 border transition-all duration-300 ${
              activeZone === "question" && state === "active"
                ? ZONE.question.active_box
                : ZONE.question.inactive_box
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  activeZone === "question" && state === "active"
                    ? ZONE.question.badge
                    : "text-slate-500"
                }`}
              >
                Question
              </span>
              {activeZone === "question" && state === "active" && (
                <span className="flex items-center gap-1 text-xs text-violet-600 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 inline-block" />
                  tracking
                </span>
              )}
            </div>
            <p className="text-slate-800 text-sm font-medium">
              {question.question}
            </p>
          </div>

          {/* Answer options */}
          <div
            ref={answersRef}
            className={`rounded-xl p-3 border transition-all duration-300 ${
              activeZone === "answers" && state === "active"
                ? ZONE.answers.active_box
                : ZONE.answers.inactive_box
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  activeZone === "answers" && state === "active"
                    ? ZONE.answers.badge
                    : "text-slate-500"
                }`}
              >
                Answers
              </span>
              {activeZone === "answers" && state === "active" && (
                <span className="flex items-center gap-1 text-xs text-green-600 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  tracking
                </span>
              )}
            </div>
            <div className="space-y-2">
              {ANSWER_KEYS.map((key) => {
                const isSelected =
                  state === "answered" ? confirmedAnswer === key : selected === key;
                const isCorrect =
                  state === "answered" && key === question.correct;
                const isWrong =
                  state === "answered" &&
                  confirmedAnswer === key &&
                  key !== question.correct;
                return (
                  <button
                    key={key}
                    onClick={() => selectAnswer(key)}
                    onMouseEnter={() => handleAnswerHoverStart(key)}
                    onMouseLeave={() => handleAnswerHoverEnd(key)}
                    disabled={state === "answered"}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all cursor-pointer ${
                      isCorrect
                        ? "border-green-400 bg-green-50 text-green-800"
                        : isWrong
                        ? "border-red-400 bg-red-50 text-red-700"
                        : isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-800"
                        : state === "active"
                        ? "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50"
                        : "border-slate-200 bg-slate-50 text-slate-400"
                    }`}
                  >
                    <span className="font-bold mr-2">{key}.</span>
                    {question.options[key]}
                  </button>
                );
              })}
            </div>
            {state === "active" && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  {selected ? `Selected ${selected}` : "Choose an option before confirming."}
                </p>
                <button
                  type="button"
                  onClick={confirmAnswer}
                  disabled={!selected}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    selected
                      ? "bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  Confirm answer
                </button>
              </div>
            )}
          </div>

          {/* Zone stats */}
          {gazeDataReceived ? (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {ZONE_IDS.map((id) => (
                <div
                  key={id}
                  className={`rounded-xl p-2 text-center border transition-all duration-300 ${
                    activeZone === id && state === "active"
                      ? ZONE[id].active_stat
                      : ZONE[id].inactive_stat
                  }`}
                >
                  <div className="text-sm font-bold">{zonePcts[id]}%</div>
                  <div className="text-xs opacity-70">{ZONE[id].label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl p-2 text-center border border-slate-200 bg-slate-50 text-xs text-slate-400">
              Attention tracking data not recorded
            </div>
          )}

          {/* AI coaching after answer */}
          {state === "answered" && (
            <div
              className={`rounded-xl p-4 border text-sm leading-relaxed ${
                confirmedAnswer && confirmedAnswer === question.correct
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-2 font-semibold text-sm ${
                  confirmedAnswer && confirmedAnswer === question.correct
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {!confirmedAnswer
                  ? "No answer confirmed"
                  : confirmedAnswer === question.correct
                  ? "Correct"
                  : "Incorrect"}
                <span className="text-xs font-normal text-slate-400">
                  · AI coaching
                </span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {feedbackInsights.result}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {feedbackInsights.metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-slate-200 bg-white/80 px-2 py-2"
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                      {metric.label}
                    </div>
                    <div className="mt-0.5 text-sm font-bold text-slate-800">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-xl border border-slate-200 bg-white/85 p-3">
                <div className="text-xs font-bold uppercase tracking-wide text-slate-900">
                  ISSUES
                </div>
                <div className="mt-2 space-y-1.5">
                  {feedbackInsights.issues.map((issue) => (
                    <p key={issue} className="text-xs leading-relaxed text-slate-700">
                      {issue}
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-950 p-3 text-white">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wide text-white">
                      FIXES
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">
                      Locked strategy map: reading order, re-check triggers, and answer-change rules tailored to this attempt.
                    </p>
                  </div>
                  <span className="shrink-0 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Lock / Upgrade to Premium
                  </span>
                </div>
              </div>
              <button
                onClick={reset}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 transition-colors cursor-pointer"
              >
                New question →
              </button>
            </div>
          )}
        </div>
      </div>
      </>
    );
  }

  return null;
}




// ── Privacy Notice ───────────────────────────────────────────────────────────

function PrivacyNotice() {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-blue-500 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
        <span className="text-sm font-semibold text-slate-800">
          Your data is secure.
        </span>
      </div>
      <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
        <p>
          Performance data and attention-tracking insights are used only to
          improve your learning experience. Tracking is entirely optional - you
          can use the full tutor without mouse tracking or webcam access.
        </p>
        <p>
          Mouse tracking uses cursor position only. No webcam video is ever
          recorded or stored. Attention analysis estimates broad focus zones
          only and is not medical-grade or diagnostic.
        </p>
        <p>
          AI feedback is educational guidance only and does not guarantee exam
          outcomes. You can request deletion of your data at any time by
          contacting{" "}
          <a
            href="mailto:medwithrish@gmail.com"
            className="text-blue-600 hover:underline"
          >
            medwithrish@gmail.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}

// ── UCAT Dashboard (post-login placeholder) ──────────────────────────────────

type PhloemProfile = {
  full_name: string | null;
  current_plan: string | null;
};

type AuthMode = "signup" | "login";
type DashboardView =
  | "dashboard"
  | "diagnostic"
  | "practice"
  | "progress"
  | "report"
  | "account";

type PremiumGateProps = {
  isPremium: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void | Promise<void>;
};

const dashboardPageMeta: Record<
  DashboardView,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Let's keep your UCAT prep on track.",
  },
  diagnostic: {
    title: "Diagnostic",
    subtitle: "Run a quick diagnostic to find what is holding your score back.",
  },
  practice: {
    title: "Practice",
    subtitle: "Target the fixes from your latest diagnosis.",
  },
  progress: {
    title: "Progress",
    subtitle: "See whether your fixes are actually working.",
  },
  report: {
    title: "Report",
    subtitle: "Expanded breakdown from your latest diagnostic.",
  },
  account: {
    title: "Account",
    subtitle: "Manage your profile, plan and subscription.",
  },
};

const sectionScores = [
  {
    code: "VR",
    score: 72,
    badgeClass: "bg-indigo-600 text-white",
    barClass: "bg-indigo-600",
  },
  {
    code: "DM",
    score: 67,
    badgeClass: "bg-blue-600 text-white",
    barClass: "bg-blue-600",
  },
  {
    code: "QR",
    score: 54,
    badgeClass: "bg-cyan-500 text-white",
    barClass: "bg-cyan-500",
  },
  {
    code: "SJT",
    score: 78,
    badgeClass: "bg-pink-500 text-white",
    barClass: "bg-pink-500",
  },
];

type MockGraphMode = "mini" | "full";
type MiniMockSectionCode = "VR" | "DM" | "QR" | "SJT";
type MockHistoryPeriod = "7D" | "30D" | "90D" | "All time";
type MockPerformanceSeries = {
  title: string;
  subtitle: string;
  scaleLabel: string;
  scaleMin: number;
  scaleMax: number;
  ticks: number[];
  points: Array<{
    label: string;
    correct: number;
    incorrect: number;
    scaled: number;
  }>;
};

const miniMockPerformanceSeries: Record<MiniMockSectionCode, MockPerformanceSeries> = {
  VR: {
    title: "PhloemAI VR mini mocks",
    subtitle: "Scaled score across recent Verbal Reasoning mini mocks.",
    scaleLabel: "UCAT scaled score",
    scaleMin: 300,
    scaleMax: 900,
    ticks: [300, 500, 700, 900],
    points: [
      { label: "Set 1", correct: 11, incorrect: 13, scaled: 500 },
      { label: "Set 2", correct: 12, incorrect: 12, scaled: 530 },
      { label: "Set 3", correct: 12, incorrect: 12, scaled: 550 },
      { label: "Set 4", correct: 13, incorrect: 11, scaled: 560 },
      { label: "Set 5", correct: 14, incorrect: 10, scaled: 580 },
      { label: "Set 6", correct: 14, incorrect: 10, scaled: 590 },
      { label: "Set 7", correct: 14, incorrect: 10, scaled: 580 },
      { label: "Set 8", correct: 15, incorrect: 9, scaled: 610 },
      { label: "Set 9", correct: 15, incorrect: 9, scaled: 620 },
      { label: "Set 10", correct: 17, incorrect: 7, scaled: 670 },
      { label: "Set 11", correct: 18, incorrect: 6, scaled: 700 },
      { label: "Set 12", correct: 19, incorrect: 5, scaled: 730 },
    ],
  },
  DM: {
    title: "PhloemAI DM mini mocks",
    subtitle: "Scaled score across recent Decision Making mini mocks.",
    scaleLabel: "UCAT scaled score",
    scaleMin: 300,
    scaleMax: 900,
    ticks: [300, 500, 700, 900],
    points: [
      { label: "Set 1", correct: 9, incorrect: 11, scaled: 500 },
      { label: "Set 2", correct: 10, incorrect: 10, scaled: 520 },
      { label: "Set 3", correct: 10, incorrect: 10, scaled: 540 },
      { label: "Set 4", correct: 11, incorrect: 9, scaled: 555 },
      { label: "Set 5", correct: 11, incorrect: 9, scaled: 565 },
      { label: "Set 6", correct: 12, incorrect: 8, scaled: 580 },
      { label: "Set 7", correct: 11, incorrect: 9, scaled: 570 },
      { label: "Set 8", correct: 12, incorrect: 8, scaled: 600 },
      { label: "Set 9", correct: 13, incorrect: 7, scaled: 630 },
      { label: "Set 10", correct: 13, incorrect: 7, scaled: 650 },
      { label: "Set 11", correct: 14, incorrect: 6, scaled: 670 },
      { label: "Set 12", correct: 15, incorrect: 5, scaled: 700 },
    ],
  },
  QR: {
    title: "PhloemAI QR mini mocks",
    subtitle: "Scaled score across recent Quantitative Reasoning mini mocks.",
    scaleLabel: "UCAT scaled score",
    scaleMin: 300,
    scaleMax: 900,
    ticks: [300, 500, 700, 900],
    points: [
      { label: "Set 1", correct: 7, incorrect: 13, scaled: 460 },
      { label: "Set 2", correct: 8, incorrect: 12, scaled: 480 },
      { label: "Set 3", correct: 8, incorrect: 12, scaled: 500 },
      { label: "Set 4", correct: 9, incorrect: 11, scaled: 515 },
      { label: "Set 5", correct: 9, incorrect: 11, scaled: 525 },
      { label: "Set 6", correct: 10, incorrect: 10, scaled: 540 },
      { label: "Set 7", correct: 9, incorrect: 11, scaled: 520 },
      { label: "Set 8", correct: 10, incorrect: 10, scaled: 550 },
      { label: "Set 9", correct: 11, incorrect: 9, scaled: 580 },
      { label: "Set 10", correct: 12, incorrect: 8, scaled: 610 },
      { label: "Set 11", correct: 13, incorrect: 7, scaled: 650 },
      { label: "Set 12", correct: 15, incorrect: 5, scaled: 700 },
    ],
  },
  SJT: {
    title: "PhloemAI SJT mini mocks",
    subtitle: "Scaled score across recent Situational Judgement mini mocks.",
    scaleLabel: "UCAT scaled score",
    scaleMin: 300,
    scaleMax: 900,
    ticks: [300, 500, 700, 900],
    points: [
      { label: "Set 1", correct: 11, incorrect: 9, scaled: 540 },
      { label: "Set 2", correct: 12, incorrect: 8, scaled: 570 },
      { label: "Set 3", correct: 12, incorrect: 8, scaled: 590 },
      { label: "Set 4", correct: 13, incorrect: 7, scaled: 600 },
      { label: "Set 5", correct: 13, incorrect: 7, scaled: 620 },
      { label: "Set 6", correct: 14, incorrect: 6, scaled: 650 },
      { label: "Set 7", correct: 13, incorrect: 7, scaled: 610 },
      { label: "Set 8", correct: 14, incorrect: 6, scaled: 640 },
      { label: "Set 9", correct: 15, incorrect: 5, scaled: 680 },
      { label: "Set 10", correct: 15, incorrect: 5, scaled: 700 },
      { label: "Set 11", correct: 16, incorrect: 4, scaled: 740 },
      { label: "Set 12", correct: 17, incorrect: 3, scaled: 770 },
    ],
  },
};

const fullMockPerformanceSeries: MockPerformanceSeries = {
  title: "PhloemAI Full mocks",
  subtitle: "Total scaled score across full UCAT-style mocks.",
  scaleLabel: "Total scaled score",
  scaleMin: 1800,
  scaleMax: 3200,
  ticks: [1800, 2200, 2600, 3000],
  points: [
    { label: "Mock 1", correct: 118, incorrect: 110, scaled: 2200 },
    { label: "Mock 2", correct: 124, incorrect: 104, scaled: 2280 },
    { label: "Mock 3", correct: 132, incorrect: 96, scaled: 2380 },
    { label: "Mock 4", correct: 141, incorrect: 87, scaled: 2490 },
    { label: "Mock 5", correct: 149, incorrect: 79, scaled: 2570 },
    { label: "Mock 6", correct: 156, incorrect: 72, scaled: 2660 },
    { label: "Mock 7", correct: 160, incorrect: 68, scaled: 2700 },
    { label: "Mock 8", correct: 164, incorrect: 64, scaled: 2760 },
  ],
};

const questionBankProgress = [
  {
    code: "VR",
    title: "PhloemAI Verbal Reasoning",
    completed: 7,
    total: 9,
    focus: "Inference and longer passages next",
    href: "/phloemai/question-bank/vr",
  },
  {
    code: "DM",
    title: "PhloemAI Decision Making",
    completed: 6,
    total: 10,
    focus: "Syllogisms and logic puzzles next",
    href: "/phloemai/question-bank/dm",
  },
  {
    code: "QR",
    title: "PhloemAI Quantitative Reasoning",
    completed: 8,
    total: 14,
    focus: "Calculator-heavy data sets next",
    href: "/phloemai/question-bank/qr",
  },
  {
    code: "SJT",
    title: "PhloemAI Situational Judgement",
    completed: 6,
    total: 10,
    focus: "Ordering and integrity scenarios next",
    href: "/phloemai/question-bank/sjt",
  },
] as const;

const fixTasks = [
  {
    title: "QR Speed Drill",
    meta: "7 min - Calculator-heavy questions",
    icon: Zap,
    iconClass: "bg-violet-100 text-violet-600",
  },
  {
    title: "Timed QR mini-set",
    meta: "10 questions - Focus on pace",
    icon: Clock3,
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    title: "Review changed answers",
    meta: "5 questions - Improve decision making",
    icon: Eye,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
];

const dailyQuestionTarget = 200;
const questionCalendarDays = [
  { day: 1, questions: 0 },
  { day: 2, questions: 75 },
  { day: 3, questions: 120 },
  { day: 4, questions: 180 },
  { day: 5, questions: 220 },
  { day: 6, questions: 190 },
  { day: 7, questions: 210 },
  { day: 8, questions: 205 },
  { day: 9, questions: 215 },
  { day: 10, questions: 180 },
  { day: 11, questions: 200 },
  { day: 12, questions: 240 },
  { day: 13, questions: 160 },
  { day: 14, questions: 230 },
  { day: 15, questions: 205 },
  { day: 16, questions: 210 },
  { day: 17, questions: 185 },
  { day: 18, questions: 0 },
  { day: 19, questions: 0 },
  { day: 20, questions: 0 },
  { day: 21, questions: 0 },
  { day: 22, questions: 0 },
  { day: 23, questions: 0 },
  { day: 24, questions: 0 },
  { day: 25, questions: 0 },
  { day: 26, questions: 0 },
  { day: 27, questions: 0 },
  { day: 28, questions: 0 },
  { day: 29, questions: 0 },
  { day: 30, questions: 0 },
  { day: 31, questions: 0 },
] as const;

const approachSteps = [
  {
    title: "Diagnose",
    text: "Find the habits costing you marks",
    icon: Activity,
    iconClass: "bg-violet-100 text-indigo-600",
  },
  {
    title: "AI Feedback",
    text: "Understand why they happen",
    icon: MessageSquare,
    iconClass: "bg-blue-100 text-blue-600",
  },
  {
    title: "Fixes",
    text: "Get targeted tasks to improve",
    icon: Wrench,
    iconClass: "bg-emerald-100 text-emerald-600",
  },
  {
    title: "Practice",
    text: "Complete tasks and build new habits",
    icon: Target,
    iconClass: "bg-indigo-100 text-indigo-600",
  },
  {
    title: "Progress",
    text: "Track improvement and keep refining",
    icon: BarChart3,
    iconClass: "bg-blue-100 text-blue-600",
  },
];

const dashboardFeedbackShort =
  "Your latest diagnostic found time pressure as the main factor holding your score back. You're generally accurate across the board, which is a strong foundation.";

const dashboardFeedbackFull =
  "Your latest diagnostic found time pressure as the main factor holding your score back. You're generally accurate across the board, which is a strong foundation. Your score is being held back by how time is managed in certain sections. In QR, you're spending too long on calculator-heavy questions, which eats into your overall pace. In VR, you occasionally re-read longer stems, especially in the most information-dense questions. In DM, you slow down when you're unsure, particularly on harder logic questions, which affects your rhythm. In SJT, your performance is relatively steady and doesn't need urgent attention right now.";

const reportFeedbackShort =
  "Your overall accuracy is solid, but timing is your biggest limiter. Focus on pacing in VR and DM, and reduce overthinking on harder logic questions.";

const reportFeedbackFull =
  "Your overall accuracy is solid, but timing is your biggest limiter. Focus on pacing in VR and DM, and reduce overthinking on harder logic questions. Keep building consistency in SJT with a clear approach. Your strongest gains will come from short timed practice, reviewing changed answers, and tracking whether your speed improves without accuracy dropping.";

type ReportIssueGroup = {
  title: string;
  icon: typeof AlertTriangle;
  iconClass: string;
  count: number;
  items: Array<[string, string]>;
};

function getFirstName(user: User | null, profile: PhloemProfile | null) {
  const profileName = profile?.full_name?.trim();
  const metadataName =
    typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "";
  const fallback = user?.email?.split("@")[0] ?? "Rish";
  return (profileName || metadataName || fallback).split(" ")[0];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function MetricCard({
  label,
  value,
  delta,
  direction,
}: {
  label: string;
  value: string;
  delta: string;
  direction: "up" | "down";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-black text-slate-700">{label}</p>
      <div className="mt-2 flex items-end gap-3">
        <span className="text-3xl font-black leading-none text-[#0b1143]">
          {value}
        </span>
        <span className="text-sm font-black text-emerald-500">
          {direction === "up" ? "↑" : "↓"} {delta}
        </span>
      </div>
      <p className="mt-2 text-xs font-bold text-slate-400">vs last 7 days</p>
    </div>
  );
}

function ExpandableText({
  shortText,
  fullText,
  className,
  buttonClassName = "mt-3 text-sm font-black text-blue-600 hover:text-blue-700",
}: {
  shortText: string;
  fullText: string;
  className: string;
  buttonClassName?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = shortText !== fullText;

  return (
    <div>
      <p className={className}>{expanded ? fullText : shortText}</p>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className={buttonClassName}
        >
          {expanded ? "Show less" : "Show more..."}
        </button>
      )}
    </div>
  );
}

function sectionStyle(code: string) {
  return (
    sectionScores.find((section) => section.code === code) ?? {
      code,
      score: 0,
      badgeClass: "bg-slate-100 text-slate-600",
      barClass: "bg-slate-400",
    }
  );
}

function getPointTotal(point: MockPerformanceSeries["points"][number]) {
  return point.correct + point.incorrect;
}

function getPointAccuracy(point: MockPerformanceSeries["points"][number]) {
  const total = getPointTotal(point);
  return total > 0 ? Math.round((point.correct / total) * 100) : 0;
}

function getMockPeriodPoints(
  points: MockPerformanceSeries["points"],
  period: MockHistoryPeriod
) {
  const countByPeriod: Record<MockHistoryPeriod, number> = {
    "7D": 3,
    "30D": 6,
    "90D": 9,
    "All time": points.length,
  };
  return points.slice(-countByPeriod[period]);
}

function getMockPeriodLabel(period: MockHistoryPeriod) {
  return period === "All time" ? "all time" : `last ${period}`;
}

function MockPerformanceChart({ series }: { series: MockPerformanceSeries }) {
  const width = 560;
  const height = 260;
  const left = 58;
  const right = 24;
  const top = 26;
  const bottom = 54;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const scaleRange = Math.max(1, series.scaleMax - series.scaleMin);
  const valueToY = (value: number) =>
    top + chartHeight - ((value - series.scaleMin) / scaleRange) * chartHeight;
  const barSlot = chartWidth / series.points.length;
  const barWidth = Math.min(46, barSlot * 0.46);
  const getBarFill = (score: number) => {
    const ratio = (score - series.scaleMin) / scaleRange;
    if (ratio >= 0.72) return "#16a34a";
    if (ratio >= 0.58) return "#22c55e";
    if (ratio >= 0.44) return "#84cc16";
    return "#a3e635";
  };

  return (
    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 px-3 pb-3 pt-2">
      <svg
        className="h-64 w-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`${series.title} scaled score chart`}
      >
        <text
          x="14"
          y={top + chartHeight / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="900"
          fill="#0b1143"
          transform={`rotate(-90 14 ${top + chartHeight / 2})`}
        >
          Scaled score
        </text>
        {series.ticks.map((tick) => {
          const y = valueToY(tick);
          return (
            <g key={tick}>
              <line
                x1={left}
                y1={y}
                x2={left + chartWidth}
                y2={y}
                stroke="#e5ebf3"
                strokeDasharray="4 4"
              />
              <text
                x={left - 12}
                y={y + 4}
                textAnchor="end"
                fontSize="12"
                fontWeight="800"
                fill="#64748b"
              >
                {tick}
              </text>
            </g>
          );
        })}
        <line x1={left} y1={top} x2={left} y2={top + chartHeight} stroke="#dbe4f0" />
        <line
          x1={left}
          y1={top + chartHeight}
          x2={left + chartWidth}
          y2={top + chartHeight}
          stroke="#dbe4f0"
        />
        {series.points.map((point, index) => {
          const x = left + index * barSlot + (barSlot - barWidth) / 2;
          const total = getPointTotal(point);
          const y = valueToY(point.scaled);
          const barHeight = top + chartHeight - y;
          return (
            <g key={point.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="8"
                fill={getBarFill(point.scaled)}
              />
              <text
                x={x + barWidth / 2}
                y={y - 10}
                textAnchor="middle"
                fontSize="13"
                fontWeight="900"
                fill="#0b1143"
              >
                {point.scaled}
              </text>
              <text
                x={x + barWidth / 2}
                y={top + chartHeight + 26}
                textAnchor="middle"
                fontSize="12"
                fontWeight="800"
                fill="#64748b"
              >
                {point.label.replace(" ", "\u00a0")}
              </text>
              <text
                x={x + barWidth / 2}
                y={top + chartHeight + 42}
                textAnchor="middle"
                fontSize="11"
                fontWeight="800"
                fill="#94a3b8"
              >
                {point.correct}/{total}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-black text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-[#22c55e]" />
          Scaled score
        </span>
      </div>
    </div>
  );
}

function DailyQuestionsChart() {
  const recentDays = questionCalendarDays.slice(3, 10);
  const average = Math.round(
    recentDays.reduce((sum, item) => sum + item.questions, 0) /
      recentDays.length
  );
  const daysOnTarget = recentDays.filter(
    (item) => item.questions >= dailyQuestionTarget
  ).length;
  const startOffset = 4;
  const blanks = Array.from({ length: startOffset }, (_, index) => index);
  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const getHeatClass = (questions: number) => {
    if (questions <= 0) return "bg-slate-100 text-slate-400 border-slate-100";
    if (questions < 100) return "bg-emerald-100 text-emerald-700 border-emerald-100";
    if (questions < 160) return "bg-emerald-200 text-emerald-800 border-emerald-200";
    if (questions < dailyQuestionTarget)
      return "bg-emerald-400 text-white border-emerald-400";
    if (questions < 240) return "bg-emerald-600 text-white border-emerald-600";
    return "bg-emerald-800 text-white border-emerald-800";
  };

  return (
    <section className="self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Questions done
            </h2>
            <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
          </div>
          <p className="mt-1 text-xs font-bold text-slate-500">
            May 2026
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
          {dailyQuestionTarget}/day target
        </span>
      </div>
      <div className="mt-4 grid gap-5 md:grid-cols-[340px_116px] md:items-start">
        <div className="max-w-[340px]">
          <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-black text-slate-500">
            {weekdays.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1.5">
            {blanks.map((blank) => (
              <div key={blank} className="aspect-square" />
            ))}
            {questionCalendarDays.map((item) => (
              <div key={item.day} className="group relative">
                <div
                  title={`${item.questions}/${dailyQuestionTarget} questions`}
                  aria-label={`May ${item.day}: ${item.questions} of ${dailyQuestionTarget} questions`}
                  className={`flex aspect-square min-h-8 items-center justify-center rounded-lg border text-xs font-black transition-transform hover:-translate-y-0.5 ${getHeatClass(
                    item.questions
                  )}`}
                >
                  {item.day}
                </div>
                <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-950 px-2 py-1 text-[11px] font-black text-white shadow-lg group-hover:block">
                  {item.questions}/{dailyQuestionTarget} questions
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 md:block md:space-y-3">
          <div>
            <p className="text-xs font-bold text-slate-400">7-day average</p>
            <p className="mt-1 text-xl font-black text-[#0b1143]">
              {average}/day
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">On target</p>
            <p className="mt-1 text-xl font-black text-emerald-700">
              {daysOnTarget}/7
            </p>
          </div>
          <div className="col-span-2 flex items-center gap-1.5 md:pt-1">
            {[0, 80, 130, 180, 220].map((questions) => (
              <span
                key={questions}
                className={`h-3 w-5 rounded ${getHeatClass(questions)
                  .split(" ")
                  .slice(0, 1)
                  .join(" ")}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ApproachBand({
  title,
  steps = approachSteps,
}: {
  title: string;
  steps?: typeof approachSteps;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-black uppercase tracking-wide">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.title} className="relative flex gap-3 md:block">
              <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${step.iconClass}`}
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <div className="md:mt-2">
                <h3 className="text-sm font-black text-blue-600">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                  {step.text}
                </p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight
                  className="absolute right-3 top-5 hidden h-5 w-5 text-slate-400 md:block"
                  aria-hidden="true"
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReportInsightCard({ group }: { group: ReportIssueGroup }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = group.icon;
  const visibleItems = expanded ? group.items : group.items.slice(0, 2);
  const canExpand = group.items.length > 2;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${group.iconClass}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-sm font-black">{group.title}</h2>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-black text-blue-600">
          {group.count}
        </span>
      </div>
      <ul className="mt-5 space-y-4">
        {visibleItems.map(([title, text]) => (
          <li key={title} className="text-sm">
            <p className="font-black">{title}</p>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              {text}
            </p>
          </li>
        ))}
      </ul>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="mt-5 text-sm font-black text-blue-600 hover:text-blue-700"
        >
          {expanded ? "Show less" : "Show more..."}
        </button>
      )}
    </section>
  );
}

function DiagnosticContent({
  isPremium,
  checkoutLoading,
  onUpgrade,
}: PremiumGateProps) {
  const diagnosticHistory = [
    {
      code: "SJT",
      date: "May 12, 2025",
      age: "2 days ago",
      issue: "Consistency is your biggest opportunity",
      section: "Situational Judgement",
      score: "61%",
    },
    {
      code: "DM",
      date: "May 5, 2025",
      age: "1 week ago",
      issue: "Hesitation reduces your accuracy",
      section: "Decision Making",
      score: "64%",
    },
    {
      code: "VR",
      date: "Apr 28, 2025",
      age: "2 weeks ago",
      issue: "Speeding impacts accuracy",
      section: "Verbal Reasoning",
      score: "62%",
    },
    {
      code: "QR",
      date: "Apr 21, 2025",
      age: "3 weeks ago",
      issue: "Multi-step data handling needs work",
      section: "Quantitative Reasoning",
      score: "63%",
    },
  ];

  const timingPrompts = [
    ["Best before starting a study session", "Know where to focus your time.", Clock3],
    ["After a few practice sets", "Track what's improving and what's not.", BarChart3],
    ["When your score plateaus", "Find hidden gaps holding you back.", Activity],
    ["Before a mock exam", "Check your readiness and key risks.", Target],
  ] as const;

  const premiumDiagnostics = [
    {
      title: "Daily free diagnostic",
      text: "Premium users get one adaptive check-in every day at no extra cost.",
      meta: "Included with Premium - AI feedback - trend tracking",
      icon: Sparkles,
      iconClass: "bg-amber-50 text-amber-600",
      href: "/phloemai/question-bank",
      cta: "Start daily diagnostic",
    },
    {
      title: "Section deep-dive",
      text: "Run a focused diagnostic on the section most likely to move your score.",
      meta: "VR, DM, QR or SJT - targeted fixes",
      icon: Target,
      iconClass: "bg-indigo-50 text-blue-600",
      href: "/phloemai/question-bank",
      cta: "Choose section",
    },
  ] as const;

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
              <Activity className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                Free diagnostic
              </h2>
              <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-slate-600">
                Answer 10 adaptive questions across the UCAT sections and get a
                clear first read on what is holding your score back.
              </p>
            </div>
          </div>
          <Link
            href="/phloemai/question-bank"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-8 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Start free diagnostic
          </Link>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Free", "10 questions", "Timed", "AI feedback"].map((item) => (
              <span
                key={item}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-black text-slate-600"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Latest diagnostic
            </h2>
            <span className="text-xs font-black text-slate-400">2 days ago</span>
          </div>
          <div className="mt-7 flex gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-pink-100 text-base font-black text-pink-600">
              SJT
            </div>
            <div>
              <p className="text-sm font-black">Main finding</p>
              <h3 className="mt-2 text-base font-black">
                Consistency is your biggest opportunity
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Your timing and consistency in SJT are holding your overall
                score back.
              </p>
            </div>
          </div>
          <Link
            href="/phloemai/report"
            className="mt-7 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            Expanded report
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Premium diagnostics
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Premium includes a fresh diagnostic every day, plus deeper checks
              when you want to isolate a section.
            </p>
          </div>
          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
              isPremium
                ? "bg-emerald-50 text-emerald-600"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {isPremium ? "Daily diagnostic available" : "Premium unlock"}
          </span>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {premiumDiagnostics.map((diagnostic) => {
            const Icon = diagnostic.icon;
            return (
              <div
                key={diagnostic.title}
                className={`rounded-xl border p-4 ${
                  isPremium
                    ? "border-slate-200 bg-white"
                    : "border-amber-200 bg-amber-50/40"
                }`}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${diagnostic.iconClass}`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">{diagnostic.title}</h3>
                    <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                      {diagnostic.text}
                    </p>
                    <p className="mt-2 text-xs font-black text-slate-400">
                      {diagnostic.meta}
                    </p>
                  </div>
                </div>
                {isPremium ? (
                  <Link
                    href={diagnostic.href}
                    className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-5 text-xs font-black text-white hover:bg-blue-700"
                  >
                    {diagnostic.cta}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => void onUpgrade()}
                    disabled={checkoutLoading}
                    className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-amber-300 bg-white px-5 text-xs font-black text-amber-700 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LockKeyhole className="h-4 w-4" aria-hidden="true" />
                    {checkoutLoading ? "Opening..." : "Upgrade to unlock"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.85fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Diagnostic history
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            {diagnosticHistory.map((item) => {
              const style = sectionStyle(item.code);
              return (
                <div
                  key={item.date}
                  className="grid gap-4 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:grid-cols-[150px_1fr_90px_72px] sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-2 text-xs font-black ${style.badgeClass}`}
                    >
                      {item.code}
                    </span>
                    <div>
                      <p className="text-sm font-black text-slate-600">
                        {item.age}
                      </p>
                      <p className="text-xs font-bold text-slate-400">
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black">{item.issue}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {item.section}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-pink-50 px-3 py-1 text-xs font-black text-pink-600">
                    {item.score}
                  </span>
                  <Link
                    href="/phloemai/report"
                    className="h-9 rounded-lg border border-slate-200 px-4 text-xs font-black text-blue-600 hover:bg-blue-50"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
          <Link
            href="/phloemai/report"
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            View all diagnostics
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            When to run a diagnostic
          </h2>
          <div className="mt-5 space-y-5">
            {timingPrompts.map(([title, text, Icon]) => (
              <div key={title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm font-black">{title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <ApproachBand
        title="How diagnostics work"
        steps={[
          approachSteps[0],
          approachSteps[1],
          approachSteps[2],
          approachSteps[3],
        ]}
      />
    </div>
  );
}

function PracticeContent() {
  const mockTests = [
    ["PhloemAI Full mocks", "Run a complete UCAT-style mock when you need a full readiness check.", Timer, "bg-blue-100 text-blue-600"],
    ["PhloemAI Mini mocks", "Short mixed tests for momentum without committing to a full paper.", BarChart3, "bg-violet-100 text-violet-600"],
    ["PhloemAI Review mocks", "Revisit marked and incorrect mock questions with feedback.", AlertTriangle, "bg-red-100 text-red-500"],
  ] as const;

  const practiceSections = [
    {
      code: "VR",
      title: "PhloemAI Verbal Reasoning",
      text: "Passage-based inference and comprehension.",
      href: "/phloemai/question-bank/vr",
      className: "bg-indigo-600 text-white",
    },
    {
      code: "DM",
      title: "PhloemAI Decision Making",
      text: "Logic, probability and argument evaluation.",
      href: "/phloemai/question-bank/dm",
      className: "bg-blue-600 text-white",
    },
    {
      code: "QR",
      title: "PhloemAI Quantitative Reasoning",
      text: "Short numerical problems and data interpretation.",
      href: "/phloemai/question-bank/qr",
      className: "bg-cyan-500 text-white",
    },
    {
      code: "SJT",
      title: "PhloemAI Situational Judgement",
      text: "Professional judgement and appropriate actions.",
      href: "/phloemai/question-bank/sjt",
      className: "bg-pink-500 text-white",
    },
  ];

  const recentPractice = [
    ["QR", "QR Speed Drill", "10 questions - Timed", "66%", "Today, 9:41 AM"],
    ["VR", "VR Timed Set", "15 questions - Timed", "72%", "Today, 8:12 AM"],
    ["DM", "DM Mini-set", "10 questions - Untimed", "80%", "Yesterday, 7:35 PM"],
    ["SJT", "SJT Mini-set", "10 questions - Untimed", "70%", "Yesterday, 6:02 PM"],
  ] as const;

  const focusQueue = [
    ["QR", "Calculator-heavy QR", "7 min drill - fix hesitation under time", "/phloemai/question-bank/qr", Timer],
    ["VR", "Author opinion passages", "10 questions - tone and viewpoint", "/phloemai/question-bank/vr", Bookmark],
    ["DM", "Syllogism accuracy", "8 questions - conclusion checking", "/phloemai/question-bank/dm", Brain],
    ["SJT", "Response ordering", "Drag-and-drop judgement practice", "/phloemai/question-bank/sjt", Activity],
  ] as const;

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Zap className="h-8 w-8" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                Recommended from your fixes
              </h2>
              <h3 className="mt-6 text-lg font-black">
                QR Speed Drill <span className="text-slate-400">- 7 min</span>
              </h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Hesitation in QR is lowering your accuracy. Short, focused
                drills build speed and confidence.
              </p>
            </div>
          </div>
          <Link
            href="/phloemai/question-bank/qr"
            className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Start task
          </Link>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Start a section
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Four clean entry points for the current UCAT sections.
            </p>
          </div>
          <Link
            href="/phloemai/question-bank"
            className="inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            Open question bank
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-4">
          {practiceSections.map((section) => (
            <Link
              key={section.code}
              href={section.href}
              className="rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <span
                className={`inline-flex rounded-lg px-3 py-1 text-sm font-black ${section.className}`}
              >
                {section.code}
              </span>
              <h3 className="mt-4 text-base font-black">{section.title}</h3>
              <p className="mt-2 min-h-12 text-xs font-bold leading-5 text-slate-500">
                {section.text}
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-black text-blue-600">
                Practice
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black uppercase tracking-wide">
          Mock tests
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Use mocks when you want exam-style timing, score pressure and review.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {mockTests.map(([title, text, Icon, iconClass]) => (
            <Link
              href="/phloemai/question-bank"
              key={title}
              className="rounded-xl border border-slate-200 p-4 text-left transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-black">{title}</h3>
              <p className="mt-2 min-h-10 text-xs font-bold leading-5 text-slate-500">
                {text}
              </p>
              <ArrowRight className="ml-auto mt-2 h-4 w-4 text-blue-600" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Targeted skill queue
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            Suggested next sets based on the patterns in your latest diagnostic.
          </p>
          <div className="mt-4 space-y-2">
            {focusQueue.map(([code, title, meta, href, Icon]) => {
              const style = sectionStyle(code);
              return (
              <div
                key={title}
                className="grid gap-4 rounded-xl border border-slate-100 px-3 py-3 sm:grid-cols-[64px_1fr_112px] sm:items-center"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-lg px-3 py-2 text-xs font-black ${style.badgeClass}`}
                  >
                    {code}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-blue-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-black">{title}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {meta}
                    </p>
                  </div>
                </div>
                <Link
                  href={href}
                  className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-blue-600 hover:bg-blue-50"
                >
                  Start
                </Link>
              </div>
            );
            })}
          </div>
          <Link
            href="/phloemai/report"
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            View fix report
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Recent practice
          </h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            {recentPractice.map(([code, title, meta, score, time]) => {
              const style = sectionStyle(code);
              return (
                <div
                  key={title}
                  className="grid gap-4 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:grid-cols-[1fr_80px_92px] sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-lg px-3 py-2 text-xs font-black ${style.badgeClass}`}
                    >
                      {code}
                    </span>
                    <div>
                      <p className="text-sm font-black">{title}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {meta}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-black">{score}</p>
                    <p className="text-xs font-bold text-slate-400">{time}</p>
                  </div>
                  <Link
                    href={`/phloemai/question-bank/${code.toLowerCase()}`}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-blue-600 hover:bg-blue-50"
                  >
                    Review
                  </Link>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            View all practice
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </section>
      </div>

      <ApproachBand
        title="Practice turns your fixes into improvement"
        steps={[approachSteps[0], approachSteps[3], approachSteps[1], approachSteps[4]]}
      />
    </div>
  );
}

function ProgressContent({
  isPremium,
  checkoutLoading,
  onUpgrade,
}: PremiumGateProps) {
  const [graphMode, setGraphMode] = useState<MockGraphMode>("mini");
  const [miniSection, setMiniSection] = useState<MiniMockSectionCode>("QR");
  const [mockPeriod, setMockPeriod] = useState<MockHistoryPeriod>("30D");
  const fixProgress = [
    ["QR timing improving", "You're answering faster with similar accuracy.", "Improving", "bg-emerald-50 text-emerald-600", Clock3],
    ["VR longer passages still slow", "Time per question is high on long passages.", "Needs work", "bg-orange-50 text-orange-600", Bookmark],
    ["DM stable", "Accuracy steady; keep focusing on pace.", "Stable", "bg-indigo-50 text-indigo-600", Brain],
    ["SJT consistent", "Solid results - maintain your approach.", "Strong", "bg-emerald-50 text-emerald-600", Sparkles],
  ] as const;

  const improvements = [
    ["Accuracy improved to 63%", "New 7-day high", "Today, 9:41 AM", BarChart3],
    ["Average time per question down to 75s", "8s faster than last 7 days", "Today, 9:20 AM", Clock3],
    ["Best VR accuracy this month", "72% in last 7 days", "Yesterday, 7:18 PM", Sparkles],
    ["Completed QR Speed Drill", "10 min drill", "Yesterday, 6:42 PM", Target],
  ] as const;

  const performanceSeries =
    graphMode === "full"
      ? fullMockPerformanceSeries
      : miniMockPerformanceSeries[miniSection];
  const periodPoints = getMockPeriodPoints(performanceSeries.points, mockPeriod);
  const visiblePerformanceSeries = {
    ...performanceSeries,
    subtitle: `${performanceSeries.subtitle} Showing ${getMockPeriodLabel(
      mockPeriod
    )}.`,
    points: periodPoints,
  };
  const firstPoint = periodPoints[0];
  const currentPoint = periodPoints[periodPoints.length - 1];
  const currentAccuracy = currentPoint ? getPointAccuracy(currentPoint) : 0;
  const currentScaled = currentPoint?.scaled ?? 0;
  const firstScaled = firstPoint?.scaled ?? 0;
  const scaledGain = currentScaled - firstScaled;
  const currentTotal = currentPoint ? getPointTotal(currentPoint) : 0;
  const bankCompleted = questionBankProgress.reduce(
    (sum, item) => sum + item.completed,
    0
  );
  const bankTotal = questionBankProgress.reduce((sum, item) => sum + item.total, 0);
  const bankPercent = Math.round((bankCompleted / bankTotal) * 100);

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard label="Accuracy" value="63%" delta="6%" direction="up" />
        <MetricCard
          label="Average time / question"
          value="75s"
          delta="8s"
          direction="down"
        />
        <MetricCard label="Tasks completed" value="18" delta="4" direction="up" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black">PhloemAI mock history</h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {visiblePerformanceSeries.subtitle}
              </p>
            </div>
            <div className="flex w-fit rounded-lg bg-slate-100 p-1">
              {(["mini", "full"] as const).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setGraphMode(mode)}
                  aria-pressed={graphMode === mode}
                  className={`h-8 min-w-[96px] whitespace-nowrap rounded-md px-4 text-xs font-black ${
                    graphMode === mode
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-blue-600"
                  }`}
                >
                  {mode === "mini" ? "Mini mocks" : "Full mocks"}
                </button>
              ))}
            </div>
          </div>

          {graphMode === "mini" && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(["VR", "DM", "QR", "SJT"] as const).map((code) => {
                const style = sectionStyle(code);
                return (
                  <button
                    type="button"
                    key={code}
                    onClick={() => setMiniSection(code)}
                    aria-pressed={miniSection === code}
                    className={`h-8 rounded-lg px-4 text-xs font-black ${
                      miniSection === code
                        ? style.badgeClass
                        : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {code}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {(["7D", "30D", "90D", "All time"] as const).map((period) => (
              <button
                type="button"
                key={period}
                onClick={() => setMockPeriod(period)}
                aria-pressed={mockPeriod === period}
                className={`h-8 rounded-lg px-4 text-xs font-black ${
                  mockPeriod === period
                    ? "bg-slate-900 text-white"
                    : "bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-black text-slate-500">Latest scaled</p>
              <p className="mt-1 text-2xl font-black text-[#0b1143]">
                {currentScaled}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-xs font-black text-emerald-700">Scaled gain</p>
              <p className="mt-1 text-2xl font-black text-emerald-700">
                {scaledGain > 0 ? "+" : ""}
                {scaledGain}
              </p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-3">
              <p className="text-xs font-black text-blue-700">Raw accuracy</p>
              <p className="mt-1 text-2xl font-black text-blue-700">
                {currentAccuracy}%
              </p>
              <p className="mt-1 text-xs font-black text-blue-500">
                {currentPoint?.correct ?? 0}/{currentTotal} correct
              </p>
            </div>
          </div>

          <div className="mt-3 text-xs font-black text-slate-400">
            {performanceSeries.scaleLabel}
          </div>
          <MockPerformanceChart series={visiblePerformanceSeries} />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black">Question bank progress</h2>
              <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
              {bankPercent}%
            </span>
          </div>
          <p className="mt-2 text-xs font-bold text-slate-500">
            {bankCompleted} of {bankTotal} questions completed
          </p>
          <div className="mt-5 space-y-3">
            {questionBankProgress.map((item) => {
              const style = sectionStyle(item.code);
              const percent = Math.round((item.completed / item.total) * 100);
              return (
                <div
                  key={item.code}
                  className="rounded-xl border border-slate-100 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-lg px-3 py-1 text-xs font-black ${style.badgeClass}`}
                      >
                        {item.code}
                      </span>
                      <div>
                        <h3 className="text-sm font-black">{item.title}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {item.focus}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-500">
                      {item.completed}/{item.total}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-[1fr_44px] items-center gap-3">
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${style.barClass}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-right text-xs font-black text-[#0b1143]">
                      {percent}%
                    </span>
                  </div>
                  <Link
                    href={item.href}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
                  >
                    Resume bank
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              );
            })}
          </div>
          <Link
            href="/phloemai/question-bank"
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            Open question bank
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ClientPremiumGate
          isPremium={isPremium}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock fix progress"
          description="Premium shows the exact fixes improving, what still needs work and the actions driving score gains."
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black">Fix progress</h2>
              <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <div className="mt-4 space-y-4">
              {fixProgress.map(([title, text, status, statusClass, Icon]) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black">{title}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">{text}</p>
                  </div>
                  <span className={`rounded-full px-4 py-1 text-xs font-black ${statusClass}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              View all fix insights
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </section>
        </ClientPremiumGate>

        <ClientPremiumGate
          isPremium={isPremium}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock improvement history"
          description="Premium keeps the full timeline of meaningful changes, timing shifts and section-level movement."
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black">Recent improvements</h2>
              <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
            </div>
            <div className="mt-4 space-y-4">
              {improvements.map(([title, text, time, Icon]) => (
                <div key={title} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-blue-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-black">{title}</h3>
                    <p className="mt-1 text-xs font-bold text-slate-500">{text}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{time}</span>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              View all activity
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </section>
        </ClientPremiumGate>
      </div>

      <ApproachBand title="The PhloemAI approach" />
    </div>
  );
}

function ReportContent({
  isPremium,
  checkoutLoading,
  onUpgrade,
}: PremiumGateProps) {
  const issueGroups: ReportIssueGroup[] = [
    {
      title: "Major issues",
      icon: AlertTriangle,
      iconClass: "bg-red-50 text-red-500",
      count: 3,
      items: [
        ["Hesitation in VR and DM is impacting accuracy.", "You're spending too long on average, especially on longer passages."],
        ["Overthinking harder logic questions.", "You're second-guessing and changing answers."],
        ["Inconsistent performance in SJT.", "Approach to situational judgement lacks a clear framework."],
      ],
    },
    {
      title: "Minor issues",
      icon: Clock3,
      iconClass: "bg-orange-50 text-orange-500",
      count: 3,
      items: [
        ["Occasional timing spikes in QR.", "A few questions exceed the ideal time window."],
        ["Careless errors in straightforward DM.", "Check for small arithmetic or interpretation slips."],
        ["Passage scanning in VR needs more focus.", "Important details can be missed when skimming."],
      ],
    },
    {
      title: "Strengths",
      icon: CheckCircle,
      iconClass: "bg-emerald-50 text-emerald-600",
      count: 3,
      items: [
        ["Solid accuracy in QR.", "You're consistently answering QR questions correctly."],
        ["Good overall decision making.", "Changed answers often improve your score."],
        ["Steady improvement over the last 7 days.", "Accuracy is up and time per question is down."],
      ],
    },
    {
      title: "Fixes",
      icon: Wrench,
      iconClass: "bg-indigo-50 text-indigo-600",
      count: 4,
      items: [
        ["Improve VR pacing on long passages.", "Prioritise structure and main points."],
        ["Use a 2-pass process for DM.", "First pass to solve, second pass to verify."],
        ["Build a SJT decision framework.", "Practice identifying the best and worst options."],
        ["Reduce overthinking in hard logic.", "Set a time cap and move on."],
      ],
    },
  ];

  const reviewRows = [
    ["Slow questions", "16 questions", "> 90s spent"],
    ["Changed answers", "12 questions", "8 improved"],
    ["Marked for review", "9 questions", "Marked during test"],
    ["Long-passage VR behaviour", "5 passages", "Low accuracy"],
  ];

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_220px_220px] md:items-center">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
              <Bookmark className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-black">Latest diagnostic</h2>
              <p className="mt-1 text-xs font-bold text-slate-500">
                Completed 2 days ago - 7 May 2025, 9:15 AM
              </p>
            </div>
          </div>
          <MetricCard label="Overall accuracy" value="63%" delta="6%" direction="up" />
          <MetricCard
            label="Avg. time / question"
            value="75s"
            delta="8s"
            direction="down"
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {["All", "QR", "VR", "DM", "SJT"].map((filter, index) => (
          <button
            type="button"
            key={filter}
            className={`h-8 rounded-full px-8 text-xs font-black ${
              index === 0
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <ClientPremiumGate
        isPremium={isPremium}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        title="Unlock the full diagnostic report"
        description="Premium reveals the full issues, strengths and fix map without rendering the report content for free accounts."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {issueGroups.map((group) => (
            <ReportInsightCard key={group.title} group={group} />
          ))}
        </div>
      </ClientPremiumGate>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide text-blue-600">
            Phloem personalised feedback
          </h2>
          <ExpandableText
            shortText={reportFeedbackShort}
            fullText={reportFeedbackFull}
            className="mt-5 text-sm font-semibold leading-7 text-slate-600"
            buttonClassName="mt-5 text-sm font-black text-blue-600 hover:text-blue-700"
          />
        </section>

        <ClientPremiumGate
          isPremium={isPremium}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock question review"
          description="Premium shows slow questions, changed answers and marked-review patterns after each diagnostic."
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Question review
            </h2>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
              {reviewRows.map(([title, count, note]) => (
                <div
                  key={title}
                  className="grid gap-3 border-b border-slate-100 px-4 py-3 last:border-b-0 sm:grid-cols-[1fr_130px_150px_70px] sm:items-center"
                >
                  <p className="text-sm font-black">{title}</p>
                  <p className="text-xs font-bold text-slate-500">{count}</p>
                  <p className="text-xs font-bold text-slate-500">{note}</p>
                  <button
                    type="button"
                    className="text-xs font-black text-blue-600 hover:text-blue-700"
                  >
                    Review
                  </button>
                </div>
              ))}
            </div>
          </section>
        </ClientPremiumGate>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-black">
            Ready to improve?{" "}
            <span className="font-semibold text-slate-600">
              Start a recommended task based on your report.
            </span>
          </p>
        </div>
        <Link
          href="/phloemai/practice"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-black text-white hover:bg-blue-700"
        >
          Start recommended task
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}

function AccountContent({
  firstName,
  plan,
  email,
  checkoutLoading,
  onUpgrade,
  onLogout,
}: {
  firstName: string;
  plan: string;
  email: string;
  checkoutLoading: boolean;
  onUpgrade: () => void;
  onLogout: () => void;
}) {
  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-blue-600">
              Account settings
            </p>
            <h2 className="mt-2 text-2xl font-black">{firstName}</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">{email}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-5 text-sm font-black text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Subscription
          </h2>
          <div className="mt-5 rounded-xl bg-indigo-50 p-5">
            <p className="text-sm font-semibold text-slate-500">Current plan</p>
            <p className="mt-2 text-3xl font-black">{plan}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              Premium unlocks unlimited AI insight cards and deeper personalised
              recommendations.
            </p>
          </div>
          <button
            type="button"
            onClick={onUpgrade}
            disabled={checkoutLoading}
            className="mt-5 h-11 rounded-lg bg-blue-600 px-6 text-sm font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {plan === "Premium"
              ? "Manage subscription"
              : checkoutLoading
                ? "Opening..."
                : "Upgrade to Premium"}
          </button>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Profile
          </h2>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Display name
              </span>
              <input
                value={firstName}
                readOnly
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700"
              />
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Email
              </span>
              <input
                value={email}
                readOnly
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700"
              />
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}

function DashboardSubpageContent({
  view,
  firstName,
  plan,
  email,
  isPremium,
  checkoutLoading,
  onUpgrade,
  onLogout,
}: {
  view: Exclude<DashboardView, "dashboard">;
  firstName: string;
  plan: string;
  email: string;
  isPremium: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void;
  onLogout: () => void;
}) {
  if (view === "diagnostic") {
    return (
      <DiagnosticContent
        isPremium={isPremium}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
      />
    );
  }
  if (view === "practice") return <PracticeContent />;
  if (view === "progress") {
    return (
      <ProgressContent
        isPremium={isPremium}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
      />
    );
  }
  if (view === "account") {
    return (
      <AccountContent
        firstName={firstName}
        plan={plan}
        email={email}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        onLogout={onLogout}
      />
    );
  }
  return (
    <ReportContent
      isPremium={isPremium}
      checkoutLoading={checkoutLoading}
      onUpgrade={onUpgrade}
    />
  );
}

function AuthPanel({
  mode,
  setMode,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  submitting,
  message,
  error,
  onSubmit,
}: {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  submitting: boolean;
  message: string | null;
  error: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="min-h-screen bg-[#f8fbff] px-5 py-10 text-[#0b1143]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Brain className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-2xl font-black">
                Phloem<span className="text-blue-600">AI</span>
              </p>
              <p className="text-sm font-bold text-slate-500">UCAT Tutor</p>
            </div>
          </div>

          <h1 className="mt-10 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
            Create your account to open the UCAT dashboard.
          </h1>
          <p className="mt-4 max-w-xl text-base font-medium leading-7 text-slate-600">
            Your account stores diagnostics, AI feedback, fix tasks and progress
            snapshots securely in Supabase.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["Diagnose", "Start with a timed UCAT snapshot."],
              ["Feedback", "See what is holding you back."],
              ["Fix", "Turn diagnosis into tasks."],
            ].map(([title, text]) => (
              <div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-sm font-black text-blue-600">{title}</p>
                <p className="mt-1 text-xs font-medium leading-5 text-slate-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1">
            {(["signup", "login"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`h-10 rounded-lg text-sm font-black transition-colors ${
                  mode === tab
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab === "signup" ? "Create Account" : "Log In"}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            {mode === "signup" && (
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                  Full name
                </span>
                <input
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500"
                  placeholder="Rish"
                  required
                />
              </label>
            )}

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-slate-500">
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-900 outline-none transition-colors focus:border-blue-500"
                placeholder="At least 8 characters"
                minLength={8}
                required
              />
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {submitting
                ? "Working..."
                : mode === "signup"
                  ? "Create Account"
                  : "Log In"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MissingSupabaseConfig() {
  return (
    <div className="min-h-screen bg-[#f8fbff] px-5 py-10 text-[#0b1143]">
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <LockKeyhole className="h-6 w-6" aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-2xl font-black">
          Add your Supabase keys to enable account creation.
        </h1>
        <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
          Add these to `.env.local`, then restart the dev server:
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs font-bold leading-6 text-slate-100">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`}
        </pre>
      </div>
    </div>
  );
}

function UCATDashboard({ view = "dashboard" }: { view?: DashboardView }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<PhloemProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );
  const pageMeta = dashboardPageMeta[view];

  useEffect(() => {
    function resetCheckoutState() {
      setCheckoutLoading(false);
    }

    function resetWhenVisible() {
      if (document.visibilityState === "visible") {
        resetCheckoutState();
      }
    }

    window.addEventListener("pageshow", resetCheckoutState);
    window.addEventListener("focus", resetCheckoutState);
    document.addEventListener("visibilitychange", resetWhenVisible);

    return () => {
      window.removeEventListener("pageshow", resetCheckoutState);
      window.removeEventListener("focus", resetCheckoutState);
      document.removeEventListener("visibilitychange", resetWhenVisible);
    };
  }, []);

  useEffect(() => {
    if (!supabase) {
      const stopLoading = window.setTimeout(() => setLoading(false), 0);
      return () => window.clearTimeout(stopLoading);
    }

    const supabaseClient = supabase;
    let mounted = true;

    async function loadProfile(nextUser: User) {
      const { data } = await supabaseClient
        .from("profiles")
        .select("full_name,current_plan")
        .eq("id", nextUser.id)
        .maybeSingle();

      if (mounted) {
        setProfile((data as PhloemProfile | null) ?? null);
      }
    }

    async function syncCheckoutIfNeeded(nextUser: User) {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get("session_id");

      if (params.get("checkout") !== "success" || !sessionId) return;

      try {
        const response = await fetch("/api/stripe/sync-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = (await response.json()) as { error?: string };

        if (!response.ok) {
          throw new Error(data.error ?? "Could not sync checkout.");
        }

        await loadProfile(nextUser);
        window.history.replaceState(null, "", window.location.pathname);
      } catch (error) {
        if (mounted) {
          setCheckoutError(
            error instanceof Error
              ? `Payment succeeded, but plan sync failed: ${error.message}`
              : "Payment succeeded, but plan sync failed."
          );
        }
      }
    }

    async function loadSession() {
      const {
        data: { session: currentSession },
      } = await supabaseClient.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await loadProfile(currentSession.user);
        await syncCheckoutIfNeeded(currentSession.user);
      } else {
        setProfile(null);
      }

      setLoading(false);
    }

    void loadSession();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);

      if (nextSession?.user) {
        void loadProfile(nextSession.user);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleAuthSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;

    setSubmitting(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (authMode === "signup") {
        const trimmedName = fullName.trim();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: trimmedName },
            emailRedirectTo: `${window.location.origin}/phloemai/dashboard`,
          },
        });

        if (error) throw error;

        if (data.session) {
          setSession(data.session);
          setUser(data.user);
          setAuthMessage("Account created. Opening your dashboard...");
        } else {
          setAuthMessage("Check your email to confirm your account, then log in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setSession(data.session);
        setUser(data.user);
        setAuthMessage("Logged in.");
      }
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const handleUpgrade = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setCheckoutLoading(false), 8000);
    } catch (error) {
      setCheckoutError(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setCheckoutLoading(false);
    }
  };

  const handleSubscriptionAction = async () => {
    if (profile?.current_plan !== "premium") {
      await handleUpgrade();
      return;
    }

    setCheckoutLoading(true);
    setCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not open billing portal.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setCheckoutLoading(false), 8000);
    } catch (error) {
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Could not open billing portal."
      );
      setCheckoutLoading(false);
    }
  };

  if (!supabaseReady) {
    return <MissingSupabaseConfig />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8fbff] text-[#0b1143]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!session || !user) {
    return (
      <AuthPanel
        mode={authMode}
        setMode={setAuthMode}
        fullName={fullName}
        setFullName={setFullName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        submitting={submitting}
        message={authMessage}
        error={authError}
        onSubmit={handleAuthSubmit}
      />
    );
  }

  const firstName = getFirstName(user, profile);
  const plan = profile?.current_plan === "premium" ? "Premium" : "Free";
  const userEmail = user.email ?? "";

  return (
    <div className="phloem-dashboard-compact min-h-screen bg-[#f8fbff] text-[#0b1143]">
      <div className="grid min-h-screen lg:grid-cols-[190px_1fr]">
        <aside className="border-r border-slate-200 bg-white px-3 py-5">
          <div className="flex items-center gap-3 px-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <Brain className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xl font-black">
                Phloem<span className="text-blue-600">AI</span>
              </p>
              <p className="text-sm font-bold text-slate-500">UCAT Tutor</p>
            </div>
          </div>

          <nav className="mt-10 space-y-3">
            {[
              {
                label: "Dashboard",
                icon: Home,
                href: "/phloemai/dashboard",
                view: "dashboard",
              },
              {
                label: "Diagnostic",
                icon: Activity,
                href: "/phloemai/diagnostic",
                view: "diagnostic",
              },
              {
                label: "Practice",
                icon: Target,
                href: "/phloemai/practice",
                view: "practice",
              },
              {
                label: "Progress",
                icon: BarChart3,
                href: "/phloemai/progress",
                view: "progress",
              },
              {
                label: "Report",
                icon: Bookmark,
                href: "/phloemai/report",
                view: "report",
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.view === view;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-black transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-blue-600 shadow-sm"
                      : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-blue-600">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-sm font-black">
              Unlock unlimited AI insights
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Go Premium for deeper analytics and personalised recommendations.
            </p>
            <button
              type="button"
              onClick={handleSubscriptionAction}
              disabled={checkoutLoading}
              className="mt-5 h-10 w-full rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700"
            >
              {checkoutLoading
                ? "Opening..."
                : plan === "Premium"
                  ? "Manage Billing"
                  : "Upgrade Now"}
            </button>
            {checkoutError && (
              <p className="mt-3 text-xs font-bold leading-5 text-red-600">
                {checkoutError}
              </p>
            )}
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Current plan</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm font-black">{plan}</span>
              <button
                type="button"
                onClick={handleSubscriptionAction}
                className="text-sm font-black text-blue-600 hover:text-blue-700"
              >
                {plan === "Premium" ? "Manage" : "View plans"}
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div>
              <h1 className="text-2xl font-black">
                {view === "dashboard"
                  ? `${getGreeting()}, ${firstName}`
                  : pageMeta.title}
              </h1>
              <p className="mt-2 text-sm font-medium text-slate-500">
                {pageMeta.subtitle}
              </p>
            </div>
            <div className="flex items-center gap-5">
              <button
                type="button"
                aria-label="Notifications"
                className="rounded-lg p-2 text-slate-700 transition-colors hover:bg-slate-100 hover:text-blue-600"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
              </button>
              <div className="h-8 w-px bg-slate-200" />
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((current) => !current)}
                  className="flex items-center gap-3 rounded-xl px-2 py-1 transition-colors hover:bg-slate-50"
                  aria-expanded={accountMenuOpen}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-black text-blue-600">
                    {firstName.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden text-sm font-black sm:inline">
                    {firstName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="px-3 py-2">
                      <p className="text-sm font-black">{firstName}</p>
                      <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                        {userEmail}
                      </p>
                    </div>
                    <Link
                      href="/phloemai/account"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      Account settings
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        void handleSubscriptionAction();
                      }}
                      className="w-full rounded-lg px-3 py-2 text-left text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      {plan === "Premium"
                        ? "Manage subscription"
                        : "Upgrade subscription"}
                    </button>
                    <Link
                      href="/phloemai/question-bank"
                      onClick={() => setAccountMenuOpen(false)}
                      className="block rounded-lg px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                    >
                      Open question bank
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        void handleLogout();
                      }}
                      className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-black text-red-600 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-red-600"
                aria-label="Log out"
              >
                <LogOut className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </header>

          {view === "dashboard" ? (
          <div className="grid gap-5 px-6 py-5 lg:grid-cols-[1.1fr_1fr] lg:px-8">
            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-black uppercase tracking-wider text-blue-600">
                  Phloem personalised feedback
                </p>
                <Link
                  href="/phloemai/report"
                  className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
                >
                  Expanded report
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <p className="mt-3 text-sm font-bold text-slate-600">
                Based on your latest diagnostic (2 days ago)
              </p>
              <ExpandableText
                shortText={dashboardFeedbackShort}
                fullText={dashboardFeedbackFull}
                className="mt-4 text-sm font-semibold leading-7 text-[#12184d]"
              />

              <div className="mt-6">
                <h2 className="text-sm font-black">Section observations</h2>
                <div className="mt-3 space-y-3 text-sm font-semibold text-[#12184d]">
                  {[
                    ["QR", "Accuracy is solid, but timing is your biggest limiter."],
                    ["VR", "Good overall accuracy, but longer passages slow you down."],
                    [
                      "DM",
                      "Performance is stable, though hesitation affects pace on harder logic questions.",
                    ],
                    [
                      "SJT",
                      "Consistent performance and not a priority weakness right now.",
                    ],
                  ].map(([code, text]) => {
                    const match = sectionScores.find((item) => item.code === code);
                    return (
                      <div key={code} className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 rounded px-2 py-0.5 text-xs font-black ${
                            match?.badgeClass ?? "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {code}
                        </span>
                        <span className="text-slate-400">-</span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-wide">
                  Progress snapshot
                </h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <MetricCard
                  label="Accuracy"
                  value="63%"
                  delta="6%"
                  direction="up"
                />
                <MetricCard
                  label="Avg. time / question"
                  value="75s"
                  delta="8s"
                  direction="down"
                />
              </div>

              <h3 className="mt-7 text-sm font-black">Section overview</h3>
              <div className="mt-4 space-y-4">
                {sectionScores.map((section) => (
                  <div
                    key={section.code}
                    className="grid grid-cols-[44px_1fr_42px] items-center gap-4"
                  >
                    <span
                      className={`rounded px-2 py-0.5 text-center text-xs font-black ${section.badgeClass}`}
                    >
                      {section.code}
                    </span>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${section.barClass}`}
                        style={{ width: `${section.score}%` }}
                      />
                    </div>
                    <span className="text-right text-sm font-black">
                      {section.score}%
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-wide">
                Tasks from your fixes
              </h2>
              <div className="mt-4 space-y-3">
                {fixTasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <div key={task.title} className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${task.iconClass}`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-black">{task.title}</h3>
                        <p className="mt-1 text-xs font-bold text-slate-500">
                          {task.meta}
                        </p>
                      </div>
                      <Link
                        href="/phloemai/question-bank/qr"
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-5 text-sm font-black text-amber-700 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.18)] transition-colors hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800"
                      >
                        Start
                      </Link>
                    </div>
                  );
                })}
              </div>
              <Link
                href="/phloemai/practice"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-amber-700 hover:text-amber-800"
              >
                View all tasks
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>

            <DailyQuestionsChart />

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-sm font-black uppercase tracking-wide">
                The PhloemAI approach
              </h2>
              <div className="mt-5 grid gap-4 md:grid-cols-5">
                {approachSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="relative flex gap-3 md:block">
                      <div
                        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${step.iconClass}`}
                      >
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </div>
                      <div className="md:mt-2">
                        <h3 className="text-sm font-black text-blue-600">
                          {step.title}
                        </h3>
                        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                          {step.text}
                        </p>
                      </div>
                      {index < approachSteps.length - 1 && (
                        <ArrowRight
                          className="absolute right-3 top-5 hidden h-5 w-5 text-slate-400 md:block"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
          ) : (
            <DashboardSubpageContent
              view={view}
              firstName={firstName}
              plan={plan}
              email={userEmail}
              isPremium={plan === "Premium"}
              checkoutLoading={checkoutLoading}
              onUpgrade={handleSubscriptionAction}
              onLogout={handleLogout}
            />
          )}
        </main>
      </div>
    </div>
  );
}

// ── How It Works Panel ────────────────────────────────────────────────────────

function HowItWorksPanel({
  title,
  accent,
  children,
}: {
  title: string;
  accent: "blue" | "violet";
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const dotColor = accent === "blue" ? "bg-blue-600" : "bg-violet-500";
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor}`} />
          <span className="font-semibold text-slate-900 text-sm">{title}</span>
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Landing Hero ──────────────────────────────────────────────────────────────

function RedesignedTutorHero() {
  const featureCards = [
    {
      title: "Timing patterns",
      text: "See where you spent too long, and how it affected your accuracy.",
      icon: Timer,
      iconWrap: "bg-blue-50 text-blue-600",
    },
    {
      title: "Attention tracking",
      text: "Understand where you focused most, skipped key text, or over-checked answers.",
      icon: Eye,
      iconWrap: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "AI mistake diagnosis",
      text: "PhloemAI explains the habit behind the miss, not just the right answer.",
      icon: Brain,
      iconWrap: "bg-violet-50 text-violet-600",
    },
    {
      title: "Personalised next step",
      text: "Get a focused recommendation for what to fix in the next question set.",
      icon: Target,
      iconWrap: "bg-orange-50 text-orange-600",
    },
  ];

  const freeFeatures = [
    "10-minute UCAT diagnostic",
    "Basic timing and accuracy feedback",
    "One AI diagnosis summary",
    "Attention demo access",
  ];

  const productCards = [
    {
      title: "UCAT",
      status: "Available Now",
      text: "Full-length practice, AI diagnosis, attention tracking, and personalised coaching.",
      icon: Brain,
      action: "Launch UCAT Tutor",
      href: "/phloemai/dashboard",
      active: true,
    },
    {
      title: "Medicine Interview",
      status: "Coming Soon",
      text: "Realistic MMI and panel preparation with answer feedback.",
      icon: UserRound,
      action: "Notify Me",
      active: false,
    },
    {
      title: "Dentistry Interview",
      status: "Coming Soon",
      text: "Dentistry-specific interview practice with confidence scoring.",
      icon: BadgeCheck,
      action: "Notify Me",
      active: false,
    },
  ];

  return (
    <div className="bg-white">
      <section className="bg-[#050b1f] text-white">
        <div className="mx-auto max-w-5xl px-5 pt-4 pb-4 lg:px-6 lg:pt-5">
          <div className="grid items-center gap-6 lg:grid-cols-[0.9fr_0.72fr]">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                <Activity className="h-3 w-3" aria-hidden="true" />
                AI Medical Admissions Tutor
              </div>

              <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[0.95] text-white sm:text-5xl">
                Meet <span className="text-blue-500">Phloem</span>
              </h1>

              <p className="mt-3 max-w-lg text-lg font-bold leading-tight text-white sm:text-xl">
                The AI tutor that shows why you lose marks.
              </p>

              <p className="mt-3 max-w-lg text-xs leading-5 text-slate-200">
                PhloemAI analyses your timing, confidence, attention patterns,
                answer changes and optional eye + mouse tracking to diagnose
                mistakes and recommend exactly what to fix next.
              </p>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/phloemai/dashboard"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-500"
                >
                  Launch UCAT Tutor
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/phloemai/dashboard"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-400/45 bg-blue-500/10 px-4 text-sm font-bold text-blue-100 transition-colors hover:border-blue-300 hover:bg-blue-500/20"
                >
                  <Target className="h-4 w-4" aria-hidden="true" />
                  Start Free Diagnostic
                </Link>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                (built by @medwithrish - leading medical admissions expert)
              </p>

              <div className="mt-6 grid max-w-xl gap-4 sm:grid-cols-3">
                {[
                  {
                    step: "1",
                    title: "Diagnosis",
                    text: "Complete a short timed UCAT set.",
                  },
                  {
                    step: "2",
                    title: "Feedback",
                    text: "Get your personalised AI feedback.",
                  },
                  {
                    step: "3",
                    title: "Fix",
                    text: "Follow clear next steps to fix issues with targeted practice.",
                  },
                ].map((item, index) => (
                  <div
                    key={item.step}
                    className={`flex gap-2 ${
                      index < 2 ? "sm:border-r sm:border-white/10 sm:pr-4" : ""
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-white">{item.title}</h3>
                      <p className="mt-0.5 text-[11px] leading-4 text-slate-300">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-blue-400/45 bg-slate-950/70 p-3 shadow-xl shadow-blue-950/20">
              <div className="mb-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <PhloemAILogo compact />
                  <div>
                    <h2 className="text-base font-black text-white">AI Diagnosis</h2>
                    <p className="text-[11px] text-slate-400">Based on your attempt</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-right">
                  <div className="text-[11px] font-bold text-white">UCAT Practice</div>
                  <div className="flex items-center justify-end gap-1.5 text-[10px] text-slate-300">
                    Live Analysis
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="rounded-xl border border-red-400/25 bg-red-500/8 p-2.5">
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/12 text-red-300 ring-1 ring-red-400/25">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-red-300">Major issues</h3>
                      <ul className="mt-1 space-y-0.5 text-[11px] leading-4 text-slate-100">
                        <li>Spent too long reading extra information</li>
                        <li>Slow with calculator</li>
                        <li>18s over target</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/8 p-2">
                    <div className="flex items-center gap-1.5">
                      <Eye className="h-3.5 w-3.5 shrink-0 text-cyan-200" aria-hidden="true" />
                      <h3 className="text-[11px] font-bold text-cyan-200">Minor issues</h3>
                    </div>
                    <ul className="mt-1 space-y-0.5 text-[10px] leading-3 text-slate-100">
                      <li>Read stem before question</li>
                      <li>Re-read stem despite correct answer</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/8 p-2">
                    <div className="flex items-center gap-1.5">
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-200" aria-hidden="true" />
                      <h3 className="text-[11px] font-bold text-emerald-200">Strengths</h3>
                    </div>
                    <ul className="mt-1 space-y-0.5 text-[10px] leading-3 text-slate-100">
                      <li>Triaging</li>
                      <li>Correctly identified difficult questions</li>
                    </ul>
                  </div>
                </div>

                <div className="rounded-xl border border-violet-400/25 bg-violet-500/8 p-2.5">
                  <div className="flex gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/12 text-violet-200 ring-1 ring-violet-400/25">
                      <Sparkles className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-violet-200">Fixes</h3>
                      <ul className="mt-1 space-y-0.5 text-[11px] leading-4 text-slate-100">
                        <li>Calculator speed practice</li>
                        <li>7-minute timed QR sets until 85%+</li>
                        <li>Read the question before mining the stem</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-2 text-[11px] text-slate-400">
                Based on timing, answer changes and attention behaviour.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-white/15 bg-white/6 p-2.5 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-200">
                <Goal className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white">
                  Try the 60-second attention analysis demo.
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-300">
                  See which parts of a question you focus on live, with revolutionary{" "}
                  <span className="font-bold text-cyan-200">
                    optional eye tracking or mouse tracking.
                  </span>
                </p>
              </div>
            </div>
            <Link
              href="/phloemai/ucat-demo"
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-blue-50 sm:mt-0 sm:w-auto"
            >
              Try Demo Now
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 lg:px-6">
        <h2 className="text-center text-2xl font-black text-slate-950">
          What your normal question bank misses
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${feature.iconWrap}`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-black text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-1.5 text-xs leading-5 text-slate-700">
                  {feature.text}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="text-center text-2xl font-black text-slate-950">
            Why this feels different
          </h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-600">
                <Brain className="h-4 w-4" aria-hidden="true" />
                Ordinary question banks
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-3 h-3 w-16 rounded-full bg-slate-200" />
                <div className="mb-2 h-2 w-48 rounded-full bg-slate-200" />
                <div className="h-2 w-72 max-w-full rounded-full bg-slate-200" />
                <div className="mt-4 rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-700">
                  You got it wrong. The answer is C.
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-slate-600">
                Tells you what you got wrong.
              </p>
            </div>

            <div className="rounded-xl border border-blue-500 bg-white p-5 shadow-sm shadow-blue-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-700">
                <CheckCircle className="h-4 w-4" aria-hidden="true" />
                PhloemAI
              </div>
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mb-3 flex flex-wrap gap-2">
                  {["Timing", "Attention", "Confidence", "Answer change"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-base font-semibold leading-7 text-slate-900">
                  You focused on a distractor, skipped the key stem words, and
                  changed from the correct answer near the end. There were many re-reads of the stem. You were incorrect and not confident meaning it is likely a weakness. 
                </p>
              </div>
              <p className="mt-4 text-center text-xs text-slate-700">
                Shows you why and what to fix next.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Start with a free diagnostic.
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Try PhloemAI before upgrading. No card needed.
          </p>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-blue-500 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-950">Free Diagnostic</h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                Best for trying PhloemAI
              </span>
            </div>
            <div className="mt-2 text-3xl font-black text-slate-950">GBP 0</div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {freeFeatures.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/phloemai/dashboard"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              Start Free Diagnostic
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-950">Full PhloemAI Tutor</h3>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                Coming Soon
              </span>
            </div>
            <div className="mt-3 w-fit rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
              Best for full UCAT prep
            </div>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {[
                "AI feedback after every session",
                "Major/minor issue detection",
                "Personalised fixes and drills",
                "Progress tracking over time",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled
              className="mt-5 h-10 w-full rounded-lg border border-violet-300 text-sm font-bold text-violet-700"
            >
              Join Waitlist
            </button>
          </div>
        </div>

        <div className="mt-7 text-center">
          <h2 className="text-xl font-black text-slate-950">
            Available now. More coming soon.
          </h2>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          {productCards.map((product) => {
            const Icon = product.icon;
            const content = (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        product.active
                          ? "bg-blue-50 text-blue-600"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-950">{product.title}</h3>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          product.active
                            ? "bg-blue-600 text-white"
                            : "bg-violet-50 text-violet-700"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 min-h-12 text-xs leading-5 text-slate-700">
                  {product.text}
                </p>
                <div
                  className={`mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold ${
                    product.active
                      ? "bg-blue-600 text-white"
                      : "border border-violet-300 text-violet-700"
                  }`}
                >
                  {product.action}
                  {product.active && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                </div>
              </>
            );

            return product.active && product.href ? (
              <Link
                key={product.title}
                href={product.href}
                className="rounded-xl border border-blue-500 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                {content}
              </Link>
            ) : (
              <div
                key={product.title}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                {content}
              </div>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 border-t border-slate-200 pt-5 text-xs text-slate-700 sm:grid-cols-3">
          {[
            {
              icon: LockKeyhole,
              title: "Optional tracking",
              text: "Eye + mouse tracking is optional and privacy-first.",
            },
            {
              icon: ShieldCheck,
              title: "No video stored",
              text: "Webcam data is not recorded or stored.",
            },
            {
              icon: UserRound,
              title: "You are in control",
              text: "Pause or avoid tracking whenever you want.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex gap-3">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-600" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 leading-5">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function TutorHero() {
  const showLegacyLanding = process.env.NEXT_PUBLIC_PHLOEMAI_LEGACY_LANDING === "1";
  if (!showLegacyLanding) {
    return <RedesignedTutorHero />;
  }

  return (
    <div className="flex flex-col items-center px-4 pt-8 pb-10">
      <PhloemAILogo />

      <div className="mt-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
          AI Medical Admissions Tutor
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
          Meet <span className="text-blue-600">Phloem</span>
        </h1>
      </div>

      <p className="mt-3 text-center text-slate-700 text-sm max-w-xl leading-relaxed">
        AI-powered preparation for UCAT, medicine and dentistry interviews,
        built by{" "}
        <span className="text-blue-600 font-medium">@medwithrish</span> - a
        leading Medical admissions specialist, having helped numerous students ace the UCAT and secure medicine offers like from universities such as Cambridge.
      </p>

      {/* Feature badges */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-800 shadow-sm">
          <svg className="w-3.5 h-3.5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
      Mouse + Eye Attention Analysis
        </span>
        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-800 shadow-sm">
          AI-Powered Coaching
        </span>
        <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-800 shadow-sm">
          Tutor-approved strategic guidance
        </span>
      </div>

      {/* Three subject cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {/* UCAT - active */}
        <div className="group relative rounded-2xl bg-white border-2 border-blue-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 p-5 flex flex-col">
          <div className="text-3xl mb-2 text-center">🧠</div>
          <div className="text-slate-900 font-bold text-base mb-1 text-center">UCAT</div>
          <div className="flex justify-center mb-2">
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-medium">
              Available Now
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed text-center mb-3">
            Practice questions with AI coaching and attention tracking
          </p>
          <div className="mt-auto space-y-2">
            <Link
              href="/phloemai/ucat-demo"
              className="block w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer text-center"
            >
              Try UCAT Demo →
            </Link>
            <Link
              href="/phloemai/dashboard"
              className="block w-full py-2 rounded-xl border border-slate-200 text-slate-700 text-xs hover:border-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-center"
            >
              Launch UCAT Tutor
            </Link>
          </div>
        </div>

        {/* Medicine Interview - WIP */}
        <div className="relative rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 text-center opacity-60 cursor-not-allowed select-none">
          <div className="text-3xl mb-2">🏥</div>
          <div className="text-slate-900 font-bold text-base mb-1">Medicine Interview</div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
            Work in Progress
          </span>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            MMI and panel interview preparation
          </p>
        </div>

        {/* Dentistry Interview - WIP */}
        <div className="relative rounded-2xl border-2 border-slate-200 bg-slate-50 p-5 text-center opacity-60 cursor-not-allowed select-none">
          <div className="text-3xl mb-2">🦷</div>
          <div className="text-slate-900 font-bold text-base mb-1">Dentistry Interview</div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 font-medium">
            Work in Progress
          </span>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Dentistry-specific interview preparation
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="mt-10 w-full max-w-2xl">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
          <p className="text-slate-600 text-sm mt-1">A simple loop that gets results</p>
        </div>
        <div className="space-y-3">
          <HowItWorksPanel title="UCAT Preparation" accent="blue">
            <ol className="space-y-3">
              {[
                "Practice real UCAT-style questions across Verbal Reasoning, Decision Making, Quantitative Reasoning, and Situational Judgement.",
                "AI identifies your bad habits - unfocused reading patterns, spending too long on the wrong areas, weak technique, and timing issues pinpointed by question type.",
                "AI delivers tried-and-tested strategies tailored to your specific weaknesses, so you know exactly what to change and how.",
                "Apply the fixes in your own revision and track your accuracy and speed improving over time.",
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 text-sm leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </HowItWorksPanel>

          <HowItWorksPanel title="Medicine & Dentistry Interviews" accent="violet">
            <ol className="space-y-3">
              {[
                "Practice MMI stations and panel interview questions tailored to medicine and dentistry - ethics, clinical scenarios, motivation, and more.",
                "AI analyses your answers for structure, clinical reasoning, and depth - identifying the gaps that cost applicants places.",
                "AI gives you proven frameworks and concrete improvements based on what actually works in real interviews.",
                "Refine your responses, build consistency, and walk into your interview prepared and confident.",
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 text-sm leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </HowItWorksPanel>
        </div>
      </div>

      {/* Who Is PhloemAI For? */}
      <div className="mt-6 w-full max-w-2xl">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Who Is PhloemAI For?</h2>
          <ul className="space-y-3">
            {[
              "Applicants who want 24/7 tutoring support",
              "UCAT students aiming for top scores and high-end universities",
              "Medicine applicants preparing for interviews",
              "Dentistry applicants needing structured practice",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <svg
                  className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function PhloemAIPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#EEF4FF] to-indigo-100">
      <Navbar />
      {children}
    </div>
  );
}

export function PhloemAILandingPage() {
  return (
    <PhloemAIPageShell>
      <TutorHero />
    </PhloemAIPageShell>
  );
}

export function UCATDemoPage() {
  return (
    <PhloemAIPageShell>
      <div className="min-h-[calc(100vh-49px)]">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-20">
          <Link
            href="/phloemai"
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 text-sm mb-8 transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to PhloemAI
          </Link>

          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-2">
              UCAT Demo
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              Try attention tracking
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-700">
              Start with mouse tracking for the most precise desktop signal, or
              choose the optional webcam eye-tracking experiment. Only one mode
              runs at a time.
            </p>
            <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold leading-relaxed text-amber-800">
              Eye tracking is best when at arm&apos;s length away from the
              camera, sitting still and eyes parallel to the camera.
            </p>
          </div>

          <div className="mb-8">
            <AttentionTrackingDemo />
          </div>

          <PrivacyNotice />
        </div>
      </div>
    </PhloemAIPageShell>
  );
}

export function UCATDashboardPage() {
  return <UCATDashboard view="dashboard" />;
}

export function UCATDiagnosticPage() {
  return <UCATDashboard view="diagnostic" />;
}

export function UCATPracticePage() {
  return <UCATDashboard view="practice" />;
}

export function UCATProgressPage() {
  return <UCATDashboard view="progress" />;
}

export function UCATReportPage() {
  return <UCATDashboard view="report" />;
}

export function UCATAccountPage() {
  return <UCATDashboard view="account" />;
}

export default PhloemAILandingPage;
