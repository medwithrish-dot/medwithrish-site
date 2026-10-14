# Interview platform review — 14 October 2026

## Essential feature decisions

| Gap | Decision and implementation |
| --- | --- |
| Saved history silently stopped at 300 attempts. | Added account-scoped pagination and a **Load older interviews** button. Filters include all loaded pages, and circuits regroup correctly as older stations arrive. |
| Private station notes disappeared on reload or when the station ended. | Added automatic device storage and the same notes editor in station review. Notes remain outside transcripts and AI requests. Preview notes are temporary. |
| Self-marking ticks disappeared when switching questions or reopening a saved station. | Store each checklist separately by attempt and question. Saved reviews restore their ticks; retries use a new attempt and start clean. |
| A circuit with feedback for only one station looked fully marked. | Show how many saved stations are marked and keep partially marked circuits in **Needs feedback**. Zero scores remain valid feedback. |

Existing essentials were checked: saved transcripts and feedback, station retries, active-attempt resume, timed practice, microphone permission guidance and typing fallback, question search and review, university practice formats, preparation plans, progress, groups and opt-in leaderboard privacy, account access and billing guards. Extra features such as side-by-side attempt comparison, question favourites and cloud-synced private notes were considered optional and left for a later release.

## Bugs fixed

- Clock/speech renders restarted the account autosave interval. Its 15-second callback now stays scheduled and reads the current save function. A browser test waits for a real autosave before refreshing, and a unit regression supplies a fresh speech object on every render.
- Ending without review now saves the latest typed and final spoken words before closing the attempt. Failed saving retains the browser draft and keeps the station available for retry.
- Ending a station preserves MedicForest's public URL form.
- Initial groups and leaderboard requests are cancelled on component unmount.
- Removed a duplicate account access check in saved review.
- Preserved older data-question wording for report/image lookup. Audio checks the displayed text before using a fixed recording, so older prompts use browser speech rather than a different recording.

## Requested presentation and content changes

- Small **Beta** badge on the data-analysis station in setup, practice and review.
- **Return to interviews** button in the UCAT work-in-progress card, linking to `https://medicforest.com/interviews`.
- Rewrote all 15 image-based data-bank prompts and the three linked data-station prompts. Visually checked all 15 images against the wording, while retaining their existing facts and markschemes. This is fresh question wording, not a legal clearance opinion about a source book.
- Regenerated the 36 corresponding male/female recordings, retaining audio IDs, and updated the CSV manifest.
- Rebuilt the downloadable text and PDF markschemes with the new wording; removed the PDF's owner-facing provenance note.
- Removed internal source-section labels from question views and simplified technical score explanations.

## Verification

- Full unit suite and local PostgreSQL checks; no live account or payment writes.
- TypeScript and production build.
- ESLint: zero errors; unrelated tutoring/about files have existing unused-variable warnings.
- Chromium and WebKit: 20 public pages at 320px and 390px, navigation, question practice, account prompts, interview preview, keyboard layout, review and transcript download.
- Focused Chromium/WebKit fixtures at 390px and 1280px: actual account autosave, private notes, reload and review retention, separate question checklists, beta badge, UCAT return link and zero runtime errors.
- All 1,348 fixed recordings decoded; zero clipping/spike flags after regeneration. This is a waveform check, not a pronunciation guarantee.

Private notes and manual station checklists are saved on the current device, not synced across devices. Browser fixtures simulate account/device services; real microphone recognition, production AI generation, checkout and production deployment were not performed in this pass. The changes are retained locally because the user requested no GitHub push yet.
