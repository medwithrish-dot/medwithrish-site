import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UCAT Preparation Timeline | MedWithRish",
  description: "Plan your UCAT preparation with a structured timeline for learning strategies, practice and mock exams.",
  alternates: { canonical: "/ucat-timeline" },
};

import Link from "next/link";

const keyIdeas = [
  {
    title: "UCAT rewards strategy, not just intelligence",
    text: "The UCAT is not a normal school exam. It tests timing, pattern recognition, decision-making, reading speed, and accuracy under pressure.",
  },
  {
    title: "Techniques should be question-type specific",
    text: "Each section contains different question types. You should learn different techniques for each and every type, then choose the fastest method that works for you.",
  },
  {
    title: "Timed sets build real improvement",
    text: "Doing small timed sets repeatedly is one of the best ways to improve accuracy and speed without becoming overwhelmed.",
  },
];

const prepStages = [
  {
    title: "Weeks 1 + 2 - Learn the question types",
    text: "Use free resources (like passmedicine) first to understand what each section looks like. The goal is not speed yet. The goal is familiarity.",
  },
  {
    title: "Weeks 3 + 4 - Learn techniques",
    text: "Move to a question bank such as Medify or MedEntry. Learn methods for each question type and test which method is fastest for you.",
  },
  {
    title: "Final 30 days - Mock exams and weak areas",
    text: "Aim to complete regular full mocks, track scores in a spreadsheet, and focus heavily on weak question types. The strategy to targeting weak areas is HIGHLY IMPORTANT. Scroll down for more. ",
  },
];

const highImpactTips = [
  "Master the online calculator, including M+, M-, and MRC - This is what Medwithrish owes 890/900 in his QR section to.",
  "Practise triaging: skip difficult questions quickly and return later.",
  "Learn to ignore useless information, especially in Quantitative Reasoning.",
  "Use 8-minute timed sets to improve individual question types until you see generally 85%+.",
  "Save official UCAT mocks for the final stage of preparation.",
  "If scores remain low close to the exam, consider rescheduling if possible.",
];

export default function UCATTimelinePage() {
  return (
    <main className="bg-white px-6 pb-20 pt-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/resources"
          className="text-sm font-semibold text-blue-600 hover:underline"
        >
          ← Back to resources
        </Link>

        <header className="mt-10 border-b border-gray-200 pb-10">
         
        
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            UCAT Guide
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            UCAT Prep Timeline
          </h1>

          <p className="mt-5 text-lg leading-8 text-gray-700">
            Most UCAT improvement does not come from simply doing more questions.
            It comes from learning the right techniques, applying them under time
            pressure, and reviewing mistakes properly.
          </p>

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">
            <p className="text-sm font-semibold text-blue-700">
              Want structured UCAT preparation support?
            </p>

            <p className="mt-2 text-sm leading-6 text-gray-700">
              Many students improve fastest when they learn section strategies,
              practise with feedback, and follow a clear timeline. You can
              access my UCAT notes or book UCAT tutoring below.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/ucat-tutoring"
                className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                UCAT tutoring
              </Link>

              <a
                href="https://payhip.com/Medwithrish"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:border-blue-300 hover:text-blue-700"
              >
                View UCAT notes
              </a>
            </div>
          </div>
        </header>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            When should you book your UCAT?
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              A sensible target is usually <strong>late August or early September</strong>,
              ideally before school starts becoming busy again.
            </p>

            <p>
              This gives you the summer to prepare properly while still leaving
              some flexibility if you need to adjust your test date.
            </p>
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            A realistic 8-week UCAT preparation strategy
          </h2>

          <p className="mt-5 text-base leading-8 text-gray-700">
            Around <strong>8 weeks</strong> is a good preparation length for many
            students. It gives enough time to learn the exam, build techniques,
            practise timing, and complete mocks before the test. In this time, you can track your scores too.
          </p>
<section className="border-b border-gray-200 py-10">

  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-7">

    <h2 className="text-2xl font-bold text-gray-900">
      Free UCAT Score Tracker Spreadsheet
    </h2>

    <p className="mt-3 text-base leading-7 text-gray-700">
      Track mock scores, identify weak sections, and monitor improvement
      across your UCAT preparation.
    </p>

  

    <a
      href="/downloads/MedWithRish_UCAT_Score_Tracker.xlsx"
      download
      className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700"
    >
      Download UCAT Tracker
    </a>

  </div>

</section>
          <div className="mt-8 space-y-8">
            {prepStages.map((stage) => (
              <div key={stage.title} className="border-l-4 border-blue-600 pl-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  {stage.title}
                </h3>

                <p className="mt-2 text-base leading-7 text-gray-700">
                  {stage.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            What matters most
          </h2>

          <div className="mt-6 grid gap-5">
            {keyIdeas.map((item) => (
              <div key={item.title} className="border-l-4 border-blue-600 pl-5">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>

                <p className="mt-2 text-base leading-7 text-gray-700">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            How to practise each question type
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              Each UCAT section contains different question types. For example,
              Verbal Reasoning includes question styles such as true / false /
              cannot tell and author agreement questions. Decision Making
              includes syllogisms, probability, logic, and interpreting
              information.
            </p>

            <p>
              You should have a technique for each question type. In Decision
              Making syllogisms, for example, some students prefer Venn diagrams
              while others prefer arrow methods. The best method is the one that
              gives you the highest accuracy in the shortest time.
            </p>

            <p>
              A useful approach is to practise <strong>8-minute timed sets</strong>{" "}
              repeatedly for one question type until you are consistently scoring
              around <strong>85%+</strong>.
            </p>
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            The final 30 days
          </h2>

          <div className="mt-5 space-y-5 text-base leading-8 text-gray-700">
            <p>
              In the final month, many students benefit from doing regular mock
              exams and tracking scores carefully. You could aim for roughly one
              mock per day if you have enough time and stamina.
            </p>

            <p>
              Keep a spreadsheet of your scores. Track total scores, section
              scores, and weak question types. This helps you avoid guessing
              what to revise.
            </p>

            <p>
              In strong sections, aim as high as possible. In weaker sections,
              focus on the specific question types causing the most mistakes.
            </p>
          </div>
        </section>

        <section className="border-b border-gray-200 py-10">
          <h2 className="text-2xl font-bold text-gray-900">
            High-impact UCAT tips
          </h2>

          <ul className="mt-6 space-y-4 text-base leading-7 text-gray-700">
            {highImpactTips.map((tip) => (
              <li key={tip} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="py-10">
          <div className="rounded-2xl border border-blue-100 bg-[#f7fafe] p-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Want help improving your UCAT preparation?
            </h2>

            <p className="mt-3 text-base leading-7 text-gray-700">
              If you are struggling with timing, strategy, weak sections, or
              consistency, UCAT tutoring can help you build a clearer plan and
              improve faster.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ucat-tutoring"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                Get UCAT tutoring
              </Link>

              <a
                href="https://payhip.com/Medwithrish"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition hover:border-blue-300 hover:text-blue-700"
              >
                View UCAT notes
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}