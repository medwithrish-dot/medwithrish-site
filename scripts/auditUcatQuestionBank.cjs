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
const {
  HIGH_QUALITY_9000_FILTERED_TARGETS,
  HIGH_QUALITY_9000_FILTERED_TOTAL_TARGET,
  HIGH_QUALITY_9000_LOCKED_BATCHES,
  HIGH_QUALITY_9000_COMPLETED_BATCHES,
  HIGH_QUALITY_9000_NEXT_WAVE_COMPLETED_BATCHES,
  HIGH_QUALITY_9000_NEXT_WAVE_TOTAL_BATCHES,
  HIGH_QUALITY_9000_TOTAL_BATCHES,
  HIGH_QUALITY_9000_UCAT_QUESTION_BANK,
  HIGH_QUALITY_9000_TOTAL,
} = require(path.join(
  projectRoot,
  "app/phloemai/_lib/generatedUcatQuestionsHighQuality9000.ts"
));

const sections = ["vr", "dm", "qr", "sjt"];
const allQuestions = sections.flatMap((section) => UCAT_QUESTION_BANK[section]);
const ids = new Set(allQuestions.map((question) => question.id));
const highQualityTargets = Object.fromEntries(
  sections.map((section) => [section, HIGH_QUALITY_9000_FILTERED_TARGETS[section]])
);
const highQualityDiversityTargetsPerBatch = {
  vr: { questionTemplates: 65, stimulusTemplates: 50 },
  dm: { questionTemplates: 30, stimulusTemplates: 35 },
  qr: { questionTemplates: 60, stimulusTemplates: 35 },
  sjt: { questionTemplates: 35, stimulusTemplates: 60 },
};
const highQualityDiversityTargetsFull = {
  vr: { questionTemplates: 120, stimulusTemplates: 400 },
  dm: { questionTemplates: 45, stimulusTemplates: 60 },
  qr: { questionTemplates: 120, stimulusTemplates: 70 },
  sjt: { questionTemplates: 45, stimulusTemplates: 300 },
};
const highQualityDiversityTargets = Object.fromEntries(
  sections.map((section) => [
    section,
    {
      questionTemplates: Math.min(
        highQualityDiversityTargetsFull[section].questionTemplates,
        highQualityDiversityTargetsPerBatch[section].questionTemplates *
          HIGH_QUALITY_9000_COMPLETED_BATCHES
      ),
      stimulusTemplates: Math.min(
        highQualityDiversityTargetsFull[section].stimulusTemplates,
        highQualityDiversityTargetsPerBatch[section].stimulusTemplates *
          HIGH_QUALITY_9000_COMPLETED_BATCHES
      ),
    },
  ])
);
const maxHighQualityTemplateShare = 0.07;

function normaliseContentTemplate(value) {
  return String(value || "")
    .replace(/\b\d+(?:[,.]\d+)*(?:\.\d+)?\b/g, "<n>")
    .replace(/GBP\s*<n>(?:\.\d+)?/g, "GBP <n>")
    .replace(/\bhq-[a-z-]+-<n>\b/g, "<id>")
    .replace(/\s+/g, " ")
    .trim();
}

function countTemplates(questions, readText) {
  const counts = new Map();
  for (const question of questions) {
    const template = normaliseContentTemplate(readText(question));
    counts.set(template, (counts.get(template) || 0) + 1);
  }

  return counts;
}

function getLargestTemplateCount(counts) {
  return Math.max(0, ...counts.values());
}

function collectQuestionText(question) {
  const optionText = Array.isArray(question.options)
    ? question.options.map((option) => option.text).join(" | ")
    : "";
  const categoryText = Array.isArray(question.categoryItems)
    ? question.categoryItems.map((item) => item.text).join(" | ")
    : "";
  const yesNoText = Array.isArray(question.yesNoStatements)
    ? question.yesNoStatements.map((item) => item.text).join(" | ")
    : "";

  return [
    question.question,
    question.explanation,
    ...(question.stimulus || []),
    optionText,
    categoryText,
    yesNoText,
  ].join(" | ");
}

if (ids.size !== allQuestions.length) {
  throw new Error("Accepted UCAT bank contains duplicate question IDs.");
}

for (const section of sections) {
  if (UCAT_QUESTION_BANK[section].length === 0) {
    throw new Error(`Accepted UCAT ${section.toUpperCase()} bank is empty.`);
  }
}

const expectedHighQualityTotal = sections.reduce(
  (total, section) => total + highQualityTargets[section],
  0
);

if (expectedHighQualityTotal !== HIGH_QUALITY_9000_FILTERED_TOTAL_TARGET) {
  throw new Error("High-quality filtered target total is inconsistent.");
}

if (HIGH_QUALITY_9000_COMPLETED_BATCHES < 1) {
  throw new Error("At least one generated UCAT batch should be completed.");
}

if (HIGH_QUALITY_9000_COMPLETED_BATCHES > HIGH_QUALITY_9000_TOTAL_BATCHES) {
  throw new Error(
    `Completed generated UCAT batches cannot exceed ${HIGH_QUALITY_9000_TOTAL_BATCHES}.`
  );
}

if (HIGH_QUALITY_9000_TOTAL !== expectedHighQualityTotal) {
  throw new Error(
    `High-quality generated layer should contain ${expectedHighQualityTotal} questions for batch ${HIGH_QUALITY_9000_COMPLETED_BATCHES}/${HIGH_QUALITY_9000_TOTAL_BATCHES}, found ${HIGH_QUALITY_9000_TOTAL}.`
  );
}

for (const section of sections) {
  const generatedCount = HIGH_QUALITY_9000_UCAT_QUESTION_BANK[section].length;
  const acceptedCount = UCAT_QUESTION_BANK[section].filter((question) =>
    question.id.startsWith(`hq-${section}-`)
  ).length;
  const expectedCount = highQualityTargets[section];

  if (generatedCount !== expectedCount) {
    throw new Error(
      `${section.toUpperCase()} high-quality generator expected ${expectedCount}, found ${generatedCount}.`
    );
  }

  if (acceptedCount !== expectedCount) {
    throw new Error(
      `${section.toUpperCase()} high-quality accepted count expected ${expectedCount}, found ${acceptedCount}.`
    );
  }

  const generatedQuestions = HIGH_QUALITY_9000_UCAT_QUESTION_BANK[section];
  const questionTemplateCounts = countTemplates(
    generatedQuestions,
    (question) => question.question
  );
  const stimulusTemplateCounts = countTemplates(generatedQuestions, (question) =>
    (question.stimulus || []).join(" ")
  );
  const diversityTarget = highQualityDiversityTargets[section];

  if (questionTemplateCounts.size < diversityTarget.questionTemplates) {
    throw new Error(
      `${section.toUpperCase()} high-quality generator has only ${questionTemplateCounts.size} normalised question templates; expected at least ${diversityTarget.questionTemplates}.`
    );
  }

  if (stimulusTemplateCounts.size < diversityTarget.stimulusTemplates) {
    throw new Error(
      `${section.toUpperCase()} high-quality generator has only ${stimulusTemplateCounts.size} normalised stimulus templates; expected at least ${diversityTarget.stimulusTemplates}.`
    );
  }

  const largestQuestionTemplateCount = getLargestTemplateCount(questionTemplateCounts);
  const largestStimulusTemplateCount = getLargestTemplateCount(stimulusTemplateCounts);
  const maxTemplateCount = Math.ceil(expectedCount * maxHighQualityTemplateShare);

  if (largestQuestionTemplateCount > maxTemplateCount) {
    throw new Error(
      `${section.toUpperCase()} high-quality generator repeats one question template ${largestQuestionTemplateCount} times; limit is ${maxTemplateCount}.`
    );
  }

  if (largestStimulusTemplateCount > maxTemplateCount) {
    throw new Error(
      `${section.toUpperCase()} high-quality generator repeats one stimulus template ${largestStimulusTemplateCount} times; limit is ${maxTemplateCount}.`
    );
  }
}

const highQualityQrSets = new Set(
  UCAT_QUESTION_BANK.qr
    .filter((question) => question.id.startsWith("hq-qr-"))
    .map((question) => question.setId)
    .filter(Boolean)
);
const expectedHighQualityQrSets = HIGH_QUALITY_9000_FILTERED_TARGETS.qr / 4;
if (highQualityQrSets.size !== expectedHighQualityQrSets) {
  throw new Error(
    `High-quality QR should contain ${expectedHighQualityQrSets} four-question sets for batch ${HIGH_QUALITY_9000_COMPLETED_BATCHES}/${HIGH_QUALITY_9000_TOTAL_BATCHES}, found ${highQualityQrSets.size}.`
  );
}

const bannedHighQualityPatterns = [
  {
    pattern: /\bnot to (replacing|making|closing|charging|moving)\b/i,
    reason: "gerund phrase after 'not to'",
  },
  {
    pattern: /\bin set \d+\b/i,
    reason: "artificial repeated set wording",
  },
  {
    pattern: /\bhelping in an outpatient reception desk\b/i,
    reason: "unnatural SJT setting phrasing",
  },
  {
    pattern: /\ba equipment\b/i,
    reason: "incorrect article before equipment",
  },
  {
    pattern: /\ba event\b/i,
    reason: "incorrect article before event",
  },
  {
    pattern: /\breview area \d+\b/i,
    reason: "artificial repeated review-area wording",
  },
  {
    pattern: /\bextra-[a-z]/i,
    reason: "awkward hyphenated extra-charge wording",
  },
  {
    pattern: /\b([a-z]{3,})\s+\1\b/i,
    reason: "repeated adjacent word",
  },
];
const bannedMatches = [];

for (const section of sections) {
  for (const question of HIGH_QUALITY_9000_UCAT_QUESTION_BANK[section]) {
    const text = collectQuestionText(question);
    const banned = bannedHighQualityPatterns.find(({ pattern }) => pattern.test(text));
    if (banned) {
      bannedMatches.push(`${question.id}: ${banned.reason}`);
    }
  }
}

if (bannedMatches.length > 0) {
  throw new Error(
    `High-quality generated layer contains banned wording:\n${bannedMatches
      .slice(0, 10)
      .join("\n")}`
  );
}

const highQualityQrContentIssues = [];
for (const question of HIGH_QUALITY_9000_UCAT_QUESTION_BANK.qr) {
  const text = collectQuestionText(question);
  const correctText = String(question.correctText || "");

  if (/NaN|Infinity/.test(text)) {
    highQualityQrContentIssues.push(`${question.id}: non-finite numeric text`);
  }

  if (/GBP -/.test(text)) {
    highQualityQrContentIssues.push(`${question.id}: negative money value`);
  }

  if (/how much more/i.test(question.question) && /GBP -/.test(correctText)) {
    highQualityQrContentIssues.push(`${question.id}: negative answer to a 'how much more' question`);
  }

  if (/finish the project/i.test(question.question) && /^0(?:\.0)? days$/.test(correctText)) {
    highQualityQrContentIssues.push(`${question.id}: zero-day work-rate answer`);
  }

  if (/closing stock/i.test(question.question) && /^-/.test(correctText)) {
    highQualityQrContentIssues.push(`${question.id}: negative closing stock answer`);
  }

  if (/ratio/i.test(question.question) && /\d+\/\d+/.test(correctText)) {
    highQualityQrContentIssues.push(`${question.id}: ratio answer uses fraction slash notation`);
  }

  if (/^After that,/i.test(question.question)) {
    highQualityQrContentIssues.push(`${question.id}: work-rate question has unclear 'After that' reference`);
  }
}

if (highQualityQrContentIssues.length > 0) {
  throw new Error(
    `High-quality QR generated layer contains numeric content issues:\n${highQualityQrContentIssues
      .slice(0, 10)
      .join("\n")}`
  );
}

const highQualitySjtSingleQuestions = HIGH_QUALITY_9000_UCAT_QUESTION_BANK.sjt.filter(
  (question) => !question.questionType || question.questionType === "single"
);
const highQualitySjtAnswerCounts = new Map();
for (const question of highQualitySjtSingleQuestions) {
  const key = `${question.subtype}:${question.answer}`;
  highQualitySjtAnswerCounts.set(key, (highQualitySjtAnswerCounts.get(key) || 0) + 1);
}

const minimumMiddleSjtAnswers = HIGH_QUALITY_9000_COMPLETED_BATCHES * 10;
const requiredMiddleSjtAnswers = [
  "sjt-appropriateness:B",
  "sjt-appropriateness:C",
  "sjt-importance:B",
  "sjt-importance:C",
];
const weakSjtAnswerSpread = requiredMiddleSjtAnswers.filter(
  (key) => (highQualitySjtAnswerCounts.get(key) || 0) < minimumMiddleSjtAnswers
);

if (weakSjtAnswerSpread.length > 0) {
  throw new Error(
    `High-quality SJT generated layer lacks middle-ground mark schemes: ${weakSjtAnswerSpread
      .map((key) => `${key}=${highQualitySjtAnswerCounts.get(key) || 0}`)
      .join(", ")}.`
  );
}

const learningReasonImportanceQuestions = HIGH_QUALITY_9000_UCAT_QUESTION_BANK.sjt.filter(
  (question) =>
    question.subtype === "sjt-importance" &&
    question.answer === "C" &&
    /\b(?:wanted|hoped|thought).*?\b(?:learn|practice|practise|skills)\b/i.test(question.question)
).length;

if (learningReasonImportanceQuestions < minimumMiddleSjtAnswers) {
  throw new Error(
    `High-quality SJT should mark learning-motive factors as minor importance often enough; found ${learningReasonImportanceQuestions}.`
  );
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
console.log(
  `Previously reviewed high-quality waves: ${HIGH_QUALITY_9000_LOCKED_BATCHES}/${HIGH_QUALITY_9000_LOCKED_BATCHES}`
);
console.log(
  `Next high-quality wave progress: ${HIGH_QUALITY_9000_NEXT_WAVE_COMPLETED_BATCHES}/${HIGH_QUALITY_9000_NEXT_WAVE_TOTAL_BATCHES}`
);
console.log(
  `Combined high-quality generated batch progress: ${HIGH_QUALITY_9000_COMPLETED_BATCHES}/${HIGH_QUALITY_9000_TOTAL_BATCHES}`
);
console.log(`High-quality generated questions accepted: ${HIGH_QUALITY_9000_TOTAL}`);
