import type { Metadata } from "next";
import { PhloemAILandingPage } from "./_components/PhloemAIClient";

export const metadata: Metadata = {
  title: "PhloemAI - Free UCAT Question Bank & AI Tutor",
  description:
    "Practise UCAT questions, start a free diagnostic and use PhloemAI to find the habits costing you marks.",
  alternates: {
    canonical: "/phloemai",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PhloemAI - Free UCAT Question Bank & AI Tutor",
    description:
      "Free UCAT question bank practice, diagnostics and AI-powered feedback from MedWithRish.",
    url: "/phloemai",
    siteName: "MedWithRish",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PhloemAI - Free UCAT Question Bank & AI Tutor",
    description:
      "Practise UCAT questions and get AI diagnostics that show why marks are slipping.",
  },
};

export default function Page() {
  return <PhloemAILandingPage />;
}
