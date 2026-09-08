# AI interview room

Open **AI Interviews → Build your interview**, or `/phloemai/interviews/ai-interviews?setup=1`. Existing university, station and saved-attempt links use the same experience. The site's existing preview-access gate still applies.

## Experience

- **Lobby:** choose a free station, a custom circuit, or university practice timings. Include or skip topics; selected stations run in catalogue order. The summary includes preparation, station time and breaks. Scored practice starts only after joining.
- **Devices:** camera is off by default. Turning it on requests video only and displays a muted, mirrored self-view. The optional eight-second microphone test measures real input volume and releases its audio stream afterwards. Entering a new, resumed or preview interview automatically requests browser microphone access, including during reading time. The browser may remember a previous Allow or Block decision. The permission-check stream is released immediately; select Start mic when ready to speak. Blocked or unavailable microphones leave typed answers available, and Start mic retries access. Read-aloud has three speaking paces and a test phrase.
- **Interview:** the room fills the interview workspace with navy and slate surfaces and teal accents. Two wide participant cards use simple circular avatars and name badges, with a local camera preview when enabled. The sidebar pairs the live transcript with private Notes and keeps the prompt, answer editor, read-aloud action and question navigation together. Circular microphone, camera and finish controls sit beneath the participants; voice and focus controls are in the header. Small screens stack the transcript beneath the call and pin call controls to the bottom of the viewport. Existing server timers, draft recovery, autosave and scoring are retained.
- **Feedback:** score, summary, strengths, next steps, criterion breakdown, submitted transcript and a downloadable text report. Camera, accent, movement and eye contact are not assessed. Real feedback comes from the existing feedback endpoint.
- **Preview:** an explicitly labelled, in-memory walkthrough with sample feedback. It never creates, saves or grades an account attempt, and can skip reading time. Answer replay and attempt comparison are clearly labelled forthcoming features.

## Circuit selection

The session POST accepts an optional `stationSlug` and numeric `stationCount` (1–9 for customised circuits). Continuation always checks the owner's previous completed station, its persisted station count, and the existing break. Premium requirements and practice allowances remain enforced on the server. Existing calls without these fields retain the original presets.

The remaining topic plan is kept in browser storage under the returned circuit ID. First joins send an explicit new circuit ID; if the database resumes a different active attempt, its existing plan is restored instead of being overwritten. If the plan is unavailable on another device, the feedback screen offers a topic chooser to continue the same circuit one station at a time. No database migration is required.

## Data and placeholders

Device checks do not record or upload media. Camera tracks and calibration audio tracks are released when stopped, when submitting or leaving, and on unmount. Native microphone prompts cannot be dismissed by the app; a grant arriving after cancellation or unmount releases all tracks and cannot start speech. Pending prompts are reused across React effect replay. The browser's speech-recognition service may process spoken audio; Phloem persists text transcripts only. Notes stay on the current call screen and are neither saved nor marked. In preview, feedback is illustrative regardless of the entered answer.

## Verification

### Speech and answer review

Question-bank recording stays available after Finish & Review until the user leaves or retries the question. The saved-response prop update must not discard the MediaRecorder's pending final blob. Review uses one transcript; playback highlights an estimated word within each timed recognition chunk. If typed text or edits no longer match that timeline, show the complete answer without claiming word alignment. Audio is local to the current screen and is not uploaded or restored with saved text.

Both speech flows preserve recognised slang and repetitions, wrap audible fillers as `[uhhh]` or `[um]`, and normalise legacy pause notation to `[3s pause]`. Only speech-boundary events with a preceding committed transcript can place a gap marker. Gaps shorter than three seconds, opening/trailing silence, recognition latency, and deliberate microphone breaks do not create markers. Browsers may omit fillers or speech-boundary events; missing evidence is never reconstructed from result latency.

Delivery coaching below the question-bank End section uses approximate words in the latest seven-second window ending in speech: under 13 is slow, 13–21 medium, above 21 fast. A complete seven-second span is required. Confidence warnings need at least 12 words with nonzero confidence and at least 35% below 0.65. Repeated-pause/sound coaching appears only for three long gaps, or at least three fillers/repetitions in 20+ words with an 8% rate. These are configurable coaching heuristics, not clinical assessments or scoring inputs.

`scripts/test-interview-speech.mjs` covers marker formatting, natural gaps, delayed recognition, pace thresholds and conditional coaching. Browser verification with a synthetic microphone confirmed final audio playback, a single transcript, replay highlighting, and animated/inert markscheme collapse. The AI room was checked at desktop and mobile widths for overflow, keyboard navigation and answer preservation.

`npm run test:interviews:room` exercises the session route with substituted account/database services, validates scoring, and checks that queued read-aloud cancels on Voice off, superseding requests and unmount. Microphone regressions cover entry during reading time, avoiding prompts in the lobby or feedback, permission success and denial/retry, late grants, effect replay, and unavailable APIs. It does not require credentials or call an AI provider.

Browser checks should cover station inclusion/exclusion, zero-selection validation, camera permissions, microphone test completion, typed-answer recovery, mobile overflow, question navigation, preview isolation, sample feedback, and next-station selection. Real provider speech recognition and AI grading depend on browser support and account/provider configuration.
