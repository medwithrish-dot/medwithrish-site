import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Brain,
  Check,
  Clock3,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  UserRound,
} from "lucide-react";
import styles from "./MedicForestMarketingLanding.module.css";

const insightCards = [
  {
    title: "Timing patterns",
    text: "See where time is leaking away and which habits are affecting your accuracy.",
    icon: Clock3,
  },
  {
    title: "Confidence signals",
    text: "Understand when uncertainty and answer changes are costing you marks.",
    icon: Activity,
  },
  {
    title: "AI diagnosis",
    text: "Find the behaviour behind each mistake, not only the correct answer.",
    icon: Brain,
  },
  {
    title: "A focused next step",
    text: "Turn every attempt into one practical recommendation for your next session.",
    icon: Target,
  },
];

const pathways = [
  {
    title: "UCAT preparation",
    label: "Private preview",
    text: "Question banks, timed mocks, AI diagnostics and a personal study plan.",
    href: "/medicforest/ucat/dashboard",
    icon: Brain,
  },
  {
    title: "Medicine interviews",
    label: "Private preview",
    text: "Realistic MMI practice, answer feedback and university-specific preparation.",
    href: "/medicforest/interview/dashboard",
    icon: MessageSquareText,
  },
  {
    title: "Dentistry interviews",
    label: "Coming later",
    text: "Dentistry-specific stations and structured confidence-building practice.",
    href: null,
    icon: UserRound,
  },
];

const freeFeatures = [
  "A short UCAT diagnostic",
  "Core question-bank access",
  "A clear issue and strength summary",
  "A practical next-step recommendation",
];

const premiumFeatures = [
  "Full UCAT mocks and mock diagnostics",
  "Deeper AI feedback and study tasks",
  "Progress tracking across your practice",
  "Daily personalised diagnostic support",
];

export function MedicForestMarketingLanding() {
  return (
    <div className={styles.page}>
      <section className={styles.hero} aria-labelledby="medicforest-title">
        <div className={styles.heroGlow} aria-hidden="true" />
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              <Sparkles aria-hidden="true" />
              Medical admissions, made more personal
            </p>
            <h1 id="medicforest-title">
              Meet <span>MedicForest.</span>
            </h1>
            <p className={styles.heroLead}>
              Preparation that shows you why you lose marks—and what to do next.
            </p>
            <p className={styles.heroBody}>
              MedicForest brings UCAT practice and medicine interview preparation
              into one focused platform, with feedback shaped around how you
              actually perform.
            </p>

            <div className={styles.heroActions}>
              <Link href="/medicforest/ucat/dashboard" className={styles.primaryAction}>
                Explore UCAT preparation
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/medicforest/interview/dashboard"
                className={styles.secondaryAction}
              >
                Explore interview preparation
              </Link>
            </div>

            <div className={styles.previewNote}>
              <LockKeyhole aria-hidden="true" />
              Both preparation platforms are currently in private preview.
            </div>
          </div>

          <div className={styles.diagnosisPanel} aria-label="Example AI diagnosis">
            <div className={styles.panelHeader}>
              <div>
                <p>MedicForest insight</p>
                <h2>Your practice diagnosis</h2>
              </div>
              <span><i /> Live analysis</span>
            </div>

            <div className={styles.issuePanel}>
              <div className={styles.issueIcon}>
                <TimerReset aria-hidden="true" />
              </div>
              <div>
                <p>Priority issue</p>
                <h3>Timing drift in data-heavy questions</h3>
                <span>You spent 18 seconds over target after re-reading the stem.</span>
              </div>
            </div>

            <div className={styles.signalGrid}>
              <div>
                <p>Confidence</p>
                <strong>Low</strong>
                <span>3 late answer changes</span>
              </div>
              <div>
                <p>Strength</p>
                <strong>Triaging</strong>
                <span>Difficult items identified early</span>
              </div>
            </div>

            <div className={styles.nextStep}>
              <span><Target aria-hidden="true" /> Recommended next step</span>
              <p>Complete a seven-minute QR set, reading the question before the stem.</p>
            </div>
          </div>
        </div>

        <div className={styles.heroSteps} aria-label="How MedicForest works">
          {[
            ["01", "Practise", "Complete a focused, timed set."],
            ["02", "Understand", "See the habits behind your result."],
            ["03", "Improve", "Follow a precise next step."],
          ].map(([number, title, text]) => (
            <div key={number}>
              <span>{number}</span>
              <p><strong>{title}</strong>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="insights-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>Beyond right and wrong</p>
            <h2 id="insights-title">Feedback with something useful to say.</h2>
          </div>
          <p>
            Ordinary question banks tell you the answer. MedicForest helps you
            recognise the pattern, then gives you a practical way to fix it.
          </p>
        </div>

        <div className={styles.insightGrid}>
          {insightCards.map(({ title, text, icon: Icon }) => (
            <article key={title} className={styles.insightCard}>
              <Icon aria-hidden="true" />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>

        <div className={styles.comparison}>
          <div className={styles.comparisonMuted}>
            <p>Standard feedback</p>
            <h3>“The correct answer is C.”</h3>
            <span>A result, without the reason behind it.</span>
          </div>
          <div className={styles.comparisonArrow} aria-hidden="true">
            <ArrowRight />
          </div>
          <div className={styles.comparisonActive}>
            <p>MedicForest feedback</p>
            <h3>You changed from the correct answer after over-investing in a distractor.</h3>
            <span>Now you know what happened and what to practise next.</span>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.pathwaySection}`} aria-labelledby="pathways-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.kicker}>One preparation platform</p>
            <h2 id="pathways-title">Choose where you want to improve.</h2>
          </div>
          <p>
            UCAT and medicine interview preparation use the same clear,
            evidence-led approach. Access remains limited while we finish the platform.
          </p>
        </div>

        <div className={styles.pathwayGrid}>
          {pathways.map(({ title, label, text, href, icon: Icon }) => {
            const content = (
              <>
                <div className={styles.pathwayTop}>
                  <span className={styles.pathwayIcon}><Icon aria-hidden="true" /></span>
                  <span className={href ? styles.previewBadge : styles.soonBadge}>
                    {href && <LockKeyhole aria-hidden="true" />}
                    {label}
                  </span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className={styles.pathwayAction}>
                  {href ? "View preparation area" : "In development"}
                  {href && <ArrowRight aria-hidden="true" />}
                </span>
              </>
            );

            return href ? (
              <Link key={title} href={href} className={styles.pathwayCard}>
                {content}
              </Link>
            ) : (
              <article key={title} className={`${styles.pathwayCard} ${styles.disabledCard}`}>
                {content}
              </article>
            );
          })}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="pricing-title">
        <div className={styles.pricingIntro}>
          <p className={styles.kicker}>Start simply</p>
          <h2 id="pricing-title">Try the core tools before you upgrade.</h2>
          <p>No card is needed for the free diagnostic.</p>
        </div>

        <div className={styles.pricingGrid}>
          <article className={styles.priceCard}>
            <div className={styles.priceHeader}>
              <div>
                <p>Free diagnostic</p>
                <strong>£0</strong>
              </div>
              <span>Start here</span>
            </div>
            <ul>
              {freeFeatures.map((feature) => (
                <li key={feature}><Check aria-hidden="true" /> {feature}</li>
              ))}
            </ul>
            <Link href="/medicforest/ucat/dashboard" className={styles.primaryAction}>
              Start free diagnostic <ArrowRight aria-hidden="true" />
            </Link>
          </article>

          <article className={`${styles.priceCard} ${styles.premiumCard}`}>
            <div className={styles.priceHeader}>
              <div>
                <p>MedicForest Premium</p>
                <strong>£14.99 <small>/ month</small></strong>
              </div>
              <span>Full preparation</span>
            </div>
            <ul>
              {premiumFeatures.map((feature) => (
                <li key={feature}><Check aria-hidden="true" /> {feature}</li>
              ))}
            </ul>
            <Link href="/medicforest/pricing" className={styles.secondaryPriceAction}>
              Compare plans <ArrowRight aria-hidden="true" />
            </Link>
          </article>
        </div>
      </section>

      <section className={styles.trustBand} aria-label="MedicForest commitments">
        {[
          [ShieldCheck, "Private by design", "Only the practice data needed for your feedback is used."],
          [BarChart3, "Clear evidence", "See what each recommendation is based on."],
          [BadgeCheck, "Built with applicants", "Designed around the realities of admissions preparation."],
        ].map(([Icon, title, text]) => (
          <div key={String(title)}>
            <Icon aria-hidden="true" />
            <p><strong>{String(title)}</strong>{String(text)}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
