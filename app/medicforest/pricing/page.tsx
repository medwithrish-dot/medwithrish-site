import type { Metadata } from "next";
import { MedicForestPricingPage } from "./_components/MedicForestPricingClient";

export const metadata: Metadata = {
  title: "MedicForest Med Interview Pricing",
  description:
    "Compare the free MedicForest Med interview plan with MedicForest Premium before upgrading.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "MedicForest Med Interview Pricing",
    description:
      "See what is included in free Med interview practice and what Premium unlocks.",
    url: "/pricing",
    siteName: "MedicForest",
    type: "website",
  },
};

export default function Page() {
  return <MedicForestPricingPage />;
}
