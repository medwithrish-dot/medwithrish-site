"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, AudioLines, Check, Clock3, FileText, Loader2, LockKeyhole, Maximize2, MessageSquareText, Mic, MicOff, Minimize2, PhoneOff, Sparkles, UserRound, Video, VideoOff, Volume2, VolumeX, X } from "lucide-react";
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
  onToggleMicrophone: () => void;
  setReadAloud: (enabled: boolean) => void; onAnswer: (value: string) => void;
  onQuestion: (index: number) => void; onSubmit: () => void; onLeave: () => void;
  wordCount: number; onSkipPreparation: () => void;
  followUpAvailable: boolean; followUpBusy: boolean; followUpNotice: string; onFollowUp: () => void;
};

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
  const liveAnswer = [answer, speech.listening ? speech.interimTranscript : ""].filter(Boolean).join(" ");
  const microphonePending = devices.microphonePermission === "requesting";
  const microphoneLabel = microphonePending ? "Allow microphone in your browser" : speech.listening ? "Stop mic" : "Start mic";
  useEffect(() => {
    if (speech.listening && answerInput.current) answerInput.current.scrollTop = answerInput.current.scrollHeight;
  }, [liveAnswer, speech.listening]);
  useEffect(() => {
    if (!focus || endDialog) return;
    const leaveFocus = (event: KeyboardEvent) => { if (event.key === "Escape") setFocus(false); };
    window.addEventListener("keydown", leaveFocus);
    return () => window.removeEventListener("keydown", leaveFocus);
  }, [focus, endDialog]);
  const goToQuestion = (index: number) => { setTab("transcript"); props.onQuestion(index); };
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
          <section className={styles.currentPrompt} aria-label="Current interview question">
            <div className={styles.promptEyebrow}><span><span className={styles.greenDot} />{preparing ? "Reading time" : "Your interview"}</span><span>Question {questionIndex + 1} / {attempt.questions.length}</span></div>
            <h2>{question}</h2>
            <p>{preparing ? "Take a breath. Use this time to organise your thoughts." : expired ? "Your time is up. Finish the station when you’re ready." : "Take your time. We’re interested in how you think."}</p>
          </section>
          <div className={styles.participantGrid}>
            <section className={`${styles.participantCard} ${speech.listening ? styles.participantActive : ""}`} aria-label="Your participant tile">
              {devices.cameraEnabled ? <div className={styles.participantVideo}><InterviewDevicePreview stream={devices.stream} compact /></div> : <div className={styles.participantPortrait}><span className={styles.youAvatar} aria-hidden="true"><UserRound size={28} strokeWidth={1.5} /></span></div>}
              <div className={styles.participantName}><div><strong>You</strong><span>{devices.cameraEnabled ? "Local camera preview" : "Camera off"}</span></div>{speech.listening ? <AudioLines size={15} aria-label="Microphone on" /> : <MicOff size={14} aria-label="Microphone off" />}</div>
            </section>
            <section className={`${styles.participantCard} ${styles.aiParticipant} ${speech.speaking ? styles.participantActive : ""}`} aria-label="AI interviewer participant tile">
              <div className={styles.participantPortrait}><div className={`${styles.interviewerOrb} ${speech.speaking ? styles.orbSpeaking : ""}`} aria-hidden="true"><span /><div><AudioLines size={30} strokeWidth={1.4} /></div></div></div>
              <div className={styles.participantName}><div><strong>AI interviewer</strong><span>{speech.speaking ? "Speaking" : "PhloemAI"}</span></div>{speech.speaking ? <AudioLines size={15} aria-label="Reading the question" /> : <span className={styles.greenDot} />}</div>
            </section>
          </div>
          <div className={styles.stationHint}><p className={styles.stageStatus} role="status"><span className={speech.listening ? styles.listeningDot : styles.greenDot} />{status}</p>{preparing && preview && <button type="button" className={styles.textButton} onClick={props.onSkipPreparation}>Skip reading time <ArrowRight size={14} /></button>}</div>
        </div>
        <footer className={styles.callControls} aria-label="Interview controls">
          <div className={styles.deviceControls}>
            <button type="button" disabled={!active || microphonePending || !speech.supported} aria-label={microphoneLabel} title={microphoneLabel} aria-pressed={speech.listening} className={speech.listening ? styles.controlActive : ""} onClick={props.onToggleMicrophone}>{microphonePending ? <Loader2 size={21} className="animate-spin" /> : speech.listening ? <Mic size={21} /> : <MicOff size={21} />}<span>{speech.listening ? "Stop mic" : "Start mic"}</span></button>
            <button type="button" aria-label={devices.cameraEnabled ? "Turn camera off" : "Turn camera on"} title={devices.cameraEnabled ? "Turn camera off" : "Turn camera on"} aria-pressed={devices.cameraEnabled} disabled={devices.cameraPending || Boolean(busy)} onClick={() => void devices.toggleCamera()}>{devices.cameraPending ? <Loader2 size={21} className="animate-spin" /> : devices.cameraEnabled ? <Video size={21} /> : <VideoOff size={21} />}<span>{devices.cameraEnabled ? "Camera on" : "Camera off"}</span></button>
            <button ref={finishButton} type="button" className={styles.endCallButton} aria-label="Finish station" title="Finish station" disabled={Boolean(busy)} onClick={() => setEndDialog(true)}><PhoneOff size={21} /><span>Finish</span></button>
          </div>
          {microphonePending ? <p role="status" className={styles.callNotice}>Choose Allow or Block in your browser’s microphone prompt. You can also type your answer.</p> : (devices.microphoneError || speech.error) ? <p role="status" className={styles.callNotice}>{devices.microphoneError || speech.error}</p> : <p className={styles.controlHint}>{speech.listening ? "Listening · your words appear in the transcript." : preparing ? "Your microphone will be ready after reading time." : "Click the mic to speak, or type in the transcript."}</p>}
          {devices.cameraError && <p role="status" className={styles.callNotice}>{devices.cameraError}</p>}
          {!speech.supported && <p className={styles.callNotice}>Speech recognition is unavailable in this browser. Type your answer to continue.</p>}
        </footer>
      </div>
      <aside className={styles.transcriptPanel} aria-label="Interview transcript and notes">
        <div className={styles.transcriptTabs}><button type="button" aria-pressed={tab === "transcript"} onClick={() => setTab("transcript")}><MessageSquareText size={21} />Live transcript<span className={styles.transcriptCount}>{questionIndex + 1}</span></button><button type="button" aria-pressed={tab === "notes"} onClick={() => setTab("notes")}><FileText size={18} />Notes{notes && <span className={styles.notesDot} aria-label="Notes added" />}</button></div>
        {tab === "transcript" ? <>
          <div className={styles.transcriptScroll}>
            <div className={styles.transcriptQuestion}><span className={styles.miniInterviewer}><AudioLines size={19} /></span><div><strong>AI Interviewer</strong><p id="current-interview-question">{question}</p></div></div>
            <div className={styles.promptHeading}><span>Question {questionIndex + 1} of {attempt.questions.length}</span><button type="button" onClick={() => speech.speaking ? speech.stopSpeaking() : void speech.speak(question)} disabled={!speech.voiceSupported || Boolean(busy)}>{speech.speaking ? <VolumeX size={14} /> : <Volume2 size={14} />}{speech.speaking ? "Stop reading" : "Hear question"}</button></div>
            <div className={styles.answerHeading}><span className={styles.miniYou}><UserRound size={16} /></span><strong>You</strong>{speech.listening && <span className={styles.transcribingLabel}><AudioLines size={13} />Transcribing</span>}</div>
            <label className={styles.answerLabel} htmlFor="interview-answer">{speech.listening ? "Listening · stop the mic to edit" : preparing ? "Your answer opens after reading time" : "Speak or type your answer"}</label>
            <textarea ref={answerInput} id="interview-answer" aria-describedby="current-interview-question" value={liveAnswer} readOnly={!active || speech.listening} maxLength={6000} onChange={(event) => props.onAnswer(event.target.value)} placeholder={preparing ? "Your thinking time starts here…" : "Your words will appear here. You can type, too…"} className={styles.answerInput} />
            <p className={styles.characterCount}><span>{answerWordCount ? `${answerWordCount} words` : "Your answer, in your own words"}</span><span>{answer.length.toLocaleString()} / 6,000</span></p>
            {props.followUpAvailable && <div className={styles.followUpAction}><button type="button" disabled={!active || Boolean(busy) || props.followUpBusy || answerWordCount < 20} onClick={props.onFollowUp}>{props.followUpBusy ? <Loader2 size={16} className="animate-spin" /> : <MessageSquareText size={16} />}{props.followUpBusy ? "Preparing your follow-up…" : "Follow up on my answer"}<ArrowRight size={15} /></button><p>{answerWordCount < 20 ? "Add at least 20 words to explore your answer further." : "Explore a point from your answer, just like in an interview."}</p></div>}
            {props.followUpNotice && <p role="status" className={styles.followUpNotice}>{props.followUpNotice}</p>}
            {questionIndex > 0 && <AnimatedDisclosure title="Earlier answers" className={styles.previousAnswer}>{answers.slice(0, questionIndex).map((previous, index) => <div key={previous.question}><strong>{index + 1}. {previous.question}</strong><p>{previous.answer || "No answer added."}</p><button type="button" className={styles.textButton} disabled={!active} onClick={() => goToQuestion(index)}>Return to question {index + 1} <ArrowRight size={13} /></button></div>)}</AnimatedDisclosure>}
          </div>
          <div className={styles.transcriptFooter}><span><Check size={14} />{preview ? "Preview · nothing saved to your account" : props.saved ? "Saved to your account" : "Autosaves every 15 seconds"}</span><p>Your browser’s speech service may process audio. PhloemAI saves only your transcript.</p></div>
        </> : <div className={styles.notesPanel}><h2>Station notes</h2><label htmlFor="interview-notes" className={styles.answerLabel}>Private notes · not marked</label><textarea id="interview-notes" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={5000} placeholder="Key points, examples, and reminders…" /><p><LockKeyhole size={13} />Notes stay on this screen and aren’t saved.</p></div>}
        <nav className={styles.questionControls} aria-label="Station questions">
          <button type="button" aria-label="Previous question" disabled={!active || questionIndex === 0} onClick={() => goToQuestion(questionIndex - 1)}><ArrowLeft size={16} /></button>
          <div className={styles.questionNumbers}>{attempt.questions.map((_, index) => <button type="button" key={index} aria-label={`Question ${index + 1}${answers[index]?.answer.trim() ? ", answered" : ""}`} aria-current={questionIndex === index ? "step" : undefined} data-answered={Boolean(answers[index]?.answer.trim())} disabled={!active} onClick={() => goToQuestion(index)}>{index + 1}</button>)}</div>
          <button type="button" disabled={!active || questionIndex === attempt.questions.length - 1} onClick={() => goToQuestion(questionIndex + 1)}>Next <ArrowRight size={15} /></button>
        </nav>
      </aside>
    </div>
    {endDialog && <div className={styles.dialogBackdrop}><div role="dialog" aria-modal="true" aria-labelledby="finish-title" className={styles.finishDialog} onKeyDown={(event) => { if (event.key === "Escape" && !busy) { event.stopPropagation(); closeEndDialog(); } if (event.key === "Tab") { const items = event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'); const first = items[0]; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } } }}><button type="button" autoFocus aria-label="Return to interview" className={styles.closeDialog} disabled={Boolean(busy)} onClick={() => closeEndDialog()}><X size={19} /></button><span className={styles.sectionIcon}><Check size={22} /></span><h2 id="finish-title">Ready to reflect?</h2><p>{preview ? "Explore a sample marking screen to see how your feedback will look. The example score is illustrative." : "Finish this station and turn your answers into a useful next step. Your transcript will be locked for marking."}</p><div className={styles.finishSummary}><span>{answers.filter((item) => item.answer.trim()).length} / {answers.length} prompts answered</span><span>{props.wordCount} words</span></div>{!preview && props.wordCount < 20 && <p className={styles.deviceError}>Add at least 20 words across your answers to receive feedback.</p>}<button type="button" className={styles.primaryButton} disabled={Boolean(busy) || (!preview && (preparing || props.wordCount < 20))} onClick={() => { closeEndDialog(); props.onSubmit(); }}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{preview ? "See sample feedback" : "Finish & get feedback"}</button><button type="button" className={styles.secondaryButton} disabled={Boolean(busy)} onClick={() => closeEndDialog()}>Keep practising</button><button type="button" className={styles.leaveButton} disabled={Boolean(busy)} onClick={props.onLeave}>{preview ? "Leave preview" : "End without feedback (uses this attempt)"}</button></div></div>}
  </div>;
}
