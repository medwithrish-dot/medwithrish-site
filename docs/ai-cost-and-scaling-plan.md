AI operating and cost plan · 8 September 2026

The practical launch approach is inexpensive text grading, polished question recordings served from a cache, and browser recording/playback. Add dependable paid transcription where needed. Choose the marking model by testing it against human-marked answers. Provider brands alone cannot establish which model gives the most useful, consistent interview feedback.

This document is a proposal and cost model. The accompanying practice-pathway work changes the learning plan; it does not switch providers, add paid speech, install a queue, change allowances or establish production capacity. The figures are estimates, not measured bills. The [interactive calculator](ai-cost-calculator.html) lets you change usage and prices.

**What currently uses AI**

| Feature | Current implementation | Per-use model charge? |
| --- | --- | --- |
| AI interview feedback | Server-side Gemini `gemini-3.5-flash-lite`, configurable through an environment variable; one assessment after a station | Yes |
| UCAT diagnostic report | Server-side `claude-haiku-4-5-20251001`; can combine sections from a saved mock | Yes |
| Interview questions and follow-ups | A predefined catalogue; the call is not presently a live conversational LLM | No |
| Interview question-bank marking | Manual checklist; the AI Feedback button is currently disabled | No |
| Guides and seven-stage learning pathway | Curated content and deterministic progression | No |
| Recording, playback, mic meter and speech hints | Browser APIs and local heuristics | No paid model integration |
| Speech recognition/read-aloud | Browser Web Speech APIs | No API bill to the platform; availability and quality depend on the browser/service |
| UCAT attention tracking | MediaPipe running locally on the device | No cloud inference charge |
| Rishbot sample question | Static API response | No |
| Personal statement service | PDF upload, checkout and existing service workflow | No AI assessment integration found |

The current interview allowances are **free: 2 starts per rolling day and 30 per rolling 30 days; premium: 20/day and 300/30 days**. These count starts, including abandoned attempts. Each mock station counts separately. UCAT is separate: one lifetime free diagnostic credit, or one premium credit per 24 hours. A seven-station mock therefore consumes seven interview attempts, not one. These are not a single shared AI-credit wallet.

**Model choice and the price of one credit**

Define a product credit as one completed feedback report. The provider's tokens measure text volume and are a different unit. For an eight-minute station, use an illustrative budget of 3,000 input tokens and 1,000 total billable output tokens. A short UCAT report uses 4,000 input and 1,200 output in this model. Include reasoning tokens in the output budget; a short visible answer alone does not guarantee a small bill.

| Candidate | USD per million input/output tokens | One station report | One diagnostic report |
| --- | ---: | ---: | ---: |
| Gemini 2.5 Flash-Lite | $0.10 / $0.40 | $0.00070 | $0.00088 |
| OpenAI GPT-5.6 Luna | $0.20 / $1.20 | $0.00180 | $0.00224 |
| Gemini 3.5 Flash-Lite (current interview model) | $0.30 / $2.50 | $0.00340 | $0.00420 |
| Claude Haiku 4.5 (current diagnostic model) | $1.00 / $5.00 | $0.00800 | $0.01000 |

These are ordinary uncached text rates, without tools, premium processing or batch discounts. Official sources: [Google pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=en), [OpenAI Luna pricing and capabilities](https://developers.openai.com/api/docs/models/gpt-5.6-luna), [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing). Recheck [Google model retirement dates](https://ai.google.dev/gemini-api/docs/deprecations) before adopting an older model.

For launch, retain Gemini 3.5 Flash-Lite for interviews and the existing Haiku diagnostic integration while collecting reliable quality and cost evidence. Compare them with Luna and the cheaper Gemini 2.5 Flash-Lite on 50–100 anonymised, human-marked answers, including weak answers, strong answers, incomplete answers, prompt manipulation and imperfect transcripts. Compare rubric consistency, fabricated feedback, evidence use, latency and actual bill. Adopt a cheaper candidate if it meets the quality bar. An occasional stronger review should be a separately bounded feature. General flagship reasoning is unnecessary for displaying questions, calculating a score, searching the library or choosing the next learning task.

The current Gemini report is about **0.26p** at the planning assumption $1 = £0.75. With a 20% retry/usage reserve, allow roughly **0.31p** for text grading. Adding six minutes of final transcription at the published OpenAI mini-transcribe estimate of $0.003/min gives about **1.93p** for the station, assuming the examiner's audio is already cached. A budget of **1p per text-only credit or 2–5p per spoken trial** is a useful initial allowance, before shared hosting. A free UCAT diagnostic currently costs about 0.75p before the reserve. [OpenAI transcription pricing](https://developers.openai.com/api/docs/pricing)

Actual cost formula: `(input tokens × input rate + billable output tokens × output rate) / 1,000,000`. Retry attempts can be billed even when the product does not produce a usable report. The current interview output cap is 1,800 tokens and the UCAT cap is 1,200; these examples are averages, not maximum-cost guarantees. Log actual usage rather than estimating from transcript characters indefinitely.

**Monthly user costs**

The following uses the existing Gemini interview and Haiku diagnostic models. Each station contains six minutes of candidate speech. The improved-voice scenario adds one final transcription pass; it does not run a conversational voice model throughout the interview. Stock question audio is generated once and cached. GBP conversions use **$1 = £0.75 as a budgeting assumption, not a current exchange-rate quote**. The speech column includes a 20% usage/retry reserve.

| Monthly usage per person | Current text-model spend, USD | With final transcription and reserve, GBP |
| --- | ---: | ---: |
| One free station | $0.0034 | £0.019 |
| Active learner: 20 stations + 8 diagnostics | $0.148 | £0.457 |
| Heavy learner: 60 stations + 30 diagnostics | $0.504 | £1.426 |
| Full existing free allowance: 30 stations + 1 diagnostic | $0.112 | £0.587 |
| Full existing premium allowance: 300 stations + 30 diagnostics | $1.320 | £6.048 |

The last two rows assume every permitted start produces a report, six minutes of speech, and no previous use of the free lifetime UCAT credit. Daily limits must also be respected. Ordinary question-bank practice and guide reading add no model calls. If you generate a fresh minute of examiner narration for every station, budgeting $0.02 per generated minute adds about £0.36/month for the active learner, £1.08 for the heavy learner, and £5.40 at the premium maximum. This $0.02 is a planning allowance: TTS is actually billed by the selected model's characters/tokens, not this fixed price.

At fleet level, assume **every monthly active user has the active-learner usage above**. This is more intensive than merely signing in. Mixed free/paid populations can be modelled separately in the calculator.

| Monthly active users | AI + transcription including reserve | Shared infrastructure allowance | Estimated monthly technology total | Total per active user |
| ---: | ---: | ---: | ---: | ---: |
| 100 | £45.72 | £40–£100 | £86–£146 | £0.86–£1.46 |
| 1,000 | £457.20 | £100–£350 | £557–£807 | £0.56–£0.81 |
| 10,000 | £4,572.00 | £500–£2,500 | £5,072–£7,072 | £0.51–£0.71 |

Infrastructure ranges are planning allowances for hosting, database, delivery, queue processing and operational services, not vendor capacity quotes. [Vercel Pro](https://vercel.com/pricing) starts at $20/month and [Supabase Pro](https://supabase.com/pricing) at $25/month for a basic paid setup; allowances and overages apply. Bigger database instances, extra projects/developer seats and media traffic increase the bill. MAU allowances do not establish how many simultaneous interviews a database can serve. Measure actual load before selecting a database size. [Supabase compute pricing](https://supabase.com/docs/guides/platform/manage-your-usage/compute)

These totals exclude VAT/taxes, Stripe fees, support staff, tutoring/personal-statement labour, development, marketing, human content review and long-term media storage. They include neither AI-generated video nor fully live speech-to-speech interviews. Subscription pricing needs room for these business costs, peak usage and profit. The current generous premium maximum needs its own budget; average-user economics alone should not justify an unlimited plan.

**Making the examiner sound natural**

The robotic sound comes from browser `speechSynthesis` choosing an installed `en-GB` voice. Changing the marking model will not change that voice. The best first improvement is to record the fixed questions in your own voice, hire a voice artist, or generate them once with a dedicated TTS service. Review pronunciations, pace and tone; store the resulting files and play them from a CDN. Replays then incur delivery costs without another TTS generation.

For generated audio, audition the same 10–20 examiner lines with OpenAI `gpt-4o-mini-tts` (try `marin` and `cedar`), Google TTS and ElevenLabs. Give a direction such as: “Calm British medical interviewer, conversational and warm, moderate pace, natural sentence pauses, neutral emphasis.” OpenAI documents control over tone, pacing and accent and recommends those two voices for quality. Keep an unobtrusive AI-voice label where relevant. [OpenAI speech guide](https://developers.openai.com/api/docs/guides/text-to-speech)

OpenAI mini-TTS currently bills $0.60/million text input tokens and $12/million audio output tokens. Google 2.5 Flash Preview TTS is approximately $0.015 per generated minute plus its text input, so 1,000 questions averaging 20 seconds each would cost roughly $5 in audio generation before delivery and QA. Preview models need additional lifecycle attention. ElevenLabs Flash/Turbo currently starts at $0.05/1,000 characters; quality preferences should be checked by listening. [OpenAI TTS model](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts), [Google audio pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=en), [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)

For future personalised follow-ups, generate only the new line and stream its audio. Genuine interruptible speech-to-speech is a later premium feature with a separate minutes allowance. Its bill includes audio, repeated conversation context and potentially separate transcription; do not apply the one-report estimate to it. [Realtime cost behaviour](https://developers.openai.com/api/docs/guides/realtime-costs)

**Browser and server responsibilities**

| Keep in the browser | Keep behind the server |
| --- | --- |
| Timers, animation, guide search, draft editing | Account identity, entitlement and authoritative quota decisions |
| Audio capture, local replay, playhead/highlighting, mic meter | Paid text, transcription and TTS credentials/calls |
| Silence measurement and approximate pace/filler coaching | Persisted marking, rubric/model version and leaderboard scores |
| Optional device-local attention tracking | Durable jobs, usage ledger, retries and spending controls |
| Playback of previously generated question audio | Private media access and retention, if persistent recording is added |

Browser speech recognition may use an external browser-vendor service; it is not necessarily on-device or reliable in every browser. Keep it as a low-cost live draft/fallback, with typing always available. A paid final transcription pass offers a consistent service while limiting cost. Word-aligned playback needs timestamps/alignment, and recognisers can omit stutters and fillers. Measure silence locally and preserve the original audio; never ask a text model to invent missing speech events. Cloud recording/transcription should be clearly explained at microphone consent. Cross-device recordings need private storage, expiring links and a deletion policy.

**Handling a busy launch**

The repo already has authenticated server marking, bounded interview transcripts, database-enforced per-user quotas, grading locks, schema validation and reuse of finished feedback. Keep those. The main additions should be:

1. Save the final answer and create a durable assessment job. Return a saved/queued state quickly so closing or refreshing the page cannot lose the job. A queue still needs an actual worker and recovery mechanism; a fire-and-forget promise in a serverless request is insufficient. [Supabase Queues](https://supabase.com/docs/guides/queues) fits the existing database stack.
2. Limit total jobs against each provider's requests and tokens per minute, with a small controlled worker pool. Retry transient 429/5xx/network errors with delay and jitter, respect `retry-after`, and cap retries. Queueing absorbs bursts but does not create extra provider capacity. Request higher account limits before launch. [OpenAI limits](https://developers.openai.com/api/docs/guides/rate-limits), [Google limits](https://ai.google.dev/gemini-api/docs/rate-limits), [Anthropic limits](https://platform.claude.com/docs/en/api/rate-limits)
3. Keep one job/credit identity per attempt. Reserve usage transactionally, settle once, and release failed reservations through a recoverable job process. Refreshes and double-clicks must reuse the stored result. Limit free-account creation abuse and charge live voice separately by minutes.
4. Record provider, model/rubric version, actual tokens, audio minutes, estimated USD, retry count, latency and result status. Set daily spend alerts, per-user limits and a global stop for new paid work. Existing guides and question practice should remain available during an AI outage.
5. Pre-generate reusable content and audio. Cache by text/question ID, voice, model and content version. Saved personal feedback must remain owner-scoped; never put private answers into a shared public cache. Pin and evaluate grading changes so leaderboard comparisons remain meaningful.
6. Exercise realistic bursts and failures: concurrent finishes, repeated submission, page closure, provider 429s/timeouts and recovery. Track queue age, p95 latency, error rate and database capacity. At 1,000 simultaneous active interviews, a changed draft saved every 15 seconds can already produce roughly 67 requests/second, before group polling and authentication. Stagger/coalesce saves and reduce idle polling.

Two additional concrete gaps deserve attention before scale: the UCAT diagnostic route needs the same explicit input limits, timeouts and durable recovery as interviews; public personal-statement PDF uploads need scoped upload authorisation, rate limits and abandoned-upload cleanup to avoid storage abuse. These are recommendations from this audit, not changes included in the practice-pathway update.

Launch order: finish the seven-stage learning flow; replace fixed-question narration; add usage telemetry and durable assessment jobs; test provider quality and load; then decide whether dynamic voice earns enough value to justify a separate allowance.
