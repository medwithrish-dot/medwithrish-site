# Code audit: 6 September 2026

Reviewed the website components and routes, PhloemAI account and UCAT workflows,
interview platform, payment/API handlers, SQL setup, scripts and dependency
configuration. Existing generated question content was checked with the question
bank audit rather than rewritten.

## Corrections

- Validate malformed API bodies, PDF contents and uploaded file existence before
  payment. Wait for successful payment before fulfilling a review, support delayed
  payments and propagate storage/database/email failures so Stripe can retry.
- Read Stripe billing periods from subscription items, reconcile current
  subscription state, and distinguish missing customers from temporary outages.
- Prevent failed AI requests from overwriting newer credit reservations. Restrict
  profile writes and preserve consumed credits when setup SQL is rerun.
- Cancel stale camera and microphone requests, release devices/models on exit,
  avoid repeated inference for the same video frame, and preserve final speech
  transcripts during concurrent shutdown requests.
- Serialize interview autosaves and omit transcripts from report-list requests.
  Stop room timers once their deadlines have passed.
- Run independent account queries together, deduplicate initial authentication
  loads and discard responses belonging to an earlier account/session.
- Strengthen question answer validation, restore Venn question subtype metadata,
  use elapsed time for the demo timer and discard stale question requests.
- Fix homepage stage deep links, keyboard/mobile navigation, cancelled-navigation
  loading state, payment form validation and repeated submission protection.
- Add appropriately sized responsive images and individual metadata/canonical
  URLs for public pages. Skip authentication refresh on public resource requests.
- Update Next.js and compatible dependencies, remove installed generator packages
  from version control, and provide an `npm test` entry point.

## Verification

- Production compilation, TypeScript checks and static page generation passed.
- Repository-wide ESLint passed without errors or warnings.
- 64 application regression tests, 38 embedded PostgreSQL integration checks and
  the profile-permission/credit-preservation test passed.
- Headless Chrome checked desktop keyboard menus, mobile navigation, stage deep
  links, invalid PDFs and duplicate payment submissions, with no JavaScript errors.
- All 22 sitemap routes returned HTTP 200 with their own canonical URLs and page
  headings. The spreadsheet download and private preview redirect also passed.
- The UCAT audit accepted all 11,727 existing accepted questions.
- Root and generator dependency audits reported zero known vulnerabilities.

## Scope of verification

Tests use isolated provider adapters and embedded PostgreSQL. Live Stripe
payments, email delivery, AI providers and production database migrations were
not exercised. SQL changes must be applied separately to the deployed database.
PGlite tests do not simulate PostgreSQL contention across separate connections.

Existing UCAT answer/subtype distribution warnings remain editorial work. The
personal statement submission schema is not present in this repository; durable
notification deduplication across webhook retries requires a database-backed
delivery record. Retry handling here does not promise exactly-once email delivery.
