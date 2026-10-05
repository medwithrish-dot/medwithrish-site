# Stripe environment variables

The same server-only variables configure local development and Vercel. These
values connect each checkout button to its active Stripe price:

```dotenv
STRIPE_PREMIUM_PRICE_ID=price_1UNHeSBe7e6nC6Nc8mjcEQfj
STRIPE_PREMIUM_PRODUCT_ID=prod_VO3mL7T03Wplol
STRIPE_PRICE_TUTORING_INTERVIEW_RISH=price_1UNI2eBe7e6nC6NcKPTF0mys
STRIPE_PRICE_TUTORING_UCAT_RISH=price_1UNI4vBe7e6nC6NcNjAMlR3M
STRIPE_PRICE_TUTORING_INTERVIEW_SPECIALIST=price_1UNI6aBe7e6nC6Ncd3xgEbXT
STRIPE_PRICE_TUTORING_UCAT_SPECIALIST=price_1UNI8UBe7e6nC6Nck1UKG6iA
STRIPE_PRICE_TUTORING_COMPLETE_BUNDLE=price_1UNIA9Be7e6nC6NcHLRBbzGG
```

For local development, paste that block into the root `.env.local` file. The
file must also contain the matching Stripe account's secret key:

```dotenv
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

For Vercel, open the project's **Settings > Environment Variables**, paste the
first block using the bulk `.env` import, select Production, Preview and
Development as appropriate, then save. Add `STRIPE_SECRET_KEY` and
`STRIPE_WEBHOOK_SECRET` separately if they are not already configured. Redeploy
the latest commit after changing Vercel variables because an existing deployment
does not receive newly saved values.

All variables are server-only. Do not add `NEXT_PUBLIC_` to their names.

## Price mapping

| Checkout | Stripe billing | Price variable |
| --- | --- | --- |
| MedicForest Premium | £14.99 monthly | `STRIPE_PREMIUM_PRICE_ID` |
| MedWithRish interview package | £140 once | `STRIPE_PRICE_TUTORING_INTERVIEW_RISH` |
| MedWithRish UCAT package | £140 once | `STRIPE_PRICE_TUTORING_UCAT_RISH` |
| Specialist interview package | £100 once | `STRIPE_PRICE_TUTORING_INTERVIEW_SPECIALIST` |
| Specialist UCAT package | £100 once | `STRIPE_PRICE_TUTORING_UCAT_SPECIALIST` |
| Specialist complete admissions package | £200 once | `STRIPE_PRICE_TUTORING_COMPLETE_BUNDLE` |

Premium access also needs the Stripe webhook at
`https://medicforest.com/api/stripe/webhook` with these events enabled:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
