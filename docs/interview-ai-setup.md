# Interview AI setup and follow-up costs

Checked against official provider documentation on 12 September 2026.

For the requested **personal, free setup**, the owner has confirmed the key's project is on Free Tier, and Gemini is enabled locally through the ignored `.env.local` file. Both generated follow-ups and feedback default to **Gemini 3.5 Flash-Lite**, which Google's pricing lists with free developer quota. Other environments stay off until configured with a matching key and free-tier confirmation. [Google pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=en)

A 12 September generation check with the configured key succeeded on 3.5 Flash-Lite. The cheaper 2.5 Flash-Lite returned HTTP 404 saying it was unavailable to new users and recommending 3.5 Flash-Lite, even though it appeared in the model list. Therefore 2.5 is a price comparator, not the working default for this key. A successful generation confirms the key/model works; it does not verify the project's billing tier. Model availability is account-dependent; check actual generation as well as the [model lifecycle](https://ai.google.dev/gemini-api/docs/deprecations).

## Keep personal practice free

Use a key from your own [Google AI Studio account](https://aistudio.google.com/apikey), attached to a project that remains on **Free Tier with no linked Cloud Billing account**. In AI Studio's Projects/API keys page, check the Billing Tier column; “Set up billing” means no billing account is attached. Do not click it, link billing, or purchase credits for this setup. Keys inherit their project's billing state. [Google billing and tier verification](https://ai.google.dev/gemini-api/docs/billing)

Both Gemini request paths require `INTERVIEW_GEMINI_FREE_TIER_CONFIRMED=true` as well as a key. The owner confirmed Free Tier on 12 September, so this flag is enabled in the local ignored environment file; neither the real key nor the local environment file is committed. These code changes do not enable billing, add payment details or buy credits. There is no automatic model or provider fallback. In environments without confirmation, or when free quota is unavailable, built-in follow-ups and saved answers remain available.

There is no documented per-request “free only” switch: using a model with free quota does not force free billing on a paid project. Keeping the key's project unlinked from billing is the spending protection. A successful model-list request confirms API access, not free-tier status. [Gemini generation request fields](https://ai.google.dev/api/generate-content), [Google project billing](https://ai.google.dev/gemini-api/docs/billing)

For an automated read-only check, Google's `projects.getBillingInfo` returns `billingEnabled`. It needs the project ID, an OAuth credential and `resourcemanager.projects.get` permission; the Gemini API key alone is insufficient. Without that access, verify the project's tier in AI Studio. [Cloud Billing read API](https://docs.cloud.google.com/billing/docs/reference/rest/v1/projects/getBillingInfo), [billing status fields](https://docs.cloud.google.com/billing/docs/reference/rest/v1/ProjectBillingInfo)

## Server configuration

For a new environment, start with this configuration. The current local `.env.local` has already been enabled after the owner's confirmation:

```dotenv
GEMINI_API_KEY=your-own-key
INTERVIEW_GEMINI_FREE_TIER_CONFIRMED=false
INTERVIEW_FOLLOWUP_GEMINI_MODEL=gemini-3.5-flash-lite
INTERVIEW_GEMINI_MODEL=gemini-3.5-flash-lite
```

After confirming the key's exact project shows **Free Tier** and has no linked billing account in AI Studio, set `INTERVIEW_GEMINI_FREE_TIER_CONFIRMED=true` and restart or redeploy. Leave it unset or `false` while unsure. This is an owner confirmation, not an automatic query of Google's billing system; unset it again if the project or key changes until the new tier is verified.

For deployment, set the corresponding key and confirmation flag in the host's server environment separately. A Git push does not copy `.env.local` or enable hosted AI. The committed code defaults to disabled when confirmation is missing.

`GEMINI_API_KEY` is required for both generation and feedback. The two model variables are optional overrides with the defaults shown; accepted overrides are 2.5, 3.1 and 3.5 Flash-Lite, with no automatic model switching. Keep the key out of Git, browser requests and `NEXT_PUBLIC_` variables; only the server contacts Google. Restrict the key to the Gemini API. [Google key setup and security](https://ai.google.dev/gemini-api/docs/api-key)

The existing Supabase account, service-role and interview database setup are still required; see [interview platform setup](interview-platform-setup.md). Do not infer a working production key from a local environment file. A missing key, rejected key or provider quota failure must leave saved answers and ordinary practice usable. Enabling an account's billing is a separate owner action; changing these variables does not activate billing or purchase credit.

## What “training it for medicine interviews” means here

The implementation uses a specialised examiner prompt and the saved station context. It does not fine-tune model weights or upload a training dataset. After a candidate answers, the examiner asks one concise question about a specific point in that answer: evidence, reflection, an alternative perspective, or what the candidate learned. For example, “I enjoyed helping patients on placement” could lead to “Which interaction changed your understanding of a doctor's responsibilities, and why?”

The prompt supplies the UK medicine-interview purpose, station question and answer; it asks for one probe and treats candidate text as evidence rather than instructions. It should avoid invented candidate experiences, claims about confidential university marking criteria, premature scoring and clinical advice. Saved feedback remains a separate assessment. No web search, retrieval service or paid voice model is needed to generate a probe.

Review anonymised or synthetic answers with a human interviewer before relying on the feedback: include vague answers, strong reflection, ethical disagreements, incomplete transcripts, repeated answers and attempts to manipulate the prompt. Measure relevance and usefulness alongside response time and cost.

## Paid cost comparison

Illustrative usage: **2,000 input tokens and 100 total billable output tokens per probe**, including the examiner instructions, relevant answer/context and any reasoning tokens. These are planning assumptions, not measured usage or an output guarantee. Prices below are ordinary uncached text rates, without search, batch discounts or voice.

| Provider/model | USD per million input/output tokens | USD per 1,000 probes |
| --- | ---: | ---: |
| Groq, `openai/gpt-oss-20b` | $0.075 / $0.30 | **$0.18** |
| Google, `gemini-2.5-flash-lite` | $0.10 / $0.40 | **$0.24** |
| Google, `gemini-3.1-flash-lite` | $0.25 / $1.50 | $0.65 |
| Google, `gemini-3.5-flash-lite` | $0.30 / $2.50 | $0.85 |

Sources: [Google pricing](https://ai.google.dev/gemini-api/docs/pricing?hl=en), [Groq model pricing](https://console.groq.com/docs/model/openai/gpt-oss-20b).

These paid prices are for a possible future upgrade; the requested setup targets free quota on an unbilled project. Groq is the cheapest of these checked options under the same token assumptions. Its model still needs interview-quality evaluation and a separate provider integration; a lower token rate does not guarantee a lower bill if it generates more reasoning or retries. Gemini 2.5 Flash-Lite is cheaper on paper but unavailable to the configured key; 3.5 Flash-Lite is the verified working Gemini choice. This is not an exhaustive market comparison or a claim that either model has been clinically or educationally validated.

Formula: `probes * (input_tokens * input_rate + billable_output_tokens * output_rate) / 1,000,000`. Add 20% for retry/usage variance when budgeting; 1,000 paid Gemini 3.5 Flash-Lite probes would then be about $1.02. Three probes cost three requests. Station feedback, transcription, generated speech, hosting, storage and taxes are additional. Browser speech playback does not become more natural merely by changing the text model.

## Quotas and operation

Google limits requests per minute, input tokens per minute and requests per day at project level. Multiple keys do not multiply the project's allowance. Exact limits vary by model and account; inspect the project's active limits in AI Studio rather than hard-coding a public free-tier number. Daily provider quotas reset at midnight Pacific time. [Google rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)

The interview flow bounds follow-ups to one per original question and at most three per attempt. Existing application allowances remain free: 2 station starts per rolling day and 30 per rolling 30 days; premium: 20/day and 300/30 days. These application quotas are separate from Google's project quota and do not establish simultaneous-user capacity. Reuse saved probes, keep generation requests bounded, monitor actual token usage and use the catalogue fallback when generation is unavailable.

`429 RESOURCE_EXHAUSTED` means a provider limit was hit; it does not mean the key is invalid. A quota error naming `free_tier` identifies the free quota involved in that request. A reported limit of zero means that model/request currently has no usable allocation; it does not promise that waiting will restore access. Do not enable billing to work around that error in this personal setup. Check AI Studio's model quota, wait if a nonzero daily/minute quota was exhausted, and continue with saved or catalogue questions. [Google error reference](https://ai.google.dev/gemini-api/docs/generate-content/api-errors), [Google quota documentation](https://ai.google.dev/gemini-api/docs/rate-limits)

## Before any wider rollout

Google requires Paid Services for API clients offered to UK/EEA/Swiss users and prohibits clients directed towards or likely accessed by under-18s. Revisit those restrictions before opening this personal setup to applicants. For UK/EEA/Swiss developers, paid-service data-use terms apply even to unpaid quota: prompts/responses are not used for product improvement, though limited safety logging remains. Other unpaid use may include product improvement and human review. [Gemini API terms](https://ai.google.dev/gemini-api/terms)
