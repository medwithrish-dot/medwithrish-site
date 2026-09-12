/** Coaching heuristics only; these never contribute to an interview score. */
export const SPEECH_PAUSE_SECONDS = 3;
export const SPEECH_WINDOW_SECONDS = 7;
const pausePattern = /\[\s*(\d+(?:\.\d+)?)\s*(?:s|seconds?)\s+pause\s*\]/gi;
const fillerPattern = /\b(?:u+h+|u+m+|e+r+m*|h+m{2,})\b/gi;

export function formatSpeechPauseMarker(seconds: number) {
  return `[${Math.max(1, Math.round(seconds))}s pause]`;
}

export function normalizeSpeechTranscript(text: string) {
  // Keep slang and repetitions verbatim. Never invent sounds omitted by recognition.
  return text.replace(pausePattern, (_, seconds: string) => formatSpeechPauseMarker(Number(seconds)))
    .split(/(\[[^\]]*\])/g)
    .map((part) => part.startsWith("[") ? part : part.replace(fillerPattern, (filler) => `[${filler}]`))
    .join("");
}

export function stripSpeechPauseMarkers(text: string) { return text.replace(pausePattern, " "); }

export function getTranscriptHints(transcript: string) {
  const spoken = stripSpeechPauseMarkers(transcript);
  const words = spoken.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
  const fillerCount = (spoken.match(fillerPattern) ?? []).length;
  const soundPattern = /\b([a-z]{1,3})-(?:\1-)*\1[a-z]*\b/gi;
  const soundRepetitions = (spoken.match(soundPattern) ?? []).length;
  const wholeWords = spoken.replace(soundPattern, (sound) => sound.split("-").at(-1) ?? sound).toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];
  const repetitionCount = wholeWords.reduce((count, word, index) => count + Number(index > 0 && word === wholeWords[index - 1]), 0);
  const slangCount = (spoken.match(/\b(?:gonna|wanna|gotta|kinda|sorta|innit|dunno|ain't|ain’t)\b/gi) ?? []).length;
  const pauseCount = [...transcript.matchAll(pausePattern)].filter((match) => Number(match[1]) >= SPEECH_PAUSE_SECONDS).length;
  return { wordCount: words.length, fillerCount, repetitionCount: repetitionCount + soundRepetitions, slangCount, pauseCount };
}

export type TimedSpeech = { kind: "speech" | "pause"; text: string; startSeconds: number; endSeconds: number };
export type RecognitionConfidence = { words: number; confidence: number };
export type SpeechDelivery = {
  speed: "fast" | "medium" | "slow" | null;
  wordsPerSevenSeconds: number | null;
  manyTranscriptionErrors: boolean;
  manyPausesOrRepetitions: boolean;
};

export function getSpeechDelivery({ transcript, segments, elapsedSeconds, confidence = [] }: {
  transcript: string; segments: readonly TimedSpeech[]; elapsedSeconds: number; confidence?: readonly RecognitionConfidence[];
}): SpeechDelivery {
  const hints = getTranscriptHints(transcript);
  // Use the most recent seven seconds ending in speech, excluding waiting to submit.
  const spoken = segments.filter((segment) => segment.kind === "speech" && segment.endSeconds > segment.startSeconds);
  const first = spoken[0]?.startSeconds ?? elapsedSeconds;
  const end = Math.min(elapsedSeconds, spoken.at(-1)?.endSeconds ?? 0);
  const windowStart = end - SPEECH_WINDOW_SECONDS;
  const enoughSpeech = end - first >= SPEECH_WINDOW_SECONDS;
  const words = spoken.reduce((total, segment) => {
    const overlap = Math.max(0, Math.min(end, segment.endSeconds) - Math.max(windowStart, segment.startSeconds));
    return total + getTranscriptHints(segment.text).wordCount * overlap / (segment.endSeconds - segment.startSeconds);
  }, 0);
  // Recognition provides chunk timing, so speed and replay word positions are estimates.
  const speed = !enoughSpeech ? null : words < 13 ? "slow" : words > 21 ? "fast" : "medium";
  const measured = confidence.filter((sample) => sample.confidence > 0 && sample.confidence <= 1 && sample.words > 0);
  const measuredWords = measured.reduce((total, sample) => total + sample.words, 0);
  const unclearWords = measured.reduce((total, sample) => total + (sample.confidence < 0.65 ? sample.words : 0), 0);
  const disfluencies = hints.fillerCount + hints.repetitionCount;
  return {
    speed, wordsPerSevenSeconds: enoughSpeech ? Math.round(words) : null,
    manyTranscriptionErrors: measuredWords >= 12 && unclearWords / measuredWords >= 0.35,
    manyPausesOrRepetitions: hints.pauseCount >= 3 || (hints.wordCount >= 20 && disfluencies >= 3 && disfluencies / hints.wordCount >= 0.08),
  };
}

/** Only genuine speech boundary events can produce a pause, never result/network latency. */
export function createSpeechBoundaryTracker() {
  let lastEnd: number | null = null;
  let start: number | null = null;
  let end: number | null = null;
  let committed = false;
  return {
    start(seconds: number): TimedSpeech | null {
      const pause = committed && lastEnd !== null && seconds - lastEnd >= SPEECH_PAUSE_SECONDS
        ? { kind: "pause" as const, text: formatSpeechPauseMarker(seconds - lastEnd), startSeconds: lastEnd, endSeconds: seconds }
        : null;
      start = seconds; end = null; lastEnd = null; committed = false;
      return pause;
    },
    end(seconds: number) { if (start !== null) { end = seconds; lastEnd = seconds; } },
    commit() { committed = true; },
    timing(fallbackStart: number, now: number) {
      return { startSeconds: Math.max(fallbackStart, start ?? fallbackStart), endSeconds: Math.max(fallbackStart + 0.05, end ?? now) };
    },
    reset() { lastEnd = null; start = null; end = null; committed = false; },
  };
}

/** Local microphone activity supplements browsers that omit continuous speech boundaries.
 * Energy is an estimate (background noise can affect it), never evidence of a stutter.
 * Audio is neither retained nor uploaded by this monitor. Recognition remains the fallback.
 */
export function monitorSpeechActivity(recognition: {
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
}) {
  let stopped = false;
  let ready = false;
  let stream: MediaStream | null = null;
  let context: AudioContext | null = null;
  let animation = 0;
  const start = recognition.onspeechstart;
  const end = recognition.onspeechend;
  const stop = () => {
    stopped = true;
    ready = false;
    if (animation) cancelAnimationFrame(animation);
    stream?.getTracks().forEach((track) => track.stop());
    if (context && context.state !== "closed") void context.close().catch(() => {});
  };
  if (typeof window === "undefined" || !window.AudioContext || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return stop;
  recognition.onspeechstart = () => { if (!ready && !stopped) start?.(); };
  recognition.onspeechend = () => { if (!ready && !stopped) end?.(); };
  void (async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      if (stopped) { stream.getTracks().forEach((track) => track.stop()); return; }
      context = new window.AudioContext();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      await context.resume();
      if (stopped) return;
      ready = true;
      let active = false;
      let quietSince: number | null = null;
      const meter = () => {
        if (stopped) return;
        analyser.getByteTimeDomainData(samples);
        const rms = Math.sqrt(samples.reduce((sum, value) => sum + ((value - 128) / 128) ** 2, 0) / samples.length);
        if (rms > 0.015) {
          quietSince = null;
          if (!active) { active = true; start?.(); }
        } else if (active) {
          quietSince ??= performance.now();
          if (performance.now() - quietSince >= 250) { active = false; end?.(); }
        }
        animation = requestAnimationFrame(meter);
      };
      meter();
    } catch {
      // Keep native speech boundaries when permission or Web Audio is unavailable.
      stream?.getTracks().forEach((track) => track.stop());
      if (context && context.state !== "closed") void context.close().catch(() => {});
      ready = false;
    }
  })();
  return stop;
}
