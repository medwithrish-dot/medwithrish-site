# AI interview room

Open **AI Interviews → Build your interview**, or `/phloemai/interviews/ai-interviews?setup=1`. Existing university, station and saved-attempt links use the same experience. The site's existing preview-access gate still applies.

## Experience

- **Lobby:** choose a free station, a custom circuit, or university practice timings. Include or skip topics; selected stations run in catalogue order. The summary includes preparation, station time and breaks. Scored practice starts only after joining.
- **Devices:** camera is off by default. Turning it on requests video only and displays a muted, mirrored self-view. The eight-second microphone test measures real input volume and releases its audio stream afterwards. Spoken answers require a separate opt-in. Read-aloud has three speaking paces and a test phrase.
- **Interview:** an original Phloem call layout shows an illustrative interviewer avatar, question captions, a side transcript, private scratchpad, question navigation, focus view and microphone/camera/voice controls. Small screens stack the transcript beneath the call and keep call controls sticky. Existing server timers, draft recovery, autosave and scoring are retained.
- **Feedback:** score, summary, strengths, next steps, criterion breakdown, submitted transcript and a downloadable text report. Camera, accent, movement and eye contact are not assessed. Real feedback comes from the existing feedback endpoint.
- **Preview:** an explicitly labelled, in-memory walkthrough with sample feedback. It never creates, saves or grades an account attempt, and can skip reading time. Answer replay and attempt comparison are clearly labelled forthcoming features.

## Circuit selection

The session POST accepts an optional `stationSlug` and numeric `stationCount` (1–9 for customised circuits). Continuation always checks the owner's previous completed station, its persisted station count, and the existing break. Premium requirements and practice allowances remain enforced on the server. Existing calls without these fields retain the original presets.

The remaining topic plan is kept in browser storage under the returned circuit ID. First joins send an explicit new circuit ID; if the database resumes a different active attempt, its existing plan is restored instead of being overwritten. If the plan is unavailable on another device, the feedback screen offers a topic chooser to continue the same circuit one station at a time. No database migration is required.

## Data and placeholders

Device checks do not record or upload media. Camera tracks and calibration audio tracks are released when stopped, when submitting or leaving, and on unmount. The browser's speech-recognition service may process spoken audio; Phloem persists text transcripts only. Notes stay on the current call screen and are neither saved nor marked. In preview, feedback is illustrative regardless of the entered answer.

## Verification

`npm run test:interviews:room` exercises the session route with substituted account/database services, validates scoring, and checks that queued read-aloud cancels on Voice off, superseding requests and unmount. It does not require credentials or call an AI provider.

Browser checks should cover station inclusion/exclusion, zero-selection validation, camera permissions, microphone test completion, typed-answer recovery, mobile overflow, question navigation, preview isolation, sample feedback, and next-station selection. Real provider speech recognition and AI grading depend on browser support and account/provider configuration.
