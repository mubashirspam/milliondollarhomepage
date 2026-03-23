// app/api/admin/data/route.ts
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto";

function verifyAdminToken(token: string | undefined): boolean {
  if (!token) return false;
  const expected = crypto
    .createHmac("sha256", process.env.ADMIN_SECRET!)
    .update(`${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`)
    .digest("hex");
  return token === expected;
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("admin_token")?.value;
    if (!verifyAdminToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [statsRows, purchasesRows, topBuyersRows] = await Promise.all([
      // Overall stats
      sql`
        SELECT
          COUNT(*) FILTER (WHERE status = 'completed') AS completed_orders,
          COUNT(*) FILTER (WHERE status = 'pending') AS pending_orders,
          COALESCE(SUM(amount) FILTER (WHERE status = 'completed'), 0) AS total_revenue_paise,
          COALESCE(SUM("pixelCount") FILTER (WHERE status = 'completed'), 0) AS total_pixels_sold,
          (SELECT COUNT(*) FROM "user") AS total_users
        FROM purchase
      `,
      // Recent purchases
      sql`
        SELECT
          p.id,
          p."userId",
          p.amount,
          p."pixelCount",
          p.status,
          p."razorpayOrderId",
          p."razorpayPaymentId",
          p."createdAt",
          u.name AS "userName",
          u.email AS "userEmail"
        FROM purchase p
        JOIN "user" u ON p."userId" = u.id
        ORDER BY p."createdAt" DESC
        LIMIT 100
      `,
      // Top buyers
      sql`
        SELECT
          u.id,
          u.name,
          u.email,
          COUNT(p.id) AS orders,
          COALESCE(SUM(p.amount), 0) AS total_spent_paise,
          COALESCE(SUM(p."pixelCount"), 0) AS total_pixels
        FROM "user" u
        LEFT JOIN purchase p ON p."userId" = u.id AND p.status = 'completed'
        GROUP BY u.id, u.name, u.email
        ORDER BY total_spent_paise DESC
        LIMIT 20
      `,
    ]);

    const stats = statsRows[0];

    return NextResponse.json({
      success: true,
      stats: {
        completedOrders: Number(stats.completed_orders),
        pendingOrders: Number(stats.pending_orders),
        totalRevenueINR: Number(stats.total_revenue_paise) / 100,
        totalPixelsSold: Number(stats.total_pixels_sold),
        totalUsers: Number(stats.total_users),
      },
      purchases: purchasesRows.map((p) => ({
        ...p,
        amountINR: Number(p.amount) / 100,
      })),
      topBuyers: topBuyersRows.map((b) => ({
        ...b,
        totalSpentINR: Number(b.total_spent_paise) / 100,
        orders: Number(b.orders),
        totalPixels: Number(b.total_pixels),
      })),
    });
  } catch (error) {
    console.error("Admin data error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}
