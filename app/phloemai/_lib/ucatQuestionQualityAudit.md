# UCAT Question Quality Audit

Last audit command:

```bash
npm run audit:ucat-questions
```

## Current Live Bank

The live bank is now exported from `UCAT_QUESTION_QUALITY_REVIEW.bank`, not from
the 9,200-question generated scaffold directly.

Accepted questions:

- VR: 156
- DM: 176
- QR: 207
- SJT: 207
- Total: 746

## Main QA Decision

The 9,200-question generated layer was treated as a draft scaffold because it
contains repeated template families. The quality gate lets through only a capped
sample that passes structure checks and clone checks. This means the app now
prefers fewer higher-quality questions over a large bank padded with very similar
items.

## Ratio Notes

- DM Venn/set questions currently outnumber logical puzzles: 37 Venn/set versus
  19 logical puzzles.
- Generated draft questions are capped so they cannot make up more than 50% of a
  live section.
- Repeated generated templates are capped separately, so same-format questions
  can appear for practice but cannot dominate a section.

## Before Adding More Questions

- Add small audited batches, not large unreviewed scaffolds.
- Keep numbers, scenarios, names, settings and answer logic original.
- Run `npm run audit:ucat-questions`.
- Run `npx tsc --noEmit --pretty false`.
- Only increase live counts when the audit stays clean and the subtype mix still
  matches `ucatQuestionDesignNotes.md`.
