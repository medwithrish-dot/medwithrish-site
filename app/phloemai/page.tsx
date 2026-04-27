"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Navbar from "@/components/Navbar";

// ── Types ─────────────────────────────────────────────────────────────────────

type View = "landing" | "ucat" | "dashboard";

// ── PhloemAI Logo (landing hero) ─────────────────────────────────────────────

function PhloemAILogo() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center shadow-lg border border-blue-500/20">
      <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
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
    pct: 42,
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
    pct: 26,
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
    pct: 7,
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
    pct: 20,
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
const ZONE_IDS: ZoneId[] = ["sectionA", "sectionB", "question", "answers"];
const emptyZoneTimes = (): Record<ZoneId, number> => ({
  sectionA: 0,
  sectionB: 0,
  question: 0,
  answers: 0,
});

// ── MediaPipe iris landmark indices ───────────────────────────────────────────

const L_IRIS = 468, R_IRIS = 473;

// 3-point vertical calibration: top → centre → bottom
const CALIB_PHASES = [
  { label: "the top of the screen", y: 10 },
  { label: "the centre",            y: 50 },
  { label: "the bottom",            y: 90 },
] as const;

// ── Question type (from /api/rishbot/question) ────────────────────────────────

type QuestionData = {
  sectionA?: string;
  sectionB?: string;
  passage?: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct: "A" | "B" | "C" | "D";
  explanation: string;
};

function getPassageSections(question: QuestionData) {
  if (question.sectionA && question.sectionB) {
    return { sectionA: question.sectionA, sectionB: question.sectionB };
  }

  const words = (question.passage ?? "").trim().split(/\s+/);
  const midpoint = Math.ceil(words.length / 2);
  return {
    sectionA: words.slice(0, midpoint).join(" "),
    sectionB: words.slice(midpoint).join(" "),
  };
}

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
  const [activeZone, setActiveZone] = useState<ZoneId>("sectionA");
  const [zoneTimes, setZoneTimes] = useState<Record<ZoneId, number>>(emptyZoneTimes);
  const [calibPhase, setCalibPhase] = useState(0);
  const [calibCountdown, setCalibCountdown] = useState(2);
  const [gazeActive, setGazeActive] = useState(false);
  const [gazeDataReceived, setGazeDataReceived] = useState(false);
  const [wgError, setWgError] = useState(false);
  const [gazePos, setGazePos] = useState<{ x: number; y: number } | null>(null);

  const sectionARef = useRef<HTMLDivElement>(null);
  const sectionBRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const answersRef = useRef<HTMLDivElement>(null);
  const lastZoneRef = useRef<ZoneId>("sectionA");
  const lastTimeRef = useRef<number>(0);
  const timerIdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stateRef = useRef<SessionState>("idle");

  // MediaPipe refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarkerInstance | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const neutralRef = useRef<number | null>(null);
  const neutralHorizRef = useRef<number | null>(null);
  const gainVRef = useRef<number>(60);
  const calibPhaseRef = useRef(0);
  const calibPhaseSamples = useRef<[number[], number[], number[]]>([[], [], []]);
  const calibHorizSamplesRef = useRef<number[]>([]);

  // Keep stateRef in sync so the RAF loop (a closure) sees current state
  useEffect(() => { stateRef.current = state; }, [state]);

  // Zone percentages derived from actual dwell times
  const zonePcts = useMemo(() => {
    const total = Object.values(zoneTimes).reduce((s, v) => s + v, 0);
    if (total === 0) return emptyZoneTimes();
    return Object.fromEntries(
      ZONE_IDS.map((id) => [id, Math.round((zoneTimes[id] / total) * 100)])
    ) as Record<ZoneId, number>;
  }, [zoneTimes]);

  const detectZone = useCallback((x: number, y: number): ZoneId => {
    const checks: [ZoneId, React.RefObject<HTMLElement>][] = [
      ["sectionA", sectionARef as React.RefObject<HTMLElement>],
      ["sectionB", sectionBRef as React.RefObject<HTMLElement>],
      ["question", questionRef as React.RefObject<HTMLElement>],
      ["answers",  answersRef  as React.RefObject<HTMLElement>],
    ];
    for (const [id, ref] of checks) {
      const r = ref.current?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom)
        return id;
    }
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

  // Per-frame detection loop - reads iris landmarks and maps to screen coords
  const runLoopRef = useRef<() => void>(() => {});
  const runLoop = useCallback(() => {
    const video = videoRef.current;
    const lm_ref = faceLandmarkerRef.current;
    if (!video || !lm_ref || video.readyState < 2) {
      animFrameRef.current = requestAnimationFrame(runLoopRef.current);
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
        const ph = calibPhaseRef.current;
        calibPhaseSamples.current[ph]?.push(gazeY);
        if (ph === 1) calibHorizSamplesRef.current.push(gazeX);
      } else if (stateRef.current === "active") {
        const neutralY = neutralRef.current ?? 0;
        const neutralX = neutralHorizRef.current ?? 0;
        const GAIN_V = gainVRef.current * 1.2;
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
    animFrameRef.current = requestAnimationFrame(runLoopRef.current);
  }, [recordGaze]);
  useEffect(() => { runLoopRef.current = runLoop; }, [runLoop]);

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

      calibPhaseSamples.current = [[], [], []];
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

  const fetchQuestion = async () => {
    setState("loading");
    setGazeDataReceived(false);
    try {
      const res = await fetch("/api/rishbot/question");
      if (!res.ok) throw new Error("api error");
      const data: QuestionData = await res.json();
      setQuestion(data);
      setTimeLeft(120);
      setZoneTimes(emptyZoneTimes());
      lastZoneRef.current = "sectionA";
      lastTimeRef.current = Date.now();
      setState("active");
    } catch {
      setState("idle");
    }
  };

  // 3-point calibration: top → centre → bottom, 2.5 s per phase.
  // After all phases, derive personalised vertical gain from the measured range.
  useEffect(() => {
    if (state !== "calibrating") return;

    calibPhaseSamples.current = [[], [], []];
    calibHorizSamplesRef.current = [];
    const timers: ReturnType<typeof setTimeout>[] = [];
    const intervals: ReturnType<typeof setInterval>[] = [];

    const avg = (arr: number[]) =>
      arr.length > 0 ? arr.reduce((a, b) => a + b) / arr.length : null;

    const finish = () => {
      const topG    = avg(calibPhaseSamples.current[0]);
      const centerG = avg(calibPhaseSamples.current[1]);
      const bottomG = avg(calibPhaseSamples.current[2]);
      neutralRef.current = centerG ?? 0;
      if (topG !== null && bottomG !== null && bottomG - topG > 0.0005) {
        // Map 80 % of viewport height to the full measured gaze range
        gainVRef.current = Math.min(200, Math.max(30, 0.8 / (bottomG - topG)));
      } else {
        gainVRef.current = 60;
      }
      neutralHorizRef.current = avg(calibHorizSamplesRef.current) ?? 0;
      fetchQuestion();
    };

    const runPhase = (phase: number) => {
      calibPhaseRef.current = phase;
      setCalibPhase(phase);
      setCalibCountdown(2);
      const ci = setInterval(() => setCalibCountdown(c => Math.max(0, c - 1)), 1000);
      intervals.push(ci);
      const t = setTimeout(() => {
        clearInterval(ci);
        if (phase < 2) runPhase(phase + 1);
        else finish();
      }, 2600);
      timers.push(t);
    };

    runPhase(0);
    return () => {
      timers.forEach(clearTimeout);
      intervals.forEach(clearInterval);
    };
  }, [state]);

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

  const submitAnswer = useCallback((key: AnswerKey) => {
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
  }, [state]);

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
    gainVRef.current = 60;
    calibPhaseSamples.current = [[], [], []];
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

    const sectionTotal = zonePcts.sectionA + zonePcts.sectionB;
    const { question: q, answers: a } = zonePcts;
    const tips: string[] = [];
    if (sectionTotal > 55 && q < 12)
      tips.push(
        "You spent most time on the passage sections before reading the question. Try reading the question stem first to direct your search for evidence."
      );
    else if (q < 8)
      tips.push(
        "Very little time on the question stem - make sure you fully understand what is being asked before scanning the passage."
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
                For best experience: stay arm&apos;s length away from the camera, stay still, and keep your eyes parallel to the camera.
              </p>
            </div>
            <h3 className="text-slate-900 font-bold text-base">
              DEMO - Gain insights through your sight
            </h3>
            <p className="text-slate-700 text-sm mt-1 leading-relaxed">
              PhloemAI&apos;s optional attention tracker uses your webcam to estimate
              which zone you&apos;re focused on during each question -{" "}
              <span className="text-slate-900 font-medium">Section A</span>,{" "}
              <span className="text-slate-900 font-medium">Section B</span>,{" "}
              <span className="text-slate-900 font-medium">Question</span>,{" "}
              or <span className="text-slate-900 font-medium">Answers</span>. It shows{" "}
              <em>how</em> you read, not just what you got wrong.
            </p>
            <p className="text-slate-500 text-xs mt-2">
              Used during UCAT practice sessions only. Entirely optional - no video is ever recorded or stored.
            </p>
          </div>
        </div>
        {wgError && (
          <p className="text-xs text-red-500">
            Could not load eye-tracking. Try the practice-only option below.
          </p>
        )}
        <div className="space-y-2">
          <button
            onClick={startEyeTracking}
            className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
          >
            Enable Eye Tracking + Start →
          </button>
          <button
            onClick={fetchQuestion}
            className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 text-sm hover:text-slate-900 hover:border-slate-400 transition-colors cursor-pointer"
          >
            Skip eye tracking - just practise
          </button>
        </div>
      </div>
    );
  }

  // ── Loading WebGazer ────────────────────────────────────────────────────────
  if (state === "enabling") {
    return (
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-10 text-center space-y-3">
        <div className="w-6 h-6 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mx-auto" />
        <p className="text-slate-700 text-sm">Loading eye-tracking…</p>
        <p className="text-slate-400 text-xs">Webcam permission prompt may appear</p>
      </div>
    );
  }

  // ── Calibration ─────────────────────────────────────────────────────────────
  if (state === "calibrating") {
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
        {/* Gaze ring - explicit pixel offsets, no transforms, no ambiguity */}
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
            {/* Ring */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "1.5px solid rgba(148,163,184,0.55)",
                background: "rgba(255,255,255,0.03)",
              }}
            />
            {/* Centre dot */}
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
            {gazeActive && state === "active" && (
              <span className="flex items-center gap-1 text-blue-600">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse inline-block" />
                Eye tracking active
              </span>
            )}
          </div>
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

        <div className="p-4 space-y-3">
          {/* Passage section A */}
          <div
            ref={sectionARef}
            className={`rounded-xl p-4 border transition-all duration-300 ${
              activeZone === "sectionA" && state === "active"
                ? ZONE.sectionA.active_box
                : ZONE.sectionA.inactive_box
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  activeZone === "sectionA" && state === "active"
                    ? ZONE.sectionA.badge
                    : "text-slate-500"
                }`}
              >
                Section A
              </span>
              {activeZone === "sectionA" && state === "active" && (
                <span className="flex items-center gap-1 text-xs text-blue-600 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />
                  tracking
                </span>
              )}
            </div>
            <p className="text-slate-800 text-sm leading-relaxed">
              {passageSections.sectionA}
            </p>
          </div>

          {/* Passage section B */}
          <div
            ref={sectionBRef}
            className={`rounded-xl p-4 border transition-all duration-300 ${
              activeZone === "sectionB" && state === "active"
                ? ZONE.sectionB.active_box
                : ZONE.sectionB.inactive_box
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wide ${
                  activeZone === "sectionB" && state === "active"
                    ? ZONE.sectionB.badge
                    : "text-slate-500"
                }`}
              >
                Section B
              </span>
              {activeZone === "sectionB" && state === "active" && (
                <span className="flex items-center gap-1 text-xs text-cyan-600 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 inline-block" />
                  tracking
                </span>
              )}
            </div>
            <p className="text-slate-800 text-sm leading-relaxed">
              {passageSections.sectionB}
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
            <div className="rounded-xl p-2 text-center border border-slate-200 bg-slate-50 text-xs text-slate-400">
              Eye tracking data not recorded
            </div>
          )}

          {/* AI coaching after answer */}
          {state === "answered" && (
            <div
              className={`rounded-xl p-4 border text-sm leading-relaxed ${
                selected === question.correct
                  ? "border-green-300 bg-green-50"
                  : "border-red-300 bg-red-50"
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-2 font-semibold text-sm ${
                  selected === question.correct
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {selected === question.correct ? "✓ Correct" : "✗ Incorrect"}
                <span className="text-xs font-normal text-slate-400">
                  · AI coaching
                </span>
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {coachingMessage}
              </p>
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
    "Try the webcam attention-tracking demo",
    "Receive an AI coaching summary after each session",
  ];

  const premiumFeatures = [
    "Pinpoint exactly which question subtypes you struggle with",
    "See timing breakdowns by question type, not just section",
    "Track accuracy trends across multiple sessions",
    "Get a personalised focus plan before every session",
    "Receive detailed AI coaching reports based on your data",
    "Unlock advanced attention insights - e.g. 'You skip the question stem 40% of the time'",
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
          All performance data and eye-tracking insights are encrypted and used
          only to improve your learning experience. Eye tracking is entirely
          optional - you can use the full tutor without enabling your webcam.
        </p>
        <p>
          No webcam video is ever recorded or stored. Attention analysis
          estimates broad focus zones only and is not medical-grade or
          diagnostic.
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
    <div className="min-h-[calc(100vh-49px)]">
      <div className="max-w-3xl mx-auto px-4 pt-10 pb-20">
        <button
          onClick={onBack}
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
        </button>

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
              <span className="text-blue-600 font-medium">Gain insights through your sight</span> - track your focus with optional eye-tracking.
            </p>
            <p className="text-slate-700 text-sm">Improve faster.</p>
          </div>

          {/* Benefit statement */}
          <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 mb-5 border-l-4 border-l-blue-500">
            <p className="text-slate-800 text-sm leading-relaxed italic">
              Know exactly what&apos;s slowing you down - not just what you got wrong.
            </p>
          </div>

          {/* Eye-tracking CTA banner */}
          <div className="rounded-xl bg-blue-600 px-4 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold">Try Eye Tracking</p>
              <p className="text-blue-100 text-xs mt-0.5 leading-relaxed">
                See which parts of each question you focus on - live, using your webcam. No video stored.
              </p>
            </div>
            <button
              onClick={() => {
                document.getElementById("eye-tracking-demo")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex-shrink-0 text-xs px-3 py-2 rounded-lg bg-white text-blue-600 font-semibold hover:bg-blue-50 transition-colors whitespace-nowrap cursor-pointer"
            >
              Try Demo →
            </button>
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

        {/* Eye tracking demo */}
        <div className="mb-8" id="eye-demo">
          <EyeTrackingDemo />
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

function TutorHero({ onUCATClick }: { onUCATClick: () => void }) {
  const handleDemoClick = () => {
    onUCATClick();
    setTimeout(() => {
      document.getElementById("eye-demo")?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

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
      Optional Eye-Tracker Analysis
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
            <button
              onClick={handleDemoClick}
              className="w-full py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Try UCAT Demo →
            </button>
            <button
              onClick={onUCATClick}
              className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 text-xs hover:border-slate-400 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Open UCAT Tutor
            </button>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-[#EEF4FF] to-indigo-100">
      <Navbar />

      {view === "landing" && (
        <TutorHero onUCATClick={() => setView("ucat")} />
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
