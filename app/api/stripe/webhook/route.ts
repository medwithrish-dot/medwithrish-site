import type Stripe from "stripe";
import { Resend } from "resend";
import { createStripeClient } from "@/utils/stripe";
import { createAdminClient } from "@/utils/supabase/admin";
import { syncStripeSubscription } from "@/utils/stripe-subscriptions";

export const runtime = "nodejs";

function escapeHtml(value: string) {
  const entities: Record<string, string> = {
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character]);
}

async function handlePSReviewPayment(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") return;
  const { student_email, file_path, review_type } = session.metadata ?? {};
  if (!student_email || !file_path || (review_type !== "medicine" && review_type !== "dental")) {
    throw new Error("Personal statement payment is missing submission details.");
  }

  const admin = createAdminClient();

  const { error: submissionError } = await admin.from("ps_submissions").insert({
    student_email,
    file_path,
    review_type,
    stripe_session_id: session.id,
  });
  // A duplicate session can occur when Stripe retries a previously received event.
  if (submissionError) {
    if (submissionError.code !== "23505") throw submissionError;
    const { data: existing, error: existingError } = await admin
      .from("ps_submissions")
      .select("stripe_session_id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();
    if (existingError || !existing) throw existingError ?? submissionError;
  }

  const { data: signedUrlData, error: signedUrlError } = await admin.storage
    .from("ps-uploads")
    .createSignedUrl(file_path, 365 * 24 * 60 * 60);

  if (signedUrlError) throw signedUrlError;

  const downloadUrl = signedUrlData?.signedUrl ?? null;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const label = review_type === "medicine" ? "Medicine" : "Dental";
  const safeEmail = escapeHtml(student_email);
  const paidAt = new Date(session.created * 1000).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/London",
  });

  const { error: emailError } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "medwithrish@gmail.com",
    subject: `New PS Review Submission — ${label}`,
    html: `
      <h2 style="font-family:sans-serif;margin:0 0 16px">New Personal Statement Review</h2>
      <table style="font-family:sans-serif;font-size:15px;border-collapse:collapse;width:100%;max-width:480px">
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:600;width:140px">Review type</td>
          <td style="padding:8px 12px">${label}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Student email</td>
          <td style="padding:8px 12px"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:600">Paid at</td>
          <td style="padding:8px 12px">${paidAt}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#f5f5f5;font-weight:600">PDF</td>
          <td style="padding:8px 12px">
            ${downloadUrl
              ? `<a href="${escapeHtml(downloadUrl)}" style="color:#2563eb;font-weight:600">Download personal statement</a> (link valid for 1 year)`
              : "File unavailable — check Supabase storage bucket <strong>ps-uploads</strong>."}
          </td>
        </tr>
      </table>
    `,
  });
  if (emailError) throw new Error(emailError.message);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let stripe: ReturnType<typeof createStripeClient>;
  try {
    stripe = createStripeClient();
  } catch {
    return Response.json({ error: "Stripe is not configured." }, { status: 500 });
  }

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Invalid Stripe webhook.",
      },
      { status: 400 }
    );
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === "payment" && session.metadata?.submission_type === "ps_review") {
        await handlePSReviewPayment(session);
      }

      if (session.mode === "subscription") {
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await syncStripeSubscription(subscription);
        }
      }
    }

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      // Stripe may deliver events out of order; reconcile the current state.
      const subscription = await stripe.subscriptions.retrieve(event.data.object.id);
      await syncStripeSubscription(subscription);
    }

    return Response.json({ received: true });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not process webhook.",
      },
      { status: 500 }
    );
  }
}
