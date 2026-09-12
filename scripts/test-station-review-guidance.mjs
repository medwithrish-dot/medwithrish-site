import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function load(file) {
  const filename = file.endsWith(".ts") ? file : `${file}.ts`;
  if (modules.has(filename)) return modules.get(filename).exports;
  const compiled = { exports: {} };
  modules.set(filename, compiled);
  const output = ts.transpileModule(readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  new Function("require", "module", "exports", output)(
    name => load(resolve(dirname(filename), name)), compiled, compiled.exports,
  );
  return compiled.exports;
}

const { interviewStations } = load(resolve(root, "app/phloemai/interviews/_data/interview-stations.ts"));
const { getStationReviewGuidance } = load(resolve(root, "app/phloemai/interviews/_lib/station-review.ts"));
const { categoryRubric, getQuestionMarkScheme } = load(resolve(root, "app/phloemai/interviews/_lib/question-review.ts"));

test("every station has a specific framework and the shared question-bank rubric", () => {
  assert.equal(interviewStations.length, 9);
  const frameworks = new Set();
  for (const station of interviewStations) {
    const guidance = getStationReviewGuidance(station.slug);
    assert.ok(guidance, station.slug);
    assert.ok(guidance.framework.length >= 3, station.slug);
    for (const stage of guidance.framework) {
      assert.ok(stage.title.trim(), station.slug);
      assert.ok(stage.items.length > 0 && stage.items.every(item => item.trim()), station.slug);
    }
    assert.deepEqual(guidance.rubric.map(group => group.title), ["General", "Start", "Middle", "End"]);
    assert.equal(guidance.rubric, categoryRubric[guidance.category], "Reviews and question practice must share one rubric source");
    assert.match(guidance.sourceLabel, /PhloemAI practice/);
    frameworks.add(JSON.stringify(guidance.framework));
  }
  assert.equal(frameworks.size, 9, "Stations should not fall back to one generic model framework");
});

test("saved attempts with legacy station names resolve while unknown stations stay unavailable", () => {
  assert.deepEqual(getStationReviewGuidance("motivation-question"), getStationReviewGuidance("why-medicine"));
  assert.deepEqual(getStationReviewGuidance("ethics-ai-station"), getStationReviewGuidance("disability-in-medicine"));
  for (const slug of ["", "unrecognised", "constructor", "toString", "__proto__"]) {
    assert.equal(getStationReviewGuidance(slug), null);
  }
});

test("question-specific marking preserves the existing rubric and isolates its extra General points", () => {
  const before = structuredClone(getStationReviewGuidance("why-medicine").rubric);
  const groups = getQuestionMarkScheme({
    category: "Personal & Motivation", subcategory: "Motivation for Medicine", difficulty: "core",
  });
  assert.deepEqual(groups.slice(1), before.slice(1));
  assert.deepEqual(groups[0].items.slice(0, before[0].items.length), before[0].items);
  assert.ok(groups[0].items.includes("Addresses the motivation for medicine focus directly"));
  assert.ok(groups[0].items.includes("Keeps the depth appropriate for a core question"));
  groups[0].items.push("Question-only note");
  assert.deepEqual(getStationReviewGuidance("why-medicine").rubric, before);
  assert.ok(before[0].items.includes("Uses specific experiences and explains what they taught you"));
});
