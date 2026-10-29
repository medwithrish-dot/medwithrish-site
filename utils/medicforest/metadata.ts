import { createPageMetadata, type PageSearchDetails } from "@/utils/seo";
import { getProductSiteUrl } from "@/utils/site-url";

export function productPageMetadata(details: PageSearchDetails) {
  return createPageMetadata(details, getProductSiteUrl(), "MedicForest");
}
