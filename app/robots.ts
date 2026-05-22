import type { MetadataRoute } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.startsWith("http")
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://www.medwithrish.com";

const baseUrl = siteUrl.replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/phloemai"],
      disallow: [
        "/api/",
        "/phloemai/account",
        "/phloemai/dashboard",
        "/phloemai/report",
        "/phloemai/progress",
        "/phloemai/question-bank",
        "/phloemai/diagnostic",
        "/phloemai/skills-trainers",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
