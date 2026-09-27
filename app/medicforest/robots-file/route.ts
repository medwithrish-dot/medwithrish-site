import { getProductSiteUrl } from "@/utils/site-url";

export const dynamic = "force-static";

export function GET() {
  const sitemap = `${getProductSiteUrl()}/sitemap.xml`;
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /access",
    "Disallow: /account",
    `Sitemap: ${sitemap}`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
