import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  alternates: { canonical: "/terms-and-conditions" },
  title: "Terms and Conditions | MedWithRish",
  description: "Terms for using MedWithRish and PhloemAI UCAT Tutor.",
};

const terms = [
  {
    title: "1. About these terms",
    body: [
      "These terms apply when you use MedWithRish websites, resources, tutoring services, downloads and PhloemAI UCAT Tutor.",
      "By creating an account, booking a service or buying a subscription, you agree to these terms. If you are under 18, use the service with permission from a parent or guardian.",
    ],
  },
  {
    title: "2. Educational support only",
    body: [
      "MedWithRish and PhloemAI provide educational and admissions preparation support. They do not guarantee UCAT scores, interview outcomes, offers, admission to any university or any professional outcome.",
      "AI feedback, diagnostics, attention tracking and progress estimates are learning tools. They may be incomplete or inaccurate and should be checked against your own judgement and official guidance.",
    ],
  },
  {
    title: "3. Independent service",
    body: [
      "MedWithRish and PhloemAI are independent and are not endorsed by, affiliated with or approved by the UCAT Consortium, Pearson VUE, universities, medical schools, dental schools or NHS organisations unless explicitly stated.",
      "UCAT rules, dates, test formats and admissions policies can change. You should check official sources before relying on time-sensitive information.",
    ],
  },
  {
    title: "4. Accounts and acceptable use",
    body: [
      "You must provide accurate account information and keep your login details secure.",
      "You must not share paid account access, scrape content, attempt to bypass payment or security controls, upload harmful code, misuse AI outputs, or use the service for unlawful purposes.",
      "We may suspend or remove access if we reasonably believe these terms have been breached or the service is being misused.",
    ],
  },
  {
    title: "5. Paid subscriptions and digital content",
    body: [
      "Premium PhloemAI features are sold as digital services. Prices, billing interval and taxes are shown at checkout before you pay.",
      "Payments and subscriptions are handled by Stripe. You can manage or cancel your subscription through the billing portal where available, or by contacting medwithrish@gmail.com.",
      "Where premium access starts immediately after checkout, you agree that the digital service begins before the end of any cancellation period. Your statutory rights are not affected.",
      "Refunds are considered case by case and do not affect any rights you have under UK consumer law.",
      "If you want to use a cancellation notice, email medwithrish@gmail.com with: I hereby give notice that I cancel my contract for PhloemAI Premium, your name, account email, order date and today's date.",
    ],
  },
  {
    title: "6. Intellectual property",
    body: [
      "The website, question sets, explanations, AI prompts, designs, text and resources are owned by or licensed to MedWithRish unless stated otherwise.",
      "You may use materials for your own personal study. You must not copy, resell, redistribute or publish them without written permission.",
    ],
  },
  {
    title: "7. Data and privacy",
    body: [
      "Use of personal data is explained in the Privacy Policy. PhloemAI also collects practice telemetry such as answer choices, timings, calculator usage and optional attention tracking data to provide feedback.",
      "Do not enter sensitive medical information, confidential third-party data or other information that is not needed for the service.",
    ],
  },
  {
    title: "8. Availability and changes",
    body: [
      "We try to keep the service available and accurate, but we do not promise uninterrupted access or that every feature will be error-free.",
      "Features, prices, content and these terms may be updated. Material changes will be made clear where appropriate.",
    ],
  },
  {
    title: "9. Liability",
    body: [
      "Nothing in these terms excludes or limits liability where it would be unlawful to do so, including liability for death or personal injury caused by negligence, fraud or your statutory consumer rights.",
      "Subject to that, MedWithRish is not responsible for indirect losses, lost opportunities, exam outcomes, admissions decisions or losses caused by relying on AI feedback as a guarantee.",
    ],
  },
  {
    title: "10. Governing law and contact",
    body: [
      "These terms are governed by the laws of England and Wales, although you may also have mandatory consumer rights in the part of the UK where you live.",
      "For questions, cancellations, refund requests or data requests, contact medwithrish@gmail.com.",
    ],
  },
];

export default function TermsAndConditionsPage() {
  return (
    <main className="min-h-screen bg-[#f8fbff] text-slate-950">
      <Navbar />
      <div className="mx-auto max-w-4xl px-5 py-10">
        <Link
          href="/"
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-300 hover:text-blue-700"
        >
          Back to homepage
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Legal
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Last updated: 7 May 2026. Please read these terms before creating an
            account, buying premium access or using PhloemAI.
          </p>
        </header>

        <div className="mt-5 space-y-4">
          {terms.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-black">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm font-medium leading-7 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold">
          <Link href="/privacy-policy" className="text-blue-600 hover:text-blue-700">
            Privacy Policy
          </Link>
          <Link href="/phloemai-disclaimer" className="text-blue-600 hover:text-blue-700">
            PhloemAI disclaimer
          </Link>
          <a href="mailto:medwithrish@gmail.com" className="text-blue-600 hover:text-blue-700">
            medwithrish@gmail.com
          </a>
        </div>
      </div>
    </main>
  );
}
