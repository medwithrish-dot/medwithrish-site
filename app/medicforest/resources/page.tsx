import type { Metadata } from "next";
import { MedicForestPlaceholderPage } from "../_components/MedicForestPlaceholderPage";

export const metadata: Metadata = {
  title: "Resources | MedicForest",
  description: "Free medical admissions resources are coming to MedicForest.",
};

export default function ResourcesPage() {
  return (
    <MedicForestPlaceholderPage
      eyebrow="Coming soon"
      title="A new home for MedicForest resources."
      description="Guides, explainers and practical admissions resources are being gathered here for easy access."
    />
  );
}
