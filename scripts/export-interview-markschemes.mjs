// node scripts/export-interview-markschemes.mjs [--pdf]
// PDF export needs Playwright + Chromium available locally. PLAYWRIGHT_MODULE can
// point to an external installation, so this does not add a runtime dependency.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const modules = new Map();
function load(file) {
  const filename = file.endsWith(".ts") ? file : `${file}.ts`;
  if (modules.has(filename)) return modules.get(filename).exports;
  const loadedModule = { exports: {} };
  modules.set(filename, loadedModule);
  const code = ts.transpileModule(readFileSync(filename, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  new Function("require", "module", "exports", code)(name => load(resolve(dirname(filename), name)), loadedModule, loadedModule.exports);
  return loadedModule.exports;
}
const { INTERVIEW_QUESTIONS } = load(resolve(root, "app/medicforest/interview/_data/interviewQuestionBank"));
const { getQuestionMarkScheme } = load(resolve(root, "app/medicforest/interview/_lib/question-review"));
const { getQuestionStimulus } = load(resolve(root, "app/medicforest/interview/_data/interview-stimuli"));
const escape = value => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const note = "Practice guidance, not official admissions criteria. Credit equivalent valid reasoning. Start, Middle and End are suggested structures, not a required script. Mistakes are pitfalls, not positive checklist points. Visual datasets are fictional. Current legal, policy and clinical details should be checked against relevant official guidance.";
const sections = INTERVIEW_QUESTIONS.map(question => {
  const groups = getQuestionMarkScheme(question);
  const stimulus = getQuestionStimulus(question.id);
  return {
    text: `${question.id}\n${question.category} / ${question.subcategory}\nQuestion: ${question.text}\n${stimulus ? `Image: ${stimulus.src}\nSource facts: ${stimulus.description}\n` : ""}${groups.map(group => `${group.title.toUpperCase()}\n${group.items.map(item => `- ${item}`).join("\n")}`).join("\n\n")}`,
    html: `<article><p class="id">${escape(question.id)} · ${escape(question.category)}</p><h2>${escape(question.text)}</h2>${stimulus ? `<p class="source"><b>Image:</b> ${escape(stimulus.title)}<br><b>Source facts:</b> ${escape(stimulus.description)}</p>` : ""}${groups.map(group => `<section><h3>${group.title === "Mistakes" ? "Mistakes to avoid" : group.title}</h3><ul>${group.items.map(item => `<li>${escape(item)}</li>`).join("")}</ul></section>`).join("")}</article>`,
  };
});
const output = resolve(root, "public/medicforest/interview-question-markscheme-rubrics");
writeFileSync(`${output}.txt`, `MEDICFOREST INTERVIEW MARKSCHEMES\n${INTERVIEW_QUESTIONS.length} question-specific markschemes\n\n${note}\n\n${sections.map(section => section.text).join("\n\n------------------------------------------------------------\n\n")}\n`);
if (process.argv.includes("--pdf")) {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : "playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>MedicForest interview markschemes</title><style>@page { size: A4; margin: 16mm; } body { font: 10pt/1.4 Arial,sans-serif; color: #122e3c; } h1 { font-size: 24pt; } h2 { font-size: 14pt; } h3 { font-size: 10pt; color: #08787b; margin: 10px 0 4px; } ul { margin: 0; padding-left: 18px; } article { break-before: page; } .id { font-size: 8pt; color: #526b72; } .source { font-size: 9pt; padding: 10px; background: #f2f7f7; } section { break-inside: avoid; }</style></head><body><h1>Interview markschemes</h1><p>${INTERVIEW_QUESTIONS.length} individually authored question markschemes</p><p>${note}</p><p>Adapted from the owner's worked examples and the final 27 station images.</p>${sections.map(section => section.html).join("")}</body></html>`);
    await page.pdf({ path: `${output}.pdf`, format: "A4", printBackground: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: '<div style="width:100%;text-align:center;font-size:8px;color:#526b72">MedicForest · <span class="pageNumber"></span></div>' });
  } finally { await browser.close(); }
}
console.log(`Exported ${INTERVIEW_QUESTIONS.length} question markschemes${process.argv.includes("--pdf") ? " (text and PDF)" : " (text)"}.`);
