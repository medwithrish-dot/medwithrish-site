import type { Metadata } from "next";
import { FeedbackPageClient } from "./_client";

export const metadata: Metadata = {
  title: "Feedback & Support | MedicForest",
  description:
    "Get in touch with MedicForest. Email medwithrish@gmail.com, DM @medwithrish_ on Instagram, or @medwithrish on TikTok, or send technical feedback.",
  alternates: {
    canonical: "/feedback",
  },
};

export default function FeedbackPage() {
  return <FeedbackPageClient />;
}
