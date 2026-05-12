# UCAT Question Design Notes

These notes are for future AI-assisted question-bank work. Read this file before generating or editing UCAT practice questions.

## Global Rules

- Do not copy, closely paraphrase, or structurally clone official UCAT, third-party practice, exam-board, textbook, article, or user-provided example questions.
- Use examples only for order, question-type mix, difficulty feel, and interface style. The actual names, numbers, diagrams, domains, and wording must be original.
- Screenshots or competitor-bank examples may be used only to calibrate broad interface patterns such as option scales, drag target layout, number of linked items, timing pressure and question ordering. Never reuse distinctive occupations, names, clinical conflicts, disease facts, numbers, locations, action wording, or conclusion wording from those sources.
- Keep questions UCAT-style: short stems, clear answer options, no trick wording beyond the intended reasoning skill, and explanations that show the minimum decisive logic.
- Use tags consistently. Difficulty tags should reflect the target student's experience, not an expert tutor's experience.
- Prefer clean arithmetic and exact answers. Avoid accidental ties, ambiguous "could" wording, or claims that rely on outside knowledge.
- For Yes/No items, use only information in the stem. A statement should be marked "Yes" only if it follows from the given information, not because it is plausible in real life.

## Verbal Reasoning Batch Style

VR should be passage-based. A stimulus normally has 4 questions. True / False / Can't tell items use exactly 3 options:

- True
- False
- Can't tell

Other VR items usually use 4 options. For a 44-question VR batch, the current UCAT-style mix is:

- 16 True / False / Can't tell questions
- 8 detail or keyword retrieval questions
- 6 inference questions
- 5 author's opinion or tone questions
- 4 except / not supported questions
- 5 summary, title or structure questions

## Verbal Reasoning Tags

- Tags are only for internal filtering by skill, stimulus type, difficulty and timing burden.
- Add `true-false-cant-tell` for all 3-option TFC items.
- Add `detail-retrieval`, `inference-question`, `author-opinion`, `negative-except` or `summary-structure` to match the subtype.
- TFC and detail questions can be `easy` or `medium`; inference, author's opinion, negative and structure questions should trend `medium` or `hard`.
- Add `quick` only when the decisive line is easy to locate.

## Verbal Reasoning Design Notes

- The correct answer must be anchored in the passage only, not outside knowledge.
- "Can't tell" means the passage leaves the statement unproven either way, even if the statement is plausible.
- Do not make distractors hinge on tiny wording traps unless that is the intended UCAT-style skill.
- Passage sets should rotate domains so the bank does not become mostly medicine, education or local-government policy.

## Decision Making Batch Style

The Decision Making mock-style order should be:

1. Syllogisms
2. Logical puzzles
3. Strongest argument questions
4. Yes/No questions using data or a paragraph
5. Venn diagram / set questions
6. Probability questions

For a 35-question DM batch, the current UCAT-style mix is:

- 6 syllogisms
- 6 logical puzzles
- 5 strongest argument questions
- 5 Yes/No paragraph or data questions
- 8 Venn/set questions
- 5 probability questions

## Decision Making Tags

- Tags are only for internal filtering by skill, stimulus type, difficulty and timing burden.
- Logical puzzles should generally be tagged `hard` and `time-consuming`.
- Syllogisms with 3 or fewer pieces of information are usually `easy`; if they require several linked sets, either/or rules, or more than 3 premises, tag them `hard` and `time-consuming`.
- Yes/No data or maths items are often `easy` but `time-consuming`.
- Strongest argument questions should usually be `easy` and `quick`.
- Venn/set questions should range across `easy`, `medium`, and `hard`. Directly reading a filled region can be `easy`; counting several overlaps or reconstructing missing regions is usually `medium` or `hard` and may be `time-consuming`.
- Probability questions are generally `easy`, unless they involve conditional probability, multiple stages without replacement, or confusing comparison language.

## Decision Making Design Notes

- Syllogisms should test must-follow logic. Do not let real-world meaning do the work.
- Syllogism interface style should often be drag-category: several conclusions on the left, blank drop targets, and category tiles `Yes` and `No`. Use 5 conclusions where possible. `Yes` means the conclusion must follow; `No` means it does not have to follow.
- Logical puzzles should have a compact rule set and one clean answer. Check for alternative valid arrangements before committing.
- Strongest argument options should include one relevant, balanced answer and three weak distractors: irrelevant, overgeneralised, unsupported, or missing the core issue.
- Yes/No paragraph or data questions should usually show 5 conclusions and the same `Yes` / `No` drag-category feel or the app's equivalent yes/no response controls. Include a mix of directly stated facts, unsupported causal claims, reversals, and small calculations.
- Do not confuse DM Yes/No drag-category questions with SJT four-option rating questions. The MedEntry-style layout with conclusion tiles and `Yes` / `No` target boxes is for DM syllogisms and DM conclusion questions.
- Venn/set questions should use exact-region wording in the stimulus when numbers are already filled in.
- Probability questions should be calculator-light where possible and should have distractors that match common mistakes.

## Quantitative Reasoning Batch Style

QR should be set-based. A stimulus is usually one table, chart or compact text data set followed by 4 questions, sometimes 5 if a future mock needs a longer set. Within each set, order questions as:

1. Easy direct read, simple percentage, total or ratio.
2. Easy-to-medium calculation using one extra step.
3. Medium multi-step calculation, often requiring a percentage, rate, average, reverse percentage or unit conversion.
4. Hard calculation that combines several operations, is calculator-heavy, or is likely to be time-consuming under QR timing.

For a 100-question QR batch, the current UCAT-style mix is:

- 25 sets of 4 questions
- Predominantly table-based data displays, with some grouped bar, line chart and text-only data sets
- Regular coverage of percentages, finance, thresholds, ratios, rates, work-rate problems, averages, units, geometry, pricing, dosage, scaling and estimation-style calculator strategy

## Quantitative Reasoning Tags

- Tags are only for internal filtering by skill, stimulus type, difficulty and timing burden.
- Add `data-display` when a table, chart or visual is used.
- Add `text-stem` for compact text-only data sets.
- Add `set-based` when the question belongs to a shared stimulus set.
- Use `quick` mainly for direct reads or a single clean operation.
- Use `calculator-heavy` for decimal money, reverse percentage, repeated arithmetic, weighted totals or multi-row calculations.
- Use `time-consuming` for the final question in a set when it combines several operations or requires careful reconstruction.
- Difficulty progression inside a set should normally be `easy`, `easy` or `medium`, `medium`, then `hard`.

## Quantitative Reasoning Design Notes

- Do not copy or paraphrase screenshots. Use them only for pacing, set structure and difficulty feel.
- Prefer exact arithmetic and plausible distractors based on common errors: using the wrong row, using total instead of remainder, reversing a ratio, applying percentage change to the wrong base, or stopping one step early.
- Keep enough variety that QR does not become only percentages: rotate table interpretation, rate, ratio, reverse percentage, average, units and geometry.
- Always verify every answer numerically before committing the question.

## Situational Judgement Design Notes

- Use any third-party SJT examples only to learn the interface pattern: one shared scenario followed by several importance, appropriateness, grouping, or ordering tasks. Do not reuse their names, occupations, clinical settings, action wording, or distinctive conflicts.
- Tag every SJT question with `issueTags` such as `confidentiality`, `patient-safety`, `autonomy`, `capacity-consent`, `integrity`, `teamwork`, `communication`, `scope-of-practice`, `respect-dignity`, `beneficence`, `non-maleficence`, `justice`, `candour`, `escalation`, or `professional-boundaries`.
- Importance and appropriateness single-select SJT items award full marks for the exact answer and half marks for the adjacent answer on the same side of the scale: A/B or C/D.
- Drag-category SJT items can award partial credit by item. Drag-order SJT items are exact order only.
- SJT appropriateness-rating items must use this four-option scale:
  - A: A very appropriate thing to do
  - B: Appropriate, but not ideal
  - C: Inappropriate, but not awful
  - D: A very inappropriate thing to do
- SJT importance-rating items must use this four-option scale:
  - A: Very important
  - B: Important
  - C: Of minor importance
  - D: Not important at all
- Do not generate appropriateness-rating or importance-rating questions as drag/drop. They are single-select A-D rating items using the exact scales above.
- Separate SJT drag/drop items can exist, but they should be explicitly authored as drag tasks rather than rating items. For the current bank, prefer drag-order tasks that ask candidates to order 4 actions from most appropriate to least appropriate, or from first to last when sequencing is the tested skill.
- SJT drag-order items should reward professional prioritisation: immediate safety/confidentiality/consent first, then communication/escalation, then documentation/reflection where relevant.
- SJT most/least items should present 4 plausible actions and require one most appropriate and one least appropriate selection. Avoid making every non-best option absurd; include at least one partially reasonable distractor.

## Situational Judgement Batch Style

SJT should be scenario-based. A scenario often has 3-5 linked items. For a 44-question generated SJT batch, the current bank mix is:

- 24 importance or appropriateness rating items
- 8 drag-category items
- 6 drag-order items
- 6 most / least appropriate action items

## Situational Judgement Tags

- Tags are only for internal filtering by professional domain and interaction style.
- Use `sjt-importance` for four-option importance ratings and `sjt-appropriateness` for four-option appropriateness ratings.
- Use `sjt-drag-drop` for appropriate/inappropriate, important/unimportant or best/worst category sorting.
- Use `sjt-ordering` for ranking actions into the best order.
- Use communication, integrity and ordering subtypes when they are the clearer learner-facing weakness label than the raw interface pattern.
