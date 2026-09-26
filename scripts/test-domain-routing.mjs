import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";
import { isPublicMedicForestPath } from "../utils/medicforest/public-paths.ts";

test("Medic Forest serves the product landing page without changing the visible URL", async () => {
  const rewrites = await nextConfig.rewrites();
  assert.ok(!Array.isArray(rewrites));
  const apexHost = [{ type: "host", value: "medicforest.com" }];
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/"
    && rule.destination === "/medicforest" && JSON.stringify(rule.has) === JSON.stringify(apexHost)));
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/ucat/:path*"
    && rule.destination === "/medicforest/ucat/:path*" && JSON.stringify(rule.has) === JSON.stringify(apexHost)));
  for (const page of ["about", "pricing", "personal-statement", "tutoring", "resources", "feedback", "contact"]) {
    const route = rewrites.beforeFiles.find(rule => rule.source.startsWith("/:page("));
    assert.ok(route?.source.includes(page));
    assert.equal(route.destination, "/medicforest/:page");
  }
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

test("interview stimulus images bypass the MedicForest preview gate", () => {
  assert.equal(isPublicMedicForestPath("/medicforest/interview-stimuli/iq-18-001-data-stations.png"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview-stimuli/iq-18-015-article-analysis.png"), true);
  assert.equal(isPublicMedicForestPath("/medicforest/interview/dashboard"), false);
});
