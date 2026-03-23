// app/api/checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { PIXEL_PRICE } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pixels } = body; // Array of {x, y}

    if (!pixels || pixels.length === 0) {
      return NextResponse.json(
        { error: "No pixels provided" },
        { status: 400 }
      );
    }

    const amount = pixels.length * PIXEL_PRICE;

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Million Pixel Homepage",
              description: `Purchase ${pixels.length} pixel${
                pixels.length > 1 ? "s" : ""
              }`,
            },
            unit_amount: PIXEL_PRICE,
          },
          quantity: pixels.length,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXTAUTH_URL}?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}?canceled=true`,
      metadata: {
        userId: session.user.id,
        pixels: JSON.stringify(pixels),
      },
    });

    // Create pending purchase record
    await prisma.purchase.create({
      data: {
        userId: session.user.id,
        amount,
        pixelCount: pixels.length,
        status: "pending",
        stripeSessionId: stripeSession.id,
        metadata: JSON.stringify({ pixels }),
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: stripeSession.id,
      url: stripeSession.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
