import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Related Healthcare Careers Guide | MedWithRish",
  description: "Explore healthcare careers and alternative pathways alongside medicine and dentistry.",
  alternates: { canonical: "/related-careers-guide" },
};

import Link from "next/link";

const careers = [
  "Pharmacy",
  "Physician Associate",
  "Biomedical Science",
  "Dental Hygiene / Therapy",
  "Nursing",
  "Radiography",
  "Physiotherapy",
];

export default function RelatedCareersGuidePage() {
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
            Alternative Careers
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
            Related Healthcare Careers Guide
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            Medicine and dentistry are not the only meaningful healthcare careers.
            Many students discover fulfilling roles in related professions.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950 sm:text-2xl">
            Examples of related careers
          </h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {careers.map((career) => (
              <div
                key={career}
                className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-semibold text-slate-800"
              >
                {career}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}