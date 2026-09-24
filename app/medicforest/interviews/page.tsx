import type { Metadata } from "next";
import { MedicForestPlaceholderPage } from "../_components/MedicForestPlaceholderPage";

export const metadata: Metadata = {
  title: "Interviews | MedicForest",
  description: "Medicine interview preparation is coming to MedicForest.",
};

export default function InterviewsPage() {
  return (
    <MedicForestPlaceholderPage
      eyebrow="Coming soon"
      title="Medicine interview preparation is on the way."
      description="Realistic interview practice, structured feedback and university-focused guidance will live here."
    />
  );
}
