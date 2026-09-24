"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowUpRight, BookOpen, Check, CheckCircle2, ChevronDown, Flag, Loader2, LockKeyhole, MessageSquare, Target } from "lucide-react";
import { changePathwayTask, derivePathwayProgress, PATHWAY_GUEST_KEY, pathwayTaskId, sanitisePathwayProgress, type PathwayStation } from "@/utils/interviews/pathway";
import styles from "./InterviewStationPathway.module.css";

type Props = { stations: PathwayStation[]; userId: string | null; initialCompleted: string[]; available: boolean; isPremium: boolean };

export function InterviewStationPathway({ stations, userId, initialCompleted, available, isPremium }: Props) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [openIndex, setOpenIndex] = useState(() => Math.max(0, derivePathwayProgress(initialCompleted).currentIndex));
  const [ready, setReady] = useState(!!userId && available);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const changeEpoch = useRef(0);
  const restoreEpoch = useRef(0);
  const progress = derivePathwayProgress(completed);

  useEffect(() => {
    let active = true;
    let firstRestore = true;
    const restore = async () => {
      if (pending.current) return;
      const changedAtStart = changeEpoch.current;
      const requestEpoch = ++restoreEpoch.current;
      try {
        let ids: string[];
        if (userId) {
          const response = await fetch("/api/interviews/preparation/pathway", { cache: "no-store" });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Your saved pathway could not be loaded. Refresh to try again.");
          if (data.userId !== userId) throw new Error("Your account has changed. Refresh to load its pathway.");
          ids = sanitisePathwayProgress(data.completedTaskIds);
        } else {
          if (!available) throw new Error("Your pathway could not be loaded. Refresh to try again.");
          ids = sanitisePathwayProgress(JSON.parse(localStorage.getItem(PATHWAY_GUEST_KEY) ?? "[]"));
        }
        if (active && !pending.current && changedAtStart === changeEpoch.current && requestEpoch === restoreEpoch.current) {
          setCompleted(ids); setReady(true); setError("");
          if (firstRestore) setOpenIndex(derivePathwayProgress(ids).currentIndex);
          firstRestore = false;
        }
      } catch (failure) {
        if (active && changedAtStart === changeEpoch.current && requestEpoch === restoreEpoch.current) { setError(failure instanceof Error ? failure.message : "Progress storage is unavailable in this browser."); setReady(false); }
      }
    };
    // A fresh read also restores progress when returning through the browser's page cache.
    void restore();
    window.addEventListener("focus", restore);
    window.addEventListener("pageshow", restore);
    if (!userId) window.addEventListener("storage", restore);
    return () => { active = false; window.removeEventListener("focus", restore); window.removeEventListener("pageshow", restore); window.removeEventListener("storage", restore); };
  }, [userId, available]);

  async function toggle(taskId: string, done: boolean, advance = false) {
    if (pending.current || !ready) return;
    pending.current = true; changeEpoch.current += 1; setBusy(taskId); setError("");
    try {
      let ids = changePathwayTask(completed, taskId, done).completedTaskIds;
      if (userId) {
        const response = await fetch("/api/interviews/preparation/pathway", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ taskId, completed: done, expectedUserId: userId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Your progress could not be saved. Please try again.");
        ids = sanitisePathwayProgress(data.completedTaskIds);
      } else {
        // Guest work is never silently merged into an account on a shared computer.
        localStorage.setItem(PATHWAY_GUEST_KEY, JSON.stringify(ids));
      }
      setCompleted(ids);
      if (advance) {
        const next = derivePathwayProgress(ids).currentIndex;
        setOpenIndex(next);
        requestAnimationFrame(() => document.getElementById(next < 0 ? "pathway-mocks" : `pathway-${stations[next].id}`)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }));
      }
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Your progress could not be saved. Please try again."); }
    finally { pending.current = false; setBusy(null); }
  }

  return <div className={styles.pathway}>
    <section className={styles.intro} aria-labelledby="pathway-title">
      <div className={styles.introHeading}><span className={styles.introIcon}><Target size={23} /></span><span className={styles.eyebrow}>Your interview pathway</span></div>
      <h2 id="pathway-title">Seven stations. One steady route.</h2>
      <p>Learn the approach, practise your answers, then check you feel ready. Work through each station at your own pace before bringing everything together in mock interviews.</p>
      <div className={styles.overview}><strong>{progress.completedCount} of 7 stations complete</strong><span>Guides → Questions → Readiness → Next station</span></div>
      <div className={styles.progressBar} role="progressbar" aria-label="Station pathway progress" aria-valuemin={0} aria-valuemax={7} aria-valuenow={progress.completedCount}><span style={{ width: `${progress.completedCount / 7 * 100}%` }} /></div>
    </section>

    <p className={styles.storageNote}>{userId ? "Your progress is saved to your account and does not reset each day." : <>Guest progress stays in this browser and does not reset each day. <Link href="/medicforest/account">Sign in</Link> to start a pathway saved to your account.</>}</p>
    {error && <p role="alert" className={styles.error}>{error}</p>}

    <div className={styles.stations}>
      {stations.map((station, index) => {
        const state = progress.stations[index];
        const open = openIndex === index;
        const readyId = pathwayTaskId(station.id, "ready");
        const allTasksDone = state.resourceCount === state.resourceTotal;
        return <section className={styles.station} key={station.id} id={`pathway-${station.id}`} data-current={index === progress.currentIndex}>
          <button type="button" className={styles.stationHeading} aria-expanded={open} aria-controls={`pathway-content-${station.id}`} onClick={() => setOpenIndex(open ? -1 : index)}>
            <span className={styles.stationNumber} data-complete={state.complete}>{state.complete ? <Check size={20} /> : String(index + 1).padStart(2, "0")}</span>
            <span className={styles.headingText}><strong>{station.title}</strong><span>{station.description}</span></span>
            <span className={styles.stationStatus}>{state.complete ? "Complete" : !state.unlocked ? <><LockKeyhole size={12} /> Up next</> : state.resourceCount ? `${state.resourceCount}/${state.resourceTotal} tasks` : "Start here"}</span>
            <ChevronDown size={17} className={styles.chevron} data-open={open} />
          </button>
          <div id={`pathway-content-${station.id}`} className={styles.expand} data-open={open} inert={!open} aria-hidden={!open}><div className={styles.expandInner}><div className={styles.stationBody}>
            {!state.unlocked && <p className={styles.previewNote}>Explore what is coming up. Finish the previous station to start checking off these tasks.</p>}
            {(["guide", "question"] as const).map((kind) => <div key={kind} className={styles.taskGroup}>
              <h3>{kind === "guide" ? <BookOpen size={16} /> : <MessageSquare size={16} />}<span>{kind === "guide" ? "1. Read these guides" : "2. Practise these questions"}</span></h3>
              <p>{kind === "guide" ? "Read, reflect and tick each guide when you understand the approach." : "Answer aloud or type, then review against the mark scheme. Tick each question after reviewing your answer."}</p>
              <ul className={styles.taskList}>{station.tasks.filter((task) => task.kind === kind).map((task) => <li key={task.id} data-done={completed.includes(task.id)}>
                <label className={styles.checkbox}><input type="checkbox" checked={completed.includes(task.id)} disabled={!ready || !!busy || !state.unlocked} onChange={(event) => void toggle(task.id, event.target.checked)} aria-label={`Mark ${task.title} as ${completed.includes(task.id) ? "not done" : "done"}`} />{busy === task.id && <Loader2 size={14} className={styles.spinner} />}</label>
                <Link href={task.href}><span>{task.title}</span><ArrowUpRight size={15} /></Link>
              </li>)}</ul>
            </div>)}
            <div className={styles.readiness}>
              <h3><CheckCircle2 size={16} /> 3. Your readiness check</h3>
              <p>{station.readiness}</p>
              {state.complete ? <div className={styles.completedRow}><span><Check size={16} /> You marked this station ready.</span><button type="button" disabled={!!busy || !ready} onClick={() => void toggle(readyId, false)}>Revisit this station</button></div> : <>
                <button type="button" className={styles.continueButton} disabled={!ready || !!busy || !state.unlocked || !allTasksDone} onClick={() => void toggle(readyId, true, true)}>{busy === readyId ? <Loader2 size={16} className={styles.spinner} /> : <Check size={16} />}I feel ready{index === stations.length - 1 ? " — move to mocks" : " — next station"}<ArrowRight size={16} /></button>
                {!allTasksDone && <span className={styles.readinessHint}>Complete the guides and questions above first.</span>}
              </>}
              <p className={styles.selfReview}>This is your own readiness check. Revisit and repeat any task whenever you need to.</p>
            </div>
          </div></div></div>
        </section>;
      })}
    </div>

    <section id="pathway-mocks" className={styles.mocks} data-ready={progress.allComplete} aria-labelledby="mocks-title">
      <span className={styles.mockIcon}><Flag size={23} /></span><div><p className={styles.eyebrow}>Bring it all together</p><h2 id="mocks-title">Your next chapter: mock interviews</h2>
        <p>{progress.allComplete ? "You have worked through all seven stations. Rehearse a mixed circuit, review your feedback and return to the areas that need another try." : "After all seven readiness checks, practise switching between stations in a timed mock interview."}</p>
        {progress.allComplete ? <><Link className={styles.continueButton} href="/medicforest/interview/ai-interviews?setup=mock">Set up a mock interview <ArrowRight size={16} /></Link><p className={styles.selfReview}>{isPremium ? "Choose your circuit and timings in the interview lobby." : "The room preview is free. AI-scored mock circuits require membership; you can also rehearse the question-bank tasks with a friend."}</p></> : <span className={styles.mocksLocked}><LockKeyhole size={13} /> {7 - progress.completedCount} stations to work through</span>}
      </div>
    </section>
  </div>;
}
