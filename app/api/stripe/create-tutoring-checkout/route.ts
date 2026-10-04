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

function normaliseEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const email = value.trim();
  if (
    email.length === 0 ||
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return null;
  }

  return email;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      packageId?: string;
      email?: string;
      returnTo?: string;
    } | null;

    if (!body?.packageId || !(body.packageId in TUTORING_PRICE_ENV_MAP)) {
      return NextResponse.json(
        { error: "Please choose a valid tutoring package." },
        { status: 400 }
      );
    }

    const email = normaliseEmail(body.email);
    if (!email) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
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
    const returnPath =
      body.returnTo === "interviews"
        ? "/medicforest/interview/tutoring"
        : "/medicforest/tutoring";
    const source =
      body.returnTo === "interviews"
        ? "medicforest-interview-tutoring"
        : "medicforest-tutoring";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_creation: "always",
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url:
        siteUrl +
        returnPath +
        "?status=success&session_id={CHECKOUT_SESSION_ID}",
      cancel_url: siteUrl + returnPath + "?status=cancelled",
      metadata: {
        packageId: body.packageId,
        source,
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

