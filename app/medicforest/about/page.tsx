import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Quote,
  Trees,
} from "lucide-react";
import { FaInstagram, FaTiktok } from "react-icons/fa";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";
import { RealStudentSuccessStories } from "./_components/RealStudentSuccessStories";

export const metadata: Metadata = {
  title: "About MedicForest | Structured Medical Admissions & Mentorship",
  description:
    "Learn about MedicForest - realistic medical interview practice, useful feedback and personalised guidance founded by Rish (@medwithrish_).",
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

const PINE_TREE_PATH =
  "M18 3 C18 3 13.5 10.5 10 14 C12 14.5 13.8 14.5 14.5 14.5 C12 18.5 8 22 5.5 24.5 C7.8 25 10 25 11.5 25 C8 29 4 33 2 34.5 C6.5 34.5 13.5 34.5 16 34.5 L16 39.5 C16 40 16.5 40.5 17 40.5 L19 40.5 C19.5 40.5 20 40 20 39.5 L20 34.5 C22.5 34.5 29.5 34.5 34 34.5 C32 33 28 29 24.5 25 C26 25 28.2 25 30.5 24.5 C28 22 24 18.5 21.5 14.5 C22.2 14.5 24 14.5 26 14 C22.5 10.5 18 3 18 3 Z";

function PineTree({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 36 42"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path d={PINE_TREE_PATH} />
    </svg>
  );
}

function FadedForestBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ── Mid Left Grove ── */}
      <div className="absolute -left-16 top-[680px] flex items-end -space-x-10 text-teal-950/[0.035] lg:left-2 xl:left-8">
        <PineTree className="h-64 w-48 opacity-85" />
        <PineTree className="h-80 w-60 opacity-95" />
        <PineTree className="h-52 w-40 opacity-70" />
      </div>

      {/* ── Mid Right Grove ── */}
      <div className="absolute -right-20 top-[980px] flex items-end -space-x-8 text-emerald-950/[0.035] lg:right-2 xl:right-10">
        <PineTree className="h-48 w-36 opacity-60" />
        <PineTree className="h-72 w-56 opacity-90" />
        <PineTree className="h-56 w-44 opacity-75" />
      </div>

      {/* ── Bottom Horizon Forest Skyline ── */}
      <div className="absolute bottom-0 inset-x-0 h-40 overflow-hidden [mask-image:linear-gradient(to_top,black_40%,transparent_100%)]">
        <div className="flex w-full items-end justify-between -space-x-6 text-teal-950/[0.03] px-2">
          <PineTree className="h-28 w-24" />
          <PineTree className="h-36 w-28 -mb-2" />
          <PineTree className="h-24 w-20" />
          <PineTree className="h-44 w-36 -mb-4" />
          <PineTree className="h-32 w-24" />
          <PineTree className="h-28 w-20" />
          <PineTree className="h-40 w-32 -mb-2" />
          <PineTree className="h-24 w-18" />
          <PineTree className="h-48 w-36 -mb-6" />
          <PineTree className="h-32 w-24" />
          <PineTree className="h-36 w-28" />
        </div>
      </div>
    </div>
  );
}

export default function MedicForestAboutPage() {
  return (
    <MedicForestLandingShell>
      <div className="relative isolate min-h-screen text-slate-900 pb-20 overflow-x-hidden">
        {/* ── Quiet Ambient Background Layer ── */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 select-none overflow-hidden lg:left-[230px]"
          aria-hidden="true"
          style={{
            backgroundColor: "#F7FAF7",
            backgroundImage: `
              radial-gradient(circle at 95% 65%, rgba(77, 190, 163, 0.18), transparent 32%),
              radial-gradient(circle at 10% 5%, rgba(178, 232, 214, 0.20), transparent 24%)
            `,
          }}
        >
          {/* Thin, graceful abstract curve */}
          <svg
            className="absolute right-0 bottom-0 h-full w-full max-w-4xl text-[#0c6b5e] opacity-[0.06]"
            viewBox="0 0 1000 1000"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M1000,920 C720,860 520,620 460,410 C410,210 260,60 0,0" />
          </svg>

          {/* Understated paper grain texture (1.8% opacity) to remove digital sterility */}
          <div
            className="absolute inset-0 opacity-[0.018] mix-blend-multiply pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />
        </div>

        <main className="relative z-0 mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10 space-y-12 sm:space-y-14">
          {/* ─────────────────────────────────────────────────────────────
              1. HERO / WHAT MEDICFOREST IS & FOREST METAPHOR
              Hero card: 18px radius, neutral border #E3E8E5, no heavy shadow
          ───────────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-[18px] border border-[#E3E8E5] bg-white shadow-none">
            {/* Panoramic Forest Background Image with Gradient Overlay */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <Image
                src="/medicforest/about-hero-forest.jpg"
                alt="Misty mountain and pine forest panorama"
                fill
                className="object-cover object-right-top opacity-60 md:opacity-75"
                priority
              />
              {/* Left-to-right fade for crisp readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent sm:via-white/85 lg:via-white/70" />
              {/* Top-to-bottom gentle fade */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-white/90" />
            </div>

            <div className="relative p-6 sm:p-10 lg:p-12">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
                {/* Left: Headline & CTAs */}
                <div className="lg:col-span-7">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[#E3E8E5] bg-[#F7FAF7] px-3 py-1 text-xs font-semibold text-slate-700">
                    <Trees className="h-3.5 w-3.5 text-teal-700" />
                    <span>ABOUT MEDICFOREST</span>
                  </div>

                  <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl lg:leading-[1.12]">
                    Helping future medics prepare with more{" "}
                    <span className="text-[#0c6b5e]">structure, confidence and support.</span>
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                    MedicForest provides realistic interview practice, useful feedback and personalised guidance to make medical admissions feel less overwhelming.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <Link
                      href="/interviews"
                      className="inline-flex items-center gap-2 rounded-[10px] bg-[#0c6b5e] px-6 py-3.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#084e45]"
                    >
                      <span>Explore the platform</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <a
                      href="#our-founder"
                      className="inline-flex items-center gap-2 rounded-[10px] border border-[#E3E8E5] bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:border-slate-300 hover:text-slate-900"
                    >
                      <span>Our story</span>
                    </a>
                  </div>
                </div>

                {/* Right: Solitary tree vs Forest quote card - Editorial Serif Moment */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-[14px] border border-[#E3E8E5] bg-[#FBFDFB] p-6 sm:p-7 shadow-none">
                    <div className="flex items-start justify-between">
                      <Quote className="h-7 w-7 text-teal-800/25" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        The Vision
                      </span>
                    </div>

                    <blockquote className="mt-3">
                      <span className="font-serif italic text-lg sm:text-xl text-slate-800 leading-snug">
                        &ldquo;A solitary tree stands fragile.&rdquo;
                      </span>
                      <span className="mt-1 block font-sans font-bold tracking-tight text-[#0c6b5e] sm:text-lg">
                        A forest stands unbreakable.
                      </span>
                    </blockquote>

                    <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
                      Medical admissions can feel isolating. MedicForest was created to replace guesswork with clearer preparation, better feedback and a supportive community.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              2. OUR FOUNDER
              No outer card container - sits directly on the background.
              Asymmetric layout: taller photo left, editorial copy center, social card right.
          ───────────────────────────────────────────────────────────── */}
          <section id="our-founder" className="pt-2 pb-2">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              {/* Left Column: Taller Photo Frame (aspect-[4/5], 14px radius, neutral border) */}
              <div className="lg:col-span-3">
                <div className="mx-auto w-44 sm:w-48 lg:w-full">
                  <div className="relative overflow-hidden rounded-[14px] border border-[#E3E8E5] bg-white p-2 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[10px] bg-slate-100">
                      <Image
                        src="/rish-profile.jpg"
                        alt="Rish - Founder of MedicForest and MedWithRish"
                        fill
                        className="object-cover object-center"
                        priority
                      />
                    </div>
                    <div className="mt-2.5 text-center">
                      <p className="text-sm font-bold text-slate-950">Rish</p>
                      <a
                        href="https://instagram.com/medwithrish_"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        Founder • @medwithrish_
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Column: Narrower Editorial Copy (direct on background) */}
              <div className="lg:col-span-5 lg:pr-2 space-y-3.5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    OUR FOUNDER
                  </p>
                  <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                    Built from real admissions experience.
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-slate-600">
                  MedicForest was founded by Rish, an admissions mentor who has supported hundreds of aspiring doctors across the UK. Having guided applicants into top medical schools, he saw that students were often left with unstructured resources and generic advice.
                </p>

                <p className="text-sm leading-relaxed text-slate-600">
                  He built MedicForest to provide what students truly need: realistic practice, structured guidance and a supportive community.
                </p>

                {/* Understated credentials list - no neon pills */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-xs font-medium text-slate-500">
                  <span>• Medical interviews</span>
                  <span>• Personal statements</span>
                  <span>• 1-to-1 mentoring</span>
                </div>
              </div>

              {/* Right Column: Founder Social Links Card (intentional floating card, shifted inward) */}
              <div className="lg:col-span-4 lg:pl-2">
                <div className="flex flex-col justify-between rounded-[14px] border border-[#E3E8E5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)] sm:p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Follow &amp; Connect
                      </span>
                      <span className="text-[11px] font-medium text-teal-800">
                        Direct DMs open
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      Reach out directly for admissions guidance, quick questions, or daily breakdowns:
                    </p>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {/* Instagram */}
                    <a
                      href="https://instagram.com/medwithrish_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-[10px] border border-[#E3E8E5] bg-[#FBFDFB] p-2.5 text-slate-900 transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-2xs transition group-hover:scale-105">
                          <FaInstagram className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-950">Instagram</span>
                            <span className="text-[11px] font-semibold text-pink-600">@medwithrish_</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Admissions tips &amp; direct DMs
                          </p>
                        </div>
                      </div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-[#E3E8E5] bg-white text-slate-400 transition group-hover:text-slate-700">
                        <ArrowUpRight className="h-3 w-3" />
                      </div>
                    </a>

                    {/* TikTok */}
                    <a
                      href="https://tiktok.com/@medwithrish"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-[10px] border border-[#E3E8E5] bg-[#FBFDFB] p-2.5 text-slate-900 transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[8px] bg-slate-950 text-white shadow-2xs transition group-hover:scale-105">
                          <FaTiktok className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-950">TikTok</span>
                            <span className="text-[11px] font-semibold text-slate-700">@medwithrish</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Interview breakdowns &amp; tips
                          </p>
                        </div>
                      </div>
                      <div className="flex h-6 w-6 items-center justify-center rounded-[6px] border border-[#E3E8E5] bg-white text-slate-400 transition group-hover:text-slate-700">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </a>
                  </div>

                  <p className="mt-3.5 text-[11px] text-slate-500">
                    Usually responds within 24 hours to prospective medics.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              3. PROVEN IMPACT
              Direct on background - heading on page, then individual result boxes underneath.
          ───────────────────────────────────────────────────────────── */}
          <section className="pt-2 space-y-6">
            {/* Header + Stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  PROVEN IMPACT
                </p>
                <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Real progress, from real students.
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Students using MedicForest have achieved top UCAT scores, secured medicine offers, and built confidence in their interview performance.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                  {/* Metric 1 */}
                  <div className="rounded-[12px] border border-[#E3E8E5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center sm:text-left">
                    <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      2300-2400+
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Top UCAT scores each season
                    </p>
                  </div>

                  {/* Metric 2 */}
                  <div className="rounded-[12px] border border-[#E3E8E5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center sm:text-left">
                    <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Multiple offers
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      4 / 4 medicine offers converted
                    </p>
                  </div>

                  {/* Metric 3 */}
                  <div className="rounded-[12px] border border-[#E3E8E5] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] text-center sm:text-left">
                    <div className="text-2xl font-black tracking-tight text-[#0c6b5e] sm:text-3xl">
                      +100-200 points
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Average increase{" "}
                      <span className="font-black uppercase tracking-wide text-purple-700">
                        PER UCAT SECTION
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Student Success Stories Flip Grid */}
            <RealStudentSuccessStories />
          </section>

          {/* ─────────────────────────────────────────────────────────────
              4. READY TO START PREPARING? (FINAL CTA STRIP)
          ───────────────────────────────────────────────────────────── */}
          <section className="rounded-[16px] border border-[#E3E8E5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.02)] sm:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight text-slate-950 sm:text-2xl">
                  Ready to start preparing?
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Join hundreds of students and get structured practice, realistic feedback and ongoing support.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/interviews"
                  className="inline-flex items-center gap-2 rounded-[10px] bg-[#0c6b5e] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#084e45]"
                >
                  <span>Start practising</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/medicforest/tutoring"
                  className="inline-flex items-center gap-2 rounded-[10px] border border-[#E3E8E5] bg-white px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs transition hover:border-slate-300 hover:text-slate-950"
                >
                  <span>Explore tutoring</span>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    </MedicForestLandingShell>
  );
}
