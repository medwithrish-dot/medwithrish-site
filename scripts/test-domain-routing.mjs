import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";
import { isPublicMedicForestPath } from "../utils/medicforest/public-paths.ts";
import { medicForestPublicHref } from "../utils/medicforest/public-navigation.ts";

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

test("MedicForest interview URLs open the real platform under clean routes", async () => {
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

test("public interview resources bypass the MedicForest preview gate", () => {
  assert.equal(isPublicMedicForestPath("/medicforest/interview-stimuli/iq-18-001-data-stations.png"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview-stimuli/iq-18-015-article-analysis.png"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview/leaderboard"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview/dashboard"), false);
});
