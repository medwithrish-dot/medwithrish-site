import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MedWithRish | MedWithRish",
  description: "Meet Rish and learn about MedWithRish medical and dental admissions resources and tutoring.",
  alternates: { canonical: "/about" },
};

import Navbar from "@/components/Navbar";
import Link from "next/link";

const nextSteps = [
  {
    title: "Explore the admissions journey",
    description: "Find guidance for each stage, from early preparation to final offers.",
    href: "/#journey",
    action: "See the journey",
  },
  {
    title: "Prepare for interviews",
    description: "Start with MMI and panel interview guidance, then explore one-to-one support.",
    href: "/interviews",
    action: "Visit the interview hub",
  },
  {
    title: "Find a guide or tutor",
    description: "Browse free resources and the current tutoring options in one place.",
    href: "/resources",
    action: "Browse resources",
  },
];

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
          I’m Rish, a tutor and content creator helping students plan medicine
          and dentistry applications. I share practical guides and offer
          individual support for interviews, personal statements, and academic
          preparation.
        </p>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {nextSteps.map((step) => (
            <article key={step.href} className="flex flex-col rounded-2xl border border-blue-100 bg-[#f7fafe] p-6">
              <h2 className="text-lg font-semibold text-gray-900">{step.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-6 text-gray-600">{step.description}</p>
              <Link href={step.href} className="mt-5 text-sm font-semibold text-blue-700 hover:text-blue-900">
                {step.action} →
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-gray-950 p-6 text-white md:p-8">
          <h2 className="text-2xl font-semibold">Need individual help?</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-300">
            Tell me which stage you’re at and what you’d like to work on. We can
            discuss the support that fits your goals.
          </p>
          <Link href="/contact" className="mt-5 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-950 hover:bg-blue-50">
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}
