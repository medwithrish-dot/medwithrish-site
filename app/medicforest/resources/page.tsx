import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: "Resources | MedicForest",
  description:
    "Free medical admissions resources — UCAT guides, interview prep, personal statement help and more.",
  alternates: { canonical: "/resources" },
};

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
    title: "UCAT Mock Difficulty",
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
    resources: [{ title: "GCSE Revision Guide", href: "/gcse-revision-guide" }],
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
    resources: [{ title: "Year 12 Guide", href: "/year12-guide" }],
  },
  {
    number: "04",
    title: "UCAT Preparation",
    description: "Prepare for one of the most important selection stages.",
    resources: [
      { title: "UCAT Prep Timeline", href: "/ucat-timeline" },
      { title: "UCAT Tutoring", href: "/ucat-tutoring" },
      { title: "UCAT Mock Difficulty Spreadsheet", href: "/ucat-mock-difficulty" },
      {
        title: "UCAT Notes",
        href: "https://payhip.com/Medwithrish",
        external: true,
      },
    ],
  },
  {
    number: "05",
    title: "Personal Statements",
    description: "Plan, write, and refine your personal statement.",
    resources: [
      { title: "Personal Statements Guide", href: "/personal-statements-guide" },
    ],
  },
  {
    number: "06",
    title: "Interviews",
    description: "Prepare for MMI and panel interviews with structure.",
    resources: [
      { title: "Medicine & Dentistry Interviews", href: "/interviews" },
      {
        title: "FREE Medicine Interview Guide",
        href: "https://payhip.com/Medwithrish",
        external: true,
      },
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
    <MedicForestLandingShell>
      <div className="min-h-screen bg-[#f7faf9] px-5 py-12 sm:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Resources Library
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#0d2c2e] sm:text-5xl">
              Resources organised by application stage
            </h1>
            <p className="mt-5 text-base leading-8 text-[#4a6568]">
              Find the most relevant guides, tutoring, and support depending on where you are in
              your medicine or dentistry application journey.
            </p>
          </div>

          {/* Popular */}
          <section className="mt-10 rounded-2xl border border-teal-100 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
              Most Popular
            </p>
            <h2 className="mt-2 text-xl font-bold text-[#0d2c2e]">
              Common places students start
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {popularResources.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group rounded-xl border border-gray-200 bg-[#f9fdfb] p-5 transition hover:border-teal-300 hover:shadow-md"
                >
                  <h3 className="text-base font-semibold text-[#0d2c2e] group-hover:text-teal-700">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#4a6568]">{item.description}</p>
                  <p className="mt-4 flex items-center gap-1 text-sm font-semibold text-teal-700">
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </p>
                </Link>
              ))}
            </div>
          </section>

          {/* Browse by stage */}
          <section className="mt-12">
            <div className="border-l-4 border-teal-600 pl-4">
              <h2 className="text-2xl font-bold text-[#0d2c2e]">Browse by stage</h2>
              <p className="mt-1 text-sm text-[#4a6568]">
                Follow the structure of the admissions journey.
              </p>
            </div>

            <div className="mt-6 space-y-4">
              {stages.map((stage) => (
                <div
                  key={stage.number}
                  className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="grid gap-4 md:grid-cols-[160px_1fr]">
                    <div>
                      <p className="text-xs font-bold text-teal-700">Stage {stage.number}</p>
                      <h3 className="mt-1 text-lg font-bold text-[#0d2c2e]">{stage.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#4a6568]">{stage.description}</p>
                    </div>
                    <div className="flex flex-wrap items-start gap-2">
                      {stage.resources.map((resource) =>
                        resource.external ? (
                          <a
                            key={resource.title}
                            href={resource.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                          >
                            {resource.title}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <Link
                            key={resource.title}
                            href={resource.href}
                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
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
      </div>
    </MedicForestLandingShell>
  );
}
