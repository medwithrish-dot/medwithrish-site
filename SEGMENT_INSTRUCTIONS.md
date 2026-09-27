# Instructions for Dealing with Codebase Segments

This file provides clear, strict, and actionable instructions for any AI agent or engineer working on the modularization and optimization segments for the `medwithrish-site` repository.

Follow these rules to ensure zero regressions, clean builds, and consistent progress.

---

## 1. Golden Rules (Read Before Touching Code)

1. **Pre-flight & Post-flight Checks Every Single Time**:
   - Before editing: run `git status` and `npx tsc --noEmit`.
   - After editing: run `npx tsc --noEmit` and `npm run test:unit`.
   - If ANY error occurs, fix it immediately before proceeding to another file or segment.
2. **Prevent 0-Byte File Disasters**:
   - Never write an empty or incomplete file.
   - If a file is accidentally truncated to 0 bytes, immediately restore it:
     ```bash
     git checkout HEAD -- <filepath>
     ```
3. **Preserve Backward Compatibility**:
   - Keep existing public exports and function signatures intact.
   - If extracting a function/component to a separate module, re-export it from the original location so external callers and tests do not break.
4. **Clean Component Removals**:
   - When extracting code out of huge files (like `MedicForestClient.tsx`), ensure the closing tags `  );\n}` of preceding components are NOT accidentally clipped.
   - Check local type definitions before deleting blocks.
5. **Git Hygiene & Commit Rules**:
   - Per `AGENTS.md`, once a segment is completed and tests pass, commit and push to GitHub unless the user explicitly requests otherwise:
     ```bash
     git add -A
     git commit -m "Optimize Segment X: <summary>"
     git push origin main
     ```
6. **Keep Documentation Synchronized**:
   - When finishing a segment, record what was done and how another AI can verify it in `SEGMENT_OPTIMIZATION_GUIDE.md`.

---

## 2. Standard 6-Step Workflow for Any Segment

### Step 1: Pre-Flight Verification
Run these baseline commands to verify a clean state:
```bash
git status
npx tsc --noEmit
npm run test:unit
```
Ensure 0 errors and all existing tests pass before touching anything.

### Step 2: Audit & Scope Definition
- Identify the specific target files for the requested segment.
- Check dependencies, imports, and existing unit tests in `scripts/test-*.mjs`.
- Never guess line numbers; always use file inspection tools to check exact bounds.

### Step 3: Incremental Refactoring & Extraction
- Extract business logic, utility functions, and types into dedicated domain modules (e.g., under `_lib/` or `utils/`).
- Extract presentational subcomponents into `_components/`.
- Wire the extracted modules back into the main view/client with clean imports and re-exports.
- Verify TypeScript compilation (`npx tsc --noEmit`) immediately after each extraction.

### Step 4: Automated Testing
- Write dedicated unit tests in `scripts/test-<domain>.mjs` covering edge cases, scoring math, formatting, data transforms, and filters.
- Register the new test script under `"test:unit"` in `package.json`.
- Execute the test script directly: `node --test scripts/test-<domain>.mjs`.
- Run full suite: `npm run test:unit`.

### Step 5: Full Build Verification
Run the production build check to ensure no SSR or Next.js routing issues:
```bash
npm run build
```

### Step 6: Log & Commit
- Document the segment changes in `SEGMENT_OPTIMIZATION_GUIDE.md`.
- Commit with a clear, professional message and push to GitHub.

---

## 3. Segment Reference Guide (Segments 1 to 12)

### Segment 1: Stripe Billing & Subscription Infrastructure
- **Domain**: `utils/billing/`, `app/api/stripe/`
- **Scope**: Centralized Stripe config, repository layer, error handling, thin HTTP route handlers.
- **Verification**: `node scripts/test-billing.mjs` (11 tests).
- **Status**: ✅ Completed.

### Segment 2: PS Review Submission Service
- **Domain**: Personal statement submissions.
- **Status**: 🗑️ Scrapped per owner directive (completely removed).

### Segment 3: AI Interview Platform — Call & Speech Engine
- **Domain**: `app/medicforest/interview/`, `app/api/interviews/speech/`, audio timers, microphone hooks.
- **Scope**: Audio recorder lifecycle, silence detection, pause flushing, speech recognition error recovery, interview room UI.
- **Verification**: `npm run test:interviews:room` (50+ tests).
- **Status**: 🔄 In Progress.

### Segment 4: AI Interview Platform — Scoring & Feedback Reports
- **Domain**: `app/medicforest/interview/_lib/`, `app/api/interviews/feedback/`, `InterviewHistoryViews.tsx`.
- **Scope**: Feedback generation, rubrics, university circuit weighting, retry state preservation, timeout safety.
- **Verification**: `node --test scripts/test-interview-feedback-reports.mjs` (6 tests).
- **Status**: ✅ Completed.

### Segment 5: AI Interview Platform — Community (Groups, Leaderboard, Pathway)
- **Domain**: `app/medicforest/interview/groups/`, `app/medicforest/interview/leaderboard/`, `app/medicforest/interview/pathway/`.
- **Scope**: Study circles/groups, public leaderboard guest viewing (fix 401 unauth issues), pathway task progression, offensive name sanitization.
- **Verification**: `node --test scripts/test-interview-public-names.mjs scripts/test-interview-pathway.mjs`.
- **Status**: 📋 Pending.

### Segment 6: MedicForest UCAT Platform — Client Monolith & State
- **Domain**: `app/medicforest/ucat/_components/MedicForestClient.tsx`, public marketing splits.
- **Scope**: Deconstruct monolithic client, lazy-load marketing pages (`MedicForestLandingClient`, `MedicForestPricingClient`), fix keyboard shortcuts (`Alt+C`), eliminate 1-second interval re-render churn.
- **Verification**: `npx tsc --noEmit && npm run build`.
- **Status**: ✅ Completed.

### Segment 7: MedicForest UCAT Platform — Question Bank Engine
- **Domain**: `app/medicforest/ucat/_components/UCATQuestionBankClient.tsx`, `_lib/ucatScoring.ts`, `_components/UCATQuestionVisuals.tsx`.
- **Scope**: Question scoring (SJT partial credit, drag-order, yes/no syllogisms, scaled 300-900 scores), diagram/SVG rendering, exam timer auto-finalization, Next.js `router.push` navigation.
- **Verification**: `node --test scripts/test-ucat-engine.mjs` (8 tests).
- **Status**: ✅ Completed.

### Segment 8: MedicForest UCAT Platform — Diagnostics & AI Feedback
- **Domain**: `app/medicforest/ucat/_lib/ucatDiagnostics.ts`, `app/medicforest/ucat/_components/UCATDiagnosticContent.tsx`, `app/medicforest/ucat/_components/UCATReportContent.tsx`, `app/api/ai/diagnostic-feedback/route.ts`.
- **Scope**: Diagnostic scoring, mock conversion (VR -> DM -> QR -> SJT canonical sort), 24h AI credit cooldown isolation, report issue cards, study plan task filters.
- **Verification**: `npx tsc --noEmit && node --test scripts/test-server-routes.mjs`.
- **Status**: ✅ Completed.

### Segment 9: Auth, Supabase & User Account Management
- **Domain**: `utils/supabase/`, `app/medicforest/account/`, user profile hooks, session persistence.
- **Scope**: Session hydration, token refreshing, account switcher, preview access tokens, profile display name updates.
- **Verification**: `node --test scripts/test-profile-security.mjs scripts/test-ucat-account.mjs`.
- **Status**: 📋 Pending.

### Segment 10: MedicForest Public Marketing & Shell
- **Domain**: `app/medicforest/about/`, `app/medicforest/pricing/`, `app/medicforest/_components/`, navigation shell.
- **Scope**: About page polish (compact 2-card offering: Interview Practice & 1-to-1 Tutoring; subtle UCAT WIP), pricing tiers, layout sidebar, responsive mobile menu.
- **Verification**: `npm run build`.
- **Status**: 📋 Pending.

### Segment 11: MedWithRish.com Core & Resources Hub
- **Domain**: `app/page.tsx` (MedWithRish homepage), `app/about/`, `app/contact/`, `app/resources/`, `app/interviews/`.
- **Scope**: Main admissions journey, tutoring booking flows, success stories, remove deprecated PS review mentions, clean dead links.
- **Verification**: `npm run build`.
- **Status**: 📋 Pending.

### Segment 12: Infrastructure, Routing & Build Configuration
- **Domain**: `next.config.ts`, `proxy.ts`, `app/layout.tsx`, security headers, redirects.
- **Scope**: Route rewrites, domain proxying, cache headers, preview tokens, bundle optimization, clean production build.
- **Verification**: `npm run build && node --test scripts/test-domain-routing.mjs`.
- **Status**: 📋 Pending.

---

## 4. How to Prevent Errors from Stacking Up

If you encounter errors stacking up, STOP immediately and run these diagnostic commands:

1. **Check for missing brackets or syntax errors in large files**:
   ```bash
   npx tsc --noEmit
   ```
   If TypeScript points to a missing `)` or `}`:
   - Inspect the component directly above that line.
   - Ensure `  );\n}` is present.
2. **Check for 0-byte or corrupted files**:
   ```bash
   Get-ChildItem -Recurse | Where-Object { $_.Length -eq 0 -and $_.Extension -in ".ts",".tsx",".mjs" }
   ```
   If any non-empty code file was accidentally zeroed out, immediately restore it with `git checkout HEAD -- <filepath>`.
3. **Verify Git Working Tree**:
   ```bash
   git status
   ```
   Review uncommitted diffs before committing. Do not leave stray syntax errors unverified.
4. **Never execute multiple major refactors simultaneously**:
   Work in small, testable chunks: extract module $\to$ typecheck $\to$ test $\to$ wire $\to$ test $\to$ commit.
