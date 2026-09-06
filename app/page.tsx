import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TopBanner from "@/components/TopBanner";
import SuccessStories from "@/components/SuccessStories";
import Hero from "@/components/Hero";
import AdmissionsJourney from "@/components/AdmissionsJourney";
import OtherPathways from "@/components/OtherPathways";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main>
      <Navbar />
      <TopBanner />
      <SuccessStories />
      <Suspense>
        <AdmissionsJourney />
      </Suspense>
      <OtherPathways />
      <Hero />
    </main>
  );
}
