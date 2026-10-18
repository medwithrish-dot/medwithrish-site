import Link from "@/app/medicforest/_components/MedicForestLink";
import { FeatureActionLink } from "@/app/medicforest/_components/FeatureActionLink";
import { ArrowRight, AudioLines, BookOpenCheck, Mic, RotateCcw, ShieldCheck } from "lucide-react";
import { interviewHistory } from "@/utils/interviews/history";
import { getMedicForestEntitlements } from "@/utils/medicforest/premium-access";
import { UniversityCatalogue } from "../universities/UniversityCatalogue";
import styles from "./AIInterviewLanding.module.css";
import { WHY_MEDICINE_SECONDS } from "../_lib/why-medicine-challenge";

export async function AIInterviewLanding() {
  const { attempts } = await interviewHistory();
  const { isPremium } = await getMedicForestEntitlements();
  const completed = attempts.filter((attempt) => attempt.status === "completed" && attempt.completedAt);
  const recentUniversityAttempts: Record<string, { href: string; completedAt: string }> = {};
  for (const attempt of completed) {
    if (!attempt.universitySlug || recentUniversityAttempts[attempt.universitySlug]) continue;
    recentUniversityAttempts[attempt.universitySlug] = {
      href: `/medicforest/interview/reports/${encodeURIComponent(attempt.id)}`,
      completedAt: attempt.completedAt!,
    };
  }
  const freeAttempt = attempts.find((attempt) => attempt.stationSlug === "why-medicine"
    && (attempt.mode === "free" || (attempt.mode === "station" && attempt.stationSeconds === WHY_MEDICINE_SECONDS))
    && attempt.completedAt && (attempt.status === "completed" || attempt.status === "submitted" || attempt.status === "grading"
      || (attempt.status === "failed" && attempt.answerSubmittedAt)));

  return (
    <div className={styles.landing}>
      <section className={styles.hero} aria-labelledby="practice-title">
        <div className={styles.freeVisual} aria-hidden="true"><span><AudioLines size={34} /></span></div>
        <div className={styles.freeCopy}>
          <p className={styles.eyebrow}>Try your AI Med interview for free</p>
          <h1 id="practice-title">Beat Medwithrish’s score of 96%</h1>
          <p className={styles.description}>Take the “Why medicine?” challenge. Meet your AI interviewer and get personalised feedback on your answer.</p>
          <div className={styles.freeMeta}><span><ShieldCheck size={14} /> No subscription needed</span><span>3 minutes</span><span>AI feedback included</span></div>
        </div>
        {freeAttempt ? <div className={styles.heroActions}>
          <Link href={`/medicforest/interview/reports/${encodeURIComponent(freeAttempt.id)}`} className={styles.primaryAction}><BookOpenCheck size={18} aria-hidden="true" /> Review answer <ArrowRight size={18} aria-hidden="true" /></Link>
          {isPremium && <FeatureActionLink tier="premium" feature="Why Medicine? practice" href="/medicforest/interview/ai-interviews?station=why-medicine" className={styles.retryAction}><RotateCcw size={15} aria-hidden="true" /> Retry the challenge</FeatureActionLink>}
        </div> : <FeatureActionLink tier="trial" feature="Why Medicine? practice" href="/medicforest/interview/ai-interviews?station=why-medicine" className={styles.primaryAction}><Mic size={18} aria-hidden="true" /> Try the free Med interview <ArrowRight size={18} aria-hidden="true" /></FeatureActionLink>}
      </section>
      <UniversityCatalogue mode="practice" recentAttempts={recentUniversityAttempts} />
    </div>
  );
}
