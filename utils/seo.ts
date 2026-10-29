import type { Metadata } from "next";

export type PageSearchDetails = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  noIndex?: boolean;
};

export function createPageMetadata(
  { title, description, path, type = "website", noIndex = false }: PageSearchDetails,
  siteUrl: string,
  siteName: string,
): Metadata {
  const url = new URL(path, siteUrl).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName, locale: "en_GB", type },
    twitter: { card: "summary", title, description },
    ...(noIndex ? { robots: { index: false, follow: true } } : {}),
  };
}

export type Breadcrumb = { name: string; url: string };

export function breadcrumbSchema(items: Breadcrumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name, item: item.url,
    })),
  };
}

export function articleSchema({
  title, description, url, siteName, siteUrl, sections, sources = [], reviewedAt,
}: {
  title: string;
  description: string;
  url: string;
  siteName: string;
  siteUrl: string;
  sections: string[];
  sources?: string[];
  reviewedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: title,
    description,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url, ...(reviewedAt ? { lastReviewed: reviewedAt } : {}) },
    inLanguage: "en-GB",
    author: { "@type": "Organization", name: siteName, url: `${siteUrl}/about` },
    publisher: { "@type": "Organization", name: siteName, url: siteUrl },
    articleSection: sections,
    ...(sources.length ? { citation: sources } : {}),
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
