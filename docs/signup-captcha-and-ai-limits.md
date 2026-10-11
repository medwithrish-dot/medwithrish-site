# Signup CAPTCHA and AI abuse protection

These changes are prepared locally. No hosting or Supabase settings have been changed.

## Activate before your manual release

1. Create a Cloudflare Turnstile widget in **Managed** mode. Allow `medicforest.com`, `www.medicforest.com`, and any other actual signup hosts (including `medwithrish.com` if used). Add `localhost` only to a development widget. Never use Cloudflare's test keys in production.
2. Add the widget's public site key as `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel (and your local environment when testing). Public variables are captured during the build, so rebuild after changing the key. The private secret belongs in Supabase, not in a public environment variable.
3. Run [medicforest_ai_abuse_limits.sql](../supabase/medicforest_ai_abuse_limits.sql) in Supabase SQL Editor **before deploying the code**. Both complete setup scripts also include this migration. It is safe to rerun and preserves existing accounts, plans, counters and answers. AI requests fail safely if this migration is missing.
4. Build and deploy the changes manually. Then enable CAPTCHA protection in Supabase **Authentication → Bot and Abuse Protection**, choose Turnstile, and enter its secret. Coordinate the switch with deployment: enabling it before the updated forms are live prevents older forms from signing up or logging in. Require email confirmation for new accounts as well.
5. Test signup, verification emails and password login in a real browser on each allowed host. Check that calling Supabase signup directly without a token is rejected. Test an expired token or incorrect password, then retry without losing the form's entered values. Run `npm test`, `npm run typecheck`, and `npm run build` before releasing.

The widget normally runs without asking the visitor to solve anything; an interactive check appears when Turnstile requires it. The signup and UCAT popup both submit single-use tokens to Supabase for server validation. Password login also supplies a token because Supabase CAPTCHA applies to that flow too. Each submission or authentication-tab change creates a fresh challenge. Missing configuration leaves the current forms unchanged; setting only the public key does **not** secure the direct Supabase signup endpoint. Enabling CAPTCHA in Supabase is essential.

Sources: [Supabase CAPTCHA configuration](https://supabase.com/docs/guides/auth/auth-captcha), [Turnstile widget configuration](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/widget-configurations/).

## AI limits

The new counters are atomic database records per **authenticated account**, shared by all server instances. Browsers cannot read or reset them. They do not use a user's IP address or classify anyone as a bot.

| Work | Per minute | Per 24 hours |
| --- | ---: | ---: |
| Feedback and new follow-ups, combined | 12 | 240 |
| Generated Google speech requests | 30 | 720 |

These are generous abuse ceilings above normal practice and the default Premium allowance of 20 attempts/day. Existing free trials, monthly/daily attempt quotas, three follow-ups per station, one generation claim per main answer, and three grading retries remain enforced. Saved follow-ups and completed feedback are returned before consuming new generation allowance. Audio playback and concurrent requests still share the existing in-process cache; the speech request ceiling also bounds repeated requests across instances, even when their caches differ.

Limits expire automatically. A limit response asks the user to pause, preserves answers and does not use a grading retry or ban the account. An additional coarse IP flood ceiling allows multiple people on the same school or home network; it does not count them as one AI account. Existing Vercel BotID protection still applies independently. No anti-bot system can guarantee zero false positives: confirm browser access in production, monitor temporary errors, and keep the limits above observed legitimate demand.

CAPTCHA and account quotas make abuse harder, but do not eliminate bot-created accounts. Set provider/project budget alerts and hosting WAF flood protection as additional cost controls; the in-process concurrency guard and caches cannot impose a global provider spend cap.
