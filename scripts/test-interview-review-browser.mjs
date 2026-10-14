// Local browser regression checks for saved notes and self-marking. All station
// requests use isolated fixtures; no account data or AI provider is changed.
import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";
import { DATA_INTERPRETATION_STATION_QUESTIONS } from "../app/medicforest/interview/_data/data-interpretation-station.ts";

const base = process.env.MOBILE_TEST_URL ?? "http://localhost:3100";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Run fixtures against a local server.");
const attemptId = "00000000-0000-4000-8000-000000000099";
const note = "Next time I will compare both districts before suggesting a cause.";

for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 844 } });
      await context.route("https://challenges.cloudflare.com/**", route => route.abort());
      await context.addInitScript(() => {
        window.addEventListener("medicforest:feature-access", event => event.stopImmediatePropagation(), true);
        window.SpeechRecognition = undefined;
        window.webkitSpeechRecognition = undefined;
        if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("Permission denied", "NotAllowedError"); };
      });
      const attempt = {
        id: attemptId, circuitId: attemptId, mode: "station", title: "Data interpretation", stationSlug: "data-analysis", universitySlug: null,
        status: "in_progress", startedAt: new Date().toISOString(), completedAt: null, answerSubmittedAt: null,
        preparationSeconds: 0, stationSeconds: 480, breakSeconds: 0, stationIndex: 0, stationCount: 1,
        questions: DATA_INTERPRETATION_STATION_QUESTIONS.map(question => question.text), questionIds: DATA_INTERPRETATION_STATION_QUESTIONS.map(question => question.id),
        answers: [], metrics: {}, feedback: null, nextAvailableAt: null,
      };
      const requests = [];
      await context.route("**/api/interviews/session**", async route => {
        const request = route.request();
        requests.push({ method: request.method(), body: request.postDataJSON() });
        if (request.method() === "PATCH") {
          const body = request.postDataJSON();
          attempt.answers = body.answers;
          if (body.finish) Object.assign(attempt, { status: "submitted", completedAt: new Date().toISOString() });
        } else assert.equal(request.method(), "GET");
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ attempt, configured: true, isPremium: true, serverNow: new Date().toISOString() }) });
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      page.on("dialog", dialog => dialog.accept());
      page.setDefaultTimeout(20_000);
      await page.goto(`${base}/medicforest/interview/ai-interviews?attempt=${attemptId}`);
      await page.locator("#interview-answer").waitFor();
      await page.getByText("Beta", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Turn interviewer voice off", exact: true }).click();
      const autosaved = page.waitForResponse(response => new URL(response.url()).pathname === "/api/interviews/session" && response.request().method() === "PATCH");
      await page.locator("#interview-answer").fill("The chart shows different patterns in the two districts. I would compare the years and reporting practices before attributing the changes to online triage.");
      await page.getByRole("button", { name: "Notes", exact: true }).click();
      await page.locator("[data-station-notes]:visible").fill(note);
      await page.getByRole("button", { name: /Live transcript/ }).click();
      assert.equal(await page.locator("[data-station-notes]:visible").count(), 0);
      await page.getByRole("button", { name: "Notes", exact: true }).click();
      assert.equal(await page.locator("[data-station-notes]:visible").inputValue(), note);
      await (await autosaved).finished();
      await page.getByRole("button", { name: /Live transcript/ }).click();
      await page.getByText("Saved to your account", { exact: true }).waitFor();
      await page.reload();
      await page.locator("#interview-answer").waitFor();
      await page.getByRole("button", { name: "Notes", exact: true }).click();
      assert.equal(await page.locator("[data-station-notes]:visible").inputValue(), note, "Private notes survive a reload");
      await page.getByRole("button", { name: "Finish station", exact: true }).click();
      await page.getByRole("button", { name: "Finish & review", exact: true }).click();
      await page.locator("[data-station-review]").waitFor();
      assert.equal(await page.locator("[data-station-notes]").inputValue(), note, "Room notes remain available in review");
      for (const request of requests.filter(request => request.body)) assert.doesNotMatch(JSON.stringify(request.body), /Next time I will compare/, "Private notes never enter station requests");
      const checklist = page.locator("[data-mark-scheme] button[aria-pressed]");
      const firstPoint = await checklist.first().innerText();
      await checklist.first().click();
      assert.equal(await checklist.first().getAttribute("aria-pressed"), "true");
      const selector = page.getByLabel("Question markscheme", { exact: true });
      await selector.selectOption("1");
      assert.equal(await page.locator('[data-mark-scheme] button[aria-pressed="true"]').count(), 0, "Another question starts with its own checklist");
      await selector.selectOption("0");
      assert.equal(await checklist.first().getAttribute("aria-pressed"), "true", "Switching questions keeps the first checklist");
      await page.reload();
      await page.locator("[data-station-review]").waitFor();
      await page.waitForFunction(text => [...document.querySelectorAll('[data-mark-scheme] button[aria-pressed="true"]')].some(button => button.textContent.trim() === text.trim()), firstPoint);
      assert.equal(await page.locator("[data-station-notes]").inputValue(), note);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, "Review fits the viewport");
      await page.goto(`${base}/medicforest/ucat/wip`);
      assert.equal(await page.getByRole("link", { name: "Return to interviews", exact: true }).getAttribute("href"), "https://medicforest.com/interviews");
      await page.getByRole("heading", { name: "UCAT is coming soon" }).waitFor();
      assert.deepEqual(errors, [], "No runtime errors while saving and reviewing");
      console.log(`${engine.name()} ${width}px: notes, reload, review, separate checklists, beta and UCAT return link passed`);
      await context.close();
    }
  } finally { await browser.close(); }
}
