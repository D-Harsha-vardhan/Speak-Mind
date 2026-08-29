import { NextResponse, NextRequest } from "next/server";
import { getSessionUser, clearAuthCookie } from "@/lib/auth";
import { db } from "@/lib/db";

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

    // 2. Parse privacy preferences
    const body = await request.json();
    const { journalAiAnalysisEnabled, telemetryEnabled } = body;

    // 3. Fetch current user to read existing preferences
    const user = await db.orm.public.User
      .where({ id: session.userId })
      .first();

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prepare updated preferences JSON
    const currentPrefs = typeof user.preferences === "object" && user.preferences !== null 
      ? (user.preferences as Record<string, any>) 
      : {};
      
    const updatedPrefs = {
      ...currentPrefs,
      journalAiAnalysisEnabled: journalAiAnalysisEnabled !== undefined 
        ? Boolean(journalAiAnalysisEnabled) 
        : currentPrefs.journalAiAnalysisEnabled ?? true,
      telemetryEnabled: telemetryEnabled !== undefined 
        ? Boolean(telemetryEnabled) 
        : currentPrefs.telemetryEnabled ?? false,
    };

    // 4. Save preferences back to DB
    await db.orm.public.User
      .where({ id: session.userId })
      .update({
        preferences: updatedPrefs,
      });

    return NextResponse.json({
      message: "Privacy settings updated successfully",
      preferences: updatedPrefs,
    });
  } catch (error) {
    console.error("Patch privacy error:", error);
    return NextResponse.json(
      { error: "Failed to update privacy settings" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Wipe all user data
    // Because of onDelete: Cascade on user relations (conversations, checkins, journals, etc.),
    // deleting the User row will cascade and automatically delete all dependent tables!
    // This is defined in our schema.prisma database schema, making account wipe robust and atomic.
    await db.orm.public.User
      .where({ id: session.userId })
      .delete();

    // 3. Clear session cookie
    await clearAuthCookie();

    return NextResponse.json({
      message: "Account and all associated wellness data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user data error:", error);
    return NextResponse.json(
      { error: "Failed to delete account data. Please try again." },
      { status: 500 }
    );
  }
}
