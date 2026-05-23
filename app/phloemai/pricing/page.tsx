import type { Metadata } from "next";
import { PhloemAIPricingPage } from "../_components/PhloemAIClient";

export const metadata: Metadata = {
  title: "PhloemAI Pricing",
  description:
    "Compare the free PhloemAI diagnostic with PhloemAI Premium before upgrading.",
  alternates: {
    canonical: "/phloemai/pricing",
  },
  openGraph: {
    title: "PhloemAI Pricing",
    description:
      "See what is included in the free diagnostic and what Premium unlocks.",
    url: "/phloemai/pricing",
    siteName: "PhloemAI",
    type: "website",
  },
};

export default function Page() {
  return <PhloemAIPricingPage />;
}
