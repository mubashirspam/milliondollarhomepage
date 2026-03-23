// app/api/webhooks/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { randomColor } from "@/lib/utils";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const purchase = await prisma.purchase.findUnique({
        where: { stripeSessionId: session.id },
      });

      if (!purchase) {
        console.error("Purchase not found for session:", session.id);
        return NextResponse.json(
          { error: "Purchase not found" },
          { status: 404 }
        );
      }

      // Create pixels in transaction
      const metadata = purchase.metadata
        ? (JSON.parse(purchase.metadata) as {
            pixels: { x: number; y: number }[];
          })
        : null;
      const pixels = metadata?.pixels || [];

      if (pixels.length === 0) {
        console.warn("No pixels found in purchase metadata:", purchase.id);
        return NextResponse.json({ received: true });
      }

      await prisma.$transaction([
        // Update purchase status
        prisma.purchase.update({
          where: { id: purchase.id },
          data: { status: "completed" },
        }),
        // Create pixels
        ...pixels.map((p: { x: number; y: number }) =>
          prisma.pixel.create({
            data: {
              x: p.x,
              y: p.y,
              color: randomColor(),
              ownerId: purchase.userId,
            },
          })
        ),
      ]);

      console.log("Successfully processed purchase:", purchase.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
