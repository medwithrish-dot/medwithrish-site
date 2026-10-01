import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  GraduationCap,
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Stethoscope,
  Target,
  UserCheck,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";
import { FREE_INTERVIEW_GUIDE_URL, MEDWITHRISH_NOTES_URL } from "@/utils/medwithrish/site-links";

export const metadata: Metadata = {
  title: "Admissions Resources & Revision Guides | MedicForest",
  description:
    "Free medical admissions resources — UCAT guides, free Medicine interview guide, personal statement support and 1–to–1 coaching.",
  alternates: { canonical: "/resources" },
};

const popularResources = [
  {
    title: "UCAT Mock Difficulty Spreadsheet",
    href: "/ucat-mock-difficulty",
    badge: "Free Tool",
    description: "Compare mock difficulty across Medify, MedEntry and official tests with average scores and SJT bands.",
    icon: FileSpreadsheet,
  },
  {
    title: "Med Interview Prep Hub",
    href: "/interviews",
    badge: "550+ Questions",
    description: "Full question bank, marking criteria, MMI stations, ethical scenarios and structured practice.",
    icon: MessageSquare,
  },
  {
    title: "UCAT Prep Timeline",
    href: "/ucat-timeline",
    badge: "Free Guide",
    description: "A week–by–week roadmap of when to start revision, select mocks and pace your practice effectively.",
    icon: Calendar,
  },
  {
    title: "1–to–1 Tutoring & Coaching",
    href: "/medicforest/tutoring",
    badge: "1–to–1 Coaching",
    description: "Intensive 4–hour crash courses with Rish and MedicForest specialists for UCAT, PS and Interviews.",
    icon: UserCheck,
  },
];

type ResourceItem = {
  title: string;
  href: string;
  tag?: string;
  description?: string;
  external?: boolean;
  featured?: boolean;
};

type StageItem = {
  number: string;
  title: string;
  badge: string;
  description: string;
  resources: ResourceItem[];
};

const stages: StageItem[] = [
  {
    number: "01",
    title: "GCSE Preparation",
    badge: "Early Academic Base",
    description: "Build strong GCSE grades early — essential for meeting strict medical school entry screening requirements.",
    resources: [
      {
        title: "GCSE Revision Guide",
        href: "/gcse-revision-guide",
        tag: "Study Strategy",
        description: "Subject breakdowns, high–yield revision techniques and scheduling rules.",
      },
      {
        title: "GCSE 1–to–1 Tutoring",
        href: "/gcse-tutoring",
        tag: "Private Tuition",
        description: "Targeted subject tuition to secure Grade 8s and 9s.",
      },
    ],
  },
  {
    number: "02",
    title: "Work Experience & Exposure",
    badge: "Clinical Insight",
    description: "Learn how to secure meaningful shadowing, volunteering and GP placements to draw genuine reflections from.",
    resources: [
      {
        title: "Work Experience & Shadowing Guide",
        href: "/work-experience-guide",
        tag: "Application Insight",
        description: "What medical schools look for in healthcare exposure and reflection diary templates.",
      },
      {
        title: "Alternative Healthcare Pathways Guide",
        href: "/related-careers-guide",
        tag: "Career Options",
        description: "Overview of related healthcare degrees, graduate entry and clinical professions.",
      },
    ],
  },
  {
    number: "03",
    title: "Year 12 & Predicted Grades",
    badge: "UCAS Benchmark",
    description: "Secure AAA/A*AA predictions and master Year 12 exams so you can focus fully on your UCAT and UCAS application.",
    resources: [
      {
        title: "Year 12 Medical Preparation Guide",
        href: "/year12-guide",
        tag: "Milestone Checklist",
        description: "Term–by–term breakdown of everything to complete during Year 12.",
      },
      {
        title: "A–Level 1–to–1 Tutoring",
        href: "/alevel-tutoring",
        tag: "Direct Tuition",
        description: "Focused A–Level Biology, Chemistry and Maths coaching to secure top predictions.",
      },
    ],
  },
  {
    number: "04",
    title: "UCAT Preparation",
    badge: "Aptitude Testing",
    description: "Strategies for Verbal Reasoning, Decision Making, Quantitative Reasoning and Situational Judgement.",
    resources: [
      {
        title: "UCAT Preparation Timeline",
        href: "/ucat-timeline",
        tag: "Free Revision Plan",
        description: "Structured 6–to–10 week schedule balancing question drills and full mock practice.",
      },
      {
        title: "UCAT Mock Difficulty Spreadsheet",
        href: "/ucat-mock-difficulty",
        tag: "Interactive Tool",
        description: "Benchmark Medify, MedEntry and official mock score distributions.",
      },
      {
        title: "1–to–1 UCAT Crash Courses & Tuition",
        href: "/medicforest/tutoring",
        tag: "1–to–1 Tuition",
        description: "Intensive 4–hour subtest coaching with timing shortcuts and mental arithmetic tricks.",
      },
      {
        title: "MedWithRish UCAT Study Notes",
        href: MEDWITHRISH_NOTES_URL,
        tag: "Notes & Flashcards",
        description: "High–yield Decision Making frameworks, syllogism trees and cheat sheets.",
        external: true,
      },
    ],
  },
  {
    number: "05",
    title: "Personal Statements",
    badge: "Written Application",
    description: "Brainstorming, draft structuring and line–by–line refinement to ensure your reflection stands out cleanly.",
    resources: [
      {
        title: "Personal Statement Complete Guide",
        href: "/personal-statements-guide",
        tag: "Drafting Guide",
        description: "Structure breakdown, model opening paragraphs and common pitfalls to avoid.",
      },
      {
        title: "1–to–1 Personal Statement Review Session",
        href: "/personal-statement-session",
        tag: "1–to–1 Review",
        description: "Comprehensive line–by–line feedback, structural edits and paragraph polish.",
      },
    ],
  },
  {
    number: "06",
    title: "Med Interviews",
    badge: "Selection & Offers",
    description: "Realistic MMI station frameworks, panel answer structures, NHS hot topics and ethical scenario breakdown.",
    resources: [
      {
        title: "FREE Medicine MMI & Interview Guide",
        href: FREE_INTERVIEW_GUIDE_URL,
        tag: "★ Featured Free Guide",
        description: "Comprehensive guide with ethical station frameworks, NHS hot topics and model reflections.",
        external: true,
        featured: true,
      },
      {
        title: "Med Interview Prep Hub",
        href: "/interviews",
        tag: "Question Bank & Hub",
        description: "550+ free practice questions, detailed markschemes, station timers and strategy.",
      },
      {
        title: "1–to–1 Med Interview Tutoring",
        href: "/medicforest/tutoring",
        tag: "Mock Interviews & Coaching",
        description: "Realistic MMI and panel mocks with instant verbal analysis and written rubrics.",
      },
    ],
  },
  {
    number: "07",
    title: "A–Levels & Final Offers",
    badge: "Condition Clearance",
    description: "Meet your conditional offer grades and finalise your medical school matriculation with confidence.",
    resources: [
      {
        title: "A–Level Targeted Tutoring",
        href: "/alevel-tutoring",
        tag: "Grade Assurance",
        description: "Exam technique, past paper walkthroughs and boundary mastery for final exams.",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <MedicForestLandingShell>
      <div className="relative min-h-screen bg-[#f4faf7] px-6 py-10 sm:px-10 lg:py-14">
        {/* Soft background mint glow decoration */}
        <div
          className="pointer-events-none absolute right-0 top-0 -z-10 h-[560px] w-[560px] rounded-full bg-gradient-to-br from-teal-200/35 via-emerald-100/25 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <div className="mx-auto max-w-5xl space-y-12">
          {/* Top Tag & Header */}
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-bold text-teal-800">
              <Sparkles className="h-3.5 w-3.5 text-teal-600" />
              <span>Medical Admissions Directory • Updated for 2026/2027</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-5xl">
              Everything you need for medical school admissions.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Structured revision roadmaps, free interactive tools, interview guides and expert 1–to–1 coaching — organised step–by–step from GCSEs through to your final medical school offers.
            </p>
          </div>

          {/* FEATURED HERO BANNER: Free Medicine Interview Guide */}
          <div className="relative overflow-hidden rounded-3xl border-2 border-teal-600/50 bg-gradient-to-br from-[#042724] via-[#083a34] to-[#021f1d] p-6 text-white shadow-xl sm:p-10">
            {/* Background glow decoration */}
            <div
              className="pointer-events-none absolute right-0 top-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/40 bg-teal-400/15 px-3.5 py-1 text-[11px] font-black uppercase tracking-wider text-teal-200">
                  <Sparkles className="h-3.5 w-3.5 text-teal-300" />
                  <span>Featured Free Resource • 100% Free Download</span>
                </div>

                <h2 className="text-2xl font-black text-white sm:text-3xl lg:text-4xl">
                  The Complete Medicine Interview Guide
                </h2>

                <p className="text-sm leading-relaxed text-teal-50/90 sm:text-base">
                  Over 350+ medical applicants used this comprehensive guide to structure ethical scenarios, NHS hot topics, MMI stations and reflective model answers. Download your free PDF copy immediately.
                </p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-semibold text-teal-200">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-300" />
                    Instant PDF download
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-300" />
                    MMI &amp; Panel structures
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-teal-300" />
                    No payment or card required
                  </span>
                </div>
              </div>

              {/* Featured Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:shrink-0">
                <a
                  href={FREE_INTERVIEW_GUIDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-teal-500 px-6 py-4 text-sm font-black text-[#042724] shadow-md transition hover:bg-teal-400 hover:shadow-lg focus:outline-hidden focus:ring-2 focus:ring-teal-300"
                >
                  <span>Get Free Medicine Interview Guide</span>
                  <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                </a>

                <Link
                  href="/interviews"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-teal-300/40 bg-teal-900/40 px-5 py-3.5 text-xs font-bold text-teal-100 transition hover:bg-teal-800/60"
                >
                  <span>Explore 550+ Free Questions Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Most Popular Resources */}
          <section>
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Quick Access
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                  Most popular resources
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-500">
                Frequently accessed by students
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {popularResources.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800 transition group-hover:bg-teal-600 group-hover:text-white">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-700">
                          {item.badge}
                        </span>
                      </div>

                      <h3 className="mt-4 text-base font-bold text-slate-900 transition group-hover:text-teal-800">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-1.5 pt-2 text-xs font-bold text-teal-700">
                      <span>Open resource</span>
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Browse by Stage Directory */}
          <section>
            <div className="border-b border-slate-200 pb-3">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                The Admissions Pathway
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">
                Browse resources by stage
              </h2>
              <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                Follow each step sequentially from early academic foundations through to university offers.
              </p>
            </div>

            <div className="mt-8 space-y-6">
              {stages.map((stage) => (
                <div
                  key={stage.number}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs sm:p-8"
                >
                  <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
                    {/* Stage Meta Left */}
                    <div className="lg:w-72 lg:shrink-0">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0d5c4d] text-xs font-black text-white shadow-2xs">
                          {stage.number}
                        </span>
                        <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                          {stage.badge}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-black text-slate-900 sm:text-xl">
                        {stage.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                        {stage.description}
                      </p>
                    </div>

                    {/* Resources Cards Right */}
                    <div className="flex-1">
                      <div className="grid gap-3 sm:grid-cols-2">
                        {stage.resources.map((resource) => {
                          const isFeatured = resource.featured;

                          const inner = (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                                    isFeatured
                                      ? "bg-teal-600 text-white"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {resource.tag}
                                </span>
                                {resource.external ? (
                                  <ArrowUpRight
                                    className={`h-4 w-4 shrink-0 transition ${
                                      isFeatured
                                        ? "text-teal-700 group-hover:text-teal-900"
                                        : "text-slate-400 group-hover:text-teal-700"
                                    }`}
                                  />
                                ) : (
                                  <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-teal-700" />
                                )}
                              </div>

                              <h4
                                className={`mt-2.5 text-sm font-bold transition ${
                                  isFeatured
                                    ? "text-teal-950 group-hover:text-teal-800"
                                    : "text-slate-900 group-hover:text-teal-800"
                                }`}
                              >
                                {resource.title}
                              </h4>

                              {resource.description && (
                                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                                  {resource.description}
                                </p>
                              )}
                            </>
                          );

                          if (resource.external) {
                            return (
                              <a
                                key={resource.title}
                                href={resource.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group flex flex-col justify-between rounded-xl border p-4 transition hover:shadow-xs ${
                                  isFeatured
                                    ? "border-teal-400/80 bg-teal-50/70 hover:border-teal-500 hover:bg-teal-50"
                                    : "border-slate-200 bg-white hover:border-teal-300 hover:bg-slate-50/50"
                                }`}
                              >
                                {inner}
                              </a>
                            );
                          }

                          return (
                            <Link
                              key={resource.title}
                              href={resource.href}
                              className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:bg-slate-50/50 hover:shadow-xs"
                            >
                              {inner}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom Help Dialogue */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xs sm:p-10">
            <h3 className="text-xl font-black text-slate-900 sm:text-2xl">
              Need guidance deciding on your next step?
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-relaxed text-slate-600 sm:text-sm">
              Whether you want advice on choosing medical schools, structuring your UCAT revision plan, or scheduling 1–to–1 mock interviews, feel free to reach out.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href={FREE_INTERVIEW_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-teal-700"
              >
                <span>Download Free Interview Guide</span>
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <Link
                href="/medicforest/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
              >
                <span>Contact MedicForest</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MedicForestLandingShell>
  );
}
