"use client";

import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Maximize2, X } from "lucide-react";
import type { InterviewStimulus as Stimulus } from "../_data/interview-stimuli";
import styles from "./InterviewStimulus.module.css";

export function InterviewStimulus({ stimulus, question, presentation = false, slideLabel }: {
  stimulus: Stimulus;
  question?: string;
  presentation?: boolean;
  slideLabel?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const [failed, setFailed] = useState(false);
  const renderImage = (expanded: boolean) => <div className={expanded ? styles.expandedImage : styles.image}>
    {failed ? <p role="status">The image could not load. Read the same information in the text version below.</p> : <Image
      src={stimulus.src} alt={stimulus.title} fill unoptimized loading="eager"
      sizes={expanded ? "96vw" : "(max-width: 767px) 95vw, 65vw"}
      className={styles.picture} onError={() => setFailed(true)}
    />}
  </div>;
  const textVersion = <details className={styles.textVersion} open={failed || undefined}>
    <summary>Text version of the image</summary><p>{stimulus.description}</p>
  </details>;
  return <section className={`${styles.stimulus} ${presentation ? styles.presentation : ""}`} aria-label={`Station image: ${stimulus.title}`}>
    <div className={styles.heading}><div>{slideLabel && <span>{slideLabel}</span>}<h2>{stimulus.title}</h2></div>
      <button ref={openButton} type="button" onClick={() => dialog.current?.showModal()} aria-label={`Enlarge image: ${stimulus.title}`}><Maximize2 size={16} aria-hidden="true" /> Enlarge</button>
    </div>
    {renderImage(false)}
    {textVersion}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby={titleId} onClose={() => openButton.current?.focus()}>
      <div className={styles.dialogHeader}><h2 id={titleId}>{stimulus.title}</h2><button type="button" autoFocus onClick={() => dialog.current?.close()} aria-label="Close presentation"><X size={20} /></button></div>
      {question && <p className={styles.question}>{question}</p>}
      {renderImage(true)}
      {textVersion}
    </dialog>
  </section>;
}
