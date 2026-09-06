import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Medical and Dental Admissions Resources | MedWithRish",
  description: "Explore UCAT tools, interview preparation, personal statement guides and tutoring resources.",
  alternates: { canonical: "/resources" },
};

import Link from "next/link";

const popularResources = [
  {
    title: "UCAT Tutoring",
    href: "/ucat-tutoring",
    description: "1-to-1 support for timing, accuracy, strategy, and score improvement.",
  },
  {
    title: "UCAT Prep Timeline",
    href: "/ucat-timeline",
    description: "A structured plan for when to start and how to prepare effectively.",
  },
  {
    title: "Medify Mock Difficulty Spreadsheet",
    href: "/ucat-mock-difficulty",
    description: "Compare mock difficulty, average section scores, totals, and SJT bands.",
  },
  {
    title: "Interview Prep Hub",
    href: "/interviews",
    description: "MMI, panel, ethics, motivation and reflection preparation.",
  },
];

const stages = [
  {
    number: "01",
    title: "GCSE Preparation",
    description: "Build strong academic foundations early.",
    resources: [
      { title: "GCSE Revision Guide", href: "/gcse-revision-guide" },
      { title: "GCSE Tutoring", href: "/gcse-tutoring" },
    ],
  },
  {
    number: "02",
    title: "Work Experience",
    description: "Understand what to learn from healthcare exposure.",
    resources: [{ title: "Work Experience Guide", href: "/work-experience-guide" }],
  },
  {
    number: "03",
    title: "Year 12 & Predicted Grades",
    description: "Secure strong predicted grades and prepare strategically.",
    resources: [
      { title: "Year 12 Guide", href: "/year12-guide" },
      { title: "A-Level Tutoring", href: "/alevel-tutoring" },
    ],
  },
  {
    number: "04",
    title: "UCAT Preparation",
    description: "Prepare for one of the most important selection stages.",
    resources: [
      { title: "UCAT Prep Timeline", href: "/ucat-timeline" },
      { title: "UCAT Tutoring", href: "/ucat-tutoring" },
      { title: "Medify Mock Difficulty Spreadsheet", href: "/ucat-mock-difficulty" },
      { title: "UCAT Notes", href: "https://payhip.com/Medwithrish", external: true },
    ],
  },
  {
    number: "05",
    title: "Personal Statements",
    description: "Plan, write, and refine your personal statement.",
    resources: [
      { title: "Personal Statements Guide", href: "/personal-statements-guide" },
      { title: "1-to-1 Personal Statement Session", href: "/personal-statement-session" },
      { title: "Medicine Personal Statement Review", href: "/?stage=05&scroll=ps-submission#journey" },
      { title: "Dental Personal Statement Review", href: "/?stage=05&scroll=ps-submission#journey" },
    ],
  },
  {
    number: "06",
    title: "Interviews",
    description: "Prepare for MMI and panel interviews with structure.",
    resources: [
      { title: "Medicine and Dentistry Interviews", href: "/interviews" },
      { title: "FREE Medicine Interview Guide", href: "https://payhip.com/Medwithrish", external: true },
      { title: "Interview Tutoring", href: "/interview-tutoring" },
    ],
  },
  {
    number: "07",
    title: "A-Levels & Final Offers",
    description: "Meet final offer conditions and finish strongly.",
    resources: [{ title: "A-Level Tutoring", href: "/alevel-tutoring" }],
  },
];

export default function ResourcesPage() {
  return (
    <main className="bg-[#f7fafe] px-6 py-14 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700"
        >
          ← Back to homepage
        </Link>

        <div className="mt-10 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Resources Library
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Resources organised by application stage
          </h1>

          <p className="mt-5 text-base leading-8 text-gray-600 md:text-lg">
            Find the most relevant guides, tutoring, and support depending on where you are in your medicine or dentistry application journey.
          </p>
        </div>

        <section className="mt-12 rounded-[2rem] border border-blue-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
                Most Popular Resources
              </p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900">
                Common places students start
              </h2>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {popularResources.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="rounded-2xl border border-gray-200 bg-[#fbfdff] p-5 transition hover:border-blue-300 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-600">{item.description}</p>
                <p className="mt-5 text-sm font-semibold text-blue-600">Open →</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <div className="border-l-4 border-blue-600 pl-4">
            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Browse by stage
            </h2>
            <p className="mt-2 text-gray-600">
              Follow the structure of the admissions journey.
            </p>
          </div>

          <div className="mt-8 space-y-5">
            {stages.map((stage) => (
              <div
                key={stage.number}
                className="rounded-[1.5rem] border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="grid gap-6 md:grid-cols-[180px_1fr]">
                  <div>
                    <p className="text-sm font-bold text-blue-600">
                      Stage {stage.number}
                    </p>
                    <h3 className="mt-2 text-xl font-bold text-gray-900">
                      {stage.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-gray-600">
                      {stage.description}
                    </p>
                  </div>

                  <div className="grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {stage.resources.map((resource) =>
                      resource.external ? (
                        <a
                          key={resource.title}
                          href={resource.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {resource.title}
                        </a>
                      ) : (
                        <Link
                          key={resource.title}
                          href={resource.href}
                          className="inline-flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {resource.title}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
