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

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    // 2. CASE A: Requesting messages for a specific conversation
    if (conversationId) {
      const conversation = await db.orm.public.Conversation
        .where({ id: conversationId })
        .first();

      if (!conversation) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      if (conversation.userId !== session.userId) {
        return NextResponse.json(
          { error: "Not authorized to access this conversation" },
          { status: 403 }
        );
      }

      const rawMessages = await db.orm.public.Message
        .where({ conversationId })
        .all();

      // Sort messages chronologically
      const messages = [...rawMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      return NextResponse.json({ messages });
    }

    // 3. CASE B: Requesting list of all conversations for the logged-in user
    const rawConversations = await db.orm.public.Conversation
      .where({ userId: session.userId })
      .all();

    // Sort conversations latest first
    const conversations = [...rawConversations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ conversations });
  } catch (error: any) {
    console.error("Chat history API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}
