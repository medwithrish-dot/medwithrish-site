# PhloemAI Supabase Setup

## Keys Needed

Add these to `.env.local` for local dev and to Vercel Environment Variables
for production:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ramtuouzzsrhejisruxf.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_y8TaLFxvRGCcHOJ-YZ2I4w_WdJWcRRn
NEXT_PUBLIC_SITE_URL=https://www.medwithrish.com

SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY

STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Do not put the `service_role` key or Stripe secret key in frontend code or in
`NEXT_PUBLIC_*`.

## SQL Editor

Run these in the Supabase SQL Editor, in this order:

1. `supabase/phloemai_setup.sql`
2. `supabase/phloemai_stripe_setup.sql`

## Auth Settings

In Supabase Dashboard:

- Authentication > Providers > Email: enabled.
- Authentication > URL Configuration > Site URL:
  - Production: `https://www.medwithrish.com`
  - Local, only if testing locally: `http://localhost:3000`
- Authentication > URL Configuration > Redirect URLs:
  - `http://localhost:3000/phloemai/dashboard`
  - `http://localhost:3001/phloemai/dashboard`
  - `https://www.medwithrish.com/phloemai/dashboard`
  - `https://medwithrish.com/phloemai/dashboard`
- Authentication > Signups: enabled.
- Email confirmations:
  - Recommended for production: enabled.
  - Easier local testing: disabled temporarily.
- Password policy: minimum 8 characters.
- SMTP: configure before production so confirmation emails reliably send.

## RLS Policies

The SQL enables Row Level Security on all PhloemAI tables. The policies allow
authenticated users to select, insert, update and delete only rows where the
row belongs to `auth.uid()`.

The profile row is created automatically by a trigger when a new Supabase Auth
user is created.

## Stripe Settings

Create one recurring product/price in Stripe for Premium. Use that price ID as
`STRIPE_PREMIUM_PRICE_ID`.

Create a webhook endpoint:

```text
https://www.medwithrish.com/api/stripe/webhook
```

Subscribe it to these events:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

For local webhook testing, use the Stripe CLI to forward events to:

```text
http://localhost:3000/api/stripe/webhook
```
