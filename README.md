# MedWithRish

Next.js App Router website for admissions resources, personal statement reviews,
PhloemAI UCAT practice and interview preparation.

## Local development

Use Node.js 20.9 or later and npm. Install dependencies from the lockfile:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Keep secrets in the ignored `.env.local` file.

Account features use `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`) and
the server-only `SUPABASE_SERVICE_ROLE_KEY`. Set `NEXT_PUBLIC_SITE_URL` to the
site origin, including `https://`, without a path, query or fragment.

Optional integrations:

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `STRIPE_PREMIUM_PRICE_ID` and `STRIPE_PS_REVIEW_PRICE_ID`.
- Personal statement notifications: `RESEND_API_KEY`.
- UCAT feedback: `ANTHROPIC_API_KEY`.
- Interview feedback: `GEMINI_API_KEY`; optionally `INTERVIEW_GEMINI_MODEL`.
- Preview access: `PHLOEMAI_PREVIEW_PASSWORD` and `PHLOEMAI_PREVIEW_TOKEN_SECRET`.

Database setup and feature configuration are documented in
[`supabase/phloemai_settings.md`](supabase/phloemai_settings.md) and
[`docs/interview-platform-setup.md`](docs/interview-platform-setup.md).
Changing a SQL file does not apply it to a deployed Supabase database.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run audit:ucat-questions
npm run build
```

The regression suite substitutes network providers and runs database checks in
embedded PostgreSQL (PGlite). It does not need credentials or write to live
accounts, send emails, create payments or call AI providers. The production build
uses the local environment configuration and downloads the configured Google
fonts.

Check dependency advisories with `npm audit` and
`npm --prefix ucat-generator audit`. The generator currently contains package
configuration only; its installed dependencies are ignored by Git and can be
restored with `npm --prefix ucat-generator ci`.
