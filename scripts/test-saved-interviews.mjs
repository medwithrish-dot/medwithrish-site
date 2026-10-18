import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const source = readFileSync(new URL("../app/medicforest/interview/_lib/saved-interviews.ts", import.meta.url), "utf8");
const compiledModule = { exports: {} };
new Function("module", "exports", ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
}).outputText)(compiledModule, compiledModule.exports);
const { filterSavedInterviews, filterSavedInterviewSource, groupSavedInterviews, canResumeSavedInterview, savedInterviewHref, savedInterviewStatus } = compiledModule.exports;

function attempt(overrides = {}) {
  return {
    id: "saved-1", title: "Why medicine?", stationSlug: "why-medicine", universitySlug: "bristol",
    universityName: "University of Bristol", status: "submitted", feedbackScore: null, canResume: false,
    startedAtLabel: "12 Sept 2026, 10:30", ...overrides,
  };
}

test("complete interviews group stations in order and keep retries separate", () => {
  const rows = [attempt({ id: "retry", circuitId: "retry", stationCount: 1 }), attempt({ id: "second", circuitId: "circuit", stationIndex: 1, stationCount: 2, title: "Ethics" }), attempt({ id: "first", circuitId: "circuit", stationIndex: 0, stationCount: 2 })];
  const grouped = groupSavedInterviews(rows);
  assert.equal(grouped.length, 2);
  assert.equal(grouped[1].id, "first");
  assert.deepEqual(grouped[1].stationTitles, ["Why medicine?", "Ethics"]);
  assert.equal(filterSavedInterviews(grouped, "ethics", "all", "all")[0].id, "first");
  const active = groupSavedInterviews([{ ...rows[1], canResume: true }, rows[2]])[0];
  assert.equal(active.id, "second");
  assert.equal(active.canResume, true);
});

test("university, word search and feedback filters combine without losing older retries", () => {
  const newest = attempt({ id: "newest" });
  const older = attempt({ id: "older", status: "completed", feedbackScore: 72 });
  const unrelated = attempt({ id: "different-school", universitySlug: "oxford", universityName: "University of Oxford" });
  const rows = [newest, unrelated, older];
  assert.deepEqual(filterSavedInterviews(rows, "  MEDICINE bristol ", "bristol", "all"), [newest, older]);
  assert.deepEqual(filterSavedInterviews(rows, "medicine", "bristol", "feedback"), [older]);
  assert.deepEqual(filterSavedInterviews(rows, "", "bristol", "saved"), [newest]);
  assert.deepEqual(filterSavedInterviews(rows, "ethics", "bristol", "all"), []);
  assert.deepEqual(rows, [newest, unrelated, older]);
});

test("general practice and zero scores remain searchable and correctly categorised", () => {
  const general = attempt({ id: "general", universitySlug: null, universityName: "General practice", status: "completed", feedbackScore: 0 });
  const active = attempt({ id: "active", status: "in_progress", canResume: true });
  const expired = attempt({ id: "expired", status: "in_progress" });
  assert.deepEqual(filterSavedInterviews([general, active, expired], "", "general", "feedback"), [general]);
  assert.deepEqual(filterSavedInterviews([general, active, expired], "", "all", "in_progress"), [active]);
  assert.deepEqual(filterSavedInterviews([general, active, expired], "", "all", "saved"), [expired]);
  assert.equal(savedInterviewStatus(general), "Feedback ready");
  assert.equal(savedInterviewStatus(expired), "Transcript saved · Ready to review");
});

test("only an unexpired active attempt opens the Med interview room", () => {
  const active = { status: "in_progress", startedAt: "2026-09-12T10:00:00Z", preparationSeconds: 60, stationSeconds: 480 };
  const deadline = Date.parse("2026-09-12T10:09:00Z");
  assert.equal(canResumeSavedInterview(active, deadline - 1), true);
  assert.equal(canResumeSavedInterview(active, deadline), false);
  assert.equal(canResumeSavedInterview(active, deadline + 1), false);
  assert.equal(savedInterviewHref(attempt({ id: "active", canResume: true })), "/medicforest/interview/ai-interviews?attempt=active");
  for (const status of ["submitted", "grading", "completed", "failed"]) {
    assert.equal(canResumeSavedInterview({ ...active, status }, deadline - 1), false);
    assert.equal(savedInterviewHref(attempt({ id: status, status })), `/medicforest/interview/reports/${status}`);
  }
  assert.equal(savedInterviewHref(attempt({ id: "expired", status: "in_progress" })), "/medicforest/interview/reports/expired");
});

test("partly marked circuits remain discoverable under needs feedback and show their actual coverage", () => {
  const rows = [
    attempt({ id: "second", circuitId: "partial", stationIndex: 1, stationCount: 3, title: "Ethics", startedAtLabel: "14 Oct 2026, 11:30" }),
    attempt({ id: "first", circuitId: "partial", stationIndex: 0, stationCount: 3, feedbackScore: 72, startedAtLabel: "14 Oct 2026, 10:30" }),
  ];
  const grouped = groupSavedInterviews(rows);
  assert.equal(grouped[0].feedbackScore, 72);
  assert.equal(grouped[0].startedAtLabel, rows[0].startedAtLabel);
  assert.equal(savedInterviewStatus(grouped[0]), "Feedback ready for 1 of 2 saved stations");
  assert.equal(filterSavedInterviews(grouped, "", "all", "saved").length, 1);
  assert.equal(filterSavedInterviews(grouped, "", "all", "feedback").length, 1);
  const ready = groupSavedInterviews(rows.map(row => ({ ...row, feedbackScore: 72 })));
  assert.equal(filterSavedInterviews(ready, "", "all", "saved").length, 0);
  assert.equal(savedInterviewStatus(ready[0]), "Feedback ready");
  assert.equal(savedInterviewStatus(attempt({ status: "grading" })), "Feedback is being prepared");
});


test("paused interviews remain resumable after days and reports separate AI from question bank", () => {
  const paused = { status: "in_progress", startedAt: "2026-09-12T10:00:00Z", preparationSeconds: 0, stationSeconds: 480, metrics: { pausedAt: Date.parse("2026-09-12T10:01:00Z") } };
  assert.equal(canResumeSavedInterview(paused, Date.parse("2026-10-18T10:00:00Z")), true);
  assert.equal(canResumeSavedInterview({ ...paused, status: "completed" }, Date.now()), false);
  assert.equal(savedInterviewStatus(attempt({ canResume: true, paused: true })), "Paused \u00b7 Ready to resume");
  const ai = attempt({ id: "ai", stationSlug: "why-medicine" });
  const bank = attempt({ id: "bank", stationSlug: "question-bank-feedback" });
  assert.deepEqual(filterSavedInterviewSource([ai, bank], "ai"), [ai]);
  assert.deepEqual(filterSavedInterviewSource([ai, bank], "question-bank"), [bank]);
});

test("the Reports switch shows AI interviews and question bank feedback separately", () => {
  const cells = [];
  let cursor = 0;
  const jsx = (type, props) => ({ type, props });
  const loaded = { exports: {} };
  const output = ts.transpileModule(readFileSync(new URL("../app/medicforest/interview/_components/SavedInterviewList.tsx", import.meta.url), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  new Function("require", "module", "exports", output)(name => {
    if (name === "react/jsx-runtime") return { jsx, jsxs: jsx };
    if (name === "react") return {
      useEffect() {}, useRef: () => ({ current: null }),
      useState(initial) { const index = cursor++; if (!(index in cells)) cells[index] = initial; return [cells[index], value => { cells[index] = typeof value === "function" ? value(cells[index]) : value; }]; },
    };
    if (name.endsWith("saved-interviews")) return compiledModule.exports;
    if (name.includes("MedicForestLink")) return { default: "link" };
    return {};
  }, loaded, loaded.exports);
  const attempts = [attempt({ id: "ai", title: "Saved AI interview" }), attempt({ id: "bank", title: "Saved question feedback", stationSlug: "question-bank-feedback" })];
  const nodes = node => Array.isArray(node) ? node.flatMap(nodes) : node && typeof node === "object" ? [node, ...nodes(node.props?.children)] : [];
  const render = () => { cursor = 0; return nodes(loaded.exports.SavedInterviewList({ attempts })); };
  const hrefs = tree => tree.filter(node => node.props?.href).map(node => node.props.href);
  let tree = render();
  assert.deepEqual(hrefs(tree), ["/medicforest/interview/reports/ai"]);
  tree.find(node => node.type === "button" && node.props.children === "Question bank").props.onClick();
  tree = render();
  assert.deepEqual(hrefs(tree), ["/medicforest/interview/reports/bank"]);
  tree.find(node => node.type === "button" && node.props.children === "AI interviews").props.onClick();
  assert.deepEqual(hrefs(render()), ["/medicforest/interview/reports/ai"]);
});
