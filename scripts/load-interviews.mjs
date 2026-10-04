// Read-only HTTP capacity probe. No station starts, writes, payments or AI calls.
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";
const origin = new URL(process.env.INTERVIEW_LOAD_ORIGIN ?? "http://localhost:3000");
if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) throw new Error("Use a plain HTTP(S) origin.");
function integer(name, fallback, max) {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`${name} must be between 1 and ${max}`);
  return value;
}
const users = integer("INTERVIEW_LOAD_USERS", 50, 100);
const duration = integer("INTERVIEW_LOAD_SECONDS", 30, 300);
const paths = process.env.INTERVIEW_LOAD_PATHS ? JSON.parse(process.env.INTERVIEW_LOAD_PATHS) : ["/api/health", "/medicforest/interviews"];
if (!Array.isArray(paths) || !paths.length || paths.some(path => typeof path !== "string" || !path.startsWith("/") || path.startsWith("//") || new URL(path, origin).origin !== origin.origin)) throw new Error("INTERVIEW_LOAD_PATHS must contain local paths only.");
const cookies = process.env.INTERVIEW_LOAD_COOKIES_FILE ? JSON.parse(await readFile(process.env.INTERVIEW_LOAD_COOKIES_FILE, "utf8")) : [];
if (!Array.isArray(cookies) || cookies.some(cookie => typeof cookie !== "string" || /[\r\n]/.test(cookie))) throw new Error("Cookie file must contain a JSON array of cookie header strings.");
if (cookies.length && cookies.length < users) throw new Error("Provide a distinct test-account cookie header for every worker.");
const results = new Map(paths.map(path => [path, { latencies: [], statuses: {}, networkErrors: 0 }]));
const deadline = performance.now() + duration * 1000;
await Promise.all(Array.from({ length: users }, async (_, worker) => {
  let round = worker;
  while (performance.now() < deadline) {
    const path = paths[round++ % paths.length];
    const metrics = results.get(path); const started = performance.now();
    try {
      const response = await fetch(new URL(path, origin), {
        redirect: "manual", signal: AbortSignal.timeout(15_000),
        headers: { ...(cookies[worker] ? { Cookie: cookies[worker] } : {}), ...(process.env.INTERVIEW_LOAD_HOST ? { Host: process.env.INTERVIEW_LOAD_HOST } : {}) },
      });
      await response.arrayBuffer();
      metrics.statuses[response.status] = (metrics.statuses[response.status] ?? 0) + 1;
    } catch { metrics.networkErrors++; }
    metrics.latencies.push(performance.now() - started);
    // One browser-equivalent request per second, rather than a busy loop.
    const remaining = Math.min(deadline - performance.now(), 1000 - (performance.now() - started));
    if (remaining > 0) await new Promise(resolve => setTimeout(resolve, remaining));
  }
}));
let failed = false;
const report = { origin: origin.origin, users, seconds: duration, authenticated: cookies.length > 0, paths: {} };
for (const [path, metrics] of results) {
  const sorted = metrics.latencies.sort((a, b) => a - b);
  const percentile = percent => Math.round(sorted[Math.max(0, Math.ceil(sorted.length * percent) - 1)] ?? 0);
  const unsuccessful = metrics.networkErrors + Object.entries(metrics.statuses).filter(([status]) => Number(status) < 200 || Number(status) >= 300).reduce((sum, [, count]) => sum + count, 0);
  const errorRate = sorted.length ? unsuccessful / sorted.length : 1;
  report.paths[path] = { requests: sorted.length, statuses: metrics.statuses, networkErrors: metrics.networkErrors, p50Ms: percentile(0.5), p95Ms: percentile(0.95), errorRate };
  if (errorRate > 0.01 || percentile(0.95) > 2000) failed = true;
}
console.log(JSON.stringify(report, null, 2));
if (failed) process.exitCode = 1;
