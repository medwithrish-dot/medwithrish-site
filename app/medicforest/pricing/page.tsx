import type { Metadata } from "next";
import { MedicForestPricingPage } from "../ucat/_components/MedicForestClient";

export const metadata: Metadata = {
  title: "MedicForest Pricing",
  description:
    "Compare the free MedicForest diagnostic with MedicForest Premium before upgrading.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "MedicForest Pricing",
    description:
      "See what is included in the free diagnostic and what Premium unlocks.",
    url: "/pricing",
    siteName: "MedicForest",
    type: "website",
  },
};

export default function Page() {
  return <MedicForestPricingPage />;
}
