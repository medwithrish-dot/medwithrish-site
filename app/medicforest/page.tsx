import type { Metadata } from "next";
import { MedicForestLandingPage } from "./ucat/_components/MedicForestClient";

type LandingSearchParams = {
  preview?: string | string[];
};

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest | AI-powered medical admissions preparation",
  },
  description:
    "Explore MedicForest features and pricing, then choose UCAT or medicine interview preparation.",
  alternates: {
    canonical: "/",
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<LandingSearchParams>;
}) {
  const params = await searchParams;
  const preview = Array.isArray(params.preview) ? params.preview[0] : params.preview;
  const lockedArea = preview === "interview" || preview === "ucat" ? preview : null;

  return <MedicForestLandingPage lockedArea={lockedArea} />;
}
