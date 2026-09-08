"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, AudioLines, Check, Clock3, FileText, Loader2, Maximize2, MessageSquareText, Mic, MicOff, Minimize2, PhoneOff, Sparkles, Video, VideoOff, Volume2, VolumeX, X } from "lucide-react";
import type { InterviewAnswer, InterviewAttempt } from "../_lib/interview-types";
import type { useInterviewDevices } from "../_lib/useInterviewDevices";
import type { useInterviewSpeech } from "../_lib/useInterviewSpeech";
import { InterviewDevicePreview } from "./InterviewDevicePreview";
import { AnimatedDisclosure } from "./AnimatedDisclosure";
import styles from "./AIInterviewRoom.module.css";

export const formatRoomTime = (seconds: number) => `${Math.floor(Math.max(0, seconds) / 60)}:${String(Math.max(0, seconds) % 60).padStart(2, "0")}`;
type Props = {
  attempt: InterviewAttempt; answers: InterviewAnswer[]; questionIndex: number;
  preparing: boolean; expired: boolean; active: boolean; secondsRemaining: number;
  speech: ReturnType<typeof useInterviewSpeech>; devices: ReturnType<typeof useInterviewDevices>;
  saved: boolean; busy: string; preview: boolean; readAloud: boolean;
  microphoneConsent: boolean; setMicrophoneConsent: (enabled: boolean) => void;
  setReadAloud: (enabled: boolean) => void; onAnswer: (value: string) => void;
  onQuestion: (index: number) => void; onSubmit: () => void; onLeave: () => void;
  wordCount: number; onSkipPreparation: () => void;
};

export function AIInterviewCall(props: Props) {
  const [tab, setTab] = useState<"transcript" | "notes">("transcript");
  const [notes, setNotes] = useState("");
  const [focus, setFocus] = useState(false);
  const [endDialog, setEndDialog] = useState(false);
  const answerInput = useRef<HTMLTextAreaElement>(null);
  const { attempt, speech, devices, questionIndex, answers, preparing, expired, active, busy, preview } = props;
  const question = attempt.questions[questionIndex];
  const status = busy ? "One moment…" : preparing ? "Take a moment to think" : expired ? "Time to reflect" : speech.speaking ? "Reading your question" : speech.listening ? "Listening to you" : "Ready when you are";
  const answer = answers[questionIndex]?.answer ?? "";
  const liveAnswer = [answer, speech.listening ? speech.interimTranscript : ""].filter(Boolean).join(" ");
  useEffect(() => {
    if (speech.listening && answerInput.current) answerInput.current.scrollTop = answerInput.current.scrollHeight;
  }, [liveAnswer, speech.listening]);
  const goToQuestion = (index: number) => { setTab("transcript"); props.onQuestion(index); };

  return <div className={`${styles.callRoom} ${focus ? styles.focusRoom : ""}`}>
    <header className={styles.roomHeader}><div className={styles.roomBrand}><span className={styles.brandMark}><AudioLines size={20} /></span><div><strong>phloem <span>interview room</span></strong><p>{preview ? "Preview session" : "Private practice"} <span>·</span> Station {attempt.stationIndex + 1} of {attempt.stationCount}</p></div></div><div className={`${styles.roomTimer} ${!preparing && props.secondsRemaining < 60 ? styles.timerUrgent : ""}`} role="timer" aria-label={`${preparing ? "Preparation" : "Station"} time remaining`}><Clock3 size={16} /><span>{preparing ? "Reading time" : expired ? "Time complete" : "Station time"}</span><strong>{formatRoomTime(props.secondsRemaining)}</strong></div></header>
    <div className={styles.callLayout}>
      <div className={styles.stageColumn}>
        <div className={styles.interviewerStage}>
          <div className={styles.stageTop}><span className={styles.stationTitle}>{attempt.title}</span><button type="button" className={styles.stageIcon} aria-label={focus ? "Exit focus view" : "Enter focus view"} aria-pressed={focus} onClick={() => setFocus(!focus)}>{focus ? <Minimize2 size={17} /> : <Maximize2 size={17} />}</button></div>
          <div className={styles.interviewerIdentity}><div className={`${styles.interviewerOrb} ${speech.speaking ? styles.orbSpeaking : ""}`} aria-hidden="true"><span /><span /><div><AudioLines size={36} strokeWidth={1.25} /></div></div><div className={styles.identityCopy}><h2>Your AI interviewer</h2><p role="status"><span className={speech.listening ? styles.listeningDot : styles.greenDot} />{status}</p></div></div>
          <div className={styles.questionCaption}><span>QUESTION {questionIndex + 1} OF {attempt.questions.length}</span><p id="current-interview-question">{question}</p><button type="button" onClick={() => speech.speaking ? speech.stopSpeaking() : void speech.speak(question)} disabled={!speech.voiceSupported || Boolean(busy)}>{speech.speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}{speech.speaking ? "Stop reading" : "Hear question"}</button></div>
          {devices.cameraEnabled && <div className={styles.callSelfPreview}><InterviewDevicePreview stream={devices.stream} compact /></div>}
        </div>
        <div className={styles.stationHint}><p>{preparing ? "Use the reading time to gather your thoughts. Your answer opens when it ends." : "Use an example, then explain what you learned."}</p>{preparing && preview && <button type="button" className={styles.textButton} onClick={props.onSkipPreparation}>Skip reading time <ArrowRight size={14} /></button>}</div>
      </div>
      <aside className={styles.transcriptPanel} aria-label="Interview transcript and notes">
        <div className={styles.transcriptTabs}><button type="button" aria-pressed={tab === "transcript"} onClick={() => setTab("transcript")}><MessageSquareText size={16} />Your answer</button><button type="button" aria-pressed={tab === "notes"} onClick={() => setTab("notes")}><FileText size={16} />Notes</button></div>
        {tab === "transcript" ? <><div className={styles.transcriptScroll}>
          <label className={styles.answerLabel} htmlFor="interview-answer">{speech.listening ? "Listening · stop the mic to edit" : preparing ? "Your answer opens after reading time" : "Speak or type your answer"}</label>
          <textarea ref={answerInput} id="interview-answer" aria-describedby="current-interview-question" value={liveAnswer} readOnly={!active || speech.listening} maxLength={6000} onChange={(event) => props.onAnswer(event.target.value)} placeholder={preparing ? "Take a moment to think…" : "Start with what comes naturally…"} className={styles.answerInput} />
          <p className={styles.characterCount}>{answer.length} / 6,000</p>
          {questionIndex > 0 && <AnimatedDisclosure title="Earlier answers" className={styles.previousAnswer}>{answers.slice(0, questionIndex).map((previous, index) => <div key={previous.question}><strong>{index + 1}. {previous.question}</strong><p>{previous.answer || "No answer added."}</p><button type="button" className={styles.textButton} disabled={!active} onClick={() => goToQuestion(index)}>Return to question {index + 1} <ArrowRight size={13} /></button></div>)}</AnimatedDisclosure>}
        </div><div className={styles.transcriptFooter}><span><Check size={13} />{preview ? "Preview · nothing saved to your account" : props.saved ? "Saved to your account" : "Autosaves every 15 seconds"}</span></div></> : <div className={styles.notesPanel}><label htmlFor="interview-notes" className={styles.answerLabel}>Private notes · not marked</label><textarea id="interview-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000} placeholder="Situation → action → what I learned…" /><p>Notes stay on this screen and aren’t saved.</p></div>}
      </aside>
    </div>
    {(speech.error || devices.cameraError) && <p role="status" className={styles.callNotice}>{speech.error || devices.cameraError}</p>}
    {!speech.supported && <p className={styles.callNotice}>Speech recognition is unavailable in this browser. Type your answer in the transcript to continue.</p>}
    {speech.supported && !props.microphoneConsent && <label className={styles.callConsent}><input type="checkbox" checked={false} onChange={(event) => props.setMicrophoneConsent(event.target.checked)} /><span>Enable spoken answers. Your browser’s speech service may process audio; Phloem saves only your transcript.</span></label>}
    <footer className={styles.callControls} aria-label="Interview controls"><div className={styles.deviceControls}><button type="button" disabled={!active || !props.microphoneConsent || !speech.supported} aria-pressed={speech.listening} className={speech.listening ? styles.controlActive : ""} onClick={() => speech.listening ? void speech.stop() : speech.start()}>{speech.listening ? <Mic size={18} /> : <MicOff size={18} />}<span>{speech.listening ? "Stop mic" : "Start mic"}</span></button><button type="button" aria-pressed={devices.cameraEnabled} disabled={devices.cameraPending || Boolean(busy)} onClick={() => void devices.toggleCamera()}>{devices.cameraEnabled ? <Video size={18} /> : <VideoOff size={18} />}<span>Camera</span></button><button type="button" aria-pressed={props.readAloud} disabled={!speech.voiceSupported} onClick={() => props.setReadAloud(!props.readAloud)}>{props.readAloud ? <Volume2 size={18} /> : <VolumeX size={18} />}<span>Voice</span></button></div><nav className={styles.questionControls} aria-label="Station questions"><button type="button" aria-label="Previous question" disabled={!active || questionIndex === 0} onClick={() => goToQuestion(questionIndex - 1)}><ArrowLeft size={17} /></button><div className={styles.questionNumbers}>{attempt.questions.map((_, index) => <button type="button" key={index} aria-label={`Question ${index + 1}${answers[index]?.answer.trim() ? ", answered" : ""}`} aria-current={questionIndex === index ? "step" : undefined} disabled={!active} onClick={() => goToQuestion(index)}>{index + 1}</button>)}</div><button type="button" disabled={!active || questionIndex === attempt.questions.length - 1} onClick={() => goToQuestion(questionIndex + 1)}>Next <ArrowRight size={15} /></button></nav><button type="button" className={styles.endCallButton} disabled={Boolean(busy)} onClick={() => setEndDialog(true)}><PhoneOff size={18} /><span>Finish station</span></button></footer>
    {endDialog && <div className={styles.dialogBackdrop}><div role="dialog" aria-modal="true" aria-labelledby="finish-title" className={styles.finishDialog} onKeyDown={(event) => { if (event.key === "Escape" && !busy) setEndDialog(false); if (event.key === "Tab") { const items = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'); const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } } }}><button type="button" autoFocus aria-label="Return to interview" className={styles.closeDialog} disabled={Boolean(busy)} onClick={() => setEndDialog(false)}><X size={19} /></button><span className={styles.sectionIcon}><Check size={22} /></span><h2 id="finish-title">Ready to reflect?</h2><p>{preview ? "Explore a sample marking screen to see how your feedback will look. The example score is illustrative." : "Finish this station and turn your answers into a useful next step. Your transcript will be locked for marking."}</p><div className={styles.finishSummary}><span>{answers.filter((item) => item.answer.trim()).length} / {answers.length} prompts answered</span><span>{props.wordCount} words</span></div>{!preview && props.wordCount < 20 && <p className={styles.deviceError}>Add at least 20 words across your answers to receive feedback.</p>}<button type="button" className={styles.primaryButton} disabled={Boolean(busy) || (!preview && (preparing || props.wordCount < 20))} onClick={() => { setEndDialog(false); props.onSubmit(); }}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{preview ? "See sample feedback" : "Finish & get feedback"}</button><button type="button" className={styles.secondaryButton} disabled={Boolean(busy)} onClick={() => setEndDialog(false)}>Keep practising</button><button type="button" className={styles.leaveButton} disabled={Boolean(busy)} onClick={props.onLeave}>{preview ? "Leave preview" : "End without feedback (uses this attempt)"}</button></div></div>}
  </div>;
}
