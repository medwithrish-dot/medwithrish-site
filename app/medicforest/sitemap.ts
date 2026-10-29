import type { MetadataRoute } from "next";
import { getProductSiteUrl } from "@/utils/site-url";
import { interviewGuides } from "./interview/_data/interviewGuides";
import { interviewUniversities } from "./interview/_data/universities";

const productRoutes = [
  { path: "/", priority: 1 },
  { path: "/about", priority: 0.8 },
  { path: "/pricing", priority: 0.8 },
  { path: "/tutoring", priority: 0.8 },
  { path: "/resources", priority: 0.7 },
  { path: "/interviews/guides", priority: 0.85 },
  { path: "/interviews/question-bank", priority: 0.85 },
  { path: "/interviews/universities", priority: 0.75 },
  { path: "/contact", priority: 0.6 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getProductSiteUrl();
  const routes = [
    ...productRoutes,
    ...interviewGuides.map(guide => ({ path: `/interviews/guides/${guide.slug}`, priority: 0.8 })),
    ...interviewUniversities.map(university => ({ path: `/interviews/universities/${university.slug}`, priority: 0.7 })),
  ];
  return routes.map(({ path, priority }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: "monthly",
    priority,
  }));
}
