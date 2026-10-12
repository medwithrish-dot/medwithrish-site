import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MedWithRish | MedWithRish",
  description: "Meet Rishoo and learn about MedWithRish medical and dental admissions resources and tutoring.",
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
    description: "Start with MMI and panel Med interview guidance, then explore one-to-one support.",
    href: "/interviews",
    action: "Visit the Med interview hub",
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
    <main className="min-h-screen medwithrish-bg text-slate-900">
      <Navbar />

      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
          About
        </p>

        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl md:text-5xl">
          The person behind MedWithRish
        </h1>

        <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-600 sm:text-lg">
          I’m Rishoo, a tutor and content creator helping students plan medicine
          and dentistry applications. I share practical guides and offer
          individual support for interviews, personal statements, and academic
          preparation.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {nextSteps.map((step) => (
            <article key={step.href} className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">{step.title}</h2>
              <p className="mt-2.5 flex-1 text-xs sm:text-sm leading-relaxed text-slate-600">{step.description}</p>
              <Link href={step.href} className="mt-4 text-xs font-bold text-blue-600 hover:text-blue-700">
                {step.action} →
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-slate-950 p-6 text-white shadow-sm md:p-8">
          <h2 className="text-xl font-bold sm:text-2xl">Need individual help?</h2>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-slate-300">
            Tell me which stage you’re at and what you’d like to work on. We can
            discuss the support that fits your goals.
          </p>
          <Link href="/contact" className="mt-5 inline-flex rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-slate-950 shadow-xs hover:bg-slate-100">
            Get in touch
          </Link>
        </div>
      </section>
    </main>
  );
}
