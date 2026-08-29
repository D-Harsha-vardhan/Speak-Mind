import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, signJWT, setAuthCookie } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // 2. Fetch user
    const user = await db.orm.public.User
      .where({ email })
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 3. Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // 4. Generate JWT & Set cookie
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
    };
    const token = await signJWT(tokenPayload);
    await setAuthCookie(token);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ageRange: user.ageRange,
        preferences: user.preferences,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to log in" },
      { status: 500 }
    );
  }
}
