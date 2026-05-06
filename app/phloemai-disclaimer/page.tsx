import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "PhloemAI Disclaimer | MedWithRish",
  description: "Important limits for PhloemAI AI feedback, data collection and UCAT preparation.",
};

const points = [
  {
    title: "Educational guidance, not a guarantee",
    text: "PhloemAI provides UCAT preparation support. It does not guarantee a score, percentile, decile, interview, offer or admission outcome.",
  },
  {
    title: "AI can be wrong",
    text: "AI feedback may be incomplete, outdated or incorrect. Use it as a study aid and check important decisions against official UCAT, university and admissions guidance.",
  },
  {
    title: "Attention tracking is approximate",
    text: "Mouse tracking and experimental eye tracking estimate broad focus zones. They are not medical, psychological or diagnostic tools.",
  },
  {
    title: "Webcam use is optional",
    text: "Experimental eye tracking only runs after browser camera permission. The live camera feed is processed in your browser for focus estimation; MedWithRish does not store webcam video.",
  },
  {
    title: "Practice telemetry is collected",
    text: "When you mark a set, PhloemAI can save answers, timings, answer switches, flags, calculator usage, keyboard shortcuts, navigation activity, optional attention summaries and overall session results.",
  },
  {
    title: "Independent from exam bodies",
    text: "PhloemAI is independent and is not endorsed by or affiliated with the UCAT Consortium, Pearson VUE, universities or medical/dental schools.",
  },
];

export default function PhloemAIDisclaimerPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <Navbar />
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/phloemai"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700"
        >
          Back to PhloemAI
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            PhloemAI
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            AI and Data Disclaimer
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Last updated: 7 May 2026. This explains the main limits of PhloemAI
            feedback and tracking before you use the tutor.
          </p>
        </header>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {points.map((point) => (
            <section
              key={point.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-black">{point.title}</h2>
              <p className="mt-3 text-sm font-medium leading-7 text-slate-600">
                {point.text}
              </p>
            </section>
          ))}
        </div>

        <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold leading-7 text-amber-900">
          Do not enter sensitive medical information, third-party personal data
          or confidential admissions material unless it is clearly needed for a
          specific service. For privacy or deletion requests, email{" "}
          <a href="mailto:medwithrish@gmail.com" className="font-black underline">
            medwithrish@gmail.com
          </a>
          .
        </section>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/terms-and-conditions" className="text-blue-600 hover:text-blue-700">
            Terms and Conditions
          </Link>
          <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </main>
  );
}
