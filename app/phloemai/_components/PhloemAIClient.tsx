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
import { ExpandableAiFeedback } from "./ExpandableAiFeedback";
import {
  fetchUCATQuestion,
  getPassageSections,
  type QuestionData,
} from "../_lib/ucatQuestion";
import {
  UCAT_QUESTION_BANK,
  getUCATSubtypeMeta,
  type UCATQuestion,
  type UCATSection,
} from "../_lib/ucatQuestionBank";
import {
  CALIB_PHASES,
  type AttentionTrackingSnapshot,
  useAttentionTracker,
} from "../_lib/useAttentionTracker";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  Bookmark,
  Brain,
  Calculator,
  Check,
  CheckCircle,
  ChevronDown,
  ClipboardList,
  Clock3,
  Eye,
  Flag,
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
          Privacy and AI limits
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
      <div className="flex flex-wrap gap-3 text-xs font-bold">
        <Link href="/privacy-policy" className="text-blue-600 hover:underline">
          Privacy Policy
        </Link>
        <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">
          Terms and Conditions
        </Link>
        <Link href="/phloemai-disclaimer" className="text-blue-600 hover:underline">
          AI/Data Disclaimer
        </Link>
      </div>
    </div>
  );
}

// ── UCAT Dashboard (post-login placeholder) ──────────────────────────────────

type PhloemProfile = {
  full_name: string | null;
  current_plan: string | null;
  diagnostic_credits?: number | null;
  ai_diagnostic_last_used_at?: string | null;
};

type AuthMode = "signup" | "login";
type DashboardView =
  | "dashboard"
  | "diagnostic"
  | "mock-diagnostic"
  | "practice"
  | "progress"
  | "skills-trainers"
  | "report"
  | "account";

type PremiumGateProps = {
  isPremium: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void | Promise<void>;
};
type UCATSectionCode = "VR" | "DM" | "QR" | "SJT";
type PracticeAttemptRow = {
  question_id: string | null;
  section: string | null;
  answered: boolean | null;
  correct: boolean | null;
  total_seconds: number | null;
  created_at: string | null;
};
type PracticeSessionListRow = {
  id: string | null;
  section: string | null;
  source: string | null;
  total_questions: number | null;
  answered_questions: number | null;
  correct_questions: number | null;
  accuracy: number | string | null;
  summary: unknown;
  completed_at: string | null;
  created_at: string | null;
};
type PracticeStats = {
  sectionCompleted: Record<UCATSectionCode, number>;
  sectionAnswered: Record<UCATSectionCode, number>;
  sectionCorrect: Record<UCATSectionCode, number>;
  totalCompleted: number;
  totalAvailable: number;
  accuracy: number;
  avgSeconds: number;
  hasCompletedQuestions: boolean;
  questionCalendarDays: Array<{ day: number; questions: number }>;
  monthLabel: string;
};
type RecentPracticeSet = {
  id: string;
  sectionCode: UCATSectionCode;
  sectionSlug: string;
  title: string;
  completedAt: string | null;
  answeredQuestions: number;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  isIncomplete: boolean;
  href: string;
};
type DashboardProgressSnapshotView = "accuracy" | "progress";

type DashboardDiagnosticIssue = {
  label: string;
  cause?: string;
  evidence?: string[];
  fix?: string;
  studyFixes?: string[];
};

type DashboardDiagnosticTask = {
  id: string;
  label?: string;
  fix: string;
};

type DashboardDiagnostic = {
  id: string;
  section: UCATSectionCode;
  source: string | null;
  diagnosticMode: string | null;
  accuracy: number;
  issues: DashboardDiagnosticIssue[];
  strengths: string[];
  studyPlanTasks: DashboardDiagnosticTask[];
  aiFeedbackText: string | null;
  aiFeedbackStatus: string | null;
  completedAt: string | null;
};

type DiagnosticAttemptRow = {
  id: string | null;
  accuracy: number | null;
  completed_at: string | null;
  ai_feedback: string | null;
  ai_feedback_status: string | null;
  metadata: unknown;
  source: string | null;
};

function normaliseDashboardDiagnostic(
  row: DiagnosticAttemptRow,
  index: number
): DashboardDiagnostic {
  const metadata =
    row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, unknown>)
      : {};
  const summary =
    metadata.summary &&
    typeof metadata.summary === "object" &&
    !Array.isArray(metadata.summary)
      ? (metadata.summary as Record<string, unknown>)
      : null;
  const sectionRaw =
    typeof summary?.section === "string" ? summary.section.toUpperCase() : "QR";
  const section = (
    ["VR", "DM", "QR", "SJT"].includes(sectionRaw) ? sectionRaw : "QR"
  ) as UCATSectionCode;
  const insights =
    metadata.insights &&
    typeof metadata.insights === "object" &&
    !Array.isArray(metadata.insights)
      ? (metadata.insights as { issues?: unknown; strengths?: unknown })
      : { issues: [], strengths: [] };
  const issues = Array.isArray(insights.issues)
    ? (insights.issues as DashboardDiagnosticIssue[])
    : [];
  const strengths = Array.isArray(insights.strengths)
    ? (insights.strengths as string[])
    : [];
  const studyPlanTasks = Array.isArray(metadata.studyPlanTasks)
    ? (metadata.studyPlanTasks as DashboardDiagnosticTask[])
    : [];
  const aiFeedbackText =
    typeof metadata.aiFeedbackText === "string"
      ? metadata.aiFeedbackText
      : typeof row.ai_feedback === "string"
        ? row.ai_feedback
        : null;
  const aiFeedbackStatus =
    typeof row.ai_feedback_status === "string"
      ? row.ai_feedback_status
      : typeof metadata.aiFeedbackStatus === "string"
        ? metadata.aiFeedbackStatus
        : null;
  const diagnosticMode =
    typeof metadata.diagnosticMode === "string" ? metadata.diagnosticMode : null;

  return {
    id: row.id ?? row.completed_at ?? `diagnostic-${index}`,
    section,
    source: typeof row.source === "string" ? row.source : null,
    diagnosticMode,
    accuracy: typeof row.accuracy === "number" ? row.accuracy : 0,
    issues,
    strengths,
    studyPlanTasks,
    aiFeedbackText,
    aiFeedbackStatus,
    completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
  };
}

const FREE_QR_DIAGNOSTIC_SOURCE = "free_qr_diagnostic";

function isFreeQrDiagnostic(diagnostic: DashboardDiagnostic | null | undefined) {
  return (
    diagnostic?.source === FREE_QR_DIAGNOSTIC_SOURCE ||
    diagnostic?.diagnosticMode === "free-qr"
  );
}

const dashboardPageMeta: Record<
  DashboardView,
  { title: string; subtitle: string }
> = {
  dashboard: {
    title: "Dashboard",
    subtitle: "Let's keep your UCAT prep on track.",
  },
  diagnostic: {
    title: "Diagnostic Hub",
    subtitle:
      "Diagnostics identify what's holding your UCAT score back so you can focus with confidence.",
  },
  "mock-diagnostic": {
    title: "Mock Diagnostic",
    subtitle: "Choose the mock format you want to run today.",
  },
  practice: {
    title: "Practice",
    subtitle: "Target the tasks from your personalised study plan.",
  },
  progress: {
    title: "Progress",
    subtitle: "See whether your study plan is actually working.",
  },
  "skills-trainers": {
    title: "Skills Trainers",
    subtitle: "Build the calculator speed and flagging judgement that protect marks under time.",
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
    score: 0,
    badgeClass: "bg-indigo-600 text-white",
    barClass: "bg-indigo-600",
  },
  {
    code: "DM",
    score: 0,
    badgeClass: "bg-blue-600 text-white",
    barClass: "bg-blue-600",
  },
  {
    code: "QR",
    score: 0,
    badgeClass: "bg-cyan-500 text-white",
    barClass: "bg-cyan-500",
  },
  {
    code: "SJT",
    score: 0,
    badgeClass: "bg-pink-500 text-white",
    barClass: "bg-pink-500",
  },
];

const questionBankProgress = [
  {
    code: "VR",
    section: "vr",
    title: "PhloemAI Verbal Reasoning",
    completed: 0,
    total: UCAT_QUESTION_BANK.vr.length,
    focus: "No questions completed yet",
    href: "/phloemai/question-bank/vr",
  },
  {
    code: "DM",
    section: "dm",
    title: "PhloemAI Decision Making",
    completed: 0,
    total: UCAT_QUESTION_BANK.dm.length,
    focus: "No questions completed yet",
    href: "/phloemai/question-bank/dm",
  },
  {
    code: "QR",
    section: "qr",
    title: "PhloemAI Quantitative Reasoning",
    completed: 0,
    total: UCAT_QUESTION_BANK.qr.length,
    focus: "No questions completed yet",
    href: "/phloemai/question-bank/qr",
  },
  {
    code: "SJT",
    section: "sjt",
    title: "PhloemAI Situational Judgement",
    completed: 0,
    total: UCAT_QUESTION_BANK.sjt.length,
    focus: "No questions completed yet",
    href: "/phloemai/question-bank/sjt",
  },
] as const;

const dailyQuestionTarget = 200;
const sectionCodes: UCATSectionCode[] = ["VR", "DM", "QR", "SJT"];
const questionBankQuestionIds: Record<UCATSectionCode, Set<string>> = {
  VR: new Set(UCAT_QUESTION_BANK.vr.map((question) => question.id)),
  DM: new Set(UCAT_QUESTION_BANK.dm.map((question) => question.id)),
  QR: new Set(UCAT_QUESTION_BANK.qr.map((question) => question.id)),
  SJT: new Set(UCAT_QUESTION_BANK.sjt.map((question) => question.id)),
};

function emptySectionCounts(): Record<UCATSectionCode, number> {
  return { VR: 0, DM: 0, QR: 0, SJT: 0 };
}

function getSectionTotal(code: UCATSectionCode) {
  return questionBankProgress.find((item) => item.code === code)?.total ?? 0;
}

function getMonthShell() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return {
    year,
    month,
    monthLabel: now.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    }),
    days: Array.from({ length: daysInMonth }, (_, index) => ({
      day: index + 1,
      questions: 0,
    })),
  };
}

function createEmptyPracticeStats(): PracticeStats {
  const monthShell = getMonthShell();
  return {
    sectionCompleted: emptySectionCounts(),
    sectionAnswered: emptySectionCounts(),
    sectionCorrect: emptySectionCounts(),
    totalCompleted: 0,
    totalAvailable: questionBankProgress.reduce((sum, item) => sum + item.total, 0),
    accuracy: 0,
    avgSeconds: 0,
    hasCompletedQuestions: false,
    questionCalendarDays: monthShell.days,
    monthLabel: monthShell.monthLabel,
  };
}

function normaliseSectionCode(section: string | null): UCATSectionCode | null {
  const code = section?.toUpperCase();
  return sectionCodes.includes(code as UCATSectionCode)
    ? (code as UCATSectionCode)
    : null;
}

function getQuestionBankProgressItem(code: UCATSectionCode) {
  return questionBankProgress.find((item) => item.code === code);
}

function getNumberValue(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return numeric;
  }

  return fallback;
}

function getSummaryRecord(summary: unknown) {
  return summary && typeof summary === "object" && !Array.isArray(summary)
    ? (summary as Record<string, unknown>)
    : {};
}

function normaliseRecentPracticeSet(
  row: PracticeSessionListRow
): RecentPracticeSet | null {
  if (!row.id) return null;

  const summary = getSummaryRecord(row.summary);
  const section = normaliseSectionCode(
    typeof summary.section === "string" ? summary.section : row.section
  );

  if (!section) return null;

  const progressItem = getQuestionBankProgressItem(section);
  const totalQuestions = getNumberValue(
    summary.totalQuestions,
    row.total_questions ?? 0
  );
  const answeredQuestions = getNumberValue(
    summary.answeredQuestions,
    row.answered_questions ?? 0
  );
  const correctQuestions = getNumberValue(
    summary.correctQuestions,
    row.correct_questions ?? 0
  );
  const accuracy = Math.round(
    getNumberValue(summary.accuracy, getNumberValue(row.accuracy))
  );
  const completedAt =
    (typeof summary.completedAt === "string" ? summary.completedAt : null) ??
    row.completed_at ??
    row.created_at;
  const sectionSlug = section.toLowerCase();

  return {
    id: row.id,
    sectionCode: section,
    sectionSlug,
    title:
      typeof summary.sectionTitle === "string"
        ? summary.sectionTitle
        : progressItem?.title ?? `${section} practice set`,
    completedAt,
    answeredQuestions,
    totalQuestions,
    correctQuestions,
    accuracy,
    isIncomplete: totalQuestions > 0 && answeredQuestions < totalQuestions,
    href: `/phloemai/question-bank/${sectionSlug}?set=${encodeURIComponent(
      row.id
    )}`,
  };
}

function buildPracticeStats(rows: PracticeAttemptRow[]): PracticeStats {
  const monthShell = getMonthShell();
  const uniqueCompletedBySection: Record<UCATSectionCode, Set<string>> = {
    VR: new Set(),
    DM: new Set(),
    QR: new Set(),
    SJT: new Set(),
  };
  const sectionAnswered = emptySectionCounts();
  const sectionCorrect = emptySectionCounts();
  let answeredAttempts = 0;
  let correctAttempts = 0;
  let totalSeconds = 0;

  rows.forEach((row) => {
    const section = normaliseSectionCode(row.section);
    if (!section) return;

    const questionId = row.question_id;
    if (!questionId || !questionBankQuestionIds[section].has(questionId)) return;

    if (row.answered) {
      uniqueCompletedBySection[section].add(questionId);
      answeredAttempts += 1;
      sectionAnswered[section] += 1;
      if (row.correct) correctAttempts += 1;
      if (row.correct) sectionCorrect[section] += 1;
      totalSeconds += Math.max(0, row.total_seconds ?? 0);

      if (row.created_at) {
        const completedAt = new Date(row.created_at);
        if (
          completedAt.getFullYear() === monthShell.year &&
          completedAt.getMonth() === monthShell.month
        ) {
          const dayIndex = completedAt.getDate() - 1;
          if (monthShell.days[dayIndex]) {
            monthShell.days[dayIndex].questions += 1;
          }
        }
      }
    }
  });

  const sectionCompleted = emptySectionCounts();
  sectionCodes.forEach((code) => {
    sectionCompleted[code] = Math.min(
      getSectionTotal(code),
      uniqueCompletedBySection[code].size
    );
  });

  const totalCompleted = sectionCodes.reduce(
    (sum, code) => sum + sectionCompleted[code],
    0
  );
  const totalAvailable = questionBankProgress.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    sectionCompleted,
    sectionAnswered,
    sectionCorrect,
    totalCompleted,
    totalAvailable,
    accuracy:
      answeredAttempts > 0 ? Math.round((correctAttempts / answeredAttempts) * 100) : 0,
    avgSeconds:
      answeredAttempts > 0 ? Math.round(totalSeconds / answeredAttempts) : 0,
    hasCompletedQuestions: totalCompleted > 0,
    questionCalendarDays: monthShell.days,
    monthLabel: monthShell.monthLabel,
  };
}

function getQuestionBankProgress(stats: PracticeStats) {
  return questionBankProgress.map((item) => {
    const code = item.code as UCATSectionCode;
    const completed = stats.sectionCompleted[code];
    return {
      ...item,
      completed,
      focus:
        completed > 0
          ? `${completed} of ${item.total} questions completed`
          : item.focus,
    };
  });
}

function getSectionScores(stats: PracticeStats) {
  return sectionScores.map((section) => {
    const code = section.code as UCATSectionCode;
    const total = getSectionTotal(code);
    return {
      ...section,
      score: total > 0 ? Math.round((stats.sectionCompleted[code] / total) * 100) : 0,
      helper: `${stats.sectionCompleted[code]}/${total} done`,
    };
  });
}

function getSectionAccuracyScores(stats: PracticeStats) {
  return sectionScores.map((section) => {
    const code = section.code as UCATSectionCode;
    const answered = stats.sectionAnswered[code];
    const correct = stats.sectionCorrect[code];
    return {
      ...section,
      score: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      helper: answered > 0 ? `${correct}/${answered} correct` : "No answers yet",
    };
  });
}

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
    title: "Study Plan",
    text: "Get personalised tasks to improve",
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

type ReportIssueDefinition = {
  id: string;
  title: string;
  icon: typeof AlertTriangle;
  iconClass: string;
  freeLabel: string;
  short: string;
  mainCause: string;
  evidence: string[];
  fix: string;
};

const reportIssueDefinitions: ReportIssueDefinition[] = [
  {
    id: "calculator",
    title: "Inefficient calculator use",
    freeLabel: "Inefficient calculator use detected",
    short: "You may be losing time during calculation-heavy QR questions.",
    mainCause:
      "You pause mid-calculation, re-enter values after clearing, avoid memory buttons or use the calculator when estimation would be faster.",
    evidence: [
      "Calculator open rate and calculator-active time",
      "Repeated clears, re-entered values and operator/digit patterns",
      "Keyboard vs button input speed and memory button usage",
    ],
    fix: "15 minutes of calculator speed trainer.",
    icon: Calculator,
    iconClass: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "shortcuts",
    title: "Ineffective keyboard use",
    freeLabel: "Ineffective keyboard use detected",
    short: "You may be spending extra time on manual clicks and transitions.",
    mainCause:
      "You rely on mouse navigation, mouse answer selection and manual calculator or flag controls instead of high-value keyboard shortcuts.",
    evidence: [
      "Answer-key usage compared with mouse selections",
      "Alt+N, Alt+P, Alt+C and Alt+F usage",
      "Transition delay after answering or flagging",
    ],
    fix: "Build shortcut habits for answers, next/previous, calculator and flagging.",
    icon: Zap,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    id: "timing",
    title: "Time management issue",
    freeLabel: "Time management issue detected",
    short: "You may be over-investing time before locking in an answer.",
    mainCause:
      "You spend too long before first answer, get stuck on hard questions or lose time near the end of the set.",
    evidence: [
      "First-answer time and final-answer time",
      "Time spikes by subtype and question position",
      "Later-question speed changes and unanswered pressure",
    ],
    fix: "Use timed sets with hard-stop decisions and recovery drills.",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    id: "answer-hesitation",
    title: "Answer uncertainty",
    freeLabel: "Answer uncertainty detected",
    short: "You may be second-guessing instead of using evidence to decide.",
    mainCause:
      "You switch repeatedly, delay between first and final answer or change correct answers to incorrect ones.",
    evidence: [
      "Answer switch count and first/final answer gap",
      "Changed-from-correct and changed-to-correct rate",
      "Review changes made without new evidence",
    ],
    fix: "Practise evidence-locking and answer-change rules.",
    icon: MessageSquare,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "review",
    title: "Review strategy issue",
    freeLabel: "Review strategy issue detected",
    short: "Your review time may not be going to the highest-value questions.",
    mainCause:
      "You review low-value questions, change correct answers, miss flagged questions or spend too long in the navigator.",
    evidence: [
      "Review opens and navigator time",
      "Flagged questions revisited or missed",
      "Answer changes made during review",
    ],
    fix: "Use a strict review order: flagged time-sinks, unanswered, then evidence-based changes only.",
    icon: Bookmark,
    iconClass: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "flagging",
    title: "Flagging issue",
    freeLabel: "Flagging issue detected",
    short: "Your flags may not be separating time-sinks from safe questions.",
    mainCause:
      "You flag too many, flag too late, miss time-sink questions or flag easy items unnecessarily.",
    evidence: [
      "Flag toggles and flag timing",
      "Flagged question accuracy and review return rate",
      "Flags on easy, slow or already-finalised questions",
    ],
    fix: "Practise early flag decisions with a clear return threshold.",
    icon: Flag,
    iconClass: "bg-rose-50 text-rose-600",
  },
  {
    id: "navigation",
    title: "Navigation issue",
    freeLabel: "Navigation issue detected",
    short: "You may be losing time moving around the bank without a clear plan.",
    mainCause:
      "You revisit the same questions too often, overuse next/previous or jump around without a review strategy.",
    evidence: [
      "Question visits and repeated visits",
      "Navigator opens and question jumps",
      "Next/previous movement around finalised answers",
    ],
    fix: "Use a simple pass system: answer, flag, move; review only planned targets.",
    icon: BarChart3,
    iconClass: "bg-slate-100 text-slate-700",
  },
  {
    id: "reading",
    title: "Reading strategy issue",
    freeLabel: "Reading strategy issue detected",
    short: "You may be spending too long extracting the relevant information.",
    mainCause:
      "You spend too long in the stem or passage, revisit regions repeatedly or switch between passage and options too often.",
    evidence: [
      "Stimulus/question/answer region time",
      "Region switches and revisits",
      "First-answer delay after heavy reading",
    ],
    fix: "Practise question-first reading and key-information extraction drills.",
    icon: Eye,
    iconClass: "bg-cyan-50 text-cyan-600",
  },
  {
    id: "confidence",
    title: "Confidence judgement issue",
    freeLabel: "Confidence judgement issue detected",
    short: "Your sense of difficulty may not match your actual performance.",
    mainCause:
      "You underestimate or overestimate specific subtypes, spend too long on easy items or mark easy questions incorrectly.",
    evidence: [
      "Accuracy by labelled difficulty or confidence",
      "Time spent on questions marked easy",
      "Subtype-level overconfidence and underconfidence",
    ],
    fix: "Review miscalibrated questions and set confidence rules by subtype.",
    icon: Brain,
    iconClass: "bg-violet-50 text-violet-600",
  },
  {
    id: "pacing",
    title: "Pacing issue",
    freeLabel: "Pacing issue detected",
    short: "Your pace may be uneven across the bank.",
    mainCause:
      "You spend too long early, speed up too aggressively late or vary heavily between similar question types.",
    evidence: [
      "Time distribution across early, middle and final questions",
      "Speed changes by subtype and question position",
      "Accuracy drop after pace changes",
    ],
    fix: "Practise fixed-pace blocks with checkpoints every few questions.",
    icon: Timer,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "question-type",
    title: "Question-type weakness",
    freeLabel: "Question-type weakness detected",
    short: "Losses may be concentrated in a specific UCAT subtype.",
    mainCause:
      "Weakness is concentrated in a subtype such as QR percentages, DM syllogisms, VR inference or SJT appropriateness.",
    evidence: [
      "Accuracy by section and subtype",
      "Average time by subtype",
      "Repeated errors in the same question family",
    ],
    fix: "Prioritise the subtype causing the biggest score loss before broad practice.",
    icon: Target,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "rushing",
    title: "Rushing pattern",
    freeLabel: "Rushing pattern detected",
    short: "Fast answers may be costing avoidable marks.",
    mainCause:
      "You answer before enough information is read, skip key regions or make more errors in the final third.",
    evidence: [
      "Very short first-answer times",
      "Accuracy on fast responses",
      "Final-third error rate and skipped-region patterns",
    ],
    fix: "Use minimum-evidence checks before selecting an answer.",
    icon: AlertTriangle,
    iconClass: "bg-red-50 text-red-600",
  },
  {
    id: "overthinking",
    title: "Overthinking pattern",
    freeLabel: "Overthinking pattern detected",
    short: "You may be spending time after your first instinct is already right.",
    mainCause:
      "You keep revisiting, switch answers or spend too long after already selecting the correct answer.",
    evidence: [
      "Long total time despite correct first answer",
      "Answer switches after a correct first instinct",
      "Region revisits after answer selection",
    ],
    fix: "Practise lock-and-leave rules for evidence-backed first answers.",
    icon: Brain,
    iconClass: "bg-orange-50 text-orange-600",
  },
  {
    id: "consistency",
    title: "Consistency issue",
    freeLabel: "Consistency issue detected",
    short: "Performance may be unstable between similar questions.",
    mainCause:
      "Accuracy and timing vary heavily between similar question types or after longer questions.",
    evidence: [
      "Accuracy spread within the same subtype",
      "Timing variance across similar questions",
      "Performance dips after long questions",
    ],
    fix: "Use short repeated subtype sets until timing and accuracy stabilise.",
    icon: BarChart3,
    iconClass: "bg-indigo-50 text-indigo-600",
  },
  {
    id: "end-bank",
    title: "End-bank strategy issue",
    freeLabel: "End-bank strategy issue detected",
    short: "The final minutes may not be used well.",
    mainCause:
      "You end without reviewing flags, rush final questions, spend too long in review mode or leave changes too late.",
    evidence: [
      "End-bank clicks and final review time",
      "Flagged questions left unseen",
      "Late answer changes and final-third accuracy",
    ],
    fix: "Practise a final-two-minute review routine.",
    icon: Goal,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "tool-switching",
    title: "Tool-use issue",
    freeLabel: "Tool-use issue detected",
    short: "Switching tools may be interrupting question flow.",
    mainCause:
      "You lose time moving between calculator, navigator, question and answer areas.",
    evidence: [
      "Repeated calculator and navigator opens",
      "Slow return to the question after tool use",
      "Tool actions clustered inside one question",
    ],
    fix: "Practise deciding the tool before starting the question.",
    icon: Wrench,
    iconClass: "bg-slate-100 text-slate-700",
  },
  {
    id: "accuracy-under-time",
    title: "Timed accuracy issue",
    freeLabel: "Timed accuracy issue detected",
    short: "Accuracy may fall sharply when question time is compressed.",
    mainCause:
      "You can answer accurately with time available, but accuracy drops on compressed or later questions.",
    evidence: [
      "Accuracy by time band",
      "Later-question accuracy under pressure",
      "Hard subtype accuracy when paced tightly",
    ],
    fix: "Practise compressed-time sets after untimed accuracy is secure.",
    icon: Clock3,
    iconClass: "bg-amber-50 text-amber-600",
  },
  {
    id: "answer-change",
    title: "Answer-changing issue",
    freeLabel: "Answer-changing issue detected",
    short: "Answer changes may be reducing rather than improving accuracy.",
    mainCause:
      "You change correct answers after hesitation, during review or without new evidence.",
    evidence: [
      "Changed-from-correct rate",
      "Time before answer changes",
      "Review-mode changes without new information",
    ],
    fix: "Only change answers when you can name the new evidence.",
    icon: MessageSquare,
    iconClass: "bg-blue-50 text-blue-600",
  },
  {
    id: "subtype-priority",
    title: "Practice focus issue",
    freeLabel: "Practice focus issue detected",
    short: "Practice may be too broad for the weakness costing the most marks.",
    mainCause:
      "You spend too much time on low-yield subtypes or ignore the highest-impact weakness.",
    evidence: [
      "Subtype score-loss contribution",
      "Practice distribution by subtype",
      "High-impact weaknesses left under-practised",
    ],
    fix: "Build the next study block around the subtype causing the largest score loss.",
    icon: Target,
    iconClass: "bg-emerald-50 text-emerald-600",
  },
  {
    id: "fatigue",
    title: "Session fatigue pattern",
    freeLabel: "Session fatigue pattern detected",
    short: "Speed or accuracy may drop as the set goes on.",
    mainCause:
      "Accuracy, speed or decision quality drops later in the session after sustained work.",
    evidence: [
      "Accuracy and speed by question position",
      "Late-session answer switches and flagging",
      "Calculator pauses or revisits increasing over time",
    ],
    fix: "Practise longer sets with planned reset points.",
    icon: Activity,
    iconClass: "bg-violet-50 text-violet-600",
  },
];

type StudyPlanDisplayTask = DashboardDiagnosticTask & {
  title: string;
  href: string;
  icon: typeof Target;
  iconClass: string;
};

type ReportSectionFilter = "All" | UCATSectionCode;

function normaliseIssueText(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function isActionableStudyFix(fix: string) {
  const normalised = normaliseIssueText(fix);

  return (
    Boolean(normalised) &&
    !normalised.includes("each weak type") &&
    !normalised.includes("move on once each type") &&
    !normalised.includes("pointed out only") &&
    !normalised.includes("no study task added")
  );
}

function getStudyPlanHref(fix: string, label?: string) {
  const text = `${fix} ${label ?? ""}`.toLowerCase();

  if (text.includes("calculator") || text.includes("multi-step")) {
    return "/phloemai/skills-trainers#calculator";
  }
  if (text.includes("flag")) {
    return "/phloemai/skills-trainers#flagging";
  }
  if (text.includes("sjt") || text.includes("judgement")) {
    return "/phloemai/question-bank/sjt";
  }
  if (text.includes("verbal") || text.includes("passage") || text.includes("reading")) {
    return "/phloemai/question-bank/vr";
  }
  if (text.includes("decision") || text.includes("syllogism") || text.includes("probability")) {
    return "/phloemai/question-bank/dm";
  }
  if (text.includes("qr") || text.includes("percentage") || text.includes("ratio")) {
    return "/phloemai/question-bank/qr";
  }

  return "/phloemai/practice";
}

function getStudyPlanIcon(fix: string, label?: string) {
  const text = `${fix} ${label ?? ""}`.toLowerCase();

  if (text.includes("calculator") || text.includes("multi-step")) {
    return {
      icon: Calculator,
      iconClass: "bg-cyan-50 text-cyan-600",
      title: "Calculator speed",
    };
  }
  if (text.includes("flag")) {
    return {
      icon: Flag,
      iconClass: "bg-rose-50 text-rose-600",
      title: "Flagging judgement",
    };
  }
  if (text.includes("shortcut")) {
    return {
      icon: Zap,
      iconClass: "bg-violet-50 text-violet-600",
      title: "Shortcut habits",
    };
  }
  if (text.includes("timed") || text.includes("pace") || text.includes("speed")) {
    return {
      icon: Timer,
      iconClass: "bg-amber-50 text-amber-600",
      title: "Timed drill",
    };
  }

  return {
    icon: Target,
    iconClass: "bg-indigo-50 text-blue-600",
    title: label?.replace(" detected", "") ?? "Study task",
  };
}

function getDiagnosticStudyPlanTasks(
  latestDiagnostic: DashboardDiagnostic | null
): StudyPlanDisplayTask[] {
  const seen = new Set<string>();
  const rawTasks: DashboardDiagnosticTask[] = [];

  latestDiagnostic?.studyPlanTasks.forEach((task) => {
    if (!isActionableStudyFix(task.fix)) return;
    rawTasks.push(task);
  });

  latestDiagnostic?.issues.forEach((issue, index) => {
    const fixes = issue.studyFixes?.length
      ? issue.studyFixes
      : issue.fix
        ? [issue.fix]
        : [];

    fixes.forEach((fix, fixIndex) => {
      if (!isActionableStudyFix(fix)) return;
      rawTasks.push({
        id: `${issue.label}-${index}-${fixIndex}`,
        label: issue.label,
        fix,
      });
    });
  });

  return rawTasks.flatMap((task, index) => {
    const fix = task.fix.trim();
    const key = normaliseIssueText(fix);
    if (!fix || seen.has(key)) return [];
    seen.add(key);
    const presentation = getStudyPlanIcon(fix, task.label);

    return [
      {
        ...task,
        id: task.id || `study-task-${index}`,
        label: task.label,
        fix,
        href: getStudyPlanHref(fix, task.label),
        ...presentation,
      },
    ];
  });
}

function getActiveDiagnosticStudyPlanTasks(
  latestDiagnostic: DashboardDiagnostic | null,
  completedTaskIds: Set<string>,
  removedTaskIds: Set<string>
): StudyPlanDisplayTask[] {
  const hiddenTaskIds = new Set([...completedTaskIds, ...removedTaskIds]);

  return getDiagnosticStudyPlanTasks(latestDiagnostic).filter(
    (task) => !hiddenTaskIds.has(task.id)
  );
}

function formatDiagnosticReportDate(value: string | null) {
  if (!value) return "Date not saved";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date not saved";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AI_DIAGNOSTIC_CREDIT_INTERVAL_MS = 24 * 60 * 60 * 1000;

function formatDigitalCountdown(totalMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(totalMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getNextAiDiagnosticCreditAt(lastUsedAt?: string | null) {
  if (!lastUsedAt) return null;

  const lastUsedMs = Date.parse(lastUsedAt);
  if (!Number.isFinite(lastUsedMs)) return null;

  return new Date(lastUsedMs + AI_DIAGNOSTIC_CREDIT_INTERVAL_MS).toISOString();
}

function getAiDiagnosticCreditDisplay({
  plan,
  diagnosticCredits,
  lastUsedAt,
  now,
}: {
  plan: string;
  diagnosticCredits: number;
  lastUsedAt?: string | null;
  now: number;
}) {
  if (plan === "Premium") {
    const nextAvailableAt = getNextAiDiagnosticCreditAt(lastUsedAt);
    const nextMs = nextAvailableAt ? Date.parse(nextAvailableAt) : Number.NaN;

    if (Number.isFinite(nextMs) && nextMs > now) {
      return {
        value: "0",
        status: `Available in ${formatDigitalCountdown(nextMs - now)}`,
        helper: "1 AI diagnostic credit refreshes every 24 hours.",
      };
    }

    return {
      value: "1/day",
      status: "Available",
      helper: "Premium includes 1 AI diagnostic credit every 24 hours.",
    };
  }

  return {
    value: String(Math.min(1, Math.max(0, diagnosticCredits))),
    status: diagnosticCredits > 0 ? "Available" : "No free credit remaining",
    helper: "Free accounts include 1 lifetime AI diagnostic credit.",
  };
}

function getReportIssueDefinitionForLabel(label: string) {
  const normalised = normaliseIssueText(label);

  return reportIssueDefinitions.find((issue) => {
    const idWords = normaliseIssueText(issue.id);
    const titleWords = normaliseIssueText(issue.title);
    const freeWords = normaliseIssueText(issue.freeLabel);
    return (
      normalised.includes(idWords) ||
      normalised.includes(titleWords) ||
      freeWords.includes(normalised) ||
      normalised.includes(freeWords.replace(" detected", ""))
    );
  });
}

function buildReportIssueCard(issue: DashboardDiagnosticIssue, index: number) {
  const definition = getReportIssueDefinitionForLabel(issue.label);

  return {
    id: definition?.id ?? `${issue.label}-${index}`,
    title: definition?.title ?? issue.label,
    freeLabel: issue.label,
    short:
      definition?.short ??
      issue.cause ??
      issue.fix ??
      "Detected from your latest diagnostic data.",
    mainCause:
      issue.cause ??
      definition?.mainCause ??
      "This issue was detected from your latest diagnostic data.",
    evidence:
      issue.evidence && issue.evidence.length > 0
        ? issue.evidence
        : definition?.evidence ?? ["Detected from the latest saved diagnostic."],
    fix:
      issue.fix ??
      definition?.fix ??
      "Review the linked feedback, then practise the matching question type.",
    icon: definition?.icon ?? AlertTriangle,
    iconClass: definition?.iconClass ?? "bg-red-50 text-red-600",
  } satisfies ReportIssueDefinition;
}

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

export function MetricCard({
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

function DailyQuestionsChart({ practiceStats }: { practiceStats: PracticeStats }) {
  const recentDays = practiceStats.questionCalendarDays.slice(-7);
  const average = Math.round(
    recentDays.length > 0
      ? recentDays.reduce((sum, item) => sum + item.questions, 0) /
          recentDays.length
      : 0
  );
  const daysOnTarget = recentDays.filter(
    (item) => item.questions >= dailyQuestionTarget
  ).length;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
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
            {practiceStats.monthLabel}
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
            {practiceStats.questionCalendarDays.map((item) => (
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

function ReportIssueSignalCard({
  issue,
  isPremium,
  hasSignals,
  checkoutLoading,
  onUpgrade,
}: {
  issue: ReportIssueDefinition;
  isPremium: boolean;
  hasSignals: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void | Promise<void>;
}) {
  const Icon = issue.icon;
  const displayLabel = hasSignals
    ? issue.freeLabel
    : issue.freeLabel.replace(" detected", "").replace(" needs work", "");

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full ${issue.iconClass}`}
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-black">{displayLabel}</h2>
            <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">
              {issue.short}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-black ${
            hasSignals
              ? "bg-amber-50 text-amber-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {hasSignals ? "Detected" : "Pending"}
        </span>
      </div>
      <div className="relative mt-5 overflow-hidden rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        {!isPremium && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 text-center backdrop-blur-[2px]">
            <LockKeyhole className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <p className="mt-2 text-xs font-black text-slate-900">
              Specific analysis locked
            </p>
          </div>
        )}
        <div className={`space-y-4 ${!isPremium ? "select-none blur-[3px]" : ""}`}>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Main cause:
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
              {issue.mainCause}
            </p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Supporting evidence:
            </p>
            <ul className="mt-2 space-y-1 text-sm font-semibold leading-6 text-slate-700">
              {issue.evidence.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">
              Study task:
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
              {issue.fix}
            </p>
          </div>
        </div>
      </div>
      {!isPremium && (
        <button
          type="button"
          onClick={onUpgrade}
          disabled={checkoutLoading}
          className="mt-5 inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-black text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {checkoutLoading ? "Opening..." : "Upgrade to unlock and find out more"}
        </button>
      )}
    </section>
  );
}

function DiagnosticContent({
  isPremium,
  latestDiagnostic,
  diagnosticHistory,
  plan,
  diagnosticCredits,
  aiDiagnosticLastUsedAt,
}: PremiumGateProps & {
  latestDiagnostic: DashboardDiagnostic | null;
  diagnosticHistory: DashboardDiagnostic[];
  plan: string;
  diagnosticCredits: number;
  aiDiagnosticLastUsedAt?: string | null;
}) {
  const [creditNow, setCreditNow] = useState(() => Date.now());
  const hasDiagnostic = Boolean(latestDiagnostic);
  const diagnosticFeaturesUnlocked =
    isPremium || isFreeQrDiagnostic(latestDiagnostic);
  const creditDisplay = getAiDiagnosticCreditDisplay({
    plan,
    diagnosticCredits,
    lastUsedAt: aiDiagnosticLastUsedAt,
    now: creditNow,
  });
  const creditIsCoolingDown = creditDisplay.status.startsWith("Available in");
  const creditIsAvailable = creditDisplay.status === "Available";
  const creditCtaHref =
    !isPremium && diagnosticCredits <= 0
      ? "/phloemai/pricing"
      : hasDiagnostic
        ? "/phloemai/report"
        : "/phloemai/question-bank/qr?diagnostic=free-qr";
  const creditCtaLabel =
    !isPremium && diagnosticCredits <= 0
      ? "Upgrade for daily credits"
      : hasDiagnostic
        ? "Open AI report"
        : "Start diagnostic";
  const creditStatusClass = creditIsAvailable
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : creditIsCoolingDown
      ? "border-amber-200 bg-amber-50 text-amber-700"
      : "border-slate-200 bg-slate-100 text-slate-600";
  const creditTimerText = creditIsCoolingDown
    ? creditDisplay.status
    : creditIsAvailable
      ? "Available"
      : isPremium
        ? "Refresh pending"
        : "Upgrade for a daily refresh";
  const latestReportHref = latestDiagnostic
    ? `/phloemai/report?attempt=${encodeURIComponent(latestDiagnostic.id)}`
    : "/phloemai/report";
  const recentDiagnostics = diagnosticHistory.slice(0, 6);

  const timingPrompts = [
    [
      "Best before starting a study session",
      "Know where to focus your time for maximum impact.",
      BarChart3,
    ],
    [
      "After a few practice sets",
      "Measure your progress and adjust your plan.",
      Clock3,
    ],
    [
      "When scores feel stuck",
      "Get fresh insights to break through plateaus.",
      Target,
    ],
  ] as const;

  const diagnosticTools = [
    {
      title: "Score movement pending",
      text: "Complete and mark diagnostics so PhloemAI can compare your points and deciles over time.",
      cta: "View progress",
      icon: Target,
      iconClass: "bg-indigo-50 text-blue-600",
      href: "/phloemai/progress",
      linkClass: "border-blue-100 text-blue-600 hover:bg-blue-50",
    },
    {
      title: "Personalised feedback",
      text: "Get AI-powered insights and targeted recommendations based on your results.",
      cta: "See insights",
      icon: Sparkles,
      iconClass: "bg-violet-50 text-violet-600",
      href: "/phloemai/report",
      linkClass: "border-violet-100 text-violet-600 hover:bg-violet-50",
    },
  ] as const;

  useEffect(() => {
    const nextAvailableAt = getNextAiDiagnosticCreditAt(aiDiagnosticLastUsedAt);
    if (plan !== "Premium" || !nextAvailableAt) return;

    const intervalId = window.setInterval(() => setCreditNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [aiDiagnosticLastUsedAt, plan]);

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-5 xl:grid-cols-[1.85fr_1fr]">
          <div>
            <p className="px-1 text-xs font-black uppercase tracking-wide text-blue-600">
              Start your diagnostic
            </p>
            <div className="mt-3 grid gap-4 lg:grid-cols-2">
              <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-800 p-5 text-white shadow-sm">
                <span className="relative inline-flex rounded-lg bg-emerald-900/25 px-3 py-2 text-[11px] font-black uppercase">
                  {hasDiagnostic ? "Report ready" : "Free first-read"}
                </span>
                <h2 className="relative mt-6 text-xl font-black">
                  {hasDiagnostic ? "View free diagnostic report" : "Start free diagnostic"}
                </h2>
                <p className="relative mt-2 max-w-[19rem] text-sm font-bold leading-6 text-emerald-50">
                  {hasDiagnostic
                    ? "Your latest diagnostic is saved with issues, strengths and next steps."
                    : "A fixed QR first-read to uncover key areas for improvement."}
                </p>
                <ul className="relative mt-5 space-y-2 text-sm font-bold text-emerald-50">
                  {(hasDiagnostic
                    ? [
                        `${latestDiagnostic?.section ?? "QR"} diagnostic saved`,
                        diagnosticFeaturesUnlocked
                          ? "Report and study tasks ready"
                          : "Report ready; study plan locked",
                        latestDiagnostic?.aiFeedbackText
                          ? "AI feedback ready"
                          : "AI feedback status saved",
                      ]
                    : [
                        "14 QR questions",
                        "10 minutes",
                        "1 lifetime AI feedback credit",
                      ]
                  ).map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href={hasDiagnostic ? latestReportHref : "/phloemai/question-bank/qr?diagnostic=free-qr"}
                  className="relative mt-auto flex h-11 items-center justify-center gap-3 rounded-lg bg-white px-5 text-sm font-black text-emerald-700 shadow-sm transition-colors hover:bg-emerald-50"
                >
                  {hasDiagnostic ? "View report" : "Start free diagnostic"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="relative flex h-full flex-col overflow-hidden rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-950 p-5 text-white shadow-sm">
                <span className="relative inline-flex rounded-lg bg-white/15 px-3 py-2 text-[11px] font-black uppercase">
                  Premium diagnostic
                </span>
                <h2 className="relative mt-6 text-xl font-black">
                  Mock diagnostic
                </h2>
                <p className="relative mt-2 max-w-[21rem] text-sm font-bold leading-6 text-blue-50">
                  Choose a whole UCAT mock or a single full section with scaled
                  scoring.
                </p>
                <ul className="relative mb-8 mt-5 space-y-2 text-sm font-bold text-blue-50">
                  {[
                    "Full mock: VR 44, DM 35, QR 36, SJT 69",
                    "Subset mock with official timing",
                    "15-minute subset mock available",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/phloemai/diagnostics/mock-diagnostic"
                  className="relative mt-auto flex h-11 items-center justify-center gap-3 rounded-lg bg-white px-5 text-sm font-black text-blue-700 shadow-sm transition-colors hover:bg-blue-50"
                >
                  Choose mock
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          <aside className="border-t border-slate-200 pt-4 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xs font-black uppercase tracking-wide">
                Latest diagnostic
              </h2>
              <span className={`text-xs font-black ${hasDiagnostic ? "text-emerald-600" : "text-slate-500"}`}>
                {hasDiagnostic ? "Saved" : "Empty"}
              </span>
            </div>
            {hasDiagnostic ? (
              <div className="mt-7 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
                <h3 className="max-w-sm text-xl font-black leading-tight">
                  {latestDiagnostic?.section ?? "UCAT"} diagnostic report ready
                </h3>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-emerald-900">
                  Open the saved report to review issues, study tasks and AI
                  feedback status.
                </p>
              </div>
            ) : (
              <div className="mt-7 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <h3 className="max-w-sm text-xl font-black leading-tight">
                  No diagnostic completed yet
                </h3>
                <p className="mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-600">
                  Mark a practice set or run a diagnostic to populate this panel with real data.
                </p>
              </div>
            )}
            <p className="mt-4 max-w-sm text-sm font-semibold leading-6 text-slate-600">
              {hasDiagnostic
                ? latestDiagnostic?.aiFeedbackText
                  ? "AI feedback is saved with this diagnostic."
                  : "Open the report to generate AI feedback for this diagnostic."
                : "AI feedback will stay empty until there is saved practice or diagnostic data."}
            </p>
            <div className="mt-6 grid gap-2 sm:grid-cols-3 xl:grid-cols-3">
              {([
                [
                  "Status",
                  hasDiagnostic
                    ? latestDiagnostic?.aiFeedbackText
                      ? "AI ready"
                      : "Report ready"
                    : "No data",
                  Activity,
                  hasDiagnostic ? "text-emerald-600" : "text-slate-500",
                ],
                [
                  "Last updated",
                  hasDiagnostic
                    ? formatDiagnosticReportDate(latestDiagnostic?.completedAt ?? null)
                    : "Never",
                  Clock3,
                  hasDiagnostic ? "text-blue-600" : "text-slate-500",
                ],
                [
                  "Accuracy",
                  hasDiagnostic ? `${latestDiagnostic?.accuracy ?? 0}%` : "-",
                  BarChart3,
                  hasDiagnostic ? "text-violet-600" : "text-slate-500",
                ],
              ] as const).map(([label, value, Icon, colorClass]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-5 w-5 ${colorClass}`}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-black text-slate-700">
                        {label}
                      </p>
                      <p className="mt-0.5 text-xs font-bold text-slate-500">
                        {value}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href={latestReportHref}
              className="mt-6 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              {hasDiagnostic ? "Open latest report" : "View full report"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.3fr]">
        {diagnosticTools.map((tool) => {
          const Icon = tool.icon;
          return (
            <section
              key={tool.title}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tool.iconClass}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black">{tool.title}</h2>
                  <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                    {tool.text}
                  </p>
                  <Link
                    href={tool.href}
                    className={`mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-black ${tool.linkClass}`}
                  >
                    {tool.cta}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

        <section className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-blue-50 shadow-sm">
          <div className="grid h-full gap-4 p-4 sm:grid-cols-[1fr_190px] sm:items-center">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <BadgeCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-black">AI diagnostic credit</h2>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${creditStatusClass}`}>
                    {creditIsAvailable ? "Ready now" : creditDisplay.status}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold leading-5 text-slate-600">
                  Turn a saved diagnostic into a written AI report with specific
                  fixes, issue causes and next tasks.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    href={creditCtaHref}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white transition-colors hover:bg-blue-700"
                  >
                    {creditCtaLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href="/phloemai/account"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-blue-100 bg-white px-4 text-xs font-black text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    Credit settings
                  </Link>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white bg-white/85 p-3 shadow-sm">
              <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Daily AI report
                  </p>
                  <p className="mt-1 text-3xl font-black leading-none text-blue-600">
                    {creditDisplay.value}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-black ${
                    isPremium
                      ? "bg-violet-50 text-violet-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {isPremium ? "Premium" : "Free"}
                </span>
              </div>
              <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Timer className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">
                      Server-timed refresh
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-black text-slate-900">
                      {creditTimerText}
                    </p>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[11px] font-bold leading-4 text-slate-500">
                {creditDisplay.helper}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.85fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-black">Recent diagnostic history</h2>
            <Link
              href="/phloemai/report"
              className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
            >
              View all history
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            {recentDiagnostics.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  No diagnostics recorded yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Completed diagnostics will appear here after they are saved.
                </p>
              </div>
            ) : (
            recentDiagnostics.map((item, index) => {
              const style = sectionStyle(item.section);
              const reportHref = `/phloemai/report?attempt=${encodeURIComponent(item.id)}`;
              const aiReady = Boolean(item.aiFeedbackText);
              return (
                <div
                  key={item.id}
                  className="grid gap-4 border-b border-slate-100 px-3 py-3 last:border-b-0 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-2.5 py-2 text-xs font-black ${style.badgeClass}`}
                    >
                      {item.section}
                    </span>
                    <div>
                      <p className="text-sm font-black">
                        {index === 0 ? "Latest diagnostic" : `Previous diagnostic ${index}`}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {formatDiagnosticReportDate(item.completedAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                      aiReady
                        ? "bg-emerald-50 text-emerald-700"
                        : item.aiFeedbackStatus === "queued_no_api_key"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-violet-50 text-violet-700"
                    }`}
                  >
                    {aiReady ? "AI ready" : item.aiFeedbackStatus === "queued_no_api_key" ? "Queued" : "AI needed"}
                  </span>
                  <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                    {item.accuracy}%
                  </span>
                  <Link
                    href={reportHref}
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-blue-600 hover:bg-blue-50"
                  >
                    Open report
                  </Link>
                </div>
              );
            }))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black">
            When to run a diagnostic
          </h2>
          <div className="relative mt-5 space-y-5 before:absolute before:bottom-6 before:left-6 before:top-6 before:w-px before:bg-slate-200">
            {timingPrompts.map(([title, text, Icon]) => (
              <div key={title} className="relative flex gap-4">
                <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-blue-600">
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

function MockDiagnosticContent() {
  const mockOptions = [
    {
      title: "Full mocks",
      text: "Run a complete UCAT-style mock under full exam timing.",
      cta: "Choose full mock",
      href: "/phloemai/mocks/full",
      icon: ClipboardList,
      iconClass: "bg-blue-50 text-blue-600",
      borderClass: "border-blue-200",
      buttonClass: "bg-blue-600 text-white hover:bg-blue-700",
    },
    {
      title: "Full subtest mocks",
      text: "Complete one full section mock: VR, DM, QR or SJT.",
      cta: "Choose subtest",
      href: "/phloemai/mocks/subtest",
      icon: Target,
      iconClass: "bg-emerald-50 text-emerald-600",
      borderClass: "border-emerald-200",
      buttonClass: "bg-emerald-600 text-white hover:bg-emerald-700",
    },
    {
      title: "15-minute sprint",
      text: "Do a short timed sprint in any section for focused practice.",
      cta: "Start sprint",
      href: "/phloemai/mocks/subtest?timing=short",
      icon: Timer,
      iconClass: "bg-violet-50 text-violet-600",
      borderClass: "border-violet-200",
      buttonClass: "bg-violet-600 text-white hover:bg-violet-700",
    },
  ] as const;

  return (
    <div className="px-6 py-8 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-black">
          <Link href="/phloemai/diagnostic" className="text-blue-600 hover:text-blue-700">
            Diagnostics
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span className="text-slate-500">Mock diagnostic</span>
        </div>
        <Link
          href="/phloemai/diagnostic"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-5 text-sm font-black text-blue-600 transition-colors hover:bg-blue-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to diagnostics
        </Link>
      </div>

      <div className="mt-14">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Choose your mock diagnostic
        </h1>
        <p className="mt-3 text-base font-semibold text-slate-500">
          Pick the format you want to run today.
        </p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        {mockOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Link
              key={option.title}
              href={option.href}
              className={`group flex min-h-[300px] flex-col rounded-xl border bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${option.borderClass}`}
            >
              <div
                className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full ${option.iconClass}`}
              >
                <Icon className="h-14 w-14" aria-hidden="true" />
              </div>
              <h2 className="mt-6 text-xl font-black">{option.title}</h2>
              <p className="mx-auto mt-3 max-w-xs text-sm font-semibold leading-6 text-slate-600">
                {option.text}
              </p>
              <span
                className={`mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black transition-colors ${option.buttonClass}`}
              >
                {option.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function RecentPracticeSetsPanel({
  sets,
  emptyTitle = "No practice sets saved yet.",
  emptyText = "Mark a question-bank set to add the first row.",
}: {
  sets: RecentPracticeSet[];
  emptyTitle?: string;
  emptyText?: string;
}) {
  const incompleteSets = sets.filter((set) => set.isIncomplete);
  const completedSets = sets.filter((set) => !set.isIncomplete);

  if (sets.length === 0) {
    return (
      <Link
        href="/phloemai/question-bank"
        className="block rounded-xl border border-slate-100 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-200 hover:bg-blue-50/70"
      >
        <p className="text-sm font-black text-slate-700">{emptyTitle}</p>
        <p className="mt-2 text-xs font-semibold text-slate-500">{emptyText}</p>
        <span className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-black text-blue-600">
          Open question bank
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </Link>
    );
  }

  const renderSet = (set: RecentPracticeSet) => {
    const style = sectionStyle(set.sectionCode);
    const answeredLabel = `${set.answeredQuestions}/${set.totalQuestions} answered`;
    const scoreLabel =
      set.answeredQuestions > 0
        ? `${set.correctQuestions}/${set.answeredQuestions} correct - ${set.accuracy}%`
        : "No answers yet";

    return (
      <Link
        key={set.id}
        href={set.href}
        className="grid gap-3 border-t border-slate-100 px-3 py-3 transition-colors first:border-t-0 hover:bg-blue-50/70 sm:grid-cols-[1fr_120px_96px] sm:items-center"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`rounded-lg px-3 py-2 text-xs font-black ${style.badgeClass}`}
          >
            {set.sectionCode}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black">{set.title}</p>
            <p className="mt-1 text-xs font-bold text-slate-500">
              {answeredLabel}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-black">{scoreLabel}</p>
          <p className="text-xs font-bold text-slate-400">
            {formatDiagnosticReportDate(set.completedAt)}
          </p>
        </div>
        <span className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-blue-600">
          {set.isIncomplete ? "Continue" : "Review"}
        </span>
      </Link>
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
      {incompleteSets.length > 0 && (
        <div>
          <div className="bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-amber-700">
            Incomplete sets
          </div>
          {incompleteSets.map(renderSet)}
        </div>
      )}
      {completedSets.length > 0 && (
        <div>
          <div className="bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-500">
            Marked sets
          </div>
          {completedSets.map(renderSet)}
        </div>
      )}
    </div>
  );
}

function PracticeContent({
  latestDiagnostic,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
  recentPracticeSets,
  isPremium,
  checkoutLoading,
  onUpgrade,
}: {
  latestDiagnostic: DashboardDiagnostic | null;
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
  recentPracticeSets: RecentPracticeSet[];
  isPremium: boolean;
  checkoutLoading: boolean;
  onUpgrade: () => void;
}) {
  const allStudyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const studyPlanTasks = getActiveDiagnosticStudyPlanTasks(
    latestDiagnostic,
    completedDashboardTaskIds,
    removedDashboardTaskIds
  );
  const recommendedTask = studyPlanTasks[0];
  const completedCurrentPlan = allStudyPlanTasks.length > 0 && !recommendedTask;
  const mockAndSkillCards = [
    {
      title: "Full mocks",
      text: "Run a complete UCAT-style mock when you need a full readiness check.",
      icon: Timer,
      iconClass: "bg-blue-100 text-blue-600",
      href: "/phloemai/mocks/full",
      cta: "Start mock",
    },
    {
      title: "Mini mocks",
      text: "Short mixed tests for momentum without committing to a full paper.",
      icon: BarChart3,
      iconClass: "bg-violet-100 text-violet-600",
      href: "/phloemai/mocks/subtest",
      cta: "Start mini mock",
    },
    {
      title: "Review mocks",
      text: "Revisit marked and incorrect mock questions with feedback.",
      icon: AlertTriangle,
      iconClass: "bg-red-100 text-red-500",
      href: "/phloemai/question-bank",
      cta: "Review",
    },
    {
      title: "Calculator speed trainer",
      text: "Rapid QR-style calculator drills for typing speed, memory buttons and fewer clears.",
      icon: Calculator,
      iconClass: "bg-cyan-100 text-cyan-600",
      href: "/phloemai/skills-trainers#calculator",
      cta: "Train speed",
    },
    {
      title: "Flagging trainer",
      text: "Practise deciding which questions deserve a flag before they drain time.",
      icon: Flag,
      iconClass: "bg-rose-100 text-rose-600",
      href: "/phloemai/skills-trainers#flagging",
      cta: "Train flags",
    },
  ] as const;

  const practiceSections = [
    {
      code: "VR",
      title: "Verbal Reasoning",
      text: "Passage-based inference and comprehension.",
      href: "/phloemai/question-bank/vr",
      className: "bg-indigo-600 text-white",
    },
    {
      code: "DM",
      title: "Decision Making",
      text: "Logic, probability and argument evaluation.",
      href: "/phloemai/question-bank/dm",
      className: "bg-blue-600 text-white",
    },
    {
      code: "QR",
      title: "Quantitative Reasoning",
      text: "Short numerical problems and data interpretation.",
      href: "/phloemai/question-bank/qr",
      className: "bg-cyan-500 text-white",
    },
    {
      code: "SJT",
      title: "Situational Judgement",
      text: "Professional judgement and appropriate actions.",
      href: "/phloemai/question-bank/sjt",
      className: "bg-pink-500 text-white",
    },
  ];

  const emptySkillQueueHref = completedCurrentPlan
    ? "/phloemai/diagnostic/mock-options"
    : "/phloemai/question-bank";
  const emptySkillQueueLabel = completedCurrentPlan
    ? "Run another diagnostic"
    : "Start practice";

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <ClientPremiumGate
        isPremium={isPremium}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        title="Unlock your personalised study plan"
        description="Premium turns diagnostic issues into exact drills, review rules and recommended next tasks."
        featureLabel="Premium study plan"
      >
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                <Zap className="h-8 w-8" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-wide">
                  Recommended from your study plan
                </h2>
                <h3 className="mt-6 text-lg font-black">
                  {recommendedTask?.title ??
                    (completedCurrentPlan
                      ? "Current study plan cleared"
                      : "No recommended task yet")}
                </h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  {recommendedTask?.fix ??
                    (completedCurrentPlan
                      ? "Every task from your latest diagnostic has been ticked off."
                      : "Complete and mark practice questions to build a real task queue.")}
                </p>
              </div>
            </div>
            <Link
              href={recommendedTask?.href ?? "/phloemai/question-bank"}
              className="inline-flex h-12 items-center justify-center rounded-lg bg-blue-600 px-8 text-sm font-black text-white transition-colors hover:bg-blue-700"
            >
              {recommendedTask ? "Start task" : "Start practice"}
            </Link>
          </div>
        </section>
      </ClientPremiumGate>

      <section className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-white to-slate-50 p-5 shadow-[0_14px_32px_rgba(37,99,235,0.08)] ring-1 ring-blue-50">
        <div
          className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-blue-500 via-cyan-400 to-indigo-500"
          aria-hidden="true"
        />
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
              className="rounded-xl border border-blue-100 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.10)] ring-1 ring-blue-50 transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_16px_34px_rgba(15,23,42,0.13)]"
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
          Practice Mock tests + Skills
        </h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Use mocks for exam pressure, then skill trainers for the behaviours
          holding you back.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-5">
          {mockAndSkillCards.map((card) => {
            const Icon = card.icon;
            return (
            <Link
              href={card.href}
              key={card.title}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-all hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:shadow-[0_12px_28px_rgba(15,23,42,0.10)]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconClass}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-black">{card.title}</h3>
              <p className="mt-2 min-h-10 text-xs font-bold leading-5 text-slate-500">
                {card.text}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-600">
                {card.cta}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </Link>
          );
          })}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <ClientPremiumGate
          isPremium={isPremium}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock targeted skill queue"
          description="Premium keeps the diagnostic study plan visible as exact tasks you can start from practice."
          featureLabel="Premium study plan"
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Targeted skill queue
            </h2>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              Suggested next sets based on the patterns in your latest diagnostic.
            </p>
            <div className="mt-4 space-y-2">
              {studyPlanTasks.length === 0 ? (
                <Link
                  href={emptySkillQueueHref}
                  className="block rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-blue-200 hover:bg-blue-50/70"
                >
                  <p className="text-sm font-black text-slate-700">
                    {completedCurrentPlan
                      ? "Your current targeted queue is cleared."
                      : "Your targeted queue is empty."}
                  </p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    {completedCurrentPlan
                      ? "Run another diagnostic when you want a fresh task queue."
                      : "Saved practice data will decide what belongs here."}
                  </p>
                  <span className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-black text-blue-600">
                    {emptySkillQueueLabel}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              ) : (
              studyPlanTasks.map((task) => {
                const Icon = task.icon;
                return (
                <Link
                  key={task.id}
                  href={task.href}
                  className="grid gap-4 rounded-xl border border-slate-100 px-3 py-3 transition-colors hover:border-blue-200 hover:bg-blue-50/70 sm:grid-cols-[64px_1fr_112px] sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white"
                    >
                      {latestDiagnostic?.section ?? "Task"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${task.iconClass}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-sm font-black">{task.title}</p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {task.fix}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-blue-600">
                    Start
                  </span>
                </Link>
              );
              }))}
            </div>
            <Link
              href="/phloemai/report"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              View study plan report
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </section>
        </ClientPremiumGate>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Recent practice
          </h2>
          <div className="mt-4">
            <RecentPracticeSetsPanel sets={recentPracticeSets.slice(0, 6)} />
          </div>
          <Link
            href="/phloemai/question-bank"
            className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
          >
            View all practice
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>

      <ApproachBand
        title="Practice turns your study plan into improvement"
        steps={[approachSteps[0], approachSteps[3], approachSteps[1], approachSteps[4]]}
      />
    </div>
  );
}

type CalculatorTrainerMode = "calibration" | "multi-step";
type CalculatorPromptNumberStatus =
  | "idle"
  | "active-correct"
  | "active-wrong"
  | "complete-correct"
  | "complete-wrong";
type CalculatorTrainerProblem = {
  prompt: string;
  answer: number;
  hint: string;
  targetSeconds: number;
};

const initialCalculatorProblem: CalculatorTrainerProblem = {
  prompt: "84 + 1327 - 496 + 58",
  answer: 973,
  hint: "Calibration target: 9 seconds.",
  targetSeconds: 9,
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createCalculatorProblem(
  mode: CalculatorTrainerMode
): CalculatorTrainerProblem {
  if (mode === "calibration") {
    const a = randomInt(25, 180);
    const b = randomInt(700, 4800);
    const c = randomInt(20, 190);
    const d = randomInt(350, 4200);

    return {
      prompt: `${a} + ${b} - ${d} + ${c}`,
      answer: a + b - d + c,
      hint: "Calibration target: 9 seconds.",
      targetSeconds: 9,
    };
  }

  const type = randomInt(1, 3);
  if (type === 1) {
    const a = randomInt(12, 39);
    const b = randomInt(14, 68);
    const c = randomInt(8, 27);
    const d = randomInt(18, 74);

    return {
      prompt: `${a} x ${b} + ${c} x ${d}`,
      answer: a * b + c * d,
      hint: "Two products, then one final add. Use M+ to bank a product if that feels cleaner.",
      targetSeconds: 16,
    };
  }
  if (type === 2) {
    const a = randomInt(18, 55);
    const b = randomInt(12, 45);
    const c = randomInt(6, 22);
    const d = randomInt(20, 85);

    return {
      prompt: `${a} x ${b} - ${c} x ${d}`,
      answer: a * b - c * d,
      hint: "Calculate both products first, then subtract the second from the first.",
      targetSeconds: 16,
    };
  }

  const a = randomInt(9, 34);
  const b = randomInt(15, 62);
  const c = randomInt(120, 680);
  const d = randomInt(7, 28);
  const e = randomInt(3, 16);

  return {
    prompt: `${a} x ${b} + ${c} - ${d} x ${e}`,
    answer: a * b + c - d * e,
    hint: "Handle the multiplications as separate chunks, then combine the add/subtract terms.",
    targetSeconds: 18,
  };
}

function isCloseNumber(input: string, answer: number) {
  const parsed = Number(input);
  if (!Number.isFinite(parsed)) return false;

  return Math.abs(parsed - answer) <= 0.05;
}

function getCalculatorPromptNumberText(token: string) {
  return token.match(/-?\d+(?:\.\d+)?/)?.[0] ?? null;
}

function getCalculatorPromptNumbers(prompt: string) {
  return prompt
    .split(" ")
    .map(getCalculatorPromptNumberText)
    .filter((token): token is string => Boolean(token));
}

function normaliseCalculatorProgressText(value: string) {
  const trimmed = value.trim();
  if (trimmed === "") return "";
  if (trimmed === "0" || trimmed === "0.") return trimmed;

  return trimmed.replace(/^(-?)0+(?=\d)/, "$1");
}

function getCalculatorPromptNumberClass(status?: CalculatorPromptNumberStatus) {
  if (status === "active-wrong" || status === "complete-wrong") {
    return "text-red-500";
  }

  if (status === "active-correct" || status === "complete-correct") {
    return "text-emerald-500";
  }

  return "text-slate-500";
}

type FlagTrainerSection = Extract<UCATSection, "vr" | "dm" | "qr">;
type FlagDifficulty = "easy" | "medium" | "hard";

const flagTrainerSections: Array<{
  code: UCATSectionCode;
  label: string;
  slug: FlagTrainerSection;
}> = [
  { code: "VR", label: "Verbal Reasoning", slug: "vr" },
  { code: "DM", label: "Decision Making", slug: "dm" },
  { code: "QR", label: "Quantitative Reasoning", slug: "qr" },
];

const calculatorButtonRows = [
  ["MRC", "M-", "M+", "CE"],
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "=", "+"],
] as const;

function formatTrainerClock(seconds: number) {
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

function getCalculatorModeLabel(mode: CalculatorTrainerMode) {
  if (mode === "calibration") return "9-second calibration";
  return "Multi-step calculations";
}

function calculateTrainerValue(stored: number, current: number, operator: string) {
  if (operator === "+") return stored + current;
  if (operator === "-") return stored - current;
  if (operator === "*") return stored * current;
  if (operator === "/") return current === 0 ? 0 : stored / current;
  return current;
}

function getTrainerNowMs() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function getFlagDifficulty(question: UCATQuestion): FlagDifficulty {
  if (question.tags?.includes("hard")) return "hard";
  if (question.tags?.includes("medium")) return "medium";
  return "easy";
}

function formatTrainerTag(tag: string) {
  return tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getFlagTrainerQuestions(section: FlagTrainerSection) {
  const buckets: Record<FlagDifficulty, UCATQuestion[]> = {
    easy: [],
    medium: [],
    hard: [],
  };

  UCAT_QUESTION_BANK[section].forEach((question) => {
    buckets[getFlagDifficulty(question)].push(question);
  });

  const ordered: UCATQuestion[] = [];
  const maxLength = Math.max(
    buckets.easy.length,
    buckets.medium.length,
    buckets.hard.length
  );

  for (let index = 0; index < maxLength; index += 1) {
    const easy = buckets.easy[index];
    const medium = buckets.medium[index];
    const hard = buckets.hard[index];
    if (easy) ordered.push(easy);
    if (medium) ordered.push(medium);
    if (hard) ordered.push(hard);
  }

  return ordered;
}

function FlagTrainerVisual({ visual }: { visual?: UCATQuestion["visual"] }) {
  if (!visual) return null;

  if (visual.type === "table") {
    return (
      <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
        <div className="bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">
          {visual.title}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-xs font-semibold text-slate-700">
            <thead className="bg-white text-slate-500">
              <tr>
                {visual.headers.map((header) => (
                  <th key={header} className="border-t border-slate-100 px-3 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visual.rows.map((row, rowIndex) => (
                <tr key={`${visual.title}-${rowIndex}`} className="odd:bg-slate-50/60">
                  {row.map((cell, cellIndex) => (
                    <td key={`${cell}-${cellIndex}`} className="border-t border-slate-100 px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (visual.type === "bar" || visual.type === "line") {
    const points = visual.type === "bar" ? visual.categories : visual.points;
    return (
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-black text-slate-700">{visual.title}</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {points.map((point) => (
            <div key={point.label} className="flex items-center justify-between rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <span>{point.label}</span>
              <span className="font-black text-slate-900">{point.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (visual.type === "grouped-bar") {
    return (
      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <p className="text-xs font-black text-slate-700">{visual.title}</p>
        <div className="mt-2 space-y-2">
          {visual.groups.map((group) => (
            <div key={group.label} className="rounded-md bg-white px-3 py-2 text-xs font-semibold text-slate-600">
              <p className="font-black text-slate-900">{group.label}</p>
              <p className="mt-1">
                {group.values
                  .map((value, index) => `${visual.seriesLabels[index]}: ${value}`)
                  .join(" | ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-black text-slate-700">{visual.title}</p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-600">
        Set-based visual with {visual.shapes.length} shape regions and {visual.regionLabels.length} labels.
      </p>
    </div>
  );
}

function SkillsTrainersContent({
  latestDiagnostic,
}: {
  latestDiagnostic: DashboardDiagnostic | null;
}) {
  const studyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calculatorMode, setCalculatorMode] =
    useState<CalculatorTrainerMode>("calibration");
  const [calculatorProblem, setCalculatorProblem] =
    useState<CalculatorTrainerProblem>(initialCalculatorProblem);
  const [calculatorRunning, setCalculatorRunning] = useState(false);
  const [calculatorElapsedSeconds, setCalculatorElapsedSeconds] = useState(0);
  const [calculatorCorrect, setCalculatorCorrect] = useState(0);
  const [calculatorTotal, setCalculatorTotal] = useState(0);
  const [calculatorFeedback, setCalculatorFeedback] = useState(
    "Open the trainer, then run the 9-second calibration."
  );
  const [calculatorInstructionsOpen, setCalculatorInstructionsOpen] = useState(false);
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcStored, setCalcStored] = useState<number | null>(null);
  const [calcOperator, setCalcOperator] = useState<string | null>(null);
  const [calcWaiting, setCalcWaiting] = useState(false);
  const [calcMemory, setCalcMemory] = useState(0);
  const [lastMrcAt, setLastMrcAt] = useState(0);
  const lastCalculatorPromptRef = useRef(initialCalculatorProblem.prompt);
  const [calculatorNumberStatuses, setCalculatorNumberStatuses] = useState<
    CalculatorPromptNumberStatus[]
  >(() => getCalculatorPromptNumbers(initialCalculatorProblem.prompt).map(() => "idle"));
  const [calculatorActiveNumberIndex, setCalculatorActiveNumberIndex] = useState(0);
  const [flaggingOpen, setFlaggingOpen] = useState(false);
  const [flagSection, setFlagSection] = useState<FlagTrainerSection>("vr");
  const [flagIndex, setFlagIndex] = useState(0);
  const [flagCorrect, setFlagCorrect] = useState(0);
  const [flagTotal, setFlagTotal] = useState(0);
  const [flagChoice, setFlagChoice] = useState<boolean | null>(null);
  const flagTrainerQuestions = useMemo(
    () => getFlagTrainerQuestions(flagSection),
    [flagSection]
  );
  const currentFlagQuestion =
    flagTrainerQuestions.length > 0
      ? flagTrainerQuestions[flagIndex % flagTrainerQuestions.length]
      : null;
  const currentFlagDifficulty = currentFlagQuestion
    ? getFlagDifficulty(currentFlagQuestion)
    : "easy";
  const currentFlagShouldFlag = currentFlagDifficulty === "hard";
  const flagAnswered = flagChoice !== null;
  const flagWasCorrect = flagAnswered && flagChoice === currentFlagShouldFlag;
  const calculatorOverTarget =
    calculatorElapsedSeconds > calculatorProblem.targetSeconds;
  const calculatorPressurePct = Math.min(
    100,
    (calculatorElapsedSeconds / calculatorProblem.targetSeconds) * 100
  );
  const calculatorAccuracy =
    calculatorTotal > 0
      ? `${Math.round((calculatorCorrect / calculatorTotal) * 100)}%`
      : "-";
  const calculatorPromptTokens = calculatorProblem.prompt.split(" ");
  const calculatorPromptNumbers = useMemo(
    () => getCalculatorPromptNumbers(calculatorProblem.prompt),
    [calculatorProblem.prompt]
  );
  const calcValue = Number(calcDisplay) || 0;

  const setCalculatorPromptNumberStatus = useCallback(
    (index: number, status: CalculatorPromptNumberStatus) => {
      setCalculatorNumberStatuses((current) => {
        if (index < 0 || index >= calculatorPromptNumbers.length) return current;

        const next = Array.from(
          { length: calculatorPromptNumbers.length },
          (_, itemIndex) => current[itemIndex] ?? "idle"
        );
        next[index] = status;
        return next;
      });
    },
    [calculatorPromptNumbers.length]
  );

  const resetCalculatorPromptProgress = useCallback(
    (problem: CalculatorTrainerProblem) => {
      setCalculatorNumberStatuses(
        getCalculatorPromptNumbers(problem.prompt).map(() => "idle")
      );
      setCalculatorActiveNumberIndex(0);
    },
    []
  );

  const clearActiveCalculatorPromptNumber = useCallback(() => {
    setCalculatorPromptNumberStatus(calculatorActiveNumberIndex, "idle");
  }, [calculatorActiveNumberIndex, setCalculatorPromptNumberStatus]);

  const updateCalculatorPromptProgress = useCallback(
    (display: string) => {
      const expected = calculatorPromptNumbers[calculatorActiveNumberIndex];
      if (!expected) return;

      const entered = normaliseCalculatorProgressText(display);
      const target = normaliseCalculatorProgressText(expected);
      const status = target.startsWith(entered)
        ? "active-correct"
        : "active-wrong";
      setCalculatorPromptNumberStatus(calculatorActiveNumberIndex, status);
    },
    [
      calculatorActiveNumberIndex,
      calculatorPromptNumbers,
      setCalculatorPromptNumberStatus,
    ]
  );

  const finaliseCalculatorPromptNumber = useCallback(
    (display = calcDisplay) => {
      const expected = calculatorPromptNumbers[calculatorActiveNumberIndex];
      if (!expected) return;

      const entered = normaliseCalculatorProgressText(display);
      const target = normaliseCalculatorProgressText(expected);
      setCalculatorPromptNumberStatus(
        calculatorActiveNumberIndex,
        entered === target ? "complete-correct" : "complete-wrong"
      );
      setCalculatorActiveNumberIndex((current) =>
        Math.min(current + 1, calculatorPromptNumbers.length)
      );
    },
    [
      calcDisplay,
      calculatorActiveNumberIndex,
      calculatorPromptNumbers,
      setCalculatorPromptNumberStatus,
    ]
  );

  const submitCalculatorTrainerDisplay = useCallback(() => {
    if (!calculatorRunning) return;

    if (!calcWaiting) {
      finaliseCalculatorPromptNumber(calcDisplay);
    }

    const elapsed = calculatorElapsedSeconds;
    const correct = isCloseNumber(calcDisplay, calculatorProblem.answer);
    const onTarget = elapsed <= calculatorProblem.targetSeconds;
    setCalculatorTotal((current) => current + 1);
    setCalculatorCorrect((current) => current + (correct ? 1 : 0));
    setCalculatorFeedback(
      correct
        ? onTarget
          ? `Correct in ${elapsed.toFixed(1)}s. That is on target.`
          : `Correct in ${elapsed.toFixed(1)}s. Aim for ${calculatorProblem.targetSeconds}s next time.`
        : `Missed: ${calculatorProblem.answer}. Reset the entry pattern and go again.`
    );
    setCalculatorRunning(false);
    setCalculatorElapsedSeconds(elapsed);
  }, [
    calcDisplay,
    calcWaiting,
    calculatorElapsedSeconds,
    calculatorProblem.answer,
    calculatorProblem.targetSeconds,
    calculatorRunning,
    finaliseCalculatorPromptNumber,
  ]);

  useEffect(() => {
    if (!calculatorRunning) return;

    const timer = window.setInterval(() => {
      setCalculatorElapsedSeconds((current) => current + 0.1);
    }, 100);

    return () => window.clearInterval(timer);
  }, [calculatorRunning]);

  useEffect(() => {
    if (!calculatorOpen) return;

    const handleCalculatorKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (event.altKey && key === "c") {
        event.preventDefault();
        setCalculatorOpen((current) => !current);
        return;
      }

      if (!calculatorRunning) return;

      if (/^[0-9]$/.test(event.key)) {
        event.preventDefault();
        const nextDisplay =
          calcWaiting || calcDisplay === "0" ? event.key : `${calcDisplay}${event.key}`;
        setCalcDisplay(nextDisplay);
        setCalcWaiting(false);
        updateCalculatorPromptProgress(nextDisplay);
        return;
      }
      if (event.key === ".") {
        event.preventDefault();
        const nextDisplay = calcWaiting
          ? "0."
          : calcDisplay.includes(".")
            ? calcDisplay
            : `${calcDisplay}.`;
        setCalcDisplay(nextDisplay);
        setCalcWaiting(false);
        updateCalculatorPromptProgress(nextDisplay);
        return;
      }
      if (["+", "-", "*", "/"].includes(event.key)) {
        event.preventDefault();
        const current = Number(calcDisplay) || 0;
        if (!calcWaiting) {
          finaliseCalculatorPromptNumber(calcDisplay);
        }
        if (calcStored === null || calcOperator === null) {
          setCalcStored(current);
        } else {
          const result = calculateTrainerValue(calcStored, current, calcOperator);
          setCalcDisplay(String(Number(result.toFixed(8))));
          setCalcStored(result);
        }
        setCalcOperator(event.key);
        setCalcWaiting(true);
        return;
      }
      if (event.key === "Enter" || event.key === "=") {
        event.preventDefault();
        if (event.key === "Enter") {
          submitCalculatorTrainerDisplay();
          return;
        }
        const current = Number(calcDisplay) || 0;
        if (!calcWaiting) {
          finaliseCalculatorPromptNumber(calcDisplay);
        }
        if (calcStored === null || calcOperator === null) {
          setCalcStored(current);
        } else {
          const result = calculateTrainerValue(calcStored, current, calcOperator);
          setCalcDisplay(String(Number(result.toFixed(8))));
          setCalcStored(result);
        }
        setCalcOperator(null);
        setCalcWaiting(true);
        return;
      }
      if (event.key === "Backspace") {
        event.preventDefault();
        setCalcDisplay("0");
        setCalcWaiting(false);
        clearActiveCalculatorPromptNumber();
        return;
      }
      if (key === "m") {
        event.preventDefault();
        setCalcMemory((current) => current - calcValue);
        setCalcWaiting(true);
        return;
      }
      if (key === "p") {
        event.preventDefault();
        setCalcMemory((current) => current + calcValue);
        setCalcWaiting(true);
        return;
      }
      if (key === "c") {
        event.preventDefault();
        const now = getTrainerNowMs();
        if (now - lastMrcAt < 700) {
          setCalcMemory(0);
          setCalcDisplay("0");
          setLastMrcAt(0);
          return;
        }
        setCalcDisplay(String(calcMemory));
        updateCalculatorPromptProgress(String(calcMemory));
        setCalcWaiting(true);
        setLastMrcAt(now);
      }
    };

    window.addEventListener("keydown", handleCalculatorKeyDown);
    return () => window.removeEventListener("keydown", handleCalculatorKeyDown);
  }, [
    calculatorOpen,
    calculatorRunning,
    calcDisplay,
    calcStored,
    calcOperator,
    calcWaiting,
    calcValue,
    calcMemory,
    lastMrcAt,
    clearActiveCalculatorPromptNumber,
    finaliseCalculatorPromptNumber,
    submitCalculatorTrainerDisplay,
    updateCalculatorPromptProgress,
  ]);

  const resetTrainerCalculator = (problem = calculatorProblem) => {
    setCalcDisplay("0");
    setCalcStored(null);
    setCalcOperator(null);
    setCalcWaiting(false);
    resetCalculatorPromptProgress(problem);
  };

  const createFreshCalculatorProblem = (mode: CalculatorTrainerMode) => {
    let nextProblem = createCalculatorProblem(mode);

    for (
      let attempts = 0;
      attempts < 6 && nextProblem.prompt === lastCalculatorPromptRef.current;
      attempts += 1
    ) {
      nextProblem = createCalculatorProblem(mode);
    }

    lastCalculatorPromptRef.current = nextProblem.prompt;
    return nextProblem;
  };

  const clearTrainerCalculator = () => {
    resetTrainerCalculator();
  };

  const commitTrainerCalcOperation = (nextOperator?: string) => {
    const current = Number(calcDisplay) || 0;
    if (!calcWaiting) {
      finaliseCalculatorPromptNumber(calcDisplay);
    }
    if (calcStored === null || calcOperator === null) {
      setCalcStored(current);
    } else {
      const result = calculateTrainerValue(calcStored, current, calcOperator);
      setCalcDisplay(String(Number(result.toFixed(8))));
      setCalcStored(result);
    }
    setCalcOperator(nextOperator ?? null);
    setCalcWaiting(true);
  };

  const inputTrainerCalcDigit = (digit: string) => {
    const nextDisplay =
      calcWaiting || calcDisplay === "0" ? digit : `${calcDisplay}${digit}`;
    setCalcDisplay(nextDisplay);
    setCalcWaiting(false);
    updateCalculatorPromptProgress(nextDisplay);
  };

  const inputTrainerCalcDecimal = () => {
    const nextDisplay = calcWaiting
      ? "0."
      : calcDisplay.includes(".")
        ? calcDisplay
        : `${calcDisplay}.`;
    setCalcDisplay(nextDisplay);
    setCalcWaiting(false);
    updateCalculatorPromptProgress(nextDisplay);
  };

  const memoryRecallClearTrainer = () => {
    const now = getTrainerNowMs();
    if (now - lastMrcAt < 700) {
      setCalcMemory(0);
      setCalcDisplay("0");
      setLastMrcAt(0);
      return;
    }

    const nextDisplay = String(calcMemory);
    setCalcDisplay(nextDisplay);
    setCalcWaiting(true);
    updateCalculatorPromptProgress(nextDisplay);
    setLastMrcAt(now);
  };

  const memoryAddTrainer = (sign: 1 | -1) => {
    setCalcMemory((current) => current + sign * calcValue);
    setCalcWaiting(true);
  };

  const pressTrainerCalculatorButton = (key: string) => {
    if (!calculatorRunning) return;

    if (/^[0-9]$/.test(key)) {
      inputTrainerCalcDigit(key);
      return;
    }
    if (key === ".") {
      inputTrainerCalcDecimal();
      return;
    }
    if (["+", "-", "*", "/"].includes(key)) {
      commitTrainerCalcOperation(key);
      return;
    }
    if (key === "=") {
      commitTrainerCalcOperation();
      return;
    }
    if (key === "CE") {
      clearTrainerCalculator();
      return;
    }
    if (key === "MRC") {
      memoryRecallClearTrainer();
      return;
    }
    if (key === "M-") {
      memoryAddTrainer(-1);
      return;
    }
    if (key === "M+") {
      memoryAddTrainer(1);
    }
  };

  const prepareCalculatorTrainer = (mode: CalculatorTrainerMode) => {
    const nextProblem = createFreshCalculatorProblem(mode);
    setCalculatorMode(mode);
    setCalculatorProblem(nextProblem);
    resetTrainerCalculator(nextProblem);
    setCalculatorRunning(false);
    setCalculatorElapsedSeconds(0);
    setCalculatorFeedback(
      mode === "calibration"
        ? "Ready for a fresh 9-second calibration calculation."
        : "Ready for a fresh multi-step calculation."
    );
  };

  const openCalculatorTrainer = () => {
    setFlaggingOpen(false);
    setCalculatorOpen(true);
    prepareCalculatorTrainer("calibration");
  };

  const startCalculatorTrainer = (mode = calculatorMode) => {
    const nextProblem = createFreshCalculatorProblem(mode);
    setCalculatorMode(mode);
    setCalculatorProblem(nextProblem);
    resetTrainerCalculator(nextProblem);
    setCalculatorRunning(true);
    setCalculatorElapsedSeconds(0);
    setCalculatorFeedback(`${getCalculatorModeLabel(mode)} running with a new calculation.`);
  };

  const finishCalculatorProblem = () => {
    submitCalculatorTrainerDisplay();
  };

  const chooseFlagSection = (section: FlagTrainerSection) => {
    setFlagSection(section);
    setFlagIndex(0);
    setFlagCorrect(0);
    setFlagTotal(0);
    setFlagChoice(null);
  };

  const openFlaggingTrainer = () => {
    setCalculatorOpen(false);
    setCalculatorRunning(false);
    setFlaggingOpen(true);
    setFlagChoice(null);
  };

  const chooseFlag = (shouldFlag: boolean) => {
    if (flagChoice !== null || !currentFlagQuestion) return;

    const correct = shouldFlag === currentFlagShouldFlag;
    setFlagChoice(shouldFlag);
    setFlagTotal((current) => current + 1);
    setFlagCorrect((current) => current + (correct ? 1 : 0));
  };

  const nextFlagScenario = () => {
    setFlagChoice(null);
    setFlagIndex((current) => current + 1);
  };

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Skills Trainers
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              Short drills for the mechanics that show up inside your diagnostic fixes.
            </p>
          </div>
          <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
            {studyPlanTasks.length} linked study task{studyPlanTasks.length === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section
          id="calculator"
          className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
            calculatorOpen ? "xl:col-span-2" : ""
          }`}
        >
          {!calculatorOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                  <Calculator className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Calculator speed trainer
                  </h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Timed calculation using the same calculator and shortcuts as the question bank.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {[
                  ["Calibration", "9s"],
                  ["Mode", "Pressure"],
                  ["Input", "UCAT calculator"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-black text-slate-500">{label}</p>
                    <p className="mt-1 text-xl font-black text-slate-950">{value}</p>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={openCalculatorTrainer}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white hover:bg-blue-700"
              >
                Open trainer
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400">
                    Skills Trainers / Calculator Speed Trainer
                  </p>
                  <h2 className="mt-4 text-2xl font-black text-slate-950">
                    Calculator speed trainer
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCalculatorInstructionsOpen((current) => !current)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-black text-slate-700 hover:text-blue-600"
                  >
                    Instructions
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        calculatorInstructionsOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
                  {calculatorInstructionsOpen && (
                    <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                      Start a pressure round, use the calculator exactly as you would in the question bank, then submit the displayed value. Keyboard shortcuts match the question calculator.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setCalculatorOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  Back to trainers
                </button>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {(["calibration", "multi-step"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => prepareCalculatorTrainer(mode)}
                    className={`rounded-lg px-4 py-2 text-xs font-black ${
                      calculatorMode === mode
                        ? "bg-blue-600 text-white"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
                    }`}
                  >
                    {getCalculatorModeLabel(mode)}
                  </button>
                ))}
              </div>

              <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
                <div className="min-h-[470px] rounded-xl border border-slate-200 bg-white p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        Use the calculator to solve
                      </p>
                      <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3 text-4xl font-black leading-none">
                        {calculatorPromptTokens.map((token, index) => {
                          const promptNumberIndex = calculatorPromptTokens
                            .slice(0, index + 1)
                            .filter((item) => getCalculatorPromptNumberText(item)).length - 1;
                          const isNumberToken = getCalculatorPromptNumberText(token) !== null;
                          const status = isNumberToken
                            ? calculatorNumberStatuses[promptNumberIndex]
                            : undefined;

                          return (
                            <span
                              key={`${token}-${index}`}
                              className={
                                isNumberToken
                                  ? getCalculatorPromptNumberClass(status)
                                  : ["+", "-", "x", "/"].includes(token)
                                    ? "text-slate-400"
                                    : "text-slate-500"
                              }
                            >
                              {token}
                            </span>
                          );
                        })}
                        <span className="text-slate-400">=</span>
                      </div>
                      <p className="mt-5 text-sm font-black text-slate-950">
                        Accuracy: {calculatorAccuracy}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                      <p className="text-xs font-black text-slate-500">Target</p>
                      <p className="mt-1 text-2xl font-black text-slate-950">
                        {calculatorProblem.targetSeconds}s
                      </p>
                    </div>
                  </div>

                  <div className="mt-16 grid gap-4 lg:grid-cols-[1fr_160px] lg:items-end">
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                        Time pressure
                      </p>
                      <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${
                            calculatorOverTarget ? "bg-red-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${calculatorPressurePct}%` }}
                        />
                      </div>
                      <p className="mt-3 text-sm font-semibold leading-6 text-slate-500">
                        {calculatorProblem.hint}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-500">Time</p>
                      <p className={`mt-1 text-2xl font-black ${calculatorOverTarget ? "text-red-600" : "text-slate-950"}`}>
                        {formatTrainerClock(calculatorElapsedSeconds)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      ["Correct", String(calculatorCorrect)],
                      ["Attempted", String(calculatorTotal)],
                      ["Mode", getCalculatorModeLabel(calculatorMode)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs font-black text-slate-500">{label}</p>
                        <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-64">
                  <div className="w-64 rounded-sm border border-slate-700 bg-[#f3f4f6] p-3 text-black shadow-2xl">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-bold">Calculator</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCalculatorRunning(false);
                          setCalculatorOpen(false);
                        }}
                        className="rounded-sm px-2 text-sm font-bold hover:bg-slate-200"
                      >
                        x
                      </button>
                    </div>
                    <div className="mb-2 rounded-sm border border-slate-500 bg-white px-2 py-2 text-right font-mono text-2xl">
                      {calcDisplay}
                    </div>
                    <div className="grid grid-cols-4 gap-1.5 text-sm font-bold">
                      {calculatorButtonRows.flat().map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => pressTrainerCalculatorButton(key)}
                          disabled={!calculatorRunning}
                          className="rounded-sm border border-slate-400 bg-white py-2 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {key}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] font-semibold leading-4 text-slate-600">
                      Shortcuts: Alt+C closes, / divides, * multiplies, M = M-,
                      P = M+, C recalls MRC, double C clears memory, Backspace clears entry,
                      Enter submits.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      calculatorRunning
                        ? finishCalculatorProblem()
                        : startCalculatorTrainer(calculatorMode)
                    }
                    className={`mt-4 inline-flex h-14 w-full items-center justify-center gap-2 rounded-xl px-5 text-base font-black text-white shadow-lg ring-4 transition-colors ${
                      calculatorRunning
                        ? "bg-emerald-600 shadow-emerald-100 ring-emerald-100 hover:bg-emerald-700"
                        : "bg-blue-600 shadow-blue-100 ring-blue-100 hover:bg-blue-700"
                    }`}
                  >
                    <Timer className="h-5 w-5" aria-hidden="true" />
                    {calculatorRunning
                      ? "Submit answer"
                      : calculatorTotal > 0
                        ? "Start next calculation"
                        : "Start trainer"}
                  </button>
                  <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm font-semibold leading-6 text-slate-700">
                    {calculatorFeedback}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>

        <section
          id="flagging"
          className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${
            flaggingOpen ? "xl:col-span-2" : ""
          }`}
        >
          {!flaggingOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                  <Flag className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Flagging trainer
                  </h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    Open question-style drills, then decide whether each question is hard enough to flag.
                  </p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {flagTrainerSections.map((section) => (
                  <button
                    key={section.slug}
                    type="button"
                    onClick={() => chooseFlagSection(section.slug)}
                    className={`rounded-xl border p-3 text-left ${
                      flagSection === section.slug
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-rose-200"
                    }`}
                  >
                    <p className="text-sm font-black">{section.code}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">
                      {section.label}
                    </p>
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={openFlaggingTrainer}
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700"
              >
                Open questions
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400">
                    Skills Trainers / Flagging Trainer
                  </p>
                  <h2 className="mt-4 text-2xl font-black text-slate-950">
                    Question flagging trainer
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                    Read the question first, then decide whether it deserves a flag or should be answered now.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFlaggingOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black text-slate-600 hover:bg-slate-50"
                >
                  Back to trainers
                </button>
              </div>
              <FlaggingTrainerPanel
                flagSection={flagSection}
                currentFlagQuestion={currentFlagQuestion}
                currentFlagDifficulty={currentFlagDifficulty}
                flagAnswered={flagAnswered}
                flagChoice={flagChoice}
                flagCorrect={flagCorrect}
                flagTotal={flagTotal}
                flagWasCorrect={flagWasCorrect}
                flagIndex={flagIndex}
                flagQuestionCount={flagTrainerQuestions.length}
                onChooseFlag={chooseFlag}
                onChooseSection={chooseFlagSection}
                onNext={nextFlagScenario}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function FlagTrainerQuestionDetails({
  question,
}: {
  question: UCATQuestion;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 text-sm font-semibold leading-6 text-slate-700">
        {question.stimulus.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <FlagTrainerVisual visual={question.visual} />
      {"options" in question && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <div
              key={option.key}
              className="grid grid-cols-[32px_1fr] gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              <span className="font-black text-slate-950">{option.key}.</span>
              <span>{option.text}</span>
            </div>
          ))}
        </div>
      )}
      {"yesNoStatements" in question && (
        <div className="space-y-2">
          {question.yesNoStatements.map((statement, index) => (
            <div
              key={statement.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              {index + 1}. {statement.text}
            </div>
          ))}
        </div>
      )}
      {"categoryItems" in question && (
        <div className="space-y-2">
          {question.categoryItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              {index + 1}. {item.text}
            </div>
          ))}
        </div>
      )}
      {"dragItems" in question && (
        <div className="space-y-2">
          {question.dragItems.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold leading-6 text-slate-700"
            >
              {index + 1}. {item.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlaggingTrainerPanel({
  flagSection,
  currentFlagQuestion,
  currentFlagDifficulty,
  flagAnswered,
  flagChoice,
  flagCorrect,
  flagTotal,
  flagWasCorrect,
  flagIndex,
  flagQuestionCount,
  onChooseFlag,
  onChooseSection,
  onNext,
}: {
  flagSection: FlagTrainerSection;
  currentFlagQuestion: UCATQuestion | null;
  currentFlagDifficulty: FlagDifficulty;
  flagAnswered: boolean;
  flagChoice: boolean | null;
  flagCorrect: number;
  flagTotal: number;
  flagWasCorrect: boolean;
  flagIndex: number;
  flagQuestionCount: number;
  onChooseFlag: (shouldFlag: boolean) => void;
  onChooseSection: (section: FlagTrainerSection) => void;
  onNext: () => void;
}) {
  const sectionCode =
    flagTrainerSections.find((section) => section.slug === flagSection)?.code ?? "VR";
  const style = sectionStyle(sectionCode);
  const shouldFlag = currentFlagDifficulty === "hard";
  const subtypeLabel = currentFlagQuestion
    ? getUCATSubtypeMeta(currentFlagQuestion.subtype).label
    : "";

  return (
    <div className="mt-5">
      <div className="flex flex-wrap gap-2">
        {flagTrainerSections.map((section) => {
          const active = flagSection === section.slug;
          return (
            <button
              key={section.slug}
              type="button"
              onClick={() => onChooseSection(section.slug)}
              className={`rounded-lg px-4 py-2 text-xs font-black ${
                active
                  ? style.badgeClass
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600"
              }`}
            >
              {section.code}
            </button>
          );
        })}
      </div>

      {!currentFlagQuestion ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold text-slate-600">
          No tagged questions found for this section yet.
        </div>
      ) : (
        <>
          <article className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-lg px-3 py-1 text-xs font-black ${style.badgeClass}`}>
                  {sectionCode}
                </span>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                  {subtypeLabel}
                </span>
              </div>
              <span className="text-xs font-black text-slate-500">
                {flagCorrect}/{flagTotal} correct
              </span>
            </div>

            <div className="mt-4 grid min-h-[560px] gap-4 xl:grid-cols-[1fr_0.78fr]">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                  Question {flagQuestionCount > 0 ? (flagIndex % flagQuestionCount) + 1 : 0} of {flagQuestionCount}
                </p>
                <h3 className="mt-3 text-base font-black text-slate-950">
                  {currentFlagQuestion.title}
                </h3>
                <div className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3">
                  <p className="text-xs font-black uppercase tracking-wide text-rose-600">
                    Question
                  </p>
                  <p className="mt-2 text-lg font-black leading-7 text-slate-950">
                    {currentFlagQuestion.question}
                  </p>
                  {"instruction" in currentFlagQuestion && (
                    <p className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm font-semibold leading-6 text-slate-600">
                      {currentFlagQuestion.instruction}
                    </p>
                  )}
                </div>
                <div className="mt-5 max-h-[330px] overflow-y-auto pr-2">
                  <FlagTrainerQuestionDetails question={currentFlagQuestion} />
                </div>
              </div>

              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-rose-600">
                  Hard or not hard?
                </p>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                  Decide whether this question is worth flagging under exam pressure.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => onChooseFlag(true)}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg bg-rose-600 px-5 text-sm font-black text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    disabled={flagAnswered}
                  >
                    Tag as hard
                  </button>
                  <button
                    type="button"
                    onClick={() => onChooseFlag(false)}
                    className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                    disabled={flagAnswered}
                  >
                    Not hard
                  </button>
                </div>
                <p className="mt-4 text-xs font-semibold leading-5 text-slate-500">
                  Judge the question, not whether you know the answer right now.
                  Hard means it is likely to drain time under exam pressure.
                </p>
                {flagAnswered && (
                  <div
                    className={`mt-5 rounded-xl border p-4 text-sm font-semibold leading-6 ${
                      flagWasCorrect
                        ? "border-emerald-100 bg-emerald-50 text-emerald-900"
                        : "border-red-100 bg-red-50 text-red-900"
                    }`}
                  >
                    <p className="font-black">
                      {flagWasCorrect ? "Correct decision." : "Not quite."}
                    </p>
                    <p className="mt-1">
                      This was tagged {currentFlagDifficulty}.{" "}
                      {shouldFlag
                        ? "Hard-tagged questions should be flagged so you can bank easier marks first."
                        : "Easy and medium questions should usually be answered rather than parked."}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {currentFlagQuestion.tags?.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/80 px-3 py-1 text-xs font-black">
                          {formatTrainerTag(tag)}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-xs font-semibold">
                      You chose: {flagChoice ? "tag as hard" : "not hard"}.
                    </p>
                    <button
                      type="button"
                      onClick={onNext}
                      className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
                    >
                      Next question
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </article>
        </>
      )}
    </div>
  );
}

function ProgressContent({
  isPremium,
  checkoutLoading,
  onUpgrade,
  practiceStats,
  recentPracticeSets,
  latestDiagnostic,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
}: PremiumGateProps & {
  practiceStats: PracticeStats;
  recentPracticeSets: RecentPracticeSet[];
  latestDiagnostic: DashboardDiagnostic | null;
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
}) {
  const progressItems = getQuestionBankProgress(practiceStats);
  const bankCompleted = progressItems.reduce(
    (sum, item) => sum + item.completed,
    0
  );
  const bankTotal = progressItems.reduce((sum, item) => sum + item.total, 0);
  const bankPercent = bankTotal > 0 ? Math.round((bankCompleted / bankTotal) * 100) : 0;
  const studyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const completedOrClearedTaskIds = new Set([
    ...completedDashboardTaskIds,
    ...removedDashboardTaskIds,
  ]);
  const tickedStudyPlanTasks = studyPlanTasks.filter((task) =>
    completedOrClearedTaskIds.has(task.id)
  );
  const taskProgressPercent =
    studyPlanTasks.length > 0
      ? Math.round((tickedStudyPlanTasks.length / studyPlanTasks.length) * 100)
      : 0;
  const activePracticeDays = practiceStats.questionCalendarDays.filter(
    (day) => day.questions > 0
  );
  const sectionImprovementItems = sectionCodes.flatMap((code) => {
    const answered = practiceStats.sectionAnswered[code];
    if (answered === 0) return [];
    const correct = practiceStats.sectionCorrect[code];
    return [
      {
        title: `${code} accuracy`,
        text: `${correct}/${answered} answered questions correct.`,
        href: `/phloemai/question-bank/${code.toLowerCase()}`,
      },
    ];
  });
  const recentImprovementItems = [
    ...tickedStudyPlanTasks.slice(0, 3).map((task) => ({
      title: task.title,
      text: task.fix,
      href: task.href,
    })),
    ...sectionImprovementItems,
  ].slice(0, 5);
  const progressStatCards = [
    {
      label: "Accuracy",
      value: practiceStats.hasCompletedQuestions
        ? `${practiceStats.accuracy}%`
        : "-",
      helper: practiceStats.hasCompletedQuestions
        ? "From saved question attempts"
        : "No saved practice yet",
    },
    {
      label: "Average time / question",
      value: practiceStats.hasCompletedQuestions
        ? `${practiceStats.avgSeconds}s`
        : "-",
      helper: practiceStats.hasCompletedQuestions
        ? "Across answered practice questions"
        : "No timed answers yet",
    },
    {
      label: "Study plan tasks",
      value:
        studyPlanTasks.length > 0
          ? `${tickedStudyPlanTasks.length}/${studyPlanTasks.length}`
          : "0/0",
      helper:
        studyPlanTasks.length > 0
          ? `${taskProgressPercent}% ticked off`
          : "Run a diagnostic to create tasks",
    },
  ];

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-3">
        {progressStatCards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-black text-slate-700">{card.label}</p>
            <p className="mt-2 text-3xl font-black leading-none text-slate-400">
              {card.value}
            </p>
            <p className="mt-2 text-xs font-bold text-slate-400">
              {card.helper}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.08fr_0.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black">Recent sets</h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {bankCompleted} completed questions across {activePracticeDays.length} active day{activePracticeDays.length === 1 ? "" : "s"} in {practiceStats.monthLabel}.
              </p>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
              {practiceStats.monthLabel}
            </span>
          </div>

          <div className="mt-5">
            <RecentPracticeSetsPanel
              sets={recentPracticeSets.slice(0, 8)}
              emptyTitle="No practice sets saved yet."
              emptyText="Start a question-bank set and mark it when you are ready."
            />
          </div>
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
            {progressItems.map((item) => {
              const style = sectionStyle(item.code);
              const percent =
                item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
              const allCompleted = item.total > 0 && item.completed >= item.total;
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
                    {allCompleted ? "Open bank" : "Resume bank"}
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
          title="Unlock study plan progress"
          description="Premium shows the exact tasks improving, what still needs work and the actions driving score gains."
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black">Study plan progress</h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                {taskProgressPercent}%
              </span>
            </div>
            <p className="mt-2 text-xs font-bold text-slate-500">
              {tickedStudyPlanTasks.length} of {studyPlanTasks.length} tasks ticked off.
            </p>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${taskProgressPercent}%` }}
              />
            </div>
            {tickedStudyPlanTasks.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  No tasks ticked off yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Tick tasks on the dashboard and they will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {tickedStudyPlanTasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <Link
                      key={task.id}
                      href={task.href}
                      className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 transition-colors hover:border-emerald-200 hover:bg-emerald-50"
                    >
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${task.iconClass}`}>
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-slate-950">
                          {task.title}
                        </h3>
                        <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                          {task.fix}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <Link
              href="/phloemai/dashboard"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              Back to dashboard tasks
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
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
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black">Recent improvements</h2>
                <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
                {recentImprovementItems.length}
              </span>
            </div>
            {recentImprovementItems.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <p className="text-sm font-black text-slate-700">
                  No completed tasks or saved answers yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Tick off study-plan tasks or complete practice questions to populate this card.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {recentImprovementItems.map((item, index) => (
                  <Link
                    key={`${item.title}-${index}`}
                    href={item.href}
                    className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/60"
                  >
                    <div>
                      <h3 className="text-sm font-black text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                        {item.text}
                      </p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
            <Link
              href="/phloemai/question-bank"
              className="mt-5 inline-flex items-center gap-2 text-sm font-black text-blue-600 hover:text-blue-700"
            >
              Open practice activity
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
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
  practiceStats,
  latestDiagnostic,
  diagnosticHistory,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
}: PremiumGateProps & {
  practiceStats: PracticeStats;
  latestDiagnostic: DashboardDiagnostic | null;
  diagnosticHistory: DashboardDiagnostic[];
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
}) {
  const [reportFilter, setReportFilter] = useState<ReportSectionFilter>("All");
  const [selectedReportId, setSelectedReportId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    const params = new URLSearchParams(window.location.search);
    return params.get("attempt") ?? params.get("report");
  });
  const [generatedFeedbackById, setGeneratedFeedbackById] = useState<
    Record<string, string>
  >({});
  const [aiRequestingReportId, setAiRequestingReportId] = useState<string | null>(
    null
  );
  const [aiFeedbackNotice, setAiFeedbackNotice] = useState<string | null>(null);
  const [aiFeedbackError, setAiFeedbackError] = useState<string | null>(null);
  const reportHistory = useMemo(
    () =>
      diagnosticHistory.length > 0
        ? diagnosticHistory
        : latestDiagnostic
          ? [latestDiagnostic]
          : [],
    [diagnosticHistory, latestDiagnostic]
  );
  const selectedDiagnostic =
    reportHistory.find((report) => report.id === selectedReportId) ??
    latestDiagnostic;
  const selectedAiFeedbackText =
    selectedDiagnostic
      ? generatedFeedbackById[selectedDiagnostic.id] ??
        selectedDiagnostic.aiFeedbackText
      : null;
  const selectedReportIsLatest =
    Boolean(selectedDiagnostic?.id && latestDiagnostic?.id) &&
    selectedDiagnostic?.id === latestDiagnostic?.id;
  const hasDiagnostic = Boolean(selectedDiagnostic);
  const reportFeaturesUnlocked =
    isPremium || isFreeQrDiagnostic(selectedDiagnostic);
  const filterMatches =
    reportFilter === "All" || selectedDiagnostic?.section === reportFilter;
  const diagnosticIssueCards =
    selectedDiagnostic && filterMatches
      ? selectedDiagnostic.issues.map(buildReportIssueCard)
      : [];
  const hasSignals = diagnosticIssueCards.length > 0;
  const allStudyPlanTasks = getDiagnosticStudyPlanTasks(selectedDiagnostic);
  const studyPlanTasks = getActiveDiagnosticStudyPlanTasks(
    selectedDiagnostic,
    completedDashboardTaskIds,
    removedDashboardTaskIds
  );
  const recommendedTask = studyPlanTasks[0];
  const completedCurrentPlan = allStudyPlanTasks.length > 0 && !recommendedTask;
  const feedbackStatus =
    selectedAiFeedbackText
      ? "Ready"
      : selectedDiagnostic?.aiFeedbackStatus === "queued_no_api_key"
        ? "Queued"
        : selectedDiagnostic
          ? "Not requested"
          : "Waiting";

  const feedbackHelper =
    selectedAiFeedbackText
      ? selectedReportIsLatest
        ? "Generated from your latest diagnostic."
        : "Generated from the selected previous diagnostic."
      : selectedDiagnostic
        ? "AI feedback has not been generated for this diagnostic yet."
        : "Complete and mark a diagnostic to generate personalised written feedback.";

  const reportFilters: ReportSectionFilter[] = ["All", "QR", "VR", "DM", "SJT"];

  const latestDiagnosticSummary = hasDiagnostic
    ? selectedDiagnostic?.section
      ? `${selectedReportIsLatest ? "Latest" : "Selected"} ${selectedDiagnostic.section} diagnostic`
      : selectedReportIsLatest
        ? "Latest diagnostic"
        : "Selected diagnostic"
    : "No diagnostic or marked practice report saved yet";

  const metricAccuracy = hasDiagnostic
    ? `${selectedDiagnostic?.accuracy ?? 0}%`
    : practiceStats.hasCompletedQuestions
      ? `${practiceStats.accuracy}%`
      : "-";
  const metricAvgTime = practiceStats.hasCompletedQuestions
    ? `${practiceStats.avgSeconds}s`
    : "-";

  const signalBadgeText = hasSignals
    ? "Saved issue data found"
    : selectedDiagnostic
      ? "No issues for this filter"
      : "Waiting for diagnostic";

  const signalBadgeClass = hasSignals
    ? "bg-emerald-50 text-emerald-700"
    : "bg-slate-100 text-slate-500";

  const emptyIssueMessage =
    hasDiagnostic && !filterMatches
      ? `No ${reportFilter} issues in the selected ${selectedDiagnostic?.section} diagnostic.`
      : hasDiagnostic
        ? "No issue labels were saved for this diagnostic."
        : "Complete and mark a diagnostic to start detecting issues from your own telemetry.";
  const emptyIssueActionHref = hasDiagnostic
    ? "/phloemai/practice"
    : "/phloemai/diagnostic";
  const emptyIssueActionLabel = hasDiagnostic ? "Open practice" : "Run diagnostic";

  const noFeedbackActionLabel = hasDiagnostic
    ? aiRequestingReportId === selectedDiagnostic?.id
      ? "Generating..."
      : "Generate AI feedback"
    : "Run diagnostic";

  const reportIssueIntro = hasDiagnostic
    ? selectedReportIsLatest
      ? "Showing the issue labels, causes, supporting evidence and study tasks saved from your latest diagnostic."
      : "Showing the issue labels, causes, supporting evidence and study tasks saved from the selected previous diagnostic."
    : "Complete a diagnostic to replace generic guidance with your saved issue scan.";

  const recommendedTaskHref = reportFeaturesUnlocked
    ? recommendedTask?.href ?? "/phloemai/practice"
    : "/phloemai/account";
  const recommendedTaskText = !reportFeaturesUnlocked
    ? "Premium unlocks the personalised study plan tasks."
    : recommendedTask
      ? recommendedTask.fix
      : completedCurrentPlan
        ? "All tasks from this report are ticked off."
        : "Start a recommended task based on your report.";

  const filteredLabel =
    reportFilter === "All"
      ? "all sections"
      : `${reportFilter} only`;

  const hasAiFeedback = Boolean(selectedAiFeedbackText);

  const feedbackBadgeClass = hasAiFeedback
    ? "bg-emerald-50 text-emerald-700"
    : "bg-violet-50 text-violet-700";

  const issueCardsToRender = diagnosticIssueCards;

  const selectReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setAiFeedbackNotice(null);
    setAiFeedbackError(null);
    window.history.replaceState(
      null,
      "",
      `/phloemai/report?attempt=${encodeURIComponent(reportId)}`
    );
  };

  const requestSelectedReportAiFeedback = async () => {
    if (!selectedDiagnostic?.id) return;

    setAiRequestingReportId(selectedDiagnostic.id);
    setAiFeedbackNotice(null);
    setAiFeedbackError(null);

    try {
      const response = await fetch("/api/ai/diagnostic-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: selectedDiagnostic.id,
          section: selectedDiagnostic.section,
          accuracy: selectedDiagnostic.accuracy,
          issues: selectedDiagnostic.issues,
          strengths: selectedDiagnostic.strengths,
        }),
      });
      const payload = (await response.json()) as {
        feedback?: string;
        error?: string;
      };

      if (!response.ok || !payload.feedback) {
        throw new Error(payload.error ?? "AI feedback could not be generated.");
      }

      setGeneratedFeedbackById((current) => ({
        ...current,
        [selectedDiagnostic.id]: payload.feedback ?? "",
      }));
      setAiFeedbackNotice("AI feedback generated and saved to this report.");
    } catch (error) {
      setAiFeedbackError(
        error instanceof Error
          ? error.message
          : "AI feedback could not be generated."
      );
    } finally {
      setAiRequestingReportId(null);
    }
  };

  return (
    <div className="space-y-5 px-6 py-5 lg:px-8">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 md:grid-cols-[1fr_220px_220px] md:items-center">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
              <Bookmark className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-sm font-black">
                {selectedReportIsLatest ? "Latest diagnostic" : "Selected diagnostic"}
              </h2>
              <p className="mt-1 text-xs font-bold text-slate-500">
                {latestDiagnosticSummary}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-700">Overall accuracy</p>
            <p className="mt-2 text-3xl font-black text-slate-400">
              {metricAccuracy}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-black text-slate-700">Avg. time / question</p>
            <p className="mt-2 text-3xl font-black text-slate-400">
              {metricAvgTime}
            </p>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        {reportFilters.map((filter) => {
          const active = reportFilter === filter;
          return (
          <button
            type="button"
            key={filter}
            onClick={() => setReportFilter(filter)}
            className={`h-8 rounded-full px-8 text-xs font-black ${
              active
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-600"
            }`}
          >
            {filter}
          </button>
        );
        })}
      </div>

      <section className="rounded-xl border border-violet-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-blue-600">
              Phloem personalised feedback
            </h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
              {feedbackHelper}
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${feedbackBadgeClass}`}>
            {feedbackStatus}
          </span>
        </div>
        {selectedAiFeedbackText ? (
          <ExpandableAiFeedback
            text={selectedAiFeedbackText}
            className="mt-4 text-sm font-semibold leading-7 text-slate-700"
            paragraphClassName="whitespace-pre-wrap"
            buttonClassName="mt-4 text-sm font-black text-blue-600 hover:text-blue-700"
          />
        ) : (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-violet-100 bg-violet-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold leading-6 text-slate-600">
              {hasDiagnostic
                ? "Generate AI feedback for this saved diagnostic. If feedback already exists, it will reload here."
                : "The generated feedback will appear here above the issue scan."}
            </p>
            {hasDiagnostic ? (
              <button
                type="button"
                onClick={() => void requestSelectedReportAiFeedback()}
                disabled={aiRequestingReportId === selectedDiagnostic?.id}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {noFeedbackActionLabel}
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link
                href="/phloemai/diagnostic"
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
              >
                {noFeedbackActionLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}
        {aiFeedbackNotice && (
          <p className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
            {aiFeedbackNotice}
          </p>
        )}
        {aiFeedbackError && (
          <p className="mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-black text-red-700">
            {aiFeedbackError}
          </p>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide">
              Issue scan
            </h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-500">
              {reportIssueIntro}
            </p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-black ${signalBadgeClass}`}>
            {signalBadgeText}
          </span>
        </div>

        <p className="mt-3 text-xs font-black uppercase tracking-wide text-slate-400">
          Filter: {filteredLabel}
        </p>

        {!hasSignals && (
          <div className="mt-4 flex flex-col gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>{emptyIssueMessage}</span>
            {hasDiagnostic && !filterMatches ? (
              <button
                type="button"
                onClick={() => setReportFilter("All")}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
              >
                Show all sections
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            ) : (
              <Link
                href={emptyIssueActionHref}
                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700"
              >
                {emptyIssueActionLabel}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </div>
        )}

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {issueCardsToRender.map((issue) => (
            <ReportIssueSignalCard
              key={issue.id}
              issue={issue}
              isPremium={reportFeaturesUnlocked}
              hasSignals
              checkoutLoading={checkoutLoading}
              onUpgrade={onUpgrade}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
        <ClientPremiumGate
          isPremium={reportFeaturesUnlocked}
          checkoutLoading={checkoutLoading}
          onUpgrade={onUpgrade}
          title="Unlock personalised study plan"
          description="Premium reveals the exact drills and next tasks generated from this diagnostic report."
          featureLabel="Premium study plan"
        >
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-wide">
              Personalised study plan
            </h2>
            {studyPlanTasks.length > 0 ? (
              <ol className="mt-4 space-y-3">
                {studyPlanTasks.map((task, index) => {
                  const Icon = task.icon;
                  return (
                    <li key={task.id}>
                      <Link
                        href={task.href}
                        className="grid grid-cols-[36px_1fr] gap-3 rounded-xl border border-blue-100 bg-blue-50/40 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50"
                      >
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-blue-600" aria-hidden="true" />
                            <h3 className="text-xs font-black uppercase tracking-wide text-blue-700">
                              {task.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-sm font-semibold leading-6 text-slate-700">
                            {task.fix}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-2 text-xs font-black text-blue-600">
                            Start task
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <Link
                href={completedCurrentPlan ? "/phloemai/diagnostic" : "/phloemai/practice"}
                className="mt-4 block rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600 transition-colors hover:border-blue-200 hover:bg-blue-50/70"
              >
                <span>
                  {completedCurrentPlan
                    ? "All tasks from this report are ticked off."
                    : "Study tasks will appear here as the saved fixes from your latest diagnostic."}
                </span>
                <span className="mt-3 inline-flex items-center gap-2 text-xs font-black text-blue-600">
                  {completedCurrentPlan ? "Run another diagnostic" : "Open practice"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            )}
          </section>
        </ClientPremiumGate>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide">
                View previous reports
              </h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Open an earlier diagnostic to reload its AI feedback, issue scan
                and study plan on this page.
              </p>
            </div>
            <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-600">
              {reportHistory.length} saved
            </span>
          </div>
          <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
            {reportHistory.length === 0 ? (
              <Link
                href="/phloemai/diagnostic"
                className="block px-4 py-8 text-center transition-colors hover:bg-blue-50/70"
              >
                <p className="text-sm font-black text-slate-700">
                  No previous reports yet.
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Saved diagnostics will appear here after you mark them.
                </p>
                <span className="mt-4 inline-flex items-center justify-center gap-2 text-xs font-black text-blue-600">
                  Run diagnostic
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            ) : (
              reportHistory.map((report, index) => {
                const active = report.id === selectedDiagnostic?.id;
                const reportAiReady = Boolean(
                  generatedFeedbackById[report.id] ?? report.aiFeedbackText
                );
                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => selectReport(report.id)}
                    aria-pressed={active}
                    className={`grid w-full gap-3 border-b border-slate-100 px-4 py-3 text-left transition-colors last:border-b-0 sm:grid-cols-[1fr_90px_86px] sm:items-center ${
                      active
                        ? "bg-blue-50 text-blue-800"
                        : "bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-black text-slate-950">
                        {index === 0 ? "Latest report" : `Previous report ${index}`}
                      </p>
                      <p className="mt-1 text-xs font-bold text-slate-500">
                        {formatDiagnosticReportDate(report.completedAt)}
                      </p>
                    </div>
                    <span className="text-xs font-black">{report.section}</span>
                    <span className="text-xs font-black">
                      {reportAiReady ? "AI ready" : `${report.accuracy}%`}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </section>
      </div>

      <section className="flex flex-col gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-blue-600">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
          <p className="text-sm font-black">
            Ready to improve?{" "}
            <span className="font-semibold text-slate-600">
              {recommendedTaskText}
            </span>
          </p>
        </div>
        <Link
          href={recommendedTaskHref}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-7 text-sm font-black text-white hover:bg-blue-700"
        >
          {!reportFeaturesUnlocked
            ? "Upgrade"
            : recommendedTask
              ? "Start recommended task"
              : "Open practice"}
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
  diagnosticCredits,
  aiDiagnosticLastUsedAt,
  checkoutLoading,
  onUpgrade,
  onLogout,
}: {
  firstName: string;
  plan: string;
  email: string;
  diagnosticCredits: number;
  aiDiagnosticLastUsedAt?: string | null;
  checkoutLoading: boolean;
  onUpgrade: () => void;
  onLogout: () => void;
}) {
  const [creditNow, setCreditNow] = useState(() => Date.now());
  const creditDisplay = getAiDiagnosticCreditDisplay({
    plan,
    diagnosticCredits,
    lastUsedAt: aiDiagnosticLastUsedAt,
    now: creditNow,
  });

  useEffect(() => {
    const nextAvailableAt = getNextAiDiagnosticCreditAt(aiDiagnosticLastUsedAt);
    if (plan !== "Premium" || !nextAvailableAt) return;

    const intervalId = window.setInterval(() => setCreditNow(Date.now()), 1000);
    return () => window.clearInterval(intervalId);
  }, [aiDiagnosticLastUsedAt, plan]);

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
              Premium unlocks mock diagnostics, full mocks, subtest mocks,
              15-minute sprints, deeper issue analysis and personalised study
              plan tasks.
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

        <section className="rounded-xl border border-violet-100 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-sm font-black uppercase tracking-wide">
            Diagnostic AI credit
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="rounded-xl bg-violet-50 p-5 text-center">
              <p className="text-xs font-black uppercase tracking-wide text-violet-700">
                Credit
              </p>
              <p className="mt-2 text-4xl font-black text-violet-700">
                {creditDisplay.value}
              </p>
              <p className="mt-2 text-xs font-black text-violet-700">
                {creditDisplay.status}
              </p>
            </div>
            <p className="text-sm font-semibold leading-6 text-slate-600">
              {creditDisplay.helper} AI feedback can only be generated from a
              saved diagnostic attempt owned by your logged-in account.
            </p>
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
  practiceStats,
  recentPracticeSets,
  latestDiagnostic,
  diagnosticHistory,
  completedDashboardTaskIds,
  removedDashboardTaskIds,
  diagnosticCredits,
  aiDiagnosticLastUsedAt,
  onUpgrade,
  onLogout,
}: {
  view: Exclude<DashboardView, "dashboard">;
  firstName: string;
  plan: string;
  email: string;
  isPremium: boolean;
  checkoutLoading: boolean;
  practiceStats: PracticeStats;
  recentPracticeSets: RecentPracticeSet[];
  latestDiagnostic: DashboardDiagnostic | null;
  diagnosticHistory: DashboardDiagnostic[];
  completedDashboardTaskIds: Set<string>;
  removedDashboardTaskIds: Set<string>;
  diagnosticCredits: number;
  aiDiagnosticLastUsedAt?: string | null;
  onUpgrade: () => void;
  onLogout: () => void;
}) {
  const freeDiagnosticFeaturesUnlocked = isFreeQrDiagnostic(latestDiagnostic);
  const diagnosticStudyPlanUnlocked =
    isPremium || freeDiagnosticFeaturesUnlocked;

  if (view === "diagnostic") {
    return (
      <DiagnosticContent
        isPremium={isPremium}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        latestDiagnostic={latestDiagnostic}
        diagnosticHistory={diagnosticHistory}
        plan={plan}
        diagnosticCredits={diagnosticCredits}
        aiDiagnosticLastUsedAt={aiDiagnosticLastUsedAt}
      />
    );
  }
  if (view === "mock-diagnostic") {
    return <MockDiagnosticContent />;
  }
  if (view === "practice") {
    return (
      <PracticeContent
        latestDiagnostic={latestDiagnostic}
        completedDashboardTaskIds={completedDashboardTaskIds}
        removedDashboardTaskIds={removedDashboardTaskIds}
        recentPracticeSets={recentPracticeSets}
        isPremium={diagnosticStudyPlanUnlocked}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
      />
    );
  }
  if (view === "skills-trainers") {
    return <SkillsTrainersContent latestDiagnostic={latestDiagnostic} />;
  }
  if (view === "progress") {
    return (
      <ProgressContent
        isPremium={diagnosticStudyPlanUnlocked}
        checkoutLoading={checkoutLoading}
        onUpgrade={onUpgrade}
        practiceStats={practiceStats}
        recentPracticeSets={recentPracticeSets}
        latestDiagnostic={latestDiagnostic}
        completedDashboardTaskIds={completedDashboardTaskIds}
        removedDashboardTaskIds={removedDashboardTaskIds}
      />
    );
  }
  if (view === "account") {
    return (
      <AccountContent
        firstName={firstName}
        plan={plan}
        email={email}
        diagnosticCredits={diagnosticCredits}
        aiDiagnosticLastUsedAt={aiDiagnosticLastUsedAt}
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
      practiceStats={practiceStats}
      latestDiagnostic={latestDiagnostic}
      diagnosticHistory={diagnosticHistory}
      completedDashboardTaskIds={completedDashboardTaskIds}
      removedDashboardTaskIds={removedDashboardTaskIds}
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
  legalAccepted,
  setLegalAccepted,
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
  legalAccepted: boolean;
  setLegalAccepted: (value: boolean) => void;
  submitting: boolean;
  message: string | null;
  error: string | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div className="min-h-screen bg-[#f8fbff] px-5 py-10 text-[#0b1143]">
      <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1fr] lg:items-center">
        <div>
          <Link
            href="/phloemai"
            className="mb-8 inline-flex items-center gap-2 text-sm font-black text-slate-600 transition-colors hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to PhloemAI
          </Link>

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
            Your account stores diagnostics, AI feedback, personalised study
            plan tasks and progress
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

            {mode === "signup" && (
              <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={legalAccepted}
                    onChange={(event) => setLegalAccepted(event.target.checked)}
                    required
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300"
                  />
                  <span className="text-xs font-bold leading-5 text-slate-700">
                    I agree to the{" "}
                    <Link
                      href="/terms-and-conditions"
                      className="text-blue-700 underline"
                    >
                      Terms and Conditions
                    </Link>{" "}
                    and confirm I have read the{" "}
                    <Link href="/privacy-policy" className="text-blue-700 underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/phloemai-disclaimer"
                      className="text-blue-700 underline"
                    >
                      AI/Data Disclaimer
                    </Link>
                    .
                  </span>
                </label>
                <p className="text-xs font-semibold leading-5 text-slate-600">
                  PhloemAI collects practice telemetry such as answers, timing,
                  calculator use and optional attention tracking to provide
                  feedback. Do not enter sensitive medical or third-party
                  personal data.
                </p>
              </div>
            )}

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

function DashboardFeedbackPanel({
  latestDiagnostic,
  practiceStats,
  isPremium,
  className = "",
}: {
  latestDiagnostic: DashboardDiagnostic | null;
  practiceStats: PracticeStats;
  isPremium: boolean;
  className?: string;
}) {
  const hasDiagnostic = Boolean(latestDiagnostic);
  const aiText = latestDiagnostic?.aiFeedbackText ?? null;
  const aiStatusValue = aiText
    ? "Ready"
    : latestDiagnostic
      ? latestDiagnostic.aiFeedbackStatus === "queued_no_api_key"
        ? "Pending"
        : latestDiagnostic.aiFeedbackStatus === "ready"
          ? "Ready"
          : "Not requested"
      : "Pending";
  const diagnosticStatusValue = hasDiagnostic ? "Saved" : "Waiting";
  const diagnosticStatusClass = hasDiagnostic
    ? "bg-emerald-50 text-emerald-700"
    : "bg-blue-50 text-blue-600";
  const aiStatusClass = aiText
    ? "bg-emerald-50 text-emerald-700"
    : "bg-violet-50 text-violet-600";

  const sectionTabs: Array<{ code: UCATSectionCode; label: string }> = [
    { code: "VR", label: "Verbal Reasoning" },
    { code: "DM", label: "Decision Making" },
    { code: "QR", label: "Quantitative Reasoning" },
    { code: "SJT", label: "Situational Judgement" },
  ];
  const activeSection = latestDiagnostic?.section;
  const issues = latestDiagnostic?.issues ?? [];
  const strengths = latestDiagnostic?.strengths ?? [];
  const fixes = latestDiagnostic?.studyPlanTasks ?? [];

  return (
    <section className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-wider text-blue-600">
            Phloem personalised feedback
          </p>
          <h2 className="mt-3 text-xl font-black">
            {hasDiagnostic
              ? "Diagnostic feedback"
              : "Diagnostic feedback pending"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
            {hasDiagnostic
              ? "Based on your free diagnostic. Issues, strengths and fixes per UCAT section."
              : "Complete and mark a diagnostic so PhloemAI can turn your timing, accuracy and answer behaviour into AI feedback."}
          </p>
        </div>
        {hasDiagnostic ? (
          <Link
            href="/phloemai/report"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Open report
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : (
          <Link
            href="/phloemai/diagnostic"
            className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
          >
            Run diagnostic
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {[
          ["Diagnostic", diagnosticStatusValue, Activity, diagnosticStatusClass],
          [
            "Practice data",
            practiceStats.hasCompletedQuestions ? "Saved" : "Empty",
            BarChart3,
            practiceStats.hasCompletedQuestions
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-500",
          ],
          ["AI feedback", aiStatusValue, MessageSquare, aiStatusClass],
        ].map(([label, value, Icon, iconClass]) => (
          <div
            key={label as string}
            className="rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconClass as string}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-700">
                  {label as string}
                </p>
                <p className="mt-0.5 text-xs font-bold text-slate-500">
                  {value as string}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {hasDiagnostic ? (
        <>
          {aiText && (
            <div className="mt-5 rounded-xl border border-violet-100 bg-violet-50/40 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-600" aria-hidden="true" />
                <h3 className="text-xs font-black uppercase tracking-wide text-violet-700">
                  AI feedback
                </h3>
              </div>
              <ExpandableAiFeedback
                text={aiText}
                previewLength={300}
                className="mt-2 text-xs font-semibold leading-5 text-slate-800"
                paragraphClassName="whitespace-pre-wrap"
                buttonClassName="mt-3 text-xs font-black text-violet-700 hover:text-violet-800"
              />
            </div>
          )}

          <div className="mt-5 flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 p-1">
            {sectionTabs.map((tab) => {
              const active = activeSection === tab.code;
              return (
                <span
                  key={tab.code}
                  className={`rounded-sm px-3 py-1 text-xs font-black uppercase tracking-wide ${
                    active
                      ? "bg-blue-600 text-white"
                      : "text-slate-500"
                  }`}
                >
                  {tab.code}
                </span>
              );
            })}
          </div>

          {sectionTabs.map((tab) => {
            const active = activeSection === tab.code;
            if (!active) return null;
            return (
              <div key={tab.code} className="mt-4 grid gap-3 lg:grid-cols-3">
                <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
                  <h3 className="text-xs font-black uppercase tracking-wide text-red-700">
                    Issues
                  </h3>
                  {issues.length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No issues detected.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-xs font-bold leading-5 text-slate-800">
                      {issues.slice(0, 5).map((issue) => (
                        <li key={issue.label}>- {issue.label}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                  <h3 className="text-xs font-black uppercase tracking-wide text-emerald-700">
                    Strengths
                  </h3>
                  {strengths.length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No strengths recorded.
                    </p>
                  ) : (
                    <ul className="mt-2 space-y-1.5 text-xs font-bold leading-5 text-slate-800">
                      {strengths.slice(0, 5).map((item) => (
                        <li key={item}>- {item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4">
                  <h3 className="text-xs font-black uppercase tracking-wide text-blue-700">
                    Fixes
                  </h3>
                  {fixes.length === 0 ? (
                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      No fixes generated.
                    </p>
                  ) : !isPremium ? (
                    <div className="mt-2 rounded-lg border border-dashed border-blue-200 bg-white/70 p-3">
                      <LockKeyhole className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      <p className="mt-2 text-xs font-black text-slate-800">
                        Personalised fixes are Premium.
                      </p>
                    </div>
                  ) : (
                    <ol className="mt-2 space-y-1.5 text-xs font-bold leading-5 text-slate-800">
                      {fixes.slice(0, 4).map((task, index) => (
                        <li key={task.id ?? index}>
                          {index + 1}. {task.fix}
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              </div>
            );
          })}

          {sectionTabs
            .filter((tab) => tab.code !== activeSection)
            .map((tab) => (
              <div
                key={tab.code}
                className="mt-3 flex items-center justify-between rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-500"
              >
                <span>
                  {tab.code} - {tab.label} not yet diagnosed
                </span>
                <Link
                  href="/phloemai/diagnostic"
                  className="text-blue-600 hover:text-blue-700"
                >
                  Run diagnostic
                </Link>
              </div>
            ))}

        </>
      ) : (
        <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-black text-blue-950">
                Section observations
              </h3>
              <p className="mt-1 text-xs font-bold leading-5 text-blue-700">
                Timing bottlenecks, changed-answer patterns and weak sections will appear here after a marked diagnostic.
              </p>
            </div>
            <Link
              href="/phloemai/report"
              className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700"
            >
              Open report
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

function MissingSupabaseConfig() {
  return (
    <div className="min-h-screen bg-[#f8fbff] px-5 py-10 text-[#0b1143]">
      <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
        <Link
          href="/phloemai"
          className="mb-5 inline-flex items-center gap-2 text-sm font-black text-slate-600 transition-colors hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to PhloemAI
        </Link>

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
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [progressSnapshotView, setProgressSnapshotView] =
    useState<DashboardProgressSnapshotView>("accuracy");
  const [completedDashboardTaskIds, setCompletedDashboardTaskIds] = useState<
    Set<string>
  >(() => new Set());
  const [removedDashboardTaskIds, setRemovedDashboardTaskIds] = useState<
    Set<string>
  >(() => new Set());
  const [practiceStats, setPracticeStats] = useState<PracticeStats>(() =>
    createEmptyPracticeStats()
  );
  const [recentPracticeSets, setRecentPracticeSets] = useState<
    RecentPracticeSet[]
  >([]);
  const [latestDiagnostic, setLatestDiagnostic] =
    useState<DashboardDiagnostic | null>(null);
  const [diagnosticHistory, setDiagnosticHistory] = useState<
    DashboardDiagnostic[]
  >([]);
  const supabaseReady = hasSupabaseConfig();
  const supabase = useMemo(
    () => (supabaseReady ? createSupabaseClient() : null),
    [supabaseReady]
  );
  const pageMeta = dashboardPageMeta[view];
  const dashboardTaskStorageKey = latestDiagnostic?.completedAt
    ? `phloemai-dashboard-tasks:${latestDiagnostic.completedAt}`
    : "phloemai-dashboard-tasks:empty";
  const dashboardRemovedTaskStorageKey = `${dashboardTaskStorageKey}:removed`;

  useEffect(() => {
    const loadTaskState = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(dashboardTaskStorageKey);
        const taskIds = saved ? (JSON.parse(saved) as unknown) : [];
        setCompletedDashboardTaskIds(
          new Set(
            Array.isArray(taskIds)
              ? taskIds.filter((id) => typeof id === "string")
              : []
          )
        );
      } catch {
        setCompletedDashboardTaskIds(new Set());
      }

      try {
        const saved = window.localStorage.getItem(dashboardRemovedTaskStorageKey);
        const taskIds = saved ? (JSON.parse(saved) as unknown) : [];
        setRemovedDashboardTaskIds(
          new Set(
            Array.isArray(taskIds)
              ? taskIds.filter((id) => typeof id === "string")
              : []
          )
        );
      } catch {
        setRemovedDashboardTaskIds(new Set());
      }
    }, 0);

    return () => window.clearTimeout(loadTaskState);
  }, [dashboardTaskStorageKey, dashboardRemovedTaskStorageKey]);

  const toggleDashboardTask = useCallback(
    (taskId: string) => {
      setCompletedDashboardTaskIds((current) => {
        const next = new Set(current);
        if (next.has(taskId)) {
          next.delete(taskId);
        } else {
          next.add(taskId);
        }

        try {
          window.localStorage.setItem(
            dashboardTaskStorageKey,
            JSON.stringify(Array.from(next))
          );
        } catch {
          // Ignore private browsing or storage quota failures.
        }

        return next;
      });
    },
    [dashboardTaskStorageKey]
  );

  const removeDashboardTask = useCallback(
    (taskId: string) => {
      setRemovedDashboardTaskIds((current) => {
        const next = new Set(current);
        next.add(taskId);

        try {
          window.localStorage.setItem(
            dashboardRemovedTaskStorageKey,
            JSON.stringify(Array.from(next))
          );
        } catch {
          // Ignore private browsing or storage quota failures.
        }

        return next;
      });

      setCompletedDashboardTaskIds((current) => {
        const next = new Set(current);
        next.add(taskId);

        try {
          window.localStorage.setItem(
            dashboardTaskStorageKey,
            JSON.stringify(Array.from(next))
          );
        } catch {
          // Ignore private browsing or storage quota failures.
        }

        return next;
      });
    },
    [dashboardRemovedTaskStorageKey, dashboardTaskStorageKey]
  );

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
        .select("full_name,current_plan,diagnostic_credits,ai_diagnostic_last_used_at")
        .eq("id", nextUser.id)
        .maybeSingle();

      if (mounted) {
        setProfile((data as PhloemProfile | null) ?? null);
      }
    }

    async function loadPracticeStats(nextUser: User) {
      const { data, error } = await supabaseClient
        .from("practice_question_attempts")
        .select("question_id,section,answered,correct,total_seconds,created_at")
        .eq("user_id", nextUser.id)
        .order("created_at", { ascending: false })
        .limit(1500);

      if (!mounted) return;

      if (error) {
        setPracticeStats(createEmptyPracticeStats());
        return;
      }

      setPracticeStats(buildPracticeStats((data ?? []) as PracticeAttemptRow[]));
    }

    async function loadRecentPracticeSets(nextUser: User) {
      const { data, error } = await supabaseClient
        .from("practice_sessions")
        .select(
          "id,section,source,total_questions,answered_questions,correct_questions,accuracy,summary,completed_at,created_at"
        )
        .eq("user_id", nextUser.id)
        .eq("source", "question_bank")
        .order("completed_at", { ascending: false })
        .limit(30);

      if (!mounted) return;

      if (error) {
        setRecentPracticeSets([]);
        return;
      }

      const sets = ((data ?? []) as PracticeSessionListRow[])
        .map(normaliseRecentPracticeSet)
        .filter((set): set is RecentPracticeSet => Boolean(set))
        .sort((first, second) => {
          if (first.isIncomplete !== second.isIncomplete) {
            return first.isIncomplete ? -1 : 1;
          }

          return (
            new Date(second.completedAt ?? 0).getTime() -
            new Date(first.completedAt ?? 0).getTime()
          );
        });

      setRecentPracticeSets(sets);
    }

    async function loadDiagnosticHistory(nextUser: User) {
      const { data, error } = await supabaseClient
        .from("diagnostic_attempts")
        .select(
          "id,accuracy,completed_at,ai_feedback,ai_feedback_status,metadata,source"
        )
        .eq("user_id", nextUser.id)
        .order("completed_at", { ascending: false })
        .limit(12);

      if (!mounted) return;
      if (error || !data) {
        setLatestDiagnostic(null);
        setDiagnosticHistory([]);
        return;
      }

      const history = (data as DiagnosticAttemptRow[]).map((row, index) =>
        normaliseDashboardDiagnostic(row, index)
      );

      setDiagnosticHistory(history);
      setLatestDiagnostic(history[0] ?? null);
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
        await loadPracticeStats(currentSession.user);
        await loadRecentPracticeSets(currentSession.user);
        await loadDiagnosticHistory(currentSession.user);
        await syncCheckoutIfNeeded(currentSession.user);
      } else {
        setProfile(null);
        setPracticeStats(createEmptyPracticeStats());
        setRecentPracticeSets([]);
        setLatestDiagnostic(null);
        setDiagnosticHistory([]);
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
        void loadPracticeStats(nextSession.user);
        void loadRecentPracticeSets(nextSession.user);
        void loadDiagnosticHistory(nextSession.user);
      } else {
        setProfile(null);
        setPracticeStats(createEmptyPracticeStats());
        setRecentPracticeSets([]);
        setLatestDiagnostic(null);
        setDiagnosticHistory([]);
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
        if (!legalAccepted) {
          setAuthError(
            "Please agree to the Terms and confirm you have read the Privacy Policy before creating an account."
          );
          return;
        }

        const trimmedName = fullName.trim();
        const acceptedAt = new Date().toISOString();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: trimmedName,
              legal_accepted_at: acceptedAt,
              terms_version: "2026-05-07",
              privacy_version: "2026-05-07",
              phloemai_disclaimer_version: "2026-05-07",
            },
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
    setPracticeStats(createEmptyPracticeStats());
    setRecentPracticeSets([]);
    setLatestDiagnostic(null);
    setDiagnosticHistory([]);
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
        legalAccepted={legalAccepted}
        setLegalAccepted={setLegalAccepted}
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
  const diagnosticCredits =
    typeof profile?.diagnostic_credits === "number"
      ? profile.diagnostic_credits
      : 1;
  const aiDiagnosticLastUsedAt =
    typeof profile?.ai_diagnostic_last_used_at === "string"
      ? profile.ai_diagnostic_last_used_at
      : null;
  const dashboardSectionProgressScores = getSectionScores(practiceStats);
  const dashboardSectionAccuracyScores = getSectionAccuracyScores(practiceStats);
  const dashboardSectionScores =
    progressSnapshotView === "accuracy"
      ? dashboardSectionAccuracyScores
      : dashboardSectionProgressScores;
  const dashboardStudyPlanTasks = getDiagnosticStudyPlanTasks(latestDiagnostic);
  const dashboardDiagnosticFeaturesUnlocked =
    plan === "Premium" || isFreeQrDiagnostic(latestDiagnostic);
  const dashboardFeedbackExpanded = Boolean(latestDiagnostic?.aiFeedbackText);
  const visibleDashboardStudyPlanTasks = dashboardStudyPlanTasks.filter(
    (task) => !removedDashboardTaskIds.has(task.id)
  );
  const completedDashboardTaskCount = visibleDashboardStudyPlanTasks.filter((task) =>
    completedDashboardTaskIds.has(task.id)
  ).length;
  const dashboardTaskBadgeText =
    dashboardStudyPlanTasks.length === 0
      ? "Awaiting study plan"
      : visibleDashboardStudyPlanTasks.length === 0
        ? "Tasks cleared"
        : `${completedDashboardTaskCount}/${visibleDashboardStudyPlanTasks.length} done`;
  const progressSummaryText = practiceStats.hasCompletedQuestions
    ? "From saved question attempts"
    : "No completed questions yet";
  const bankProgressPercent =
    practiceStats.totalAvailable > 0
      ? Math.round((practiceStats.totalCompleted / practiceStats.totalAvailable) * 100)
      : 0;
  const headerBackHref =
    view === "dashboard" ? "/phloemai" : "/phloemai/dashboard";
  const headerBackLabel =
    view === "dashboard" ? "Back to PhloemAI" : "Back to dashboard";

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
              const isActive =
                item.view === view ||
                (item.view === "diagnostic" && view === "mock-diagnostic");
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

          <div className="mt-8">
            <p className="px-4 text-xs font-black uppercase tracking-wide text-slate-400">
              Skills Trainers
            </p>
            <Link
              href="/phloemai/skills-trainers"
              className={`mt-3 flex h-12 w-full items-center gap-4 rounded-xl px-4 text-sm font-black transition-colors ${
                view === "skills-trainers"
                  ? "bg-indigo-50 text-blue-600 shadow-sm"
                  : "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
              }`}
            >
              <Zap className="h-5 w-5" aria-hidden="true" />
              Calculator + Flags
            </Link>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-blue-600">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-sm font-black">
              Unlock Premium diagnostics
            </h2>
            <p className="mt-3 text-sm font-medium leading-6 text-slate-600">
              Go Premium for full mocks, sprints, deeper analytics and a daily
              AI diagnostic credit.
            </p>
            {plan === "Premium" ? (
              <button
                type="button"
                onClick={handleSubscriptionAction}
                disabled={checkoutLoading}
                className="mt-5 h-10 w-full rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700"
              >
                {checkoutLoading ? "Opening..." : "Manage Billing"}
              </button>
            ) : (
              <Link
                href="/phloemai/pricing"
                className="mt-5 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white transition-colors hover:bg-blue-700"
              >
                View Plans
              </Link>
            )}
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
              {plan === "Premium" ? (
                <button
                  type="button"
                  onClick={handleSubscriptionAction}
                  className="text-sm font-black text-blue-600 hover:text-blue-700"
                >
                  Manage
                </button>
              ) : (
                <Link
                  href="/phloemai/pricing"
                  className="text-sm font-black text-blue-600 hover:text-blue-700"
                >
                  View plans
                </Link>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-slate-500">
              Legal
            </p>
            <div className="mt-3 space-y-2 text-xs font-bold">
              <Link
                href="/terms-and-conditions"
                className="block text-slate-600 hover:text-blue-600"
              >
                Terms and Conditions
              </Link>
              <Link
                href="/privacy-policy"
                className="block text-slate-600 hover:text-blue-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/phloemai-disclaimer"
                className="block text-slate-600 hover:text-blue-600"
              >
                AI/Data Disclaimer
              </Link>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href={headerBackHref}
                aria-label={headerBackLabel}
                title={headerBackLabel}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <ArrowLeft className="h-5 w-5" aria-hidden="true" />
              </Link>

              {(view === "diagnostic" || view === "mock-diagnostic") && (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-blue-600">
                  <Activity className="h-7 w-7" aria-hidden="true" />
                </div>
              )}
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
                    {plan === "Premium" ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAccountMenuOpen(false);
                          void handleSubscriptionAction();
                        }}
                        className="w-full rounded-lg px-3 py-2 text-left text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        Manage subscription
                      </button>
                    ) : (
                      <Link
                        href="/phloemai/pricing"
                        onClick={() => setAccountMenuOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm font-black text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                      >
                        View plans
                      </Link>
                    )}
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
            <DashboardFeedbackPanel
              latestDiagnostic={latestDiagnostic}
              practiceStats={practiceStats}
              isPremium={dashboardDiagnosticFeaturesUnlocked}
              className={dashboardFeedbackExpanded ? "lg:col-span-2" : ""}
            />

            <ClientPremiumGate
              isPremium={dashboardDiagnosticFeaturesUnlocked}
              checkoutLoading={checkoutLoading}
              onUpgrade={handleSubscriptionAction}
              title="Unlock your personalised study plan"
              description="Premium turns saved diagnostic fixes into tasks on your dashboard."
              featureLabel="Premium study plan"
              className={dashboardFeedbackExpanded ? "lg:col-span-2" : "self-start"}
            >
            <section className={`self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${dashboardFeedbackExpanded ? "lg:col-span-2" : ""}`}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Personalised Study Plan/Tasks
                  </h2>
                  <p className="mt-2 text-xs font-bold leading-5 text-slate-500">
                    Every saved fix from your latest diagnostic becomes a task here.
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-black ${
                    dashboardStudyPlanTasks.length > 0
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {dashboardTaskBadgeText}
                </span>
              </div>
              <div className="mt-4 space-y-3">
                {dashboardStudyPlanTasks.length === 0 ? (
                  <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-blue-50 p-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["1", "Diagnostic", "Find the main score blocker"],
                        ["2", "Fixes", "Turn it into targeted tasks"],
                        ["3", "Improve", "Practise, review and track gains"],
                      ].map(([step, title, text]) => (
                        <div
                          key={title}
                          className="rounded-lg border border-white/80 bg-white/80 p-3 shadow-sm"
                        >
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">
                            {step}
                          </span>
                          <h3 className="mt-3 text-sm font-black">{title}</h3>
                          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">
                            {text}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-bold leading-5 text-slate-600">
                        Once feedback is generated, this becomes your
                        personalised study plan.
                      </p>
                      <Link
                        href="/phloemai/diagnostic"
                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 text-xs font-black text-white transition-colors hover:bg-amber-700"
                      >
                        Start diagnostic
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                ) : visibleDashboardStudyPlanTasks.length === 0 ? (
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-xs font-bold leading-5 text-emerald-700">
                    Completed tasks have been cleared from this dashboard.
                  </div>
                ) : (
                visibleDashboardStudyPlanTasks.map((task) => {
                  const Icon = task.icon;
                  const completed = completedDashboardTaskIds.has(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center gap-3 rounded-xl border p-3 ${
                        completed
                          ? "border-emerald-100 bg-emerald-50/60"
                        : "border-slate-100 bg-white"
                      }`}
                    >
                      <div className="flex w-12 shrink-0 flex-col items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleDashboardTask(task.id)}
                          aria-pressed={completed}
                          aria-label={`${completed ? "Untick" : "Tick off"} ${task.title}`}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition-colors ${
                            completed
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-200 bg-white text-slate-300 hover:border-emerald-300 hover:text-emerald-500"
                          }`}
                        >
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {completed && (
                          <button
                            type="button"
                            onClick={() => removeDashboardTask(task.id)}
                            className="text-[11px] font-black leading-none text-rose-500 transition-colors hover:text-rose-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <div
                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${task.iconClass}`}
                      >
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`text-sm font-black ${
                            completed ? "text-slate-400 line-through" : ""
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p
                          className={`mt-1 text-xs font-bold ${
                            completed ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {task.fix}
                        </p>
                      </div>
                      <Link
                        href={task.href}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-5 text-sm font-black text-amber-700 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.18)] transition-colors hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800"
                      >
                        Start
                      </Link>
                    </div>
                  );
                }))}
              </div>
              <Link
                href="/phloemai/practice"
                className="mt-5 inline-flex items-center gap-2 text-sm font-black text-amber-700 hover:text-amber-800"
              >
                View all tasks
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </section>
            </ClientPremiumGate>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-black uppercase tracking-wide">
                    Progress snapshot
                  </h2>
                  <Info className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  {(["accuracy", "progress"] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setProgressSnapshotView(option)}
                      className={`rounded-md px-3 py-1.5 text-xs font-black capitalize transition-colors ${
                        progressSnapshotView === option
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-500 hover:text-blue-600"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(progressSnapshotView === "accuracy"
                  ? [
                      [
                        "Accuracy",
                        practiceStats.hasCompletedQuestions
                          ? `${practiceStats.accuracy}%`
                          : "-",
                      ],
                      [
                        "Avg. time / question",
                        practiceStats.hasCompletedQuestions
                          ? `${practiceStats.avgSeconds}s`
                          : "-",
                      ],
                    ]
                  : [
                      [
                        "Questions completed",
                        `${practiceStats.totalCompleted}/${practiceStats.totalAvailable}`,
                      ],
                      ["Bank progress", `${bankProgressPercent}%`],
                    ]
                ).map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-black text-slate-700">{label}</p>
                    <p className="mt-2 text-3xl font-black leading-none text-slate-400">
                      {value}
                    </p>
                    <p className="mt-2 text-xs font-bold text-slate-400">
                      {progressSnapshotView === "accuracy"
                        ? progressSummaryText
                        : "From question-bank completion"}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="mt-7 text-sm font-black">
                {progressSnapshotView === "accuracy"
                  ? "Accuracy across sections"
                  : "Progress through sections"}
              </h3>
              <div className="mt-4 space-y-4">
                {dashboardSectionScores.map((section) => (
                  <div key={section.code} className="space-y-1">
                    <div className="grid grid-cols-[44px_1fr_42px] items-center gap-4">
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
                    <p className="pl-[60px] text-xs font-bold text-slate-400">
                      {section.helper}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <DailyQuestionsChart practiceStats={practiceStats} />

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
              practiceStats={practiceStats}
              latestDiagnostic={latestDiagnostic}
              diagnosticHistory={diagnosticHistory}
              completedDashboardTaskIds={completedDashboardTaskIds}
              removedDashboardTaskIds={removedDashboardTaskIds}
              diagnosticCredits={diagnosticCredits}
              aiDiagnosticLastUsedAt={aiDiagnosticLastUsedAt}
              onUpgrade={handleSubscriptionAction}
              onLogout={handleLogout}
              recentPracticeSets={recentPracticeSets}
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

const PHLOEMAI_FREE_FEATURES = [
  "Question bank practice",
  "Skills trainers",
  "Free QR diagnostic",
  "Full free diagnostic report",
  "1 lifetime AI diagnostic credit",
];

const PHLOEMAI_PREMIUM_FEATURES = [
  "Full mocks, subtest mocks and 15-minute sprints",
  "Advanced weakness + strengths diagnosis",
  "Deeper issue causes, evidence and specific fixes",
  "Personalised study plan and drills",
  "1 AI diagnostic credit every 24 hours",
  "Progress tracking over time",
];

const PHLOEMAI_PRICING_ROWS = [
  ["Question bank practice", "Included", "Included"],
  ["Skills trainers", "Included", "Included"],
  ["Free QR diagnostic", "Full report included", "Full report included"],
  ["AI diagnostic credit", "1 lifetime credit", "1 credit every 24 hours"],
  ["Full mocks", "Premium", "Included"],
  ["Subtest mocks and 15-minute sprints", "Premium", "Included"],
  ["Mock diagnostic reports", "Premium", "Included"],
  ["Deeper issue causes and fixes", "Free diagnostic only", "All diagnostics"],
  ["Personalised study plan", "Free diagnostic only", "All diagnostics"],
  ["Progress and improvement history", "Basic progress", "Full tracking"],
] as const;

// ── Landing Hero ──────────────────────────────────────────────────────────────

function RedesignedTutorHero() {
  const [hasLandingDiagnosticReport, setHasLandingDiagnosticReport] =
    useState(false);
  const [premiumCheckoutLoading, setPremiumCheckoutLoading] = useState(false);
  const [premiumCheckoutError, setPremiumCheckoutError] = useState<string | null>(null);
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
      text: "Get a focused recommendation for what to work on in the next question set.",
      icon: Target,
      iconWrap: "bg-orange-50 text-orange-600",
    },
  ];

  const productCards = [
    {
      title: "UCAT",
      status: "Available Now",
      text: "Full-length practice, AI diagnosis, attention tracking, and personalised coaching.",
      icon: Brain,
      action: "Launch UCAT Platform",
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

  useEffect(() => {
    if (!hasSupabaseConfig()) return;

    let mounted = true;
    const supabase = createSupabaseClient();

    async function loadLandingDiagnosticStatus() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) return;

      const { data } = await supabase
        .from("diagnostic_attempts")
        .select("completed_at")
        .eq("user_id", session.user.id)
        .order("completed_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (mounted) {
        setHasLandingDiagnosticReport(Boolean(data));
      }
    }

    void loadLandingDiagnosticStatus();

    return () => {
      mounted = false;
    };
  }, []);

  const handlePremiumCheckout = async () => {
    setPremiumCheckoutLoading(true);
    setPremiumCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (response.status === 401) {
        window.location.assign("/phloemai/dashboard");
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setPremiumCheckoutLoading(false), 8000);
    } catch (error) {
      setPremiumCheckoutError(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setPremiumCheckoutLoading(false);
    }
  };

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
                mistakes and recommend exactly what to work on next.
              </p>

              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <Link
                  href="/phloemai/dashboard"
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-500"
                >
                  Launch UCAT Platform
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
                    title: "Diagnostic",
                    text: "Complete a short timed UCAT set.",
                  },
                  {
                    step: "2",
                    title: "Fixes",
                    text: "Get your personalised study plan tasks.",
                  },
                  {
                    step: "3",
                    title: "Improve",
                    text: "Practise targeted tasks and track gains.",
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
                      <h3 className="text-xs font-bold text-violet-200">
                        Study Plan
                      </h3>
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
                Shows you why and what to work on next.
              </p>
            </div>
          </div>
        </div>

        <div id="pricing" className="mt-7 scroll-mt-24 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Start with a free diagnostic.
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            Try the core tools first. Upgrade for mock diagnostics, deeper fixes and daily AI feedback.
          </p>
        </div>

        <div className="mx-auto mt-5 grid max-w-4xl gap-5 lg:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-blue-500 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-950">Free Diagnostic</h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                Best for trying PhloemAI
              </span>
            </div>
            <div className="mt-2 text-3xl font-black text-slate-950">GBP 0</div>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              No card needed.
            </p>
            <ul className="mt-4 flex-1 space-y-2 pb-5 text-sm text-slate-700">
              {PHLOEMAI_FREE_FEATURES.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={hasLandingDiagnosticReport ? "/phloemai/report" : "/phloemai/dashboard"}
              className="mt-auto inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              {hasLandingDiagnosticReport ? "View Report" : "Start Free Diagnostic"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="flex flex-col rounded-2xl border border-violet-300 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base font-black text-slate-950">PhloemAI Premium</h3>
              <span className="rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
                Premium
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-end gap-x-2 gap-y-1">
              <span className="text-3xl font-black text-slate-950">GBP 14.99</span>
              <span className="pb-1 text-sm font-bold text-slate-500">/ month</span>
            </div>
            <p className="mt-2 w-fit rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
              Best for full UCAT prep
            </p>
            <ul className="mt-4 flex-1 space-y-2 pb-5 text-sm text-slate-700">
              {PHLOEMAI_PREMIUM_FEATURES.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => void handlePremiumCheckout()}
              disabled={premiumCheckoutLoading}
              className="mt-auto h-10 w-full rounded-lg bg-violet-600 text-sm font-bold text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
            >
              {premiumCheckoutLoading ? "Opening checkout..." : "Upgrade to Premium"}
            </button>
            {premiumCheckoutError && (
              <p className="mt-3 text-xs font-bold leading-5 text-red-600">
                {premiumCheckoutError}
              </p>
            )}
          </div>
        </div>

        <div className="mx-auto mt-4 max-w-4xl rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-900">
          PhloemAI is an independent educational tool. AI feedback, progress
          estimates and attention tracking are not guarantees of UCAT,
          admissions or interview outcomes. Practice telemetry is used to
          provide feedback and progress tracking. Read the{" "}
          <Link href="/privacy-policy" className="font-black underline">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/terms-and-conditions" className="font-black underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="/phloemai-disclaimer" className="font-black underline">
            AI/Data Disclaimer
          </Link>
          .
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
              Launch UCAT Platform
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
                "Practise real UCAT-style questions across Verbal Reasoning, Decision Making, Quantitative Reasoning, and Situational Judgement.",
                "AI identifies your bad habits - unfocused reading patterns, spending too long on the wrong areas, weak technique, and timing issues pinpointed by question type.",
                "AI delivers tried-and-tested strategies tailored to your specific weaknesses, so you know exactly what to change and how.",
                "Apply the study plan in your own revision and track your accuracy and speed improving over time.",
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
                "Practise MMI stations and panel interview questions tailored to medicine and dentistry - ethics, clinical scenarios, motivation, and more.",
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

export function PhloemAIPricingPage() {
  const [premiumCheckoutLoading, setPremiumCheckoutLoading] = useState(false);
  const [premiumCheckoutError, setPremiumCheckoutError] = useState<string | null>(null);

  const handlePremiumCheckout = async () => {
    setPremiumCheckoutLoading(true);
    setPremiumCheckoutError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
      });
      const data = (await response.json()) as {
        url?: string;
        error?: string;
      };

      if (response.status === 401) {
        window.location.assign("/phloemai/dashboard");
        return;
      }

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Could not start checkout.");
      }

      window.location.assign(data.url);
      window.setTimeout(() => setPremiumCheckoutLoading(false), 8000);
    } catch (error) {
      setPremiumCheckoutError(
        error instanceof Error ? error.message : "Could not start checkout."
      );
      setPremiumCheckoutLoading(false);
    }
  };

  return (
    <PhloemAIPageShell>
      <main className="bg-white text-[#0b1143]">
        <section className="bg-[#050b1f] px-5 py-10 text-white lg:px-6">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/phloemai"
              className="inline-flex items-center gap-2 text-sm font-black text-blue-100 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to PhloemAI
            </Link>
            <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-cyan-200">
                  PhloemAI pricing
                </p>
                <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight sm:text-5xl">
                  See exactly what you get before you upgrade.
                </h1>
                <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-slate-200">
                  Start with the free QR diagnostic and question bank. Upgrade
                  when you want full mocks, mock diagnostics, deeper reports and
                  a daily AI diagnostic credit.
                </p>
              </div>
              <div className="rounded-xl border border-blue-400/30 bg-white/8 p-4">
                <p className="text-xs font-black uppercase tracking-wide text-blue-100">
                  Premium
                </p>
                <div className="mt-2 flex items-end gap-2">
                  <span className="text-4xl font-black">GBP 14.99</span>
                  <span className="pb-1 text-sm font-bold text-slate-300">
                    / month
                  </span>
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-slate-300">
                  Cancel through billing management. No card is needed for the
                  free diagnostic.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-8 lg:px-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-blue-500 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-black">Free Diagnostic</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                  Start here
                </span>
              </div>
              <div className="mt-4 text-5xl font-black">GBP 0</div>
              <p className="mt-2 text-sm font-bold text-slate-500">
                No card needed.
              </p>
              <ul className="mt-6 flex-1 space-y-3 pb-6 text-sm font-semibold text-slate-700">
                {PHLOEMAI_FREE_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/phloemai/dashboard"
                className="mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-black text-white transition-colors hover:bg-blue-700"
              >
                Start free diagnostic
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="flex flex-col rounded-xl border border-violet-300 bg-gradient-to-br from-white via-violet-50/40 to-blue-50 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-black">PhloemAI Premium</h2>
                <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-black text-violet-700">
                  Full UCAT prep
                </span>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="text-5xl font-black">GBP 14.99</span>
                <span className="pb-2 text-base font-black text-slate-500">
                  / month
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-violet-700">
                Best for full mocks, repeated diagnostics and daily AI feedback.
              </p>
              <ul className="mt-6 flex-1 space-y-3 pb-6 text-sm font-semibold text-slate-700">
                {PHLOEMAI_PREMIUM_FEATURES.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-violet-600" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => void handlePremiumCheckout()}
                disabled={premiumCheckoutLoading}
                className="mt-auto h-12 rounded-lg bg-violet-600 px-5 text-sm font-black text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-300"
              >
                {premiumCheckoutLoading ? "Opening checkout..." : "Upgrade to Premium"}
              </button>
              {premiumCheckoutError && (
                <p className="mt-3 text-xs font-bold leading-5 text-red-600">
                  {premiumCheckoutError}
                </p>
              )}
            </div>
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
              <h2 className="text-lg font-black">Plan comparison</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                The free diagnostic is fully unlocked. Premium expands those
                features across mocks and ongoing prep.
              </p>
            </div>
            <div className="divide-y divide-slate-100">
              {PHLOEMAI_PRICING_ROWS.map(([feature, freeValue, premiumValue]) => (
                <div
                  key={feature}
                  className="grid gap-3 px-5 py-4 text-sm sm:grid-cols-[1.2fr_1fr_1fr] sm:items-center"
                >
                  <p className="font-black text-slate-950">{feature}</p>
                  <p className="font-semibold text-slate-600">{freeValue}</p>
                  <p className="font-black text-blue-700">{premiumValue}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-900">
            PhloemAI is an independent educational tool. AI feedback, progress
            estimates and attention tracking are not guarantees of UCAT,
            admissions or interview outcomes. Practice telemetry is used to
            provide feedback and progress tracking. Read the{" "}
            <Link href="/privacy-policy" className="font-black underline">
              Privacy Policy
            </Link>
            ,{" "}
            <Link href="/terms-and-conditions" className="font-black underline">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/phloemai-disclaimer" className="font-black underline">
              AI/Data Disclaimer
            </Link>
            .
          </div>
        </section>
      </main>
    </PhloemAIPageShell>
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

export function UCATMockDiagnosticPage() {
  return <UCATDashboard view="mock-diagnostic" />;
}

export function UCATPracticePage() {
  return <UCATDashboard view="practice" />;
}

export function UCATProgressPage() {
  return <UCATDashboard view="progress" />;
}

export function UCATSkillsTrainersPage() {
  return <UCATDashboard view="skills-trainers" />;
}

export function UCATReportPage() {
  return <UCATDashboard view="report" />;
}

export function UCATAccountPage() {
  return <UCATDashboard view="account" />;
}

export default PhloemAILandingPage;
