# Practice pass/fail

Existing classified reports are evaluated against the current 75-average cutoff when viewed or downloaded, without another AI call; their saved rubric marks remain unchanged.

The student sees **Practice pass** or **Practice fail - needs improvement**, the numerical score, the criterion minimums they missed, and the existing strengths, weaknesses and fixes. Results close to a cutoff are flagged. The downloaded report includes the same decision. Saved reports without a decision are labelled as older reports; previews do not classify the student's answer.

## Fixed decision rule

- Mean of the five raw rubric marks must be at least 75/100.
- Reasoning and balance must be at least 50/100.
- Insight and professionalism must be at least 50/100.
- Each other criterion must be at least 40/100.

All conditions must hold. An 86 average with professionalism 30 fails. The decision is computed by server-owned code after rubric validation, not accepted from GPT or candidate text. The unrounded average determines the decision. New GPT responses require integer criterion marks, so the average is exact to one decimal place and display rounding cannot turn a fail into a pass. The score remains capped at 99; the numerical v2 scale has not changed.

Borderline means the smallest margin to any required cutoff is within five marks of zero. This applies to either a narrow pass or narrow fail. The result advises reviewing the evidence and comparing another attempt, without making another AI request. Decision calculation and display add no provider calls to student feedback.

This is MedicForest's formative practice standard, version `practice-pass-v2`. It is a product criterion referenced to the practice rubric, not an empirically established university cutoff, percentile, probability of acceptance or official examiner verdict. Students should use it to identify gaps and practise improvements. Medical schools set their own standards and may assess qualities this transcript cannot show.

## Marking calibration

Question-specific authored guidance and image transcriptions remain in the context. The prompt interprets evidence appropriately: personal examples and learning for reflection tasks; scenario facts, justified implications and uncertainty for hypothetical ethics/data tasks. A good hypothetical answer does not need an invented personal anecdote. The model credits an explicit, reasoned correction in a follow-up and checks whether a safety problem remains unresolved. Length, confidence, accent and disability are not scoring evidence.

The following benchmark used the earlier 60-average practice cutoff and does not validate the new 75-average cutoff. On 8 October 2026, 11 synthetic cases were run twice through the configured `gpt-6-luna` model. The predeclared expected pass/fail classifications matched in all 22 calls, and each case kept the same classification on repetition:

| Case | Expected | Run 1 | Run 2 |
| --- | --- | ---: | ---: |
| Generic ethics slogans | Fail | 19 | 19 |
| Unjustified patient disclosure | Fail | 17 | 19 |
| Strong confidentiality reasoning | Pass | 73.4 | 76 |
| Prompt manipulation | Fail | 5 | 0 |
| Specific, reflective motivation | Pass | 71.2 | 66 |
| Generic motivation | Fail | 24 | 28.8 |
| Teamwork with personal contribution and reflection | Pass | 65.4 | 67.6 |
| Defensible resource-allocation alternative | Pass | 70.2 | 72.2 |
| Correct denominators and cautious data interpretation | Pass | 72 | 71.4 |
| Incorrect denominators and causal certainty | Fail | 17 | 22 |
| Reasoned correction of an unsafe first answer | Pass | 69.2 | 67.6 |

These are developer-authored synthetic labels, not blinded marks from independent medical interviewers. Scores varied by up to 5.2 points between repeats. Clear-case agreement supports using the feature as practice guidance; it does not establish that every borderline student is classified correctly. No conclusion about admissions prediction or population accuracy can be drawn from 11 cases.

Run `node scripts/evaluate-interview-feedback.mjs --live --repeat=2` deliberately to run the updated checks against the current standard (22 paid GPT calls); the historical results above used the old cutoff. The default command makes no API calls. Unit tests separately check cutoff boundaries, weak-criterion failures despite a high mean, ignored provider decision claims, borderline wording, historical reports and preview behavior. See [official OpenAI documentation on evals](https://developers.openai.com/api/docs/guides/evals).

Before claiming examiner-level validity, obtain independently marked examples covering all station types and near-cutoff answers, agree intended pass labels with qualified reviewers, measure false passes and false fails on a held-out set, and repeat under the exact deployed model. That independent validation has not been completed.
