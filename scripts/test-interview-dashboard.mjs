import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Exercise the production TypeScript and catalogue without Next, credentials,
// database services or provider calls. Resolve the project's TS path alias.
const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function loadTypeScript(path) {
  const filename = path.endsWith(".ts") ? path : `${path}.ts`;
  if (modules.has(filename)) return modules.get(filename).exports;
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const compiledModule = { exports: {} };
  modules.set(filename, compiledModule);
  const localRequire = (specifier) => {
    if (specifier.startsWith("@/")) return loadTypeScript(resolve(root, specifier.slice(2)));
    if (specifier.startsWith(".")) return loadTypeScript(resolve(dirname(filename), specifier));
    return require(specifier);
  };
  new Function("require", "module", "exports", output)(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const { deriveDashboard, londonDate, interviewTheme } = loadTypeScript(resolve(root, "utils/interviews/dashboard-analytics"));
const { interviewUniversities } = loadTypeScript(resolve(root, "app/phloemai/interviews/_data/universities"));
const NOW = "2026-09-06T12:00:00Z";
let sequence = 0;
function attempt(overrides = {}) {
  const score = overrides.score ?? 60;
  return {
    id: `attempt-${++sequence}`, mode: "station", universitySlug: null,
    stationSlug: "why-medicine", title: "Why medicine?", status: "completed",
    startedAt: "2026-09-05T11:50:00Z", completedAt: "2026-09-05T12:00:00Z",
    preparationSeconds: 0, stationSeconds: 480, breakSeconds: 0,
    stationIndex: 0, stationCount: 1, questions: [], answers: [], metrics: {},
    feedback: { score, summary: "Practice feedback", strengths: ["Specific examples"], improvements: ["Explain what you learnt"], rubric: [] },
    nextAvailableAt: null, circuitId: "circuit", ...overrides,
  };
}
function profile(overrides = {}) {
  return { experience: "practising", focusThemes: [], weeklyTarget: 3, targets: [], updatedAt: null, ...overrides };
}
function completedOn(date, overrides = {}) {
  return attempt({ startedAt: `${date}T09:00:00Z`, completedAt: `${date}T09:08:00Z`, ...overrides });
}

test("no history produces honest empty evidence and a usable free plan", () => {
  const data = deriveDashboard([], null, NOW, false);
  assert.equal(data.stats.completedCount, 0);
  assert.equal(data.stats.averageScore, null);
  assert.equal(data.stats.recentAverage, null);
  assert.equal(data.stats.recentSampleSize, 0);
  assert.equal(data.stats.practiceSeconds, 0);
  assert.equal(data.stats.practiceTimeEstimated, false);
  assert.equal(data.stats.bestFreeScore, null);
  assert.equal(data.weeklyInsight.changePoints, null);
  assert.deepEqual(data.strengths, []);
  assert.deepEqual(data.weaknesses, []);
  assert.equal(data.nextAction.reason, "first-station");
  assert.deepEqual(data.todayPlan.map((task) => task.kind), ["station", "guide", "review"]);
  assert.ok(data.todayPlan.every((task) => !task.completed));
});

test("London calendar dates handle BST midnight and both DST transitions", () => {
  assert.equal(londonDate("2026-06-01T23:30:00Z"), "2026-06-02");
  assert.equal(londonDate("2026-03-29T00:30:00Z"), "2026-03-29");
  assert.equal(londonDate("2026-03-29T01:30:00Z"), "2026-03-29");
  assert.equal(londonDate("2026-10-25T00:30:00Z"), "2026-10-25");
  assert.equal(londonDate("2026-10-25T01:30:00Z"), "2026-10-25");
  assert.throws(() => londonDate("invalid"), RangeError);
  assert.throws(() => deriveDashboard([], null, "invalid", false), RangeError);
});

test("target countdowns use calendar days, preserve past dates and reject impossible dates", () => {
  const p = profile({ targets: [
    { universitySlug: "manchester", interviewDate: "2026-03-30" },
    { universitySlug: "oxford", interviewDate: "2026-03-29" },
    { universitySlug: "bristol", interviewDate: "2026-03-28" },
    { universitySlug: "cardiff", interviewDate: "2026-02-30" },
    { universitySlug: "not-a-school", interviewDate: "2026-03-30" },
  ] });
  const data = deriveDashboard([], p, "2026-03-29T22:30:00Z", true);
  assert.equal(data.targets.length, 4);
  const targets = Object.fromEntries(data.targets.map((target) => [target.universitySlug, target]));
  assert.equal(targets.manchester.daysUntil, 1);
  assert.equal(targets.oxford.dateStatus, "today");
  assert.equal(targets.bristol.daysUntil, -1);
  assert.equal(targets.bristol.dateStatus, "past");
  assert.equal(targets.cardiff.daysUntil, null);
  assert.equal(targets.cardiff.interviewDate, null);
  assert.equal(targets.cardiff.dateStatus, "unset");
  assert.equal(targets.manchester.averageScore, null);
  const summerMidnight = deriveDashboard([], profile({ targets: [{ universitySlug: "manchester", interviewDate: "2026-06-02" }] }), "2026-06-01T23:30:00Z", true);
  assert.equal(summerMidnight.targets[0].daysUntil, 0);
});

test("recent score is the latest five valid completed scores regardless of input order", () => {
  const history = [10, 20, 30, 40, 50, 60].map((score, i) => completedOn(`2026-09-0${i + 1}`, { score }));
  history.push(attempt({ status: "grading", score: 99 }), attempt({ status: "failed", score: 99 }));
  history.push(attempt({ score: 100 }), attempt({ score: NaN }), attempt({ feedback: null }));
  history.push(completedOn("2026-09-07", { score: 99 }), attempt({ completedAt: "invalid" }));
  const data = deriveDashboard(history.reverse(), null, NOW, true);
  assert.equal(data.stats.scoredCount, 6);
  assert.equal(data.stats.recentAverage, 40);
  assert.equal(data.stats.recentSampleSize, 5);
  assert.equal(data.stats.averageScore, 35);
  assert.equal(data.recentPerformance.length, 5);
  assert.deepEqual(data.recentPerformance.map((item) => item.score), [60, 50, 40, 30, 20]);
});

test("theme and university averages each use their own latest five scored attempts", () => {
  const history = [10, 20, 30, 40, 50, 60].map((score, i) => completedOn(`2026-09-0${i + 1}`, { score, universitySlug: "manchester", stationSlug: "ethics-ai-station" }));
  history.push(completedOn("2026-09-06", { score: 99, stationSlug: "work-experience", universitySlug: "oxford" }));
  const data = deriveDashboard(history, profile({ targets: [{ universitySlug: "manchester", interviewDate: null }, { universitySlug: "bristol", interviewDate: null }] }), NOW, true);
  const ethics = data.themes.find((theme) => theme.theme === "ethics");
  assert.equal(ethics.averageScore, 40);
  assert.equal(ethics.sampleSize, 5);
  assert.equal(ethics.attemptCount, 6);
  const manchester = data.targets.find((target) => target.universitySlug === "manchester");
  assert.equal(manchester.averageScore, 40);
  assert.equal(manchester.sampleSize, 5);
  assert.equal(manchester.completedCount, 6);
  assert.equal(data.targets.find((target) => target.universitySlug === "bristol").averageScore, null);
  assert.equal(interviewTheme({ stationSlug: "motivation-question", mode: "station" }), "motivation");
  assert.equal(interviewTheme({ stationSlug: "unknown", mode: "station" }), null);
});

test("strength and weakness need at least two scores in two comparable themes", () => {
  const history = [attempt({ score: 90 }), attempt({ score: 80 }), attempt({ stationSlug: "work-experience", score: 40 })];
  assert.deepEqual(deriveDashboard(history, null, NOW, true).weaknesses, []);
  history.push(attempt({ stationSlug: "work-experience", score: 50 }));
  const data = deriveDashboard(history, null, NOW, true);
  assert.equal(data.strengths[0].theme, "motivation");
  assert.equal(data.weaknesses[0].theme, "reflection");
  assert.equal(data.nextAction.reason, "weakness");
  assert.ok(data.nextAction.href.endsWith("station=work-experience"));
  assert.deepEqual(deriveDashboard(history.map((item) => ({ ...item, feedback: { ...item.feedback, score: 60 } })), null, NOW, true).strengths, []);
});

test("weekly comparison needs two scores in each adjacent London seven-day period", () => {
  const history = [completedOn("2026-09-06", { score: 80 }), completedOn("2026-08-31", { score: 70 }), completedOn("2026-08-30", { score: 50 }), completedOn("2026-08-24", { score: 40 }), completedOn("2026-08-23", { score: 99 })];
  const data = deriveDashboard(history, null, NOW, true);
  assert.equal(data.weeklyInsight.currentCount, 2);
  assert.equal(data.weeklyInsight.previousCount, 2);
  assert.equal(data.weeklyInsight.currentAverage, 75);
  assert.equal(data.weeklyInsight.previousAverage, 45);
  assert.equal(data.weeklyInsight.changePoints, 30);
  assert.match(data.weeklyInsight.message, /30 percentage points higher/);
  assert.equal(data.stats.weekCompleted, 2);
  assert.equal(deriveDashboard(history.slice(0, 3), null, NOW, true).weeklyInsight.changePoints, null);
});

test("weekly period boundary is London midnight through the DST switch", () => {
  const history = [
    attempt({ completedAt: "2026-03-28T23:59:59Z", score: 20 }),
    attempt({ completedAt: "2026-03-29T00:00:00Z", score: 80 }),
    attempt({ completedAt: "2026-04-04T22:00:00Z", score: 70 }),
    attempt({ completedAt: "2026-03-28T15:00:00Z", score: 40 }),
  ];
  const data = deriveDashboard(history, null, "2026-04-04T22:30:00Z", true);
  assert.equal(data.weeklyInsight.currentAverage, 75);
  assert.equal(data.weeklyInsight.previousAverage, 30);
  assert.equal(data.weeklyInsight.changePoints, 45);
});

test("premium daily plan stays stable when today's scores change the weakest theme", () => {
  const p = profile({ focusThemes: ["ethics", "teamwork"], weeklyTarget: 10 });
  const before = [attempt({ score: 90 }), attempt({ score: 80 }), attempt({ stationSlug: "work-experience", score: 30 }), attempt({ stationSlug: "work-experience", score: 40 })];
  const first = deriveDashboard(before, p, NOW, true);
  const station = first.todayPlan[0].stationSlug;
  const after = [...before, ...[97, 98, 99].map((score) => completedOn("2026-09-06", { score, stationSlug: station }))];
  const second = deriveDashboard(after, p, NOW, true);
  assert.deepEqual(second.todayPlan.map((task) => task.id), first.todayPlan.map((task) => task.id));
  assert.equal(first.todayPlan[0].completed, false);
  assert.equal(second.todayPlan[0].completed, true);
  assert.equal(second.todayPlan.filter((task) => task.completed).length, 1);
  assert.equal(second.todayPlan.filter((task) => task.kind === "station").length, 2);
  assert.equal(second.todayPlan[2].kind, "review");
});

test("daily station workload follows the weekly goal and keeps free plans accessible", () => {
  for (const weeklyTarget of [1, 3, 7, 8, 10, 14]) {
    const p = profile({ weeklyTarget });
    const premium = deriveDashboard([], p, NOW, true);
    const free = deriveDashboard([], p, NOW, false);
    assert.equal(premium.todayPlan.length, 3);
    assert.equal(premium.todayPlan.filter((task) => task.kind === "station").length, weeklyTarget >= 8 ? 2 : 1);
    assert.equal(free.todayPlan.length, 3);
    assert.equal(free.todayPlan.filter((task) => task.kind === "station").length, 1);
    assert.ok(free.todayPlan[0].href.endsWith("station=why-medicine"));
  }
});

test("manual task completion applies only to today's guide/review IDs, never stations", () => {
  const data = deriveDashboard([], null, NOW, false);
  const [station, guide, review] = data.todayPlan;
  const marked = deriveDashboard([], null, NOW, false, [station.id, guide.id, review.id.replace("2026-09-06", "2026-09-05")]);
  assert.equal(marked.todayPlan[0].completed, false);
  assert.equal(marked.todayPlan[1].completed, true);
  assert.equal(marked.todayPlan[2].completed, false);
  const yesterday = attempt({ mode: "free" });
  assert.equal(deriveDashboard([yesterday], null, NOW, false).todayPlan[0].completed, false);
  const today = completedOn("2026-09-06", { mode: "free", stationSlug: "why-medicine" });
  assert.equal(deriveDashboard([yesterday, today], null, NOW, false).todayPlan[0].completed, true);
  assert.deepEqual(deriveDashboard([yesterday], null, NOW, false).todayPlan.map((task) => task.id), deriveDashboard([yesterday, today], null, NOW, false).todayPlan.map((task) => task.id));
});

test("daily station completion respects London's date rather than UTC", () => {
  const late = attempt({ mode: "free", startedAt: "2026-06-01T23:05:00Z", completedAt: "2026-06-01T23:15:00Z" });
  const data = deriveDashboard([late], null, "2026-06-01T23:30:00Z", false);
  assert.equal(data.today, "2026-06-02");
  assert.equal(data.todayPlan[0].completed, true);
  assert.equal(deriveDashboard([late], null, "2026-06-02T23:30:00Z", false).todayPlan[0].completed, false);
});

test("practice duration excludes preparation/grading where submission is captured and caps legacy estimates", () => {
  const actual = attempt({ startedAt: "2026-09-05T10:00:00Z", answerSubmittedAt: "2026-09-05T10:07:00Z", completedAt: "2026-09-05T10:09:00Z", preparationSeconds: 120, stationSeconds: 480 });
  const data = deriveDashboard([actual], null, NOW, true);
  assert.equal(data.stats.practiceSeconds, 300);
  assert.equal(data.stats.practiceMinutes, 5);
  assert.equal(data.stats.practiceTimeEstimated, false);
  const legacy = attempt({ startedAt: "2026-09-04T10:00:00Z", completedAt: "2026-09-04T11:00:00Z", stationSeconds: 480, preparationSeconds: 60 });
  const mixed = deriveDashboard([actual, legacy], null, NOW, true);
  assert.equal(mixed.stats.practiceSeconds, 780);
  assert.equal(mixed.stats.practiceTimeEstimated, true);
  assert.equal(deriveDashboard([attempt({ startedAt: "invalid" })], null, NOW, true).stats.practiceSeconds, 0);
});

test("free recommendations never launch premium stations or university circuits", () => {
  const p = profile({ focusThemes: ["ethics"], targets: [{ universitySlug: "manchester", interviewDate: "2026-09-10" }] });
  const history = [attempt({ mode: "free" }), attempt({ status: "in_progress", mode: "university", startedAt: "2026-09-06T11:59:00Z" })];
  const free = deriveDashboard(history, p, NOW, false);
  assert.ok(free.nextAction.href.endsWith("station=why-medicine"));
  assert.equal(free.todayPlan.filter((task) => task.kind === "station").length, 1);
  const premium = deriveDashboard(history.slice(0, 1), p, NOW, true);
  assert.equal(premium.nextAction.reason, "interview-soon");
  assert.ok(premium.nextAction.href.endsWith("university=manchester"));
  const active = deriveDashboard(history, p, NOW, true);
  assert.equal(active.nextAction.reason, "resume");
});

test("resume suggestions respect the deadline, while grading offers a feedback check", () => {
  const history = [attempt({ mode: "free" })];
  const pending = attempt({ status: "in_progress", startedAt: "2026-09-06T11:50:00Z", preparationSeconds: 120, stationSeconds: 480 });
  assert.notEqual(deriveDashboard([...history, pending], null, NOW, true).nextAction.reason, "resume");
  assert.equal(deriveDashboard([...history, pending], null, "2026-09-06T11:59:59Z", true).nextAction.reason, "resume");
  const grading = { ...pending, status: "grading" };
  assert.match(deriveDashboard([...history, grading], null, NOW, true).nextAction.title, /feedback/);
  const future = { ...pending, startedAt: "2026-09-06T13:00:00Z" };
  assert.notEqual(deriveDashboard([...history, future], null, NOW, true).nextAction.reason, "resume");
});

test("target/focus/weekly limits and aliases are handled without duplicate tasks", () => {
  const p = profile({ weeklyTarget: 100, focusThemes: ["ethics", "ethics", "unknown", "analysis", "teamwork", "nhs"], targets: [...interviewUniversities.slice(0, 12).map((university) => ({ universitySlug: university.slug, interviewDate: null })), { universitySlug: "uea", interviewDate: null }] });
  const data = deriveDashboard([], p, NOW, true);
  assert.equal(data.targets.length, 10);
  assert.equal(data.stats.weeklyTarget, 14);
  assert.equal(new Set(data.todayPlan.map((task) => task.id)).size, 3);
  assert.equal(deriveDashboard([], profile({ weeklyTarget: -8 }), NOW, true).stats.weeklyTarget, 1);
  assert.equal(deriveDashboard([], profile({ weeklyTarget: NaN }), NOW, true).stats.weeklyTarget, 3);
  const aliases = deriveDashboard([], profile({ targets: [{ universitySlug: "uea", interviewDate: null }, { universitySlug: "east-anglia", interviewDate: null }] }), NOW, true);
  assert.equal(aliases.targets.length, 1);
  assert.equal(aliases.targets[0].universitySlug, "east-anglia");
});

test("duplicate records do not double count and deriving never mutates inputs", () => {
  const value = attempt({ mode: "free", score: 99 });
  const history = [value, value];
  const p = profile({ focusThemes: ["ethics", "motivation"], targets: [{ universitySlug: "oxford", interviewDate: null }, { universitySlug: "manchester", interviewDate: "2026-09-07" }] });
  const snapshot = JSON.stringify({ history, p });
  const data = deriveDashboard(history, p, NOW, true);
  assert.equal(data.stats.completedCount, 1);
  assert.equal(data.stats.bestFreeScore, 99);
  assert.equal(JSON.stringify({ history, p }), snapshot);
});
