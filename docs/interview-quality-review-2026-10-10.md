# Interview quality review — 10 October 2026

## Data questions and images

Visually checked all 27 PNGs against their paired questions, text alternatives and marking points, plus the three questions sharing the GP-wait graph in the data station. This includes all 15 section-18 data images and the 12 group/prioritisation images. Retained the images and existing bank prompts: their numbers, axes, budgets and fictional-study limitations support the requested tasks. Clarified the smoking-programme percentages using everyone enrolled, without treating missing outcomes as failures. Replaced jargon in the hypothesis/investigation and prioritisation guidance with concrete explanations. Corrected the satisfaction chart's text alternative to say “Interview with ward staff”. Refreshed the downloadable text and PDF markschemes, which previously contained older data prompts and guidance.

Following the owner's clarification, all 30 visual/data markschemes now lead with general skills or reasoning. Dataset and scenario details sit in brackets as examples. The checklist, downloaded guidance and AI marking instructions explain that these examples are not mandatory: another accurate example or equivalent reasoning can meet the point.

## Answer input and AI output

1. Candidates speak or type an answer for each displayed question. Spoken answers use the browser's British-English speech-recognition service. Interim words appear live; final words are appended to that question's answer. Permission, connection and browser support still affect recognition. No new cloud transcription provider has been added.
2. In the AI interview room, answers are saved locally and autosaved to the account. Ending a station flushes the current transcript and saves all answers before opening review. Ending a station does not itself request AI marking.
3. Automatic probes are enabled by default for ethics stations only, with a remembered opt-out. After an answer of at least 20 words is saved, a probe can use that answer and earlier answers as context. There must be at least 45 seconds left. Limits: one probe per main question, three per station. If generation is unavailable, a labelled guided practice question is used. Client and server both enforce the ethics restriction.
4. Selecting **Generate AI feedback** loads the saved attempt on the server and sends all question-labelled answers, including probes, together in one assessment request. Trusted guidance supplies the relevant marking points and image facts. Answers are treated as untrusted candidate content. The AI receives text, not camera footage, microphone recordings or private notes.
5. Output is one overall station assessment: a summary, strengths, weaknesses, practical fixes and five scored criteria. Structured output is validated before the score and report are saved. It does not provide a separate numerical mark for every question. Failed generation leaves the saved answers available for retry.

The question bank's individual practice view is separate: local audio replay may be available, but the AI station assessor receives transcripts only. Individual question practice currently offers self-marking rather than the station AI marking workflow.

## Speech and mobile fixes

- Listening re-evaluates after room entry, including when interviewer read-aloud is off.
- Final answer words survive the completion lock. Late yes/no confirmation words are kept out of the scored answer.
- Question-bank recognition restarts after a normal pause or `no-speech`; changing to text or leaving cancels restarts. Permission/network failures show plain-language guidance.
- At 320px and 390px, checked the home page, interview landing/lobby, bank and interview room. No horizontal overflow or client errors occurred in these checks. Browser/device services were simulated for repeatable microphone tests; real hardware recognition accuracy was not measured.
- Ethics settings use a compact room layout. Small-screen image headings stack, and opened images offer a full-size view for reading dense tables. Text alternatives remain available.

## Audio

Decoded and measured all 1,314 fixed recordings. The original female q207 (teenager/pregnancy), female q297 and male q437 had substantial clipping and spikes. Regenerated those and eight additional spike candidates using the existing Google voices. A second generation with natural hyphen spacing fixed q297's repeatable defective render. Applied light compression/peak limiting to the regenerated male q089 and q343, which still had sharp volume changes.

Final scan: 1,314 files decoded, zero clipping/spike flags. This is a waveform check, not a guarantee against every pronunciation or synthesis issue.

Repeatable tooling (Google credentials are required for regeneration):

```powershell
python scripts/audit-interview-audio.py --output audio-audit.json
node scripts/regenerate-interview-audio.mjs audio-audit.json
python scripts/audit-interview-audio.py --tame-spikes --output audio-verified.json
```

The Python scan needs `numpy` and `imageio-ffmpeg`. It flags clipping above 0.1% of samples and a 20ms RMS peak more than six times median voiced RMS. Regenerate distorted speech before using `--tame-spikes`.

## Validation

303 unit tests passed, plus 29 interview-platform and 14 dashboard PostgreSQL checks and the profile-security test. Targeted speech, room, follow-up, marking and audio regression tests also passed. Production build, TypeScript and lint passed. Mobile browser checks used 320px and 390px widths and simulated device services; no production account data was changed by testing.
