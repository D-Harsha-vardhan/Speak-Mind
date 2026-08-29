import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Fetch fresh user data from db
    const user = await db.orm.public.User
      .where({ id: session.userId })
      .first();

    if (!user) {
      const response = NextResponse.json(
        { error: "User session expired or not found. Please log in again." },
        { status: 401 }
      );
      response.cookies.delete("speakmind_session");
      return response;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        ageRange: user.ageRange,
        preferences: user.preferences,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user session error:", error);
    return NextResponse.json(
      { error: "Failed to get user session" },
      { status: 500 }
    );
  }
}
