import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/utils/site-url";

const baseUrl = getPublicSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/api/",
        "/phloemai/",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
