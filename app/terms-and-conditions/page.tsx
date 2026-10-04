import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  alternates: { canonical: "/terms-and-conditions" },
  title: "Terms and Conditions | MedWithRish & MedicForest",
  description: "Terms and conditions for MedWithRish admissions tutoring, MedicForest UCAT preparation, and AI medical interview simulation services.",
};

const terms = [
  {
    title: "1. About these terms and merchant identity",
    body: [
      "These Terms and Conditions ('Terms') constitute a legally binding agreement between you and MedWithRish ('we', 'us', 'our'), operated by Rish (support contact: medwithrish@gmail.com).",
      "These Terms govern your use of the MedWithRish website (medwithrish.com), the MedicForest UCAT preparation and question bank platform, the MedicForest AI Medical Interview simulator, 1-to-1 admissions tutoring packages, personal statement reviews, and all associated digital resources.",
      "By creating an account, booking a tutoring session, or purchasing a MedicForest subscription, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you are under 18 years of age, you must have the permission and involvement of a parent or legal guardian.",
    ],
  },
  {
    title: "2. Educational support and no outcome guarantee",
    body: [
      "MedWithRish and MedicForest provide revision, learning tools, and admissions preparation assistance. All resources, diagnostic scores, interview simulations, and tutor advice are provided solely for educational preparation.",
      "We do not guarantee any specific UCAT score, decile, percentile, interview invitation, university offer, or medical/dental school admission outcome. Admissions decisions are made entirely independently by universities, medical schools, and exam boards.",
      "AI feedback, automated rubrics, and diagnostic estimates are automated study aids. They may occasionally be incomplete or inaccurate and should not be relied upon as definitive professional, medical, legal, or admissions advice.",
    ],
  },
  {
    title: "3. Independence from official examination and admissions bodies",
    body: [
      "MedWithRish and MedicForest are completely independent educational services. We are not endorsed by, affiliated with, sponsored by, or operated in partnership with the UCAT Consortium, Pearson VUE, UCAS, the General Medical Council (GMC), the National Health Service (NHS), or any university medical or dental school.",
      "Official exam policies, testing schedules, test centres, and university admissions criteria change regularly. You are responsible for verifying official requirements, registration dates, and test instructions directly with official examination authorities.",
    ],
  },
  {
    title: "4. User accounts, security and acceptable use",
    body: [
      "You must provide accurate and complete registration information and maintain the security of your account credentials. You are responsible for all activity that occurs under your account.",
      "Each account and paid subscription is strictly for individual personal use. You must not share your login credentials, resell account access, or permit multiple individuals to use a single subscription.",
      "You agree not to scrape, reverse-engineer, decompile, or copy platform software or question banks; bypass paywalls or rate limits; submit malicious code; or use AI outputs for unlawful purposes.",
      "You must not submit offensive, profane, or defamatory usernames, comments, or messages in study groups or leaderboards. We reserve the right to suspend or terminate accounts that breach these rules.",
    ],
  },
  {
    title: "5. Paid subscriptions, billing and Stripe customer portal",
    body: [
      "MedicForest Premium features are offered as recurring digital subscriptions (such as monthly or annual passes) or one-off fixed packages. Applicable prices, currency (GBP), and billing frequencies are clearly presented at checkout before payment.",
      "Payments are securely processed by Stripe, Inc. By subscribing, you authorise recurring billing at the agreed intervals until you cancel.",
      "Self-service cancellation: you can cancel your subscription at any time with one click through the Stripe Customer Portal link in your Manage Account dashboard, or by emailing medwithrish@gmail.com.",
      "When you cancel, your subscription will remain active until the end of your current prepaid billing period. No further renewal charges will be taken, and your account will revert to the free tier at the end of the term.",
    ],
  },
  {
    title: "6. Immediate digital delivery and statutory cancellation rights",
    body: [
      "In accordance with the UK Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013 and the Consumer Rights Act 2015:",
      "By purchasing a digital subscription or immediate access to MedicForest, you give your express prior consent for digital performance and service delivery to commence immediately upon checkout. You acknowledge that by receiving immediate digital access, you lose your statutory 14-day cancellation cooling-off right for digital content once supply begins.",
      "Transparent refund policy: notwithstanding the waiver of statutory cancellation upon immediate delivery, we treat all customers fairly. If you experience an unintended duplicate payment, technical malfunction that prevents access, or billing error, contact medwithrish@gmail.com within 14 days of purchase. Refund requests are reviewed promptly on a case-by-case basis.",
      "Tutoring bookings: 1-to-1 tutoring sessions may be rescheduled with at least 24 hours' notice prior to the scheduled start time. Cancellations with less than 24 hours' notice or missed appointments may be charged in full to cover tutor preparation and reservation time.",
    ],
  },
  {
    title: "7. AI medical interview simulation and audio processing",
    body: [
      "MedicForest AI Interview simulations enable candidates to practise spoken Multiple Mini Interview (MMI) and panel stations using browser microphone recording.",
      "Microphone audio is captured and converted to text using automated speech-to-text algorithms. Automated educational models evaluate responses against simulated rubrics (including communication clarity, STARR structure, NHS values, and ethics) and generate dynamic follow-up probe questions.",
      "AI simulations are educational approximations. AI evaluators do not possess human clinical judgement and their scores do not guarantee or reflect official university examiner marking. You can choose text-based practice if you prefer not to use voice recording.",
    ],
  },
  {
    title: "8. UCAT practice telemetry and community features",
    body: [
      "MedicForest collects practice telemetry including answer choices, question timing, answer changes, flagged questions, calculator keystrokes, and diagnostic results to generate personalised weakness analyses and progress tracking.",
      "Study groups and leaderboards: you may join collaborative practice rooms and opt in to public leaderboards. Usernames and scores displayed on public leaderboards are visible to other participants. We maintain automated moderation to protect student safety and filter inappropriate handles.",
    ],
  },
  {
    title: "9. Intellectual property rights",
    body: [
      "All content on MedWithRish and MedicForest - including question banks, explanations, mock exams, interview prompts, mark schemes, AI prompts, graphics, software code, videos, and branding - is owned by or licensed to MedWithRish.",
      "You are granted a personal, non-exclusive, non-transferable, revocable licence to access and use platform materials solely for your own individual, non-commercial admissions study.",
      "You must not copy, reproduce, scrape, download in bulk, redistribute, publish, sell, or create derivative works from our materials without prior written authorisation.",
    ],
  },
  {
    title: "10. Service availability and platform modifications",
    body: [
      "We strive to maintain continuous platform availability and reliable performance. However, we cannot guarantee uninterrupted or error-free access. We may temporarily suspend access for maintenance, updates, or infrastructure upgrades.",
      "We reserve the right to improve, update, or modify question sets, AI features, pricing for future billing cycles, and these Terms. Material changes will be communicated via the website or email where appropriate.",
    ],
  },
  {
    title: "11. Limitation of liability",
    body: [
      "Nothing in these Terms limits or excludes our liability for death or personal injury resulting from negligence, fraud or fraudulent misrepresentation, or any other liability that cannot be excluded under applicable UK law, including your statutory consumer rights.",
      "To the maximum extent permitted by law, MedWithRish and its founder shall not be liable for any indirect, special, incidental, or consequential losses; loss of opportunity; missed application deadlines; or university rejection decisions arising from the use of our services or reliance on AI feedback.",
    ],
  },
  {
    title: "12. Governing law, disputes and merchant contact",
    body: [
      "These Terms are governed by and construed in accordance with the laws of England and Wales. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts of England and Wales, although consumers residing in Scotland or Northern Ireland retain any non-waivable statutory rights in their respective jurisdiction.",
      "For customer support, billing questions, cancellation requests, or legal notices, please email medwithrish@gmail.com. We aim to respond to all enquiries within 24 to 48 hours.",
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
          className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-blue-300 hover:text-blue-700"
        >
          Back to homepage
        </Link>

        <header className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-black uppercase tracking-wide text-blue-600">
            Legal & Compliance
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            Last updated: 4 October 2026. Please read these Terms and Conditions carefully
            before creating an account, booking tutoring sessions, or subscribing to MedicForest.
          </p>
        </header>

        <div className="mt-6 space-y-4">
          {terms.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <h2 className="text-xl font-black text-slate-900">{section.title}</h2>
              <div className="mt-4 space-y-3 text-sm font-medium leading-7 text-slate-600">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-black text-slate-900">Related Legal Documents</h3>
          <p className="mt-1 text-sm text-slate-600">
            Our Privacy Policy and MedicForest AI Disclaimer provide additional detail on data protection and AI usage.
          </p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold">
            <Link href="/privacy-policy" className="text-blue-600 hover:underline">
              Privacy Policy
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
