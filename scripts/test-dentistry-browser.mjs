// Local-only browser fixtures. No account writes or AI provider calls.
import assert from "node:assert/strict";
import { chromium, webkit } from "playwright";

const base = process.env.MOBILE_TEST_URL ?? "http://localhost:3100";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname));
const root = `${base}/medicforest/dentistry/interviews`;
const id = "00000000-0000-4000-8000-000000000088";
const spoken = "I want to study dentistry because I value helping people and learning practical skills. I have explored the responsibility of caring for patients and listening to their concerns.";

for (const [engine, width] of [[chromium, 1280], [webkit, 390]].filter(([engine]) => !process.env.BROWSER_ENGINE || engine.name() === process.env.BROWSER_ENGINE)) {
  const browser = await engine.launch();
  try {
    const mobile = width === 390;
    const context = await browser.newContext({ viewport: { width, height: 844 }, ...(mobile ? {
      isMobile: true, hasTouch: true,
      userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1",
    } : {}) });
    await context.route("https://challenges.cloudflare.com/**", route => route.abort());
    await context.addInitScript(() => {
      window.addEventListener("medicforest:feature-access", event => event.stopImmediatePropagation(), true);
      window.__captureCount = 0;
      // Playwright WebKit on Windows omits the mediaDevices implementation.
      if (!navigator.mediaDevices) Object.defineProperty(navigator, "mediaDevices", { value: {}, configurable: true });
      navigator.mediaDevices.getUserMedia = async () => {
        window.__captureCount++;
        return { getTracks: () => [{ stop() {} }] };
      };
      class Recognition {
        start() { window.__recognition = this; window.__recognitionStarts = (window.__recognitionStarts ?? 0) + 1; this.onstart?.(); }
        stop() { this.onend?.(); }
        abort() { this.onend?.(); }
      }
      window.SpeechRecognition = window.webkitSpeechRecognition = Recognition;
      window.__say = text => {
        const result = Object.assign([{ transcript: text, confidence: 0.95 }], { isFinal: true });
        window.__recognition.onresult({ resultIndex: 0, results: [result] });
      };
    });
    const attempt = {
      platform: "dentistry", id, circuitId: id, mode: "station", title: "Why dentistry?", stationSlug: "why-dentistry", universitySlug: null,
      status: "in_progress", startedAt: new Date().toISOString(), completedAt: null, answerSubmittedAt: null,
      preparationSeconds: 0, stationSeconds: 480, breakSeconds: 0, stationIndex: 0, stationCount: 1,
      questions: ["Why do you want to study dentistry?", "What helped you decide that dentistry suits you?", "Why dentistry rather than another healthcare career?"],
      questionIds: ["dq-01-001", "dq-01-002", "dq-01-003"], answers: [], metrics: {}, feedback: null, nextAvailableAt: null,
    };
    const writes = [];
    await context.route("**/api/interviews/session**", async route => {
      const request = route.request();
      const url = new URL(request.url());
      assert.equal(url.searchParams.get("platform"), "dentistry");
      if (request.method() === "PATCH") {
        const body = request.postDataJSON();
        writes.push(body);
        attempt.answers = body.answers;
        if (body.finish) Object.assign(attempt, { status: "submitted", completedAt: new Date().toISOString() });
      } else assert.equal(request.method(), "GET");
      await route.fulfill({ json: { attempt: url.searchParams.has("attempt") || request.method() === "PATCH" ? attempt : null, configured: true, isPremium: true, serverNow: new Date().toISOString() } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("dialog", dialog => dialog.accept());
    page.setDefaultTimeout(25_000);

    await page.goto(`${root}/dashboard`);
    await page.getByRole("heading", { name: "Make your next answer count.", exact: true }).waitFor();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `.next/dentistry-dashboard-${width}.png`, fullPage: true });
    await page.goto(`${root}/question-bank`);
    await page.getByRole("button", { name: /Open Personal/ }).click();
    await page.getByText("Why do you want to study dentistry?", { exact: true }).click();
    assert.match(page.url(), /\/dentistry\/interviews\/question-bank/);
    await page.getByRole("heading", { name: "Why do you want to study dentistry?", exact: true }).waitFor();
    await page.goto(`${root}/guides/manual-dexterity`);
    await page.getByRole("heading", { name: "Manual dexterity: practise the process", exact: true }).waitFor();
    assert.match(await page.locator("body").innerText(), /do not assess the movement of your hands/);
    await page.goto(`${root}/ai-interviews?setup=custom`);
    await page.getByRole("heading", { name: "Build your dentistry interview", exact: true }).waitFor();
    assert.doesNotMatch(await page.locator("body").innerText(), /Why medicine\? challenge|medical school|Join Med interview/);
    await page.getByRole("button", { name: "University", exact: true }).click();
    await page.getByLabel("Your university", { exact: true }).selectOption("dundee");
    assert.doesNotMatch(await page.locator("body").innerText(), /Your panel interview|mixed questions/);

    await page.goto(`${root}/ai-interviews?attempt=${id}`);
    await page.locator("#interview-answer").waitFor();
    await page.getByRole("button", { name: "Turn interviewer voice off", exact: true }).click();
    if (mobile) {
      await page.waitForFunction(() => window.__recognition?.onresult).catch(async error => {
        console.error(await page.locator("body").innerText(), errors, await page.evaluate(() => ({ recognition: typeof window.SpeechRecognition, captures: window.__captureCount, starts: window.__recognitionStarts, hidden: document.hidden })));
        throw error;
      });
      assert.equal(await page.evaluate(() => window.__recognition.continuous), false);
      const captures = await page.evaluate(() => window.__captureCount);
      await page.evaluate(text => window.__say(text), spoken);
      await page.waitForFunction(text => document.querySelector("#interview-answer").value.includes(text), spoken);
      const starts = await page.evaluate(() => window.__recognitionStarts);
      await page.evaluate(() => window.__recognition.onend());
      await page.waitForFunction(count => window.__recognitionStarts > count, starts);
      await page.evaluate(() => window.__say("I would keep reflecting on what I learn."));
      await page.waitForFunction(() => document.querySelector("#interview-answer").value.includes("keep reflecting"));
      assert.equal(await page.evaluate(() => window.__captureCount), captures, "Recognition restarts without another microphone capture");
      assert.equal((await page.locator("#interview-answer").inputValue()).split(spoken).length, 2, "First utterance is retained once");
    } else {
      await page.getByRole("button", { name: "Stop mic", exact: true }).click();
      await page.locator("#interview-answer").fill(spoken);
    }
    await page.getByRole("button", { name: "Leave or finish interview", exact: true }).click();
    await page.getByRole("button", { name: "Finish & review", exact: true }).click();
    await page.locator("[data-station-review]").waitFor();
    assert.ok(writes.some(write => write.finish && write.answers[0].answer.includes(spoken)));
    const checklist = page.locator("[data-mark-scheme] button[aria-pressed]");
    await checklist.first().click();
    const firstPoint = await checklist.first().innerText();
    assert.match(await page.locator("[data-mark-scheme]").innerText(), /dentistry|dental/);
    await page.reload();
    await page.locator("[data-station-review]").waitFor();
    await page.waitForFunction(text => [...document.querySelectorAll('[data-mark-scheme] button[aria-pressed="true"]')].some(button => button.textContent.trim() === text.trim()), firstPoint);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
    await page.screenshot({ path: `.next/dentistry-review-${width}.png`, fullPage: true });
    assert.deepEqual(errors, []);
    console.log(`${engine.name()} ${width}px: dentistry navigation, guides, school setup, scoped saving, marks and reload passed${mobile ? "; simulated iPhone utterances and restart passed" : ""}`);
    await context.close();
  } finally { await browser.close(); }
}
