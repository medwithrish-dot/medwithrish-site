"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
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
const synthesisAvailable = () => "speechSynthesis" in window;

/** Transcript hints are approximate and never diagnose stuttering or affect the score. */
export function getTranscriptHints(transcript: string) {
  const words = transcript.toLowerCase().match(/\b[\p{L}\p{N}']+\b/gu) ?? [];
  const fillerCount = (transcript.match(/\b(?:um+|uh+|erm+|er+|you know|sort of|kind of)\b/gi) ?? []).length;
  const repetitionCount = words.reduce((count, word, index) => count + Number(index > 0 && word === words[index - 1]), 0);
  return { wordCount: words.length, fillerCount, repetitionCount };
}

export function useInterviewSpeech({ onTranscript, rate = 0.95 }: { onTranscript: (text: string) => void; rate?: number }) {
  const supported = useSyncExternalStore(subscribe, recognitionAvailable, serverUnsupported);
  const voiceSupported = useSyncExternalStore(subscribe, synthesisAvailable, serverUnsupported);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef<Recognition | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const finishRef = useRef<(() => void) | null>(null);
  const stoppingRef = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);
  const speechRequestRef = useRef(0);

  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);

  const stop = useCallback((): Promise<void> => {
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
        if (recognitionRef.current === recognition) {
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
  }, []);

  const stopSpeaking = useCallback(() => {
    speechRequestRef.current += 1;
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
    stopSpeaking();
    setError("");
    setInterimTranscript("");
    const recognition = new Constructor();
    recognition.lang = "en-GB";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0].transcript.trim();
        if (result.isFinal && text) onTranscriptRef.current(text);
        else interim += `${text} `;
      }
      setInterimTranscript(interim.trim());
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted") return;
      const message = event.error === "not-allowed" || event.error === "service-not-allowed"
        ? "Microphone access was not allowed. You can enable it in your browser or type your answer."
        : event.error === "audio-capture"
          ? "No microphone was found. Connect one or type your answer."
          : event.error === "no-speech"
            ? "No speech was detected. Restart the microphone when ready, or type your answer."
            : "Speech recognition stopped. Your transcript is kept; restart the microphone or type to continue.";
      setError(message);
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;
      if (finishRef.current) { finishRef.current(); return; }
      recognitionRef.current = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      setListening(false);
      setInterimTranscript("");
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setError("The microphone could not start. Try again or type your answer.");
    }
  }, [stopSpeaking]);

  const speak = useCallback(async (text: string) => {
    const request = ++speechRequestRef.current;
    await stop();
    if (!mountedRef.current || request !== speechRequestRef.current) return;
    if (!("speechSynthesis" in window)) {
      setError("Read-aloud is unavailable in this browser. The question is displayed on screen.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-GB";
    utterance.rate = rate;
    const voice = window.speechSynthesis.getVoices().find((candidate) => candidate.lang === "en-GB");
    if (voice) utterance.voice = voice;
    utterance.onend = () => { if (mountedRef.current && request === speechRequestRef.current) setSpeaking(false); };
    utterance.onerror = (event) => {
      if (!mountedRef.current || request !== speechRequestRef.current) return;
      setSpeaking(false);
      if (event.error !== "canceled" && event.error !== "interrupted") setError("Read-aloud could not play. You can read the question on screen.");
    };
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [stop, rate]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      speechRequestRef.current += 1;
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onresult = null;
        recognition.onerror = null;
        recognition.onend = null;
        try { recognition.abort(); } catch { /* Already stopped. */ }
      }
      recognitionRef.current = null;
      finishRef.current?.();
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  return { supported, voiceSupported, listening, speaking, interimTranscript, error, start, stop, speak, stopSpeaking };
}
