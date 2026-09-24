import type { Metadata } from "next";
import { MedicForestLandingPage } from "./_components/MedicForestClient";

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest UCAT | Free question bank and AI tutor",
  },
  description:
    "Free UCAT question bank, diagnostics and personalised AI feedback from MedicForest by MedWithRish.",
  alternates: {
    canonical: "/medicforest/ucat",
  },
};

export default function UCATLandingPage() {
  return <MedicForestLandingPage />;
}
