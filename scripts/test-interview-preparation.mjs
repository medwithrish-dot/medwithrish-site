import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function loadModule(file) {
  const path = existsSync(file) ? file : `${file}.ts`;
  if (modules.has(path)) return modules.get(path).exports;
  const compiledModule = { exports: {} };
  modules.set(path, compiledModule);
  const javascript = ts.transpileModule(readFileSync(path, "utf8"), { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } }).outputText;
  const localRequire = (name) => name.startsWith(".") ? loadModule(resolve(dirname(path), name)) : createRequire(path)(name);
  new Function("require", "module", "exports", javascript)(localRequire, compiledModule, compiledModule.exports);
  return compiledModule.exports;
}
const { validatePreparation } = loadModule(resolve(root, "utils/interviews/preparation-validation.ts"));
const valid = () => ({ experience: "starting", focusThemes: ["ethics"], weeklyTarget: 3, targets: [{ universitySlug: "manchester", interviewDate: null }] });

test("unknown dates, date clearing and an empty shortlist are supported", () => {
  assert.equal(validatePreparation(valid()).targets[0].interviewDate, null);
  assert.deepEqual(validatePreparation({ ...valid(), targets: [], focusThemes: [] }).targets, []);
  const dated = { ...valid(), targets: [{ universitySlug: "manchester", interviewDate: "2028-02-29" }] };
  assert.equal(validatePreparation(dated).targets[0].interviewDate, "2028-02-29");
  assert.equal(validatePreparation({ ...dated, targets: valid().targets }).targets[0].interviewDate, null);
});

test("invalid dates, unknown universities and duplicate choices are rejected", () => {
  for (const interviewDate of ["2027-02-29", "2026-04-31", "2026-13-01", "01/12/2026", "", "2100-01-01", 20260101, undefined]) {
    assert.throws(() => validatePreparation({ ...valid(), targets: [{ universitySlug: "manchester", interviewDate }] }));
  }
  assert.throws(() => validatePreparation({ ...valid(), targets: [{ universitySlug: "unknown", interviewDate: null }] }));
  assert.throws(() => validatePreparation({ ...valid(), targets: [...valid().targets, ...valid().targets] }));
});

test("goals and focus selections have enforced bounds", () => {
  for (const weeklyTarget of [0, 15, 1.5, "3", null, NaN]) assert.throws(() => validatePreparation({ ...valid(), weeklyTarget }));
  for (const focusThemes of [["invented"], ["ethics", "ethics"], ["ethics", "motivation", "reflection", "nhs"], null]) assert.throws(() => validatePreparation({ ...valid(), focusThemes }));
  assert.throws(() => validatePreparation({ ...valid(), experience: "administrator" }));
  assert.throws(() => validatePreparation({ ...valid(), targets: Array.from({ length: 11 }, () => valid().targets[0]) }));
});

test("caller-supplied identity and score fields cannot enter the saved profile", () => {
  const result = validatePreparation({ ...valid(), userId: "another-account", score: 99, current_plan: "premium", updatedAt: "2000-01-01" });
  assert.deepEqual(Object.keys(result).sort(), ["experience", "focusThemes", "targets", "weeklyTarget"]);
});
