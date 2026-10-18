# Current Supabase setup

Updated 18 October 2026.

In your existing MedicForest project's SQL Editor, select the normal `postgres` role and run the entire [RUN_ALL_MEDICFOREST_SETUP.sql](RUN_ALL_MEDICFOREST_SETUP.sql) file once. It includes accounts, billing tables, practice history, question-bank progress, interviews, groups, dashboard preferences, applicant activity, nickname moderation, lifetime trial limits, grading guards, scoring v2, public challenge leaderboards and shared AI capacity.

It is safe to rerun: existing plans, used credits, answers and paused interviews are preserved. All statements run in one transaction. You do not need to run the individual SQL files afterwards.

If you want only interview setup and already have the account tables, use [RUN_ALL_INTERVIEW_SETUP.sql](RUN_ALL_INTERVIEW_SETUP.sql) instead. Run one combined file, not both.

Save and exit, interruption filtering, panel variety, Reports tabs and Medwithrish's 96% benchmark use the existing schema. They need the latest website deployment; they do not need additional SQL or a fabricated leaderboard account.

SQL cannot set hosting secrets or enable external services. Keep these configured in Vercel for the production deployment:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-public-key
SUPABASE_SERVICE_ROLE_KEY=your-server-only-service-role-key
OPENAI_API_KEY=your-server-only-openai-key
INTERVIEW_OPENAI_MODEL=gpt-6-luna
INTERVIEW_AI_SHARED_LIMITS=true
```

After adding or changing hosting variables, redeploy. Billing also needs the existing Stripe price IDs and webhook configuration; see [Stripe environment variables](../docs/stripe-environment-variables.md). Auth email delivery, allowed redirect URLs and CAPTCHA settings remain in the Supabase dashboard; see [Supabase settings](medicforest_settings.md).
