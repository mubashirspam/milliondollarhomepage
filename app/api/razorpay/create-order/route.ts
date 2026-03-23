// app/api/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { razorpay } from "@/lib/razorpay";
import { sql } from "@/lib/db";
import { PIXEL_PRICE } from "@/lib/utils";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
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

    // Check if any pixels are already taken
    const pixelCoords = pixels as { x: number; y: number }[];
    for (const p of pixelCoords) {
      const existing = await sql`SELECT id FROM pixel WHERE x = ${p.x} AND y = ${p.y}`;
      if (existing.length > 0) {
        return NextResponse.json(
          { error: `Pixel (${p.x}, ${p.y}) is already taken` },
          { status: 409 }
        );
      }
    }

    const amountInPaise = pixels.length * PIXEL_PRICE; // ₹1 per pixel = 100 paise

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: {
        userId: session.user.id,
        pixelCount: String(pixels.length),
      },
    });

    // Create pending purchase record
    await sql`
      INSERT INTO purchase ("id", "userId", "amount", "pixelCount", "status", "razorpayOrderId", "metadata")
      VALUES (
        gen_random_uuid()::text,
        ${session.user.id},
        ${amountInPaise},
        ${pixels.length},
        'pending',
        ${order.id},
        ${JSON.stringify({ pixels })}
      )
    `;

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: amountInPaise,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    );
  }
}
