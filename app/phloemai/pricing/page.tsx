import type { Metadata } from "next";
import { PhloemAIPricingPage } from "../_components/PhloemAIClient";

export const metadata: Metadata = {
  title: "PhloemAI Pricing | MedWithRish",
  description:
    "Compare the free PhloemAI diagnostic with PhloemAI Premium before upgrading.",
  alternates: {
    canonical: "/phloemai/pricing",
  },
  openGraph: {
    title: "PhloemAI Pricing | MedWithRish",
    description:
      "See what is included in the free diagnostic and what Premium unlocks.",
    url: "/phloemai/pricing",
    siteName: "MedWithRish",
    type: "website",
  },
};

export default function Page() {
  return <PhloemAIPricingPage />;
}
