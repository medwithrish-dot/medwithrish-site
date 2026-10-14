// Start the site, then run MOBILE_TEST_URL=http://localhost:3100 npm run test:mobile.
// Install browser engines once with: npx playwright install chromium webkit.
// Authenticated UI tests use a fake account and intercepted Supabase responses.
// They never create accounts, charge cards, or write to the real database.
// Third-party CAPTCHA runs on HTTPS in production; it is blocked on localhost.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parse } from "dotenv";
import { chromium, webkit } from "playwright";

const base = process.env.MOBILE_TEST_URL ?? "http://localhost:3000";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Run mobile fixtures against a local server.");
let env = {};
try { env = parse(readFileSync(".env.local")); } catch { /* Public checks also work without local credentials. */ }
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? env.NEXT_PUBLIC_SUPABASE_URL;
const questionPath = "/medicforest/interview/question-bank?question=iq-01-001-motivation-for-medicine";
const answer = "I want to study medicine because I enjoy solving problems and supporting people. My work experience helped me understand the responsibility and teamwork involved in caring for patients.";
const paths = [
  "/medicforest", "/medicforest/about", "/medicforest/account", "/medicforest/pricing",
  "/medicforest/tutoring", "/medicforest/resources", "/medicforest/feedback",
  ...["dashboard", "ai-interviews", "question-bank", "groups", "leaderboard", "guides", "progress", "plan", "reports", "universities"].map(section => `/medicforest/interview/${section}`),
  "/medicforest/interview/ai-interviews?setup=mock", questionPath, "/medicforest/ucat/wip",
];

async function layout(page) {
  const issues = await page.evaluate(() => {
    const shown = e => e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0 && !e.closest('[aria-hidden="true"]');
    const fields = [...document.querySelectorAll('input:not([type="checkbox"]):not([type="radio"]):not([type="hidden"]),select,textarea')].filter(e => shown(e) && e.tabIndex >= 0);
    const buttons = [...document.querySelectorAll('.medicforest-dashboard-compact button, [data-medicforest-access-dialog] button')].filter(shown);
    return {
      overflow: document.documentElement.scrollWidth > innerWidth,
      smallFields: fields.filter(e => parseFloat(getComputedStyle(e).fontSize) < 16).map(e => e.id || e.getAttribute("aria-label") || e.tagName),
      smallButtons: buttons.filter(e => e.getBoundingClientRect().height < 43.5 || e.getBoundingClientRect().width < 43.5).map(e => e.getAttribute("aria-label") || e.textContent.trim()),
    };
  });
  assert.equal(issues.overflow, false, `Page overflows: ${page.url()}`);
  assert.deepEqual(issues.smallFields, [], `Small phone inputs: ${page.url()}`);
  assert.deepEqual(issues.smallButtons, [], `Small touch targets: ${page.url()}`);
}

async function visit(page, path) {
  // Complete initial account requests before the sweep replaces the document.
  // Windows WebKit otherwise reports cancelled fetches as access-control errors.
  const section = ["groups", "leaderboard"].find(name => path.endsWith(`/interview/${name}`));
  const accountResponse = section ? page.waitForResponse(response => new URL(response.url()).pathname === `/api/interviews/${section}`) : null;
  const response = await page.goto(base + path);
  assert.equal(response.status(), 200, path);
  await page.locator("h1").first().waitFor();
  if (path.includes("setup=mock")) await page.getByRole("button", { name: "Preview room", exact: true }).waitFor();
  // Dynamic section bundles and account subscriptions settle after the heading.
  await page.waitForTimeout(350);
  if (accountResponse) {
    const loaded = await accountResponse;
    await loaded.finished();
  }
}

function runtimeErrors(page, engine) {
  const errors = [];
  page.on("pageerror", error => {
    // Windows WebKit sometimes reports a Next prefetch cancelled by page.goto
    // as an access-check error. Real responses and selected-link navigations
    // are asserted separately; keep all other runtime errors as failures.
    const cancelledPrefetch = engine === webkit && error.message.includes(new URL(base).host)
      && error.message.includes("_rsc=") && error.message.endsWith("due to access control checks.");
    if (!cancelledPrefetch) errors.push(error.message);
  });
  return errors;
}

async function publicFlows(page) {
  await visit(page, "/medicforest/about");
  await page.getByRole("button", { name: "Go to flip page 2", exact: true }).tap();
  assert.equal(await page.getByRole("button", { name: "Go to flip page 2", exact: true }).getAttribute("aria-current"), "true");
  const originalSize = page.viewportSize();
  await page.getByText("View full receipt", { exact: true }).first().tap();
  await page.getByRole("dialog").waitFor();
  await page.setViewportSize({ width: originalSize.width, height: 360 });
  await layout(page);
  await page.getByRole("button", { name: "Close modal", exact: true }).tap();
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.setViewportSize(originalSize);
  await visit(page, "/medicforest/tutoring");
  await page.getByRole("button", { name: "Go to outcome slide 2", exact: true }).tap();
  assert.equal(await page.getByRole("button", { name: "Go to outcome slide 2", exact: true }).getAttribute("aria-current"), "true");

  await visit(page, "/medicforest/account");
  await page.getByRole("button", { name: "Create Account", exact: true }).tap();
  await page.locator("#fullName").waitFor();
  await layout(page);
  await page.getByRole("button", { name: "Log In", exact: true }).tap();
  assert.equal(await page.locator("#fullName").count(), 0);

  await visit(page, "/medicforest/interview/guides");
  await page.locator("#interview-guide-search").pressSequentially("no-such-phone-test-guide");
  assert.equal(await page.locator("[data-interview-shell-main]").evaluate(e => getComputedStyle(e).touchAction), "auto", "Phone content permits native swipe and zoom gestures");
  await page.getByRole("heading", { name: "No guides match those filters" }).waitFor();
  await page.getByRole("button", { name: "Show all guides", exact: true }).tap();
  await page.getByRole("heading", { name: "Featured guides", exact: true }).waitFor();
  await page.locator("#interview-guide-search").fill("Why Medicine");
  await page.locator('a[href*="/guides/why-medicine"]').first().tap();
  await page.waitForURL("**/guides/why-medicine");
  await layout(page);

  await visit(page, questionPath);
  await page.getByRole("button", { name: "Sign up for free / log in", exact: true }).tap();
  await page.locator("dialog[open]").waitFor();
  await layout(page);
  await page.getByRole("button", { name: "Keep browsing", exact: true }).tap();
  assert.equal(await page.locator("dialog[open]").count(), 0);
  await page.getByRole("button", { name: "Back to questions", exact: true }).tap();
  await page.getByPlaceholder("Search questions...", { exact: true }).waitFor();
  await page.getByPlaceholder("Search questions...", { exact: true }).fill("no-such-phone-test-question");
  await page.getByPlaceholder("Search questions...", { exact: true }).fill("");

  await visit(page, "/medicforest/interview/groups");
  await page.waitForFunction(() => [...document.querySelectorAll("button")].some(button => button.textContent.trim() === "Create group" && !button.disabled));
  await page.locator("#study-group-name").pressSequentially("Phone practice group");
  await page.getByRole("button", { name: "Create group", exact: true }).tap();
  await page.locator("dialog[open]").waitFor();
  await page.getByRole("button", { name: "Close popup", exact: true }).tap();
  assert.equal(await page.locator("#study-group-name").inputValue(), "Phone practice group");

  await page.locator("nav summary").tap();
  assert.equal(await page.locator("nav details a:visible").count(), 10);
  await page.getByRole("link", { name: "Guides", exact: true }).tap();
  await page.waitForURL("**/interview/guides");
  assert.equal(await page.locator("nav details[open]").count(), 0);
}

async function fixtureContext(browser) {
  assert.ok(supabaseUrl, "Set NEXT_PUBLIC_SUPABASE_URL for the isolated authenticated UI tests.");
  const host = new URL(supabaseUrl).hostname;
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true });
  const user = { id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: "phone-test@example.invalid", user_metadata: { full_name: "Phone Test" }, app_metadata: { provider: "email", providers: ["email"] }, created_at: new Date().toISOString() };
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const token = [{ alg: "HS256", typ: "JWT" }, { sub: user.id, aud: "authenticated", role: "authenticated", exp }, "test"].map(value => Buffer.from(typeof value === "string" ? value : JSON.stringify(value)).toString("base64url")).join(".");
  await context.addCookies([{ url: base, name: `sb-${host.split(".")[0]}-auth-token`, value: "base64-" + Buffer.from(JSON.stringify({ access_token: token, refresh_token: "test", expires_at: exp, expires_in: 3600, token_type: "bearer", user })).toString("base64url") }]);
  await context.route(url => url.hostname === host, route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(route.request().url().includes("/auth/") ? { user } : route.request().url().includes("/profiles") ? { full_name: "Phone Test", current_plan: "free" } : []) }));
  await context.route("**/api/interviews/**", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ attempt: null, configured: true, isPremium: false }) }));
  await context.addInitScript(() => {
    // Only local UI fixtures skip the server-provided guest entitlement prompt.
    window.addEventListener("medicforest:feature-access", event => event.stopImmediatePropagation(), true);
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => { throw new DOMException("Permission denied", "NotAllowedError"); };
  });
  return context;
}

async function authenticatedFlows(page) {
  await visit(page, questionPath);
  await page.locator("textarea").waitFor();
  await page.getByRole("button", { name: "Open account menu", exact: true }).tap();
  const menu = page.getByRole("menu");
  const bounds = await menu.boundingBox();
  assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 320, "Account menu fits the phone");
  assert.ok(bounds.y >= 0 && bounds.y + bounds.height <= 568, "Account menu fits a short phone vertically");
  await page.touchscreen.tap(4, 120);
  assert.equal(await menu.count(), 0, "Tapping outside closes the menu");
  await page.getByRole("button", { name: "Start", exact: true }).tap();
  await page.locator("textarea").fill(answer);
  await page.getByRole("button", { name: "Pause", exact: true }).tap();
  await page.getByRole("button", { name: "Resume", exact: true }).tap();
  await page.getByRole("button", { name: "Finish & Review", exact: true }).tap();
  await page.getByRole("heading", { name: "Review Saved Answer", exact: true }).waitFor();
  assert.ok((await page.locator("main").innerText()).includes(answer));
  await layout(page);
  await page.getByRole("button", { name: "Retry This Question", exact: true }).tap();
  assert.equal(await page.locator("textarea").inputValue(), "");

  await visit(page, "/medicforest/interview/ai-interviews?setup=mock");
  await page.getByRole("switch", { name: "Read questions aloud" }).tap();
  await page.getByRole("button", { name: "Preview room", exact: true }).tap();
  await page.locator("#interview-answer").waitFor();
  await page.locator("#interview-answer").fill(answer);
  await page.getByRole("button", { name: "Notes", exact: true }).tap();
  await page.locator("[data-station-notes]:visible").fill("Remember my work experience example");
  await page.getByRole("button", { name: /Live transcript/ }).tap();
  assert.equal(await page.locator("#interview-answer").inputValue(), answer);
  await page.getByRole("button", { name: "Notes", exact: true }).tap();
  assert.equal(await page.locator("[data-station-notes]:visible").inputValue(), "Remember my work experience example");
  await page.getByRole("button", { name: /Live transcript/ }).tap();
  await page.getByRole("button", { name: "Done answering", exact: true }).tap();
  await page.getByRole("button", { name: "Yes, I'm done", exact: true }).tap();
  assert.equal(await page.locator("#interview-answer").inputValue(), "");

  for (const size of [{ width: 390, height: 844 }, { width: 390, height: 360 }, { width: 844, height: 390 }, { width: 320, height: 568 }]) {
    await page.setViewportSize(size);
    await layout(page);
    const finish = await page.getByRole("button", { name: "Finish station", exact: true }).boundingBox();
    assert.ok(finish.y >= 0 && finish.y + finish.height <= size.height + 1, "Interview controls stay visible in short viewports");
    const transcript = await page.getByRole("complementary", { name: "Med Interview transcript and notes" }).boundingBox();
    assert.ok(transcript.height >= 120, `A ${size.width}x${size.height} phone still has room to read and answer the question (panel: ${transcript.height}px)`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    Object.defineProperty(visualViewport, "height", { configurable: true, value: 400 });
    visualViewport.dispatchEvent(new Event("resize"));
  });
  assert.equal(await page.locator("html[data-interview-keyboard]").count(), 1);
  assert.equal(await page.locator("nav summary:visible").count(), 0);
  await page.locator("#interview-answer").fill("My second answer stays visible while typing.");
  await page.evaluate(() => { delete visualViewport.height; visualViewport.dispatchEvent(new Event("resize")); });
  assert.equal(await page.locator("html[data-interview-keyboard]").count(), 0);

  await page.getByRole("button", { name: "Enter focus view", exact: true }).tap();
  await page.getByRole("button", { name: "Exit focus view", exact: true }).tap();
  await page.getByRole("button", { name: "Finish station", exact: true }).tap();
  await page.getByRole("button", { name: "Keep practising", exact: true }).tap();
  assert.equal(await page.getByRole("dialog").count(), 0);
  await page.getByRole("button", { name: "Finish station", exact: true }).tap();
  await page.getByRole("button", { name: "Finish & review", exact: true }).tap();
  await page.locator("[data-station-review]").waitFor();
  assert.ok((await page.locator("[data-station-review]").innerText()).includes(answer));
  await layout(page);
  await page.getByRole("button", { name: "View sample AI feedback", exact: true }).first().tap();
  await page.getByText("View the marking breakdown", { exact: true }).tap();
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download transcript", exact: true }).tap();
  assert.match((await download).suggestedFilename(), /^medicforest-.*\.txt$/);
  await page.getByRole("button", { name: "Retry station", exact: true }).first().tap();
  await page.locator("#interview-answer").waitFor();
  assert.equal(await page.locator("#interview-answer").inputValue(), "");
}

for (const engine of [chromium, webkit]) {
  const browser = await engine.launch();
  try {
    for (const width of [320, 390]) {
      const context = await browser.newContext({ viewport: { width, height: 844 }, isMobile: true, hasTouch: true });
      await context.route("https://challenges.cloudflare.com/**", route => route.abort());
      const page = await context.newPage();
      page.setDefaultTimeout(15_000);
      const errors = runtimeErrors(page, engine);
      for (const path of paths) { await visit(page, path); await layout(page); }
      await publicFlows(page);
      assert.deepEqual(errors, [], "No browser runtime errors");
      console.log(`${engine.name()} ${width}px: ${paths.length} pages, navigation, search, signup prompts and forms passed`);
      await context.close();
    }
    const context = await fixtureContext(browser);
    const page = await context.newPage();
    page.setDefaultTimeout(15_000);
    const errors = runtimeErrors(page, engine);
    await authenticatedFlows(page);
    assert.deepEqual(errors, [], "No authenticated UI runtime errors");
    console.log(`${engine.name()}: question practice, account menu, interview preview, keyboard layout, review and download passed (isolated fixtures)`);
    await context.close();
  } finally { await browser.close(); }
}
