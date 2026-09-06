import Link from "next/link";
import { ArrowRight, AudioLines, ChartNoAxesColumnIncreasing, MessageSquareText, Mic, MonitorPlay, SlidersHorizontal } from "lucide-react";
import { UniversityCatalogue } from "../universities/UniversityCatalogue";
import styles from "./AIInterviewLanding.module.css";

export function AIInterviewLanding() {
  return (
    <div className={styles.landing}>
      <section className={styles.hero} aria-labelledby="practice-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Real practice. Growing confidence.</p>
          <h1 id="practice-title">Your next step towards medical school.</h1>
          <p className={styles.description}>Your own interview room. Choose your stations, practise a conversation with your AI interviewer, and turn feedback into a stronger next answer.</p>
          <Link href="/phloemai/interviews/ai-interviews?setup=1" className={`${styles.primaryAction} ${styles.customAction}`}><SlidersHorizontal size={17} aria-hidden="true" /> Build your interview <ArrowRight size={17} aria-hidden="true" /></Link>
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
          <span className={styles.featuredNote}>Choose your sound and video settings before joining.</span>
        </aside>
      </section>
      <div className={styles.roomPreviewLink}><MonitorPlay size={23} aria-hidden="true" /><div><strong>Settle into your new practice space.</strong><p>A call-style room, a side transcript, optional camera, and a moment to reflect afterwards.</p></div><Link href="/phloemai/interviews/ai-interviews?setup=1">Explore the room <ArrowRight size={15} aria-hidden="true" /></Link></div>
      <UniversityCatalogue mode="practice" />
    </div>
  );
}
