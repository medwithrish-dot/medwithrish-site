import type { Metadata } from "next";
import { productPageMetadata } from "@/utils/medicforest/metadata";
import InterviewsPage from "./interviews/page";
import JsonLd from "@/components/JsonLd";
import { getProductSiteUrl } from "@/utils/site-url";

export const metadata: Metadata = productPageMetadata({
  title: "Free Medicine Interview Questions & AI Practice | MedicForest",
  description: "Prepare for medical school interviews with 550+ free questions and markschemes, MMI and ethics guides, AI interview practice and personalised preparation tools.",
  path: "/",
});

export default function Page() {
  return <>
    <JsonLd data={[
      { "@context": "https://schema.org", "@type": "WebSite", name: "MedicForest", url: getProductSiteUrl(), inLanguage: "en-GB" },
      { "@context": "https://schema.org", "@type": "Organization", name: "MedicForest", url: getProductSiteUrl() },
    ]} />
    <InterviewsPage />
  </>;
}

