import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  alternates: { canonical: "/medicforest-disclaimer" },
  title: "MedicForest AI & Data Disclaimer | MedWithRish",
  description: "Important disclosures regarding MedicForest AI interview simulations, speech transcription, UCAT practice telemetry, and independence from official exam bodies.",
};

const points = [
  {
    title: "1. Educational guidance, not an admissions guarantee",
    text: "MedicForest provides preparatory tools for UCAT exams and medical/dental school interviews. We do not guarantee any specific test score, decile, percentile, interview invitation, offer, or university admission outcome. Admissions criteria and decisions rest entirely with individual universities and medical schools.",
  },
  {
    title: "2. AI interview simulation and marking limitations",
    text: "Our AI Medical Interview platform simulates Multiple Mini Interview (MMI) and panel stations using automated language models and dynamic follow-up questioning. While rubrics are modelled on medical school criteria (such as STARR structure, communication clarity, NHS values, and GMC ethical principles), AI evaluations are educational approximations and do not replicate the clinical judgement or scoring of human university examiners.",
  },
  {
    title: "3. Microphone audio and speech transcription",
    text: "When practising spoken stations, your browser microphone records your responses for speech-to-text transcription. Background noise, hardware limitations, speech pace, and regional accents may affect transcription accuracy. Temporary audio buffers are processed solely to produce your transcript and feedback, and are not retained as permanent voice files.",
  },
  {
    title: "4. Granular UCAT practice telemetry",
    text: "When completing questions, drills, or timed mock exams, MedicForest records detailed interaction data including answer choices, time spent per question, answer switching, flagged questions, calculator keystrokes, and keyboard shortcut usage. This telemetry is used strictly to power your diagnostic reports, timing analysis, and personalised study recommendations.",
  },
  {
    title: "5. Community leaderboards and study groups",
    text: "Collaborative study groups and public leaderboards display your chosen username and opt-in scores to other students. We employ automated moderation filters to prevent offensive, vulgar, or identifiable handles. You can choose to opt out of public leaderboard rankings at any time via your account settings.",
  },
  {
    title: "6. Complete independence from official bodies",
    text: "MedicForest is entirely independent and is not affiliated with, endorsed by, sponsored by, or operated in partnership with the UCAT Consortium, Pearson VUE, UCAS, the General Medical Council (GMC), the National Health Service (NHS), or any university medical or dental school.",
  },
];

export default function MedicForestDisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <Navbar />
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/medicforest"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
        >
          Back to MedicForest
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            MedicForest Platform
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            AI & Data Disclaimer
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Last updated: 4 October 2026. This notice outlines the technical capabilities,
            operational boundaries, AI marking limits, and data telemetry used across the MedicForest platform.
          </p>
        </header>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {points.map((point) => (
            <section
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">{point.title}</h2>
              <p className="mt-3 text-base font-normal leading-7 text-slate-600">
                {point.text}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-base font-normal leading-7 text-amber-900 sm:p-8">
          <h2 className="text-base font-semibold text-amber-950">Important Notice Regarding Confidential Data</h2>
          <p className="mt-2">
            Never submit confidential patient identifiable data, NHS clinical records, real patient case details
            from hospital or GP work placements, or proprietary third-party examination materials into any interview station
            or text box. MedicForest is strictly an educational preparation platform.
          </p>
          <p className="mt-3">
            For data protection, privacy enquiries, or deletion requests, email{" "}
            <a href="mailto:medwithrish@gmail.com" className="font-semibold underline hover:text-amber-950">
              medwithrish@gmail.com
            </a>
            .
          </p>
        </section>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Legal Documentation</h3>
          <p className="mt-1 text-sm text-slate-600">
            Review our complete Terms and Conditions and Privacy Policy for full legal information.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">
              Terms and Conditions
            </Link>
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
            <a href="mailto:medwithrish@gmail.com" className="text-blue-600 hover:underline">
              medwithrish@gmail.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
