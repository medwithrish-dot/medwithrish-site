import { Suspense } from "react";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import TopBanner from "@/components/TopBanner";
import SuccessStories from "@/components/SuccessStories";
import Hero from "@/components/Hero";
import AdmissionsJourney from "@/components/AdmissionsJourney";
import OtherPathways from "@/components/OtherPathways";
import { publicPageMetadata } from "@/utils/medwithrish/metadata";
import JsonLd from "@/components/JsonLd";
import { getPublicSiteUrl } from "@/utils/site-url";

export const metadata: Metadata = publicPageMetadata({
  title: "Medicine & Dentistry Admissions Guides and Tutoring | MedWithRish",
  description: "Prepare for medicine and dentistry applications with free UCAT, personal statement and work experience guides, interview resources and 1-to-1 tutoring.",
  path: "/",
});

export default function Home() {
  return (
    <main className="medwithrish-home">
      <JsonLd data={[
        { "@context": "https://schema.org", "@type": "WebSite", name: "MedWithRish", url: getPublicSiteUrl(), inLanguage: "en-GB" },
        { "@context": "https://schema.org", "@type": "Organization", name: "MedWithRish", url: getPublicSiteUrl() },
      ]} />
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
