import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Compass,
  GraduationCap,
  HeartHandshake,
  Quote,
  ShieldCheck,
  Sprout,
  Target,
  TreePine,
  Trees,
  Trophy,
  Users,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: "About MedicForest | Growing a Community of Future Medics",
  description:
    "Learn about MedicForest — founded by @medwithrish to cultivate a supportive community of aspiring medics, with intelligent UCAT analytics, realistic interview coaching, and proven admissions mentorship.",
  alternates: { canonical: "/about" },
};

const forestPillars = [
  {
    icon: Sprout,
    title: "Deep Roots — Intelligent Foundations",
    description:
      "A solitary seed cannot thrive without nourishing soil. MedicForest begins by analysing your specific habits, timing, and question behaviour — pinpointing exactly where marks slip away before you build upward.",
    badge: "Foundation",
  },
  {
    icon: TreePine,
    title: "Strong Trunks — Clinical Resilience",
    description:
      "Medical school selection tests not just recall, but composure under intense scrutiny. Our voice-enabled MMI stations and structured rubrics help you develop clear articulation, ethical insight, and self-belief.",
    badge: "Growth",
  },
  {
    icon: Trees,
    title: "The Living Forest — A Collaborative Community",
    description:
      "Trees in a forest intertwine their roots beneath the earth, share strength through storms, and grow far taller together than any lone trunk could. We turn isolating admissions into a shared journey of mutual encouragement.",
    badge: "Community",
  },
] as const;

const corePrinciples = [
  {
    icon: Compass,
    title: "Actionable clarity over score anxiety",
    text: "Raw numbers tell you where you stand — they do not tell you how to improve. MedicForest translates every practice set into a clear, focused next step so you always know what to tackle tomorrow.",
  },
  {
    icon: Brain,
    title: "Built around how your brain learns",
    text: "We track response latency, hesitation patterns, and cognitive fatigue to diagnose the underlying causes of errors — helping you replace guesswork with dependable clinical reasoning.",
  },
  {
    icon: HeartHandshake,
    title: "Human mentorship at the centre",
    text: "Intelligent technology should amplify human warmth, not replace it. Every diagnostic metric, markscheme, and model answer is grounded in real-world teaching experience and medical school standards.",
  },
] as const;

const successStories = [
  {
    src: "/success-stories/story-2410-b2.png",
    alt: "Student UCAT score 2410 Band 2",
    tag: "UCAT Achievement",
    headline: "2410 Band 2",
    subtext: "Top national percentile — near-perfect scores across all cognitive subtests.",
  },
  {
    src: "/success-stories/story1.jpeg",
    alt: "Student received 4 out of 4 medicine offers",
    tag: "Medicine Offer",
    headline: "4 / 4 Medicine Offers",
    subtext: "Secured formal offers from all four university medical programmes applied to.",
  },
  {
    src: "/success-stories/story-2340-b2.png",
    alt: "Student UCAT score 2340 Band 2",
    tag: "UCAT Achievement",
    headline: "2340 Band 2",
    subtext: "Top 4% nationally — outstanding consistency throughout every timed section.",
  },
  {
    src: "/success-stories/story5.jpeg",
    alt: "Oxbridge medicine offer success story",
    tag: "Medicine Offer",
    headline: "Oxbridge Medicine Offer",
    subtext: "Secured prestigious admission following intensive interview strategy and mock panel practice.",
  },
  {
    src: "/success-stories/story-2170-b2.png",
    alt: "Student UCAT score 2170 Band 2 with 880 QR",
    tag: "UCAT Achievement",
    headline: "2170 Band 2 (880 in QR)",
    subtext: "Mastered numerical timing techniques to achieve a stellar 880 in Quantitative Reasoning.",
  },
  {
    src: "/success-stories/story3.jpeg",
    alt: "Student medicine offer success story",
    tag: "Medicine Offer",
    headline: "Interview Breakthrough to Offer",
    subtext: "Transformed communication confidence to turn a single interview into a confirmed medical offer.",
  },
] as const;

export default function MedicForestAboutPage() {
  return (
    <MedicForestLandingShell>
      <div className="bg-[#f7faf9] text-[#123a3c]">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-[#0e3b37] bg-gradient-to-b from-[#021f1c] via-[#042724] to-[#06332f] px-5 py-16 text-white sm:px-8 lg:py-24">
          {/* Subtle background ambient forest light */}
          <div
            className="pointer-events-none absolute -right-20 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -left-20 bottom-0 h-[450px] w-[450px] rounded-full bg-teal-400/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-5xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8be5df] backdrop-blur-xs">
              <Trees className="h-3.5 w-3.5 text-teal-300" />
              <span>The MedicForest Story</span>
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Growing a community of medics —{" "}
              <span className="text-[#8be5df]">like a forest of trees.</span>
            </h1>

            <p className="mt-6 max-w-3xl text-base font-normal leading-relaxed text-[#c6dbd7] sm:text-lg lg:text-xl">
              MedicForest was created on a single, unwavering belief — no aspiring doctor should have
              to navigate the pressure of medical admissions alone. We combine precision diagnostic
              analytics, realistic speech-enabled interview training, and genuine peer camaraderie into
              one living, supportive ecosystem.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/ucat"
                className="inline-flex items-center gap-2 rounded-xl bg-[#b9f4db] px-6 py-3.5 text-sm font-bold text-[#042724] shadow-sm transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <a
                href="#forest-vision"
                className="inline-flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-900/30 px-6 py-3.5 text-sm font-semibold text-[#cde6e2] backdrop-blur-xs transition hover:border-teal-300 hover:bg-teal-900/60 hover:text-white"
              >
                <span>Our Philosophy</span>
              </a>
            </div>

            {/* Quick trust metrics */}
            <div className="mt-12 grid grid-cols-2 gap-4 border-t border-teal-900/60 pt-8 sm:grid-cols-4">
              <div>
                <p className="text-2xl font-extrabold text-[#8be5df] sm:text-3xl">2410 B2</p>
                <p className="mt-1 text-xs font-medium text-[#9abeb8]">Top-percentile UCAT score</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#8be5df] sm:text-3xl">4 / 4</p>
                <p className="mt-1 text-xs font-medium text-[#9abeb8]">Medicine offers achieved</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#8be5df] sm:text-3xl">100%</p>
                <p className="mt-1 text-xs font-medium text-[#9abeb8]">Personalised feedback</p>
              </div>
              <div>
                <p className="text-2xl font-extrabold text-[#8be5df] sm:text-3xl">UK-Wide</p>
                <p className="mt-1 text-xs font-medium text-[#9abeb8]">Medical applicant community</p>
              </div>
            </div>
          </div>
        </section>

        {/* The Forest Metaphor Section */}
        <section id="forest-vision" className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800 border border-teal-100">
              <TreePine className="h-3.5 w-3.5 text-teal-600" />
              <span>Why &quot;MedicForest&quot;?</span>
            </span>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-[#0d2c2e]">
              A solitary tree stands fragile.{" "}
              <span className="text-teal-700 block sm:inline">A forest stands unbreakable.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-[#4a6568] sm:text-lg">
              In nature, trees that grow in isolation bear the full brunt of storms — their roots
              stay shallow, their branches snap, and their growth remains fragile. But inside an ancient
              forest, trees weave their root systems together beneath the soil. They trade resources,
              shield one another from harsh winds, and lift the entire canopy upward.
            </p>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#5e797c]">
              Medical admissions has spent decades being treated as a lonely, secretive competition.
              MedicForest was built to cultivate something fundamentally healthier — a collaborative
              network of future colleagues who elevate each other through every hurdle.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {forestPillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="relative flex flex-col justify-between rounded-2xl border border-gray-200/90 bg-white p-7 shadow-xs transition hover:border-teal-300 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <Icon className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-600">
                        {pillar.badge}
                      </span>
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[#0d2c2e]">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#4a6568]">{pillar.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Core Principles */}
        <section className="border-y border-[#d7e3e1] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                How We Work
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d2c2e] sm:text-4xl">
                Preparation designed with intention.
              </h2>
              <p className="mt-3 text-base text-[#4a6568]">
                We rejected the tired model of endlessly grinding questions without reflection.
                Everything we build centres around actionable feedback and measurable confidence.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {corePrinciples.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-2xl border border-gray-100 bg-[#fbfdfc] p-6 shadow-xs transition hover:border-teal-200 hover:bg-white"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100/70 text-teal-800">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-base font-bold text-[#0d2c2e]">{title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#536d72]">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Meet the Founder: Rish */}
        <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
            {/* Founder photo with clean card styling */}
            <div className="relative">
              <div className="overflow-hidden rounded-3xl border border-[#d7e3e1] bg-white p-3.5 shadow-md">
                <Image
                  src="/rish-profile.jpg"
                  alt="Rish — founder of MedicForest and MedWithRish"
                  width={700}
                  height={700}
                  className="aspect-square w-full rounded-2xl object-cover object-center shadow-xs"
                  priority
                />
                <div className="mt-3.5 px-2 pb-1 text-center">
                  <p className="text-base font-bold text-[#0d2c2e]">Rish</p>
                  <p className="text-xs font-semibold text-teal-700">
                    Founder — MedWithRish &amp; MedicForest
                  </p>
                </div>
              </div>

              {/* Decorative accent icon */}
              <div className="absolute -bottom-3 -right-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg">
                <GraduationCap className="h-6 w-6" />
              </div>
            </div>

            {/* Founder narrative */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700 border border-teal-100">
                <span>Who Built MedicForest</span>
              </div>

              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#0d2c2e] sm:text-4xl">
                Built from real admissions experience — by @medwithrish
              </h2>

              <p className="mt-5 text-base leading-relaxed text-[#4a6568]">
                MedicForest was created by <strong>Rish</strong> — a medical admissions mentor, tutor,
                and content creator trusted by hundreds of aspiring doctors across the country. Over years
                of working directly with applicants, Rish observed a recurring frustration — students were
                spending hundreds of pounds on generic test platforms that handed them raw scores without
                ever showing them <em>how</em> to fix their mistakes.
              </p>

              <p className="mt-3.5 text-base leading-relaxed text-[#4a6568]">
                MedicForest was born to turn high-level admissions mentorship into an interactive, daily
                reality. Every diagnostic rule, MMI station markscheme, and timing recommendation inside the
                platform is directly distilled from years of successful medical admissions coaching.
              </p>

              {/* Founder quote */}
              <div className="mt-6 rounded-2xl border-l-4 border-teal-600 bg-teal-50/70 p-5">
                <div className="flex items-start gap-3">
                  <Quote className="h-5 w-5 shrink-0 text-teal-700" />
                  <p className="text-sm italic leading-relaxed text-[#0d2c2e]">
                    &ldquo;My mission has always been simple — demystify the medical school journey,
                    replace anxious guesswork with structured practice, and nurture a community where
                    every dedicated applicant can flourish.&rdquo;
                  </p>
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/tutoring"
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-xs transition hover:bg-teal-800"
                >
                  <span>1-1 Tutoring with Rish</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://medwithrish.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-[#0d2c2e] shadow-xs transition hover:border-teal-300 hover:text-teal-700"
                >
                  <span>Visit MedWithRish.com</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Real Student Outcomes & Success Stories */}
        <section className="border-t border-[#d7e3e1] bg-white px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  <span>Proven Track Record</span>
                </div>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0d2c2e] sm:text-4xl">
                  Real outcomes from our community
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#4a6568] sm:text-base">
                  A glimpse into the scores, interview breakthroughs, and university offers achieved by
                  students guided through our admissions methodology.
                </p>
              </div>

              <Link
                href="/tutoring"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-teal-700 hover:underline"
              >
                <span>View tutoring options</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Success story cards — cleanly framed so nothing is super-cropped */}
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {successStories.map((story) => (
                <div
                  key={story.headline}
                  className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-[#f8fafb] shadow-xs transition hover:border-teal-300 hover:shadow-md"
                >
                  {/* Image container with object-contain */}
                  <div className="relative flex h-52 w-full items-center justify-center border-b border-gray-200/80 bg-white p-3">
                    <Image
                      src={story.src}
                      alt={story.alt}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 360px"
                    />
                  </div>

                  {/* Card description */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-800 border border-teal-200/60">
                        {story.tag}
                      </span>
                      <h3 className="mt-2 text-base font-bold text-[#0d2c2e]">{story.headline}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-[#536d72]">{story.subtext}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Community & Growth Callout Section */}
        <section className="bg-gradient-to-b from-white to-[#edf7f5] px-5 py-16 sm:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
              <Users className="h-3.5 w-3.5" />
              <span>Plant Your Roots</span>
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-[#0d2c2e] sm:text-4xl lg:text-5xl">
              Ready to grow with a community of future medics?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#4a6568] sm:text-lg">
              Whether you are sitting your first UCAT diagnostic, tackling ethics scenarios, or polishing
              your communication for panel interviews — MedicForest gives you the ground to stand on.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
              <Link
                href="/ucat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-7 py-4 text-base font-bold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                <span>Launch Free UCAT Diagnostic</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/interviews"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-4 text-base font-bold text-[#0d2c2e] shadow-xs transition hover:border-teal-300 hover:text-teal-700"
              >
                <span>Explore AI Interviews</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </MedicForestLandingShell>
  );
}
