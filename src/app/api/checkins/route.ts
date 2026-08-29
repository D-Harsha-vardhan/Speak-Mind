import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
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
    const { moodLabel, themes } = body;

    if (!moodLabel) {
      return NextResponse.json(
        { error: "moodLabel is required" },
        { status: 400 }
      );
    }

    // Validate mood labels are non-clinical
    const VALID_MOODS = ["Great", "Good", "Okay", "Low", "Stressed", "Overwhelmed"];
    if (!VALID_MOODS.includes(moodLabel)) {
      return NextResponse.json(
        { error: `Invalid mood label. Expected one of: ${VALID_MOODS.join(", ")}` },
        { status: 400 }
      );
    }

    // 3. Create check-in record
    const checkin = await db.orm.public.CheckIn.create({
      userId: session.userId,
      moodLabel,
      themes: Array.isArray(themes) ? themes : [],
    });

    return NextResponse.json(
      { message: "Check-in saved successfully", checkin },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Post checkin error:", error);
    return NextResponse.json(
      { error: "Failed to save check-in" },
      { status: 500 }
    );
  }
}

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

    // 2. Retrieve all check-ins for the user
    const rawCheckins = await db.orm.public.CheckIn
      .where({ userId: session.userId })
      .all();

    // Sort check-ins by date (newest first for list, or oldest first for charts, let's return newest first)
    const checkins = [...rawCheckins].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ checkins });
  } catch (error: any) {
    console.error("Get checkins error:", error);
    return NextResponse.json(
      { error: "Failed to fetch check-ins" },
      { status: 500 }
    );
  }
}
