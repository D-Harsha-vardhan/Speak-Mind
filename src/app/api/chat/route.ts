import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ChatPipeline } from "@/services/ai/chatPipeline";

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
    const { message } = body;
    let { conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message content is required as a string" },
        { status: 400 }
      );
    }

    // 3. Retrieve or create conversation
    if (conversationId) {
      // Verify conversation belongs to the user
      const existingConv = await db.orm.public.Conversation
        .where({ id: conversationId })
        .first();

      if (!existingConv) {
        return NextResponse.json(
          { error: "Conversation not found" },
          { status: 404 }
        );
      }

      if (existingConv.userId !== session.userId) {
        return NextResponse.json(
          { error: "Not authorized to access this conversation" },
          { status: 403 }
        );
      }
    } else {
      // Create a new conversation for the user
      const newConv = await db.orm.public.Conversation.create({
        userId: session.userId,
      });
      conversationId = newConv.id;
    }

    // 4. Run the SpeakMind AI Pipeline
    const pipelineResult = await ChatPipeline.execute(
      session.userId,
      conversationId,
      message
    );

    // 5. Return response
    return NextResponse.json({
      conversationId,
      response: pipelineResult.response,
      safetySeverity: pipelineResult.safetySeverity,
      emotion: pipelineResult.detectedEmotion,
      themes: pipelineResult.detectedThemes,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
