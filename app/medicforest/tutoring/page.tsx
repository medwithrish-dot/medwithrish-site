import type { Metadata } from "next";
import { productPageMetadata } from "@/utils/medicforest/metadata";
import { TutoringPageClient } from "./_client";

export const metadata: Metadata = productPageMetadata({
  title: "UCAT & Medicine Interview Tutoring | MedicForest",
  description: "Explore personalised UCAT, medicine interview and personal statement tutoring with MedWithRish. Find focused support for your medical school application.",
  path: "/tutoring",
});

export default function TutoringPage() {
  return <TutoringPageClient />;
}
