import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  MessageSquare,
  Quote,
  Trees,
  UserRoundCheck,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: "About MedicForest | Structured Medical Admissions & Mentorship",
  description:
    "Learn about MedicForest — realistic medical interview practice, useful feedback and personalised 1–to–1 tutoring founded by Rish (@medwithrish).",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MedicForest | Structured Medical Admissions & Mentorship",
    description:
      "Helping future medics prepare with more structure, confidence and support. Founded from real admissions experience by Rish.",
    url: "/about",
    siteName: "MedicForest",
    type: "website",
  },
};

export default function MedicForestAboutPage() {
  return (
    <MedicForestLandingShell>
      <div className="relative min-h-screen bg-gradient-to-b from-[#f2f8f5] via-[#f7faf8] to-[#eef6f2] text-slate-900 pb-20">
        {/* Soft atmospheric green gradient glows */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 -z-10 h-[500px] w-full max-w-6xl bg-gradient-to-b from-teal-200/30 via-emerald-100/20 to-transparent blur-3xl"
          aria-hidden="true"
        />

        <main className="mx-auto max-w-4xl px-5 pt-10 sm:px-8 sm:pt-14">
          {/* ─────────────────────────────────────────────────────────────
              1. HERO / WHAT MEDICFOREST IS
              One strong headline, one paragraph, one CTA.
          ───────────────────────────────────────────────────────────── */}
          <section className="text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50/90 px-3.5 py-1 text-xs font-bold text-teal-800 shadow-2xs">
              <Trees className="h-3.5 w-3.5 text-teal-600" />
              <span>About MedicForest</span>
            </div>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.15]">
              Helping future medics prepare with more structure, confidence and support.
            </h1>

            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              MedicForest combines realistic interview practice, useful feedback and personalised guidance to make medical admissions feel less overwhelming.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <Link
                href="/interviews"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0c6b5e] px-6 py-3.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#084e45]"
              >
                <span>Explore the platform</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/medicforest/tutoring"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-teal-300 hover:text-teal-800"
              >
                <span>1–to–1 Tutoring</span>
              </Link>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              2. FOUNDER SECTION
              Built from real admissions experience by Rish.
          ───────────────────────────────────────────────────────────── */}
          <section className="mt-14 rounded-3xl border border-slate-200/80 bg-white p-7 shadow-2xs sm:p-10">
            <div className="grid gap-8 md:grid-cols-[200px_1fr] md:items-center">
              {/* Rish Photo */}
              <div className="mx-auto w-40 md:w-full">
                <div className="relative overflow-hidden rounded-2xl border border-teal-200/80 bg-teal-50/50 p-2 shadow-xs">
                  <Image
                    src="/rish-profile.jpg"
                    alt="Rish — founder of MedicForest and MedWithRish"
                    width={400}
                    height={400}
                    className="aspect-square w-full rounded-xl object-cover object-center"
                    priority
                  />
                  <div className="mt-2 text-center">
                    <p className="text-sm font-bold text-slate-950">Rish</p>
                    <p className="text-xs font-semibold text-teal-700">@medwithrish_</p>
                  </div>
                </div>
              </div>

              {/* Founder Bio */}
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Founder
                  </span>
                  <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Built from real admissions experience.
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  I&apos;m <strong>Rish</strong>, an admissions mentor and creator behind <strong>@medwithrish</strong>. Having personally guided hundreds of aspiring medical students across the UK into top medical schools, I saw that students were consistently held back by vague markschemes, generic advice, and solitary guesswork.
                </p>

                <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
                  I built MedicForest to provide what students were missing: realistic interview simulations, structured rubrics, and direct 1–to–1 feedback that actually moves the needle.
                </p>

                {/* 3 Credibility Tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                    Medical interviews
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                    Personal statements
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                    1–to–1 mentoring
                  </span>
                </div>

                {/* Shortened Quote */}
                <div className="rounded-xl border-l-4 border-teal-600 bg-teal-50/70 p-3.5">
                  <div className="flex items-start gap-2.5">
                    <Quote className="h-4 w-4 shrink-0 text-teal-700 mt-0.5" />
                    <p className="text-xs italic leading-relaxed text-slate-800">
                      &ldquo;My mission is simple: demystify the medical school journey, replace anxious guesswork with structured practice, and help dedicated applicants secure their offers.&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              3. STUDENT RESULTS / PROOF
              Multiple 2300–2400+ scores · Multiple Oxbridge offers · 100–200 point increases
          ───────────────────────────────────────────────────────────── */}
          <section className="mt-14">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Proven Track Record
              </span>
              <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Built to help students make real progress.
              </h2>
              <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
                Real outcomes achieved by students preparing with MedWithRish and MedicForest.
              </p>
            </div>

            {/* 3 Metric Cards */}
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Card 1: Multiple 2300-2400+ scores every season */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
                <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  2300–2400+
                </div>
                <p className="mt-1 text-xs font-bold text-teal-700">
                  Multiple 2300–2400+ scores every season
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Consistent top percentile scoring driven by disciplined subtest pacing, timing shortcuts, and Decision Making logic trees.
                </p>
              </div>

              {/* Card 2: Multiple Oxbridge offers */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
                <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Oxbridge Offers
                </div>
                <p className="mt-1 text-xs font-bold text-teal-700">
                  Multiple Oxbridge &amp; top medical school offers
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Offers secured following intensive MMI circuit coaching, university–specific rubrics, and reflective STARR model answers.
                </p>
              </div>

              {/* Card 3: 100-200 points increase in each section */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
                <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  +100–200 points
                </div>
                <p className="mt-1 text-xs font-bold text-teal-700">
                  Consistently seeing 100–200 points increase in each section
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Achieved with correct practice, targeted drills, and systematic error correction to rapidly eliminate score plateaus.
                </p>
              </div>
            </div>

            {/* 2 Short Testimonial Proof Cards */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col justify-between rounded-2xl border border-teal-100 bg-white p-5 shadow-2xs">
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    &ldquo;I had never felt confident answering ethical dilemmas or station questions until working through the markschemes and 1–to–1 mocks. I got offers from all my interview choices!&rdquo;
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-teal-200 bg-teal-50">
                    <Image
                      src="/success-stories/story1.jpeg"
                      alt="Student success story thumbnail"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Medical School Applicant</p>
                    <p className="text-[11px] font-semibold text-teal-700">Secured 4 / 4 Medicine Offers</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-2xl border border-teal-100 bg-white p-5 shadow-2xs">
                <div className="flex items-start gap-2">
                  <Quote className="h-4 w-4 shrink-0 text-teal-600 mt-0.5" />
                  <p className="text-xs leading-relaxed text-slate-700 font-medium">
                    &ldquo;The Decision Making and QR shortcuts helped push my score into the top percentile. The structured frameworks completely transformed my preparation.&rdquo;
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-3">
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-teal-200 bg-teal-50">
                    <Image
                      src="/success-stories/story5.jpeg"
                      alt="Student success story thumbnail"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">UCAT &amp; Interview Student</p>
                    <p className="text-[11px] font-semibold text-teal-700">Top Percentile &amp; Oxbridge Offer Holder</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              4. PLATFORM ECOSYSTEM ("WHAT WE OFFER")
              Interviews / Tutoring / Resources
          ───────────────────────────────────────────────────────────── */}
          <section className="mt-14 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-7">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Platform Ecosystem
              </span>
              <h2 className="mt-1 text-lg font-bold text-slate-950 sm:text-xl">
                What we offer
              </h2>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {/* Interviews */}
              <div className="pt-3 first:pt-0 sm:pt-0 sm:px-4 first:sm:pl-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <MessageSquare className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">Med Interviews</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  550+ questions, MMI station rubrics, AI feedback loops and university–specific station checklists.
                </p>
                <Link
                  href="/interviews"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  <span>Explore practice</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Tutoring */}
              <div className="pt-3 sm:pt-0 sm:px-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <UserRoundCheck className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">1–to–1 Tutoring</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Intensive crash courses and mock interviews with Rish and MedicForest specialists.
                </p>
                <Link
                  href="/medicforest/tutoring"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  <span>Explore tuition</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {/* Resources */}
              <div className="pt-3 sm:pt-0 sm:px-4 last:sm:pr-0">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-950">Admissions Resources</h3>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Free Medicine interview guide, UCAT mock difficulty sheets and week–by–week timelines.
                </p>
                <Link
                  href="/resources"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:underline"
                >
                  <span>View resources</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              5. WHY MEDICFOREST EXISTS
              Moved down below Platform Ecosystem card as requested.
          ───────────────────────────────────────────────────────────── */}
          <section className="mt-14 rounded-3xl border border-teal-900/10 bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/40 p-7 shadow-xs sm:p-10">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                Why MedicForest Exists
              </span>

              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                A solitary tree stands fragile.{" "}
                <span className="text-teal-700">A forest stands unbreakable.</span>
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
                Medical admissions can feel isolating. Between strict grade thresholds, high–stakes aptitude exams, and intense MMI stations, applicants are often left navigating the process alone with generic advice.
              </p>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
                MedicForest was created to replace guesswork with clearer preparation, better feedback and support throughout the process — helping each applicant grow within a strong, supportive forest of peers and mentors.
              </p>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              6. SMALL FINAL CTA
              Ready to start preparing? Start practising · Explore tutoring
          ───────────────────────────────────────────────────────────── */}
          <section className="mt-14 text-center">
            <div className="mx-auto max-w-xl rounded-3xl border border-teal-900/10 bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/30 p-8 shadow-xs sm:p-10">
              <h2 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Ready to start preparing?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Explore free interview practice or get personalised support.
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/interviews"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0c6b5e] px-6 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-[#084e45]"
                >
                  <span>Start practising</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href="/medicforest/tutoring"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-800 shadow-2xs transition hover:border-teal-300 hover:text-teal-800"
                >
                  <span>Explore tutoring</span>
                </Link>
              </div>

              <p className="mt-4 text-[11px] text-slate-400">
                550+ free Med interview questions • No card required
              </p>
            </div>
          </section>
        </main>
      </div>
    </MedicForestLandingShell>
  );
}
