import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";

test("Medic Forest serves the product landing page without changing the visible URL", async () => {
  const rewrites = await nextConfig.rewrites();
  assert.ok(!Array.isArray(rewrites));
  assert.deepEqual(rewrites.beforeFiles, [{
    source: "/",
    has: [{ type: "host", value: "medicforest.com" }],
    destination: "/medicforest",
  }]);
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
