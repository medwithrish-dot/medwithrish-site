import type { Metadata } from "next";
import { publicPageMetadata } from "@/utils/medwithrish/metadata";
import FeedbackPage from "../medicforest/feedback/page";

export const metadata: Metadata = publicPageMetadata({
  title: "Feedback & Support | MedWithRish",
  description: "Get help with MedWithRish resources or share feedback about MedicForest medicine interview practice. Find email and social contact details.",
  path: "/feedback",
});

export default FeedbackPage;
