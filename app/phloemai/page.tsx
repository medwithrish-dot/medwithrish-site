import type { Metadata } from "next";
import { PhloemAILandingPage } from "./_components/PhloemAIClient";

const phloemAiTitle = "PhloemAI - Free UCAT Question Bank & AI Tutor";

export const metadata: Metadata = {
  title: {
    absolute: phloemAiTitle,
  },
  description:
    "Practise UCAT questions, start a free diagnostic and use PhloemAI to find the habits costing you marks.",
  applicationName: "PhloemAI",
  keywords: [
    "PhloemAI",
    "UCAT question bank",
    "free UCAT question bank",
    "UCAT AI tutor",
    "UCAT diagnostic",
    "UCAT practice",
  ],
  alternates: {
    canonical: "/phloemai",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: phloemAiTitle,
    description:
      "Free UCAT question bank practice, diagnostics and AI-powered feedback.",
    url: "/phloemai",
    siteName: "PhloemAI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: phloemAiTitle,
    description:
      "Practise UCAT questions and get AI diagnostics that show why marks are slipping.",
  },
};

const phloemAiSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PhloemAI",
  alternateName: "Phloem",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  url: "https://www.medwithrish.com/phloemai",
  description:
    "PhloemAI is a UCAT question bank and AI tutor with free diagnostic practice, mock-style questions and personalised feedback.",
  publisher: {
    "@type": "Organization",
    name: "MedWithRish",
    url: "https://www.medwithrish.com",
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "GBP",
    category: "Free",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(phloemAiSchema) }}
      />
      <PhloemAILandingPage />
    </>
  );
}
