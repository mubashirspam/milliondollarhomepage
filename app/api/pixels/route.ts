// app/api/pixels/route.ts
import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minX = searchParams.get("minX");
    const maxX = searchParams.get("maxX");
    const minY = searchParams.get("minY");
    const maxY = searchParams.get("maxY");

    let pixels;

    if (minX && maxX && minY && maxY) {
      pixels = await sql`
        SELECT p.*, u.id as "ownerId", u.name as "ownerName", u.email as "ownerEmail"
        FROM pixel p
        LEFT JOIN "user" u ON p."ownerId" = u.id
        WHERE p.x >= ${parseInt(minX)} AND p.x <= ${parseInt(maxX)}
          AND p.y >= ${parseInt(minY)} AND p.y <= ${parseInt(maxY)}
      `;
    } else {
      pixels = await sql`
        SELECT p.*, u.id as "userId", u.name as "ownerName", u.email as "ownerEmail"
        FROM pixel p
        LEFT JOIN "user" u ON p."ownerId" = u.id
      `;
    }

    const formatted = pixels.map((p) => ({
      id: p.id,
      x: p.x,
      y: p.y,
      color: p.color,
      url: p.url,
      message: p.message,
      image: p.image,
      ownerId: p.ownerId,
      owner: {
        id: p.ownerId,
        name: p.ownerName,
        email: p.ownerEmail,
      },
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    // Fetch pending pixels from active orders (reserved within the last hour)
    const pendingPurchases = await sql`
      SELECT metadata FROM purchase
      WHERE status = 'pending'
        AND "createdAt" > now() - interval '1 hour'
    `;

    const pendingPixels: { x: number; y: number }[] = [];
    for (const purchase of pendingPurchases) {
      try {
        const meta =
          typeof purchase.metadata === "string"
            ? JSON.parse(purchase.metadata)
            : purchase.metadata;
        if (Array.isArray(meta?.pixels)) {
          pendingPixels.push(...(meta.pixels as { x: number; y: number }[]));
        }
      } catch {
        // ignore parse errors
      }
    }

    return NextResponse.json({
      success: true,
      pixels: formatted,
      pendingPixels,
      total: formatted.length,
    });
  } catch (error) {
    console.error("Error fetching pixels:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pixels" },
      { status: 500 }
    );
  }
}
