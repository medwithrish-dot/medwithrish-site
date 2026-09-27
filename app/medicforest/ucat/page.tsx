import type { Metadata } from "next";
import { MedicForestLandingPage } from "./_components/MedicForestClient";

type LandingSearchParams = {
  preview?: string | string[];
};

export const metadata: Metadata = {
  title: {
    absolute: "MedicForest UCAT | Free question bank and AI tutor",
  },
  description:
    "Free UCAT question bank, diagnostics and personalised AI feedback from MedicForest by MedWithRish.",
  alternates: {
    canonical: "/ucat",
  },
};

export default async function UCATLandingPage({
  searchParams,
}: {
  searchParams: Promise<LandingSearchParams>;
}) {
  const params = await searchParams;
  const preview = Array.isArray(params.preview) ? params.preview[0] : params.preview;

  return <MedicForestLandingPage lockedArea={preview === "ucat" ? "ucat" : null} />;
}
