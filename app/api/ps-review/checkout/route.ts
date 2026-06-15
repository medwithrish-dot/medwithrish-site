import { createStripeClient } from "@/utils/stripe";
import { getRequiredSiteUrl } from "@/utils/site-url";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const { email, reviewType, filePath } = await request.json();

  if (!email || !reviewType || !filePath) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!["medicine", "dental"].includes(reviewType)) {
    return Response.json({ error: "Invalid review type." }, { status: 400 });
  }

  const priceId = process.env.STRIPE_PS_REVIEW_PRICE_ID;
  if (!priceId) {
    return Response.json({ error: "Missing price configuration." }, { status: 500 });
  }

  try {
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
