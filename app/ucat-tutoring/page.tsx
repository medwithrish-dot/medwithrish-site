import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UCAT Tutoring | MedWithRish",
  description: "One-to-one UCAT support focused on strategy, timing, question approach and score improvement.",
  alternates: { canonical: "/ucat-tutoring" },
};

import Link from "next/link";
const includes = [
  "Subtest-specific strategy and timing work",
  "Review of mistakes and weak-question patterns",
  "Planning support to structure preparation effectively",
];

const bestFor = [
  "Students aiming for stronger percentile performance",
  "Students stuck on timing and consistency",
  "Students who want personalised UCAT support",
];

export default function UCATTutoringPage() {
  return (
    <main className="bg-[#f7fafe] px-6 pb-16 pt-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/resources" className="mb-6 inline-flex text-sm font-semibold text-blue-600 hover:underline">
          ← Back to resources
        </Link>
        <section className="rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-sm md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Tutoring
          </p>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
            UCAT Tutoring
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-600">
            1-to-1 UCAT support focused on strategy, timing, question approach,
            and score improvement.
          </p>

          <div className="mt-8">
            <Link
              href="/contact"
              className="inline-flex rounded-2xl bg-blue-600 px-6 py-4 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              Contact for UCAT tutoring
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              What support can include
            </h2>

            <div className="mt-5 space-y-4">
              {includes.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-600">
                    ✓
                  </span>
                  <p className="text-sm leading-7 text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-gray-200 bg-white p-7 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              Best suited for
            </h2>

            <div className="mt-5 space-y-4">
              {bestFor.map((item) => (
                <div key={item} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-800">
                    •
                  </span>
                  <p className="text-sm leading-7 text-gray-600">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[2rem] border border-blue-100 bg-blue-600 p-8 text-white shadow-sm md:p-10">
          <h2 className="text-2xl font-bold md:text-3xl">
            Want tailored UCAT support?
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-blue-50 md:text-base">
            Get structured help with timing, strategy, weak areas, and a clear
            preparation plan.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-2xl bg-white px-6 py-4 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Get in touch
          </Link>
        </section>
      </div>
    </main>
  );
}
