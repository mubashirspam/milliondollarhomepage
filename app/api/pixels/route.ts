// app/api/pixels/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const minX = searchParams.get("minX");
    const maxX = searchParams.get("maxX");
    const minY = searchParams.get("minY");
    const maxY = searchParams.get("maxY");

    // If bounding box provided, use it for optimization
    const where =
      minX && maxX && minY && maxY
        ? {
            x: { gte: parseInt(minX), lte: parseInt(maxX) },
            y: { gte: parseInt(minY), lte: parseInt(maxY) },
          }
        : {};

    const pixels = await prisma.pixel.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      pixels,
      total: pixels.length,
    });
  } catch (error) {
    console.error("Error fetching pixels:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pixels" },
      { status: 500 }
    );
  }
}
