import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Brain, Compass, HeartHandshake } from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: "About MedicForest | Medical admissions preparation",
  description:
    "Learn what MedicForest does, meet founder @medwithrish, and see outcomes from students supported through medical admissions.",
  alternates: { canonical: "/medicforest/about" },
};

const principles = [
  {
    icon: Compass,
    title: "A clear next step",
    text: "Turn practice results into a focused action instead of another overwhelming list of scores.",
  },
  {
    icon: Brain,
    title: "Built around how you learn",
    text: "Use timing, confidence and answer behaviour to identify the habits behind lost marks.",
  },
  {
    icon: HeartHandshake,
    title: "Human guidance at its core",
    text: "Technology supports the same practical, student-first approach used across MedWithRish tutoring.",
  },
] as const;

const stories = [
  { src: "/success-stories/story5.jpeg", alt: "Student message celebrating a high UCAT result" },
  { src: "/success-stories/story1.jpeg", alt: "Student message celebrating four medicine offers" },
  { src: "/success-stories/story4.jpeg", alt: "Student message celebrating a top-percentile UCAT score" },
] as const;

export default function MedicForestAboutPage() {
  return (
    <MedicForestLandingShell>
      <div className="bg-[#f7faf9] text-[#123a3c]">
        <section className="border-b border-[#d7e3e1] bg-[#042724] px-5 py-16 text-white sm:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#8be5df]">About MedicForest</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
              Medical admissions preparation that tells you what to do next.
            </h1>
            <p className="mt-6 max-w-3xl text-lg font-normal leading-8 text-[#c6dbd7]">
              MedicForest brings UCAT practice, interview preparation and guided progress into one place. It is designed to make complex feedback useful, personal and easy to act on.
            </p>
            <Link href="/medicforest/ucat/dashboard" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#b9f4db] px-5 py-3 text-sm font-semibold text-[#042724] transition hover:bg-white">
              Explore MedicForest <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="grid gap-5 md:grid-cols-3">
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-[#d7e3e1] bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8f3f2] text-[#08787b]"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h2 className="mt-5 text-lg font-semibold">{title}</h2>
                <p className="mt-2 text-sm font-normal leading-6 text-[#536d72]">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-[#d7e3e1] bg-white px-5 py-14 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[320px_minmax(0,1fr)]">
            <div className="overflow-hidden rounded-3xl border border-[#d7e3e1] bg-[#edf7f3] p-3 shadow-sm">
              <Image src="/rish-profile.jpg" alt="Rish, founder of MedicForest and MedWithRish" width={700} height={700} className="aspect-square w-full rounded-2xl object-cover" priority />
            </div>
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-[#08787b]">Meet the founder</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Built by @medwithrish</h2>
              <p className="mt-5 text-base font-normal leading-8 text-[#536d72]">
                Rish is a medical admissions tutor and creator who has helped applicants prepare for the UCAT, personal statements and interviews. MedicForest turns that hands-on experience into structured tools students can use between tutoring sessions and throughout their application.
              </p>
              <p className="mt-4 text-base font-normal leading-8 text-[#536d72]">
                The goal is simple: make high-quality preparation clearer and more accessible, while keeping every recommendation grounded in practical admissions experience.
              </p>
              <a href="https://www.medwithrish.com" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#08787b] hover:underline">
                Visit MedWithRish <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.16em] text-[#08787b]"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Student success</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Real messages from MedWithRish students</h2>
            <p className="mt-4 text-base font-normal leading-7 text-[#536d72]">A selection of the results and offers shared by students supported through the original MedWithRish platform.</p>
          </div>
          <div className="mt-8 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {stories.map((story) => (
              <figure key={story.src} className="mb-5 break-inside-avoid overflow-hidden rounded-2xl border border-[#d7e3e1] bg-white p-3 shadow-sm">
                <Image src={story.src} alt={story.alt} width={900} height={1200} className="h-auto w-full rounded-xl object-contain" />
              </figure>
            ))}
          </div>
          <Link href="/#success-stories" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#08787b] hover:underline">
            See more success stories <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </MedicForestLandingShell>
  );
}
