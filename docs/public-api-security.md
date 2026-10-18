# Public API security deployment

1. In your existing Supabase project, open **SQL Editor**, create a new query, and
   run all of `supabase/medicforest_public_api_security.sql` as `postgres`.
   This adds private quota and webhook receipt tables/RPCs; it does not alter
   accounts, prices, credits, answers or subscription records.
2. Deploy the matching application code. All six tutoring booking forms now send
   a retry key. No new service, paid plan, secret or CAPTCHA setting is required.

If GitHub pushes deploy automatically, apply the SQL promptly before testing the
new release. Until the SQL is applied, feedback, guest checkout and verified Stripe
webhooks return a temporary error rather than operate without their safeguards.
Stripe can retry failed webhook deliveries after setup is complete.

## Limits and shared networks

- Feedback: 3 valid submissions per IP per hour. Validation failures and honeypot
  submissions do not consume quota. Failed delivery attempts do consume quota to
  keep an outage from removing the abuse ceiling.
- Guest tutoring checkout: 20 valid requests per IP per hour, including retries.
  Guest payments, package prices and existing return destinations are preserved.
- An IP limit is shared by everyone using that IP, including schools. Feedback
  remains anonymous and available without login; once the network limit is used,
  the existing direct email contact remains available. Individual people cannot
  be distinguished reliably by an anonymous IP limit.
- Quotas are atomic in PostgreSQL and shared across application instances.
  Expired quota records are cleaned in bounded batches during later requests.
  Raw IPs/emails are not stored in quota tables; IPs use keyed fingerprints.

Vercel's trusted `x-vercel-forwarded-for` header supplies the IP automatically.
For a different production host, only set `TRUST_PROXY_HEADERS=true` if your
reverse proxy **overwrites** `x-real-ip` with the actual client IP. Untrusted or
missing production IPs cause HTTP 503, never a fallback to spoofable headers.
Local development uses a shared development bucket.

## Checkout retries

Each browser checkout intent has a UUID retained across failed requests and reloads
in session storage (memory only if browser storage is disabled). Stripe receives
the same idempotency key on retries. A successful response clears that intent, so
an intentional later purchase gets a new key. Intents expire after 23 hours, inside
Stripe's minimum 24-hour idempotency retention. No automatic payment retries are added.

## Webhook recovery

Signature verification happens before any receipt is claimed. Completed event IDs
are retained to suppress redelivery. Concurrent deliveries receive a retryable 503
while the original worker owns the claim. Successful processing marks completion;
failed processing releases the claim. If a worker crashes, a five-minute lease
allows a later delivery to recover. The webhook function has a 60-second maximum
duration, shorter than that lease.

Processing and marking completion are separate operations. A crash after billing
writes can cause those writes to be repeated during recovery; existing subscription
upserts and authoritative Stripe state reconciliation make that repetition safe.
No new email, fulfilment or charge side effects are introduced. This is durable
deduplication with retry-safe writes, not a claim of atomic exactly-once delivery
across Stripe and PostgreSQL.

## Failures and verification

Stripe requests have a 10-second timeout and no SDK retries; existing OpenAI calls
already have timeouts and retries disabled. Anthropic retries are now disabled.
Server and proxy Supabase fetches have an eight-second maximum, retaining tighter caller
signals. Resend keeps its ten-second timeout and no automatic retries.
Provider failures return generic errors and logs contain only provider, operation
and numeric status. Provider 429/5xx failures generally return 503 with Retry-After;
application quota failures return 429 with the actual remaining window.

Run `npm run test:security` for isolated provider mocks and embedded PostgreSQL tests.
These checks never contact live providers or send emails/create payments. After
deploying, submit one feedback message, open and cancel one guest checkout, and
confirm Stripe webhook deliveries return 2xx in your Stripe dashboard.

The embedded PostgreSQL test engine serializes queries. It exercises the real
SQL and overlapping handler delivery, but does not simulate lock contention
between separate database connections.

Reference: [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).
