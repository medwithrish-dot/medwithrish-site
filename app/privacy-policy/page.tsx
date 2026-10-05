import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  alternates: { canonical: "/privacy-policy" },
  title: "Privacy Policy | MedWithRish & MedicForest",
  description: "Comprehensive privacy policy for MedWithRish and MedicForest, detailing data protection, AI interviews, audio processing, UCAT telemetry, and Stripe billing under UK GDPR.",
};

const sections = [
  {
    title: "1. Who we are and controller details",
    body: [
      "MedWithRish ('we', 'us', 'our') operates medwithrish.com and the MedicForest preparation platform, providing medical and dental admissions resources, 1-to-1 tutoring, UCAT question banks, and AI-powered medical interview simulations.",
      "For the purposes of the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018, MedWithRish is the data controller responsible for your personal information. If you have any questions about this policy or wish to exercise your data rights, you can contact us at medwithrish@gmail.com.",
    ],
  },
  {
    title: "2. Personal data we collect",
    body: [
      "Account and profile information: your name, email address, chosen display username, password hash (managed securely via Supabase Auth), account creation date, and subscription status.",
      "Microphone and speech data: when you practise spoken stations in the MedicForest AI Interview platform, we capture live audio from your microphone to convert your spoken answers into text. We process this audio stream to generate transcripts, assess structure and timing, and evaluate interview performance.",
      "UCAT practice and telemetry data: question answers, question status (correct or incorrect), timing per question, answer switching behaviour, flagged questions, calculator keystrokes, keyboard shortcut usage, navigation paths, mock exam scores, and diagnostic weakness analytics.",
      "Admissions and tutoring records: consultation requests, personal statement drafts, feedback notes, interview preparation plans, and customer support communications.",
      "Billing and payment information: Stripe customer identifiers, subscription IDs, payment status, transaction timestamps, and invoice records. Payment card numbers, security codes, and bank details are handled directly by Stripe and are never received or stored by MedWithRish.",
      "Technical and usage data: IP address, device type, operating system, browser details, page interaction metrics, error logs, and session identifiers.",
    ],
  },
  {
    title: "3. How we use your data and lawful bases",
    body: [
      "Contractual necessity: to deliver the services you request, including maintaining your account, generating personalized UCAT practice sets, conducting AI medical interview simulations, processing subscriptions, and delivering 1-to-1 tutoring sessions.",
      "Legitimate interests: to monitor platform performance, prevent cheating or automated abuse, improve educational rubrics, diagnose bugs, and secure our infrastructure, ensuring these interests do not override your privacy rights.",
      "Explicit consent: for browser microphone access used in AI spoken interview stations. You can grant or revoke microphone access at any time through your browser settings. Where consent is given, it forms the lawful basis for processing live voice audio.",
      "Legal and regulatory obligations: to maintain accounting, tax, billing, and transaction records in compliance with UK statutory requirements and consumer protection law.",
    ],
  },
  {
    title: "4. Microphone audio and AI speech processing",
    body: [
      "MedicForest AI Interview simulations allow applicants to practise spoken Multiple Mini Interview (MMI) and panel stations using browser microphone input.",
      "Audio streams are captured temporarily to produce speech-to-text transcriptions. These transcripts are evaluated by automated educational AI models to provide feedback on communication clarity, structure (such as STARR technique), NHS values, and ethics, as well as to generate contextual follow-up probing questions.",
      "Audio recordings are processed solely to generate your transcript and feedback. Voice recordings are not sold, not used for voice biometric profiling, and not used for marketing. You may also choose to practise stations in text mode if you prefer not to use a microphone.",
    ],
  },
  {
    title: "5. Community features, study groups and leaderboards",
    body: [
      "MedicForest provides collaborative study groups, practice rooms, and an optional public leaderboard.",
      "If you participate in leaderboards or group rooms, your chosen display username and opt-in scores or station statistics may be visible to other members. We use automated moderation and profanity filters to prevent offensive, abusive, or identifying handles.",
      "You can choose to opt out of public leaderboards at any time via your account settings, which removes your entries from public display.",
    ],
  },
  {
    title: "6. Cookies and local browser storage",
    body: [
      "Essential cookies: we use secure session cookies and tokens strictly necessary for authentication (via Supabase), security verification, and Stripe checkout redirects.",
      "Local browser storage: we use browser local storage and session storage to preserve unsaved interview drafts, calculator state, active timers, and interface preferences so your work is not lost if your browser refreshes.",
      "We do not use invasive third-party cross-site advertising trackers.",
    ],
  },
  {
    title: "7. Third-party processors and service providers",
    body: [
      "We partner with reputable infrastructure and software providers who act as data processors under strict contractual obligations:",
      "- Supabase Inc.: secure database hosting, user authentication, and data encryption at rest.",
      "- Stripe, Inc.: PCI-DSS Level 1 certified payment processing, customer billing management, and self-service Customer Portal.",
      "- Vercel Inc.: application hosting, edge network routing, serverless execution, and technical error monitoring.",
      "- AI Speech and Language Model providers: secure enterprise API services (such as OpenAI and Google Cloud) used solely to transcribe spoken audio and generate educational feedback. Data sent via these APIs is subject to confidentiality agreements and is not used to train public foundation models.",
    ],
  },
  {
    title: "8. International data transfers",
    body: [
      "Some of our third-party infrastructure providers operate servers located outside the United Kingdom, including in the United States and the European Economic Area.",
      "Where personal data is transferred internationally, we ensure appropriate safeguards are in place, including UK International Data Transfer Agreements (IDTA), the UK Addendum to EU Standard Contractual Clauses (SCCs), or adequacy regulations approved by the UK Government.",
    ],
  },
  {
    title: "9. Data retention and account deletion",
    body: [
      "Account credentials, practice statistics, mock results, and saved interview transcripts are retained for as long as your account remains active so that you can track your progress over time.",
      "Temporary audio buffers are discarded once transcription and feedback generation are complete.",
      "Financial transaction and invoice records are retained for the statutory period required by UK tax and accounting legislation (typically six years).",
      "You can request full deletion of your account and associated personal data at any time through the Manage Account area or by emailing medwithrish@gmail.com. Upon request, your account and learning records will be permanently erased, except where retention is legally required.",
    ],
  },
  {
    title: "10. Student safety, parents and guardians",
    body: [
      "MedicForest and MedWithRish are designed primarily for secondary school, sixth form, and university students aged 16 and above preparing for medical admissions.",
      "We present our terms and privacy information in clear, transparent language. Students under the age of 18 must obtain the consent of a parent or guardian before making any purchases or subscribing to paid tiers.",
      "If a parent or guardian believes their child has submitted personal data without authorization, please contact us at medwithrish@gmail.com and we will take immediate steps to remove the information.",
    ],
  },
  {
    title: "11. Your statutory data protection rights",
    body: [
      "Under UK data protection law, you have specific rights regarding your personal data:",
      "- Right of access: you can request a copy of the personal data we hold about you.",
      "- Right to rectification: you can request correction of inaccurate or incomplete personal information.",
      "- Right to erasure ('right to be forgotten'): you can request deletion of your account and personal data.",
      "- Right to restrict processing: you can ask us to pause the processing of certain data in specific circumstances.",
      "- Right to data portability: you can request a machine-readable copy of the data you provided to us.",
      "- Right to object: you can object to processing based on legitimate interests.",
      "- Right to withdraw consent: where processing is based on consent (such as browser microphone access), you may withdraw consent at any time without affecting prior lawful processing.",
      "To exercise any of these rights, email medwithrish@gmail.com. We aim to respond to all valid requests within one calendar month.",
      "You also have the right to lodge a complaint with the UK supervisory authority, the Information Commissioner's Office (ICO), at ico.org.uk. We welcome the opportunity to resolve any concerns directly before you contact the regulator.",
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
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
        >
          Back to homepage
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
            Legal & Compliance
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Last updated: 4 October 2026. This policy explains how MedWithRish and MedicForest
            collect, process, store, and protect your personal information across all our services,
            in accordance with the UK GDPR and Data Protection Act 2018.
          </p>
        </header>

        <div className="mt-6 space-y-4">
          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-semibold text-slate-900">{section.title}</h2>
              <div className="mt-4 space-y-3 text-base font-normal leading-7 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">Related Legal Documents</h3>
          <p className="mt-1 text-sm text-slate-600">
            Please review our full Terms and Conditions and MedicForest Disclaimer for complete details.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
            <Link href="/terms-and-conditions" className="text-blue-600 hover:underline">
              Terms and Conditions
            </Link>
            <Link href="/medicforest-disclaimer" className="text-blue-600 hover:underline">
              MedicForest AI & Data Disclaimer
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
