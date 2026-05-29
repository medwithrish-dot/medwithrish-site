/**
 * Fixes DM questions that use specialist medical/statistical jargon without defining it.
 * For each affected question, adds a plain-language definition of each specialist term
 * so students do not need prior knowledge to answer.
 *
 * Strategy:
 *   - Terms in the QUESTION field: add a parenthetical definition after the term
 *   - Terms in the STIMULUS: add a brief inline definition where the term appears
 *   - Where the question just asks "What is the X?" rewrite to plain English
 */

import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(
  __dirname,
  "../app/phloemai/_lib/ucatDmCuratedInputs.ts"
);



// ─── Jargon detection (exact word boundaries) ────────────────────────────────
const JARGON_PATTERNS = [
  /\bNPV\b/,
  /\bPPV\b/,
  /\bARR\b/,
  /\bRRR\b/,
  /\bNNT\b/,
  /\bNNH\b/,
  /\bsensitivity\b/i,
  /\bspecificity\b/i,
  /negative predictive value/i,
  /positive predictive value/i,
  /\brelative risk\b/i,
  /\bodds ratio\b/i,
  /\bhazard ratio\b/i,
  /\babsolute risk reduction\b/i,
  /\bnumber needed to treat\b/i,
  /\bnumber needed to harm\b/i,
  /\blikelihood ratio\b/i,
  /\bfalse positive rate\b/i,
  /\bfalse negative rate\b/i,
  /\btrue positive rate\b/i,
  /\btrue negative rate\b/i,
  /\bconfidence interval\b/i,
];

function hasJargon(text) {
  return JARGON_PATTERNS.some((re) => re.test(text));
}

// ─── Block extraction (same approach as fix-dm-arguments.mjs) ────────────────
function extractProbabilityBlocks(content) {
  const blocks = [];
  // Match dm-probability-data, dm-logic, and dm-yes-no blocks
  const startRe =
    /\{\r?\n[ \t]*kind:\s*["']single["'],\r?\n[ \t]*subtype:\s*["']dm-(?:probability-data|logic)["']/g;
  let m;
  while ((m = startRe.exec(content)) !== null) {
    const start = m.index;
    let depth = 0,
      i = start;
    while (i < content.length) {
      if (content[i] === "{") depth++;
      else if (content[i] === "}") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
      i++;
    }
    if (content[i] === ",") i++;
    blocks.push({ start, end: i, text: content.slice(start, i) });
  }
  return blocks;
}

function parseBlock(text) {
  // stimulus — may be an array with multiple strings
  const stimMatch = text.match(/stimulus:\s*\[([\s\S]*?)\]/);
  let stimulus = "";
  if (stimMatch) {
    stimulus = stimMatch[1]
      .replace(/["']\s*\+\s*["']/g, "")
      .replace(/["']/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  const questionMatch = text.match(/question:\s*["'`]([\s\S]*?)["'`]\s*,/);
  const question = questionMatch ? questionMatch[1] : null;

  const correctMatch = text.match(/correct:\s*["'`]([\s\S]*?)["'`]\s*,/);
  const correct = correctMatch ? correctMatch[1] : null;

  const explanationMatch = text.match(
    /explanation:\s*["'`]([\s\S]*?)["'`]\s*,?\s*\n/
  );
  const explanation = explanationMatch ? explanationMatch[1] : null;

  return { stimulus, question, correct, explanation };
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function fixJargon(stimulus, question, correct, explanation) {
  const prompt = `You are helping improve a UCAT Decision Making question bank.

The following question uses specialist medical/statistical terminology that test-takers cannot be expected to know in advance. Your task is to rewrite ONLY the stimulus array strings and the question string so that:
1. Every specialist term (sensitivity, specificity, NPV, PPV, relative risk, NNT, odds ratio, ARR, RRR, likelihood ratio, etc.) is defined the first time it appears, using a plain-language parenthetical.
2. The mathematical challenge is completely unchanged — do not alter numbers, structure, or what is being asked.
3. If the question says "What is the X?" where X is pure jargon (e.g., "What is the NPV of the test?"), rewrite it as a plain-English question instead (e.g., "Among patients who tested negative, what proportion do NOT have the condition?").
4. Do not change the correct answer, distractors, or explanation.

Return a JSON object with exactly these keys:
  "stimulus": array of strings (each element = one stimulus sentence/paragraph, same count as input)
  "question": string

Input:
STIMULUS (array): ${JSON.stringify(stimulus.split(/\.,\s*|\.\s+/).map((s) => s.trim()).filter(Boolean))}
QUESTION: ${JSON.stringify(question)}
CORRECT ANSWER (for context only, do not change): ${JSON.stringify(correct)}

Return ONLY the JSON object, no explanation.`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0].text.trim();
  // Extract JSON even if model wraps in markdown
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response: " + raw);
  return JSON.parse(jsonMatch[0]);
}

// ─── Rebuild stimulus array string ───────────────────────────────────────────
function rebuildStimulusString(newStimulusArr, originalStimulusBlock) {
  // Try to preserve the original quote style and formatting
  const quote = originalStimulusBlock.includes('"') ? '"' : "'";
  const items = newStimulusArr.map((s) => `${quote}${s}${quote}`).join(",\n");
  return `stimulus: [\n${items}\n]`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Reading file…");
  let content = fs.readFileSync(filePath, "utf8");
  fs.writeFileSync(filePath + ".jargon-backup", content);
  console.log("Backup written.");

  const blocks = extractProbabilityBlocks(content);
  console.log(`Found ${blocks.length} dm-probability/logic blocks.`);

  const toFix = [];
  for (const block of blocks) {
    const { stimulus, question } = parseBlock(block.text);
    if (hasJargon(stimulus) || hasJargon(question)) {
      toFix.push({ block, ...parseBlock(block.text) });
    }
  }
  console.log(`Questions with specialist jargon: ${toFix.length}\n`);

  const replacements = new Map();
  const BATCH = 10;

  for (let i = 0; i < toFix.length; i += BATCH) {
    const batch = toFix.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (item) => {
        const { block, stimulus, question, correct, explanation } = item;
        try {
          const fixed = await fixJargon(stimulus, question, correct, explanation);

          let newBlock = block.text;

          // Replace question string
          if (fixed.question && fixed.question !== question) {
            const escapedQ = question.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            newBlock = newBlock.replace(
              new RegExp(`(question:\\s*["'\`])${escapedQ}(["'\`])`),
              (_, pre, post) => `${pre}${fixed.question}${post}`
            );
          }

          // Replace stimulus array
          if (fixed.stimulus && Array.isArray(fixed.stimulus)) {
            const stimMatch = newBlock.match(/stimulus:\s*\[([\s\S]*?)\]/);
            if (stimMatch) {
              const newStimStr = rebuildStimulusString(
                fixed.stimulus,
                stimMatch[0]
              );
              newBlock = newBlock.replace(stimMatch[0], newStimStr);
            }
          }

          if (newBlock !== block.text) {
            replacements.set(block.text, newBlock);
            process.stdout.write(".");
          } else {
            process.stdout.write("~");
          }
        } catch (e) {
          console.error(`\nFailed for: ${question?.substring(0, 60)}: ${e.message}`);
          process.stdout.write("!");
        }
      })
    );
    console.log(
      ` batch ${Math.floor(i / BATCH) + 1} (${Math.min(i + BATCH, toFix.length)}/${toFix.length})`
    );
  }

  // Apply all replacements
  for (const [oldText, newText] of replacements) {
    content = content.replace(oldText, newText);
  }

  fs.writeFileSync(filePath, content);
  console.log(
    `\nDone. Fixed ${replacements.size}/${toFix.length} jargon questions.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
