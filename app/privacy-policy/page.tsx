import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy-policy" },
  title: "Privacy Policy | MedWithRish",
  description: "How MedWithRish and PhloemAI collect, use and protect personal data.",
};

const sections = [
  {
    title: "Who we are",
    body: [
      "MedWithRish provides medical and dental admissions resources, tutoring and PhloemAI UCAT Tutor. For privacy questions, contact medwithrish@gmail.com.",
      "This policy explains how we use personal data under UK data protection law, including the UK GDPR and Data Protection Act 2018.",
    ],
  },
  {
    title: "Data we collect",
    body: [
      "Account data: name, email address, login details and subscription status.",
      "Contact and booking data: messages, enquiries, session details and customer support records.",
      "Payment data: Stripe customer and subscription identifiers. Card details are handled by Stripe and are not stored by MedWithRish.",
      "PhloemAI practice data: answers, correct/incorrect status, section, question type, timings, visits, flags, answer switches, calculator usage, keyboard shortcuts, navigation actions and review activity.",
      "Optional attention tracking data: mouse or experimental eye-tracking focus zones, region switches and time spent around broad parts of the question interface. Webcam video is not stored by MedWithRish.",
      "Analytics and technical data: pages visited, approximate device/browser information, errors and security logs.",
    ],
  },
  {
    title: "How we use data",
    body: [
      "To provide accounts, diagnostics, practice sets, progress tracking and AI feedback.",
      "To manage subscriptions, billing, fraud prevention and customer support.",
      "To improve the service, debug issues and keep the platform secure.",
      "To comply with legal, tax, accounting and consumer protection obligations.",
    ],
  },
  {
    title: "Cookies and browser storage",
    body: [
      "We use essential cookies or browser storage where needed for login sessions, security, preferences and checkout flows.",
      "We may use privacy-focused analytics to understand page views and product performance. We do not use non-essential marketing cookies unless a separate consent process is provided.",
    ],
  },
  {
    title: "Lawful basis",
    body: [
      "Contract: to provide the service you request, including account access, practice tools and paid subscriptions.",
      "Legitimate interests: to secure, maintain and improve the service, provided those interests do not override your rights.",
      "Consent: for optional features where consent is required, such as experimental webcam eye tracking or marketing communications if offered.",
      "Legal obligation: where we must keep records or respond to lawful requests.",
    ],
  },
  {
    title: "AI, tracking and sensitive information",
    body: [
      "PhloemAI is for educational support. AI feedback and attention estimates may be incomplete or inaccurate and should not be treated as guaranteed exam, admissions, medical, legal or financial advice.",
      "Do not enter health information, special category data, third-party personal data or confidential university/application information unless clearly needed for a specific service.",
      "Mouse tracking and eye tracking are optional. Eye tracking uses your browser camera permission and processes a live camera stream in the browser to estimate focus zones. We store only derived practice telemetry, not webcam video.",
      "Experimental eye tracking may load browser-side model files from third-party content delivery networks before it can run.",
    ],
  },
  {
    title: "Children and students",
    body: [
      "Many UCAT users are students. Privacy information is written in plain language for students and parents/guardians.",
      "If you are under 18, use paid services and PhloemAI accounts with parent or guardian permission. If a parent or guardian believes a child has provided personal data without appropriate permission, contact medwithrish@gmail.com.",
    ],
  },
  {
    title: "Processors and transfers",
    body: [
      "We use service providers such as Supabase for authentication/database storage, Stripe for payments, Vercel for hosting/analytics and email or support tools where needed.",
      "Some providers may process data outside the UK. Where this happens, we rely on appropriate safeguards used by those providers, such as contractual protections or recognised transfer mechanisms.",
    ],
  },
  {
    title: "How long we keep data",
    body: [
      "Account and practice data is normally kept while your account remains active, so your progress and feedback can work.",
      "Payment, tax and accounting records may be kept for the period required by law.",
      "You can request deletion of your account or practice data by emailing medwithrish@gmail.com. Some records may need to be retained where the law requires it.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You may have rights to access, correct, erase, restrict or object to processing of your personal data, and to request a portable copy of data in certain circumstances.",
      "You can withdraw consent for optional processing where consent is the lawful basis.",
      "You can complain to the Information Commissioner's Office at ico.org.uk if you are unhappy with how your data is handled, although we would appreciate the chance to help first.",
    ],
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Last updated: 7 May 2026. This page explains what personal data is
            collected, why it is used and how to contact us.
          </p>
        </header>

        <div className="mt-5 space-y-4">
          {sections.map((section) => (
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
          <Link href="/terms-and-conditions" className="text-blue-600 hover:text-blue-700">
            Terms and Conditions
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
