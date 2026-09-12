"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, AudioLines, Check, Clock3, FileText, Loader2, LockKeyhole, Maximize2, MessageSquareText, Mic, MicOff, Minimize2, Phone, Sparkles, UserRound, Video, VideoOff, Volume2, VolumeX, X } from "lucide-react";
import type { InterviewAnswer, InterviewAttempt } from "../_lib/interview-types";
import type { useInterviewDevices } from "../_lib/useInterviewDevices";
import type { useInterviewSpeech } from "../_lib/useInterviewSpeech";
import { InterviewDevicePreview } from "./InterviewDevicePreview";
import { AnimatedDisclosure } from "./AnimatedDisclosure";
import { SpeechDeliveryHints } from "./SpeechDeliveryHints";
import styles from "./AIInterviewRoom.module.css";

export const formatRoomTime = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;
type Props = {
  attempt: InterviewAttempt; answers: InterviewAnswer[]; questionIndex: number;
  preparing: boolean; expired: boolean; active: boolean; secondsRemaining: number;
  speech: ReturnType<typeof useInterviewSpeech>; devices: ReturnType<typeof useInterviewDevices>;
  saved: boolean; busy: string; preview: boolean; readAloud: boolean;
  onToggleMicrophone: () => void;
  setReadAloud: (enabled: boolean) => void; onAnswer: (value: string) => void;
  onSubmit: () => void; onLeave: () => void;
  wordCount: number; onSkipPreparation: () => void;
  followUpBusy: boolean; followUpNotice: string; awaitingDone: boolean; prompting: boolean; micWanted: boolean; onReadQuestion: () => void;
  onDone: () => void; onConfirmDone: () => void; onKeepAnswering: () => void;
};

function ParticipantWaves() {
  return <svg className={styles.participantWaves} viewBox="0 0 320 280" preserveAspectRatio="none" aria-hidden="true">
    <path d="M0 132C52 90 75 210 139 182S234 67 320 127V280H0Z" />
    <path d="M0 177C67 105 99 238 169 214S257 117 320 166V280H0Z" />
  </svg>;
}

export function AIInterviewCall(props: Props) {
  const [tab, setTab] = useState<"transcript" | "notes">("transcript");
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState(false);
  const [endDialog, setEndDialog] = useState(false);
  const answerInput = useRef<HTMLTextAreaElement>(null);
  const finishButton = useRef<HTMLButtonElement>(null);
  const { attempt, speech, devices, questionIndex, answers, preparing, expired, active, busy, preview } = props;
  const question = attempt.questions[questionIndex];
  const status = busy ? "One moment…" : preparing ? "Take a moment to think" : expired ? "Time to reflect" : speech.speaking ? "Reading your question" : speech.listening ? "Listening to you" : "Ready when you are";
  const answer = answers[questionIndex]?.answer ?? "";
  const answerWordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;
  const liveAnswer = [answer, speech.listening && !props.awaitingDone ? speech.interimTranscript : ""].filter(Boolean).join(" ");
  const microphonePending = devices.microphonePermission === "requesting";
  const microphoneLabel = microphonePending ? "Allow microphone in your browser" : props.micWanted && !speech.error ? "Stop mic" : "Start mic";
  useEffect(() => {
    if (speech.listening && answerInput.current) answerInput.current.scrollTop = answerInput.current.scrollHeight;
  }, [liveAnswer, speech.listening]);
  useEffect(() => {
    if (!focus || endDialog) return;
    const leaveFocus = (event: KeyboardEvent) => { if (event.key === "Escape") setFocus(false); };
    window.addEventListener("keydown", leaveFocus);
    return () => window.removeEventListener("keydown", leaveFocus);
  }, [focus, endDialog]);
  const closeEndDialog = () => { setEndDialog(false); finishButton.current?.focus(); };

  return <div className={`${styles.callRoom} ${focus ? styles.focusRoom : ""}`}>
    <header className={styles.roomHeader}>
      <div className={styles.roomBrand}>
        <div><h1>{attempt.title}</h1><p>PhloemAI interview <span>·</span> Station {attempt.stationIndex + 1} of {attempt.stationCount}</p></div>
      </div>
      <div className={styles.headerActions}>
        <span className={styles.sessionBadge}><span className={styles.greenDot} />{preview ? "Preview" : "Private practice"}</span>
        <div className={`${styles.roomTimer} ${!preparing && props.secondsRemaining < 60 ? styles.timerUrgent : ""}`} role="timer" aria-label={`${preparing ? "Preparation" : "Station"} time remaining`}>
          <Clock3 size={17} /><div><span>{preparing ? "Reading time" : expired ? "Time complete" : "Time remaining"}</span><strong>{formatRoomTime(props.secondsRemaining)}</strong></div>
        </div>
        <button type="button" className={styles.stageIcon} aria-label={props.readAloud ? "Turn interviewer voice off" : "Turn interviewer voice on"} title={props.readAloud ? "Turn interviewer voice off" : "Turn interviewer voice on"} aria-pressed={props.readAloud} disabled={!speech.voiceSupported} onClick={() => props.setReadAloud(!props.readAloud)}>{props.readAloud ? <Volume2 size={18} /> : <VolumeX size={18} />}</button>
        <button type="button" className={styles.stageIcon} aria-label={focus ? "Exit focus view" : "Enter focus view"} title={focus ? "Exit focus view" : "Enter focus view"} aria-pressed={focus} onClick={() => setFocus(!focus)}>{focus ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
      </div>
    </header>
    <div className={styles.callLayout}>
      <div className={styles.stageColumn}>
        <div className={styles.conversationStage}>
          <div className={styles.participantGrid}>
            <section className={`${styles.participantCard} ${speech.listening ? styles.participantActive : ""}`} aria-label="Your participant tile">
              <ParticipantWaves />
              {devices.cameraEnabled ? <div className={styles.participantVideo}><InterviewDevicePreview stream={devices.stream} compact /></div> : <div className={styles.participantPortrait}><span className={styles.youAvatar} aria-hidden="true"><UserRound size={46} strokeWidth={1.4} /></span></div>}
              <div className={styles.participantName}><div><strong>You</strong><span>{devices.cameraEnabled ? "Local camera preview" : "Camera off"}</span></div>{speech.listening ? <AudioLines size={15} aria-label="Microphone on" /> : <MicOff size={14} aria-label="Microphone off" />}</div>
            </section>
            <section className={`${styles.participantCard} ${styles.aiParticipant} ${speech.speaking ? styles.participantActive : ""}`} aria-label="AI interviewer participant tile">
              <ParticipantWaves />
              <div className={styles.participantPortrait}><div className={`${styles.interviewerOrb} ${speech.speaking ? styles.orbSpeaking : ""}`} aria-hidden="true"><span /><div><AudioLines size={46} strokeWidth={1.6} /></div></div></div>
              <div className={styles.participantName}><div><strong>AI interviewer</strong><span>{speech.speaking ? "Speaking" : "PhloemAI"}</span></div>{speech.speaking ? <AudioLines size={15} aria-label="Reading the question" /> : <span className={styles.greenDot} />}</div>
            </section>
          </div>
          <div className={styles.stationHint}><p className={styles.stageStatus} role="status"><span className={speech.listening ? styles.listeningDot : styles.greenDot} />{status}</p>{preparing && preview && <button type="button" className={styles.textButton} onClick={props.onSkipPreparation}>Skip reading time <ArrowRight size={14} /></button>}</div>
        </div>
        <footer className={styles.callControls} aria-label="Interview controls">
          <div className={styles.deviceControls}>
            <button type="button" disabled={!active || microphonePending || !speech.supported} aria-label={microphoneLabel} title={microphoneLabel} aria-pressed={speech.listening} className={speech.listening ? styles.controlActive : ""} onClick={props.onToggleMicrophone}>{microphonePending ? <Loader2 size={21} className="animate-spin" /> : speech.listening ? <Mic size={21} /> : <MicOff size={21} />}<span>{props.micWanted && !speech.error ? "Stop mic" : "Start mic"}</span></button>
            <button type="button" aria-label={devices.cameraEnabled ? "Turn camera off" : "Turn camera on"} title={devices.cameraEnabled ? "Turn camera off" : "Turn camera on"} aria-pressed={devices.cameraEnabled} disabled={devices.cameraPending || Boolean(busy)} onClick={() => void devices.toggleCamera()}>{devices.cameraPending ? <Loader2 size={21} className="animate-spin" /> : devices.cameraEnabled ? <Video size={21} /> : <VideoOff size={21} />}<span>{devices.cameraEnabled ? "Camera on" : "Camera off"}</span></button>
            <button ref={finishButton} type="button" className={styles.endCallButton} aria-label="Finish station" title="Finish station" disabled={Boolean(busy)} onClick={() => setEndDialog(true)}><Phone size={21} fill="currentColor" /><span>Finish</span></button>
          </div>
          {microphonePending ? <p role="status" className={styles.callNotice}>Choose Allow or Block in your browser’s microphone prompt. You can also type your answer.</p> : (devices.microphoneError || speech.error) ? <p role="status" className={styles.callNotice}>{devices.microphoneError || speech.error}</p> : <p className={styles.controlHint}>{speech.listening ? "Listening · your words appear in the transcript." : preparing ? "Your microphone will be ready after reading time." : "Speak naturally, or type your answer in the transcript panel."}</p>}
          {devices.cameraError && <p role="status" className={styles.callNotice}>{devices.cameraError}</p>}
          {!speech.supported && <p className={styles.callNotice}>Speech recognition is unavailable in this browser. Type your answer to continue.</p>}
        </footer>
      </div>
      <aside className={styles.transcriptPanel} aria-label="Interview transcript and notes">
        <div className={styles.transcriptTabs}><button type="button" aria-pressed={tab === "transcript"} onClick={() => setTab("transcript")}><MessageSquareText size={21} />Live transcript<span className={styles.transcriptCount}>{questionIndex + 1}</span></button><button type="button" aria-pressed={tab === "notes"} onClick={() => setTab("notes")}><FileText size={18} />Notes{notes && <span className={styles.notesDot} aria-label="Notes added" />}</button></div>
        {tab === "transcript" ? <>
          <div className={styles.transcriptScroll}>
            <div className={styles.transcriptQuestion}><span className={styles.miniInterviewer}><AudioLines size={19} /></span><div><strong>AI Interviewer</strong><p id="current-interview-question">{question}</p></div></div>
            <div className={styles.promptHeading}><span>Question {questionIndex + 1} of {attempt.questions.length}</span><button type="button" onClick={props.onReadQuestion} disabled={!speech.voiceSupported || Boolean(busy) || props.awaitingDone}>{speech.speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}{speech.speaking ? "Stop reading" : "Hear question"}</button></div>
            <div className={styles.answerHeading}><span className={styles.miniYou}><UserRound size={16} /></span><strong>You</strong>{speech.listening && <span className={styles.transcribingLabel}><AudioLines size={13} />Transcribing</span>}</div>
            <label className={styles.answerLabel} htmlFor="interview-answer">{speech.listening ? "Listening · stop the mic to edit" : preparing ? "Your answer opens after reading time" : "Speak or type your answer"}</label>
            <textarea ref={answerInput} id="interview-answer" aria-describedby="current-interview-question" value={liveAnswer} readOnly={!active || speech.listening || props.awaitingDone} maxLength={6000} onChange={(event) => props.onAnswer(event.target.value)} placeholder={preparing ? "Your thinking time starts here…" : "Your words will appear here. You can type, too…"} className={styles.answerInput} />
            <p className={styles.characterCount}><span>{answerWordCount ? `${answerWordCount} words` : "Your answer, in your own words"}</span><span>{answer.length.toLocaleString()} / 6,000</span></p>
            <SpeechDeliveryHints hints={speech.deliveryHints} />
            {props.followUpBusy && <p role="status" className={styles.followUpNotice}><Loader2 size={16} className="animate-spin" /> Preparing your next question?</p>}
            {props.awaitingDone ? <section className={styles.donePrompt} aria-label="Answer confirmation">
              <p role="status">Done? Answer yes or no.</p>
              <span>Say yes to continue, or no to keep answering. You can also carry on speaking.</span>
              <div><button type="button" onClick={props.onConfirmDone} disabled={!active}>Yes, I?m done</button><button type="button" onClick={props.onKeepAnswering} disabled={!active}>No, keep answering</button></div>
            </section> : <div className={styles.answerProgress}><span>Listening to your answer. After a pause, I?ll check whether you?re done.</span><button type="button" onClick={props.onDone} disabled={!active || props.prompting || !liveAnswer.trim()}>Done answering</button></div>}
            {props.followUpNotice && <p role="status" className={styles.followUpNotice}>{props.followUpNotice}</p>}
            {questionIndex > 0 && <AnimatedDisclosure title="Earlier answers" className={styles.previousAnswer}>{answers.slice(0, questionIndex).map((previous, index) => <div key={previous.question}><strong>{index + 1}. {previous.question}</strong><p>{previous.answer || "No answer added."}</p></div>)}</AnimatedDisclosure>}
          </div>
          <div className={styles.transcriptFooter}><span><Check size={14} />{preview ? "Preview · nothing saved to your account" : props.saved ? "Saved to your account" : "Autosaves every 15 seconds"}</span><p>Your browser’s speech service may process audio. PhloemAI saves only your transcript.</p></div>
        </> : <div className={styles.notesPanel}><h2>Station notes</h2><label htmlFor="interview-notes" className={styles.answerLabel}>Private notes · not marked</label><textarea id="interview-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000} placeholder="Key points, examples, and reminders…" /><p><LockKeyhole size={13} />Notes stay on this screen and aren’t saved.</p></div>}

      </aside>
    </div>
    {endDialog && <div className={styles.dialogBackdrop}><div role="dialog" aria-modal="true" aria-labelledby="finish-title" className={styles.finishDialog} onKeyDown={(event) => { if (event.key === "Escape" && !busy) { event.stopPropagation(); closeEndDialog(); } if (event.key === "Tab") { const items = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'); const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } } }}><button type="button" autoFocus aria-label="Return to interview" className={styles.closeDialog} disabled={Boolean(busy)} onClick={() => closeEndDialog()}><X size={19} /></button><span className={styles.sectionIcon}><Check size={22} /></span><h2 id="finish-title">Ready to reflect?</h2><p>{preview ? "Review your preview transcript and markscheme. Sample AI feedback is optional." : "Save your transcript and open the station review, with the markscheme. You can choose to generate AI feedback there."}</p><div className={styles.finishSummary}><span>{answers.filter((item) => item.answer.trim()).length} / {answers.length} prompts answered</span><span>{props.wordCount} words</span></div>{!preview && props.wordCount < 20 && <p className={styles.deviceError}>Add at least 20 words across your answers to receive feedback.</p>}<button type="button" className={styles.primaryButton} disabled={Boolean(busy)} onClick={() => { closeEndDialog(); props.onSubmit(); }}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}Finish & review</button><button type="button" className={styles.secondaryButton} disabled={Boolean(busy)} onClick={() => closeEndDialog()}>Keep practising</button>{preview && <button type="button" className={styles.leaveButton} disabled={Boolean(busy)} onClick={props.onLeave}>Leave preview</button>}</div></div>}
  </div>;
}
