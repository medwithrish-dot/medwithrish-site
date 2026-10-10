"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { InterviewStimulus as Stimulus } from "../_data/interview-stimuli";
import styles from "./InterviewStimulus.module.css";

export function InterviewStimulus({ stimulus, presentation = false, slideLabel }: {
  stimulus: Stimulus;
  question?: string;
  presentation?: boolean;
  slideLabel?: string;
}) {
  const imageId = useId();
  const [imageOpen, setImageOpen] = useState(presentation);
  const [failed, setFailed] = useState(false);
  const image = <div id={imageId} className={styles.image}>
    {failed ? <p role="status">The image could not load. Read the same information in the text version below.</p> : <Image
      src={stimulus.src} alt={stimulus.title} fill unoptimized loading="eager"
      sizes="(max-width: 767px) 95vw, 65vw"
      className={styles.picture} onError={() => setFailed(true)}
    />}
  </div>;
  const textVersion = <details className={styles.textVersion} open={failed || undefined}>
    <summary>Text version of the image</summary><p>{stimulus.description}</p>
  </details>;
  return <section className={`${styles.stimulus} ${presentation ? styles.presentation : ""}`} aria-label={`Station image: ${stimulus.title}`}>
    <div className={styles.heading}><div>{slideLabel && <span>{slideLabel}</span>}<h2>{stimulus.title}</h2></div>
      <button type="button" aria-expanded={imageOpen} aria-controls={imageId} onClick={() => setImageOpen((open) => !open)}>
        {imageOpen ? <><ChevronUp size={16} aria-hidden="true" /> Collapse image</> : <><ChevronDown size={16} aria-hidden="true" /> Open image</>}
      </button>
    </div>
    {imageOpen && <>{image}<a className={styles.fullSize} href={stimulus.src} target="_blank" rel="noreferrer">View full-size image (opens a new tab)</a></>}
    {textVersion}
  </section>;
}
