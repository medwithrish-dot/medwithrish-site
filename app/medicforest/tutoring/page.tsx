import type { Metadata } from "next";
import { MedicForestPlaceholderPage } from "../_components/MedicForestPlaceholderPage";

export const metadata: Metadata = {
  title: "1-1 Tutoring | MedicForest",
  description: "One-to-one tutoring information is coming to MedicForest.",
};

export default function TutoringPage() {
  return (
    <MedicForestPlaceholderPage
      eyebrow="Coming soon"
      title="One-to-one tutoring, built around you."
      description="We are preparing a dedicated place to explore personal UCAT and medical admissions tutoring."
    />
  );
}
