import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Statements Guide | MedWithRish",
  description: "Plan and refine your medicine or dentistry personal statement with guidance on structure and reflection.",
  alternates: { canonical: "/personal-statements-guide" },
};

import Link from "next/link";

const keyIdeas = [
  {
    title: "Reflection matters more than listing",
    text: "A strong personal statement does not simply list activities. It explains what you learned and why that learning matters for medicine or dentistry.",
  },
  {
    title: "Use specific examples",
    text: "Vague claims like 'I am empathetic' are weak. Specific examples from work experience, volunteering, or responsibility are more convincing.",
  },
  {
    title: "Avoid sounding generic",
    text: "Many statements use the same phrases. Strong statements feel personal, precise, and reflective without being dramatic.",
  },
];

const mistakes = [
  "Starting with a cliché childhood story",
  "Listing too many experiences without reflection",
  "Overusing generic words like passionate, caring, and hardworking",
  "Trying to sound impressive instead of sounding genuine",
  "Not linking experiences back to medicine or dentistry",
];

export default function PersonalStatementsGuidePage() {
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
            Personal Statements Guide
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            A personal statement should show motivation, reflection, and suitability. It should not be a list of achievements or a dramatic story about why you want to study medicine or dentistry.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-sm font-bold text-blue-900">
              Need help improving your personal statement?
            </p>

            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700">
              Dedicated 1-to-1 personal statement support and review to improve structure, reflection, clarity, and application strength.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/personal-statement-session"
                className="inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                Personal statement session
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              What a personal statement is actually for
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                For medicine, many universities do not heavily score the personal statement. However, it can still matter for certain universities and may be used as a discussion point at Med interview.
              </p>

              <p>
                For dentistry, the personal statement can be more important because universities often want clearer evidence that you understand dentistry specifically and are not treating it as a backup option.
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
              {mistakes.map((mistake) => (
                <li key={mistake} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{mistake}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              How to make it stronger
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                A strong paragraph usually includes an experience, a reflection, and a link back to the course. The reflection is the most important part.
              </p>

              <p>
                Instead of saying “I learned communication is important,” explain what made the communication effective and why it matters in healthcare.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Want feedback on your personal statement?
            </h2>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
              Personal statement feedback can help improve structure, remove generic writing, and make your reflections stronger.
            </p>

            <div className="mt-5">
              <Link
                href="/personal-statement-session"
                className="inline-flex rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                Book PS support
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}