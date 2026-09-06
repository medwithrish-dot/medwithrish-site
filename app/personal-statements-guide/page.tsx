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
    <main className="bg-white px-6 pb-20 pt-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/resources" className="text-sm font-semibold text-blue-600 hover:underline">
          ← Back to resources
        </Link>

        <header className="mt-10 border-b border-gray-200 pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Application Guide
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Personal Statements Guide
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-700">
            A personal statement should show motivation, reflection, and suitability. It should not be a list of achievements or a dramatic story about why you want to study medicine or dentistry.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">
            <p className="text-sm font-semibold text-blue-700">
              Need help improving your personal statement?
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              I offer 1-to-1 personal statement support and review to improve structure, reflection, clarity, and application strength.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/personal-statement-session"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Personal statement session
              </Link>

              <Link
                href="/?stage=05&scroll=ps-submission#journey"
                className="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-700"
              >
                Submit for review
              </Link>
            </div>
          </div>
        </header>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            What a personal statement is actually for
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              For medicine, many universities do not heavily score the personal statement. However, it can still matter for certain universities and may be used as a discussion point at interview.
            </p>

            <p>
              For dentistry, the personal statement can be more important because universities often want clearer evidence that you understand dentistry specifically and are not treating it as a backup option.
            </p>
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">What matters most</h2>

          <div className="mt-6 grid gap-5">
            {keyIdeas.map((item) => (
              <div key={item.title} className="border-l-4 border-blue-600 pl-5">
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-base leading-7 text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">Common mistakes</h2>

          <ul className="mt-5 space-y-3 text-base leading-7 text-gray-700">
            {mistakes.map((mistake) => (
              <li key={mistake} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{mistake}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            How to make it stronger
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              A strong paragraph usually includes an experience, a reflection, and a link back to the course. The reflection is the most important part.
            </p>

            <p>
              Instead of saying “I learned communication is important,” explain what made the communication effective and why it matters in healthcare.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="rounded-2xl border border-blue-100 bg-[#f7fafe] p-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Want feedback on your personal statement?
            </h2>

            <p className="mt-3 text-base leading-7 text-gray-700">
              Personal statement feedback can help improve structure, remove generic writing, and make your reflections stronger.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/personal-statement-session"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Book PS support
              </Link>

              <Link
                href="/?stage=05&scroll=ps-submission#journey"
                className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                Submit for review
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}