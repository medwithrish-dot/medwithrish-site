import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MedWithRish | MedWithRish",
  description: "Meet Rish and learn about MedWithRish medical and dental admissions resources and tutoring.",
  alternates: { canonical: "/about" },
};

import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
          About
        </p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          The person behind MedWithRish
        </h1>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-gray-600">
          I’m Rish, a tutor and content creator focused on helping students
          succeed in UCAT, interviews, and competitive applications through
          practical guidance, structured resources, and accessible support.
        </p>
      </section>
    </main>
  );
}