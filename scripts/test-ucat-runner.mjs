import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

const require = createRequire(import.meta.url);
const ts = require("typescript");

function read(relativePath) {
  return readFileSync(new URL(relativePath, import.meta.url), "utf8");
}

function loadPureModule(relativePath) {
  const compiled = ts.transpileModule(read(relativePath), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const loaded = { exports: {} };
  new Function("module", "exports", compiled)(loaded, loaded.exports);
  return loaded.exports;
}

const { getRestoredSessionTime } = loadPureModule("../app/medicforest/ucat/_lib/ucatSessionTime.ts");
const { countAnswerSwitches } = loadPureModule("../app/medicforest/ucat/_lib/ucatAnswerTracking.ts");

test("resuming a timed set preserves zero remaining seconds", () => {
  assert.deepEqual(getRestoredSessionTime(0, 600, 300), {
    durationSeconds: 600,
    remainingSeconds: 0,
  });
  assert.deepEqual(getRestoredSessionTime(120, 600, 300), {
    durationSeconds: 600,
    remainingSeconds: 120,
  });
  assert.deepEqual(getRestoredSessionTime(9999, 600, 300), {
    durationSeconds: 600,
    remainingSeconds: 600,
  });
  assert.deepEqual(getRestoredSessionTime("bad", 0, 300), {
    durationSeconds: 300,
    remainingSeconds: 300,
  });
});

test("answer changes count per statement or slot, not across different parts", () => {
  const events = [
    { payload: { statementId: "first", answer: "Yes" } },
    { payload: { statementId: "second", answer: "No" } },
    { payload: { statementId: "first", answer: "No" } },
  ];
  assert.equal(countAnswerSwitches({ questionType: "yes-no" }, events), 1);
  assert.equal(countAnswerSwitches({ questionType: "drag-category" }, [
    { payload: { itemId: "one", answer: "red" } },
    { payload: { itemId: "two", answer: "blue" } },
    { payload: { itemId: "one", answer: "blue" } },
  ]), 1);
  assert.equal(countAnswerSwitches({ questionType: "most-least" }, [
    { payload: { slot: "most", answer: "a" } },
    { payload: { slot: "least", answer: "b" } },
    { payload: { slot: "most", answer: "c" } },
  ]), 1);
  assert.equal(countAnswerSwitches({ questionType: "single" }, [
    { payload: { answer: "A" } },
    { payload: { answer: "B" } },
    { payload: { answer: "B" } },
  ]), 1);
});

test("exam keyboard and timeout listeners use one current handler", () => {
  const runner = read("../app/medicforest/ucat/_components/UCATQuestionBankClient.tsx");
  assert.equal(runner.includes("onKeyDown={handlePracticeKeyDown}"), false);
  assert.equal((runner.match(/addEventListener\("keydown", handleWindowKeyDown\)/g) ?? []).length, 1);
  assert.ok(runner.includes("practiceKeyDownRef.current(event)"));
  assert.ok(runner.includes("markPracticeRef.current()"));
  assert.ok(runner.includes("if (completionStartedRef.current) return;"));
});
