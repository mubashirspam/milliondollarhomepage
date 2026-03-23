// app/api/pixels/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { color, url, message, image } = body;

    // Verify ownership
    const pixel = await prisma.pixel.findUnique({
      where: { id },
    });

    if (!pixel) {
      return NextResponse.json({ error: "Pixel not found" }, { status: 404 });
    }

    if (pixel.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update pixel
    const updatedPixel = await prisma.pixel.update({
      where: { id },
      data: {
        color: color || pixel.color,
        url: url !== undefined ? url : pixel.url,
        message: message !== undefined ? message : pixel.message,
        image: image !== undefined ? image : pixel.image,
      },
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
      pixel: updatedPixel,
    });
  } catch (error) {
    console.error("Error updating pixel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update pixel" },
      { status: 500 }
    );
  }
}
