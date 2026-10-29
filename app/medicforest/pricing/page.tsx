import type { Metadata } from "next";
import { productPageMetadata } from "@/utils/medicforest/metadata";
import { MedicForestPricingPage } from "./_components/MedicForestPricingClient";

export const metadata: Metadata = productPageMetadata({
  title: "Medicine Interview Practice Plans & Pricing | MedicForest",
  description: "Compare free medicine interview practice with MedicForest Premium. See what each plan includes before choosing AI interviews and preparation tools.",
  path: "/pricing",
});

export default function Page() {
  return <MedicForestPricingPage />;
}
