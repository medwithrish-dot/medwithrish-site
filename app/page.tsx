import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import TopBanner from "@/components/TopBanner";
import SuccessStories from "@/components/SuccessStories";
import Hero from "@/components/Hero";
import AdmissionsJourney from "@/components/AdmissionsJourney";
import OtherPathways from "@/components/OtherPathways";
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