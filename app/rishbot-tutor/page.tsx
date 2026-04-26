"use client";

import { useState, useRef, useEffect } from "react";
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
const DEMO_CYCLE: ZoneId[] = [
  "passage", "passage", "question", "answers", "passage", "answers", "timer", "question",
];

function TrackingDot({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs animate-pulse ${
        active ? "" : "opacity-0"
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      tracking
    </span>
  );
}

function EyeTrackingDemo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camState, setCamState] = useState<
    "idle" | "requesting" | "granted" | "denied"
  >("idle");
  const [activeZone, setActiveZone] = useState<ZoneId>("passage");

  useEffect(() => {
    if (camState !== "granted") return;
    let i = 0;
    const id = setInterval(() => {
      setActiveZone(DEMO_CYCLE[i % DEMO_CYCLE.length]);
      i++;
    }, 2000);
    return () => clearInterval(id);
  }, [camState]);

  useEffect(() => {
    // Start demo animation immediately even without webcam
    let i = 0;
    const id = setInterval(() => {
      setActiveZone(DEMO_CYCLE[i % DEMO_CYCLE.length]);
      i++;
    }, 2000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const requestWebcam = async () => {
    setCamState("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCamState("granted");
    } catch {
      setCamState("denied");
    }
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-cyan-400"
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
          </div>
          <div>
            <p className="text-white text-sm font-semibold">
              Eye-Tracking Demo
            </p>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">
              Free tier · demo mode
            </span>
          </div>
        </div>
        <div
          className={`flex items-center gap-1.5 text-xs ${
            camState === "granted" ? "text-green-400" : "text-slate-500"
          }`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${
              camState === "granted"
                ? "bg-green-400 animate-pulse"
                : "bg-slate-500"
            }`}
          />
          {camState === "granted" ? "Live" : "Demo"}
        </div>
      </div>

      {/* Simulated UCAT screen */}
      <div className="rounded-xl overflow-hidden border border-slate-600/50 text-xs">
        <div className="flex items-center justify-between px-3 py-2 bg-slate-700/80">
          <span className="text-slate-300">Verbal Reasoning — Q3 of 11</span>
          <span
            className={`font-mono font-bold transition-colors duration-300 ${
              activeZone === "timer" ? "text-yellow-300" : "text-slate-400"
            }`}
          >
            01:23
          </span>
        </div>

        {/* Passage */}
        <div
          className={`m-2 rounded-lg p-3 border transition-all duration-500 ${
            activeZone === "passage"
              ? ZONE.passage.active_box
              : ZONE.passage.inactive_box
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`font-semibold uppercase tracking-wide ${
                activeZone === "passage"
                  ? ZONE.passage.badge
                  : "text-slate-500"
              }`}
            >
              Passage
            </span>
            <span className={ZONE.passage.tracking}>
              <TrackingDot active={activeZone === "passage"} />
            </span>
          </div>
          <div className="space-y-1.5">
            {[100, 83, 100, 70, 88].map((w, i) => (
              <div
                key={i}
                className="h-1.5 rounded bg-slate-600/50"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>

        {/* Question */}
        <div
          className={`mx-2 mb-2 rounded-lg p-3 border transition-all duration-500 ${
            activeZone === "question"
              ? ZONE.question.active_box
              : ZONE.question.inactive_box
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`font-semibold uppercase tracking-wide ${
                activeZone === "question"
                  ? ZONE.question.badge
                  : "text-slate-500"
              }`}
            >
              Question
            </span>
            <span className={ZONE.question.tracking}>
              <TrackingDot active={activeZone === "question"} />
            </span>
          </div>
          <div className="h-1.5 rounded bg-slate-600/50 w-3/4" />
        </div>

        {/* Answers */}
        <div
          className={`mx-2 mb-2 rounded-lg p-3 border transition-all duration-500 ${
            activeZone === "answers"
              ? ZONE.answers.active_box
              : ZONE.answers.inactive_box
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`font-semibold uppercase tracking-wide ${
                activeZone === "answers"
                  ? ZONE.answers.badge
                  : "text-slate-500"
              }`}
            >
              Answers
            </span>
            <span className={ZONE.answers.tracking}>
              <TrackingDot active={activeZone === "answers"} />
            </span>
          </div>
          <div className="space-y-1.5">
            {["A", "B", "C", "D"].map((l) => (
              <div key={l} className="flex gap-2 items-center">
                <span className="text-slate-500 w-3">{l}</span>
                <div className="h-1.5 rounded bg-slate-600/50 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone percentage bars */}
      <div className="grid grid-cols-4 gap-1.5">
        {ZONE_IDS.map((id) => (
          <div
            key={id}
            className={`rounded-xl p-2 text-center border transition-all duration-300 ${
              activeZone === id
                ? ZONE[id].active_stat
                : ZONE[id].inactive_stat
            }`}
          >
            <div className="text-sm font-bold">{ZONE[id].pct}%</div>
            <div className="text-xs opacity-70">{ZONE[id].label}</div>
          </div>
        ))}
      </div>

      {/* Webcam */}
      {camState === "idle" && (
        <button
          onClick={requestWebcam}
          className="w-full py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/25 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 transition-colors"
        >
          Enable Webcam Tracking (Optional) →
        </button>
      )}
      {camState === "requesting" && (
        <div className="py-2 text-center text-sm text-slate-400 animate-pulse">
          Requesting camera permission…
        </div>
      )}
      {camState === "granted" && (
        <div className="rounded-xl overflow-hidden border border-cyan-400/30">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-28 object-cover bg-slate-900"
          />
          <div className="px-3 py-1.5 bg-slate-800 text-xs text-green-400">
            ✓ Live — no video recorded or stored
          </div>
        </div>
      )}
      {camState === "denied" && (
        <div className="py-2.5 px-4 rounded-xl bg-slate-800 border border-slate-600 text-sm text-slate-400">
          Webcam not available. The tutor works fully without it.
        </div>
      )}

      <p className="text-xs text-slate-500 leading-relaxed">
        Attention zones are estimated only — not medical-grade or guaranteed
        accurate. No video is recorded or stored. Webcam access is entirely
        optional.
      </p>
    </div>
  );
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
