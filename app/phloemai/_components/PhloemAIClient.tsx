"use client";

import {
  type RefObject,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
  Brain,
  Check,
  CheckCircle,
  Eye,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  UserRound,
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
          className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ top: `${phase.y}%` }}
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

// ── Plan Cards ────────────────────────────────────────────────────────────────

function PlanCards({ onFreeClick }: { onFreeClick: () => void }) {
  const freeFeatures = [
    "Practice real UCAT-style questions across all sections",
    "Track your accuracy and speed over time",
    "See section-level result breakdowns",
    "Get timing feedback to spot where you lose time",
    "Try mouse tracking or the webcam attention-tracking demo",
    "Receive an AI coaching summary after each session",
  ];

  const premiumFeatures = [
    "Pinpoint exactly which question subtypes you struggle with",
    "See timing breakdowns by question type, not just section",
    "Track accuracy trends across multiple sessions",
    "Get a personalised focus plan before every session",
    "Receive detailed AI coaching reports based on your data",
    "Unlock advanced attention insights - e.g. 'You skip the question wording 40% of the time'",
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Free */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 flex flex-col gap-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Free Plan
          </span>
          <div className="mt-1 text-3xl font-black text-slate-900">
            £0{" "}
            <span className="text-sm font-normal text-slate-400">/ month</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2 text-sm text-slate-800">
          {freeFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onFreeClick}
          className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
        >
          Get Started Free
        </button>
      </div>

      {/* Premium */}
      <div className="relative rounded-2xl bg-white border border-blue-200 shadow-sm p-6 flex flex-col gap-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-violet-50/40 pointer-events-none rounded-2xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Premium Plan
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200">
              Coming Soon
            </span>
          </div>
          <div className="mt-1 text-3xl font-black text-slate-400">
            £-
          </div>
        </div>
        <ul className="relative flex-1 space-y-2 text-sm text-slate-400">
          {premiumFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-blue-300 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="relative space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed border border-blue-100 bg-blue-50 rounded-xl px-3 py-2.5">
            Premium unlocks advanced weakness detection and personalised AI coaching reports - so you always know exactly what to work on next.
          </p>
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-400 text-sm font-semibold cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────

function AuthModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [tab, setTab] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: replace with Supabase auth call
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-black text-white">
              PhloemAI
            </span>
          </div>
          <p className="text-slate-400 text-sm">
            Create a free account to start your UCAT preparation.
          </p>
        </div>

        <div className="flex rounded-xl overflow-hidden bg-slate-800 p-0.5 mb-5">
          {(["signup", "login"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                tab === t
                  ? "bg-blue-700 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {t === "signup" ? "Sign Up" : "Log In"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === "signup" && (
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white text-sm px-4 py-2.5 placeholder:text-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
              />
            </div>
          )}
          <div>
            <label className="block text-xs text-slate-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white text-sm px-4 py-2.5 placeholder:text-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white text-sm px-4 py-2.5 placeholder:text-slate-500 focus:outline-none focus:border-blue-600 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-blue-700 text-white text-sm font-semibold hover:bg-blue-600 transition-colors mt-1 shadow-sm cursor-pointer"
          >
            {tab === "signup" ? "Create Free Account" : "Log In"}
          </button>
        </form>

        <p className="text-xs text-slate-500 text-center mt-4 leading-relaxed">
          Supabase authentication will be connected shortly. By continuing you
          agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

// ── Privacy Notice ────────────────────────────────────────────────────────────

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

// ── UCAT Dashboard (post-login placeholder) ───────────────────────────────────

function UCATDashboard({ onLogout }: { onLogout: () => void }) {
  const sections = [
    "Verbal Reasoning",
    "Decision Making",
    "Quantitative Reasoning",
    "Abstract Reasoning",
  ];

  return (
    <div className="min-h-[calc(100vh-49px)]">
      <div className="max-w-4xl mx-auto px-4 pt-10 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">UCAT Practice</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Free Plan · AI-powered preparation
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-500 cursor-pointer"
          >
            Log out
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Sessions", value: "0" },
            { label: "Avg Accuracy", value: "-" },
            { label: "Avg Time / Q", value: "-" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-slate-800/60 border border-slate-700/50 p-4 text-center"
            >
              <div className="text-2xl font-black text-white">{s.value}</div>
              <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {sections.map((sec) => (
            <div
              key={sec}
              className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 flex items-center justify-between group hover:border-blue-600/40 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-semibold text-white">{sec}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  No sessions yet - start practising
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center group-hover:bg-blue-800/30 transition-colors">
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Premium upsell strip */}
        <div className="rounded-2xl bg-gradient-to-r from-blue-950 to-slate-900 border border-blue-500/30 p-5 flex items-center justify-between mb-8">
          <div>
            <div className="text-sm font-semibold text-white">
              Unlock Premium
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Full weakness detection, AI coaching reports &amp; advanced
              attention-pattern insights
            </div>
          </div>
          <span className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-medium">
            Coming Soon
          </span>
        </div>

        <AttentionTrackingDemo />
        <div className="mt-6">
          <PrivacyNotice />
        </div>
      </div>
    </div>
  );
}

// ── UCAT Section (plan selection) ─────────────────────────────────────────────

function UCATSection({
  onFreePlan,
}: {
  onFreePlan: () => void;
}) {
  return (
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

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🧠</span>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">UCAT Tutor</h1>
              <p className="text-slate-600 text-xs font-medium mt-0.5">
                Built by MedWithRish - Medical Admissions Specialist
              </p>
            </div>
          </div>

          <div className="mb-5 space-y-1">
            <p className="text-slate-900 text-base font-semibold leading-snug">
              Train smarter with AI-powered UCAT preparation.
            </p>
            <p className="text-slate-700 text-sm">Identify weaknesses.</p>
            <p className="text-slate-700 text-sm">
              <span className="text-blue-600 font-medium">Track your focus</span> with optional mouse or eye tracking.
            </p>
            <p className="text-slate-700 text-sm">Improve faster.</p>
          </div>

          {/* Benefit statement */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-5 border-l-4 border-l-blue-500">
            <p className="text-slate-800 text-sm leading-relaxed italic">
              Know exactly what&apos;s slowing you down - not just what you got wrong.
            </p>
          </div>

          {/* Attention-tracking CTA banner */}
          <div className="rounded-xl bg-blue-600 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold">Try Attention Tracking</p>
              <p className="text-blue-100 text-xs mt-0.5 leading-relaxed">
                See which parts of each question you focus on with mouse tracking or the webcam experiment.
              </p>
            </div>
            <Link
              href="/phloemai/ucat-demo"
              className="flex-shrink-0 text-xs px-3 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Try Demo →
            </Link>
          </div>
        </div>

        {/* Plan cards */}
        <div className="mb-8">
          <PlanCards onFreeClick={onFreePlan} />
        </div>

        {/* Feedback explainer */}
        <div className="mb-8 rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-4">
          <h3 className="text-slate-900 font-semibold text-sm">
            What does feedback look like?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">
                Free - Basic Feedback
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {[
                  "Overall accuracy (e.g. 7/11 correct)",
                  "Time taken for the full question set",
                  "Section-level result breakdown",
                  '"You were slower than expected on this set"',
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-blue-500 mt-0.5 flex-shrink-0">·</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Premium - Full Weakness Detection
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {[
                  "Breakdown by section and question subtype",
                  "Repeated weakness patterns over time",
                  "Timing weaknesses by question type",
                  '"QR percentage-change questions: 42 s above target"',
                  "Specific recommended next-session focus",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-slate-300 mt-0.5 flex-shrink-0">·</span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <PrivacyNotice />
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
      action: "Open UCAT Tutor",
      href: "/phloemai/ucat-tutor",
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
        <div className="mx-auto max-w-6xl px-5 pt-7 pb-6 lg:px-6 lg:pt-9">
          <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_0.78fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-cyan-200">
                <Activity className="h-3.5 w-3.5" aria-hidden="true" />
                AI Medical Admissions Tutor
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-black leading-[0.95] text-white sm:text-5xl lg:text-6xl">
                Phloem<span className="text-blue-500">AI</span>
              </h1>

              <p className="mt-4 max-w-lg text-xl font-bold leading-tight text-white sm:text-2xl">
                The AI tutor that shows why you lose marks.
              </p>

              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-200">
                PhloemAI analyses your timing, confidence, attention patterns,
                answer changes and optional eye + mouse tracking to diagnose
                mistakes and recommend exactly what to fix next.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/phloemai/ucat-tutor"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-950/30 transition-colors hover:bg-blue-500"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/phloemai/ucat-demo"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-400/45 bg-blue-500/10 px-5 text-sm font-bold text-blue-100 transition-colors hover:border-blue-300 hover:bg-blue-500/20"
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Try Attention Demo
                </Link>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-slate-300">
                No card needed | 10-minute diagnostic | Optional eye + mouse tracking
              </p>

              <div className="mt-6 grid max-w-xl gap-4 md:grid-cols-[160px_1fr] md:items-center">
                <div className="aspect-[4/3] overflow-hidden rounded-xl border border-white/15 bg-slate-900/70 shadow-lg shadow-black/20">
                  <div className="flex h-full items-center justify-center bg-blue-950/70">
                    <span className="text-4xl font-black tracking-tight text-blue-200">
                      MR
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-cyan-200">
                    Built by MedWithRish
                  </p>
                  <h2 className="mt-1.5 text-xl font-black leading-tight text-white">
                    UCAT strategy from a real tutor, not a generic question bank.
                  </h2>
                  <p className="mt-2 text-xs leading-5 text-slate-300">
                    I am Rish, the UCAT tutor behind MedWithRish. PhloemAI is
                    built around the patterns I look for in lessons: timing
                    traps, weak review habits, missed question wording, and the
                    exact strategy change that moves a student forward.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-blue-400/45 bg-slate-950/70 p-4 shadow-xl shadow-blue-950/20">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <PhloemAILogo compact />
                  <div>
                    <h2 className="text-lg font-black text-white">AI Diagnosis</h2>
                    <p className="text-xs text-slate-400">Based on your attempt</p>
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-right">
                  <div className="text-xs font-bold text-white">UCAT Practice</div>
                  <div className="flex items-center justify-end gap-1.5 text-[11px] text-slate-300">
                    Live Analysis
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="rounded-xl border border-red-400/25 bg-red-500/8 p-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/12 text-red-300 ring-1 ring-red-400/25">
                      <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-red-300">Major issues</h3>
                      <ul className="mt-1.5 space-y-1 text-xs leading-5 text-slate-100">
                        <li>Spent too long reading extra information</li>
                        <li>Slow with calculator</li>
                        <li>18s over target</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-cyan-400/25 bg-cyan-500/8 p-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-500/12 text-cyan-200 ring-1 ring-cyan-400/25">
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-cyan-200">Minor issues</h3>
                      <ul className="mt-1.5 space-y-1 text-xs leading-5 text-slate-100">
                        <li>Read stem before question</li>
                        <li>Kept re-reading stem with correct answer</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-violet-400/25 bg-violet-500/8 p-3">
                  <div className="flex gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-500/12 text-violet-200 ring-1 ring-violet-400/25">
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-violet-200">Fixes</h3>
                      <ul className="mt-1.5 space-y-1 text-xs leading-5 text-slate-100">
                        <li>Calculator speed practice</li>
                        <li>Timed QR sets with confidence review</li>
                        <li>Read the question before mining the stem</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-400">
                Based on timing, answer changes and attention behaviour.
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/15 bg-white/6 p-3 sm:flex sm:items-center sm:justify-between sm:gap-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/10 text-blue-200">
                <Target className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  Try the 60-second Attention Demo
                </h2>
                <p className="mt-0.5 text-xs text-slate-300">
                  See which parts of a question you focus on live.
                </p>
              </div>
            </div>
            <Link
              href="/phloemai/ucat-demo"
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-slate-950 transition-colors hover:bg-blue-50 sm:mt-0 sm:w-auto"
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
                  changed from the correct answer near the end.
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
              href="/phloemai/ucat-tutor"
              className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-bold text-white transition-colors hover:bg-blue-700"
            >
              Start Free
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
              href="/phloemai/ucat-tutor"
              className="block w-full py-2 rounded-xl border border-slate-200 text-slate-700 text-xs hover:border-slate-400 hover:text-slate-900 transition-colors cursor-pointer text-center"
            >
              Open UCAT Tutor
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
                "Practice real UCAT-style questions across all sections - Verbal Reasoning, Decision Making, Quantitative Reasoning, and Abstract Reasoning.",
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

// ── Main Page ─────────────────────────────────────────────────────────────────

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

export function UCATTutorPage() {
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);

  const handleFreePlan = () => {
    setShowAuth(true);
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    router.push("/phloemai/dashboard");
  };

  return (
    <PhloemAIPageShell>
      <UCATSection onFreePlan={handleFreePlan} />
      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </PhloemAIPageShell>
  );
}

export function UCATDemoPage() {
  return (
    <PhloemAIPageShell>
      <div className="min-h-[calc(100vh-49px)]">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-20">
          <Link
            href="/phloemai/ucat-tutor"
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
            Back to UCAT Tutor
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
  const router = useRouter();

  return (
    <PhloemAIPageShell>
      <UCATDashboard onLogout={() => router.push("/phloemai")} />
    </PhloemAIPageShell>
  );
}

export default PhloemAILandingPage;
