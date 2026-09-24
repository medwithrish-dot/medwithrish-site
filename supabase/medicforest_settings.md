# MedicForest Supabase Setup

## Keys Needed

Add these to `.env.local` for local dev and to Vercel Environment Variables
for production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ramtuouzzsrhejisruxf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_y8TaLFxvRGCcHOJ-YZ2I4w_WdJWcRRn
NEXT_PUBLIC_SITE_URL=https://www.medwithrish.com
NEXT_PUBLIC_PRODUCT_SITE_URL=https://medicforest.com

SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
# Optional safety check if you want checkout to verify the product too:
STRIPE_PREMIUM_PRODUCT_ID=prod_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Do not put the `service_role` key or Stripe secret key in frontend code or in
`NEXT_PUBLIC_*`.

## SQL Editor

Run these in the Supabase SQL Editor, in this order:

1. `supabase/medicforest_setup.sql`
2. `supabase/medicforest_stripe_setup.sql`
3. `supabase/medicforest_practice_setup.sql`
4. `supabase/medicforest_interview_question_progress.sql`
5. `supabase/medicforest_security_patch.sql`

## Auth Settings

In Supabase Dashboard:

- Authentication > Providers > Email: enabled.
- Authentication > URL Configuration > Site URL:
  - Production: `https://medicforest.com`
  - Local, only if testing locally: `http://localhost:3000`
- Authentication > URL Configuration > Redirect URLs:
  - `http://localhost:3000/medicforest/ucat/dashboard`
  - `http://localhost:3001/medicforest/ucat/dashboard`
  - `https://medicforest.com/medicforest/ucat/dashboard`
  - `https://www.medwithrish.com/medicforest/ucat/dashboard`
  - `https://medwithrish.com/medicforest/ucat/dashboard`
- Authentication > Signups: enabled.
- Email confirmations:
  - Recommended for production: enabled.
  - Easier local testing: disabled temporarily.
- Password policy: minimum 8 characters.
- SMTP: configure before production so confirmation emails reliably send.

## RLS Policies

The SQL enables Row Level Security on all MedicForest tables. The policies allow
authenticated users to select, insert, update and delete only rows where the
row belongs to `auth.uid()`.

The profile row is created automatically by a trigger when a new Supabase Auth
user is created.

## Stripe Settings

Create one recurring product/price in Stripe for Premium. Use that price ID as
`STRIPE_PREMIUM_PRICE_ID`.

Create a webhook endpoint:

```text
https://medicforest.com/api/stripe/webhook
```

Subscribe it to these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

For local webhook testing, use the Stripe CLI to forward events to:

```text
http://localhost:3000/api/stripe/webhook
```
