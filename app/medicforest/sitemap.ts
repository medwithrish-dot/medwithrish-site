import type { MetadataRoute } from "next";
import { getProductSiteUrl } from "@/utils/site-url";

const productRoutes = [
  { path: "/", priority: 1 },
  { path: "/interviews", priority: 0.9 },
  { path: "/about", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  { path: "/tutoring", priority: 0.8 },
  { path: "/resources", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getProductSiteUrl();
  return productRoutes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
