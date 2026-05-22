import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "https://www.medwithrish.com";

const baseUrl = siteUrl.replace(/\/$/, "");
const lastModified = new Date("2026-05-14T00:00:00.000Z");

const publicRoutes: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "monthly", priority: 1 },
  { path: "/phloemai", changeFrequency: "weekly", priority: 1 },
  { path: "/phloemai/pricing", changeFrequency: "weekly", priority: 0.9 },
  { path: "/ucat-tutoring", changeFrequency: "monthly", priority: 0.9 },
  { path: "/ucat-score-tracker", changeFrequency: "monthly", priority: 0.85 },
  { path: "/ucat-timeline", changeFrequency: "monthly", priority: 0.85 },
  { path: "/resources", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.75 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gcse-tutoring", changeFrequency: "monthly", priority: 0.7 },
  { path: "/alevel-tutoring", changeFrequency: "monthly", priority: 0.7 },
  { path: "/interview-tutoring", changeFrequency: "monthly", priority: 0.7 },
  { path: "/personal-statement-session", changeFrequency: "monthly", priority: 0.7 },
  { path: "/gcse-revision-guide", changeFrequency: "monthly", priority: 0.65 },
  { path: "/personal-statements-guide", changeFrequency: "monthly", priority: 0.65 },
  { path: "/gateway-foundation-guide", changeFrequency: "monthly", priority: 0.65 },
  { path: "/work-experience-guide", changeFrequency: "monthly", priority: 0.65 },
  { path: "/related-careers-guide", changeFrequency: "monthly", priority: 0.65 },
  { path: "/year12-guide", changeFrequency: "monthly", priority: 0.65 },
  { path: "/phloemai-disclaimer", changeFrequency: "yearly", priority: 0.3 },
  { path: "/privacy-policy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms-and-conditions", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
