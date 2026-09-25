# Interview speech options

Last checked: 25 September 2026. Prices are USD, exclude tax, hosting and storage, and can change. Check the linked pricing page before implementation.

## Two different features

- **Speech-to-text (STT):** turns the candidate's spoken answer into a transcript. This is the accuracy issue in the interview room.
- **Text-to-speech (TTS):** reads the interviewer's written questions aloud. This affects how natural the interviewer sounds, not transcript accuracy.

## Current MedicForest setup

- Candidate STT uses the browser's `SpeechRecognition` service with British English (`en-GB`). It is effectively free to MedicForest and provides live interim text, but accuracy and browser support vary. Medical terms, names, accents and background noise can be inconsistent.
- Fixed interviewer lines use pre-generated MP3 files. Dynamic follow-up questions can use Google Chirp when configured, with browser `speechSynthesis` as the free fallback.
- MedicForest currently saves the transcript, not the candidate's audio. A cloud STT upgrade would send audio to a provider, so the microphone notice and privacy documentation must be updated.

## Speech-to-text options

| Option | Current price | 8-minute station | 1,000 × 8-minute stations | Strengths | Limitations |
| --- | ---: | ---: | ---: | --- | --- |
| Browser `SpeechRecognition` | No direct API charge | $0 | $0 | Already built; immediate text; no MedicForest API key | Accuracy and availability depend on the browser/vendor; little control over medical vocabulary |
| OpenAI `gpt-live-transcribe` | $0.017/min | $0.136 | $136 | Proper live transcript; supports prompts, medical keywords and language hints | Highest transcription cost; streaming connection and audio disclosure required |
| OpenAI `gpt-transcribe` after each answer | $0.0045/min | $0.036 | $36 | Recommended general-purpose recorded-audio model; strong final transcript and vocabulary hints | Final correction arrives after speaking; requires temporary audio capture/upload |
| OpenAI `gpt-4o-transcribe` after each answer | $0.006/min estimated | $0.048 | $48 | High-quality file transcription with prompting | Costs more than `gpt-transcribe`; test quality before choosing it |
| OpenAI `gpt-4o-mini-transcribe` after each answer | $0.003/min estimated | $0.024 | $24 | Lowest listed OpenAI transcription cost | Must be tested on UK accents and medical-interview vocabulary |

Official sources: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [file transcription](https://developers.openai.com/api/docs/guides/speech-to-text), and [Realtime transcription](https://developers.openai.com/api/docs/guides/realtime-transcription).

## Recommended approach

Use a **hybrid final-transcript flow** first:

1. Keep browser recognition for immediate, editable live captions.
2. Temporarily record only the candidate's answer in the browser.
3. When the answer is confirmed, send that recording through the server to `gpt-transcribe`.
4. Supply `languages: ["en"]`, a short medicine-interview prompt, and relevant keywords such as `NHS`, `GMC`, `autonomy`, `beneficence`, `non-maleficence`, `Gillick competence` and university names.
5. Let the candidate review the corrected text before it is locked for feedback, then discard the temporary audio unless explicit retention is required.

This should give more consistent scored transcripts at about **3.6 cents per fully spoken eight-minute station**, while retaining the current responsive live display. In practice, candidates will not speak for every second, so recording only active answers may cost less. Measure real processed audio duration rather than assuming the full station length.

Choose `gpt-live-transcribe` instead if accurate live words are essential while the candidate is still speaking. Start with `delay: "medium"`; higher delay gives the model more context and may reduce word errors, at the expense of slower text updates.

## Text-to-speech choices

| Option | Price shape | Best use |
| --- | --- | --- |
| Browser `speechSynthesis` | No direct API charge | Fallback when generated audio is unavailable; quality varies by device |
| Pre-generated MP3 questions | One-time generation plus file delivery | Best value for fixed questions; consistent playback and no per-play synthesis charge |
| Existing Google Chirp integration | Provider usage charge | Dynamic follow-up questions; see `docs/google-chirp-setup.txt` and verify Google's live pricing |
| OpenAI `gpt-4o-mini-tts` | $0.60/1M text-input tokens + $12/1M audio-output tokens | Natural dynamic questions with controllable accent, tone and pace |

OpenAI recommends `gpt-4o-mini-tts` for current TTS applications and requires a clear disclosure that its voice is AI-generated. The `marin` and `cedar` voices are recommended for quality. See the [OpenAI TTS guide](https://developers.openai.com/api/docs/guides/text-to-speech) and [model pricing](https://developers.openai.com/api/docs/models/gpt-4o-mini-tts).

For MedicForest, keep fixed questions as cached MP3s and use paid TTS only for dynamic follow-ups. TTS changes the interviewer voice; it will not improve the candidate transcript.

## Before implementation

- Test at least 50 representative clips across UK accents, quiet/noisy rooms, fast speech and medical vocabulary.
- Compare word-error rate and meaning-changing errors, not just whether the transcript looks fluent.
- Keep typing and manual correction available.
- Never expose a provider API key in the browser. Create short-lived Realtime credentials or proxy file transcription through an authenticated server route.
- Update consent/privacy text before sending candidate audio to any new provider.
- Add per-user minute limits, timeouts, retry limits and spend alerts.
