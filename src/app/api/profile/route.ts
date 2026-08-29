import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Fetch fresh user data
    const user = await db.orm.public.User
      .where({ id: session.userId })
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
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
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve profile data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body = await request.json();
    const { name, ageRange, preferences } = body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (ageRange !== undefined) updateData.ageRange = ageRange;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Ensure we are actually updating something
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 }
      );
    }

    // 3. Perform database update
    await db.orm.public.User
      .where({ id: session.userId })
      .update(updateData);

    // 4. Fetch updated user details
    const updatedUser = await db.orm.public.User
      .where({ id: session.userId })
      .first();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found after update" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        ageRange: updatedUser.ageRange,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error) {
    console.error("Patch profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
