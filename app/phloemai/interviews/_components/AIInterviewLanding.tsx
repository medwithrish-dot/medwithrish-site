import Link from "next/link";
import { ArrowRight, AudioLines, Mic, ShieldCheck } from "lucide-react";
import { UniversityCatalogue } from "../universities/UniversityCatalogue";
import styles from "./AIInterviewLanding.module.css";

export function AIInterviewLanding() {
  return (
    <div className={styles.landing}>
      <section className={styles.hero} aria-labelledby="practice-title">
        <div className={styles.freeVisual} aria-hidden="true"><span><AudioLines size={34} /></span></div>
        <div className={styles.freeCopy}>
          <p className={styles.eyebrow}>Try your AI interview for free</p>
          <h1 id="practice-title">Beat Medwithrish’s score of 96%</h1>
          <p className={styles.description}>Take the “Why medicine?” challenge. Meet your AI interviewer and get personalised feedback on your answer.</p>
          <div className={styles.freeMeta}><span><ShieldCheck size={14} /> No subscription needed</span><span>8 minutes</span><span>AI feedback included</span></div>
        </div>
        <Link href="/phloemai/interviews/ai-interviews?station=why-medicine" className={styles.primaryAction}><Mic size={18} aria-hidden="true" /> Try the free interview <ArrowRight size={18} aria-hidden="true" /></Link>
      </section>
      <UniversityCatalogue mode="practice" />
    </div>
  );
}
