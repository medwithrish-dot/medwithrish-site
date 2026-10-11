"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { monitorSpeechActivity, createSpeechBoundaryTracker, getSpeechDelivery, getTranscriptHints, normalizeSpeechTranscript, type RecognitionConfidence, type TimedSpeech } from "./speech-delivery";
import { ANSWER_SILENCE_MS, DONE_PROMPT, automaticInterruption, isInterviewerEcho, parsePreviousAnswerInterrupt } from "./station-flow";
export { getTranscriptHints } from "./speech-delivery";

type RecognitionResult = { isFinal: boolean; 0: { transcript: string; confidence?: number } };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

const subscribe = () => () => {};
const serverUnsupported = () => false;
const recognitionAvailable = () => {
  const speechWindow = window as SpeechWindow;
  return Boolean(speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition);
};
const voicePlaybackAvailable = () => "Audio" in window || "speechSynthesis" in window;

export function useInterviewSpeech({ onTranscript, rate = 0.95, answerKey = "answer", onSilence, silenceMs = ANSWER_SILENCE_MS, continuousListening = false }: { onTranscript: (text: string) => void; rate?: number; answerKey?: string; onSilence?: () => void; silenceMs?: number; continuousListening?: boolean }) {
  const supported = useSyncExternalStore(subscribe, recognitionAvailable, serverUnsupported);
  const voiceSupported = useSyncExternalStore(subscribe, voicePlaybackAvailable, serverUnsupported);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const [deliveryHints, setDeliveryHints] = useState(() => getSpeechDelivery({ transcript: "", segments: [], elapsedSeconds: 0 }));
  const deliveryHintsRef = useRef(deliveryHints);
  const [deliveryKey, setDeliveryKey] = useState(answerKey);
  const deliveryRef = useRef<{ text: string; segments: TimedSpeech[]; confidence: RecognitionConfidence[] }>({ text: "", segments: [], confidence: [] });
  const deliveryKeyRef = useRef("");
  const boundaryRef = useRef(createSpeechBoundaryTracker());
  const interimRef = useRef("");
  const activityStopRef = useRef<(() => void) | null>(null);
  const recognitionRef = useRef<Recognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playbackRef = useRef<{ text: string; onComplete?: () => void; onInterrupt?: (continuation: string) => void } | null>(null);
  const recentPromptsRef = useRef<string[]>([]);
  const echoUntilRef = useRef(0);
  const flushTranscriptRef = useRef<(() => void) | null>(null);
  const retargetRef = useRef<(() => void) | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const finishRef = useRef<(() => void) | null>(null);
  const stoppingRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);
  const speechRequestRef = useRef(0);
  const silenceTimerRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const listeningWantedRef = useRef(false);
  const measuredActivityRef = useRef<boolean | null>(null);
  const answerKeyRef = useRef(answerKey);
  const onSilenceRef = useRef(onSilence);
  useEffect(() => { onSilenceRef.current = onSilence; }, [onSilence]);
  const clearSilence = useCallback(() => { if (silenceTimerRef.current !== null) window.clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }, []);

  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  const stop = useCallback((): Promise<void> => {
    listeningWantedRef.current = false;
    clearSilence();
    if (restartTimerRef.current !== null) window.clearTimeout(restartTimerRef.current);
    restartTimerRef.current = null;
    activityStopRef.current?.();
    activityStopRef.current = null;
    if (stoppingRef.current) return stoppingRef.current;
    const recognition = recognitionRef.current;
    if (!recognition) return Promise.resolve();
    const pending = new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        if (finishRef.current === finish) finishRef.current = null;
        recognition.onresult = null;
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onspeechstart = null;
        recognition.onspeechend = null;
        if (mountedRef.current && deliveryKeyRef.current === answerKeyRef.current && interimRef.current) onTranscriptRef.current(interimRef.current);
        interimRef.current = "";
        if (recognitionRef.current === recognition) {
          flushTranscriptRef.current = null;
          retargetRef.current = null;
          activityStopRef.current?.();
          activityStopRef.current = null;
          recognitionRef.current = null;
          try { recognition.abort(); } catch { /* Already stopped. */ }
        }
        if (mountedRef.current) {
          setListening(false);
          setInterimTranscript("");
        }
        resolve();
      };
      finishRef.current = finish;
      // Some browsers never send onend after permissions/network errors.
      const timer = window.setTimeout(finish, 700);
      try { recognition.stop(); } catch { finish(); }
    });
    stoppingRef.current = pending;
    void pending.then(() => { if (stoppingRef.current === pending) stoppingRef.current = null; });
    return pending;
  }, [clearSilence]);

  const flush = useCallback(async () => {
    clearSilence();
    flushTranscriptRef.current?.();
  }, [clearSilence]);

  useEffect(() => {
    answerKeyRef.current = answerKey;
    if (recognitionRef.current && deliveryKeyRef.current !== answerKey) {
      if (continuousListening) retargetRef.current?.();
      else void stop();
    }
  }, [answerKey, continuousListening, stop]);

  const stopSpeaking = useCallback(() => {
    playbackRef.current = null;
    echoUntilRef.current = Date.now() + 2_000;
    speechRequestRef.current += 1;
    const audio = audioRef.current;
    audioRef.current = null;
    if (audio) {
      audio.onended = null;
      audio.onerror = null;
      audio.pause();
      audio.currentTime = 0;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    if (mountedRef.current) setSpeaking(false);
  }, []);

  const start = useCallback(() => {
    if (!mountedRef.current || recognitionRef.current || stoppingRef.current) return;
    const speechWindow = window as SpeechWindow;
    const Constructor = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Constructor) {
      setError("Speech recognition is unavailable in this browser. Type your answer below.");
      return;
    }
    if (!continuousListening) stopSpeaking();
    setError("");
    setInterimTranscript("");
    interimRef.current = "";
    boundaryRef.current.reset();
    if (deliveryKeyRef.current !== answerKey) {
      clearSilence();
      deliveryKeyRef.current = answerKey;
      setDeliveryKey(answerKey);
      deliveryRef.current = { text: "", segments: [], confidence: [] };
      const emptyDelivery = getSpeechDelivery({ transcript: "", segments: [], elapsedSeconds: 0 });
      deliveryHintsRef.current = emptyDelivery;
      setDeliveryHints(emptyDelivery);
    }
    const started = Date.now();
    const previousElapsed = deliveryRef.current.segments.at(-1)?.endSeconds ?? 0;
    const elapsed = () => previousElapsed + (Date.now() - started) / 1000;
    let recognition: Recognition;
    try { recognition = new Constructor(); }
    catch {
      setError("The microphone could not start. Try again or type your answer.");
      return;
    }
    listeningWantedRef.current = true;
    measuredActivityRef.current = null;
    let hasWords = false;
    let notifiedForGap = false;
    const current = () => mountedRef.current && recognitionRef.current === recognition && (continuousListening || answerKeyRef.current === answerKey);
    const seenResults = new Set<number>();
    const retiredResults = new Set<number>();
    const commandResults = new Set<number>();
    const overlappingResults = new Map<number, (continuation: string) => void>();
    let interimResultIndex: number | null = null;
    let interruptedResultIndex: number | null = null;
    const retarget = () => {
      clearSilence();
      for (const index of seenResults) {
        if (index !== interruptedResultIndex) retiredResults.add(index);
      }
      deliveryKeyRef.current = answerKeyRef.current;
      setDeliveryKey(answerKeyRef.current);
      deliveryRef.current = { text: "", segments: [], confidence: [] };
      boundaryRef.current.reset();
      hasWords = Boolean(interimRef.current);
      notifiedForGap = false;
    };
    const scheduleSilence = () => {
      clearSilence();
      if (!current() || !listeningWantedRef.current || finishRef.current || playbackRef.current || !hasWords || notifiedForGap || measuredActivityRef.current === true) return;
      silenceTimerRef.current = window.setTimeout(() => {
        silenceTimerRef.current = null;
        if (!current() || !listeningWantedRef.current || finishRef.current || playbackRef.current || measuredActivityRef.current === true) return;
        notifiedForGap = true;
        onSilenceRef.current?.();
      }, silenceMs);
    };
    const commitInterim = () => {
      const text = interimRef.current;
      interimRef.current = "";
      if (!current() || !text) return;
      if (continuousListening && interimResultIndex !== null) retiredResults.add(interimResultIndex);
      onTranscriptRef.current(text);
      boundaryRef.current.commit();
      const delivery = deliveryRef.current;
      delivery.text += ` ${text}`;
      delivery.segments.push({ kind: "speech", text, ...boundaryRef.current.timing(delivery.segments.at(-1)?.endSeconds ?? 0, elapsed()) });
    };
    flushTranscriptRef.current = () => {
      commitInterim();
      setInterimTranscript("");
      clearSilence();
      hasWords = false;
      notifiedForGap = false;
    };
    retargetRef.current = retarget;
    recognition.lang = "en-GB";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onspeechstart = () => {
      if (!current() || !listeningWantedRef.current || finishRef.current) return;
      clearSilence();
      notifiedForGap = false;
      const pause = boundaryRef.current.start(elapsed());
      if (pause && !playbackRef.current) {
        // Do not place a gap before words that are still awaiting recognition.
        if (interimRef.current) return;
        onTranscriptRef.current(pause.text);
        deliveryRef.current.text += ` ${pause.text}`;
        deliveryRef.current.segments.push(pause);
      }
    };
    recognition.onspeechend = () => {
      if (!current() || !listeningWantedRef.current || finishRef.current) return;
      boundaryRef.current.end(elapsed());
      scheduleSilence();
    };
    recognition.onresult = (event) => {
      if (!current()) return;
      let interim = "";
      let receivedWords = false;
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        let text = normalizeSpeechTranscript(result[0].transcript.trim());
        if (continuousListening) {
          if (retiredResults.has(index)) continue;
          seenResults.add(index);
          if ((playbackRef.current || Date.now() < echoUntilRef.current) && isInterviewerEcho(text, recentPromptsRef.current)) continue;
          const playback = playbackRef.current;
          const interrupt = playback?.onInterrupt ?? overlappingResults.get(index);
          if (interrupt) {
            const continuation = automaticInterruption(text);
            if (continuation === null) {
              if (text) overlappingResults.set(index, interrupt);
              continue;
            }
            overlappingResults.delete(index);
            if (parsePreviousAnswerInterrupt(text) !== null) commandResults.add(index);
            interruptedResultIndex = index;
            stopSpeaking();
            // The result remains live on this recognition session. Switch the
            // answer first, then commit its complete text exactly once at final.
            interrupt("");
          } else if (playback && text) {
            if (playback.text !== DONE_PROMPT && automaticInterruption(text) === null) continue;
            stopSpeaking();
            playback.onComplete?.();
          }
          if (commandResults.has(index)) text = parsePreviousAnswerInterrupt(text) ?? text;
          if (!text) continue;
        }
        if (text) receivedWords = true;
        if (result.isFinal && text) {
          boundaryRef.current.commit();
          onTranscriptRef.current(text);
          if (continuousListening) retiredResults.add(index);
          interimRef.current = "";
          const delivery = deliveryRef.current;
          delivery.text += ` ${text}`;
          delivery.segments.push({ kind: "speech", text, ...boundaryRef.current.timing(delivery.segments.at(-1)?.endSeconds ?? 0, elapsed()) });
          delivery.confidence.push({ words: getTranscriptHints(text).wordCount, confidence: result[0].confidence ?? 0 });
        }
        else { interim += `${text} `; interimResultIndex = index; }
      }
      interimRef.current = interim.trim();
      setInterimTranscript(interim.trim());
      const delivery = deliveryRef.current;
      const liveSegments = interim.trim() ? [...delivery.segments, { kind: "speech" as const, text: interim, ...boundaryRef.current.timing(delivery.segments.at(-1)?.endSeconds ?? 0, elapsed()) }] : delivery.segments;
      const nextDelivery = getSpeechDelivery({ transcript: `${delivery.text} ${interim}`, segments: liveSegments, elapsedSeconds: elapsed(), confidence: delivery.confidence });
      deliveryHintsRef.current = nextDelivery;
      setDeliveryHints(nextDelivery);
      if (receivedWords) {
        hasWords = true;
        notifiedForGap = false;
        // Several browsers omit speechend in continuous mode. Results also
        // restart a pause watchdog; measured ongoing voice always blocks it.
        scheduleSilence();
      }
    };
    recognition.onerror = (event) => {
      if (!current() || event.error === "no-speech") return;
      if (event.error === "aborted") { void stop(); return; }
      const message = event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Microphone access was not allowed. You can enable it in your browser or type your answer."
        : event.error === "audio-capture"
          ? "No microphone was found. Connect one or type your answer."
          : event.error === "network"
            ? "Your browser’s transcription service could not connect. Check your connection and try Chrome or Edge, or type your answer. Your transcript is kept."
          : "Speech recognition stopped. Your transcript is kept; restart the microphone or type to continue.";
      setError(message);
      void stop();
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      if (finishRef.current) { finishRef.current(); return; }
      if (!current() || !listeningWantedRef.current) return;
      commitInterim();
      seenResults.clear();
      retiredResults.clear();
      commandResults.clear();
      overlappingResults.clear();
      interimResultIndex = null;
      interruptedResultIndex = null;
      setInterimTranscript("");
      if (silenceTimerRef.current === null) scheduleSilence();
      // Recognition services end on pauses and at their session limit, even
      // in continuous mode. Keep the microphone intent and the same answer.
      if (restartTimerRef.current !== null) window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = window.setTimeout(() => {
        restartTimerRef.current = null;
        if (!current() || !listeningWantedRef.current || finishRef.current) return;
        try { recognition.start(); } catch {
          setError("The microphone could not restart. Your answer is kept; turn the microphone on again or type to continue.");
          void stop();
        }
      }, 200);
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      activityStopRef.current = monitorSpeechActivity(recognition, (active) => {
        measuredActivityRef.current = active;
        if (active === true) clearSilence();
        else if (silenceTimerRef.current === null) scheduleSilence();
      });
      setListening(true);
    } catch {
      activityStopRef.current?.();
      activityStopRef.current = null;
      recognitionRef.current = null;
      listeningWantedRef.current = false;
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onspeechstart = null;
      recognition.onspeechend = null;
      try { recognition.abort(); } catch { /* The browser did not start recognition. */ }
      setError("The microphone could not start. Try again or type your answer.");
    }
  }, [stopSpeaking, stop, answerKey, clearSilence, silenceMs, continuousListening]);

  const speak = useCallback(async (text: string, onComplete?: () => void, audioSrc?: string, onInterrupt?: (continuation: string) => void) => {
    const request = ++speechRequestRef.current;
    if (!continuousListening) await stop();
    if (!mountedRef.current || request !== speechRequestRef.current) return;
    const finish = () => {
      if (!mountedRef.current || request !== speechRequestRef.current) return;
      playbackRef.current = null;
      echoUntilRef.current = Date.now() + 2_000;
      audioRef.current = null;
      setSpeaking(false);
      onComplete?.();
    };
    clearSilence();
    playbackRef.current = { text, onComplete, onInterrupt };
    recentPromptsRef.current = [...recentPromptsRef.current.slice(-1), text];
    echoUntilRef.current = Date.now() + 2_000;
    const speakWithBrowserVoice = () => {
      if (!mountedRef.current || request !== speechRequestRef.current) return;
      if (!("speechSynthesis" in window)) {
        setError("Read-aloud is unavailable in this browser. The question is displayed on screen.");
        finish();
        return;
      }
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-GB";
        utterance.rate = rate;
        const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang === "en-GB");
        if (voice) utterance.voice = voice;
        utterance.onend = finish;
        utterance.onerror = (event) => {
          if (!mountedRef.current || request !== speechRequestRef.current) return;
          finish();
          if (event.error !== "canceled" && event.error !== "interrupted") setError("Read-aloud could not play. You can read the question on screen.");
        };
        window.speechSynthesis.speak(utterance);
      } catch {
        finish();
        setError("Read-aloud could not play. You can read the question on screen.");
      }
    };
    setSpeaking(true);
    if (audioSrc && "Audio" in window) {
      let audio: HTMLAudioElement;
      try {
        audio = new Audio(audioSrc);
        audio.playbackRate = rate;
        audio.preservesPitch = true;
      } catch {
        speakWithBrowserVoice();
        return;
      }
      audioRef.current = audio;
      let fellBack = false;
      const fallback = () => {
        if (fellBack || !mountedRef.current || request !== speechRequestRef.current) return;
        fellBack = true;
        audio.onended = null;
        audio.onerror = null;
        audioRef.current = null;
        speakWithBrowserVoice();
      };
      audio.onended = finish;
      audio.onerror = fallback;
      try { void audio.play().catch(fallback); } catch { fallback(); }
      return;
    }
    speakWithBrowserVoice();
  }, [stop, rate, continuousListening, clearSilence]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      playbackRef.current = null;
      listeningWantedRef.current = false;
      clearSilence();
      if (restartTimerRef.current !== null) window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
      speechRequestRef.current += 1;
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        recognition.onspeechstart = null;
        recognition.onspeechend = null;
        try { recognition.abort(); } catch { /* Already stopped. */ }
      }
      activityStopRef.current?.();
      activityStopRef.current = null;
      recognitionRef.current = null;
      finishRef.current?.();
      const audio = audioRef.current;
      audioRef.current = null;
      if (audio) {
        audio.onended = null;
        audio.onerror = null;
        audio.pause();
      }
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [clearSilence]);

  return { supported, voiceSupported, listening, speaking, interimTranscript,
    deliveryHints: deliveryKey === answerKey ? deliveryHints : getSpeechDelivery({ transcript: "", segments: [], elapsedSeconds: 0 }),
    getDeliveryHints: () => deliveryHintsRef.current,
    error, start, stop, flush, speak, stopSpeaking };
}
