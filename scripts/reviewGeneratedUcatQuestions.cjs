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
  HIGH_QUALITY_9000_COMPLETED_BATCHES,
  HIGH_QUALITY_9000_LOCKED_BATCHES,
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

function normaliseTemplate(value) {
  return String(value || "")
    .replace(/\b\d+(?:[,.]\d+)*(?:\.\d+)?\b/g, "<n>")
    .replace(/GBP\s*<n>(?:\.\d+)?/g, "GBP <n>")
    .replace(/\bhq-[a-z-]+-<n>\b/g, "<id>")
    .replace(/\s+/g, " ")
    .trim();
}

function collectQuestionText(question) {
  const options = Array.isArray(question.options)
    ? question.options.map((option) => option.text).join(" | ")
    : "";
  const categories = Array.isArray(question.categoryItems)
    ? question.categoryItems.map((item) => item.text).join(" | ")
    : "";
  const yesNo = Array.isArray(question.yesNoStatements)
    ? question.yesNoStatements.map((item) => item.text).join(" | ")
    : "";

  return [
    question.question,
    question.explanation,
    ...(question.stimulus || []),
    options,
    categories,
    yesNo,
  ].join(" | ");
}

function countTemplates(questions, readText) {
  const counts = new Map();

  for (const question of questions) {
    const key = normaliseTemplate(readText(question));
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return counts;
}

function topTemplates(counts, limit = 5) {
  return [...counts.entries()]
    .sort((first, second) => second[1] - first[1])
    .slice(0, limit);
}

function collectSetStimuli(questions) {
  const setStimuli = new Map();

  for (const question of questions) {
    const setId = question.setId || question.id;
    if (!setStimuli.has(setId)) {
      setStimuli.set(setId, (question.stimulus || []).join(" "));
    }
  }

  return [...setStimuli.entries()].map(([setId, stimulus]) => ({
    setId,
    stimulus,
    normalised: normaliseTemplate(stimulus).toLowerCase(),
  }));
}

function wordShingles(value, size = 5) {
  const words = normaliseTemplate(value)
    .toLowerCase()
    .replace(/[^\w\s<>-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const shingles = new Set();

  for (let index = 0; index <= words.length - size; index += 1) {
    shingles.add(words.slice(index, index + size).join(" "));
  }

  return shingles;
}

function jaccard(first, second) {
  let overlap = 0;

  for (const item of first) {
    if (second.has(item)) overlap += 1;
  }

  return overlap / Math.max(1, first.size + second.size - overlap);
}

function findSetStimulusIssues(section, questions) {
  if (section !== "vr" && section !== "sjt") return [];

  const entries = collectSetStimuli(questions);
  const byNormalisedStimulus = new Map();
  const issues = [];

  for (const entry of entries) {
    const matches = byNormalisedStimulus.get(entry.normalised) || [];
    matches.push(entry.setId);
    byNormalisedStimulus.set(entry.normalised, matches);
  }

  for (const [template, setIds] of byNormalisedStimulus.entries()) {
    if (setIds.length > 1) {
      issues.push(
        `set-level stimulus repeated in ${setIds.length} sets (${setIds
          .slice(0, 4)
          .join(", ")}): ${template.slice(0, 120)}`
      );
    }
  }

  const shingleEntries = entries.map((entry) => ({
    ...entry,
    shingles: wordShingles(entry.stimulus),
  }));
  const nearTemplateThreshold = section === "vr" ? 0.72 : 0.66;
  let closestPair = null;

  for (let firstIndex = 0; firstIndex < shingleEntries.length; firstIndex += 1) {
    for (
      let secondIndex = firstIndex + 1;
      secondIndex < shingleEntries.length;
      secondIndex += 1
    ) {
      const score = jaccard(
        shingleEntries[firstIndex].shingles,
        shingleEntries[secondIndex].shingles
      );
      if (!closestPair || score > closestPair.score) {
        closestPair = {
          score,
          first: shingleEntries[firstIndex],
          second: shingleEntries[secondIndex],
        };
      }
    }
  }

  if (closestPair && closestPair.score >= nearTemplateThreshold) {
    issues.push(
      `near-template stimuli ${closestPair.first.setId}/${closestPair.second.setId} share ${(
        closestPair.score * 100
      ).toFixed(1)}% five-word shingles`
    );
  }

  return issues;
}

function findBannedWording(questions) {
  const bannedPatterns = [
    [/not to (replacing|making|closing|charging|moving)\b/i, "gerund after 'not to'"],
    [/\bin set \d+\b/i, "artificial repeated set wording"],
    [/\bhelping in an outpatient reception desk\b/i, "unnatural SJT setting phrasing"],
    [/\ba equipment\b/i, "incorrect article before equipment"],
    [/\ba event\b/i, "incorrect article before event"],
    [/\breview area \d+\b/i, "artificial repeated review-area wording"],
    [/\bextra-[a-z]/i, "awkward hyphenated extra-charge wording"],
    [/\b([a-z]{3,})\s+\1\b/i, "repeated adjacent word"],
    [/\bNaN|Infinity\b/i, "non-finite numeric output"],
    [/GBP -/i, "negative money value"],
  ];
  const findings = [];

  for (const question of questions) {
    const text = collectQuestionText(question);
    const match = bannedPatterns.find(([pattern]) => pattern.test(text));
    if (match) findings.push(`${question.id}: ${match[1]}`);
  }

  return findings;
}

function findQrNumericIssues(questions) {
  const findings = [];

  for (const question of questions) {
    const correctText = String(question.correctText || "");

    if (/how much more/i.test(question.question) && /GBP -/.test(correctText)) {
      findings.push(`${question.id}: negative answer to 'how much more'`);
    }

    if (/finish the project/i.test(question.question) && /^0(?:\.0)? days$/.test(correctText)) {
      findings.push(`${question.id}: zero-day work-rate answer`);
    }

    if (/closing stock/i.test(question.question) && /^-/.test(correctText)) {
      findings.push(`${question.id}: negative closing stock answer`);
    }

    if (/ratio/i.test(question.question) && /\d+\/\d+/.test(correctText)) {
      findings.push(`${question.id}: ratio answer uses fraction slash notation`);
    }

    if (/^After that,/i.test(question.question)) {
      findings.push(`${question.id}: work-rate question has unclear 'After that' reference`);
    }
  }

  return findings;
}

function findSjtMarkSchemeIssues(questions) {
  const singleQuestions = questions.filter(
    (question) => !question.questionType || question.questionType === "single"
  );
  const answerCounts = new Map();

  for (const question of singleQuestions) {
    const key = `${question.subtype}:${question.answer}`;
    answerCounts.set(key, (answerCounts.get(key) || 0) + 1);
  }

  const minimumMiddleAnswers = HIGH_QUALITY_9000_COMPLETED_BATCHES * 10;
  const requiredMiddleAnswers = [
    "sjt-appropriateness:B",
    "sjt-appropriateness:C",
    "sjt-importance:B",
    "sjt-importance:C",
  ];
  const findings = requiredMiddleAnswers
    .filter((key) => (answerCounts.get(key) || 0) < minimumMiddleAnswers)
    .map((key) => `${key} appears only ${answerCounts.get(key) || 0} times`);

  const learningReasonImportanceQuestions = questions.filter(
    (question) =>
      question.subtype === "sjt-importance" &&
      question.answer === "C" &&
      /\b(?:wanted|hoped|thought).*?\b(?:learn|practice|practise|skills)\b/i.test(
        question.question
      )
  ).length;

  if (learningReasonImportanceQuestions < minimumMiddleAnswers) {
    findings.push(
      `learning-motive factors marked minor importance appear only ${learningReasonImportanceQuestions} times`
    );
  }

  return findings;
}

console.log(
  `Previously reviewed generated UCAT waves: ${HIGH_QUALITY_9000_LOCKED_BATCHES}/${HIGH_QUALITY_9000_LOCKED_BATCHES}`
);
console.log(
  `Next generated UCAT wave progress: ${HIGH_QUALITY_9000_NEXT_WAVE_COMPLETED_BATCHES}/${HIGH_QUALITY_9000_NEXT_WAVE_TOTAL_BATCHES}`
);
console.log(
  `Combined generated UCAT batch progress: ${HIGH_QUALITY_9000_COMPLETED_BATCHES}/${HIGH_QUALITY_9000_TOTAL_BATCHES}`
);
console.log(`Generated UCAT layer total: ${HIGH_QUALITY_9000_TOTAL}`);

for (const section of sections) {
  const questions = HIGH_QUALITY_9000_UCAT_QUESTION_BANK[section];
  const questionTemplates = countTemplates(questions, (question) => question.question);
  const stimulusTemplates = countTemplates(questions, (question) =>
    (question.stimulus || []).join(" ")
  );
  const setStimuli = collectSetStimuli(questions);
  const bannedWording = findBannedWording(questions);
  const setStimulusIssues = findSetStimulusIssues(section, questions);
  const qrNumericIssues = section === "qr" ? findQrNumericIssues(questions) : [];
  const sjtMarkSchemeIssues = section === "sjt" ? findSjtMarkSchemeIssues(questions) : [];

  console.log(`\n${section.toUpperCase()}`);
  console.log(`  questions: ${questions.length}`);
  console.log(`  normalised question templates: ${questionTemplates.size}`);
  console.log(`  normalised stimulus templates: ${stimulusTemplates.size}`);
  if (section === "vr" || section === "sjt") {
    console.log(
      `  set-level stimuli: ${new Set(setStimuli.map((entry) => entry.normalised)).size}/${setStimuli.length} unique`
    );
  }
  console.log("  most repeated question templates:");
  topTemplates(questionTemplates).forEach(([template, count]) => {
    console.log(`    ${count}x ${template}`);
  });
  console.log("  most repeated stimulus templates:");
  topTemplates(stimulusTemplates, 3).forEach(([template, count]) => {
    console.log(`    ${count}x ${template}`);
  });

  if (
    bannedWording.length > 0 ||
    setStimulusIssues.length > 0 ||
    qrNumericIssues.length > 0 ||
    sjtMarkSchemeIssues.length > 0
  ) {
    console.log("  content warnings:");
    [
      ...bannedWording,
      ...setStimulusIssues,
      ...qrNumericIssues,
      ...sjtMarkSchemeIssues,
    ]
      .slice(0, 12)
      .forEach((warning) => {
        console.log(`    ${warning}`);
      });
  } else {
    console.log("  content warnings: none");
  }
}
