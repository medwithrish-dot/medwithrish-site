# Interview AI setup

Updated 12 October 2026. The application now uses OpenAI for both feedback and generated probes. The previous Gemini free-tier configuration is obsolete and is not read by either generation path.

## Server configuration

```dotenv
OPENAI_API_KEY=your-server-only-project-key
INTERVIEW_OPENAI_MODEL=gpt-6-luna
INTERVIEW_AI_MAX_CONCURRENT=20
```

The API key and model are configured locally. Hosting needs its own environment variables; pushing Git does not transfer `.env.local`. GPT API calls use the project's paid quota. Set project usage alerts and provider limits; there is no free-only request option or automatic provider/model retry. Credentials stay server-side. Requests use strict JSON Schema, bounded output, deadlines and `store: false`. See [official OpenAI documentation](https://developers.openai.com/api/docs/guides/structured-outputs).

## Automatic probing

Probing defaults to on only for the Ethical dilemma stations (equality/diversity and disability). The confidentiality Scenario station and all panel discussions have probing disabled, even when a panel includes ethics questions. The checkbox in setup and the interview remembers the choice on this device. After the candidate confirms an answer is complete, the interviewer asks one brief answer-aware probe and waits for the answer. It then continues to the next main question. A probe is never recursively probed. There are at most three probes per station, at least 20 words are required, and new probes stop in the final 45 seconds. The server enforces the cap independently of the browser, including for circuits with up to eight main questions.

Each original answer reserves a durable bit before generation. Saved probes are reused. Concurrent requests and retries cannot generate additional probes for that answer. Generation is limited to 384 output tokens and a 12-second provider deadline. A provider outage uses a labelled local practice prompt without a second model request.

## Scoring v2

The former logarithmic conversion inflated an average raw score of 60 to around 80%. New reports display the equally weighted rubric average directly, capped at 99. Question-specific authored marking guidance, stimulus facts and valid alternative reasoning remain in the GPT context. The prompt uses fair evidence anchors: a good, specific answer can earn 75-84 despite minor omissions, while generic answers and unsupported or unsafe reasoning remain low. It does not apply a blanket score boost and explicitly checks unsafe decisions, unsupported claims, ethics trade-offs and contradictory score reasons. Typed and spoken answers use the same criteria; accent, disability and filler words are not scoring inputs.

Run `supabase/medicforest_interview_scoring_v2.sql` on existing installations before deploying this version. It updates installed leaderboard, dashboard and group readers without deleting reports or weakening name moderation/permissions. Old reports retain their saved score and rubric version. V1 and v2 are not ranked together. Fresh install scripts already use v2.

This is prompt calibration, not fine-tuning or an admissions prediction. New reports include a server-calculated practice pass/fail decision; see [the practice standard and validation results](interview-practice-pass-fail.md). Run `node scripts/evaluate-interview-feedback.mjs --live --cases=generic,unsafe,motivation-good,motivation-strong` for a four-request calibration check. Omit `--cases` for the full synthetic set; `--repeat=2` repeats the chosen cases twice. These are paid GPT requests. Add human-reviewed examples for other station types before treating the scoring as validated.

## Transcript interpretation, feedback and rewrites

One strict structured response includes the score, concise student-friendly feedback, a transcription-warning flag and one plain-text rewrite per submitted answer. Obvious speech-recognition errors are interpreted before marking, without inventing missing evidence or changing the student's position. Substantial repairs or unclear passages trigger a separate warning; transcript quality does not itself reduce the mark. Original saved transcripts remain available.

Rewrites preserve useful wording and add reasoning where possible. Missing personal evidence uses explicit placeholders, never invented experiences. "Show rewritten version" opens by default with a thicker green border and compares the original and rewritten words locally: preserved words are black, added/replaced words are green and underlined. Opening it makes no request. Old reports without rewrites still work and are not automatically regenerated.

New AI reports also store covered mark scheme point IDs, validated against server-owned question guidance. Question bank review automatically selects these points when feedback completes or the saved report reopens; manual changes remain possible. Mistakes are excluded from coverage. The AI feedback shortcut beside Retry uses the same generation and account allowance checks and scrolls to the completed report. Coaching tone follows the practice score: excellent at 80%+, good at 70%+, okay at 60%+, and supportive improvement advice below 60%. These bands guide wording without adding labels or changing marks. Older reports without coverage leave manual ticks unchanged.

The dedicated `?station=why-medicine` challenge lobby is fixed to one Background to medicine station, the exact prompt "Why medicine?", and 180 seconds. The free-mode session route enforces this format, including Premium retries that consume paid practice rather than another free trial. Preview uses the same prompt; university and custom circuits retain their normal question selection and timings. The short prompt maps to the authored motivation mark scheme. Its dedicated `public/audio/{female,male}/why-medicine.mp3` files were generated with Google Chirp 3 HD Aoede and Charon and take precedence over the marking ID's longer bank recording.

Output is limited to 180 words per answer and 900 rewrite words across a station, with brief feedback and rubric reasons. The token ceiling scales with the number of answers (2,340 for one answer, at most 4,500 for a station); the provider deadline is 35 seconds. The existing model, no-retry policy and saved-report reuse remain in place. Rewrites necessarily add output tokens but require no separate correction, rewriting or highlighting call. Strict response formatting follows [official OpenAI guidance](https://developers.openai.com/api/docs/guides/structured-outputs).

Panel university sessions select seeded, varied routes through related motivation, communication, teamwork, healthcare and ethical/scenario questions. A 15-minute discussion has six main questions; 20 minutes has eight. Images and stimulus tasks are excluded. Both the server and client prohibit automatic panel probes; local topic transitions provide flow without an AI planning request.

The four-case live check on 12 October returned 77.6 for the good motivation example, 81.8 for the stronger example, 32 for a generic answer and 26 for an unsafe answer. This is a small synthetic check, not a guarantee about all questions or applicants.

## Abuse and cost controls

Vercel BotID Basic is initialized in `instrumentation-client.ts`, with matching rewrites from `withBotId`. Interview starts, probes, feedback requests and generated speech require a human classification on the server. Bots, including verified bots, are rejected; verification errors fail closed before generation. [Vercel setup](https://vercel.com/docs/botid/get-started). Local development bypasses classification as documented by Vercel; production must be deployed on Vercel with BotID functioning. Test an actual signed-in browser in production and confirm a scripted request is rejected. Do not create a WAF bypass rule for these routes.

Database account quotas bound starts to free 2/day and 30/30 days, premium 20/day and 300/30 days (the free trial has its own lifetime allowance). Grading is locked per attempt and capped at three tries; completed feedback is reused. Requests have body/context limits, origin checks, IP throttling and instance concurrency/cooldown controls. Application rate limiting is instance-local; configure hosting WAF rate limits for aggregate IP abuse and Supabase signup CAPTCHA/email confirmation for account farming. Bot classification reduces automation but cannot guarantee every caller is human. Provider project limits are still necessary for aggregate spend control.

## Google Chirp speech for generated probes

Fixed questions, transitions and the “Done? Say yes or no.” confirmation are generated from `scripts/questions.csv` into `public/audio/{female,male}`. Run only the missing operational prompts with:

```powershell
python scripts/generate_all.py --ids 643 644 645 646 647 648 649 650 651 652 653 654
```

The script skips existing files, validates contiguous CSV IDs, retries transient synthesis failures and supports `--dry-run`, `--force`, `--limit` and `--ids`. Local generation uses Google Application Default Credentials (ADC).

Generated answer-aware probes cannot be pre-recorded. `GET /api/interviews/speech` therefore validates the signed-in user, active attempt and generated question before requesting Chirp 3 HD audio. The browser caches that private response and falls back to its built-in voice if the endpoint is disabled or unavailable. Enable it deliberately-Cloud Text-to-Speech requires a billing-enabled project even when usage is within its free allowance:

```dotenv
GOOGLE_CLOUD_PROJECT=your-project-id
INTERVIEW_GOOGLE_TTS_ENABLED=true
```

For local development, install the Google Cloud CLI, run `gcloud auth application-default login`, enable `texttospeech.googleapis.com`, restart Next.js and test an eligible 20+ word answer. On a non-Google host, add the service account JSON as the server-only `GOOGLE_CLOUD_SERVICE_ACCOUNT_JSON` environment variable. Never prefix it with `NEXT_PUBLIC_` or commit the key. On Google Cloud hosting, attach a service account and let ADC discover it instead. Leave `INTERVIEW_GOOGLE_TTS_ENABLED` unset until billing alerts/quotas are configured. Google currently documents a 5,000-byte request content limit and a separate Chirp 3 quota; this route additionally limits probes to 500 characters. [Cloud TTS setup](https://docs.cloud.google.com/text-to-speech/docs/get-started), [authentication](https://docs.cloud.google.com/text-to-speech/docs/authentication), [Chirp 3 HD](https://docs.cloud.google.com/text-to-speech/docs/chirp3-hd), [quotas](https://docs.cloud.google.com/text-to-speech/quotas), [pricing](https://cloud.google.com/text-to-speech/pricing)
