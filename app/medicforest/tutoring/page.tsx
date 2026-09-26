import type { Metadata } from "next";
import { TutoringPageClient } from "./_client";

export const metadata: Metadata = {
  title: "1-1 Tutoring | MedicForest",
  description:
    "Book personalised UCAT, interview and personal statement tutoring with @medwithrish — leading medical admissions expert.",
};

export default function TutoringPage() {
  return <TutoringPageClient />;
}
