import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  MessageSquare,
  Scale,
  Stethoscope,
  Timer,
  Users,
} from "lucide-react";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Medicine and Dentistry Interviews | MedWithRish",
  description:
    "Prepare for medicine and dentistry interviews with MMI strategy, panel interview guidance, ethics, motivation, reflection and practice structure.",
  alternates: {
    canonical: "/interviews",
  },
};

const interviewFormats = [
  {
    title: "MMI stations",
    text: "Short stations testing communication, ethics, prioritisation, reflection and decision-making under pressure.",
    icon: Timer,
  },
  {
    title: "Panel interviews",
    text: "Longer conversations where motivation, personal statement details, work experience and insight often matter more.",
    icon: Users,
  },
  {
    title: "Role play",
    text: "Scenarios where empathy, clarity, listening and adapting your tone are usually more important than perfect wording.",
    icon: MessageSquare,
  },
];

const coreAreas = [
  {
    title: "Motivation",
    text: "Why medicine or dentistry, why now, and what evidence proves you understand the career.",
    icon: Stethoscope,
  },
  {
    title: "Ethics",
    text: "Autonomy, capacity, confidentiality, consent, justice, safety and professional responsibility.",
    icon: Scale,
  },
  {
    title: "Reflection",
    text: "What you learned from work experience, volunteering, setbacks and responsibility.",
    icon: Brain,
  },
  {
    title: "Communication",
    text: "Clear structure, warmth, active listening and answering the exact question asked.",
    icon: HeartHandshake,
  },
];

const prepSystem = [
  "Build an evidence bank from work experience, volunteering, reading, leadership and personal examples.",
  "Turn each example into a short reflection: what happened, what you learned, and why it matters in healthcare.",
  "Practise timed stations so answers become calm and structured without sounding memorised.",
  "Review every answer for specificity, maturity, patient focus and actual reflection.",
];

const commonMistakes = [
  "Memorising scripts that collapse when the question changes.",
  "Giving generic motivation answers that could apply to any applicant.",
  "Forgetting to explain both sides of an ethical issue before giving a judgement.",
  "Listing work experience instead of reflecting on what it taught you.",
  "Speaking too quickly and losing structure under pressure.",
];

const quickLinks = [
  {
    title: "Free interview guide",
    text: "Open the MedWithRish interview guide and notes library.",
    href: "https://payhip.com/Medwithrish",
    external: true,
  },
  {
    title: "Interview tutoring",
    text: "Get 1-to-1 MMI or panel interview feedback.",
    href: "/interview-tutoring",
  },
  {
    title: "Contact",
    text: "Ask about interview support or resources.",
    href: "/contact",
  },
];

export default function InterviewsPage() {
  return (
    <main className="min-h-screen bg-[#f7fafe] text-gray-900">
      <Navbar />

      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[1fr_360px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
              Interview preparation
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-950 md:text-6xl">
              Medicine and Dentistry Interviews
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-gray-700 md:text-lg">
              A focused prep hub for MMI, panel, ethics, motivation,
              reflection and communication. Use this before jumping into
              tutoring or the free guide.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://payhip.com/Medwithrish"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Free interview guide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                href="/interview-tutoring"
                className="inline-flex h-12 items-center justify-center rounded-lg border border-gray-200 bg-white px-5 text-sm font-bold text-gray-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                Interview tutoring
              </Link>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-[#fbfdff] p-4 shadow-sm">
            <Image
              src="/rish-profile.jpg"
              alt="Rish from MedWithRish"
              width={360}
              height={360}
              className="aspect-square w-full rounded-lg object-cover"
              priority
            />
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-black text-blue-700">
              {["MMI", "Panel", "Ethics"].map((label) => (
                <span key={label} className="rounded-lg bg-blue-50 px-3 py-2">
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {interviewFormats.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <Icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-bold text-gray-950">
                  {item.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {item.text}
                </p>
              </article>
            );
          })}
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <ClipboardCheck className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-950">
                A simple prep system
              </h2>
            </div>
            <div className="mt-6 space-y-4">
              {prepSystem.map((item) => (
                <div key={item} className="flex gap-3">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-blue-600"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-7 text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-blue-600" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-gray-950">
                Core areas to prepare
              </h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {coreAreas.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-lg bg-[#f7fafe] p-4">
                    <Icon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                    <h3 className="mt-3 text-sm font-bold text-gray-950">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-950">
            Common mistakes to avoid
          </h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {commonMistakes.map((mistake) => (
              <div
                key={mistake}
                className="flex gap-3 rounded-lg border border-gray-100 bg-[#fbfdff] p-4"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <p className="text-sm leading-6 text-gray-700">{mistake}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-lg bg-gray-950 p-6 text-white shadow-sm md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_420px] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">
                Next steps
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                Pick the support you need
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300 md:text-base">
                Use the free guide if you want a starting framework. Use
                tutoring if you want direct feedback on your answers and station
                technique.
              </p>
            </div>
            <div className="grid gap-3">
              {quickLinks.map((item) =>
                item.external ? (
                  <a
                    key={item.title}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-white p-4 text-gray-950 transition hover:bg-blue-50"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-bold">
                      {item.title}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-gray-600">
                      {item.text}
                    </span>
                  </a>
                ) : (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="rounded-lg bg-white p-4 text-gray-950 transition hover:bg-blue-50"
                  >
                    <span className="flex items-center justify-between gap-3 text-sm font-bold">
                      {item.title}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-gray-600">
                      {item.text}
                    </span>
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
