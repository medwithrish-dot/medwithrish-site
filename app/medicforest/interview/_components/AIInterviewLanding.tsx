import Link from "next/link";
import { ArrowRight, AudioLines, BookOpenCheck, Mic, RotateCcw, ShieldCheck } from "lucide-react";
import { interviewHistory } from "@/utils/interviews/history";
import { UniversityCatalogue } from "../universities/UniversityCatalogue";
import styles from "./AIInterviewLanding.module.css";

export async function AIInterviewLanding() {
  const { attempts } = await interviewHistory();
  const completed = attempts.filter((attempt) => attempt.status === "completed" && attempt.completedAt);
  const recentUniversityAttempts: Record<string, { href: string; completedAt: string }> = {};
  for (const attempt of completed) {
    if (!attempt.universitySlug || recentUniversityAttempts[attempt.universitySlug]) continue;
    recentUniversityAttempts[attempt.universitySlug] = {
      href: `/medicforest/interview/reports/${encodeURIComponent(attempt.id)}`,
      completedAt: attempt.completedAt!,
    };
  }
  const freeAttempt = completed.find((attempt) => attempt.mode === "free" && attempt.stationSlug === "why-medicine");

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
        {freeAttempt ? <div className={styles.heroActions}>
          <Link href={`/medicforest/interview/reports/${encodeURIComponent(freeAttempt.id)}`} className={styles.primaryAction}><BookOpenCheck size={18} aria-hidden="true" /> Review last attempt <ArrowRight size={18} aria-hidden="true" /></Link>
          <Link href="/medicforest/interview/ai-interviews?station=why-medicine" className={styles.retryAction}><RotateCcw size={15} aria-hidden="true" /> Retry the challenge</Link>
        </div> : <Link href="/medicforest/interview/ai-interviews?station=why-medicine" className={styles.primaryAction}><Mic size={18} aria-hidden="true" /> Try the free interview <ArrowRight size={18} aria-hidden="true" /></Link>}
      </section>
      <UniversityCatalogue mode="practice" recentAttempts={recentUniversityAttempts} />
    </div>
  );
}
