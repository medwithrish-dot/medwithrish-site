import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  MessageSquare,
  Sparkles,
  Stethoscope,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";
import { FREE_INTERVIEW_GUIDE_URL, MEDWITHRISH_NOTES_URL } from "@/utils/medwithrish/site-links";

export const metadata: Metadata = {
  title: "Admissions Resources & Revision Guides | MedicForest",
  description:
    "Free medical admissions resources - UCAT guides, free Medicine interview guide, personal statement support and 1-to-1 coaching.",
  alternates: { canonical: "/resources" },
};

type Resource = {
  title: string;
  href: string;
  badge: string;
  description: string;
  external?: boolean;
  featured?: boolean;
};

type ResourceCategory = {
  id: string;
  name: string;
  icon: typeof MessageSquare;
  description: string;
  items: Resource[];
};

const categories: ResourceCategory[] = [
  {
    id: "interviews",
    name: "Med Interviews",
    icon: MessageSquare,
    description: "Realistic MMI station frameworks, ethical scenarios, NHS hot topics and model reflections.",
    items: [
      {
        title: "The Complete Medicine Interview Guide",
        href: FREE_INTERVIEW_GUIDE_URL,
        badge: "★ Featured Free Guide",
        description: "High-yield guide with ethical frameworks, NHS hot topics and STARR model answers. Free PDF download.",
        external: true,
        featured: true,
      },
      {
        title: "Med Interview Prep Hub",
        href: "/interviews",
        badge: "550+ Questions",
        description: "Full question bank, detailed markschemes, station timers and university-specific station guides.",
      },
      {
        title: "1-to-1 Med Interview Tutoring",
        href: "/medicforest/tutoring",
        badge: "Mock Tuition",
        description: "Realistic MMI and panel mocks with instant verbal analysis and written rubrics.",
      },
    ],
  },
  {
    id: "ucat",
    name: "UCAT Preparation",
    icon: Stethoscope,
    description: "Tools, timing strategies and pacing schedules across all 4 core UCAT subtests.",
    items: [
      {
        title: "UCAT Mock Difficulty Spreadsheet",
        href: "/ucat-mock-difficulty",
        badge: "Free Tool",
        description: "Benchmark mock test difficulty, average scores and SJT bands across Medify, MedEntry and official exams.",
      },
      {
        title: "UCAT Preparation Timeline",
        href: "/ucat-timeline",
        badge: "Free Guide",
        description: "A week-by-week roadmap of when to begin practice, select mocks and pace drills effectively.",
      },
      {
        title: "1-to-1 UCAT Crash Courses & Tuition",
        href: "/medicforest/tutoring",
        badge: "1-to-1 Tuition",
        description: "Intensive 4-hour subtest coaching with timing shortcuts and mental arithmetic frameworks.",
      },
      {
        title: "MedWithRish UCAT Study Notes",
        href: MEDWITHRISH_NOTES_URL,
        badge: "Notes & Cheatsheets",
        description: "High-yield Decision Making logic trees, syllogisms and formula sheets.",
        external: true,
      },
    ],
  },
  {
    id: "personal-statements",
    name: "Personal Statements",
    icon: BookOpen,
    description: "Clear evidence, clinical reflection and structural refinement for your written UCAS draft.",
    items: [
      {
        title: "Personal Statement Complete Guide",
        href: "/personal-statements-guide",
        badge: "Free Guide",
        description: "Structure breakdown, model opening lines and common reflection mistakes to avoid.",
      },
      {
        title: "1-to-1 Personal Statement Review Session",
        href: "/personal-statement-session",
        badge: "1-to-1 Review",
        description: "Comprehensive line-by-line feedback, structural reorganisation and paragraph polish.",
      },
    ],
  },
  {
    id: "academics",
    name: "Academics & Experience",
    icon: GraduationCap,
    description: "GCSE and A-Level grade assurance, Year 12 planning and healthcare work experience insight.",
    items: [
      {
        title: "Work Experience & Shadowing Guide",
        href: "/work-experience-guide",
        badge: "Free Guide",
        description: "What medical schools look for in clinical exposure and reflection diary templates.",
      },
      {
        title: "Year 12 Medical Preparation Guide",
        href: "/year12-guide",
        badge: "Free Guide",
        description: "Term-by-term milestone checklist for predicted grades, UCAT and admissions prep.",
      },
      {
        title: "A-Level 1-to-1 Tutoring",
        href: "/alevel-tutoring",
        badge: "Private Tuition",
        description: "Focused coaching in Biology, Chemistry and Maths to secure AAA/A*AA predictions.",
      },
      {
        title: "GCSE Revision Guide & Tutoring",
        href: "/gcse-revision-guide",
        badge: "Revision & Tuition",
        description: "Techniques and tuition to achieve Grade 8s and 9s for initial admissions screening.",
      },
    ],
  },
];

export default function ResourcesPage() {
  return (
    <MedicForestLandingShell>
      <div className="min-h-screen bg-[#fcfdfd] text-slate-900">
        <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 sm:py-14">
          {/* Simple Back Link */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center text-xs font-semibold text-slate-500 transition hover:text-slate-900"
            >
              ← Back to homepage
            </Link>
          </div>

          {/* Minimal Hero Header */}
          <div className="mt-6">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Admissions Resources
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">
              High-yield revision guides, free interactive tools, interview frameworks and 1-to-1 coaching.
            </p>
          </div>

          {/* FEATURED BANNER: Free Medicine Interview Guide */}
          <div className="mt-8 rounded-2xl bg-[#042724] p-6 text-white shadow-sm sm:p-7">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-400/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                  <Sparkles className="h-3 w-3 text-teal-300" />
                  Featured Free Guide
                </span>
                <h2 className="text-xl font-bold text-white sm:text-2xl">
                  The Complete Medicine Interview Guide
                </h2>
                <p className="text-xs leading-relaxed text-teal-100/90 sm:text-sm">
                  Over 350+ medical applicants used this guide to structure ethical dilemmas, MMI stations, NHS hot topics and model reflections. 100% free PDF download.
                </p>
              </div>

              <div className="shrink-0">
                <a
                  href={FREE_INTERVIEW_GUIDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-xs font-bold text-[#042724] shadow-xs transition hover:bg-teal-300 sm:w-auto"
                >
                  <span>Get Free Guide (PDF)</span>
                  <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Category Navigation Pills */}
          <div className="mt-8 flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-4">
            <span className="text-xs font-semibold text-slate-400">Jump to:</span>
            {categories.map((cat) => (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-2xs transition hover:border-teal-400 hover:text-teal-800"
              >
                {cat.name}
              </a>
            ))}
          </div>

          {/* Streamlined Flat Directory List */}
          <div className="mt-10 space-y-12">
            {categories.map((category) => {
              const CategoryIcon = category.icon;
              return (
                <section key={category.id} id={category.id} className="scroll-mt-20">
                  {/* Category Header */}
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                      <CategoryIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">
                        {category.name}
                      </h2>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {category.description}
                  </p>

                  {/* Flat Row List */}
                  <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200/80 bg-white shadow-2xs">
                    {category.items.map((item) => {
                      const isFeatured = item.featured;

                      const rowContent = (
                        <div className="flex flex-col justify-between gap-2 p-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5">
                          <div className="flex-1 space-y-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-sm font-bold transition ${
                                  isFeatured
                                    ? "text-teal-900 group-hover:text-teal-700"
                                    : "text-slate-900 group-hover:text-teal-700"
                                }`}
                              >
                                {item.title}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                                  isFeatured
                                    ? "bg-teal-100 text-teal-800"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed text-slate-500">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-teal-700 sm:shrink-0">
                            <span className="hidden sm:inline">Open</span>
                            {item.external ? (
                              <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            ) : (
                              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                            )}
                          </div>
                        </div>
                      );

                      if (item.external) {
                        return (
                          <a
                            key={item.title}
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group block transition hover:bg-slate-50/70 ${
                              isFeatured ? "bg-teal-50/40" : ""
                            }`}
                          >
                            {rowContent}
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          className="group block transition hover:bg-slate-50/70"
                        >
                          {rowContent}
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          {/* Minimal Footer Support Prompt */}
          <div className="mt-14 border-t border-slate-200/80 pt-6 text-center text-xs text-slate-500">
            <p>
              Have a question about which resource or tutor fits your application?{" "}
              <Link
                href="/contact"
                className="font-semibold text-teal-700 underline underline-offset-2 hover:text-teal-900"
              >
                Get in touch with MedWithRish
              </Link>
            </p>
          </div>
        </main>
      </div>
    </MedicForestLandingShell>
  );
}
