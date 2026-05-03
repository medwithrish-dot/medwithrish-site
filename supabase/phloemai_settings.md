# PhloemAI Supabase Setup

## Keys Needed

Add these to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Do not put the `service_role` key in the frontend or in `NEXT_PUBLIC_*`.

## SQL Editor

Run `supabase/phloemai_setup.sql` in the Supabase SQL Editor.

## Auth Settings

In Supabase Dashboard:

- Authentication > Providers > Email: enabled.
- Authentication > URL Configuration > Site URL:
  - Local: `http://localhost:3000`
  - Production: your deployed site URL.
- Authentication > URL Configuration > Redirect URLs:
  - `http://localhost:3000/phloemai/dashboard`
  - `https://YOUR_DOMAIN/phloemai/dashboard`
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
