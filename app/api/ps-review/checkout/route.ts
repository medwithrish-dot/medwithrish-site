import { createStripeClient } from "@/utils/stripe";
import { getRequiredSiteUrl } from "@/utils/site-url";
import { createAdminClient } from "@/utils/supabase/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const fields = body as Record<string, unknown>;
  const email = typeof fields.email === "string" ? fields.email.trim() : "";
  const { reviewType, filePath } = fields;

  if (!email || !reviewType || !filePath) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (reviewType !== "medicine" && reviewType !== "dental") {
    return Response.json({ error: "Invalid review type." }, { status: 400 });
  }

  if (email.length > 254 || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(email)) {
    return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (typeof filePath !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.pdf$/i.test(filePath)) {
    return Response.json({ error: "Invalid uploaded file." }, { status: 400 });
  }

  const priceId = process.env.STRIPE_PS_REVIEW_PRICE_ID;
  if (!priceId) {
    return Response.json({ error: "Missing price configuration." }, { status: 500 });
  }

  try {
    const { data: fileExists, error: fileError } = await createAdminClient().storage
      .from("ps-uploads")
      .exists(filePath);
    if (fileError) throw fileError;
    if (!fileExists) {
      return Response.json({ error: "Please upload your personal statement before checking out." }, { status: 400 });
    }

    const stripe = createStripeClient();
    const siteUrl = getRequiredSiteUrl(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/?stage=05&scroll=ps-submission&checkout=success#journey`,
      cancel_url: `${siteUrl}/?stage=05&scroll=ps-submission&checkout=cancelled#journey`,
      metadata: {
        submission_type: "ps_review",
        student_email: email,
        file_path: filePath,
        review_type: reviewType,
      },
    });

    if (!session.url) {
      return Response.json({ error: "Stripe did not return a checkout URL." }, { status: 500 });
    }

    return Response.json({ url: session.url });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Could not start checkout." },
      { status: 500 }
    );
  }
}
