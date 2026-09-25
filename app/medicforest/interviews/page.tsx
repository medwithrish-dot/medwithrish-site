import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  AudioLines,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Mic,
  Phone,
  Sparkles,
  Target,
  TreeDeciduous,
  VideoOff,
  Zap,
} from "lucide-react";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest Interviews | 550+ free questions with markschemes",
  },
  description:
    "Start practising immediately with 550+ free medicine and dentistry interview questions and markschemes. No payment or subscription needed. Explore AI interviews and personalised preparation tools.",
  alternates: { canonical: "/interviews" },
};

const bankHref = "/medicforest/interview/question-bank";
const platformHref = "/interviews/dashboard";
const sampleHref = `${bankHref}?question=iq-01-001-motivation-for-medicine`;
const features = [
  {
    title: "550+ free questions",
    text: "Practise medicine and dentistry interview questions across a wide range of topics and station styles.",
    icon: BookOpen,
    tone: "blue",
  },
  {
    title: "Markschemes included",
    text: "Know what makes a strong answer. Review clear marking points after every practice question.",
    icon: FileText,
    tone: "green",
  },
  {
    title: "Realistic AI interviews",
    text: "Go further with natural, timed interviews, live transcripts and structured marking criteria.",
    icon: AudioLines,
    tone: "purple",
  },
  {
    title: "Personalised feedback",
    text: "Understand your strengths, find areas to improve and put your AI interview feedback into practice.",
    icon: Target,
    tone: "gold",
  },
];
const steps = [
  {
    title: "Choose",
    text: "Open the free question bank and pick a topic or question. No payment or subscription needed.",
    icon: ClipboardCheck,
  },
  {
    title: "Practise",
    text: "Build your answer in your own words. Speak it aloud or write it down, at your own pace.",
    icon: Mic,
  },
  {
    title: "Improve",
    text: "Review the free markscheme, spot what you missed and make your next answer stronger.",
    icon: BarChart3,
  },
];

function Brand() {
  return (
    <span className={styles.brand}>
      <TreeDeciduous aria-hidden="true" />
      <span>
        Medic<span>Forest</span>
      </span>
    </span>
  );
}

function Waves() {
  return (
    <svg
      className={styles.waves}
      viewBox="0 0 1440 600"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: 12 }, (_, i) => (
        <path
          key={i}
          d={`M-100 ${410 + i * 12} C 220 ${130 + i * 13}, 320 ${740 - i * 9}, 710 ${340 + i * 10} S 1110 ${90 + i * 17}, 1540 ${215 + i * 12}`}
          stroke="currentColor"
          strokeWidth="0.8"
        />
      ))}
    </svg>
  );
}

function PracticeLinks() {
  return (
    <div className={styles.actions}>
      <Link className={styles.primary} href={bankHref}>
        Start free interview practice{" "}
        <ArrowRight size={18} aria-hidden="true" />
      </Link>
      <Link className={styles.secondary} href={platformHref}>
        Launch platform <ExternalLink size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}

function InterviewPreview() {
  return (
    <div className={styles.previewWrap}>
      <div className={styles.preview}>
        <div className={styles.previewBar}>
          <Brand />
          <span className={styles.previewLabel}>Platform preview</span>
        </div>
        <div className={styles.room}>
          <div className={styles.roomHeading}>
            <div>
              <h2>Background to medicine</h2>
              <p>
                Station 1 of 7 <span>&middot;</span> AI interview
              </p>
            </div>
            <span className={styles.timer}>
              <Clock3 size={16} aria-hidden="true" />
              5:01
            </span>
          </div>
          <div className={styles.roomGrid}>
            <div className={styles.call}>
              <div className={styles.callTiles}>
                <div className={styles.candidateTile}>
                  <div className={styles.audioCircle}>
                    <Mic size={30} strokeWidth={1.3} aria-hidden="true" />
                  </div>
                  <div>
                    <strong>Your answer</strong>
                    <span>
                      Voice practice <VideoOff size={12} aria-hidden="true" />
                    </span>
                  </div>
                </div>
                <div className={styles.aiTile}>
                  <div className={styles.aiCircle}>
                    <AudioLines
                      size={35}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <strong>AI interviewer</strong>
                    <span>
                      MedicForest <i />
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.listening}>
                {Array.from({ length: 17 }, (_, i) => (
                  <span key={i} />
                ))}
              </div>
              <p className={styles.callCaption}>
                Space to think. Confidence to answer.
              </p>
              <div className={styles.callControls} aria-hidden="true">
                <span>
                  <Mic size={21} />
                </span>
                <span>
                  <VideoOff size={21} />
                </span>
                <span>
                  <Phone size={21} />
                </span>
              </div>
            </div>
            <div className={styles.transcript}>
              <div className={styles.tabs}>
                <span>
                  <FileText size={12} aria-hidden="true" />
                  Live transcript
                </span>
                <span>Notes</span>
              </div>
              <div className={styles.message}>
                <span className={styles.speaker}>
                  <AudioLines size={15} aria-hidden="true" />
                  AI interviewer
                </span>
                <p>
                  What has influenced your decision to pursue a career in
                  medicine?
                </p>
              </div>
              <div className={styles.message}>
                <span className={styles.speaker}>
                  <Mic size={14} aria-hidden="true" />
                  Your answer
                </span>
                <p>
                  My interest developed through volunteering, where I saw how
                  careful listening can make a difference to a patient...
                </p>
              </div>
              <span className={styles.transcriptNote}>
                <span />A conversation, built around you
              </span>
            </div>
          </div>
        </div>
        <div className={styles.previewFooter}>
          <CheckCircle2 size={13} aria-hidden="true" />
          Realistic stations <span>&middot;</span> Structured feedback{" "}
          <span>&middot;</span> Clear next steps
        </div>
      </div>
    </div>
  );
}

export default function InterviewsPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main-content">
        Skip to content
      </a>
      <header className={styles.header}>
        <div className={styles.navbar}>
          <Link href="/medicforest" aria-label="MedicForest home">
            <Brand />
          </Link>
          <nav className={styles.desktopNav} aria-label="Main navigation">
            <Link
              className={styles.activeNav}
              href="/interviews"
              aria-current="page"
            >
              Interviews
            </Link>
            <a href="#features">Features</a>
            <Link href="/pricing">Pricing</Link>
            <Link href="/ucat">UCAT</Link>
            <Link href="/resources">
              Resources <ChevronDown size={13} aria-hidden="true" />
            </Link>
          </nav>
          <div className={styles.accountLinks}>
            <Link className={styles.signIn} href="/medicforest/account">
              Sign in
            </Link>
            <Link className={styles.navCta} href={bankHref}>
              Start free <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          <Link href="/interviews" aria-current="page">
            Interviews
          </Link>
          <a href="#features">Features</a>
          <Link href="/pricing">Pricing</Link>
          <Link href="/ucat">UCAT</Link>
          <Link href="/resources">Resources</Link>
        </nav>
      </header>

      <main id="main-content">
        <section className={styles.hero}>
          <Waves />
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrowPill}>
                <Sparkles size={17} aria-hidden="true" />
                <span>Medicine &amp; dentistry interview preparation</span>
              </p>
              <h1>
                Medicine and Dentistry interview practice,
                <br />
                <span>made for you.</span>
              </h1>
              <p className={styles.heroDescription}>
                Realistic practice, clear markschemes and personalised AI
                feedback. Feel more confident at your medical or dental school
                interviews.
              </p>
              <div className={styles.freePromise}>
                <BookOpen size={22} aria-hidden="true" />
                <p>
                  <strong>
                    550+ FREE interview questions with markschemes.
                  </strong>
                  <span>
                    Start practising immediately. Completely free of charge.
                  </span>
                </p>
              </div>
              <PracticeLinks />
              <ul className={styles.heroChecks}>
                {[
                  "Instant access",
                  "Free questions & markschemes",
                  "No payment needed",
                ].map((text) => (
                  <li key={text}>
                    <CheckCircle2 size={17} aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
            <InterviewPreview />
          </div>
        </section>

        <section
          id="features"
          className={styles.features}
          aria-label="Interview preparation features"
        >
          <div className={`${styles.container} ${styles.featureGrid}`}>
            {features.map(({ title, text, icon: Icon, tone }) => (
              <article className={styles.feature} data-tone={tone} key={title}>
                <span className={styles.featureIcon}>
                  <Icon size={25} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.how}>
          <div className={styles.container}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>
                A clearer path to interview success
              </p>
              <h2>How it works</h2>
              <p>
                From your first question to a more confident answer &mdash; in
                three free steps.
              </p>
            </div>
            <ol className={styles.steps}>
              {steps.map(({ title, text, icon: Icon }, index) => (
                <li key={title}>
                  <div className={styles.stepIcon}>
                    <span>{index + 1}</span>
                    <Icon size={32} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.freeBank}>
          <div className={`${styles.container} ${styles.bankGrid}`}>
            <div>
              <p className={styles.eyebrow}>
                A strong start. Without the cost.
              </p>
              <h2>
                550+ questions.
                <br />
                One less thing to worry about.
              </h2>
              <p className={styles.bankDescription}>
                Your interview preparation starts here. Open the question bank,
                choose a topic and practise with a markscheme to guide you.
              </p>
              <div className={styles.stats}>
                <div>
                  <strong>550+</strong>
                  <span>Free questions</span>
                </div>
                <div>
                  <strong>&pound;0</strong>
                  <span>With markschemes</span>
                </div>
                <div>
                  <strong>Right now</strong>
                  <span>Start practising</span>
                </div>
              </div>
            </div>
            <article className={styles.questionCard}>
              <div className={styles.questionHeader}>
                <span>TRY YOUR FIRST QUESTION</span>
                <span>FREE</span>
              </div>
              <h3>
                What has influenced your decision to pursue a career in
                medicine?
              </h3>
              <p>Personal &amp; Motivation</p>
              <div className={styles.markingPreview}>
                <span>
                  <ClipboardCheck size={17} aria-hidden="true" />
                  Inside the markscheme
                </span>
                <ul>
                  <li>
                    <Check size={15} aria-hidden="true" />
                    Explain a personal, informed motivation.
                  </li>
                  <li>
                    <Check size={15} aria-hidden="true" />
                    Reflect on experience and what you learned.
                  </li>
                  <li>
                    <Check size={15} aria-hidden="true" />
                    Show insight into a career in medicine.
                  </li>
                </ul>
              </div>
              <Link href={sampleHref}>
                Practise this question free{" "}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </article>
          </div>
        </section>

        <section className={styles.closing}>
          <Waves />
          <div className={styles.container}>
            <p className={styles.eyebrow}>Ready to practise?</p>
            <h2>Start your free interview practice today</h2>
            <p>
              Get immediate access to 550+ FREE interview questions with
              markschemes.
              <br />
              No subscription. No payment. Just open the bank and start.
            </p>
            <PracticeLinks />
            <ul className={styles.closingChecks}>
              <li>
                <CreditCard size={19} aria-hidden="true" />
                No payment required
              </li>
              <li>
                <Zap size={19} aria-hidden="true" />
                Instant access
              </li>
              <li>
                <ClipboardCheck size={19} aria-hidden="true" />
                Free markschemes included
              </li>
            </ul>
          </div>
        </section>
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <Link href="/medicforest">
            <Brand />
          </Link>
          <p>Prepare with purpose.</p>
          <Link href="/privacy-policy">Privacy</Link>
          <Link href="/terms-and-conditions">Terms</Link>
        </div>
      </footer>
    </div>
  );
}
