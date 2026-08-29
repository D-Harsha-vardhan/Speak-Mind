import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // 1. Authenticate user
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // 2. Await dynamic parameters
    const { id: activityId } = await context.params;

    if (!activityId) {
      return NextResponse.json(
        { error: "Activity ID is required" },
        { status: 400 }
      );
    }

    // 3. Verify activity exists
    const activity = await db.orm.public.Activity
      .where({ id: activityId })
      .first();

    if (!activity) {
      return NextResponse.json(
        { error: "Activity not found" },
        { status: 404 }
      );
    }

    // 4. Record completion history
    const historyEntry = await db.orm.public.ActivityHistory.create({
      userId: session.userId,
      activityId,
    });

    return NextResponse.json({
      message: "Activity logged as completed",
      historyEntry,
    });
  } catch (error: any) {
    console.error("Complete activity error:", error);
    return NextResponse.json(
      { error: "Failed to record activity completion" },
      { status: 500 }
    );
  }
}
