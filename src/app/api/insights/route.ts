import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ai } from "@/services/ai/provider";

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

    // 2. Fetch recent check-ins to run the longitudinal engine
    const rawCheckins = await db.orm.public.CheckIn
      .where({ userId: session.userId })
      .all();

    // Sort checkins chronologically (oldest to newest)
    const checkins = [...rawCheckins].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // 3. If there are check-ins, run pattern detection and save a new insight
    if (checkins.length >= 3) {
      try {
        const dataPoints = checkins.map((c) => ({
          moodLabel: c.moodLabel,
          themes: Array.isArray(c.themes) ? (c.themes as string[]) : [],
        }));

        // Generate insight via AI provider
        const generated = await ai.client.generateLongitudinalInsight(dataPoints);

        // Check if this insight type already exists to avoid duplicate insertions
        const existingInsight = await db.orm.public.Insight
          .where({
            userId: session.userId,
            insightType: generated.insightType,
          })
          .first();

        if (!existingInsight) {
          await db.orm.public.Insight.create({
            userId: session.userId,
            insightType: generated.insightType,
            title: generated.title,
            explanation: generated.explanation,
            evidence: generated.evidence,
            recommendation: generated.recommendation,
          });
        }
      } catch (aiError) {
        console.error("Pattern engine analysis warning:", aiError);
      }
    }

    // 4. Retrieve all insights for this user
    const rawInsights = await db.orm.public.Insight
      .where({ userId: session.userId })
      .all();

    // Sort insights by date (newest first)
    const insights = [...rawInsights].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // If no insights exist yet (e.g. fresh user with <3 check-ins), return a supportive greeting insight
    if (insights.length === 0) {
      return NextResponse.json({
        insights: [
          {
            id: "welcome-insight",
            title: "Welcome to SpeakMind Insights",
            explanation: "As you complete check-ins and talk with SpeakMind, our longitudinal pattern engine will analyze your logs to identify recurring emotional themes and coping strategies.",
            evidence: "Complete at least 3 daily check-ins to unlock pattern insights.",
            recommendation: "Try checking in daily or writing a journal entry today.",
            createdAt: new Date().toISOString(),
          },
        ],
      });
    }

    return NextResponse.json({ insights });
  } catch (error: any) {
    console.error("Get insights error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve wellness insights" },
      { status: 500 }
    );
  }
}
