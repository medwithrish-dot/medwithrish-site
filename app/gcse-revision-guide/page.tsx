import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GCSE Revision Guide | MedWithRish",
  description: "Explore practical GCSE revision strategies, planning and exam preparation.",
  alternates: { canonical: "/gcse-revision-guide" },
};

import Link from "next/link";

const keyIdeas = [
  {
    title: "Start with the specification",
    text: "The specification tells you exactly what can be tested. Use it as a checklist so your revision is focused rather than random.",
  },
  {
    title: "Past papers are essential",
    text: "GCSE success is not just about knowing content. You need to understand how marks are awarded and how to structure answers under timed conditions.",
  },
  {
    title: "Weak topics need active fixing",
    text: "Do not just reread notes. Identify weak topics, practise questions on them, mark them carefully, and return to them later.",
  },
];

const commonMistakes = [
  "Only reading notes instead of testing yourself",
  "Avoiding difficult topics until too late",
  "Not using mark schemes properly",
  "Leaving exam technique until the final few weeks",
  "Revising subjects you already enjoy while ignoring weak areas",
];

export default function GCSERevisionGuidePage() {
  return (
    <main className="medwithrish-bg min-h-screen px-6 pb-20 pt-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/resources" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to resources
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            GCSE Guide
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            GCSE Revision Guide
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            GCSEs are the academic foundation for medicine and dentistry. Strong grades can help keep more university options open, especially for competitive courses that still consider GCSE performance.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-sm font-bold text-blue-900">
              Need help improving GCSE grades?
            </p>

            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700">
              I offer GCSE tutoring focused on science understanding, exam technique, and building strong revision habits early.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/gcse-tutoring"
                className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                GCSE tutoring
              </Link>

              <Link
                href="/resources"
                className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-300 hover:text-blue-700"
              >
                Browse resources
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              What GCSE revision is actually for
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                GCSE revision is not about making perfect notes. The goal is to build secure knowledge and become good at answering exam questions accurately.
              </p>

              <p>
                For medicine and dentistry, GCSEs matter because they help form the academic base for A-Levels. Some universities also use GCSEs directly when shortlisting applicants.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">What matters most</h2>

            <div className="mt-5 grid gap-4">
              {keyIdeas.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 border-l-4 border-l-blue-600">
                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">Common mistakes</h2>

            <ul className="mt-4 space-y-2.5 text-sm sm:text-base leading-relaxed text-slate-600">
              {commonMistakes.map((mistake) => (
                <li key={mistake} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">How to revise properly</h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                Start by identifying what you do not know. Use your specification, topic tests, and past papers to find weak areas.
              </p>

              <p>
                Then use active recall, exam questions, and careful marking. The improvement comes from correcting mistakes, not just doing more work.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Want help with GCSE revision?
            </h2>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
              If you need structured support, GCSE tutoring can help improve weak topics, exam confidence, and revision technique.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/gcse-tutoring"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                Explore GCSE tutoring
              </Link>

              <Link
                href="/contact"
                className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:text-blue-700"
              >
                Contact me
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}