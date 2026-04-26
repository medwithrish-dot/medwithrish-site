"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";

// ── Types ─────────────────────────────────────────────────────────────────────

type View = "landing" | "ucat" | "dashboard";

// ── Eye Animation (landing hero) ──────────────────────────────────────────────

function EyeAnimation() {
  return (
    <div className="relative flex items-center justify-center w-40 h-40">
      <div
        className="absolute w-40 h-40 rounded-full border border-cyan-500/20 animate-ping"
        style={{ animationDuration: "2.5s" }}
      />
      <div
        className="absolute w-32 h-32 rounded-full border border-cyan-400/15 animate-ping"
        style={{ animationDuration: "2s", animationDelay: "0.4s" }}
      />
      <div className="absolute w-28 h-28 rounded-full bg-cyan-500/5 blur-xl" />
      <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-slate-800 to-blue-950 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.25)]">
        <svg className="w-14 h-9" viewBox="0 0 80 48" fill="none">
          <path
            d="M4 24 C20 4, 60 4, 76 24 C60 44, 20 44, 4 24 Z"
            stroke="#22d3ee"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="40" cy="24" r="13" fill="#0e7490" />
          <circle cx="40" cy="24" r="7" fill="#0f172a" />
          <circle cx="35" cy="20" r="2.5" fill="white" opacity="0.35" />
          <line
            x1="40" y1="17" x2="40" y2="31"
            stroke="#22d3ee" strokeWidth="0.8" opacity="0.5"
          />
          <line
            x1="33" y1="24" x2="47" y2="24"
            stroke="#22d3ee" strokeWidth="0.8" opacity="0.5"
          />
        </svg>
        <div className="absolute bottom-2 right-2 w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
      </div>
    </div>
  );
}

// ── Eye Tracking Demo ─────────────────────────────────────────────────────────

// All class strings are explicit so Tailwind can extract them at build time.
const ZONE = {
  passage: {
    label: "Passage",
    pct: 68,
    active_box: "border-blue-400 bg-blue-900/30",
    inactive_box: "border-slate-600/30 bg-slate-800/20",
    badge: "text-blue-400",
    dot: "bg-blue-400",
    active_stat: "border-blue-400/40 bg-blue-900/25 text-blue-400",
    inactive_stat: "border-slate-600/20 bg-slate-800/30 text-slate-500",
    tracking: "text-blue-400",
  },
  question: {
    label: "Question",
    pct: 7,
    active_box: "border-purple-400 bg-purple-900/30",
    inactive_box: "border-slate-600/30 bg-slate-800/20",
    badge: "text-purple-400",
    dot: "bg-purple-400",
    active_stat: "border-purple-400/40 bg-purple-900/25 text-purple-400",
    inactive_stat: "border-slate-600/20 bg-slate-800/30 text-slate-500",
    tracking: "text-purple-400",
  },
  answers: {
    label: "Answers",
    pct: 20,
    active_box: "border-green-400 bg-green-900/30",
    inactive_box: "border-slate-600/30 bg-slate-800/20",
    badge: "text-green-400",
    dot: "bg-green-400",
    active_stat: "border-green-400/40 bg-green-900/25 text-green-400",
    inactive_stat: "border-slate-600/20 bg-slate-800/30 text-slate-500",
    tracking: "text-green-400",
  },
  timer: {
    label: "Timer",
    pct: 5,
    active_box: "border-yellow-400 bg-yellow-900/30",
    inactive_box: "border-slate-600/30 bg-slate-800/20",
    badge: "text-yellow-400",
    dot: "bg-yellow-400",
    active_stat: "border-yellow-400/40 bg-yellow-900/25 text-yellow-400",
    inactive_stat: "border-slate-600/20 bg-slate-800/30 text-slate-500",
    tracking: "text-yellow-400",
  },
} as const;

type ZoneId = keyof typeof ZONE;
const ZONE_IDS: ZoneId[] = ["passage", "question", "answers", "timer"];

// ── MediaPipe iris landmark indices ───────────────────────────────────────────

const L_IRIS = 468, R_IRIS = 473;

// ── Question type (from /api/rishbot/question) ────────────────────────────────

type QuestionData = {
  passage: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

type AnswerKey = "A" | "B" | "C" | "D";
type SessionState =
  | "idle"
  | "enabling"
  | "calibrating"
  | "loading"
  | "active"
  | "answered";

// ── EyeTrackingDemo ───────────────────────────────────────────────────────────

// MediaPipe FaceLandmarker type (minimal surface we use)
type Landmark = { x: number; y: number; z: number };
type FaceLandmarkerInstance = {
  detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks?: Landmark[][] };
  close: () => void;
};

function EyeTrackingDemo() {
  const [state, setState] = useState<SessionState>("idle");
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [selected, setSelected] = useState<AnswerKey | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [activeZone, setActiveZone] = useState<ZoneId>("passage");
  const [zoneTimes, setZoneTimes] = useState<Record<ZoneId, number>>({
    passage: 0, question: 0, answers: 0, timer: 0,
  });
  const [calibCountdown, setCalibCountdown] = useState(3);
  const [gazeActive, setGazeActive] = useState(false);
  const [gazeDataReceived, setGazeDataReceived] = useState(false);
  const [wgError, setWgError] = useState(false);
  const [gazePos, setGazePos] = useState<{ x: number; y: number } | null>(null);

  const passageRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<HTMLSpanElement>(null);
  const lastZoneRef = useRef<ZoneId>("passage");
  const lastTimeRef = useRef<number>(Date.now());
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<SessionState>("idle");

  // MediaPipe refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const neutralRef = useRef<number | null>(null);
  const neutralHorizRef = useRef<number | null>(null);
  const calibSamplesRef = useRef<number[]>([]);
  const calibHorizSamplesRef = useRef<number[]>([]);

  // Keep stateRef in sync so the RAF loop (a closure) sees current state
  useEffect(() => { stateRef.current = state; }, [state]);

  // Zone percentages derived from actual dwell times
  const zonePcts = useMemo(() => {
    const total = Object.values(zoneTimes).reduce((s, v) => s + v, 0);
    if (total === 0) return { passage: 0, question: 0, answers: 0, timer: 0 };
    return Object.fromEntries(
      ZONE_IDS.map((id) => [id, Math.round((zoneTimes[id] / total) * 100)])
    ) as Record<ZoneId, number>;
  }, [zoneTimes]);

  const detectZone = useCallback((x: number, y: number): ZoneId => {
    const checks: [ZoneId, React.RefObject<HTMLElement>][] = [
      ["passage",  passageRef  as React.RefObject<HTMLElement>],
      ["question", questionRef as React.RefObject<HTMLElement>],
      ["answers",  answersRef  as React.RefObject<HTMLElement>],
    ];
    for (const [id, ref] of checks) {
      const r = ref.current?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
        return id;
    }
    const tr = timerRef.current?.getBoundingClientRect();
    if (tr && y <= tr.bottom + 40 && Math.abs(x - (tr.left + tr.width / 2)) < 120)
      return "timer";
    return lastZoneRef.current;
  }, []);

  const recordGaze = useCallback(
    (x: number, y: number) => {
      setGazePos({ x, y });
      if (stateRef.current !== "active") return;
      setGazeDataReceived(true);
      const now = Date.now();
      const elapsed = now - lastTimeRef.current;
      setZoneTimes((prev) => ({
        ...prev,
        [lastZoneRef.current]: prev[lastZoneRef.current] + elapsed,
      }));
      lastTimeRef.current = now;
      const zone = detectZone(x, y);
      lastZoneRef.current = zone;
      setActiveZone(zone);
    },
    [detectZone]
  );

  // Per-frame detection loop — reads iris landmarks and maps to screen coords
  const runLoop = useCallback(() => {
    const video = videoRef.current;
    const lm_ref = faceLandmarkerRef.current;
    if (!video || !lm_ref || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(runLoop);
      return;
    }
    const results = lm_ref.detectForVideo(video, performance.now());
    if (results.faceLandmarks?.[0]) {
      const lm = results.faceLandmarks[0];

      // Head-stabilised gaze: iris position relative to the midpoint of the
      // inner eye corners (lm 133 = left, lm 362 = right). Both landmarks
      // move with the head, so their midpoint cancels out head translation.
      // Only actual eye rotation changes the iris-relative-to-head offset.
      const headRefY = (lm[133].y + lm[362].y) / 2;
      const headRefX = (lm[133].x + lm[362].x) / 2;
      const gazeY = (lm[L_IRIS].y + lm[R_IRIS].y) / 2 - headRefY;
      const gazeX = (lm[L_IRIS].x + lm[R_IRIS].x) / 2 - headRefX;

      if (stateRef.current === "calibrating") {
        calibSamplesRef.current.push(gazeY);
        calibHorizSamplesRef.current.push(gazeX);
      } else if (stateRef.current === "active") {
        const neutralY = neutralRef.current ?? 0;
        const neutralX = neutralHorizRef.current ?? 0;
        const GAIN_V = 60;
        const GAIN_H = 25;
        const screenY = Math.max(0, Math.min(
          window.innerHeight - 1,
          window.innerHeight * 0.5 + (gazeY - neutralY) * GAIN_V * window.innerHeight
        ));
        const screenX = Math.max(0, Math.min(
          window.innerWidth - 1,
          window.innerWidth * 0.5 - (gazeX - neutralX) * GAIN_H * window.innerWidth
        ));
        recordGaze(screenX, screenY);
      }
    }
    animFrameRef.current = requestAnimationFrame(runLoop);
  }, [recordGaze]);

  // Start MediaPipe eye tracking and begin calibration
  const startEyeTracking = async () => {
    setState("enabling");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      video.muted = true;
      // Small mirrored preview bottom-right so user can see their face
      video.style.cssText =
        "position:fixed;bottom:12px;right:12px;width:120px;height:90px;border-radius:10px;z-index:9000;opacity:0.85;transform:scaleX(-1);object-fit:cover;border:1px solid rgba(6,182,212,0.4)";
      document.body.appendChild(video);
      videoRef.current = video;
      await video.play();

      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
      );
      const landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });
      faceLandmarkerRef.current = landmarker as FaceLandmarkerInstance;

      calibSamplesRef.current = [];
      calibHorizSamplesRef.current = [];
      animFrameRef.current = requestAnimationFrame(runLoop);
      setGazeActive(true);
      setCalibCountdown(3);
      setState("calibrating");
    } catch {
      setWgError(true);
      setState("idle");
      if (videoRef.current) {
        (videoRef.current.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop());
        videoRef.current.remove();
        videoRef.current = null;
      }
    }
  };

  // Calibration: collect iris samples for 3 seconds then derive neutral gaze position
  useEffect(() => {
    if (state !== "calibrating") return;
    calibSamplesRef.current = [];
    const countInterval = setInterval(() => {
      setCalibCountdown(c => Math.max(0, c - 1));
    }, 1000);
    const doneTimeout = setTimeout(() => {
      clearInterval(countInterval);
      const samples = calibSamplesRef.current;
      neutralRef.current =
        samples.length > 0 ? samples.reduce((a, b) => a + b) / samples.length : 0.5;
      const hSamples = calibHorizSamplesRef.current;
      neutralHorizRef.current =
        hSamples.length > 0 ? hSamples.reduce((a, b) => a + b) / hSamples.length : 0;
      fetchQuestion();
    }, 3600);
    return () => {
      clearInterval(countInterval);
      clearTimeout(doneTimeout);
    };
    // fetchQuestion is defined below; stable across renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const fetchQuestion = async () => {
    setState("loading");
    setGazeDataReceived(false);
    try {
      const res = await fetch("/api/rishbot/question");
      if (!res.ok) throw new Error("api error");
      const data: QuestionData = await res.json();
      setQuestion(data);
      setTimeLeft(120);
      setZoneTimes({ passage: 0, question: 0, answers: 0, timer: 0 });
      lastTimeRef.current = Date.now();
      setState("active");
    } catch {
      setState("idle");
    }
  };

  // Countdown timer
  useEffect(() => {
    if (state !== "active") return;
    timerIdRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { setState("answered"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, [state]);

  const submitAnswer = (key: AnswerKey) => {
    if (state !== "active") return;
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    const elapsed = Date.now() - lastTimeRef.current;
    setZoneTimes((prev) => ({
      ...prev,
      [lastZoneRef.current]: prev[lastZoneRef.current] + elapsed,
    }));
    setSelected(key);
    setState("answered");
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  };

  const stopTracking = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (videoRef.current) {
      (videoRef.current.srcObject as MediaStream | null)?.getTracks().forEach(t => t.stop());
      videoRef.current.remove();
      videoRef.current = null;
    }
    faceLandmarkerRef.current?.close();
    faceLandmarkerRef.current = null;
    neutralRef.current = null;
    neutralHorizRef.current = null;
    calibSamplesRef.current = [];
    calibHorizSamplesRef.current = [];
  };

  const reset = () => {
    stopTracking();
    setSelected(null);
    setQuestion(null);
    setGazeActive(false);
    setGazeDataReceived(false);
    setWgError(false);
    setGazePos(null);
    setState("idle");
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const coachingMessage = useMemo(() => {
    if (!question || !selected) return "";
    const correct = selected === question.correct;
    const result = correct
      ? `Correct. ${question.explanation}`
      : `The correct answer was ${question.correct}. ${question.explanation}`;

    if (!gazeDataReceived) return result;

    const { passage: p, question: q, answers: a, timer: t } = zonePcts;
    const tips: string[] = [];
    if (p > 55 && q < 12)
      tips.push(
        "You spent most time on the passage before reading the question. Try reading the question stem first to direct your search for evidence."
      );
    else if (q < 8)
      tips.push(
        "Very little time on the question stem — make sure you fully understand what is being asked before scanning the passage."
      );
    if (t > 12)
      tips.push(
        "Frequent timer checks may indicate time pressure. Practising pacing can free up more attention for the content itself."
      );
    if (a < 10 && !correct)
      tips.push(
        "You spent little time reviewing the answer options. Comparing all four choices before committing can reduce impulsive selections."
      );
    tips.push(result);
    return tips.join(" ");
  }, [question, selected, zonePcts, gazeDataReceived]);

  // ── Idle state ──────────────────────────────────────────────────────────────
  if (state === "idle") {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 space-y-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center mx-auto">
          <svg
            className="w-7 h-7 text-cyan-400"
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
          <h3 className="text-white font-bold text-base">
            UCAT Practice with Eye Tracking
          </h3>
          <p className="text-slate-400 text-sm mt-1 leading-relaxed">
            AI generates a real UCAT passage and question. Your webcam tracks
            which zone your eyes are actually looking at — Passage, Question,
            Answers, or Timer.
          </p>
        </div>
        {wgError && (
          <p className="text-xs text-red-400">
            Could not load eye-tracking library. Try the practice-only option below.
          </p>
        )}
        <div className="space-y-2">
          <button
            onClick={startEyeTracking}
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.25)]"
          >
            Enable Eye Tracking + Start →
          </button>
          <button
            onClick={fetchQuestion}
            className="w-full py-2 rounded-xl border border-slate-600 text-slate-400 text-sm hover:text-white hover:border-slate-500 transition-colors"
          >
            Skip eye tracking — just practise
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Webcam required for eye tracking. No video is recorded or stored.
        </p>
      </div>
    );
  }

  // ── Loading WebGazer ────────────────────────────────────────────────────────
  if (state === "enabling") {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 text-center space-y-3">
        <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-300 text-sm">Loading eye-tracking…</p>
        <p className="text-slate-500 text-xs">Webcam permission prompt may appear</p>
      </div>
    );
  }

  // ── Calibration ─────────────────────────────────────────────────────────────
  if (state === "calibrating") {
    return (
      <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center gap-8 text-center px-6">
        <div className="space-y-2">
          <p className="text-white font-bold text-xl">Calibrating Eye Tracking</p>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Look directly at the dot below and hold still while we record your neutral gaze position.
          </p>
        </div>
        {/* Target dot */}
        <div className="relative flex items-center justify-center">
          <div
            className="absolute w-28 h-28 rounded-full border border-cyan-400/30 animate-ping"
            style={{ animationDuration: "1.5s" }}
          />
          <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center shadow-[0_0_36px_rgba(6,182,212,0.8)]">
            <div className="w-3 h-3 rounded-full bg-slate-900" />
          </div>
        </div>
        {/* Countdown */}
        <div className="text-7xl font-black text-cyan-400 tabular-nums leading-none">
          {calibCountdown > 0 ? calibCountdown : "✓"}
        </div>
        <p className="text-slate-500 text-xs">
          Your webcam preview is shown bottom-right · no video is stored
        </p>
      </div>
    );
  }

  // ── Fetching question ───────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-10 text-center space-y-3">
        <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-300 text-sm">Generating UCAT question…</p>
      </div>
    );
  }

  // ── Active question ─────────────────────────────────────────────────────────
  if ((state === "active" || state === "answered") && question) {
    const timeCritical = timeLeft < 30 && state === "active";
    return (
      <>
        {/* Gaze ring — explicit pixel offsets, no transforms, no ambiguity */}
        {gazeActive && gazePos && state === "active" && (
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
            {/* Soft glow */}
            <div
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: "50%",
                background: "rgba(6,182,212,0.08)",
                filter: "blur(5px)",
              }}
            />
            {/* Cyan ring */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(6,182,212,0.7)",
                boxShadow: "0 0 8px rgba(6,182,212,0.35)",
                background: "rgba(6,182,212,0.04)",
              }}
            />
            {/* Centre dot */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%,-50%)",
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "rgba(6,182,212,0.85)",
              }}
            />
          </div>
        )}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-700/80 border-b border-slate-600/50">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-slate-600 text-slate-200 font-medium">
              Verbal Reasoning
            </span>
            {gazeActive && state === "active" && (
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse inline-block" />
                Eye tracking active
              </span>
            )}
          </div>
          <span
            ref={timerRef}
            className={`font-mono font-bold text-sm transition-colors ${
              state === "answered"
                ? "text-slate-500"
                : timeCritical
                ? "text-red-400 animate-pulse"
                : "text-white"
            }`}
          >
            {formatTime(timeLeft)}
          </span>
        </div>

        <div className="p-4 space-y-3">
          {/* Passage */}
          <div
            ref={passageRef}
            className={`rounded-xl p-4 border transition-all duration-300 ${
              activeZone === "passage" && state === "active"
                ? ZONE.passage.active_box
                : ZONE.passage.inactive_box
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  activeZone === "passage" && state === "active"
                    ? ZONE.passage.badge
                    : "text-slate-500"
                }`}
              >
                Passage
              </span>
              {activeZone === "passage" && state === "active" && (
                <span className="flex items-center gap-1 text-xs text-blue-400 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
                  tracking
                </span>
              )}
            </div>
            <p className="text-slate-200 text-sm leading-relaxed">
              {question.passage}
            </p>
          </div>

          {/* Question stem */}
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
                <span className="flex items-center gap-1 text-xs text-purple-400 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 inline-block" />
                  tracking
                </span>
              )}
            </div>
            <p className="text-slate-200 text-sm font-medium">
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
                <span className="flex items-center gap-1 text-xs text-green-400 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  tracking
                </span>
              )}
            </div>
            <div className="space-y-2">
              {(["A", "B", "C", "D"] as AnswerKey[]).map((key) => {
                const isSelected = selected === key;
                const isCorrect =
                  state === "answered" && key === question.correct;
                const isWrong =
                  state === "answered" &&
                  isSelected &&
                  key !== question.correct;
                return (
                  <button
                    key={key}
                    onClick={() => submitAnswer(key)}
                    disabled={state === "answered"}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm border transition-all ${
                      isCorrect
                        ? "border-green-400 bg-green-900/30 text-green-200"
                        : isWrong
                        ? "border-red-400 bg-red-900/30 text-red-300"
                        : isSelected
                        ? "border-cyan-400 bg-cyan-900/30 text-cyan-200"
                        : state === "active"
                        ? "border-slate-600 bg-slate-700/50 text-slate-200 hover:border-slate-500 hover:bg-slate-700"
                        : "border-slate-700 bg-slate-800/30 text-slate-500"
                    }`}
                  >
                    <span className="font-bold mr-2">{key}.</span>
                    {question.options[key]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Zone stats */}
          {gazeDataReceived ? (
            <div className="grid grid-cols-4 gap-1.5">
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
            <div className="rounded-xl p-2 text-center border border-slate-700/50 bg-slate-800/30 text-xs text-slate-500">
              Eye tracking data not recorded
            </div>
          )}

          {/* AI coaching after answer */}
          {state === "answered" && (
            <div
              className={`rounded-xl p-4 border text-sm leading-relaxed ${
                selected === question.correct
                  ? "border-green-400/40 bg-green-900/20"
                  : "border-red-400/40 bg-red-900/20"
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-2 font-semibold text-sm ${
                  selected === question.correct
                    ? "text-green-300"
                    : "text-red-300"
                }`}
              >
                {selected === question.correct ? "✓ Correct" : "✗ Incorrect"}
                <span className="text-xs font-normal text-slate-400">
                  · AI coaching
                </span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                {coachingMessage}
              </p>
              <button
                onClick={reset}
                className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 transition-colors"
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
    "Basic UCAT practice sessions",
    "Overall accuracy & time taken",
    "Section-level results",
    'Simple timing feedback (e.g. "slower than expected")',
    "Webcam eye-tracking demo",
    "Limited AI coaching summary",
  ];

  const premiumFeatures = [
    "Full weakness detection by section & question subtype",
    "Timing weakness analysis per question type",
    "Accuracy trend tracking across sessions",
    "Personalised next-session recommendations",
    "AI coaching reports from structured performance data",
    'Advanced eye-pattern insights (e.g. "You rarely read the question before selecting an answer")',
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Free */}
      <div className="rounded-2xl bg-slate-800/60 border border-slate-600/50 p-6 flex flex-col gap-5">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Free Plan
          </span>
          <div className="mt-1 text-3xl font-black text-white">
            £0{" "}
            <span className="text-sm font-normal text-slate-400">/ month</span>
          </div>
        </div>
        <ul className="flex-1 space-y-2 text-sm text-slate-300">
          {freeFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={onFreeClick}
          className="w-full py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400 transition-colors shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          Get Started Free
        </button>
      </div>

      {/* Premium */}
      <div className="relative rounded-2xl bg-gradient-to-b from-blue-950 to-slate-900 border border-blue-500/40 p-6 flex flex-col gap-5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
              Premium Plan
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
              Coming Soon
            </span>
          </div>
          <div className="mt-1 text-3xl font-black text-white opacity-50">
            £—
          </div>
        </div>
        <ul className="relative flex-1 space-y-2 text-sm text-slate-500">
          {premiumFeatures.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <svg
                className="w-4 h-4 text-blue-400/40 mt-0.5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="relative">
          <button
            disabled
            className="w-full py-2.5 rounded-xl bg-blue-500/15 border border-blue-400/25 text-blue-400/40 text-sm font-semibold cursor-not-allowed"
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
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
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
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Rishbot
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
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                tab === t
                  ? "bg-cyan-500 text-white"
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
                className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white text-sm px-4 py-2.5 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
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
              className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white text-sm px-4 py-2.5 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
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
              className="w-full rounded-xl bg-slate-800 border border-slate-600 text-white text-sm px-4 py-2.5 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 text-white text-sm font-semibold hover:bg-cyan-400 transition-colors mt-1 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
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
    <div className="rounded-2xl bg-slate-800/40 border border-slate-700/40 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <svg
          className="w-4 h-4 text-slate-400 flex-shrink-0"
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
        <span className="text-sm font-semibold text-slate-300">
          Privacy &amp; Eye-Tracking Notice
        </span>
      </div>
      <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
        <p>
          Rishbot may use your webcam to estimate broad attention zones during
          practice. This is entirely optional — you can use the full tutor
          without enabling webcam tracking.
        </p>
        <p>
          We do not record or store webcam video. Eye-tracking results are
          approximate and are used only to provide educational feedback. This
          system is not medical-grade, diagnostic, or guaranteed accurate.
        </p>
        <p>
          AI feedback is educational guidance only and does not guarantee exam
          outcomes. Performance data may be stored to your account to enable
          feedback features. You can opt out or request deletion at any time by
          contacting{" "}
          <a
            href="mailto:medwithrish@gmail.com"
            className="text-cyan-400 hover:underline"
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
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
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
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg border border-slate-600 hover:border-slate-500"
          >
            Log out
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: "Sessions", value: "0" },
            { label: "Avg Accuracy", value: "—" },
            { label: "Avg Time / Q", value: "—" },
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
              className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-5 flex items-center justify-between group hover:border-cyan-500/40 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-sm font-semibold text-white">{sec}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  No sessions yet — start practising
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <svg
                  className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors"
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
              eye-pattern insights
            </div>
          </div>
          <span className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-medium">
            Coming Soon
          </span>
        </div>

        <EyeTrackingDemo />
        <div className="mt-6">
          <PrivacyNotice />
        </div>
      </div>
    </div>
  );
}

// ── UCAT Section (plan selection) ─────────────────────────────────────────────

function UCATSection({
  onBack,
  onFreePlan,
}: {
  onBack: () => void;
  onFreePlan: () => void;
}) {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-20">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-8 transition-colors"
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
          Back to Rishbot
        </button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">🧠</span>
            <div>
              <h1 className="text-2xl font-bold text-white">UCAT Tutor</h1>
              <p className="text-slate-400 text-sm">
                AI-powered preparation with optional eye-tracking
              </p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Choose your plan below. The free tier includes basic practice
            feedback and the eye-tracking demo. Premium unlocks deep weakness
            detection and full AI coaching reports.
          </p>
        </div>

        {/* Plan cards */}
        <div className="mb-8">
          <PlanCards onFreeClick={onFreePlan} />
        </div>

        {/* Feedback explainer */}
        <div className="mb-8 rounded-2xl bg-slate-800/40 border border-slate-700/40 p-5 space-y-4">
          <h3 className="text-white font-semibold text-sm">
            What does feedback look like?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <div className="text-xs font-semibold text-cyan-400 uppercase tracking-wide mb-2">
                Free — Basic Feedback
              </div>
              <ul className="space-y-1.5 text-xs text-slate-400">
                {[
                  "Overall accuracy (e.g. 7/11 correct)",
                  "Time taken for the full question set",
                  "Section-level result breakdown",
                  '"You were slower than expected on this set"',
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-cyan-400 mt-0.5 flex-shrink-0">
                      ·
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold text-blue-400/70 uppercase tracking-wide mb-2">
                Premium — Full Weakness Detection
              </div>
              <ul className="space-y-1.5 text-xs text-slate-500">
                {[
                  "Breakdown by section and question subtype",
                  "Repeated weakness patterns over time",
                  "Timing weaknesses by question type",
                  '"QR percentage-change questions: 42 s above target"',
                  "Specific recommended next-session focus",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <span className="text-blue-400/40 mt-0.5 flex-shrink-0">
                      ·
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Eye tracking demo */}
        <div className="mb-8">
          <EyeTrackingDemo />
        </div>

        <PrivacyNotice />
      </div>
    </div>
  );
}

// ── Landing Hero ──────────────────────────────────────────────────────────────

function RishbotHero({ onUCATClick }: { onUCATClick: () => void }) {
  return (
    <div className="min-h-[calc(100vh-73px)] bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center px-4 py-16">
      <EyeAnimation />

      <h1 className="mt-6 text-4xl sm:text-5xl font-black text-white text-center leading-tight">
        Hi! I&apos;m{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          Rishbot!
        </span>
      </h1>

      <p className="mt-4 text-center text-slate-300 text-lg max-w-xl leading-relaxed">
        I am an AI Healthcare Admissions tutor designed by leading Medical
        admissions specialist{" "}
        <span className="text-cyan-400 font-semibold">@medwithrish</span>.
      </p>

      {/* Feature badge */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/25 text-xs text-cyan-300">
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Eye-Tracking Enabled
        </span>
        <span className="px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/25 text-xs text-blue-300">
          AI-Powered Coaching
        </span>
        <span className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/25 text-xs text-purple-300">
          Healthcare Admissions Specialist
        </span>
      </div>

      {/* Three subject buttons */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {/* UCAT — active */}
        <button
          onClick={onUCATClick}
          className="group relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-slate-900/60 p-6 text-center hover:border-cyan-400/80 hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300 cursor-pointer"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 to-cyan-500/5 group-hover:to-cyan-500/12 transition-all duration-300" />
          <div className="relative">
            <div className="text-4xl mb-3">🧠</div>
            <div className="text-white font-bold text-lg mb-1">UCAT</div>
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-medium">
              Available Now
            </span>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Practice questions with AI coaching and attention tracking
            </p>
          </div>
        </button>

        {/* Medicine Interview — WIP */}
        <div className="relative rounded-2xl border border-slate-700/40 bg-slate-900/30 p-6 text-center opacity-55 cursor-not-allowed select-none">
          <div className="text-4xl mb-3">🏥</div>
          <div className="text-white font-bold text-lg mb-1">
            Medicine Interview
          </div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-400/30 text-yellow-400 font-medium">
            Work in Progress
          </span>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            MMI and panel interview preparation
          </p>
        </div>

        {/* Dentistry Interview — WIP */}
        <div className="relative rounded-2xl border border-slate-700/40 bg-slate-900/30 p-6 text-center opacity-55 cursor-not-allowed select-none">
          <div className="text-4xl mb-3">🦷</div>
          <div className="text-white font-bold text-lg mb-1">
            Dentistry Interview
          </div>
          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-400/30 text-yellow-400 font-medium">
            Work in Progress
          </span>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Dentistry-specific interview preparation
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RishbotTutorPage() {
  const [view, setView] = useState<View>("landing");
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleFreePlan = () => {
    if (isLoggedIn) {
      setView("dashboard");
    } else {
      setShowAuth(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuth(false);
    setIsLoggedIn(true);
    setView("dashboard");
  };

  return (
    <div className="bg-slate-900">
      <Navbar />

      {view === "landing" && (
        <RishbotHero onUCATClick={() => setView("ucat")} />
      )}

      {view === "ucat" && (
        <UCATSection
          onBack={() => setView("landing")}
          onFreePlan={handleFreePlan}
        />
      )}

      {view === "dashboard" && isLoggedIn && (
        <UCATDashboard
          onLogout={() => {
            setIsLoggedIn(false);
            setView("landing");
          }}
        />
      )}

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </div>
  );
}
