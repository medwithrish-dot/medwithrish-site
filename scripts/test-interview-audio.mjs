import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();

function loadTypeScript(filename) {
  const resolved = filename.endsWith(".ts") ? filename : `${filename}.ts`;
  if (modules.has(resolved)) return modules.get(resolved).exports;
  const output = ts.transpileModule(readFileSync(resolved, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const loaded = { exports: {} };
  modules.set(resolved, loaded);
  const localRequire = specifier => specifier.startsWith(".")
    ? loadTypeScript(resolve(dirname(resolved), specifier))
    : require(specifier);
  new Function("require", "module", "exports", output)(localRequire, loaded, loaded.exports);
  return loaded.exports;
}

const { INTERVIEW_QUESTIONS } = loadTypeScript(resolve(root, "app/medicforest/interview/_data/interviewQuestionBank.ts"));
const { getInterviewQuestionAudioSrc, INTERVIEW_AUDIO_QUESTION_COUNT } = loadTypeScript(resolve(root, "app/medicforest/interview/_lib/interview-question-audio.ts"));

function readQuestionCsv() {
  return readFileSync(resolve(root, "scripts/questions.csv"), "utf8")
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .slice(1)
    .map(line => {
      const match = line.match(/^(\d+),"(.*)"$/);
      assert.ok(match, `Invalid questions.csv row: ${line}`);
      return { id: Number(match[1]), question: match[2].replaceAll('""', '"') };
    });
}

test("questions.csv remains aligned with bank IDs and every recorded voice file", () => {
  const rows = readQuestionCsv();
  assert.equal(rows.length, 642);
  assert.equal(INTERVIEW_AUDIO_QUESTION_COUNT, rows.length);
  assert.equal(INTERVIEW_QUESTIONS.length, 561);

  for (const [index, row] of rows.entries()) {
    assert.equal(row.id, index + 1, "CSV audio IDs must remain contiguous");
    const bankQuestion = INTERVIEW_QUESTIONS[index];
    if (bankQuestion) {
      assert.equal(row.question, bankQuestion.text, `CSV row ${row.id} no longer matches ${bankQuestion.id}`);
    }
    for (const voice of ["female", "male"]) {
      const expectedSrc = `/audio/${voice}/q${String(row.id).padStart(3, "0")}.mp3`;
      assert.equal(getInterviewQuestionAudioSrc(bankQuestion?.id, row.question, voice), expectedSrc);
      const audioFile = resolve(root, `public${expectedSrc}`);
      assert.ok(existsSync(audioFile), `Missing ${expectedSrc}`);
      assert.ok(statSync(audioFile).size > 1_000, `Empty or invalid ${expectedSrc}`);
    }
  }
});

test("unknown and generated follow-up questions retain the browser-voice fallback", () => {
  assert.equal(getInterviewQuestionAudioSrc(null, "A newly generated follow-up?", "female"), undefined);
});
