import type { Metadata } from "next";
import { PhloemAILandingPage } from "./_components/PhloemAIClient";

export const metadata: Metadata = {
  title: {
    absolute: "PhloemAI UCAT | Free question bank and AI tutor",
  },
  description:
    "Free UCAT question bank, diagnostics and personalised AI feedback from PhloemAI by MedWithRish.",
  alternates: {
    canonical: "/phloemai/ucat",
  },
};

export default function UCATLandingPage() {
  return <PhloemAILandingPage />;
}
