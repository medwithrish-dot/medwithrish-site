import type { Metadata } from "next";
import { FeedbackPageClient } from "./_client";

export const metadata: Metadata = {
  title: "Feedback | MedicForest",
  description: "Share feedback on MedicForest — help us build the best medical admissions platform.",
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
