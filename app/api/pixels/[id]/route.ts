// app/api/pixels/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { headers } from "next/headers";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { color, url, message, image } = body;

    const pixels = await sql`SELECT * FROM pixel WHERE id = ${id}`;
    const pixel = pixels[0];

    if (!pixel) {
      return NextResponse.json({ error: "Pixel not found" }, { status: 404 });
    }

    if (pixel.ownerId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await sql`
      UPDATE pixel SET
        color = ${color ?? pixel.color},
        url = ${url !== undefined ? url : pixel.url},
        message = ${message !== undefined ? message : pixel.message},
        image = ${image !== undefined ? image : pixel.image},
        "updatedAt" = now()
      WHERE id = ${id}
      RETURNING *
    `;

    const updatedPixel = updated[0];
    const ownerRows = await sql`SELECT id, name, email FROM "user" WHERE id = ${session.user.id}`;
    const owner = ownerRows[0];

    return NextResponse.json({
      ...updatedPixel,
      owner,
    });
  } catch (error) {
    console.error("Error updating pixel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update pixel" },
      { status: 500 }
    );
  }
}
