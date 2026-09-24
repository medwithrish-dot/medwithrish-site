import type { Metadata } from "next";
import { MedicForestPlaceholderPage } from "../_components/MedicForestPlaceholderPage";

export const metadata: Metadata = {
  title: "Contact | MedicForest",
  description: "Contact options for MedicForest are coming soon.",
};

export default function ContactPage() {
  return (
    <MedicForestPlaceholderPage
      eyebrow="Coming soon"
      title="A direct line to MedicForest is coming."
      description="We are setting up a dedicated contact space for questions about Forest and the wider MedicForest platform."
    />
  );
}
