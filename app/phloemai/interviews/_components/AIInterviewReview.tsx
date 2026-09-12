"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, CheckCircle2, Clock3, Download, FileText, GraduationCap, Loader2, RotateCcw, Sparkles } from "lucide-react";
import type { InterviewAttempt } from "../_lib/interview-types";
import { getStationReviewGuidance } from "../_lib/station-review";
import { findInterviewUniversity } from "../_data/universities";
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

export function AIInterviewReview({ attempt, preview = false, configured, busy = false, onGenerate, onRetry, onNext, breakRemaining = 0 }: Props) {
  const [guideTab, setGuideTab] = useState<"framework" | "rubric">("framework");
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => { headingRef.current?.focus(); }, []);
  const guidance = getStationReviewGuidance(attempt.stationSlug);
  const university = attempt.universitySlug ? findInterviewUniversity(attempt.universitySlug) : null;
  const transcript = attempt.questions.map((question) => ({ question, answer: attempt.answers.find((item) => item.question === question)?.answer ?? "" }));
  const wordCount = transcript.reduce((total, item) => total + item.answer.trim().split(/\s+/).filter(Boolean).length, 0);
  const answered = transcript.filter((item) => item.answer.trim()).length;
  const feedback = attempt.feedback;
  const needsSaving = attempt.status === "in_progress";
  const download = () => {
    const text = [preview ? "PHLOEMAI PREVIEW — not saved to an account" : "PHLOEMAI STATION REVIEW", attempt.title,
      university?.name ?? "Independent station practice", "", "TRANSCRIPT",
      ...transcript.map((item) => `Interviewer: ${item.question}\nYou: ${item.answer || "No answer saved."}`),
      ...(feedback ? ["", "AI FEEDBACK", `Practice score: ${feedback.score}%`, feedback.summary, "Strengths", ...feedback.strengths, "Next steps", ...feedback.improvements, ...feedback.rubric.map((item) => `${item.criterion}: ${item.score}/100 — ${item.reason}`)] : []),
    ].join("\n\n");
    const url = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `phloem-${attempt.stationSlug}-${attempt.id.slice(0, 8)}.txt`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <div className={styles.review} data-station-review>
    <div className={styles.toolbar}>
      {needsSaving ? <span className={styles.disabledLink} aria-disabled="true"><ArrowLeft size={16} /> Saved interviews</span> : <Link href="/phloemai/interviews/reports"><ArrowLeft size={16} /> Saved interviews</Link>}
      <div><button type="button" className={styles.secondary} onClick={download}><Download size={16} /> Download transcript</button><button type="button" className={styles.primary} onClick={onRetry} disabled={busy || needsSaving}><RotateCcw size={16} /> Retry station</button></div>
    </div>
    <header className={styles.heading}>
      <div><p className={styles.eyebrow}><CheckCircle2 size={15} /> {preview ? "PREVIEW REVIEW" : needsSaving ? "STATION ENDED" : "STATION REVIEW"}</p><h1 ref={headingRef} tabIndex={-1}>{attempt.title}</h1><p>Read it back. Find what to build on. Try it again.</p></div>
      <span className={styles.saved}><Check size={15} /> {preview ? "Preview only" : needsSaving ? "Not yet saved to your account" : "Kept in saved interviews"}</span>
    </header>
    <div className={styles.context}>
      <span><GraduationCap size={16} /> {university?.name ?? "Independent practice"}</span>
      <span><Clock3 size={15} /> {new Date(attempt.startedAt).toLocaleDateString("en-GB", { timeZone: "Europe/London", day: "numeric", month: "short", year: "numeric" })}</span>
      <span>Station {attempt.stationIndex + 1} of {attempt.stationCount}</span>
      <span>{answered} of {transcript.length} prompts answered · {wordCount} words</span>
    </div>
    <nav className={styles.sectionLinks} aria-label="Review sections"><a href="#transcript-heading">Transcript</a><a href="#review-guide">Answer guide</a><a href="#ai-feedback-heading"><Sparkles size={14} /> AI feedback</a></nav>
    {preview && <p className={styles.notice} role="note">This preview is not saved. Any sample AI feedback is illustrative and does not assess your answers.</p>}

    <div className={styles.workspace}>
      <section className={styles.transcript} aria-labelledby="transcript-heading">
        <div className={styles.panelHeading}><FileText size={20} /><div><h2 id="transcript-heading">Your transcript</h2><p>Your questions and answers, in order.</p></div></div>
        <ol className={styles.conversation}>{transcript.map((item, index) => <li key={item.question}>
          <div className={styles.question}><span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><div><span className={styles.speaker}>Interviewer</span><h3>{item.question}</h3></div></div>
          <div className={styles.answer}><span className={styles.speaker}>Your answer</span><p className={item.answer ? undefined : styles.empty}>{item.answer || "No answer saved for this prompt."}</p></div>
        </li>)}</ol>
        <p className={styles.privacy}>Your transcript is private. Camera and microphone recordings are not saved.</p>
      </section>

      <aside className={styles.studyColumn} aria-label="Station guidance and feedback">
        <section className={styles.guide} id="review-guide">
          <div className={styles.panelHeading}><BookOpen size={20} /><div><h2>Build a stronger answer</h2><p>Use the guide to reflect on your own response.</p></div></div>
          <div className={styles.tabs} aria-label="Answer guidance">
            <button type="button" aria-pressed={guideTab === "framework"} onClick={() => setGuideTab("framework")}>Model answer framework</button>
            <button type="button" aria-pressed={guideTab === "rubric"} onClick={() => setGuideTab("rubric")}>Markscheme</button>
          </div>
          <div className={styles.guideBody}>
            <p className={styles.guideIntro}>{guideTab === "framework" ? "An answer structure to make your own. Use your experiences and respond to the question you were asked." : "The same practice rubric used in the PhloemAI question bank. Use these points to review your transcript."}</p>
            {guidance ? (guideTab === "framework" ? guidance.framework : guidance.rubric).map((section, index) => <section className={styles.guideSection} key={section.title}><h3><span>{String(index + 1).padStart(2, "0")}</span>{section.title}</h3><ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul></section>) : <p>Review the question-bank rubric for guidance on structuring and reflecting on your answers.</p>}
            <a className={styles.source} href="/phloemai/interview-question-markscheme-rubrics.pdf" target="_blank" rel="noreferrer">Open the full PhloemAI rubric <ArrowRight size={14} /></a>
            <p className={styles.sourceNote}>PhloemAI practice guidance, not an official university markscheme.</p>
          </div>
        </section>

        <section className={styles.feedback} aria-labelledby="ai-feedback-heading">
          <div className={styles.panelHeading}><Sparkles size={20} /><div><h2 id="ai-feedback-heading">AI feedback</h2><p>{feedback ? "Your assessment is ready below." : "A second perspective, when you want it."}</p></div></div>
          <p>{feedback ? "Explore your strengths, next steps and criterion scores." : "Generate a practice score and suggestions based on your saved answers."}</p>
          {feedback ? <a className={styles.feedbackLink} href="#station-feedback">Read your feedback <ArrowRight size={16} /></a> : <>
            <button type="button" className={styles.primary} disabled={busy || needsSaving || (!preview && (!configured || wordCount < 20))} onClick={onGenerate}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}{preview ? "View sample AI feedback" : attempt.status === "grading" ? "Check AI feedback" : "Generate AI feedback"}</button>
            {!configured && !preview ? <p className={styles.availability}>AI feedback is currently unavailable. Your transcript and study guide are ready to use.</p> : wordCount < 20 && !preview ? <p className={styles.availability}>AI feedback needs at least 20 words. You can still review this attempt or retry the station.</p> : <p className={styles.availability}>Feedback is optional. You can retry or move on without generating it.</p>}
          </>}
        </section>
      </aside>
    </div>

    {feedback && <section className={styles.assessment} id="station-feedback" aria-labelledby="feedback-heading">
      <header><div><p className={styles.eyebrow}>{preview ? "ILLUSTRATIVE SAMPLE" : "YOUR AI FEEDBACK"}</p><h2 id="feedback-heading">What to take into your next attempt</h2><p>{feedback.summary}</p></div><div className={styles.score}><strong>{feedback.score}<span>%</span></strong><span>{preview ? "Example score" : "Practice score"}</span></div></header>
      <div className={styles.takeaways}>{[{ title: "Keep building on", items: feedback.strengths }, { title: "Try next time", items: feedback.improvements }].map((group) => <section key={group.title}><h3>{group.title}</h3><ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul></section>)}</div>
      <details className={styles.breakdown}><summary>View the marking breakdown</summary><p>Each criterion is marked out of 100; the calibrated overall score is capped at 99%.</p>{feedback.rubric.map((item) => <div key={item.criterion}><h3>{item.criterion}<span>{item.score}/100</span></h3><p>{item.reason}</p></div>)}</details>
      <p className={styles.sourceNote}>Practice guidance, not an admissions prediction. Accent, camera use and eye contact are not scored.</p>
    </section>}
    <footer className={styles.nextSteps}><div><h2>{onNext ? "Keep your circuit moving" : "Put one improvement into practice"}</h2><p>{preview ? "Try the station again, or choose another topic." : "This attempt stays in saved interviews when you retry."}{onNext && breakRemaining > 0 && ` Your break: ${Math.floor(breakRemaining / 60)}:${String(breakRemaining % 60).padStart(2, "0")} remaining.`}</p></div><div><button type="button" className={styles.secondary} disabled={busy || needsSaving} onClick={onRetry}><RotateCcw size={16} /> Retry station</button>{onNext ? <button type="button" className={styles.primary} disabled={busy || needsSaving || breakRemaining > 0} onClick={onNext}>Next station <ArrowRight size={16} /></button> : needsSaving ? <button type="button" className={styles.primary} disabled>Choose another station <ArrowRight size={16} /></button> : <Link className={styles.primary} href="/phloemai/interviews/ai-interviews?setup=1">Choose another station <ArrowRight size={16} /></Link>}</div></footer>
  </div>;
}
