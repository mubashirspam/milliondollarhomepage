// app/api/razorpay/verify/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { randomColor } from "@/lib/utils";
import { headers } from "next/headers";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { error: "Missing payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find the pending purchase
    const purchases = await sql`
      SELECT * FROM purchase
      WHERE "razorpayOrderId" = ${razorpay_order_id}
        AND "userId" = ${session.user.id}
        AND status = 'pending'
    `;
    const purchase = purchases[0];

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    const metadata = purchase.metadata
      ? (JSON.parse(purchase.metadata) as { pixels: { x: number; y: number }[] })
      : null;
    const pixels = metadata?.pixels || [];

    if (pixels.length === 0) {
      return NextResponse.json(
        { error: "No pixels in purchase" },
        { status: 400 }
      );
    }

    // Update purchase and create pixels
    await sql`
      UPDATE purchase SET
        status = 'completed',
        "razorpayPaymentId" = ${razorpay_payment_id},
        "updatedAt" = now()
      WHERE id = ${purchase.id}
    `;

    // Create pixels (skip duplicates)
    for (const p of pixels) {
      await sql`
        INSERT INTO pixel (id, x, y, color, "ownerId")
        VALUES (gen_random_uuid()::text, ${p.x}, ${p.y}, ${randomColor()}, ${session.user.id})
        ON CONFLICT (x, y) DO NOTHING
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${pixels.length} pixel${pixels.length > 1 ? "s" : ""}!`,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
