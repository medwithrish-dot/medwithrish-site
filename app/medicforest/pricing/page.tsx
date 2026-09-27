import type { Metadata } from "next";
import { MedicForestPricingPage } from "../ucat/_components/MedicForestClient";

export const metadata: Metadata = {
  title: "MedicForest Interview Pricing",
  description:
    "Compare the free MedicForest interview plan with MedicForest Premium before upgrading.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "MedicForest Interview Pricing",
    description:
      "See what is included in free interview practice and what Premium unlocks.",
    url: "/pricing",
    siteName: "MedicForest",
    type: "website",
  },
};

export default function Page() {
  return <MedicForestPricingPage />;
}
