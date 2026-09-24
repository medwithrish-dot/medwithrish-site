import type { Metadata } from "next";
import { MedicForestPlaceholderPage } from "../_components/MedicForestPlaceholderPage";

export const metadata: Metadata = {
  title: "Feedback | MedicForest",
  description: "The MedicForest feedback page is coming soon.",
};

export default function FeedbackPage() {
  return (
    <MedicForestPlaceholderPage
      eyebrow="Coming soon"
      title="Help shape MedicForest."
      description="A dedicated feedback space is coming soon so you can share what works, what does not and what you want us to build next."
    />
  );
}
