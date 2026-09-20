# QR Question Generation Guide for Codex

This file governs how to generate entries for `USER_CURATED_QR_INPUTS` in `ucatQrCuratedInputs.ts`.

---

## Output format

Every entry is a `QrCuratedInput` of `kind: "set"`:

```ts
{
  kind: "set",
  setId: "kebab-case-unique-id",
  stimulus: ["One sentence describing what the data shows."],
  visual: { /* table or chart — see below */ },
  questions: [ /* exactly 4 questions */ ],
}
```

A `kind: "single"` (no shared visual) is also valid but rare — prefer sets.

---

## Table visual structure

```ts
visual: {
  type: "table",
  title: "Descriptive Title (unit if needed, e.g. £'000 or %)",
  headers: ["Row label col", "Col1", "Col2", "Col3", "Col4", "Total"],
  rows: [
    ["Row 1", "v", "v", "v", "v", "rowTotal"],
    ...
    ["Total", "colTotal", "colTotal", "colTotal", "colTotal", "grandTotal"],
  ],
}
```

**Rules:**
- Every row total must equal the sum of its data cells.
- Every column total must equal the sum of its column cells.
- Grand total must agree both ways (sum of row totals = sum of col totals).
- All values are **strings** (even numbers).
- Optionally include a `note` field for thresholds or units.

**Typical shapes:** 4 data rows × 4 data columns is common, but vary it — use 3 rows, 5 columns, 3 months instead of 4, etc. to avoid structural clones.

---

## Bar / line / grouped-bar visual

```ts
visual: {
  type: "bar",                         // or "line" or "grouped-bar"
  title: "Chart Title",
  yLabel: "Y-axis label",
  categories: [                        // for bar and line
    { label: "Jan", value: 900 },
    ...
  ],
  max: 2400,                           // round number comfortably above highest value
}

// grouped-bar:
visual: {
  type: "grouped-bar",
  title: "...",
  yLabel: "...",
  seriesLabels: ["Series A", "Series B"],
  groups: [
    { label: "Jan", values: [400, 300] },
    ...
  ],
  max: 600,
}
```

---

## Question format

```ts
{
  subtype: "qr-percentages" | "qr-rates-ratios" | "qr-averages"
         | "qr-estimation" | "qr-graphs" | "qr-units-geometry",
  tags: ["easy"|"medium"|"hard", ...style tags],
  question: "Question text ending with ?",
  correct: "Answer (include units if applicable, e.g. '40%', '3:2', '£200,000')",
  distractors: ["wrong1", "wrong2", "wrong3"],
  explanation: "Calculation showing correct answer. Then: Distractor X: one-line mechanical reason.",
}
```

---

## Subtype usage rules

| Subtype | When to use |
|---|---|
| `qr-percentages` | % of total, % change, % more/less |
| `qr-rates-ratios` | ratio of two quantities (simplify fully) |
| `qr-averages` | mean (and sometimes median/mode) |
| `qr-estimation` | approximate %, fraction, or count from a chart/table without exact arithmetic |
| `qr-graphs` | direct chart-reading (e.g. "what was the value in March?") |
| `qr-units-geometry` | unit conversion, dosage per kg, area/volume calculations |

**Per set:** mix at least 2 different subtypes. Do not use 4 × `qr-percentages` in one set.

---

## Anti-clone rules

The bank already contains 80+ sets. **Never clone the template.** Specifically:

1. **Q1 must not always be "What % of all X were Y?" → 40%.** Vary the first question: sometimes ask a ratio, sometimes ask about a specific cell, sometimes an estimation.
2. **Q3 must not always be a mean with distractors (highest, lowest, ÷5).** Vary mean questions. Use median/mode occasionally. Use a different wrong-divisor distractor (÷2, ÷6, etc.).
3. **Q4 must not always be "% more than" with the same three-error pattern.** Use % decrease, "what would the new total be", "what fraction of X comes from Y", etc.
4. **Table shape:** don't always use 4 data rows × 4 data columns with a Totals row and column. Vary to 3 rows, 5 columns, 3 time periods, or use a bar/line chart.
5. **Grand total:** aim for variety — 1000, 1200, 2000, 2500, 3000, 4000, 5000, 9000 etc., not always 3000.
6. **The "40% first answer" pattern is overused.** The most common Q1 answer in the bank is 40% (largest row = 40% of total). Use other clean percentages: 50%, 30%, 25%, 33.3%, 60%.

---

## Arithmetic verification checklist (required before submitting)

For every set, verify **all** of the following:

- [ ] Every data row sums to its stated total
- [ ] Every data column sums to its stated total
- [ ] Both totals agree at the grand total cell
- [ ] `correct` answer for each question is arithmetically exact (show the working)
- [ ] Each distractor arises from a **real, named calculation error** — not a random number
- [ ] No two distractors are numerically equal to each other
- [ ] No distractor equals the correct answer
- [ ] The "divide by wrong number" distractor (common in mean questions) does **not** equal any actual data cell in the table

---

## Distractor design principles

Each distractor must represent a specific, plausible error:

| Error type | Example |
|---|---|
| Ratio reversed | "3:2" when correct is "2:3" |
| Wrong row/column | Reads Soft Tissue instead of Fractures |
| Wrong denominator | Uses grand total instead of category total |
| "% of" not "% more" | 360/240×100=150% instead of (360-240)/240×100=50% |
| Absolute diff as % | Gives "120" instead of 50% for a % change |
| Wrong base for % change | Uses new value as denominator instead of old |
| Divides by wrong N | Divides by 5 instead of 4 for a mean |
| Off-by-one row/bar | Reads the adjacent category |

---

## Tag conventions

```
"easy"    → straightforward single-step calculation
"medium"  → two steps, or requires careful denominator choice
"hard"    → multi-step, non-obvious, or easy to confuse with a similar calculation
"quick"   → can be done mentally in <20 seconds
"multi-step" → requires 2+ calculations
"calculator-heavy" → arithmetic is complex enough to need the on-screen calculator
"data-display" → question involves reading from the table/chart
"set-based" → question belongs to a multi-question set
```

---

## setId naming

Use `kebab-case`, descriptive, unique. Format: `<context>-<data-type>` e.g.:
- `gp-blood-test-age-groups`
- `icu-length-of-stay`
- `ae-monthly-attendance-trend`

Check the existing setIds in `USER_CURATED_QR_INPUTS` to avoid duplicates.

---

## Stimulus

One plain sentence. State **what** the data shows, **who** collected it, and any relevant condition (e.g. "The safe threshold is 35 µg/m³"). Do not state the question or hint at the answer.

---

## Explanation format

```
"[Row/col] = X; [denominator] = Y. X÷Y×100=Z%. 
Distractor A%: [one-line reason — what wrong calculation produces A%]. 
Distractor B: [one-line reason]. 
Distractor C: [one-line reason]."
```

Show the actual numbers. Name every distractor explicitly. Keep it under 3 sentences per distractor.

---

## Clinical/medical context guidance

Many sets use NHS/clinical contexts. Valid clinical contexts not yet heavily used:
- Dental practice treatments
- Mental health bed-days by ward
- Neonatal unit admissions
- Occupational therapy referrals
- Pharmacy drug classes (not just "antibiotics")
- Dietitian caseload by condition
- Physiotherapy session outcomes

Avoid duplicate contexts — check existing setIds before choosing a new one.

---

## What NOT to do

- Do not leave internal deliberation or self-corrections in explanations.
- Do not write distractors without knowing the exact wrong calculation that produces them.
- Do not produce a table where clean answers are impossible (grand total is a prime number or awkward fraction).
- Do not make all four questions the same subtype.
- Do not use 4×4 table + same Q1/Q2/Q3/Q4 template for every set.
