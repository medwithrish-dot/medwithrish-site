import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  MessageSquareText,
  Mic,
  Sparkles,
  Target,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest Interviews | 550+ free questions with markschemes",
  },
  description:
    "Start practising immediately with 550+ free medicine and dentistry interview questions and markschemes. No payment or subscription needed. Explore AI interviews and personalised preparation tools.",
  alternates: { canonical: "/interviews" },
};

const questionBankHref = "/medicforest/interview/question-bank";
const sampleHref = `${questionBankHref}?question=iq-01-001-motivation-for-medicine`;
const primaryButton =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#51edcf] px-6! py-3 text-sm! font-bold text-[#062b2c] transition-colors hover:bg-[#85f5df] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-500";
const features = [
  {
    title: "550+ free questions",
    text: "Build confidence across motivation, ethics, communication, NHS topics and more.",
    icon: BookOpen,
  },
  {
    title: "Free markschemes",
    text: "Review the key points behind a strong answer and see where you can improve.",
    icon: ClipboardCheck,
  },
  {
    title: "Realistic AI interviews",
    text: "Take your preparation further with timed stations and natural follow-up questions.",
    icon: Mic,
  },
  {
    title: "Personalised feedback",
    text: "Use AI interview feedback to understand your strengths and focus your next practice.",
    icon: Target,
  },
];
const steps = [
  {
    title: "Pick a question",
    text: "Open the free bank and choose a topic you want to work on. Start immediately.",
    icon: BookOpen,
  },
  {
    title: "Practise your answer",
    text: "Think it through, speak it aloud or write it down. Build a clear answer in your own words.",
    icon: MessageSquareText,
  },
  {
    title: "Learn from the markscheme",
    text: "Compare your answer with the marking points, reflect on the gaps and try again.",
    icon: ClipboardCheck,
  },
];

export default function InterviewsPage() {
  return (
    <MedicForestLandingShell>
      <div className="bg-white text-slate-950">
        <section className="relative overflow-hidden bg-[#071827] text-white">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-32 -top-40 h-[550px] w-[550px] rounded-full bg-teal-400/10 blur-3xl"
          />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6! py-14 xl:grid-cols-[1.05fr_1fr] xl:gap-12 xl:px-10 xl:py-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-teal-200">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Medicine
                &amp; dentistry interview preparation
              </p>
              <h1 className="mt-6 max-w-xl text-4xl! font-semibold leading-[1.12] tracking-tight sm:text-5xl! 2xl:text-6xl!">
                Your next chapter
                <br />
                starts with practice.
              </h1>
              <p className="mt-6 max-w-xl text-2xl! font-semibold leading-snug text-[#64f0d6] sm:text-3xl!">
                550+ FREE interview questions.
                <br />
                Markschemes included.
              </p>
              <p className="mt-5 max-w-lg text-base! leading-7! text-slate-300">
                Start practising right now, free of charge. Build stronger
                answers for your medicine or dentistry interview, one question
                at a time.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={questionBankHref} className={primaryButton}>
                  Start practising free{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/interviews/dashboard"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-500 px-5 py-3 text-sm! font-semibold text-white transition-colors hover:border-teal-300 hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-300"
                >
                  Explore the platform{" "}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
              <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs! text-slate-300">
                {[
                  "Instant access",
                  "No payment needed",
                  "Free question bank & markschemes",
                ].map((text) => (
                  <li key={text} className="flex items-center gap-2">
                    <CheckCircle2
                      className="h-4 w-4 shrink-0 text-teal-300"
                      aria-hidden="true"
                    />
                    {text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 rounded-2xl border border-teal-300/25 bg-white/5 p-2.5 shadow-2xl sm:p-3">
              <div className="overflow-hidden rounded-xl bg-white text-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                  <span className="flex items-center gap-2 text-sm! font-bold">
                    <BookOpen
                      className="h-4 w-4 text-teal-700"
                      aria-hidden="true"
                    />
                    Your interview practice
                  </span>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-800">
                    Free question bank
                  </span>
                </div>
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-medium text-slate-500">
                    <span>Personal &amp; Motivation</span>
                    <span className="flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                      Practise at your pace
                    </span>
                  </div>
                  <h2 className="mt-4 text-xl! font-semibold leading-snug tracking-tight sm:text-2xl!">
                    What has influenced your decision to pursue a career in
                    medicine?
                  </h2>
                  <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs! font-semibold text-slate-700">
                      Build your answer
                    </p>
                    <p className="mt-2 text-sm! leading-6! text-slate-500">
                      Think about your motivation, the experiences that shaped
                      it and what you learned.
                    </p>
                  </div>
                  <div className="mt-4 rounded-lg border border-teal-100 bg-[#f0faf7] p-4">
                    <p className="flex items-center gap-2 text-xs! font-bold text-teal-900">
                      <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                      Markscheme preview
                    </p>
                    <ul className="mt-3 space-y-2.5 text-xs! leading-5! text-slate-700">
                      {[
                        "Explain a personal, informed motivation.",
                        "Reflect on a specific experience and what it taught you.",
                        "Show a realistic understanding of a medical career.",
                      ].map((text) => (
                        <li key={text} className="flex gap-2">
                          <Check
                            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-700"
                            aria-hidden="true"
                          />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={sampleHref}
                    className="mt-5 flex min-h-11 items-center justify-between gap-3 rounded-lg bg-[#0a3238] px-4 py-3 text-sm! font-semibold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-600"
                  >
                    Practise this question free{" "}
                    <ArrowRight
                      className="h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                  <p className="mt-3 text-center text-[10px] text-slate-500">
                    Example question · Full markscheme available in the bank
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-b border-slate-200 bg-[#f4faf8]"
          aria-label="Free practice at a glance"
        >
          <div className="mx-auto grid max-w-7xl grid-cols-3 gap-3 px-6! py-7 text-center xl:px-10">
            {[
              ["550+", "Free interview questions"],
              ["£0", "Questions & markschemes"],
              ["Start now", "Immediate practice access"],
            ].map(([value, label]) => (
              <div
                key={value}
                className="border-r border-teal-900/10 last:border-0"
              >
                <p className="text-xl! font-semibold tracking-tight text-teal-900 sm:text-3xl!">
                  {value}
                </p>
                <p className="mt-1.5 text-[11px] leading-4! text-slate-600 sm:text-xs!">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6! py-14 xl:px-10 xl:py-16">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
              Purposeful preparation
            </p>
            <h2 className="mt-3 text-3xl! font-semibold tracking-tight">
              Better answers. Greater confidence.
            </h2>
            <p className="mt-4 text-sm! leading-7! text-slate-600">
              Start with the free questions and markschemes. Explore AI
              interviews and personalised preparation when you want to take your
              practice further.
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
            {features.map(({ title, text, icon: Icon }, index) => (
              <article
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  {index < 2 && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                      Always free
                    </span>
                  )}
                </div>
                <h3 className="mt-5 text-base! font-semibold">{title}</h3>
                <p className="mt-2 text-sm! leading-6! text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-6! py-14 xl:px-10 xl:py-16">
            <div className="text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-700">
                A clear place to start
              </p>
              <h2 className="mt-3 text-3xl! font-semibold tracking-tight">
                From your first question to a stronger answer.
              </h2>
              <p className="mt-4 text-sm! text-slate-600">
                Three simple steps. No subscription needed for the question
                bank.
              </p>
            </div>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {steps.map(({ title, text, icon: Icon }, index) => (
                <li key={title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0a3238] text-sm! font-semibold text-white">
                      {index + 1}
                    </span>
                    <div
                      aria-hidden="true"
                      className="h-px flex-1 bg-slate-200"
                    />
                    <Icon
                      className="h-5 w-5 text-teal-700"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-5 text-base! font-semibold">{title}</h3>
                  <p className="mt-2 text-sm! leading-6! text-slate-600">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-white px-6! py-12 xl:px-10">
          <div className="mx-auto max-w-7xl rounded-2xl bg-[#071827] px-6! py-12 text-center text-white sm:px-10">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-teal-300">
              Your next answer starts here
            </p>
            <h2 className="mx-auto mt-4 max-w-2xl text-3xl! font-semibold tracking-tight sm:text-4xl!">
              550+ free interview questions.
              <br />
              <span className="text-[#64f0d6]">Ready whenever you are.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm! leading-7! text-slate-300">
              Open the question bank, practise your answer and review the
              markscheme. All free of charge, with immediate access.
            </p>
            <Link href={questionBankHref} className={`mt-7 ${primaryButton}`}>
              Start practising free{" "}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <p className="mt-4 text-xs! text-slate-400">
              No payment. No subscription. Just practice.
            </p>
          </div>
        </section>
      </div>
    </MedicForestLandingShell>
  );
}
