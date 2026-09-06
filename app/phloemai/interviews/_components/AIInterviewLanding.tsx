import Link from "next/link";
import { ArrowRight, AudioLines, ChartNoAxesColumnIncreasing, MessageSquareText, Mic } from "lucide-react";
import { UniversityCatalogue } from "../universities/UniversityCatalogue";
import styles from "./AIInterviewLanding.module.css";

export function AIInterviewLanding() {
  return (
    <div className={styles.landing}>
      <section className={styles.hero} aria-labelledby="practice-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Real practice. Growing confidence.</p>
          <h1 id="practice-title">Your next step towards medical school.</h1>
          <p className={styles.description}>Practise AI interviews for your target universities, get personalised feedback, and make every answer count.</p>
          <div className={styles.benefits}>
            <span><Mic size={18} aria-hidden="true" /> University-specific practice</span>
            <span><MessageSquareText size={18} aria-hidden="true" /> Actionable feedback</span>
            <span><ChartNoAxesColumnIncreasing size={18} aria-hidden="true" /> Track your progress</span>
          </div>
        </div>
        <aside className={styles.featured} aria-labelledby="free-interview-title">
          <div className={styles.featuredTop}><span className={styles.freeBadge}>FREE INTERVIEW</span><AudioLines size={26} aria-hidden="true" /></div>
          <h2 id="free-interview-title">Why medicine?</h2>
          <p>A classic first question. Practise your answer and get AI feedback, free.</p>
          <Link href="/phloemai/interviews/ai-interviews?station=why-medicine" className={styles.primaryAction}><Mic size={18} aria-hidden="true" /> Start free interview <ArrowRight size={18} aria-hidden="true" /></Link>
          <span className={styles.featuredNote}>A little practice is a great place to start.</span>
        </aside>
      </section>
      <UniversityCatalogue mode="practice" />
    </div>
  );
}
