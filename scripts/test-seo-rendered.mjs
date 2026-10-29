// Read-only crawl checks against a running local production server, without JavaScript.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { get as httpGet } from "node:http";
import { get as httpsGet } from "node:https";
import { parse } from "dotenv";
import { chromium } from "playwright";
import { admissionsGuides } from "../utils/medwithrish/guides.ts";
import { getPublicSiteUrl, getProductSiteUrl } from "../utils/site-url.ts";

const origin = process.env.SEO_TEST_ORIGIN ?? "http://127.0.0.1:3118";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(origin).hostname), "Use a local server.");

// Node's fetch can ignore a custom Host header. Use the HTTP client so these
// checks exercise the production rewrites for each domain on the local server.
function readLocalPage(path, headers) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, origin);
    const get = url.protocol === "https:" ? httpsGet : httpGet;
    const request = get(url, { headers, signal: AbortSignal.timeout(60000) }, response => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { body += chunk; });
      response.on("error", reject);
      response.on("end", () => resolve(new Response(body, { status: response.statusCode })));
    });
    request.on("error", reject);
  });
}

try {
  const env = parse(readFileSync(new URL("../.env.local", import.meta.url)));
  for (const name of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_PRODUCT_SITE_URL"]) {
    if (env[name]) process.env[name] ??= env[name];
  }
} catch (error) { if (error.code !== "ENOENT") throw error; }

const publicUrl = getPublicSiteUrl();
const productUrl = getProductSiteUrl();
const checks = [
  { path: "/", siteUrl: publicUrl },
  { path: "/resources", siteUrl: publicUrl },
  ...Object.values(admissionsGuides).map(guide => ({ path: guide.canonicalPath, siteUrl: publicUrl, article: true })),
  { path: "/", siteUrl: productUrl },
  { path: "/interviews", canonicalPath: "/", siteUrl: productUrl },
  { path: "/interviews/guides", siteUrl: productUrl, guideLinks: true },
  { path: "/interviews/guides/why-medicine", siteUrl: productUrl, article: true },
  { path: "/interviews/guides/bawa-garba-case", siteUrl: productUrl, article: true },
  { path: "/interviews/question-bank", siteUrl: productUrl },
  { path: "/interviews/universities/aberdeen", siteUrl: productUrl },
  { path: "/interviews/progress", siteUrl: productUrl, noIndex: true },
  { path: "/account", siteUrl: productUrl, noIndex: true },
];

const browser = await chromium.launch();
try {
  const context = await browser.newContext({ javaScriptEnabled: false });
  await context.route("**/*", route => route.abort());
  const page = await context.newPage();
  for (const check of checks) {
    const response = await readLocalPage(check.path, { Host: new URL(check.siteUrl).host, "User-Agent": "Googlebot" });
    assert.equal(response.status, 200, `${check.siteUrl}${check.path}`);
    await page.setContent(await response.text());
    const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute("href");
    assert.ok(canonicalHref, `Missing canonical for ${check.path}`);
    // Next.js emits homepage canonicals without the optional origin slash.
    const canonical = new URL(canonicalHref).href;
    assert.equal(canonical, new URL(check.canonicalPath ?? check.path, check.siteUrl).href);
    assert.ok((await page.title()).length > 10);
    assert.ok((await page.locator('meta[name="description"]').getAttribute("content"))?.length > 30);
    assert.equal(await page.locator("h1").count(), 1, `${check.siteUrl}${check.path} must render one main heading`);
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    assert.equal(/noindex/.test(robots ?? ""), !!check.noIndex, check.path);
    if (!check.noIndex) {
      const sharingUrl = await page.locator('meta[property="og:url"]').getAttribute("content");
      assert.ok(sharingUrl, `Missing sharing URL for ${check.path}`);
      assert.equal(new URL(sharingUrl).href, canonical);
    }
    if (check.article) {
      const schemas = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap(text => JSON.parse(text));
      assert.ok(schemas.some(item => item["@type"] === "Article" && item.url === canonical));
      assert.ok(schemas.some(item => item["@type"] === "BreadcrumbList" && item.itemListElement.at(-1).item === canonical));
      assert.ok((await page.locator("article").innerText()).length > 500, "guide text must be in server-rendered HTML");
    }
    if (check.guideLinks) assert.ok(await page.locator('a[href*="/guides/"]').count() > 20, "guide links must be crawlable without JavaScript");
    console.log(`PASS ${check.siteUrl}${check.path}`);
  }
  for (const siteUrl of [publicUrl, productUrl]) {
    const headers = { Host: new URL(siteUrl).host };
    const sitemap = await readLocalPage("/sitemap.xml", headers);
    assert.equal(sitemap.status, 200);
    const xml = await sitemap.text();
    assert.ok(xml.includes(`${siteUrl}/`));
    if (siteUrl === productUrl) assert.ok(xml.includes(`${siteUrl}/interviews/guides/why-medicine`));
    const robots = await readLocalPage("/robots.txt", headers);
    assert.equal(robots.status, 200);
    assert.ok((await robots.text()).includes(`Sitemap: ${siteUrl}/sitemap.xml`));
  }
  console.log(`Verified ${checks.length} pages plus both sitemaps and robots files without JavaScript.`);
} finally { await browser.close(); }
