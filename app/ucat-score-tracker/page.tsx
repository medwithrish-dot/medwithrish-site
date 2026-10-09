import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free UCAT Mock Score Tracker | MedWithRish",
  description: "Download the free MedWithRish UCAT spreadsheet to track mock scores, section performance and progress.",
  alternates: { canonical: "/ucat-score-tracker" },
};

import Link from "next/link";

export default function UCATScoreTrackerPage() {
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
            Free UCAT Tool
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Free UCAT Mock Score Tracker
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            This is the most updated, modern UCAT Mock Spread Sheet available on the internet, and for free! Download now and work towards becoming a future doctor/dentist!
          </p>

          <p className="mt-5 text-sm font-bold text-slate-900">
            UCAT Score Tracker includes:
          </p>

          <ul className="mt-3 space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>Enter your mock scores (VR, DM, QR, SJT) - scaled scores and totals are calculated automatically</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>Track your progress over time with graphs for each section and your overall score</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>See your weakest section and how your score changes between mocks</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>Includes a mini-mock tracker for sectional practice</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
              <span>Dashboard shows your average, best score, and overall consistency</span>
            </li>
          </ul>

          <div className="mt-8 rounded-xl border border-blue-200/80 bg-blue-50/70 p-6">
            <h2 className="text-xl font-bold text-slate-950">
              Download the tracker
            </h2>

            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
              Use this spreadsheet to monitor your VR, DM, QR, AR, and SJT
              performance across mocks and question practice.
            </p>

            <a
              href="/downloads/MedWithRish_UCAT_Score_Tracker.xlsx"
              download
              className="mt-4 inline-flex rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              Download UCAT Tracker
            </a>
          </div>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
            Want help improving your scores?
          </h2>

          <p className="mt-2 text-sm sm:text-base leading-relaxed text-slate-600">
            If your tracker shows weak sections or inconsistent mock scores,
            UCAT tutoring can help you build better timing, strategy, and
            section-specific technique.
          </p>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/ucat-tutoring"
              className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold text-white shadow-xs transition hover:bg-blue-700"
            >
              UCAT tutoring
            </Link>

            <a
              href="https://payhip.com/Medwithrish"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-blue-300 hover:text-blue-700"
            >
              View UCAT notes
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}