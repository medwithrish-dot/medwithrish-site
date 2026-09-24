"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, Download, FileText, GraduationCap, Loader2, RotateCcw, Sparkles, X } from "lucide-react";
import type { InterviewAttempt } from "../_lib/interview-types";
import { findInterviewUniversity } from "../_data/universities";
import { AttemptMarkSchemes } from "./AttemptMarkSchemes";
import { getTranscriptHints, normalizeSpeechTranscript } from "../_lib/speech-delivery";
import { answerConversation } from "../_lib/interviewer-transcript";
import styles from "./AIInterviewReview.module.css";

type Props = {
  attempt: InterviewAttempt;
  preview?: boolean;
  configured: boolean;
  busy?: boolean;
  onGenerate: () => void;
  onRetry: () => void;
  onNext?: () => void;
  breakRemaining?: number;
};

function revealFeedback(element: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  element.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
}

export function AIInterviewReview({ attempt, preview = false, configured, busy = false, onGenerate, onRetry, onNext, breakRemaining = 0 }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const feedbackRef = useRef<HTMLElement>(null);
  const assessmentRef = useRef<HTMLElement>(null);
  const feedbackRequestedRef = useRef(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const university = attempt.universitySlug ? findInterviewUniversity(attempt.universitySlug) : null;
  const transcript = attempt.questions.map((question) => ({ question, answer: "", ...attempt.answers.find((item) => item.question === question) }));
  const wordCount = transcript.reduce((total, item) => total + getTranscriptHints(item.answer).wordCount, 0);
  const answered = transcript.filter((item) => item.answer.trim()).length;
  const feedback = attempt.feedback;
  const speechSamples = attempt.metrics.speechSampleCount ?? 0;
  const speechWords = attempt.metrics.speechWordsPerSevenSeconds ?? 0;
  const speechSpeed = speechSamples ? (speechWords < 13 ? "slow" : speechWords > 21 ? "fast" : "medium") : null;
  const speechSideNote = speechSpeed
    ? `Talking speed: ${speechSpeed} (about ${speechWords} words per 7 seconds across ${speechSamples} measured ${speechSamples === 1 ? "answer" : "answers"}).`
    : null;
  useEffect(() => {
    if (feedback && feedbackRequestedRef.current) {
      feedbackRequestedRef.current = false;
      revealFeedback(assessmentRef.current);
    }
  }, [feedback]);
  const feedbackSections = feedback ? [{ title: "Strengths", items: feedback.strengths }, { title: "Weaknesses", items: feedback.weaknesses ?? [] }, { title: "Fixes", items: feedback.fixes ?? feedback.improvements }] : [];
  const needsSaving = attempt.status === "in_progress";
  const feedbackUnavailable = !feedback && !preview ? (wordCount < 20 ? "word-count" : !configured ? "credits" : null) : null;
  const feedbackAction = <div className={styles.feedbackActionGroup}><button type="button" className={styles.primary}
    disabled={!feedback && (busy || needsSaving || feedbackUnavailable === "word-count" || feedbackUnavailable === "credits")}
    aria-controls={feedback ? "station-feedback" : "ai-feedback"}
    onClick={() => {
      if (feedback) { revealFeedback(assessmentRef.current); return; }
      feedbackRequestedRef.current = true;
      revealFeedback(feedbackRef.current);
      onGenerate();
    }}>
    {busy && !feedback ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
    {feedback ? "View AI feedback" : busy ? "Generating feedback…" : preview ? "View sample AI feedback" : attempt.status === "grading" ? "Check AI feedback" : "Generate AI feedback"}
  </button>{feedbackUnavailable === "word-count" && <button type="button" className={styles.unavailablePill} disabled>Not available - less than 20 words</button>}{feedbackUnavailable === "credits" && <button type="button" className={styles.upgradePill} onClick={() => setUpgradeOpen(true)}>Not available - <span>Upgrade</span> for more credits</button>}</div>;
  const download = () => {
    const text = [preview ? "MEDICFOREST PREVIEW — not saved to an account" : "MEDICFOREST STATION REVIEW", attempt.title,
      university?.name ?? "Independent station practice", "", "TRANSCRIPT",
      ...transcript.map((item) => `Interviewer: ${[item.interviewerIntro, item.question].filter(Boolean).join(" ")}\n${answerConversation(item).map((turn) => `${turn.speaker}: ${turn.text || "No answer saved."}`).join("\n")}`),
      ...(speechSideNote ? ["", "SPEECH DELIVERY SIDE NOTE", speechSideNote] : []),
      ...(feedback ? ["", "AI FEEDBACK", `Practice score: ${feedback.score}%`, feedback.summary, ...feedbackSections.flatMap((section) => [section.title, ...section.items]), ...feedback.rubric.map((item) => `${item.criterion}: ${item.score}/100 — ${item.reason}`)] : []),
    ].join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `medicforest-${attempt.stationSlug}-${attempt.id.slice(0, 8)}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className={styles.review} data-station-review>
    <div className={styles.toolbar}>
      {needsSaving ? <span className={styles.disabledLink} aria-disabled="true"><ArrowLeft size={16} /> Saved interviews</span> : <Link href="/medicforest/interview/reports"><ArrowLeft size={16} /> Saved interviews</Link>}
      <div><button type="button" className={styles.secondary} onClick={download}><Download size={16} /> Download transcript</button><button type="button" className={styles.primary} onClick={onRetry} disabled={busy || needsSaving}><RotateCcw size={16} /> Retry station</button></div>
    </div>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}><CheckCircle2 size={15} /> {preview ? "PREVIEW REVIEW" : needsSaving ? "STATION ENDED" : "STATION REVIEW"}</p><h1 ref={headingRef} tabIndex={-1}>{attempt.title}</h1><p>Transcript, self-marking and feedback.</p></div>
      <span className={styles.saved}><Check size={15} /> {preview ? "Preview only" : needsSaving ? "Not yet saved to your account" : "Kept in saved interviews"}</span>
    </header>
    <div className={styles.context}>
      <span><GraduationCap size={16} /> {university?.name ?? "Independent practice"}</span>
      <span><Clock3 size={15} /> {new Date(attempt.startedAt).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" })}</span>
      <span>Station {attempt.stationIndex + 1} of {attempt.stationCount}</span>
      <span>{answered} of {transcript.length} prompts answered · {wordCount} words</span>
    </div>
    <nav className={styles.sectionLinks} aria-label="Review sections"><a href="#transcript-heading">Transcript</a><a href="#review-guide">Markscheme</a><a href="#ai-feedback-heading"><Sparkles size={14} /> AI feedback</a></nav>
    {preview && <p className={styles.notice} role="note">This preview is not saved. Any sample AI feedback is illustrative and does not assess your answers.</p>}
    {!onNext && attempt.stationIndex + 1 >= attempt.stationCount && !needsSaving && <section className={styles.circuitCallout} aria-label="Interview complete"><div><p className={styles.eyebrow}>INTERVIEW COMPLETE</p><h2>All stations complete.</h2></div><Link className={styles.nextPrimary} href="/medicforest/interview/dashboard">End interview <ArrowRight size={18} /></Link></section>}
    {onNext && <section className={styles.circuitCallout} aria-label="Continue circuit"><div><p className={styles.eyebrow}>NEXT STATION READY</p><h2>Keep your circuit moving.</h2><p>{breakRemaining > 0 ? `Scheduled break: ${Math.floor(breakRemaining / 60)}:${String(breakRemaining % 60).padStart(2, "0")} remaining. You can continue now if you feel ready.` : "You can continue now, or take a moment to review first."}</p></div><div className={styles.calloutActions}><button type="button" className={styles.secondary} disabled={busy || needsSaving} onClick={onRetry}><RotateCcw size={16} /> Retry station</button><button type="button" className={styles.nextPrimary} disabled={busy || needsSaving} onClick={onNext}>Next station <ArrowRight size={18} /></button></div></section>}

    <div className={styles.workspace}>
      <section className={styles.transcript} aria-labelledby="transcript-heading">
        <div className={styles.panelHeading}><FileText size={20} /><div><h2 id="transcript-heading">Your transcript</h2><p>Your saved conversation.</p></div></div>
        <ol className={styles.conversation}>{transcript.map((item, index) => <li key={item.question}>
          <div className={styles.question}><span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><div><span className={styles.speaker}>Interviewer</span>{item.interviewerIntro && <p>{item.interviewerIntro}</p>}<h3>{item.question}</h3></div></div>
          {answerConversation(item).map((turn, turnIndex) => <div key={turnIndex} className={styles.answer}><span className={styles.speaker}>{turn.speaker === "You" ? "Your answer" : "Interviewer"}</span><p className={turn.text ? undefined : styles.empty}>{normalizeSpeechTranscript(turn.text) || "No answer saved for this prompt."}</p></div>)}
        </li>)}</ol>
        <p className={styles.privacy}>Your transcript is private. Camera and microphone recordings are not saved.</p>
      </section>

      <aside className={styles.studyColumn} aria-label="Station guidance and feedback">
        <section id="review-guide" aria-label="Station markscheme">
          <AttemptMarkSchemes key={attempt.id} attempt={attempt} headerAction={feedbackAction} />
        </section>

        <section id="ai-feedback" ref={feedbackRef} tabIndex={-1} className={styles.feedback} aria-labelledby="ai-feedback-heading" aria-busy={busy && !feedback}>
          <div className={styles.panelHeading}><Sparkles size={20} /><div><h2 id="ai-feedback-heading">AI feedback</h2><p>{feedback ? "Your assessment is ready below." : "A second perspective, when you want it."}</p></div></div>
          <p>{feedback ? "Strengths, weaknesses and practical fixes." : "Generate a practice score and suggestions based on your saved answers."}</p>
          {speechSideNote && <aside className={styles.deliverySideNote} aria-label="Speech delivery side note"><strong>Speech delivery side note</strong><p>{speechSideNote}</p><span>Approximate coaching only; it does not affect your score.</span></aside>}
          {feedback ? <a className={styles.feedbackLink} href="#station-feedback">Read your feedback <ArrowRight size={16} /></a> : <>
            {busy && <p className={styles.feedbackStatus} role="status"><Loader2 size={16} className="animate-spin" /> Preparing your feedback. It will appear here when ready.</p>}
            {!configured && !preview ? <p className={styles.availability}>AI feedback is currently unavailable. Your transcript and study guide are ready to use.</p> : wordCount < 20 && !preview ? <p className={styles.availability}>AI feedback needs at least 20 words. You can still review this attempt or retry the station.</p> : <p className={styles.availability}>Feedback is optional. You can retry or move on without generating it.</p>}
          </>}
        </section>
      </aside>
    </div>

    {feedback && <section className={styles.assessment} id="station-feedback" ref={assessmentRef} tabIndex={-1} aria-labelledby="feedback-heading">
      <header><div><p className={styles.eyebrow}>{preview ? "ILLUSTRATIVE SAMPLE" : "YOUR AI FEEDBACK"}</p><h2 id="feedback-heading">Your feedback</h2><p>{feedback.summary}</p></div><div className={styles.score}><strong>{feedback.score}<span>%</span></strong><span>{preview ? "Example score" : "Practice score"}</span></div></header>
      <div className={styles.takeaways}>{feedbackSections.map((group) => <section key={group.title}><h3>{group.title}</h3>{group.items.length ? <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul> : <p className={styles.sourceNote}>This older report did not include a separate weaknesses section.</p>}</section>)}</div>
      <details className={styles.breakdown}><summary>View the marking breakdown</summary><p>Each criterion is marked out of 100; the calibrated overall score is capped at 99%.</p>{feedback.rubric.map((item) => <div key={item.criterion}><h3>{item.criterion}<span>{item.score}/100</span></h3><p>{item.reason}</p></div>)}</details>
      <p className={styles.sourceNote}>Practice guidance, not an admissions prediction. Accent, camera use and eye contact are not scored.</p>
    </section>}
    <footer className={styles.nextSteps}><div><h2>{onNext ? "Ready for the next one?" : "Your interview review"}</h2><p>{preview ? "This preview is not saved." : "All saved stations are available in your interview history."}{onNext && breakRemaining > 0 && " The break timer is optional; continue whenever you feel ready."}</p></div><div><button type="button" className={styles.secondary} disabled={busy || needsSaving} onClick={onRetry}><RotateCcw size={16} /> Retry station</button>{onNext ? <button type="button" className={styles.primary} disabled={busy || needsSaving} onClick={onNext}>Next station <ArrowRight size={16} /></button> : needsSaving ? <button type="button" className={styles.primary} disabled>End interview <ArrowRight size={16} /></button> : <Link className={styles.primary} href="/medicforest/interview/dashboard">End interview <ArrowRight size={16} /></Link>}</div></footer>
    {upgradeOpen && <div className={styles.upgradeBackdrop} role="presentation" onClick={() => setUpgradeOpen(false)}><div role="dialog" aria-modal="true" aria-labelledby="upgrade-placeholder-title" className={styles.upgradeDialog} onClick={(event) => event.stopPropagation()}><button type="button" className={styles.closeUpgrade} aria-label="Close upgrade dialog" onClick={() => setUpgradeOpen(false)}><X size={17} /></button><p className={styles.eyebrow}>CREDITS PLACEHOLDER</p><h2 id="upgrade-placeholder-title">Upgrade for more AI feedback credits</h2><p>This is a placeholder popup for the credit upgrade flow. The real checkout or membership screen can be connected here.</p><div><Link className={styles.primary} href="/medicforest/pricing">View pricing <ArrowRight size={16} /></Link><button type="button" className={styles.secondary} onClick={() => setUpgradeOpen(false)}>Not now</button></div></div></div>}
  </div>;
}
