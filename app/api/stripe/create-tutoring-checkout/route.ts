import { createStripeClient } from "@/utils/billing/stripe-client";
import { getRequiredSiteUrl } from "@/utils/site-url";

export const runtime = "nodejs";

type TutoringPackageMeta = {
  name: string;
  amountGbp: number;
  envKey: string;
};

const TUTORING_PACKAGES: Record<string, TutoringPackageMeta> = {
  "ucat-rish": {
    name: "UCAT Crash Course with MedWithRish",
    amountGbp: 140,
    envKey: "STRIPE_PRICE_TUTORING_UCAT_RISH",
  },
  "ucat-specialist": {
    name: "UCAT Crash Course with MedicForest Specialist",
    amountGbp: 100,
    envKey: "STRIPE_PRICE_TUTORING_UCAT_SPECIALIST",
  },
  "interview-rish": {
    name: "1–1 Interview Tutoring with MedWithRish",
    amountGbp: 140,
    envKey: "STRIPE_PRICE_TUTORING_INTERVIEW_RISH",
  },
  "interview-specialist": {
    name: "1–1 Interview Tutoring with MedicForest Specialist",
    amountGbp: 100,
    envKey: "STRIPE_PRICE_TUTORING_INTERVIEW_SPECIALIST",
  },
  "complete-bundle": {
    name: "Complete Admissions Package (UCAT, PS & Interviews)",
    amountGbp: 200,
    envKey: "STRIPE_PRICE_TUTORING_COMPLETE_BUNDLE",
  },
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { packageId?: string };
    const packageId = body?.packageId;

    if (!packageId || !TUTORING_PACKAGES[packageId]) {
      return Response.json({ error: "Invalid tutoring package selected." }, { status: 400 });
    }

    const pkg = TUTORING_PACKAGES[packageId];
    const priceId = process.env[pkg.envKey]?.trim();

    if (!priceId) {
      return Response.json({
        configured: false,
        packageId,
        packageName: pkg.name,
        priceFormatted: `£${pkg.amountGbp}`,
        envKey: pkg.envKey,
        message: `Stripe price key ${pkg.envKey} is not yet configured.`,
      });
    }

    const stripe = createStripeClient();
    const siteUrl = getRequiredSiteUrl(request);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${siteUrl}/medicforest/tutoring?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/medicforest/tutoring?status=cancelled`,
      metadata: {
        packageId,
        packageName: pkg.name,
        service: "tutoring",
      },
    });

    return Response.json({ configured: true, url: session.url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout error occurred.";
    return Response.json({ error: message }, { status: 500 });
  }
}
