import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  MessageSquare,
  Mic,
  Quote,
  Sparkles,
  TreePine,
  Trees,
  TrendingUp,
  UserRoundCheck,
} from "lucide-react";
import { MedicForestLandingShell } from "../ucat/_components/MedicForestLandingShell";

export const metadata: Metadata = {
  title: "About MedicForest | Growing a Community of Future Medics",
  description:
    "Learn about MedicForest - realistic medical school Med interview practice with 550+ free questions, AI feedback, and personalised 1-to-1 tutoring by @medwithrish.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About MedicForest | Growing a Community of Future Medics",
    description:
      "Meet MedicForest: free medical school Med interview questions, realistic practice and personalised tutoring.",
    url: "/about",
    siteName: "MedicForest",
    type: "website",
  },
};

export default function MedicForestAboutPage() {
  return (
    <MedicForestLandingShell>
      <div className="bg-[#f7faf9] text-[#123a3c]">
        {/* 1. HERO */}
        <section className="relative overflow-hidden border-b border-[#0e3b37] bg-gradient-to-b from-[#021f1c] via-[#042724] to-[#06332f] px-5 py-12 text-white sm:px-8 sm:py-14">
          <div className="relative mx-auto max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-950/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#8be5df]">
              <Trees className="h-3.5 w-3.5 text-teal-300" />
              <span>The MedicForest Story</span>
            </div>

            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Growing a community of medics -{" "}
              <span className="text-[#8be5df]">like a forest of trees.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#c6dbd7] sm:text-base">
              MedicForest helps medical applicants prepare more confidently through realistic Med interview practice,
              useful feedback and personalised support - turning an isolating admissions process into a collaborative journey.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#offers"
                className="inline-flex items-center gap-2 rounded-xl bg-[#b9f4db] px-5 py-2.5 text-sm font-bold text-[#042724] shadow-xs transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <a
                href="#philosophy"
                className="inline-flex items-center gap-2 rounded-xl border border-teal-400/30 bg-teal-900/30 px-5 py-2.5 text-sm font-semibold text-[#cde6e2] transition hover:border-teal-300 hover:bg-teal-900/60 hover:text-white"
              >
                <span>Our Philosophy</span>
              </a>
            </div>
          </div>
        </section>

        {/* 2. WHAT MEDICFOREST OFFERS */}
        <section id="offers" className="border-b border-[#e5eeec] bg-white px-5 py-12 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#08787b]">
                What We Do
              </span>
              <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#042724] sm:text-3xl">
                What MedicForest offers
              </h2>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              {/* CARD 1: Med Interview Practice */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#dbe6e4] bg-[#fbfdfc] p-6 shadow-xs transition hover:border-[#159a9d]">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f5] text-[#08787b]">
                      <Mic className="h-5 w-5" />
                    </span>
                    <span className="inline-flex items-center rounded-full border border-[#a8eccf] bg-[#dcf6ec] px-2.5 py-1 text-xs font-bold text-[#044a3e]">
                      550+ FREE practice questions
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#042724]">Med Interview Practice</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4b6368]">
                    Prepare for medical school interviews through structured practice and realistic feedback.
                  </p>

                  <ul className="mt-4 space-y-2 text-xs font-medium text-[#374e53]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08787b]" />
                      <span>MMI + panel preparation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08787b]" />
                      <span>AI Med interview practice</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08787b]" />
                      <span>Personalised feedback</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <Link
                    href="/medicforest/interview/ai-interviews"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#08787b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#042724]"
                  >
                    <span>Explore Med Interview Practice</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* CARD 2: 1-to-1 Tutoring */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#dbe6e4] bg-[#fbfdfc] p-6 shadow-xs transition hover:border-[#159a9d]">
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf7f5] text-[#08787b]">
                      <UserRoundCheck className="h-5 w-5" />
                    </span>
                    <span className="inline-flex items-center rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
                      Personalised 1-on-1
                    </span>
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#042724]">1-to-1 Tutoring</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#4b6368]">
                    Personalised support based on your individual application and preparation needs.
                  </p>

                  <ul className="mt-4 space-y-2 text-xs font-medium text-[#374e53]">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08787b]" />
                      <span>Med Interview coaching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08787b]" />
                      <span>Personal statement support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#08787b]" />
                      <span>Individual feedback</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-6 pt-2">
                  <Link
                    href="/medicforest/tutoring"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#08787b] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#042724]"
                  >
                    <span>Explore Tutoring</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Subtle UCAT mention */}
            <p className="mt-5 text-center text-xs text-[#62777e]">
              UCAT practice tools are currently in development.
            </p>
          </div>
        </section>

        {/* 3. WHY MEDICFOREST */}
        <section id="philosophy" className="border-b border-[#e5eeec] bg-[#f7faf9] px-5 py-12 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-800">
              <TreePine className="h-3.5 w-3.5 text-teal-600" />
              <span>Our Philosophy</span>
            </span>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#042724] sm:text-3xl">
              A solitary tree stands fragile.{" "}
              <span className="text-[#08787b]">A forest stands unbreakable.</span>
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[#4b6368]">
              Medical admissions can feel isolating and overwhelming. MedicForest was created to make preparation more structured, supportive and useful - replacing solitary guesswork with clear progression and shared strength.
            </p>

            {/* Simple process: Practise -> Get Feedback -> Improve */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-[#dce6e5] bg-white px-4 py-2.5 shadow-2xs">
                <Sparkles className="h-4 w-4 text-[#08787b]" />
                <span className="text-xs font-bold text-[#042724]">Practise</span>
              </div>
              <ArrowRight className="hidden h-3.5 w-3.5 text-[#8bab9f] sm:block" />
              <div className="flex items-center gap-2 rounded-xl border border-[#dce6e5] bg-white px-4 py-2.5 shadow-2xs">
                <MessageSquare className="h-4 w-4 text-[#08787b]" />
                <span className="text-xs font-bold text-[#042724]">Get Feedback</span>
              </div>
              <ArrowRight className="hidden h-3.5 w-3.5 text-[#8bab9f] sm:block" />
              <div className="flex items-center gap-2 rounded-xl border border-[#dce6e5] bg-white px-4 py-2.5 shadow-2xs">
                <TrendingUp className="h-4 w-4 text-[#08787b]" />
                <span className="text-xs font-bold text-[#042724]">Improve</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. FOUNDER */}
        <section className="border-b border-[#e5eeec] bg-white px-5 py-12 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-4xl">
            <div className="grid items-center gap-8 md:grid-cols-[200px_minmax(0,1fr)] lg:gap-10">
              {/* Photo */}
              <div className="relative mx-auto w-40 md:w-full">
                <div className="overflow-hidden rounded-2xl border border-[#dbe6e4] bg-[#fbfdfc] p-2 shadow-xs">
                  <Image
                    src="/rish-profile.jpg"
                    alt="Rish - founder of MedicForest and MedWithRish"
                    width={400}
                    height={400}
                    className="aspect-square w-full rounded-xl object-cover object-center"
                    priority
                  />
                  <div className="mt-2 text-center">
                    <p className="text-sm font-bold text-[#042724]">Rish</p>
                    <p className="text-[11px] font-semibold text-[#08787b]">Founder - @medwithrish</p>
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs">
                  <GraduationCap className="h-4 w-4" />
                </div>
              </div>

              {/* Bio */}
              <div>
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#08787b]">
                  Founder
                </span>
                <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-[#042724]">
                  Built from real admissions experience - by @medwithrish
                </h2>

                <p className="mt-3 text-sm leading-relaxed text-[#4b6368]">
                  MedicForest was founded by <strong>Rish</strong>, an admissions mentor and creator trusted by hundreds of aspiring doctors across the UK. Having guided applicants into top medical schools, he saw that students were often left with unhelpful generic question sets rather than targeted, actionable feedback.
                </p>

                <div className="mt-3">
                  <p className="text-xs font-semibold text-[#042724]">Experience helping students with:</p>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-lg bg-[#edf7f5] px-2.5 py-1 font-semibold text-[#08787b]">Medical school interviews</span>
                    <span className="rounded-lg bg-[#edf7f5] px-2.5 py-1 font-semibold text-[#08787b]">Personal statements</span>
                    <span className="rounded-lg bg-[#edf7f5] px-2.5 py-1 font-semibold text-[#08787b]">Medical admissions</span>
                    <span className="rounded-lg bg-[#edf7f5] px-2.5 py-1 font-semibold text-[#08787b]">1-to-1 mentoring</span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border-l-3 border-[#08787b] bg-[#edf7f5]/80 p-3">
                  <div className="flex items-start gap-2">
                    <Quote className="h-4 w-4 shrink-0 text-[#08787b]" />
                    <p className="text-xs italic leading-relaxed text-[#042724]">
                      &ldquo;My mission has always been simple - demystify the medical school journey, replace anxious guesswork with structured practice, and nurture a community where every dedicated applicant can flourish.&rdquo;
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <Link
                    href="/medicforest/tutoring"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#042724]"
                  >
                    <span>1-to-1 Tutoring with Rish</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FINAL CTA */}
        <section className="bg-[#edf7f5] px-5 py-10 text-center sm:px-8 sm:py-12">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-extrabold tracking-tight text-[#042724] sm:text-3xl">
              Start preparing with MedicForest
            </h2>
            <p className="mt-2 text-sm text-[#4b6368]">
              Practise for interviews or get personalised support when you need it.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/medicforest/interview/ai-interviews"
                className="inline-flex items-center gap-2 rounded-xl bg-[#08787b] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#042724]"
              >
                <span>Start Med Interview Practice</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/medicforest/tutoring"
                className="inline-flex items-center gap-2 rounded-xl border border-[#dbe6e4] bg-white px-5 py-2.5 text-xs font-bold text-[#042724] shadow-2xs transition hover:border-[#159a9d] hover:text-[#08787b]"
              >
                <span>Explore Tutoring</span>
              </Link>
            </div>
            <p className="mt-4 text-[11px] text-[#62777e]">
              550+ free Med interview questions • No card required
            </p>
          </div>
        </section>
      </div>
    </MedicForestLandingShell>
  );
}
