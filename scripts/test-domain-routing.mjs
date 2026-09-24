import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";

test("Medic Forest serves the product landing page without changing the visible URL", async () => {
  const rewrites = await nextConfig.rewrites();
  assert.ok(!Array.isArray(rewrites));
  const apexHost = [{ type: "host", value: "medicforest.com" }];
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/"
    && rule.destination === "/medicforest" && JSON.stringify(rule.has) === JSON.stringify(apexHost)));
  assert.ok(rewrites.beforeFiles.some(rule => rule.source === "/ucat/:path*"
    && rule.destination === "/medicforest/ucat/:path*" && JSON.stringify(rule.has) === JSON.stringify(apexHost)));
  for (const page of ["about", "pricing", "personal-statement", "interviews", "tutoring", "resources", "feedback", "contact"]) {
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

test("MedicForest interviews landing is not swallowed by the legacy interview redirect", async () => {
  const redirects = await nextConfig.redirects();
  assert.ok(redirects.some(rule => rule.source === "/medicforest/interviews/:path+"
    && rule.destination === "/medicforest/interview/:path+"));
  assert.ok(!redirects.some(rule => rule.source === "/medicforest/interviews"));
});

test("old MedicForest-prefixed URLs normalize to clean product URLs", async () => {
  const redirects = await nextConfig.redirects();
  assert.ok(redirects.some(rule => rule.source === "/medicforest/ucat"
    && rule.destination === "https://medicforest.com/ucat"));
  assert.ok(redirects.some(rule => rule.source === "/medicforest/ucat/:path+"
    && rule.destination === "https://medicforest.com/ucat/:path+"));
});
