import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getRequiredSiteUrl } from "@/utils/site-url";

export const runtime = "nodejs";

const TUTORING_PRICE_ENV_MAP: Record<string, string | undefined> = {
  "ucat-rish": process.env.STRIPE_PRICE_TUTORING_UCAT_RISH,
  "ucat-specialist": process.env.STRIPE_PRICE_TUTORING_UCAT_SPECIALIST,
  "complete-bundle": process.env.STRIPE_PRICE_TUTORING_COMPLETE_BUNDLE,
  "interview-rish": process.env.STRIPE_PRICE_TUTORING_INTERVIEW_RISH,
  "interview-specialist": process.env.STRIPE_PRICE_TUTORING_INTERVIEW_SPECIALIST,
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      packageId?: string;
    } | null;

    if (!body?.packageId) {
      return NextResponse.json(
        { error: "Missing packageId parameter" },
        { status: 400 }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
    const priceId = TUTORING_PRICE_ENV_MAP[body.packageId]?.trim();

    if (!secretKey || !priceId) {
      // Gracefully signal to client that direct online checkout is unconfigured
      // so it immediately opens direct consultation / WhatsApp / email booking dialogue.
      return NextResponse.json({
        configured: false,
        message: "Stripe Price ID not yet configured for this tutoring package",
      });
    }

    const stripe = new Stripe(secretKey);
    const siteUrl = getRequiredSiteUrl(request);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/medicforest/tutoring?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/medicforest/tutoring?status=cancelled`,
      metadata: {
        packageId: body.packageId,
        source: "medicforest-tutoring",
      },
    });

    return NextResponse.json({
      configured: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating tutoring checkout session:", error);
    return NextResponse.json(
      {
        configured: false,
        error: error instanceof Error ? error.message : "Failed to create session",
      },
      { status: 500 }
    );
  }
}

