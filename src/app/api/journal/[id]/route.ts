import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(
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
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        { error: "Journal entry ID is required" },
        { status: 400 }
      );
    }

    // 3. Fetch entry to verify ownership
    const entry = await db.orm.public.JournalEntry
      .where({ id })
      .first();

    if (!entry) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    if (entry.userId !== session.userId) {
      return NextResponse.json(
        { error: "Not authorized to delete this entry" },
        { status: 403 }
      );
    }

    // 4. Delete the entry using .where().delete()
    await db.orm.public.JournalEntry
      .where({ id })
      .delete();

    return NextResponse.json({
      message: "Journal entry deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete journal error:", error);
    return NextResponse.json(
      { error: "Failed to delete journal entry" },
      { status: 500 }
    );
  }
}
