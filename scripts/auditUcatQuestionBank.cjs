/* eslint-disable @typescript-eslint/no-require-imports */

const path = require("path");
const ts = require("typescript");

require.extensions[".ts"] = function loadTypeScript(module, filename) {
  const source = require("fs").readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  }).outputText;

  module._compile(output, filename);
};

const projectRoot = path.resolve(__dirname, "..");
const {
  UCAT_QUESTION_BANK,
  UCAT_QUESTION_QUALITY_REVIEW,
} = require(path.join(projectRoot, "app/phloemai/_lib/ucatQuestionBank.ts"));

const sections = ["vr", "dm", "qr", "sjt"];
const allQuestions = sections.flatMap((section) => UCAT_QUESTION_BANK[section]);
const ids = new Set(allQuestions.map((question) => question.id));

if (ids.size !== allQuestions.length) {
  throw new Error("Accepted UCAT bank contains duplicate question IDs.");
}

for (const section of sections) {
  if (UCAT_QUESTION_BANK[section].length === 0) {
    throw new Error(`Accepted UCAT ${section.toUpperCase()} bank is empty.`);
  }
}

const dmSubtypes = UCAT_QUESTION_QUALITY_REVIEW.summary.dm.subtypeCounts;
if ((dmSubtypes["dm-venn-sets"] ?? 0) < (dmSubtypes["dm-logic"] ?? 0)) {
  throw new Error("DM audit failed: Venn/set questions must outnumber logical puzzles.");
}

for (const section of sections) {
  const summary = UCAT_QUESTION_QUALITY_REVIEW.summary[section];

  if (summary.acceptedDrafts > summary.acceptedAudited) {
    throw new Error(
      `${section.toUpperCase()} audit failed: draft questions exceed audited questions.`
    );
  }

  console.log(`\n${section.toUpperCase()}`);
  console.log(`  accepted: ${summary.accepted}`);
  console.log(`  audited source: ${summary.acceptedAudited}`);
  console.log(`  generated draft source: ${summary.acceptedDrafts}`);
  console.log("  subtypes:");

  Object.entries(summary.subtypeCounts)
    .sort(([first], [second]) => first.localeCompare(second))
    .forEach(([subtype, count]) => {
      console.log(`    ${subtype}: ${count}`);
    });

  console.log("  rejected drafts/checks:");
  Object.entries(summary.rejectedByReason)
    .sort(([first], [second]) => first.localeCompare(second))
    .forEach(([reason, count]) => {
      console.log(`    ${reason}: ${count}`);
    });
}

console.log(`\nTotal accepted UCAT questions: ${allQuestions.length}`);
