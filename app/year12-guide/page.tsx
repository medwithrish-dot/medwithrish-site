import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Year 12 Guide | MedWithRish",
  description: "Plan Year 12 study, predicted grades and preparation for medical and dental applications.",
  alternates: { canonical: "/year12-guide" },
};

import Link from "next/link";

const keyIdeas = [
  {
    title: "Predicted grades matter early",
    text: "Universities often screen applicants using predicted grades. Strong Year 12 performance helps teachers justify competitive predictions.",
  },
  {
    title: "A-Level consistency beats last-minute panic",
    text: "Medicine and dentistry applicants need strong predicted grades while also preparing UCAT, work experience, and applications.",
  },
  {
    title: "Year 12 is when strategy begins",
    text: "This is the year to start thinking about UCAT timing, work experience, university choices, and academic performance together.",
  },
];

const priorities = [
  "Secure strong topic understanding in Biology and Chemistry",
  "Keep organised notes and question banks from early in the year",
  "Speak to teachers about what is needed for strong predicted grades",
  "Plan UCAT preparation before the summer becomes too busy",
  "Begin work experience and reflection notes early",
];

export default function Year12GuidePage() {
  return (
    <main className="medwithrish-bg min-h-screen px-6 pb-20 pt-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link href="/resources" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to resources
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Application Guide
          </p>

          <h1 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
            Year 12 Guide
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Year 12 is one of the most important years for medicine and dentistry applicants. It shapes predicted grades, UCAT preparation, work experience, and the strength of your final application.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-sm font-bold text-blue-900">
              Need help securing strong A-Level performance?
            </p>

            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700">
              I offer A-Level tutoring focused on understanding, exam technique, and building the grades needed for competitive applications.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/alevel-tutoring"
                className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                A-Level tutoring
              </Link>

              <Link
                href="/ucat-timeline"
                className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-300 hover:text-blue-700"
              >
                UCAT prep timeline
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Why Year 12 matters so much
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                Medicine and dentistry applications happen earlier than many students expect. By the time you apply, universities will often be looking at predicted grades, UCAT score, work experience, and personal statement preparation.
              </p>

              <p>
                This means Year 12 is not just a “practice year.” It is the year where you build the evidence needed for a strong application.
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
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Year 12 priorities
            </h2>

            <ul className="mt-4 space-y-2.5 text-sm sm:text-base leading-relaxed text-slate-600">
              {priorities.map((priority) => (
                <li key={priority} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{priority}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Common mistake: focusing only on UCAT
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                UCAT is important, but it cannot compensate for predicted grades that do not meet entry requirements. Many students focus heavily on admissions tests while neglecting their A-Level performance.
              </p>

              <p>
                The strongest applicants manage both: strong academic performance and organised admissions preparation.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Want help with A-Level performance?
            </h2>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
              Strong predicted grades can make a huge difference to your medicine or dentistry application.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/alevel-tutoring"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                Explore A-Level tutoring
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