"use client";

import {
  getWordCount,
  type QuestionStatus,
  type SavedQuestionResponse,
  type QuestionPracticeMode,
  type QuestionCompletionReason,
} from "../_lib/question-bank-storage";

import { getQuestionStimulus } from "../_data/interview-stimuli";
import { InterviewStimulus } from "./InterviewStimulus";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Keyboard,
  Mic,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
} from "lucide-react";
import { InterviewAccountControls } from "../InterviewAccountControls";
import {
  type InterviewQuestion,
  type InterviewQuestionSubcategory,
} from "../_data/interviewQuestionBank";
import { getQuestionMarkScheme, type MarkSchemeSection } from "../_lib/question-review";
import {
  remainingQuestionMilliseconds,
  remainingQuestionSeconds,
} from "../_lib/question-practice-timer";
import { InterviewSidebar } from "./InterviewSidebar";
import { InterviewMobileNav } from "./InterviewMobileNav";
import { InterviewMarkScheme } from "./InterviewMarkScheme";
import {
  monitorSpeechActivity,
  createSpeechBoundaryTracker,
  getSpeechDelivery,
  normalizeSpeechTranscript,
  type RecognitionConfidence,
} from "../_lib/speech-delivery";

import {
  InterviewQuestionCategorySummary,
  QuestionAttemptPhase,
  TranscriptSegment,
  SpeechRecognitionLike,
  SpeechRecognitionWindow,
  subscribeSpeechSupport,
  serverSpeechSupport,
  browserSpeechSupport,
  getPercent,
  getSuggestedAnswerSeconds,
  formatTimer,
  getSpokenMinutes,
  appendTranscript,
  scrollToTop,
} from "../_lib/question-bank-model";

export function QuestionPracticeView({
  category,
  selectedSubcategory,
  question,
  questionNumber,
  showPremiumCard,
  initialSavedResponse,
  onBackToQuestions,
  onQuestionResponseSaved,
  onQuestionReset,
  onQuestionStatusChange,
}: {
  category: InterviewQuestionCategorySummary;
  selectedSubcategory: InterviewQuestionSubcategory;
  question: InterviewQuestion;
  questionNumber: number;
  showPremiumCard: boolean;
  initialSavedResponse: SavedQuestionResponse | null;
  onBackToQuestions: () => void;
  onQuestionResponseSaved: (response: SavedQuestionResponse) => void;
  onQuestionReset: (questionId: string) => void;
  onQuestionStatusChange: (questionId: string, status: QuestionStatus) => void;
}) {
  const Icon = category.icon;
  const suggestedSeconds = getSuggestedAnswerSeconds(question);
  const [answer, setAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(suggestedSeconds);
  const [attemptPhase, setAttemptPhase] =
    useState<QuestionAttemptPhase>("idle");
  const [hasStarted, setHasStarted] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [practiceMode, setPracticeMode] = useState<QuestionPracticeMode>("text");
  const [isListening, setIsListening] = useState(false);
  const speechSupported = useSyncExternalStore(subscribeSpeechSupport, browserSpeechSupport, serverSpeechSupport);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [interimTiming, setInterimTiming] = useState({ startSeconds: 0, endSeconds: 0 });
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => new Set());
  const [openMarkSchemeSections, setOpenMarkSchemeSections] = useState<
    Set<MarkSchemeSection["title"]>
  >(() => new Set(["General", "Start", "Middle", "End", "Mistakes"]));
  const [savedResponse, setSavedResponse] =
    useState<SavedQuestionResponse | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [recordingElapsedSeconds, setRecordingElapsedSeconds] = useState(0);
  const [playbackSeconds, setPlaybackSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [recognitionConfidence, setRecognitionConfidence] = useState<RecognitionConfidence[]>([]);
  const [transcriptSegments, setTranscriptSegments] = useState<
    TranscriptSegment[]
  >(() => []);
  const activityStopRef = useRef<(() => void) | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRecorderSessionRef = useRef(0);
  const audioRecordingRequestRef = useRef(0);
  const discardRecordingOnStopRef = useRef(false);
  const recordingUrlRef = useRef<string | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const recordingElapsedBeforeStartRef = useRef(0);
  const recordingTickerRef = useRef<number | null>(null);
  const answerRef = useRef("");
  const interimTranscriptRef = useRef("");
  const transcriptSegmentsRef = useRef<TranscriptSegment[]>([]);
  const transcriptSegmentCounterRef = useRef(0);
  const speechBoundaryRef = useRef(createSpeechBoundaryTracker());
  const restoredResponseRef = useRef<string | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const timerRemainingMsRef = useRef(suggestedSeconds * 1000);
  const timerDeadlineRef = useRef<number | null>(null);
  const attemptPhaseRef = useRef<QuestionAttemptPhase>("idle");
  const wordCount = getWordCount(answer);
  const elapsedSeconds = Math.max(0, suggestedSeconds - timeRemaining);
  const timerPercent = getPercent(elapsedSeconds, suggestedSeconds);
  const rubricGroups = getQuestionMarkScheme(question);
  const stimulus = getQuestionStimulus(question.id);

  const draftAnswer = appendTranscript(answer, interimTranscript);
  const canFinish = Boolean(draftAnswer.trim());
  const isReviewing = attemptPhase === "review";
  const primaryTimerActionLabel =
    isTimerRunning || isListening ? "Pause" : hasStarted ? "Resume" : "Start";
  const savedAnswer = savedResponse?.answer ?? answer;
  const savedWordCount = savedResponse?.wordCount ?? getWordCount(savedAnswer);
  const reviewElapsedSeconds = savedResponse?.elapsedSeconds ?? elapsedSeconds;
  const completionLabel =
    savedResponse?.completionReason === "timer"
      ? "Timer ended"
      : "Submitted manually";
  const reviewStatusOptions = [
    { label: "Answered", status: "completed", icon: CheckCircle2 },
    { label: "Review", status: "review", icon: RefreshCw },
    { label: "Unanswered", status: "not-attempted", icon: Circle },
  ] as const satisfies readonly {
    label: string;
    status: QuestionStatus;
    icon: LucideIcon;
  }[];
  const activePlaybackSegmentId =
    (isPlayingAudio || playbackSeconds > 0 ? transcriptSegments.find(
      (segment) =>
        playbackSeconds >= segment.startSeconds &&
        playbackSeconds <= segment.endSeconds
    )?.id : null) ?? null;
  const deliveryHints = getSpeechDelivery({
    transcript: draftAnswer,
    segments: interimTranscript ? [...transcriptSegments, { kind: "speech", text: interimTranscript, ...interimTiming }] : transcriptSegments,
    elapsedSeconds: recordingElapsedSeconds,
    confidence: recognitionConfidence,
  });

  const currentTimeRemaining = useCallback(() => {
    const deadline = timerDeadlineRef.current;
    return deadline === null ? Math.ceil(timerRemainingMsRef.current / 1000) : remainingQuestionSeconds(deadline, Date.now());
  }, []);

  const pauseTimer = useCallback(() => {
    const deadline = timerDeadlineRef.current;
    if (deadline !== null) timerRemainingMsRef.current = remainingQuestionMilliseconds(deadline, Date.now());
    timerDeadlineRef.current = null;
    const remaining = currentTimeRemaining();
    setTimeRemaining(remaining);
    setIsTimerRunning(false);
  }, [currentTimeRemaining]);

  const beginAttempt = useCallback(() => {
    if (
      attemptPhaseRef.current === "review" ||
      currentTimeRemaining() <= 0
    ) {
      return false;
    }

    attemptPhaseRef.current = "answering";
    setAttemptPhase("answering");
    setHasStarted(true);
    setSavedResponse(null);
    timerDeadlineRef.current ??= Date.now() + timerRemainingMsRef.current;
    setIsTimerRunning(true);

    return true;
  }, [currentTimeRemaining]);

  const getRecordingElapsedMs = useCallback(() => {
    const activeElapsedMs =
      recordingStartedAtRef.current === null
        ? 0
        : Date.now() - recordingStartedAtRef.current;

    return recordingElapsedBeforeStartRef.current + activeElapsedMs;
  }, []);

  const stopRecordingTicker = useCallback(() => {
    if (recordingTickerRef.current === null) return;

    window.clearInterval(recordingTickerRef.current);
    recordingTickerRef.current = null;
  }, []);

  const startRecordingTicker = useCallback(() => {
    stopRecordingTicker();
    setRecordingElapsedSeconds(Math.round(getRecordingElapsedMs() / 1000));
    recordingTickerRef.current = window.setInterval(() => {
      setRecordingElapsedSeconds(Math.round(getRecordingElapsedMs() / 1000));
    }, 250);
  }, [getRecordingElapsedMs, stopRecordingTicker]);

  const revokeRecordingUrl = useCallback(() => {
    if (!recordingUrlRef.current) return;

    window.URL.revokeObjectURL(recordingUrlRef.current);
    recordingUrlRef.current = null;
    setRecordingUrl(null);
  }, []);

  const stopMediaStream = useCallback(
    (stream: MediaStream | null = mediaStreamRef.current) => {
      stream?.getTracks().forEach((track) => track.stop());

      if (!stream || mediaStreamRef.current === stream) {
        mediaStreamRef.current = null;
      }
    },
    []
  );

  const refreshRecordingUrl = useCallback(
    (mimeType: string) => {
      if (
        typeof window === "undefined" ||
        audioChunksRef.current.length === 0
      ) {
        return;
      }

      const recordingBlob = new Blob(audioChunksRef.current, {
        type: mimeType || "audio/webm",
      });

      if (recordingBlob.size <= 0) return;

      revokeRecordingUrl();
      const nextRecordingUrl = window.URL.createObjectURL(recordingBlob);

      recordingUrlRef.current = nextRecordingUrl;
      setRecordingUrl(nextRecordingUrl);
    },
    [revokeRecordingUrl]
  );

  const captureRecordingElapsed = useCallback(() => {
    const elapsedMs = getRecordingElapsedMs();

    if (recordingStartedAtRef.current !== null) {
      recordingElapsedBeforeStartRef.current = elapsedMs;
      recordingStartedAtRef.current = null;
    }

    stopRecordingTicker();
    setRecordingElapsedSeconds(Math.round(elapsedMs / 1000));

    return elapsedMs;
  }, [getRecordingElapsedMs, stopRecordingTicker]);

  const pauseAudioRecording = useCallback(() => {
    speechBoundaryRef.current.reset();
    audioRecordingRequestRef.current += 1;
    const recorder = mediaRecorderRef.current;

    captureRecordingElapsed();
    setIsRecordingAudio(false);

    if (!recorder || recorder.state === "inactive") {
      mediaRecorderRef.current = null;
      stopMediaStream();
      return;
    }

    if (recorder.state !== "recording") return;

    try {
      recorder.requestData();
    } catch {
      // Some browsers do not flush data while transitioning recorder states.
    }

    try {
      recorder.pause();
    } catch {
      setRecordingError("Audio recording could not pause cleanly.");
    }
  }, [captureRecordingElapsed, stopMediaStream]);

  const finalizeAudioRecording = useCallback(
    ({ discard = false }: { discard?: boolean } = {}) => {
      audioRecordingRequestRef.current += 1;
      const recorder = mediaRecorderRef.current;

      if (discard) {
        discardRecordingOnStopRef.current = true;
      }

      captureRecordingElapsed();
      setIsRecordingAudio(false);

      if (!recorder || recorder.state === "inactive") {
        mediaRecorderRef.current = null;
        stopMediaStream();

        if (discard) {
          audioChunksRef.current = [];
          discardRecordingOnStopRef.current = false;
          revokeRecordingUrl();
        } else {
          refreshRecordingUrl("audio/webm");
        }

        return;
      }

      if (!discard) {
        try {
          recorder.requestData();
        } catch {
          // The final data chunk will still be emitted by recorder.stop().
        }
      }

      try {
        recorder.stop();
      } catch {
        mediaRecorderRef.current = null;
        stopMediaStream();

        if (discard) {
          audioChunksRef.current = [];
          discardRecordingOnStopRef.current = false;
          revokeRecordingUrl();
        } else {
          refreshRecordingUrl(recorder.mimeType || "audio/webm");
        }
      }
    },
    [
      captureRecordingElapsed,
      refreshRecordingUrl,
      revokeRecordingUrl,
      stopMediaStream,
    ]
  );

  const clearAudioRecording = useCallback(() => {
    finalizeAudioRecording({ discard: true });
    audioRecorderSessionRef.current += 1;
    audioChunksRef.current = [];
    recordingElapsedBeforeStartRef.current = 0;
    recordingStartedAtRef.current = null;
    transcriptSegmentsRef.current = [];
    transcriptSegmentCounterRef.current = 0;
    setRecordingElapsedSeconds(0);
    setPlaybackSeconds(0);
    setTranscriptSegments([]);
    setRecordingError(null);
    setRecognitionConfidence([]);
    speechBoundaryRef.current.reset();
    setIsPlayingAudio(false);
    revokeRecordingUrl();
  }, [finalizeAudioRecording, revokeRecordingUrl]);

  const startAudioRecording = useCallback(async () => {
    audioPlayerRef.current?.pause();
    setIsPlayingAudio(false);
    if (
      typeof window === "undefined" ||
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      !("MediaRecorder" in window)
    ) {
      setRecordingError("Audio recording is not available in this browser.");
      return;
    }

    const currentRecorder = mediaRecorderRef.current;

    if (currentRecorder?.state === "recording") return;

    if (currentRecorder?.state === "paused") {
      try {
        currentRecorder.resume();
        recordingStartedAtRef.current = Date.now();
        setIsRecordingAudio(true);
        setRecordingError(null);
        startRecordingTicker();
      } catch {
        setRecordingError("Audio recording could not resume.");
      }

      return;
    }

    if (currentRecorder?.state === "inactive") {
      mediaRecorderRef.current = null;
      stopMediaStream();
    }

    const requestId = ++audioRecordingRequestRef.current;
    let requestedStream: MediaStream | null = null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      requestedStream = stream;
      // Permission prompts can outlive a question, a pause, or the whole page.
      if (requestId !== audioRecordingRequestRef.current) {
        stopMediaStream(stream);
        return;
      }
      const recorder = new MediaRecorder(stream);
      const sessionId = audioRecorderSessionRef.current + 1;

      audioRecorderSessionRef.current = sessionId;
      audioChunksRef.current = [];
      revokeRecordingUrl();
      mediaStreamRef.current = stream;
      mediaRecorderRef.current = recorder;
      discardRecordingOnStopRef.current = false;
      recorder.ondataavailable = (event) => {
        if (
          event.data.size <= 0 ||
          discardRecordingOnStopRef.current ||
          sessionId !== audioRecorderSessionRef.current
        ) {
          return;
        }

        audioChunksRef.current.push(event.data);

        if (recorder.state !== "inactive") {
          refreshRecordingUrl(recorder.mimeType || "audio/webm");
        }
      };
      recorder.onstop = () => {
        const isCurrentSession = sessionId === audioRecorderSessionRef.current;
        const shouldDiscard =
          discardRecordingOnStopRef.current || !isCurrentSession;

        if (mediaRecorderRef.current === recorder) {
          mediaRecorderRef.current = null;
        }
        stopMediaStream(stream);

        if (isCurrentSession) {
          setIsRecordingAudio(false);
        }

        if (shouldDiscard) {
          if (isCurrentSession) {
            audioChunksRef.current = [];
            discardRecordingOnStopRef.current = false;
          }
          return;
        }

        refreshRecordingUrl(recorder.mimeType || "audio/webm");
      };

      recorder.start();
      recordingStartedAtRef.current = Date.now();
      setIsRecordingAudio(true);
      setRecordingError(null);
      startRecordingTicker();
    } catch {
      if (requestedStream) stopMediaStream(requestedStream);
      if (requestId !== audioRecordingRequestRef.current) return;
      mediaRecorderRef.current = null;
      setIsRecordingAudio(false);
      setRecordingError("Audio recording could not start.");
    }
  }, [
    refreshRecordingUrl,
    revokeRecordingUrl,
    startRecordingTicker,
    stopMediaStream,
  ]);

  const appendTranscriptSegment = useCallback(
    (segment: Omit<TranscriptSegment, "id">) => {
      const nextSegment: TranscriptSegment = {
        id: `segment-${transcriptSegmentCounterRef.current}`,
        ...segment,
      };

      transcriptSegmentCounterRef.current += 1;
      transcriptSegmentsRef.current = [
        ...transcriptSegmentsRef.current,
        nextSegment,
      ];
      setTranscriptSegments(transcriptSegmentsRef.current);
    },
    []
  );

  const commitTranscript = useCallback(
    (transcript: string) => {
      const cleanTranscript = normalizeSpeechTranscript(transcript.trim());

      if (!cleanTranscript) return answerRef.current;
      speechBoundaryRef.current.commit();

      const nowSeconds = Math.max(0.05, getRecordingElapsedMs() / 1000);
      const previousEndSeconds =
        transcriptSegmentsRef.current.at(-1)?.endSeconds ?? 0;
      const { startSeconds, endSeconds } = speechBoundaryRef.current.timing(previousEndSeconds, nowSeconds);
      const nextAnswer = appendTranscript(answerRef.current, cleanTranscript);

      answerRef.current = nextAnswer;
      setAnswer(nextAnswer);
      appendTranscriptSegment({
        kind: "speech",
        text: cleanTranscript,
        startSeconds,
        endSeconds: Math.max(endSeconds, startSeconds + 0.4),
      });

      return nextAnswer;
    },
    [appendTranscriptSegment, getRecordingElapsedMs]
  );

  const commitInterimTranscript = useCallback(() => {
    const interim = interimTranscriptRef.current.trim();

    if (!interim) return answerRef.current;

    const nextAnswer = commitTranscript(interim);

    interimTranscriptRef.current = "";
    setInterimTranscript("");

    return nextAnswer;
  }, [commitTranscript]);

  const stopListening = useCallback(
    ({ commitInterim = false }: { commitInterim?: boolean } = {}) => {
      if (commitInterim) {
        commitInterimTranscript();
      }

      const recognition = recognitionRef.current;

      activityStopRef.current?.();
      activityStopRef.current = null;
      recognitionRef.current = null;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.onspeechstart = null;
        recognition.onspeechend = null;

        try {
          recognition.stop();
        } catch {
          // The browser may already have stopped recognition.
        }
      }

      setIsListening(false);

      if (!commitInterim) {
        interimTranscriptRef.current = "";
        setInterimTranscript("");
      }
    },
    [commitInterimTranscript]
  );

  const completeAttempt = useCallback(
    (completionReason: QuestionCompletionReason) => {
      if (attemptPhaseRef.current === "review") return;

      const hasFinalInterimTranscript = Boolean(
        interimTranscriptRef.current.trim()
      );

      if (hasFinalInterimTranscript) {
        commitInterimTranscript();
      }

      const finalAnswer = answerRef.current;
      const remainingSeconds =
        completionReason === "timer" ? 0 : currentTimeRemaining();
      const finalReason = remainingSeconds === 0 ? "timer" : completionReason;
      timerRemainingMsRef.current = remainingSeconds * 1000;
      timerDeadlineRef.current = null;
      const completedAt = new Date().toISOString();
      // Saving updates the parent prop. Do not treat that update as opening an old
      // response: doing so discards the recorder while its final blob is arriving.
      restoredResponseRef.current = `${question.id}:${completedAt}`;
      const response: SavedQuestionResponse = {
        questionId: question.id,
        answer: finalAnswer,
        completedAt,
        elapsedSeconds: Math.min(
          suggestedSeconds,
          Math.max(0, suggestedSeconds - remainingSeconds)
        ),
        suggestedSeconds,
        mode: practiceMode,
        completionReason: finalReason,
        wordCount: getWordCount(finalAnswer),
      };

      attemptPhaseRef.current = "review";
      answerRef.current = finalAnswer;
      interimTranscriptRef.current = "";
      setAnswer(finalAnswer);
      setInterimTranscript("");
      setSavedResponse(response);
      setAttemptPhase("review");
      setHasStarted(true);
      setIsTimerRunning(false);
      setTimeRemaining(remainingSeconds);
      stopListening();
      finalizeAudioRecording();
      onQuestionResponseSaved(response);
      scrollToTop();
    },
    [
      commitInterimTranscript,
      currentTimeRemaining,
      finalizeAudioRecording,
      onQuestionResponseSaved,
      practiceMode,
      question.id,
      stopListening,
      suggestedSeconds,
    ]
  );

  const startListening = useCallback(() => {
    if (
      typeof window === "undefined" ||
      attemptPhaseRef.current === "review" ||
      currentTimeRemaining() <= 0
    ) {
      return;
    }

    const speechWindow = window as SpeechRecognitionWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError("Voice transcription is not available in this browser.");
      return;
    }

    if (recognitionRef.current) {
      stopListening({ commitInterim: true });
    }
    setSpeechError(null);
    setPracticeMode("voice");

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-GB";
    speechBoundaryRef.current.reset();
    recognition.onspeechstart = () => {
      if (recognitionRef.current !== recognition || attemptPhaseRef.current === "review") return;
      const pause = speechBoundaryRef.current.start(getRecordingElapsedMs() / 1000);
      // A still-pending result may contain speech from both sides of a gap.
      // Avoid inserting a marker at a position the browser cannot establish.
      if (pause && !interimTranscriptRef.current.trim()) {
        answerRef.current = appendTranscript(answerRef.current, pause.text);
        setAnswer(answerRef.current);
        appendTranscriptSegment(pause);
      }
    };
    recognition.onspeechend = () => speechBoundaryRef.current.end(getRecordingElapsedMs() / 1000);
    recognition.onresult = (event) => {
      if (
        recognitionRef.current !== recognition ||
        attemptPhaseRef.current === "review"
      ) {
        return;
      }

      let finalTranscript = "";
      let interim = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript ?? "";

        if (result.isFinal) {
          finalTranscript += ` ${transcript}`;
          setRecognitionConfidence((samples) => [...samples, { words: getWordCount(transcript), confidence: result[0]?.confidence ?? 0 }]);
        } else {
          interim += ` ${transcript}`;
        }
      }

      if (finalTranscript.trim()) {
        commitTranscript(finalTranscript);
        setSavedResponse(null);
      }

      interimTranscriptRef.current = normalizeSpeechTranscript(interim.trim());
      setInterimTranscript(interimTranscriptRef.current);
      setInterimTiming(speechBoundaryRef.current.timing(transcriptSegmentsRef.current.at(-1)?.endSeconds ?? 0, getRecordingElapsedMs() / 1000));
    };
    recognition.onerror = (event) => {
      if (recognitionRef.current !== recognition) return;

      commitInterimTranscript();
      activityStopRef.current?.();
      activityStopRef.current = null;
      recognitionRef.current = null;
      recognition.onend = null;
      recognition.onerror = null;
      recognition.onresult = null;
      setSpeechError(
        event.error
          ? `Voice transcription stopped: ${event.error}.`
          : "Voice transcription stopped."
      );
      setIsListening(false);
      setIsTimerRunning(false);
      pauseAudioRecording();
    };
    recognition.onend = () => {
      if (recognitionRef.current !== recognition) return;

      commitInterimTranscript();
      activityStopRef.current?.();
      activityStopRef.current = null;
      recognitionRef.current = null;
      setIsListening(false);
      setIsTimerRunning(false);
      pauseAudioRecording();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
      activityStopRef.current = monitorSpeechActivity(recognition);
      void startAudioRecording();
      setIsListening(true);
      beginAttempt();
    } catch {
      activityStopRef.current?.();
      activityStopRef.current = null;
      recognitionRef.current = null;
      setSpeechError("Voice transcription could not start.");
      setIsListening(false);
    }
  }, [
    appendTranscriptSegment,
    beginAttempt,
    commitInterimTranscript,
    commitTranscript,
    currentTimeRemaining,
    getRecordingElapsedMs,
    pauseAudioRecording,
    startAudioRecording,
    stopListening,
  ]);

  const pauseAttempt = useCallback(() => {
    pauseTimer();
    stopListening({ commitInterim: true });
    pauseAudioRecording();
  }, [
    pauseAudioRecording,
    pauseTimer,
    stopListening,
  ]);

  const resumeAttempt = useCallback(() => {
    if (practiceMode === "voice") {
      startListening();
      return;
    }

    beginAttempt();
  }, [beginAttempt, practiceMode, startListening]);

  const resetAttempt = useCallback(() => {
    stopListening();
    clearAudioRecording();
    answerRef.current = "";
    interimTranscriptRef.current = "";
    timerRemainingMsRef.current = suggestedSeconds * 1000;
    timerDeadlineRef.current = null;
    attemptPhaseRef.current = "idle";
    setAnswer("");
    setTimeRemaining(suggestedSeconds);
    setAttemptPhase("idle");
    setHasStarted(false);
    setIsTimerRunning(false);
    setSavedResponse(null);
    setSpeechError(null);
    setCheckedItems(new Set());
    onQuestionReset(question.id);
  }, [
    clearAudioRecording,
    onQuestionReset,
    question.id,
    stopListening,
    suggestedSeconds,
  ]);

  const handleReviewStatusChange = (status: QuestionStatus) => {
    if (status === "not-attempted") {
      resetAttempt();
      return;
    }

    onQuestionStatusChange(question.id, status);
  };

  const handlePrimaryTimerAction = () => {
    if (isTimerRunning || isListening) {
      pauseAttempt();
      return;
    }

    resumeAttempt();
  };

  const handleAnswerChange = (value: string) => {
    answerRef.current = value;
    setAnswer(value);
    setSavedResponse(null);
    transcriptSegmentsRef.current = [];
    setTranscriptSegments([]);
    setPlaybackSeconds(0);

    if (value.trim() && attemptPhaseRef.current === "idle") {
      beginAttempt();
    }
  };

  const handleBackToQuestions = () => {
    pauseTimer();
    stopListening({ commitInterim: true });
    finalizeAudioRecording({ discard: true });
    onBackToQuestions();
  };

  const switchToTextMode = () => {
    setPracticeMode("text");
    setSpeechError(null);
    stopListening({ commitInterim: true });
    pauseAudioRecording();
  };

  const toggleVoiceMode = () => {
    if (isListening) {
      pauseAttempt();
      return;
    }

    startListening();
  };

  useEffect(() => {
    answerRef.current = answer;
  }, [answer]);

  useEffect(() => {
    interimTranscriptRef.current = interimTranscript;
  }, [interimTranscript]);

  useEffect(() => {
    attemptPhaseRef.current = attemptPhase;
  }, [attemptPhase]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const saved = initialSavedResponse;

      if (!saved || attemptPhaseRef.current === "answering") return;
      const responseKey = `${question.id}:${saved.completedAt}`;
      if (restoredResponseRef.current === responseKey) return;
      restoredResponseRef.current = responseKey;

      const remainingSeconds = Math.max(
        0,
        suggestedSeconds - Math.min(saved.elapsedSeconds, suggestedSeconds)
      );

      answerRef.current = normalizeSpeechTranscript(saved.answer);
      interimTranscriptRef.current = "";
      timerRemainingMsRef.current = remainingSeconds * 1000;
      timerDeadlineRef.current = null;
      attemptPhaseRef.current = "review";
      setAnswer(answerRef.current);
      setInterimTranscript("");
      setSavedResponse(saved);
      setTimeRemaining(remainingSeconds);
      setAttemptPhase("review");
      setHasStarted(true);
      setIsTimerRunning(false);
      stopListening();
      finalizeAudioRecording({ discard: true });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [
    finalizeAudioRecording,
    initialSavedResponse,
    question.id,
    stopListening,
    suggestedSeconds,
  ]);

  useEffect(() => {
    return () => {
      audioRecordingRequestRef.current += 1;
      const recognition = recognitionRef.current;
      const recorder = mediaRecorderRef.current;

      activityStopRef.current?.();
      activityStopRef.current = null;
      recognitionRef.current = null;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;

        try {
          recognition.stop();
        } catch {
          // The browser may already have stopped recognition.
        }
      }

      discardRecordingOnStopRef.current = true;
      if (recorder && recorder.state !== "inactive") {
        recorder.ondataavailable = null;
        recorder.onstop = null;
        try {
          recorder.stop();
        } catch {
          // The recorder may already have stopped.
        }
      }
      stopMediaStream();
      stopRecordingTicker();

      if (recordingUrlRef.current) {
        window.URL.revokeObjectURL(recordingUrlRef.current);
        recordingUrlRef.current = null;
      }
    };
  }, [stopMediaStream, stopRecordingTicker]);

  useEffect(() => {
    if (!isTimerRunning || attemptPhase !== "answering") return undefined;

    const intervalId = window.setInterval(() => {
      const remaining = currentTimeRemaining();
      setTimeRemaining(remaining);
      if (remaining === 0) setIsTimerRunning(false);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [attemptPhase, currentTimeRemaining, isTimerRunning]);

  useEffect(() => {
    if (attemptPhase === "answering" && timeRemaining === 0) {
      completeAttempt("timer");
    }
  }, [attemptPhase, completeAttempt, timeRemaining]);

  const toggleChecklistItem = (id: string) => {
    setCheckedItems((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  };

  const toggleMarkSchemeSection = (title: MarkSchemeSection["title"]) => {
    setOpenMarkSchemeSections((current) => {
      const next = new Set(current);

      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }

      return next;
    });
  };

  const renderTranscriptText = () => {
    // Typed openings and later edits have no audio timestamps. Keep the complete
    // answer visible and only highlight when the timeline matches that answer.
    const hasSegments = transcriptSegments.length > 0 && transcriptSegments.map((segment) => segment.text).join(" ").replace(/\s+/g, " ").trim() === answer.replace(/\s+/g, " ").trim();
    const hasAnswer = Boolean(answer.trim());
    const hasInterim = Boolean(interimTranscript.trim());

    if (!hasSegments && !hasAnswer && !hasInterim) {
      return (
        <span className="text-[#8091a0]">
          Start speaking and your transcript will appear here...
        </span>
      );
    }

    if (hasSegments) {
      return (
        <>
          {transcriptSegments.map((segment) => {
            const isPlaybackActive = segment.id === activePlaybackSegmentId;
            const isPauseMarker = segment.kind === "pause";
            const tokens = segment.text.match(/\[[^\]]+\]|\S+/g) ?? [];
            const wordIndex = Math.min(tokens.length - 1, Math.floor(Math.max(0, playbackSeconds - segment.startSeconds) / Math.max(0.05, segment.endSeconds - segment.startSeconds) * tokens.length));

            return (
              <span
                key={segment.id}
                className={`rounded px-0.5 transition-colors ${
                  isPlaybackActive && isPauseMarker
                    ? "bg-[#dff7ef] text-[#056d57] ring-1 ring-[#9ad8c7]"
                    : isPauseMarker
                      ? "bg-[#eef3f4] font-semibold text-[#4a6370] ring-1 ring-[#d8e0e6]"
                    : "text-[#071923]"
                }`}
              >
                {isPauseMarker ? `${segment.text} ` : tokens.map((word, index) => <span key={index} className={isPlaybackActive && index === wordIndex ? "rounded bg-[#dff7ef] text-[#056d57] ring-1 ring-[#9ad8c7]" : undefined}>{word}{" "}</span>)}
              </span>
            );
          })}
          {hasInterim && (
            <span className="rounded bg-[#e2f5ef] px-1 font-semibold text-[#0f9b7d]">
              {interimTranscript}
            </span>
          )}
        </>
      );
    }

    return (
      <>
        {hasAnswer && <span className="text-[#071923]">{answer} </span>}
        {hasInterim && (
          <span className="rounded bg-[#e2f5ef] px-1 font-semibold text-[#0f9b7d]">
            {interimTranscript}
          </span>
        )}
      </>
    );
  };

  const renderVoiceRecorderPanel = () => (
    <div className="mt-4 rounded-xl border border-[#cfe2df] bg-[#fbfdfd] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex h-9 items-center gap-2 rounded-lg px-3 text-sm font-black ${
              isListening || isRecordingAudio
                ? "bg-[#e2f5ef] text-[#08787b]"
                : "bg-[#eef3f4] text-[#4a6370]"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isListening || isRecordingAudio
                  ? "animate-pulse bg-[#0f9b7d]"
                  : "bg-[#b8c8cf]"
              }`}
              aria-hidden="true"
            />
            {isRecordingAudio ? "Recording" : isListening ? "Listening" : isReviewing ? "Your recording" : "Voice paused"}
          </span>
          <span className="text-sm font-black text-[#071923]">
            {formatTimer(recordingElapsedSeconds)}
          </span>
        </div>
        <span className="text-xs text-[#62777e]">{isListening ? "Live transcript" : recordingUrl ? "Replay to follow your words" : "Transcript"}</span>
      </div>

      {recordingError && (
        <p className="mt-3 rounded-lg border border-[#f5d5a5] bg-[#fff8ec] px-3 py-2 text-sm font-medium text-[#8a5600]">
          {recordingError}
        </p>
      )}

      {recordingUrl && !isRecordingAudio && (
        <audio
          ref={audioPlayerRef}
          controls
          aria-label="Play back your answer recording"
          src={recordingUrl}
          onPlay={() => setIsPlayingAudio(true)}
          onPause={() => setIsPlayingAudio(false)}
          onTimeUpdate={(event) =>
            setPlaybackSeconds(event.currentTarget.currentTime)
          }
          onSeeked={(event) =>
            setPlaybackSeconds(event.currentTarget.currentTime)
          }
          onEnded={() => { setIsPlayingAudio(false); setPlaybackSeconds(0); }}
          onError={() => setRecordingError("This recording could not play. Try recording the answer again.")}
          className="mt-4 w-full"
        />
      )}

      <div className="mt-4 min-h-[104px] rounded-xl border border-[#d8e0e6] bg-white p-4 text-base font-medium leading-7 text-[#071923]">
        {renderTranscriptText()}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-[#62777e]">{isReviewing && !recordingUrl && !recordingError ? "Preparing your recording… " : ""}Audio is available for this attempt while you stay on this screen. Word highlighting is approximate.</p>
    </div>
  );

  return (
    <main className="medicforest-dashboard-compact min-h-screen bg-[#eef1f3] text-[#071923] lg:fixed lg:inset-0 lg:h-auto lg:overflow-hidden">
      <InterviewMobileNav activeLabel="Question Bank" />
      <div className="grid min-h-screen lg:h-full lg:min-h-0 lg:grid-cols-[230px_1fr]">
        <InterviewSidebar
          activeLabel="Question Bank"
          showPremiumCard={showPremiumCard}
        />

        <section className="min-w-0 px-5 py-7 sm:px-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:px-8">
          <div className="mx-auto max-w-[1540px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleBackToQuestions}
                className="inline-flex w-fit items-center gap-2 text-sm font-bold text-[#08787b] transition-colors hover:text-[#042724]"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back to questions
              </button>
              <InterviewAccountControls />
            </div>

            <section className="mt-5 rounded-xl border border-[#d8e0e6] bg-white/90 p-5 shadow-[0_1px_3px_rgba(7,25,35,0.08)]">
              <div className="grid gap-5 xl:grid-cols-[80px_minmax(0,1fr)_260px] xl:items-center">
                <div
                  className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl text-white ring-1 ring-white/70"
                  style={{
                    background: `linear-gradient(135deg, ${category.colour} 0%, ${category.colour} 72%, #071923 150%)`,
                    boxShadow: `0 18px 30px ${category.colour}26`,
                  }}
                >
                  <span className="absolute -right-4 -top-4 h-12 w-12 rounded-full bg-white/25" aria-hidden="true" />
                  <span className="absolute -bottom-5 -left-5 h-14 w-14 rounded-full bg-white/10" aria-hidden="true" />
                  <Icon className="relative h-10 w-10" strokeWidth={2.3} aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-[#08787b]">
                    {category.title} / {selectedSubcategory}
                  </p>
                  <h1 className="mt-3 text-2xl font-black leading-tight text-[#071923]">
                    {question.text}
                  </h1>
                  <p className="mt-3 text-sm font-medium text-[#4a6370]">
                    Question {String(questionNumber).padStart(2, "0")}{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    {question.difficulty}{" "}
                    <span className="mx-2 text-[#9babb4]">/</span>
                    section {question.sourceSection}
                  </p>
                </div>
                <div className="rounded-xl border border-[#d8e0e6] bg-[#f8fbfb] p-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-black uppercase tracking-[0.08em] text-[#4a6370]">
                      Timer
                    </span>
                    <span className="text-2xl font-black text-[#071923]">
                      {formatTimer(timeRemaining)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe8ea]">
                    <div
                      className="h-full rounded-full bg-[#159a9d]"
                      style={{ width: `${timerPercent}%` }}
                    />
                  </div>
                  <p className="mt-3 text-xs font-medium text-[#5d707a]">
                    Suggested {formatTimer(suggestedSeconds)} answer
                  </p>
                </div>
              </div>
            </section>

            {stimulus && <div className="mt-5 max-w-5xl"><InterviewStimulus key={stimulus.id} stimulus={stimulus} question={question.text} /></div>}

            {isReviewing ? (
              <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-5">
                  <section className="rounded-xl border border-[#b9dcda] bg-[#f1fbfa] p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <h2 className="text-base font-black text-[#071923]">
                          Review Saved Answer
                        </h2>
                        <p className="mt-2 text-sm font-medium text-[#4a6370]">
                          {completionLabel} / {savedWordCount} words /{" "}
                          {formatTimer(reviewElapsedSeconds)} used
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          disabled
                          className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-[#d8e0e6] bg-white/70 px-4 text-sm font-black text-[#748791] shadow-sm"
                        >
                          <Sparkles className="h-4 w-4" aria-hidden="true" />
                          AI Feedback
                        </button>
                        <button
                          type="button"
                          onClick={resetAttempt}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#159a9d] px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#08787b]"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          Retry This Question
                        </button>
                        <button
                          type="button"
                          onClick={handleBackToQuestions}
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#b8c8cf] bg-white px-4 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
                        >
                          <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                          Done
                        </button>
                      </div>
                    </div>
                    {(recordingUrl || transcriptSegments.length > 0 || recordingError) ? renderVoiceRecorderPanel() : <div className="mt-5 min-h-[180px] whitespace-pre-wrap rounded-xl border border-[#b9dcda] bg-white p-4 text-base font-medium leading-7 text-[#071923]">
                      {normalizeSpeechTranscript(savedAnswer.trim()) || "No response was captured before the timer ended."}
                    </div>}
                  </section>

                  <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                    <h2 className="text-base font-black text-[#071923]">
                      Status
                    </h2>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {reviewStatusOptions.map((option) => {
                        const OptionIcon = option.icon;
                        const isActive = question.status === option.status;

                        return (
                          <button
                            key={option.status}
                            type="button"
                            onClick={() => handleReviewStatusChange(option.status)}
                            aria-pressed={isActive}
                            className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-black shadow-sm transition-colors ${
                              isActive
                                ? "border-[#159a9d] bg-[#159a9d] text-white"
                                : "border-[#d8e0e6] bg-white text-[#071923] hover:border-[#08787b] hover:text-[#08787b]"
                            }`}
                          >
                            <OptionIcon
                              className="h-4 w-4"
                              strokeWidth={option.status === "not-attempted" ? 0 : 2.2}
                              fill={option.status === "not-attempted" ? "currentColor" : "none"}
                              aria-hidden="true"
                            />
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm font-medium leading-6 text-[#4a6370]">
                      Response saved. Check it against the mark scheme before moving on.
                    </p>
                  </section>
                </div>

                <InterviewMarkScheme rubricGroups={rubricGroups} checkedItems={checkedItems} openMarkSchemeSections={openMarkSchemeSections} toggleChecklistItem={toggleChecklistItem} toggleMarkSchemeSection={toggleMarkSchemeSection} deliveryHints={deliveryHints} />
              </section>
            ) : (
              <section className="mt-5 max-w-5xl">
                <section className="rounded-xl border border-[#d8e0e6] bg-white p-5 shadow-[0_1px_3px_rgba(7,25,35,0.05)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-base font-black text-[#071923]">
                        Your Response
                      </h2>
                      <p className="mt-2 text-sm font-medium text-[#4a6370]">
                        {wordCount} words / about {getSpokenMinutes(wordCount)} spoken
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handlePrimaryTimerAction}
                        disabled={timeRemaining === 0}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#06254a] px-4 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#071923] disabled:cursor-not-allowed disabled:bg-[#b8c8cf]"
                      >
                        {isTimerRunning || isListening ? (
                          <Pause className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <Play className="h-4 w-4" aria-hidden="true" />
                        )}
                        {primaryTimerActionLabel}
                      </button>
                      <button
                        type="button"
                        onClick={resetAttempt}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#b8c8cf] bg-white px-4 text-sm font-black text-[#071923] shadow-sm transition-colors hover:border-[#08787b] hover:text-[#08787b]"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 flex w-fit overflow-hidden rounded-lg border border-[#d8e0e6] bg-white">
                    <button
                      type="button"
                      onClick={switchToTextMode}
                      aria-pressed={practiceMode === "text"}
                      className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-black transition-colors ${
                        practiceMode === "text"
                          ? "bg-[#06254a] text-white"
                          : "text-[#071923] hover:bg-[#f4f8f8]"
                      }`}
                    >
                      <Keyboard className="h-4 w-4" aria-hidden="true" />
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={toggleVoiceMode}
                      aria-pressed={practiceMode === "voice"}
                      disabled={timeRemaining === 0 || !speechSupported}
                      className={`inline-flex h-10 items-center gap-2 px-4 text-sm font-black transition-colors disabled:cursor-not-allowed disabled:text-[#8fa0a8] ${
                        practiceMode === "voice"
                          ? "bg-[#06254a] text-white disabled:bg-[#b8c8cf] disabled:text-white"
                          : "text-[#071923] hover:bg-[#f4f8f8]"
                      }`}
                    >
                      <Mic className="h-4 w-4" aria-hidden="true" />
                      {isListening ? "Listening" : "Voice"}
                    </button>
                  </div>

                  {speechError && (
                    <p className="mt-3 rounded-lg border border-[#f5d5a5] bg-[#fff8ec] px-3 py-2 text-sm font-medium text-[#8a5600]">
                      {speechError}
                    </p>
                  )}
                  {practiceMode === "voice" ? (
                    renderVoiceRecorderPanel()
                  ) : (
                    <textarea
                      value={answer}
                      onChange={(event) =>
                        handleAnswerChange(event.target.value)
                      }
                      className="mt-4 min-h-[330px] w-full resize-y rounded-xl border border-[#d8e0e6] bg-[#fbfdfd] p-4 text-base font-medium leading-7 text-[#071923] outline-none transition-colors placeholder:text-[#8091a0] focus:border-[#159a9d] focus:bg-white focus:ring-2 focus:ring-[#159a9d]/15"
                      placeholder="Start typing your answer..."
                    />
                  )}

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-[#4a6370]">
                      {timeRemaining === 0
                        ? "Time is up"
                        : isTimerRunning || isListening
                          ? "Attempt in progress"
                          : hasStarted
                            ? "Paused"
                            : "Ready to start"}
                    </p>
                    <button
                      type="button"
                      disabled={!canFinish}
                      onClick={() => completeAttempt("manual")}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#159a9d] px-5 text-sm font-black text-white shadow-sm transition-colors hover:bg-[#08787b] disabled:cursor-not-allowed disabled:bg-[#b8c8cf]"
                    >
                      <Send className="h-4 w-4" aria-hidden="true" />
                      Finish & Review
                    </button>
                  </div>
                </section>
              </section>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

