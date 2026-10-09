import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gateway and Foundation Courses Guide | MedWithRish",
  description: "Understand gateway and foundation routes into medicine and dentistry and their eligibility criteria.",
  alternates: { canonical: "/gateway-foundation-guide" },
};

import Link from "next/link";

const keyIdeas = [
  {
    title: "Gateway courses are not shortcuts",
    text: "Gateway and foundation courses still require strong commitment and academic performance. They exist to support widening participation students.",
  },
  {
    title: "Eligibility criteria matter",
    text: "Most gateway programmes require specific eligibility, such as attending certain schools or meeting widening participation criteria.",
  },
  {
    title: "They can lead to the same degree",
    text: "Gateway routes often lead into the same medicine or dentistry degrees as standard entry courses.",
  },
];

const eligibilityExamples = [
  "Widening participation eligibility",
  "Attending specific eligible schools",
  "Living in areas of lower university participation",
  "Being first in family to attend university",
  "Meeting contextual criteria set by universities",
];

export default function GatewayGuidePage() {
  return (
    <main className="medwithrish-bg min-h-screen px-6 pb-20 pt-10 text-slate-900">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/resources"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to resources
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Alternative Pathways
          </p>

          <h1 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl md:text-5xl">
            Gateway & Foundation Courses Guide
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Gateway and foundation courses offer alternative routes into
            medicine and dentistry for students who meet widening participation criteria.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/70 p-5">
            <p className="text-sm font-bold text-blue-900">
              Unsure whether gateway courses apply to you?
            </p>

            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-700">
              I help students understand eligibility requirements,
              alternative pathways, and realistic application strategies.
            </p>

            <Link
              href="/contact"
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              Get personalised advice
            </Link>
          </div>
        </header>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              What gateway courses are for
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                Gateway courses are designed to support students from
                underrepresented backgrounds who show strong potential.
              </p>

              <p>
                They provide additional academic preparation before entering
                standard medicine or dentistry programmes.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              What matters most
            </h2>

            <div className="mt-5 grid gap-4">
              {keyIdeas.map((item) => (
                <div key={item.title} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 border-l-4 border-l-blue-600">
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Common eligibility factors
            </h2>

            <ul className="mt-4 space-y-2.5 text-sm sm:text-base leading-relaxed text-slate-600">
              {eligibilityExamples.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
