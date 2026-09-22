import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../next.config.ts";

test("Medic Forest serves the product landing page without changing the visible URL", async () => {
  const rewrites = await nextConfig.rewrites();
  assert.ok(!Array.isArray(rewrites));
  assert.deepEqual(rewrites.beforeFiles, [{
    source: "/",
    has: [{ type: "host", value: "medicforest.com" }],
    destination: "/phloemai",
  }]);
});

test("www and legacy PhloemAI domains redirect permanently to Medic Forest", async () => {
  const redirects = await nextConfig.redirects();
  assert.ok(redirects.some(rule => rule.source === "/" && rule.has?.[0]?.value === "www.medicforest.com"
    && rule.destination === "https://medicforest.com" && rule.permanent));
  for (const host of ["phloemai.com", "www.phloemai.com"]) {
    assert.ok(redirects.some(rule => rule.source === "/" && rule.has?.[0]?.value === host
      && rule.destination === "https://medicforest.com" && rule.permanent));
  }
});
