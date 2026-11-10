// Local fixtures only: exercise the real review button without AI or account writes.
import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.MOBILE_TEST_URL ?? "http://localhost:3100";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const id = "00000000-0000-4000-8000-000000000099";
const question = "Why medicine?";
const answer = "Working with residents in a care home taught me to listen carefully and recognise how different members of the healthcare team support each person.";
const feedback = { score: 75, summary: "You explained what you learned from listening.", strengths: ["A specific example"], improvements: ["Explain your own contribution"], rubric: [] };

for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    for (const width of [390, 1280]) {
      for (const scenario of ["stale", "fresh", "completed-elsewhere"]) {
        const context = await browser.newContext({ viewport: { width, height: 844 } });
        try {
          await context.route("https://challenges.cloudflare.com/**", route => route.abort());
          const attempt = {
            id, circuitId: id, mode: "station", title: question, stationSlug: "why-medicine", universitySlug: null,
            status: "grading", startedAt: new Date(Date.now() - 600_000).toISOString(), completedAt: new Date().toISOString(),
            preparationSeconds: 0, stationSeconds: 480, breakSeconds: 0, stationIndex: 0, stationCount: 1,
            questions: [question], answers: [{ question, answer }], metrics: {}, feedback: null,
          };
          let completeElsewhere = false;
          let posts = 0;
          let fresh = scenario === "fresh";
          await context.route("**/api/interviews/session**", async route => {
            assert.equal(route.request().method(), "GET");
            if (completeElsewhere) Object.assign(attempt, { status: "completed", feedback });
            await route.fulfill({ json: { attempt, configured: true, isPremium: true, serverNow: new Date().toISOString() } });
          });
          await context.route("**/api/interviews/feedback", async route => {
            posts++;
            assert.equal(route.request().method(), "POST");
            assert.deepEqual(route.request().postDataJSON(), { attemptId: id });
            if (fresh) {
              await route.fulfill({ status: 409, json: { error: "Feedback is already being generated. Please wait and check again shortly." } });
            } else {
              Object.assign(attempt, { status: "completed", feedback });
              await route.fulfill({ json: { attempt } });
            }
          });
          const page = await context.newPage();
          const errors = [];
          page.on("pageerror", error => errors.push(error.message));
          await page.goto(`${base}/medicforest/interview/ai-interviews?attempt=${id}`);
          const checkButton = page.getByRole("button", { name: "Check AI feedback", exact: true }).first();
          await checkButton.waitFor();
          completeElsewhere = scenario === "completed-elsewhere";
          await checkButton.click();
          if (fresh) {
            await page.getByText("Feedback is already being generated. Please wait and check again shortly.", { exact: true }).waitFor();
            assert.equal(posts, 1);
            assert.equal(attempt.status, "grading");
            fresh = false; // The server's grading lease has now expired.
            await page.getByRole("button", { name: "Check AI feedback", exact: true }).first().click();
          }
          await page.getByRole("button", { name: "View AI feedback", exact: true }).first().waitFor();
          assert.equal(posts, scenario === "completed-elsewhere" ? 0 : scenario === "fresh" ? 2 : 1);
          assert.deepEqual(attempt.answers, [{ question, answer }]);
          assert.deepEqual(errors, []);
          console.log(`${engine.name()} ${width}px: ${scenario} recovery passed`);
        } finally { await context.close(); }
      }
    }
  } finally { await browser.close(); }
}
