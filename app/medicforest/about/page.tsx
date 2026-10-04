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
      <div className="relative isolate min-h-screen bg-[#f8faf9]/60 text-slate-900 pb-20 overflow-x-hidden">
        {/* Ambient Waves Background Layer */}
        <div
          className="pointer-events-none fixed inset-0 -z-20 select-none overflow-hidden lg:left-[230px]"
          aria-hidden="true"
        >
          <Image
            src="/medicforest/about-ambient-bg.png"
            alt=""
            fill
            className="object-cover object-center opacity-85 sm:opacity-95"
            priority
          />
          {/* Subtle gradient tint to softly blend with page elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f8faf9]/20 via-transparent to-[#f8faf9]/40" />
        </div>

        {/* Faded Pine Trees Background Layer */}
        <FadedForestBackground />

        <main className="relative z-0 mx-auto max-w-6xl px-5 pt-8 sm:px-8 sm:pt-10 space-y-10 sm:space-y-12">
          {/* ─────────────────────────────────────────────────────────────
              1. HERO / WHAT MEDICFOREST IS & FOREST METAPHOR
              Split layout over the panoramic misty pine mountain banner
          ───────────────────────────────────────────────────────────── */}
          <section className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xs">
            {/* Panoramic Forest Background Image with Gradient Overlay */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <Image
                src="/medicforest/about-hero-forest.jpg"
                alt="Misty mountain and pine forest panorama"
                fill
                className="object-cover object-right-top opacity-70 md:opacity-85"
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
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-white/90 px-3.5 py-1 text-xs font-bold text-teal-800 shadow-2xs backdrop-blur-xs">
                    <Trees className="h-3.5 w-3.5 text-teal-600" />
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
                      className="inline-flex items-center gap-2 rounded-xl bg-[#0c6b5e] px-6 py-3.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#084e45]"
                    >
                      <span>Explore the platform</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>

                    <a
                      href="#our-founder"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-2xs backdrop-blur-xs transition hover:border-teal-300 hover:text-teal-900"
                    >
                      <span>Our story</span>
                    </a>
                  </div>
                </div>

                {/* Right: Solitary tree vs Forest quote card */}
                <div className="lg:col-span-5">
                  <div className="relative rounded-3xl border border-teal-900/10 bg-white/85 p-6 shadow-xs backdrop-blur-md sm:p-7">
                    <div className="flex items-start justify-between">
                      <Quote className="h-8 w-8 text-teal-600/30" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                        The Vision
                      </span>
                    </div>

                    <blockquote className="mt-2 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                      <span className="italic text-slate-700">A solitary tree stands fragile.</span>
                      <span className="mt-0.5 block font-black text-[#0c6b5e]">
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
              Real admissions experience with Rish's actual photo
          ───────────────────────────────────────────────────────────── */}
          <section
            id="our-founder"
            className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-9 lg:p-10"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Photo + Bio */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-[160px_1fr] sm:items-start">
                  {/* Photo Container - Rish's real photograph */}
                  <div className="mx-auto w-36 sm:w-full">
                    <div className="relative overflow-hidden rounded-2xl border border-teal-100 bg-teal-50/40 p-2 shadow-xs">
                      <div className="relative aspect-square w-full overflow-hidden rounded-xl">
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

                  {/* Bio */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        OUR FOUNDER
                      </span>
                      <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        Built from real admissions experience.
                      </h2>
                    </div>

                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      MedicForest was founded by Rish, an admissions mentor who has supported hundreds of aspiring doctors across the UK. Having guided applicants into top medical schools, he saw that students were often left with unstructured resources and generic advice.
                    </p>

                    <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
                      He built MedicForest to provide what students truly need: realistic practice, structured guidance and a supportive community.
                    </p>

                    {/* 3 Credibility Tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                        Medical interviews
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                        Personal statements
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 font-bold text-teal-800 ring-1 ring-inset ring-teal-600/20">
                        1-to-1 mentoring
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Founder Social Links Card */}
              <div className="lg:col-span-5">
                <div className="flex h-full flex-col justify-between rounded-2xl border border-teal-100 bg-[#f4f9f7] p-5 shadow-2xs sm:p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">
                        Follow &amp; Connect
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-teal-100/70 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                        Direct DMs
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600">
                      Reach out directly for admissions guidance, quick questions, or daily breakdowns:
                    </p>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {/* Instagram */}
                    <a
                      href="https://instagram.com/medwithrish_"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-slate-900 shadow-2xs transition hover:border-pink-300 hover:bg-pink-50/30 hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-2xs transition group-hover:scale-105">
                          <FaInstagram className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-950">Instagram</span>
                            <span className="text-[11px] font-semibold text-pink-600">@medwithrish_</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Admissions tips, Q&amp;As &amp; direct DMs
                          </p>
                        </div>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:border-pink-300 group-hover:bg-pink-100/60 group-hover:text-pink-700">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </a>

                    {/* TikTok */}
                    <a
                      href="https://tiktok.com/@medwithrish"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-3 text-slate-900 shadow-2xs transition hover:border-slate-400 hover:bg-slate-50/80 hover:shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white shadow-2xs transition group-hover:scale-105">
                          <FaTiktok className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-950">TikTok</span>
                            <span className="text-[11px] font-semibold text-slate-700">@medwithrish</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            High-yield interview breakdowns &amp; tips
                          </p>
                        </div>
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 transition group-hover:border-slate-400 group-hover:bg-slate-200/70 group-hover:text-slate-900">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ─────────────────────────────────────────────────────────────
              3. PROVEN IMPACT
              Header + 3 real student outcome metrics
          ───────────────────────────────────────────────────────────── */}
          <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs sm:p-9 lg:p-10">
            {/* Header + Stats */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  PROVEN IMPACT
                </span>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                  Real progress, from real students.
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Students using MedicForest have achieved top UCAT scores, secured medicine offers, and built confidence in their interview performance.
                </p>
              </div>

              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {/* Metric 1 */}
                  <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4 text-center sm:text-left">
                    <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      2300-2400+
                    </div>
                    <p className="mt-1 text-xs font-bold text-teal-700">
                      Top UCAT scores each season
                    </p>
                  </div>

                  {/* Metric 2 */}
                  <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4 text-center sm:text-left">
                    <div className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                      Oxbridge offers
                    </div>
                    <p className="mt-1 text-xs font-bold text-teal-700">
                      Oxford &amp; Cambridge offers secured
                    </p>
                  </div>

                  {/* Metric 3 */}
                  <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-4 text-center sm:text-left">
                    <div className="text-2xl font-black tracking-tight text-[#0c6b5e] sm:text-3xl">
                      +100-200 points
                    </div>
                    <p className="mt-1 text-xs font-bold text-teal-700">
                      Average increase{" "}
                      <span className="font-black uppercase tracking-wide text-purple-700">
                        PER UCAT SECTION
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Real Student Success Stories from WhatsApp & Official Score Reports */}
            <RealStudentSuccessStories />
          </section>

          {/* ─────────────────────────────────────────────────────────────
              4. READY TO START PREPARING? (FINAL CTA STRIP)
          ───────────────────────────────────────────────────────────── */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
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
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0c6b5e] px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:bg-[#084e45]"
                >
                  <span>Start practising</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/medicforest/tutoring"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-2xs transition hover:border-teal-300 hover:text-teal-900"
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
