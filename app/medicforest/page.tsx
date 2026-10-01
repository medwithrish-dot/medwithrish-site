import type { Metadata } from "next";
import { MedicForestLandingPage } from "./_components/MedicForestLandingClient";

type LandingSearchParams = {
  preview?: string | string[];
};

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest | AI-powered medical admissions preparation",
  },
  description:
    "Explore MedicForest features and pricing, then choose UCAT or medicine Med interview preparation.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MedicForest | Medical Admissions Preparation",
    description:
      "Explore Med interview practice, free questions and personalised tutoring with MedicForest.",
    url: "/",
    siteName: "MedicForest",
    type: "website",
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
