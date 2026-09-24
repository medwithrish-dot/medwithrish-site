# Interview stimuli: final review

Reviewed 19 September 2026. All 27 saved PNGs were visually inspected. Seventeen required editing; ten were already suitable and left unchanged. Edits used the built-in imagegen tool, not the API/CLI.

## Current requirements

- Images contain evidence/scenario facts and descriptive titles only: no embedded candidate questions, ranking prompts or answer instructions.
- Questions and assessment instructions belong in separate app text; see [candidate tasks](interview-stimulus-candidate-tasks.txt).
- Any depicted people are male. Image 27's two standing women were replaced with men; their roles and the collapsed man's position were preserved. Other images contain no women; generic person icons were retained.
- Preserve the distinct visual styles and original figures. All datasets and scenarios are fictional, not clinical guidance.
- Images 24 and 27 now have opaque, high-contrast backgrounds. Their earlier unreadable variants were rejected.

## Asset index

| No. | Image | Review outcome |
| --- | --- | --- |
| 01 | [GP appointment waits](../public/medicforest/interview-stimuli/iq-18-001-data-stations.png) | Reviewed; unchanged |
| 02 | [Smoking cessation results](../public/medicforest/interview-stimuli/iq-18-002-data-stations.png) | Reviewed; unchanged |
| 03 | [Exercise and wellbeing](../public/medicforest/interview-stimuli/iq-18-003-data-stations.png) | Reviewed; unchanged |
| 04 | [Community diabetes programmes](../public/medicforest/interview-stimuli/iq-18-004-data-stations.png) | Edited and rechecked |
| 05 | [Ward admissions and discharge delays](../public/medicforest/interview-stimuli/iq-18-005-data-stations.png) | Reviewed; unchanged |
| 06 | [Patient satisfaction briefing](../public/medicforest/interview-stimuli/iq-18-006-graphs-and-trends.png) | Edited and rechecked |
| 07 | [Childhood vaccination uptake](../public/medicforest/interview-stimuli/iq-18-007-graphs-and-trends.png) | Reviewed; unchanged |
| 08 | [Sleep and exam scores](../public/medicforest/interview-stimuli/iq-18-008-graphs-and-trends.png) | Reviewed; unchanged |
| 09 | [Heart-event risk](../public/medicforest/interview-stimuli/iq-18-009-data-interpretation.png) | Reviewed; unchanged |
| 10 | [Physiotherapy results](../public/medicforest/interview-stimuli/iq-18-010-data-interpretation.png) | Reviewed; unchanged |
| 11 | [Energy drinks and concentration](../public/medicforest/interview-stimuli/iq-18-011-critical-appraisal.png) | Reviewed; unchanged |
| 12 | [Reminder texts and appointments](../public/medicforest/interview-stimuli/iq-18-012-critical-appraisal.png) | Edited and rechecked |
| 13 | [Asthma-app evaluation](../public/medicforest/interview-stimuli/iq-18-013-article-analysis.png) | Reviewed; unchanged |
| 14 | [Berry news and study](../public/medicforest/interview-stimuli/iq-18-014-article-analysis.png) | Edited and rechecked |
| 15 | [Virtual reality and anatomy learning](../public/medicforest/interview-stimuli/iq-18-015-article-analysis.png) | Edited and rechecked |
| 16 | [Healthcare improvement proposals](../public/medicforest/interview-stimuli/iq-19-001-group-discussion.png) | Edited and rechecked |
| 17 | [NHS improvement budget](../public/medicforest/interview-stimuli/iq-19-002-group-tasks.png) | Edited and rechecked |
| 18 | [Overnight on the mountain](../public/medicforest/interview-stimuli/iq-19-003-group-tasks.png) | Edited and rechecked |
| 19 | [Four patient presentations](../public/medicforest/interview-stimuli/iq-19-008-group-tasks.png) | Edited and rechecked |
| 20 | [Assessment queue](../public/medicforest/interview-stimuli/iq-20-001-prioritisation-stations.png) | Edited and rechecked |
| 21 | [Five competing demands](../public/medicforest/interview-stimuli/iq-20-002-prioritisation-stations.png) | Edited and rechecked |
| 22 | [Team inbox](../public/medicforest/interview-stimuli/iq-20-003-prioritisation-stations.png) | Edited and rechecked |
| 23 | [Health-service funding proposals](../public/medicforest/interview-stimuli/iq-20-004-prioritisation-stations.png) | Edited and rechecked |
| 24 | [Public-health investment estimates](../public/medicforest/interview-stimuli/iq-20-005-prioritisation-stations.png) | Edited and rechecked |
| 25 | [A difficult Thursday](../public/medicforest/interview-stimuli/iq-20-007-prioritisation-stations.png) | Edited and rechecked |
| 26 | [Four patient-safety concerns](../public/medicforest/interview-stimuli/iq-20-008-prioritisation-stations.png) | Edited and rechecked |
| 27 | [Several events happen at once](../public/medicforest/interview-stimuli/iq-20-009-prioritisation-stations.png) | Edited and rechecked |

## Checks and scope

Compared edited output against the input for figures, labels, dates, scenario details and remaining question/instruction text. The deliberately misleading headline/axis in image 6 and fictional newspaper claim in image 14 remain because they are the evidence being appraised, not answer hints. Survey wording in image 6 and question-style research titles were converted to factual descriptions. Requests in image 22 were rephrased as reported facts without losing deadlines. Budget and carrying-capacity constraints remain as facts.

All 27 files decode as landscape PNGs. This is asset preparation only: no database changes, question-bank wiring or completed markschemes were included in this pass. A subject-expert review and separate markscheme are still needed before use with candidates.

## Prompt precedence

[Final cleanup prompts](interview-stimulus-image-prompts-cleanup-final.txt) record the exact edits and supersede conflicting wording in earlier prompt files. Earlier prompt documents are historical generation references, not instructions to restore embedded questions. All selected outputs are saved in public/medicforest/interview-stimuli; generated source files remain outside the repo in Codex's generated_images directory. Prior tracked assets remain recoverable through Git history.
