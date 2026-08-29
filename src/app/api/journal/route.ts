import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ai } from "@/services/ai/provider";

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
    const { content, aiAnalysisEnabled = true } = body;

    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Journal content is required as a string" },
        { status: 400 }
      );
    }

    // 3. Create journal entry
    const entry = await db.orm.public.JournalEntry.create({
      userId: session.userId,
      content,
      aiAnalysisEnabled: Boolean(aiAnalysisEnabled),
    });

    // 4. Optionally run AI analysis if enabled
    let aiReflection = null;
    if (aiAnalysisEnabled) {
      try {
        // Run AI reflection helper
        aiReflection = await ai.client.generateJournalReflection(content);
        
        // Log emotion event with "journal" source in the background
        const emotionAnalysis = await ai.client.analyzeEmotionAndThemes(content);
        await db.orm.public.EmotionEvent.create({
          userId: session.userId,
          emotion: emotionAnalysis.emotion,
          confidence: emotionAnalysis.confidence,
          themes: aiReflection.themes,
          source: "journal",
        });
      } catch (aiError) {
        console.error("Journal AI reflection warning:", aiError);
        // Do not crash the journal creation if AI fails, just return null reflection
      }
    }

    return NextResponse.json(
      {
        message: "Journal entry saved successfully",
        entry,
        aiReflection,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Post journal error:", error);
    return NextResponse.json(
      { error: "Failed to save journal entry" },
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

    // 2. Retrieve all journal entries for the user
    const rawEntries = await db.orm.public.JournalEntry
      .where({ userId: session.userId })
      .all();

    // Sort entries newest first
    const entries = [...rawEntries].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Get journals error:", error);
    return NextResponse.json(
      { error: "Failed to fetch journal entries" },
      { status: 500 }
    );
  }
}
