import type { Metadata } from "next";
import { productPageMetadata } from "@/utils/medicforest/metadata";
import { FeedbackPageClient } from "./_client";

export const metadata: Metadata = productPageMetadata({
  title: "Feedback & Support | MedicForest",
  description: "Send technical feedback or get help with MedicForest medicine interview practice. Contact MedWithRish by email or social media.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
