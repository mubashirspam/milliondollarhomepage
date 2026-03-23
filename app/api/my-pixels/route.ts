// app/api/my-pixels/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sql } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const pixels = await sql`
      SELECT * FROM pixel
      WHERE "ownerId" = ${session.user.id}
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json({ success: true, pixels });
  } catch (error) {
    console.error("Error fetching user pixels:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch pixels" },
      { status: 500 }
    );
  }
}
