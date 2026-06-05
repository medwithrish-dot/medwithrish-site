/**
 * Fixes two issues in dm-arguments "strongest argument" questions:
 * 1. Removes parenthetical flaw labels like (TRIVIAL), (CIRCULAR), (VAGUE), (IRRELEVANT)
 * 2. Ensures every question has exactly 2 Yes and 2 No options
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.resolve(
  __dirname,
  "../app/phloemai/_lib/ucatDmCuratedInputs.ts"
);


// ── helpers ──────────────────────────────────────────────────────────────────

function stripLabels(text) {
  return text
    .replace(
      / \((?:TRIVIAL|CIRCULAR|VAGUE|IRRELEVANT|NON[- ]SEQUITUR|OPINION|WEAK|SUBJECTIVE|ANECDOTAL|HASTY GENERALISATION|APPEAL TO AUTHORITY|AD HOMINEM)[^)]*\)/gi,
      ""
    )
    .trim();
}

function getDir(text) {
  const t = (text || "").trim().toLowerCase();
  if (t.startsWith("yes")) return "Yes";
  if (t.startsWith("no")) return "No";
  return null;
}

/**
 * Extract dm-arguments blocks with their start/end byte offsets.
 * Returns [{ start, end, text }]
 */
function extractBlocks(content) {
  const blocks = [];
  // Match the exact opening line sequence that begins a dm-arguments single question
  // The file uses CRLF (\r\n) line endings with 2-space object indent, 4-space key indent
  const startRe =
    /\{\r?\n[ \t]*kind:\s*["']single["'],\r?\n[ \t]*subtype:\s*["']dm-arguments["']/g;

  let m;
  while ((m = startRe.exec(content)) !== null) {
    const start = m.index;

    // Count braces to find the matching closing }
    let depth = 0;
    let i = start;
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
  // stimulus
  const stimMatch = text.match(
    /stimulus:\s*\[[\s\n]*["'`]([\s\S]*?)["'`][\s\n]*\]/
  );
  const stimulus = stimMatch ? stimMatch[1] : null;

  // correct
  const correctMatch = text.match(/correct:\s*["'`]([\s\S]*?)["'`]\s*,/);
  const correct = correctMatch ? correctMatch[1] : null;

  // distractors – grab the content between the outermost [ ]
  const dArrMatch = text.match(/distractors:\s*\[([\s\S]*?)\]/);
  let distractors = [];
  if (dArrMatch) {
    const inner = dArrMatch[1];
    // match every quoted string
    const itemRe = /["'`]((?:[^"'`\\]|\\.)*)["'`]/g;
    let dm;
    while ((dm = itemRe.exec(inner)) !== null) {
      distractors.push(dm[1]);
    }
  }

  return { stimulus, correct, distractors };
}

async function generateDistractor(stimulus, neededDir, existingOptions) {
  const existing = existingOptions.filter(Boolean).join(" | ");
  throw new Error(
    `Manual ${neededDir} distractor required for "${stimulus}". Existing options: ${existing}`
  );
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Reading file…");
  let content = fs.readFileSync(filePath, "utf8");

  // Backup
  fs.writeFileSync(filePath + ".backup", content);
  console.log("Backup written to", filePath + ".backup");

  // ── Step 1: strip all labels from the whole file ──────────────────────────
  console.log("\nStep 1: stripping parenthetical labels…");
  const before = content;
  content = stripLabels(content);
  const labelCount = (before.match(
    / \((?:TRIVIAL|CIRCULAR|VAGUE|IRRELEVANT|NON[- ]SEQUITUR|OPINION|WEAK|SUBJECTIVE|ANECDOTAL|HASTY GENERALISATION|APPEAL TO AUTHORITY|AD HOMINEM)[^)]*\)/gi
  ) || []).length;
  console.log(`  Removed ${labelCount} labels.`);

  // ── Step 2: fix Yes/No balance ────────────────────────────────────────────
  console.log("\nStep 2: fixing Yes/No balance…");

  const blocks = extractBlocks(content);
  console.log(`  Found ${blocks.length} dm-arguments blocks.`);

  const toFix = [];
  for (const block of blocks) {
    const { stimulus, correct, distractors } = parseBlock(block.text);
    if (!stimulus || !correct || distractors.length < 3) continue;

    const all = [correct, ...distractors];
    const yesCount = all.filter((o) => getDir(o) === "Yes").length;
    const noCount = all.filter((o) => getDir(o) === "No").length;

    if (yesCount !== 2 || noCount !== 2) {
      toFix.push({ block, stimulus, correct, distractors });
    }
  }
  console.log(`  Questions needing balance fix: ${toFix.length}`);

  // Process in parallel batches
  const BATCH = 20;
  let fixedCount = 0;
  const replacements = new Map(); // oldBlockText → newBlockText

  for (let i = 0; i < toFix.length; i += BATCH) {
    const batch = toFix.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (item) => {
        const { block, stimulus, correct, distractors } = item;

        const correctDir = getDir(correct);
        const oppDir = correctDir === "Yes" ? "No" : "Yes";

        // We want: 1 same-dir distractor, 2 opp-dir distractors
        // (so total across all 4 options = 2 Yes + 2 No)
        const neededSame = 1;
        const neededOpp = 2;

        const sameDirDistractors = distractors.filter(
          (d) => getDir(d) === correctDir
        );
        const oppDirDistractors = distractors.filter(
          (d) => getDir(d) === oppDir
        );

        // Build new distractors list
        let newDistractors = [...distractors];

        // Too many same-dir: replace extras with opp-dir
        const extraSame = sameDirDistractors.length - neededSame;
        if (extraSame > 0) {
          let replaced = 0;
          for (let j = newDistractors.length - 1; j >= 0 && replaced < extraSame; j--) {
            if (getDir(newDistractors[j]) === correctDir) {
              const existing = [correct, ...newDistractors.filter((_, k) => k !== j)];
              const newD = await generateDistractor(stimulus, oppDir, existing);
              newDistractors[j] = newD;
              replaced++;
            }
          }
        }

        // Too many opp-dir: replace extras with same-dir
        const extraOpp = oppDirDistractors.length - neededOpp;
        if (extraOpp > 0) {
          let replaced = 0;
          for (let j = newDistractors.length - 1; j >= 0 && replaced < extraOpp; j--) {
            if (getDir(newDistractors[j]) === oppDir) {
              const existing = [correct, ...newDistractors.filter((_, k) => k !== j)];
              const newD = await generateDistractor(stimulus, correctDir, existing);
              newDistractors[j] = newD;
              replaced++;
            }
          }
        }

        // Rebuild the distractors array string
        let newBlock = block.text;
        for (let j = 0; j < distractors.length; j++) {
          if (distractors[j] !== newDistractors[j]) {
            // Replace the quoted string value inside the block
            // Use a regex that matches the specific string value
            const escaped = distractors[j].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const re = new RegExp(`(["'\`])${escaped}\\1`);
            newBlock = newBlock.replace(re, (m, q) => `${q}${newDistractors[j]}${q}`);
          }
        }

        if (newBlock !== block.text) {
          replacements.set(block.text, newBlock);
          fixedCount++;
          if (fixedCount % 10 === 0)
            console.log(`  Fixed ${fixedCount}/${toFix.length}…`);
        }
      })
    );
    console.log(`  Batch ${Math.floor(i / BATCH) + 1} done (${Math.min(i + BATCH, toFix.length)}/${toFix.length})`);
  }

  // Apply replacements
  for (const [oldText, newText] of replacements) {
    content = content.replace(oldText, newText);
  }

  fs.writeFileSync(filePath, content);
  console.log(
    `\nDone. Stripped ${labelCount} labels. Fixed balance on ${fixedCount} questions.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
