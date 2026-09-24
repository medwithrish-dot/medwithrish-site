import type { Metadata } from "next";
import { MedicForestPlaceholderPage } from "../_components/MedicForestPlaceholderPage";

export const metadata: Metadata = {
  title: "Personal Statement | MedicForest",
  description: "Personal statement support is coming to MedicForest.",
};

export default function PersonalStatementPage() {
  return (
    <MedicForestPlaceholderPage
      eyebrow="Coming soon"
      title="Personal statement support is taking root."
      description="We are building a focused space to help applicants plan, refine and strengthen their personal statements."
    />
  );
}
