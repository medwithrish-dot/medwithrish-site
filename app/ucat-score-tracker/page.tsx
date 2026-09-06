import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free UCAT Mock Score Tracker | MedWithRish",
  description: "Download the free MedWithRish UCAT spreadsheet to track mock scores, section performance and progress.",
  alternates: { canonical: "/ucat-score-tracker" },
};

import Link from "next/link";

export default function UCATScoreTrackerPage() {
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
            Free UCAT Tool
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Free UCAT Mock Score Tracker
          </h1>

         <p className="mt-5 text-lg leading-8 text-gray-700">
  This is the most updated, modern UCAT Mock Spread Sheet available on the internet, and for free! Download now and work towards becoming a future doctor/dentist!
</p>

<p className="mt-4 font-semibold text-gray-900">
  UCAT Score Tracker includes:
</p>

<ul className="mt-3 space-y-3 text-base leading-7 text-gray-700">
  <li>
   - Enter your mock scores (VR, DM, QR, SJT) — scaled scores and totals
    are calculated automatically
  </li>

  <li>
   - Track your progress over time with graphs for each section and your
    overall score
  </li>

  <li>
    - See your weakest section and how your score changes between mocks
  </li>

  <li>
   - Includes a mini-mock tracker for sectional practice
  </li>

  <li>
   - Dashboard shows your average, best score, and overall consistency
  </li>
</ul>

          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Download the tracker
            </h2>

            <p className="mt-3 text-base leading-7 text-gray-700">
              Use this spreadsheet to monitor your VR, DM, QR, AR, and SJT
              performance across mocks and question practice.
            </p>

            <a
              href="/downloads/MedWithRish_UCAT_Score_Tracker.xlsx"
              download
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Download UCAT Tracker
            </a>
          </div>
        </header>

     
        <section className="py-10">
          <div className="rounded-2xl border border-gray-200 bg-[#f7fafe] p-7">
            <h2 className="text-2xl font-bold text-gray-900">
              Want help improving your scores?
            </h2>

            <p className="mt-3 text-base leading-7 text-gray-700">
              If your tracker shows weak sections or inconsistent mock scores,
              UCAT tutoring can help you build better timing, strategy, and
              section-specific technique.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ucat-tutoring"
                className="inline-flex justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                UCAT tutoring
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