# Fix signup email rate limits

Supabase's `over_email_send_rate_limit` / `email rate limit exceeded` is an email-sending quota shared by the whole project, including signup confirmations and password recovery. Separate locations do not get separate email allowances. The built-in sender currently allows only 2 emails/hour and is intended for testing with project team addresses, not public production signups.

The app submits signup directly from the browser to Supabase, with no shared application server IP in between. CAPTCHA tokens are already supported by both account forms. CAPTCHA protects against abuse; it does not raise email capacity.

## Required hosted configuration

1. In Resend, verify a domain you control and complete its required DNS records. Use a sender on that verified domain, for example `accounts@medicforest.com` only if `medicforest.com` is verified. The local Resend key is restricted to sending, so domain verification could not be inspected automatically.
2. In Supabase **Authentication > Email > SMTP Settings**, enable custom SMTP and save:

   | Field | Value |
   | --- | --- |
   | Sender email | An address on your verified Resend domain |
   | Sender name | MedicForest |
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | A Resend API key with permission to send from that domain |

   Enter the key privately in Supabase; never put it in a `NEXT_PUBLIC_` variable or commit it. An existing `RESEND_API_KEY` in the app does not automatically configure Supabase's mailer.
3. In **Authentication > Rate Limits**, raise **Email sending rate limit** to match legitimate peak signup and recovery demand and your Resend allowance. Custom SMTP initially defaults to 30 emails/hour. For example, use 100/hour only if your provider allowance supports that volume; allow for password resets as well as signups. Keep per-address resend cooldowns.
4. Keep email confirmation enabled. Keep Turnstile configured in **Authentication > Bot and Abuse Protection**, using the secret that matches the deployed `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. No CAPTCHA change is needed to resolve the email quota itself.
5. Test two new addresses consecutively, confirm both emails arrive, follow both verification links, and log in. If still limited, inspect Supabase Auth logs and the configured project email limit, then Resend delivery logs and sending allowance. Avoid repeated automated signup retries, which consume quota.

The SMTP/rate-limit changes take effect in Supabase without an app rebuild. The frontend error-message changes do not increase that hosted quota. No production SMTP or rate-limit settings were changed during this fix: Supabase management credentials were unavailable.

References: [Supabase SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [Supabase rate limits](https://supabase.com/docs/guides/auth/rate-limits), [Resend with Supabase SMTP](https://resend.com/docs/send-with-supabase-smtp).
