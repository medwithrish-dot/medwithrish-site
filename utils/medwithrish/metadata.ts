import { createPageMetadata, type PageSearchDetails } from "@/utils/seo";
import { getPublicSiteUrl } from "@/utils/site-url";

export function publicPageMetadata(details: PageSearchDetails) {
  return createPageMetadata(details, getPublicSiteUrl(), "MedWithRish");
}
