import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";
import { isPublicMedicForestPath } from "../utils/medicforest/public-paths.ts";
import { medicForestPublicHref } from "../utils/medicforest/public-navigation.ts";
import { isMedicForestHost, previewPathname } from "../utils/medicforest/preview-routing.ts";

test("clean MedicForest URLs map to preview paths before host rewrites", () => {
  assert.equal(isMedicForestHost("medicforest.com"), true);
  assert.equal(isMedicForestHost("WWW.MEDICFOREST.COM:443"), true);
  assert.equal(isMedicForestHost("medwithrish.com"), false);
  assert.equal(previewPathname("/interviews", true), "/medicforest/interviews");
  assert.equal(previewPathname("/interviews/dashboard", true), "/medicforest/interview/dashboard");
  assert.equal(previewPathname("/interviews/leaderboard", true), "/medicforest/interview/leaderboard");
  assert.equal(previewPathname("/ucat/dashboard", true), "/medicforest/ucat/dashboard");
  assert.equal(previewPathname("/interviews/dashboard", false), "/interviews/dashboard");
});

test("security headers cover pages while API responses remain private", async () => {
  assert.equal(nextConfig.poweredByHeader, false);
  const rules = await nextConfig.headers();
  const general = rules.find((rule) => rule.source === "/:path*");
  const api = rules.find((rule) => rule.source === "/api/:path*");
  assert.equal(general?.headers.find((header) => header.key === "X-Content-Type-Options")?.value, "nosniff");
  assert.equal(general?.headers.find((header) => header.key === "X-Frame-Options")?.value, "DENY");
  assert.match(general?.headers.find((header) => header.key === "Permissions-Policy")?.value ?? "", /microphone=\(self\)/);
  assert.equal(api?.headers.find((header) => header.key === "Cache-Control")?.value, "private, no-store");
});

test("MedicForest receives its own robots and sitemap routes", async () => {
  const rewrites = await nextConfig.rewrites();
  assert.ok(!Array.isArray(rewrites));
  assert.ok(rewrites.beforeFiles.some((rule) => rule.source === "/robots.txt"
    && rule.destination === "/medicforest/robots-file"
    && rule.has?.[0]?.value === "medicforest.com"));
  assert.ok(rewrites.beforeFiles.some((rule) => rule.source === "/sitemap.xml"
    && rule.destination === "/medicforest/sitemap.xml"
    && rule.has?.[0]?.value === "medicforest.com"));
});

test("public shell links stay on MedicForest on both supported path forms", () => {
  assert.equal(medicForestPublicHref("/about", "/pricing"), "/pricing");
  assert.equal(medicForestPublicHref("/medicforest/about", "/pricing"), "/medicforest/pricing");
  assert.equal(medicForestPublicHref("/medicforest", "/"), "/medicforest");
  assert.equal(medicForestPublicHref("/medicforest/about", "/medicforest/ucat/dashboard"), "/medicforest/ucat/dashboard");
  assert.equal(medicForestPublicHref("/medicforest-extra", "/about"), "/about");
});

test("Medic Forest serves the product landing page without changing the visible URL", async () => {
  const rewrites = await nextConfig.rewrites();
  assert.ok(!Array.isArray(rewrites));
  const apexHost = [{ type: "host", value: "medicforest.com" }];
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/"
    && rule.destination === "/medicforest" && JSON.stringify(rule.has) === JSON.stringify(apexHost)));
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/ucat/:path*"
    && rule.destination === "/medicforest/ucat/:path*" && JSON.stringify(rule.has) === JSON.stringify(apexHost)));
  for (const page of ["about", "pricing", "tutoring", "resources", "feedback", "contact"]) {
    const route = rewrites.beforeFiles.find(rule => rule.source.startsWith("/:page("));
    assert.ok(route?.source.includes(page));
    assert.equal(route.destination, "/medicforest/:page");
  }
});

test("scrapped MedicForest personal statement page redirects to live tutoring", async () => {
  const redirects = await nextConfig.redirects();
  assert.ok(redirects.some(rule => rule.source === "/personal-statement"
    && rule.has?.[0]?.value === "medicforest.com"
    && rule.destination === "https://medicforest.com/tutoring" && rule.permanent));
  assert.ok(redirects.some(rule => rule.source === "/medicforest/personal-statement"
    && !rule.has && rule.destination === "/medicforest/tutoring" && rule.permanent));
});

test("www MedicForest redirects permanently to the apex domain", async () => {
  const redirects = await nextConfig.redirects();
  assert.ok(redirects.some(rule => rule.source === "/" && rule.has?.[0]?.value === "www.medicforest.com"
    && rule.destination === "https://medicforest.com" && rule.permanent));
});

test("old MedicForest-prefixed URLs normalize to clean product URLs", async () => {
  const redirects = await nextConfig.redirects();
  assert.ok(redirects.some(rule => rule.source === "/medicforest/ucat"
    && rule.destination === "https://medicforest.com/ucat"));
  assert.ok(redirects.some(rule => rule.source === "/medicforest/ucat/:path+"
    && rule.destination === "https://medicforest.com/ucat/:path+"));
});

test("MedicForest Med interview URLs open the real platform under clean routes", async () => {
  const redirects = await nextConfig.redirects();
  const rewrites = await nextConfig.rewrites();
  assert.ok(!Array.isArray(rewrites));
  assert.ok(!redirects.some(rule => rule.source === "/interviews"
    && rule.has?.[0]?.value === "medicforest.com"));
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/interviews"
    && rule.destination === "/medicforest/interviews"));
  assert.ok(redirects.some(rule => rule.source === "/medicforest/interview/:path+"
    && rule.destination === "https://medicforest.com/interviews/:path+"));
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/interviews/:path+"
    && rule.destination === "/medicforest/interview/:path+"));
});

test("public Med interview resources bypass the MedicForest preview gate", () => {
  assert.equal(isPublicMedicForestPath("/medicforest/interview-stimuli/iq-18-001-data-stations.png"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview-stimuli/iq-18-015-article-analysis.png"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview/leaderboard"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview/dashboard"), false);
});
