import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpen,
  Brain,
  Check,
  ClipboardCheck,
  Clock3,
  MessageSquareText,
  Mic,
  Sparkles,
  Stethoscope,
  Target,
  University,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest Interviews | AI medicine interview preparation",
  },
  description:
    "Practise medicine and dentistry interviews with AI stations, structured feedback, question banks and a personalised preparation plan.",
  alternates: {
    canonical: "/interviews",
  },
};

const platformHref = "/interviews/dashboard";

const features = [
  {
    title: "Realistic AI interviews",
    text: "Answer timed questions aloud in a focused interview room with natural follow-ups.",
    icon: Mic,
    style: "bg-cyan-50 text-cyan-700",
  },
  {
    title: "Actionable feedback",
    text: "See what was strong, what held the answer back and exactly how to improve it.",
    icon: MessageSquareText,
    style: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "University-focused prep",
    text: "Prepare for the formats and station styles used by the universities on your list.",
    icon: University,
    style: "bg-violet-50 text-violet-700",
  },
  {
    title: "A plan that adapts",
    text: "Turn your deadlines, completed practice and weaker areas into clear next steps.",
    icon: Target,
    style: "bg-amber-50 text-amber-700",
  },
] as const;

const journey = [
  {
    step: "01",
    title: "Tell Forest where you are applying",
    text: "Add your universities and interview dates so your dashboard can prioritise the right preparation.",
    icon: University,
  },
  {
    step: "02",
    title: "Practise under interview conditions",
    text: "Use AI interviews, the question bank and concise guides to build confident, structured answers.",
    icon: Mic,
  },
  {
    step: "03",
    title: "Review, improve and repeat",
    text: "Use feedback and progress insights to target the skills most likely to lift your next performance.",
    icon: BarChart3,
  },
] as const;

export default function InterviewsPage() {
  return (
    <MedicForestLandingShell>
      <div className="bg-white">
        <section className="overflow-hidden bg-[#050b1f] text-white">
          <div className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
            <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_0.8fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-cyan-200">
                  <Stethoscope className="h-3.5 w-3.5" aria-hidden="true" />
                  AI medicine interview preparation
                </div>

                <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Walk into your interview{" "}
                  <span className="text-cyan-400">ready.</span>
                </h1>

                <p className="mt-4 max-w-xl text-lg font-bold leading-snug text-white sm:text-xl">
                  Personalised medicine and dentistry interview practice, from
                  your first answer to your final offer.
                </p>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
                  Practise realistic stations, get clear feedback and follow a
                  preparation plan shaped around your universities and dates.
                </p>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={platformHref}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 text-sm font-bold text-white shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-500"
                  >
                    Log in / Launch Interview Platform
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <Link
                    href={`${platformHref}#your-next-step`}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-5 text-sm font-bold text-cyan-100 transition-colors hover:border-cyan-200 hover:bg-cyan-400/20"
                  >
                    <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                    See my preparation plan
                  </Link>
                </div>

                <div className="mt-7 grid max-w-2xl gap-4 sm:grid-cols-3">
                  {[
                    ["1", "Set up", "Add your universities and key dates."],
                    ["2", "Practise", "Complete realistic interview stations."],
                    ["3", "Improve", "Act on feedback and track progress."],
                  ].map(([step, title, text], index) => (
                    <div
                      key={step}
                      className={`flex gap-2.5 ${
                        index < 2 ? "sm:border-r sm:border-white/10 sm:pr-4" : ""
                      }`}
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-black text-white">
                        {step}
                      </span>
                      <div>
                        <h2 className="text-xs font-bold text-white">{title}</h2>
                        <p className="mt-1 text-[11px] leading-4 text-slate-300">
                          {text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-400/35 bg-slate-950/70 p-4 shadow-2xl shadow-cyan-950/20">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-600 text-white">
                      <Sparkles className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white">
                        Interview feedback
                      </h2>
                      <p className="text-[11px] text-slate-400">
                        Communication station
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-right">
                    <p className="text-lg font-black text-cyan-300">78%</p>
                    <p className="text-[10px] text-slate-400">Strong answer</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-200">
                    <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                    What worked
                  </div>
                  <ul className="mt-2 space-y-1.5 text-[11px] leading-4 text-slate-100">
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-300" aria-hidden="true" />
                      You acknowledged the patient&apos;s concern early.
                    </li>
                    <li className="flex gap-2">
                      <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-300" aria-hidden="true" />
                      Your explanation was clear and free from jargon.
                    </li>
                  </ul>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-200">
                      <Target className="h-4 w-4" aria-hidden="true" />
                      Next focus
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-slate-100">
                      Ask one open question before moving into solutions.
                    </p>
                  </div>
                  <div className="rounded-xl border border-violet-400/25 bg-violet-500/10 p-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-violet-200">
                      <Clock3 className="h-4 w-4" aria-hidden="true" />
                      Delivery
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-slate-100">
                      Good pace. Leave a little more time for your summary.
                    </p>
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-cyan-400/25 bg-cyan-500/10 p-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-200">
                    <Brain className="h-4 w-4" aria-hidden="true" />
                    Your next task
                  </div>
                  <p className="mt-2 text-[11px] leading-4 text-slate-100">
                    Complete one empathy station, then review the SPIKES guide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
              Everything in one place
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              More than a list of interview questions
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Build the knowledge, delivery and confidence needed to perform
              when the pressure is real.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full ${feature.style}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {feature.text}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.62fr_1fr] lg:items-start">
              <div>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-800">
                  <BookOpen className="h-5 w-5" aria-hidden="true" />
                </div>
                <h2 className="mt-4 text-2xl font-black text-slate-950">
                  A clear route from preparation to performance
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Your dashboard brings practice, feedback and priorities
                  together, so you always know what to do next.
                </p>
              </div>

              <ol className="grid gap-3">
                {journey.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li
                      key={item.step}
                      className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f7f5] text-[#08787b]">
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
                          Step {item.step}
                        </p>
                        <h3 className="mt-1 text-sm font-black text-slate-950">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-xs leading-5 text-slate-600">
                          {item.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-10 lg:px-8">
          <div className="overflow-hidden rounded-2xl bg-[#063b37] px-6 py-8 text-center text-white shadow-xl sm:px-10">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cyan-200">
              <Stethoscope className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-2xl font-black">
              Make your next answer count.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-teal-50/80">
              Open your personalised interview dashboard and start preparing for
              the universities that matter to you.
            </p>
            <Link
              href={platformHref}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-black text-[#063b37] transition-colors hover:bg-cyan-50"
            >
              Go to Interviews Dashboard
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </MedicForestLandingShell>
  );
}
