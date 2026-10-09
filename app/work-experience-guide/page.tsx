import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Experience Guide | MedWithRish",
  description: "Learn how to make the most of healthcare work experience and reflect on what you observe.",
  alternates: { canonical: "/work-experience-guide" },
};

import Link from "next/link";

const keyIdeas = [
  {
    title: "An anecdote tying in almost all good skills of a doctor",
    text: "In a medical Med interview, most questions within the category of 'motivatoin for medicine' involves using the STARR structure, which involves using an anecdote - you should remember a specific situation to use in a lot of these STARR structures. For example, was it a specific patient that was dealt with by the doctor you shadowed?",
  },
  {
    title: "You need to understand people, not just procedures",
    text: "Good work experience should help you understand communication, empathy, teamwork, pressure, responsibility, and patient-centred care.",
  },
  {
    title: "Quality beats quantity",
    text: "A few experiences reflected on well are usually stronger than many placements described vaguely. This links back to the anecdote - it should be unique and catches attention. This is how to stand out in your medical application.",
  },
];

const examples = [
  "Hospital or GP observation",
  "Dentist or orthodontist shadowing",
  "Care home volunteering",
  "Hospice volunteering",
  "Pharmacy or community healthcare exposure",
  "Online work experience programmes",
  "Charity work involving communication or responsibility",
];

const reflectionPrompts = [
  "What did I observe?",
  "Why did it matter?",
  "What did it teach me about medicine, dentistry, or healthcare?",
  "What skill or quality did it show was important?",
  "How did it affect the way I think about the profession?",
  "And for bonus points - How did I learn from it and apply it to improve?"
];

export default function WorkExperienceGuidePage() {
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
            Application Guide
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Work Experience Guide
          </h1>
          <p className="mt-2 text-xs font-medium text-slate-500 italic">by medwithrish, leading medical admissions tutor.</p>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Why do you do work experience within the hospital? How is it useful in the medical admissions process? What am I meant to learn or remember from medical work experience? There are many questions students have that they do cannot find the answer to easily. This guide covers what you do with your medical work experience.
          </p>
        </header>

        <div className="mt-6 space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              What work experience is actually for
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                Many students misunderstand work experience. They think the goal is
                to find the most impressive hospital, clinic, or consultant. In reality, you&apos;ll find medical work experience is generally used for your personal statement and in interviews, where for a lot of universities you can get through the admissions process with 0 work experience and still get an offer. For example - <em>What did you learn in your work experience?</em> You can answer using an example of virtual medical work experience, which can easily be found on the internet as quick courses.
              </p>

              <p>
                Besides the admissions process, it is used for you to see if the profession is actually one that suits you, from seeing firsthand what a doctor does.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              What matters most / What to remember
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
              Examples of useful experience
            </h2>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
              Useful experience does not have to be rare or prestigious. The best
              experiences are often the ones where you can observe communication,
              responsibility, care, and teamwork clearly.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {examples.map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              How to reflect properly
            </h2>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
              Reflection is what turns an experience into something useful. A weak
              reflection simply says what happened. A strong reflection explains
              why it mattered and what it taught you about the profession.
            </p>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-5">
              <h3 className="text-sm font-bold text-slate-900">
                Use these questions after each experience
              </h3>

              <ul className="mt-3.5 space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700">
                {reflectionPrompts.map((prompt) => (
                  <li key={prompt} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    <span>{prompt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              How to use work experience later
            </h2>

            <div className="mt-4 space-y-4 text-sm sm:text-base leading-relaxed text-slate-600">
              <p>
                Your work experience becomes useful later in two main places: your
                personal statement and your Med interview answers.
              </p>

              <p>
                In a personal statement, you might use one short example to show
                insight, reflection, or motivation. In interviews, there is usually a specific station about work experience, with questions generally being <em>&apos;What did you learn from your work experience?&apos; </em> or even <em>&apos;Why do you think medical schools usually ask you to undertake medical work experience?&apos; </em>. You can also use work
                experience to discuss communication, empathy, teamwork, ethical
                challenges, and the realities of patient care.
              </p>

              <p>
                The best applicants do not just say, “I saw a doctor communicate
                well.” They explain what made the communication effective and why
                that skill matters in healthcare.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
              Want help strengthening your application?
            </h2>

            <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
              Explore more resources on personal statements, UCAT preparation,
              interviews, and the full admissions journey.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/resources"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
              >
                Browse all resources
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