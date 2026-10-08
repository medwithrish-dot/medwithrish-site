# Interview release checks — 8 October 2026

## Verified

- GPT was already the active provider. The ignored local environment has an OpenAI key and `gpt-6-luna`; obsolete Gemini setup instructions have been replaced.
- Ethics probing defaults on and the device preference can be toggled in setup or the room. One probe per main answer, at most three per station, no recursive probing, no new probe in the last 45 seconds. Existing claim/replay protections now support up to eight main questions.
- Strict v2 scoring displays the rubric average directly (maximum 99). Authored question guidance is preserved. Historical reports retain their scores; v1 and v2 are excluded from each other's leaderboard.
- Four live synthetic ethics checks: generic 18, unsafe disclosure 17, strong 65.6, prompt injection 0. All passed the predeclared bounds. This small sample does not establish broad assessor agreement or consistency.
- Stripe's configured live price is active, £14.99 GBP, per unit, licensed, every one month, and attached to the configured product. The checkout now rejects quarterly/tiered/metered prices that could otherwise appear monthly.
- The enabled Stripe webhook points to `https://www.medwithrish.com/api/stripe/webhook`, with `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted`. Automated billing tests cover signature validation, ownership, subscription synchronization and checkout routing. No real payment or cancellation was performed.
- `https://medicforest.com/pricing` returns 200 and shows 14.99; the production health endpoint returns 200. Both are hosted on Vercel.
- Production dependency audit: zero vulnerabilities after compatible patch updates. Five high findings remain in development-only braces/micromatch/fast-glob lint dependencies. npm's offered fix downgrades eslint-config-next to Next 14; do not apply that incompatible forced downgrade.

## Deployment steps still requiring account access

1. Apply `supabase/medicforest_interview_scoring_v2.sql` before deployment. It updates installed scoring readers without changing saved reports or removing moderation and permissions. The v2 public RPC deliberately remains unavailable on an unmigrated installation.
2. Confirm the host has `OPENAI_API_KEY` and `INTERVIEW_OPENAI_MODEL=gpt-6-luna`. Local configuration does not establish production configuration.
3. After deployment, check a signed-in browser can start a station, answer an ethics probe and receive feedback; check a script without browser classification is rejected before inference. BotID Basic is configured in code and does not use the optional Deep Analysis tier. Local development is explicitly bypassed by the SDK.
4. Configure aggregate hosting WAF limits, provider project spend/usage limits, and Supabase signup CAPTCHA and email verification. Existing database account quotas and inference claims remain in place. Instance-local throttles cannot establish a global spend ceiling.
5. Consider enabling `customer.subscription.created` and `checkout.session.async_payment_succeeded` on the existing Stripe webhook, matching the events the handler already supports. Check checkout → entitlement, renewal failure, cancellation and billing portal in Stripe test mode with a test account. The live webhook secret's match to production and actual end-to-end payment behavior were not proven by a read-only configuration check.
6. Extend the synthetic scoring workbook with human-reviewed motivation, reflection, NHS, data/image and equality cases. Compare score ordering, supported weaknesses, alternative ethical conclusions and repeated-run variance. Use the opt-in evaluation script deliberately because it consumes API quota.

Database management, hosting management and a signed-in production test session were unavailable in this workspace. These steps have not been performed.
