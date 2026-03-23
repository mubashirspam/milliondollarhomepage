// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (
      email !== process.env.ADMIN_EMAIL ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Derive a deterministic token from credentials + secret
    const adminToken = crypto
      .createHmac("sha256", process.env.ADMIN_SECRET!)
      .update(`${process.env.ADMIN_EMAIL}:${process.env.ADMIN_PASSWORD}`)
      .digest("hex");

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
