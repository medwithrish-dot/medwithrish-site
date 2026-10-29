import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const modules = new Map();
function loadModule(filename) {
  const path = resolve(root, filename);
  if (modules.has(path)) return modules.get(path).exports;
  const loaded = { exports: {} };
  modules.set(path, loaded);
  const code = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
  }).outputText;
  const requireLocal = (specifier) => loadModule(`${specifier.startsWith("@/") ? resolve(root, specifier.slice(2)) : resolve(dirname(path), specifier)}.ts`);
  new Function("require", "module", "exports", code)(requireLocal, loaded, loaded.exports);
  return loaded.exports;
}

const { createPageMetadata, articleSchema, breadcrumbSchema, serializeJsonLd } = loadModule("utils/seo.ts");
const { admissionsGuides } = loadModule("utils/medwithrish/guides.ts");
const { interviewGuides } = loadModule("app/medicforest/interview/_data/interviewGuides.ts");
const { interviewUniversities } = loadModule("app/medicforest/interview/_data/universities.ts");
const { getPublicSiteUrl, getProductSiteUrl } = loadModule("utils/site-url.ts");
const marketingSitemap = loadModule("app/sitemap.ts").default;
const productSitemap = loadModule("app/medicforest/sitemap.ts").default;

test("metadata keeps each page's canonical and sharing URL on its intended domain", () => {
  for (const [siteUrl, siteName] of [["https://www.medwithrish.com", "MedWithRish"], ["https://medicforest.com", "MedicForest"]]) {
    const meta = createPageMetadata({ title: "Consent guide", description: "How to discuss consent at interview.", path: "/interviews/guides/consent", type: "article" }, siteUrl, siteName);
    assert.equal(meta.alternates.canonical, `${siteUrl}/interviews/guides/consent`);
    assert.equal(meta.openGraph.url, meta.alternates.canonical);
    assert.equal(meta.openGraph.type, "article");
    assert.equal(meta.openGraph.siteName, siteName);
    assert.equal(meta.twitter.description, meta.description);
    assert.equal(meta.robots, undefined);
  }
  assert.deepEqual(createPageMetadata({ title: "Saved review", description: "Your review", path: "/interviews/reports", noIndex: true }, "https://medicforest.com", "MedicForest").robots, { index: false, follow: true });
});

test("sitemaps include every guide and university using canonical URLs without private routes", () => {
  const marketing = marketingSitemap().map(item => item.url);
  const product = productSitemap().map(item => item.url);
  for (const guide of Object.values(admissionsGuides)) {
    assert.ok(guide.canonicalPath && guide.searchDescription);
    assert.ok(marketing.includes(`${getPublicSiteUrl()}${guide.canonicalPath}`));
  }
  for (const guide of interviewGuides) assert.ok(product.includes(`${getProductSiteUrl()}/interviews/guides/${guide.slug}`), guide.slug);
  for (const university of interviewUniversities) assert.ok(product.includes(`${getProductSiteUrl()}/interviews/universities/${university.slug}`), university.slug);
  assert.ok(marketing.includes(`${getPublicSiteUrl()}/tutoring`));
  for (const urls of [marketing, product]) {
    assert.equal(new Set(urls).size, urls.length);
    for (const url of urls) assert.doesNotMatch(new URL(url).pathname, /(?:account|reports|dashboard|ai-interviews|progress|notifications|wip|api)(?:\/|$)/);
  }
  for (const url of product) {
    assert.equal(new URL(url).origin, getProductSiteUrl());
    assert.ok(!url.includes("/medicforest/"));
  }
  assert.ok(!product.includes(`${getProductSiteUrl()}/interviews`), "duplicate landing alias uses the homepage canonical");
});

test("article and breadcrumb data reflect visible content without invented publication dates", () => {
  const url = "https://medicforest.com/interviews/guides/why-medicine";
  const article = articleSchema({ title: "Why medicine?", description: "Reflect on your motivation.", url, siteUrl: "https://medicforest.com", siteName: "MedicForest", sections: ["Understand the topic"], reviewedAt: "2026-09-08" });
  assert.equal(article.mainEntityOfPage["@id"], url);
  assert.equal(article.mainEntityOfPage.lastReviewed, "2026-09-08");
  assert.equal(article.datePublished, undefined);
  assert.equal(article.dateModified, undefined);
  const crumbs = breadcrumbSchema([{ name: "Guides", url: "https://medicforest.com/interviews/guides" }, { name: "Why medicine?", url }]);
  assert.deepEqual(crumbs.itemListElement.map(item => item.position), [1, 2]);
  assert.equal(crumbs.itemListElement[1].item, url);
});

test("JSON-LD escapes script-ending content while preserving the parsed data", () => {
  const data = { headline: "A </script><script>alert(1)</script> example & reflection" };
  const serialized = serializeJsonLd(data);
  assert.ok(!serialized.includes("<"));
  assert.deepEqual(JSON.parse(serialized), data);
});
