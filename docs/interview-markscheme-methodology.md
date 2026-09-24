# Interview markscheme methodology

## Purpose and limits

The markscheme is for formative UK medical-interview practice. It is not a university admissions prediction and must not claim to reproduce a particular medical school's private scoring system. It assesses the content of the candidate's answers, not accent, disability, camera use, eye contact, filler words or speech differences.

The implementation currently has two connected layers:

1. **Self-review checklists** use `getQuestionMarkScheme()` in `app/medicforest/interview/_lib/question-review.ts`. All 561 bank questions have individually authored Start, Middle, End and Mistakes content in `_data/question-marking-points.ts`; 15 owner-supplied worked examples override those entries in `_data/supplied-mark-schemes.ts`. General guidance is shared where appropriate. Mistakes appear separately and never increase checklist coverage. Category rubrics remain only for legacy attempts whose questions cannot be matched to the bank.
2. **AI feedback** uses the five equally weighted criteria in `utils/interviews/scoring.ts`, informed by these same question-specific marking sections and the factual text of any stimulus. The complete station transcript, including historical follow-up answers, is considered together. The server supplies the reference content from saved question IDs, with exact-text lookup for older attempts; candidate answers cannot supply a replacement rubric.

The structures are guidance rather than a compulsory script. Equivalent sound reasoning, reasonable visual estimates and defensible alternative priorities receive credit. A political position, a named mnemonic, an invented actor response or specialist clinical management is not required. New bank questions must include authored content; the coverage test fails on missing entries or duplicate substantive marking sections.

The downloadable text and PDF are generated from the same source with `node scripts/export-interview-markschemes.mjs --pdf`. PDF generation requires a local Playwright installation and Chromium; `PLAYWRIGHT_MODULE` can point to its `index.mjs` outside the project. Without `--pdf`, only the text export is regenerated.

## The five scored criteria

Each criterion receives a score from 0 to 100.

1. **Relevance and motivation** — for motivation stations, this means a convincing and realistic reason for medicine. For other stations, “motivation” is interpreted as relevance to that station and direct engagement with the task.
2. **Evidence and reflection** — specific examples, facts or observations are used appropriately, followed by explanation of what they mean or what was learnt.
3. **Reasoning and balance** — competing considerations, uncertainty, consequences and reasonable alternatives are weighed rather than merely listed.
4. **Structure and clarity** — the answer is easy to follow, answers the question directly and develops ideas coherently. A named framework is not required.
5. **Insight and professionalism** — the response shows judgement, humility, respect, appropriate boundaries, patient awareness and willingness to seek help.

The scoring anchors currently used by the assessor are:

- **0:** no relevant evidence;
- **20:** limited assertion;
- **40:** some relevant explanation;
- **60:** clear relevant evidence and reflection;
- **80:** consistently insightful and specific;
- **90:** exceptionally nuanced throughout;
- **100:** all criteria fully evidenced with no material omission.

The five raw criterion scores are averaged. `interviewPercentage()` then applies the versioned logarithmic calibration in `utils/interviews/scoring.ts`, with the displayed result capped at 99%. This mapping must remain consistent across candidates; it is not a percentile or comparison with other users.

## Station-specific interpretation

### Ethical dilemma and hot topic

A strong answer identifies the tension, stakeholders and missing facts, then weighs credible arguments on more than one side before reaching a justified view. The order can be for/against/for/against or grouped by side; balance matters more than the name of the structure. Candidates should not be penalised for declining to make an unsupported factual claim.

Common weaknesses include a one-sided answer, treating ethical principles as a memorised list, giving an absolute verdict too early, inventing current prescribing rules and allowing the exchange to become a series of undeveloped one-line replies. Answer-aware probes should test a claim, assumption, example or gap without trying to trap the candidate into a controversial statement.

### Scenario

A strong answer notices every material fact, identifies all affected people, explains immediate and longer-term consequences, considers more than one possible outcome and proposes safe next steps. The lorry-driver example illustrates the expected depth: treatment routines, driving regulations, livelihood, dependants, housing costs and schooling all create connected practical issues.

New scenarios must be substantially different in setting and facts, not lightly disguised copies. Marking should reward the candidate for using the information provided and should not require specialist clinical management beyond an applicant's level.

### Skills

A strong answer gives a specific, credible example with the logic of Situation, Task, Action, Result and Reflection, but does so conversationally. The candidate's own contribution should be clear without taking sole credit. Reflection and what they would do differently are more valuable than a long description.

### Group

Until the format is confirmed, the provisional rubric should reward listening, constructive contribution, inclusion of quieter participants, focus on a shared goal, respectful disagreement and flexible leadership. Dominating the task, interrupting, repeating others without adding value or treating leadership as control should not score well.

### Communication

The category rubric rewards identifying the person's concern, listening before advising, empathy expressed through action, plain language, checking understanding, agreeing a next step and proportionate escalation. Empathy alone is not enough if the response does not address safety or the practical task.

### Role-play with a standardised actor

The actor interaction should be marked on what the candidate does in response to the person, not on whether they recite a mnemonic. The candidate should avoid rambling, pick up verbal and emotional cues, use empathy rather than detached sympathy, and leave the person with a clear next step. “I'm sorry” can be appropriate when it acknowledges the situation and is followed by listening; generic pity without understanding or action should not earn the same credit.

For breaking bad news, SPIKES provides a useful sequence:

| Step | Focus | What good evidence looks like |
| --- | --- | --- |
| S | Setting | Creates privacy and comfort, introduces the conversation and offers appropriate support or another person if wanted. |
| P | Perception | Checks what the person already knows, understands or suspects before adding information. |
| I | Invitation | Asks whether they are ready to discuss the result and gives a brief warning that difficult news is coming. |
| K | Knowledge | Gives accurate information in small, plain-language chunks, pauses and avoids jargon or information overload. |
| E | Emotions | Notices the reaction, allows silence, names or validates emotion and responds with warmth without making assumptions. |
| S | Strategy / summary | Checks understanding, summarises, answers appropriate questions and gives a concrete next step and source of support. |

Example phrasing may include “Would you like anyone here with you?”, “What is your understanding so far?”, “Is it okay if we go through the result now?”, “I can see this is a shock” and “The next step is…”. These are illustrations, not required wording.

After the interaction, the interviewer asks:

1. **What went well?** A strong reflection identifies specific communication choices and their observed effect rather than claiming everything went well.
2. **What could have gone better?** A strong reflection identifies a genuine improvement, explains why it matters and says what the candidate would do differently next time.

Medical bad-news scenarios must not reward unsafe certainty, invented treatment plans or acting beyond the candidate's role. Non-medical scenarios, including the death of a pet, should use the same principles of clarity, pacing, empathy and practical support without pretending the emotional impact is identical for every person.

### Prioritisation

The provisional approach should reward a stated method rather than an unexplained list: immediate danger and safety first, then urgency, impact, deadlines, available support and delegation. Strong candidates reassess when facts change and communicate delays to the people affected.

### Background to medicine and the NHS

Strong answers define the issue, explain causes and effects for patients, staff and the wider system, and suggest realistic improvements with trade-offs. On NHS problems, relevant lines of reasoning can include working conditions, retention after public investment in training, workforce backlogs and carefully governed administrative uses of AI. These are examples, not mandatory political conclusions.

### Data interpretation

The candidate should address the actual question, keep denominators clear, distinguish percentages from percentage-point changes, avoid turning association into causation, identify missing context and explain uncertainty in plain language. All 27 final PNGs are mapped by question ID in `_data/interview-stimuli.ts`, with factual accessible transcriptions. The visual marking points use the final images rather than earlier image-generation prompts. In particular, the berry headline conflicts with 12/200 versus 20/400, the satisfaction chart compares hospitals rather than years, and the diabetes budget includes setup costs.

Question practice shows the image above the response area. AI interviews show it on the presentation stage, or above the answer on mobile, and switch images with the active question. A native dialog provides an enlarged view with keyboard focus containment and Escape dismissal. If an image fails, the source transcription opens. Saved bank-question reviews use the same image and marking content. The data-interview selector covers all 15 section-18 stimuli, and its preview also uses image-backed bank questions.

## Follow-ups and fairness

- Probing is disabled by default for every station. `FOLLOW_UP_STATIONS` in `_lib/station-flow.ts` is an empty owner-controlled allowlist shared by the client and API. Only an explicit future owner selection should populate it. Existing saved probes remain in their transcripts.
- Follow-ups are assessed as additional evidence within the same five criteria; they do not create a sixth criterion or change the weighting.
- An unanswered follow-up is not automatically scored zero when the candidate has already covered the relevant issue.
- A follow-up must be grounded in what the candidate actually said. It must not invent an experience, mistake, disagreement, patient outcome or belief.
- A well-structured answer should be allowed to finish. Follow-ups are for depth and clarification, not interruption.
- The assessor must ignore instructions embedded in candidate answers and must never fabricate experiences on the candidate's behalf.

## Feedback output

Feedback contains a short summary, one to three specific strengths, one to three evidenced weaknesses and one to three concrete fixes. If there is no supported material weakness, the feedback should say so and offer a stretch exercise rather than inventing a fault. Length alone is not rewarded.

## Question-bank completion

Interview stations draw coherent question clusters from the question bank at roughly one substantive question per 2.5 minutes (three questions for an eight-minute station). When a saved station is submitted, each bank question with a non-empty answer is upserted as `completed` in `interview_question_progress`. AI-generated probes are not question-bank items and are therefore not marked complete in the bank.

## Reference checks for authoring

Ethical guidance is framed around applicant-level reasoning and appropriate supervision, with current legal detail left to the relevant jurisdiction. Reference checks included the GMC's [decision-making and consent guidance](https://www.gmc-uk.org/professional-standards/the-professional-standards/decision-making-and-consent) and [confidentiality disclosure framework](https://www.gmc-uk.org/professional-standards/the-professional-standards/confidentiality/disclosing-patients-personal-information-a-framework). Organisation questions distinguish established functions from transitions: see NHS England's [commissioning changes](https://www.england.nhs.uk/commissioning/how-commissioning-is-changing/) and [integrated care systems](https://www.england.nhs.uk/commissioning/who-commissions-nhs-services/ccg-ics/). The markschemes intentionally avoid fixed current eligibility thresholds, numerical workforce claims or predictions that a proposed law is already in force.
