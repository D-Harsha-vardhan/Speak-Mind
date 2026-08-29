import { NextResponse, NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

const PRELOADED_ACTIVITIES = [
  {
    title: "Box Breathing",
    category: "calm",
    duration: 5,
    description:
      "A simple 4-second cycle breathing technique (inhale 4s, hold 4s, exhale 4s, hold 4s) used to slow down the heart rate and calm the nervous system.",
  },
  {
    title: "5-4-3-2-1 Grounding Exercise",
    category: "calm",
    duration: 5,
    description:
      "A sensory awareness exercise to bring your focus back to the present moment by naming 5 things you see, 4 you feel, 3 you hear, 2 you smell, and 1 you taste.",
  },
  {
    title: "Pomodoro Study Break",
    category: "focus",
    duration: 10,
    description:
      "A structured 10-minute break after intense focus: stand up, stretch, drink water, and rest your eyes from all screens.",
  },
  {
    title: "Micro-Goal Task Planner",
    category: "focus",
    duration: 10,
    description:
      "Write down your big tasks, select just one key priority, and break it down into three small, manageable steps.",
  },
  {
    title: "Three Gratitudes Journaling",
    category: "reflection",
    duration: 5,
    description:
      "Write down three small things that went well or that you are grateful for today, helping train your focus toward positive moments.",
  },
  {
    title: "Screen-Free Sleep Wind-Down",
    category: "sleep",
    duration: 15,
    description:
      "Power down your mobile phone and spending 15 minutes listening to relaxing ambient sounds, white noise, or reading a physical book.",
  },
  {
    title: "Reach Out to a Friend",
    category: "social",
    duration: 10,
    description:
      "Send a simple, warm text message to a trusted friend or relative to check in or ask how their day is going.",
  },
];

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

    // 2. Retrieve existing activities
    let activities = await db.orm.public.Activity.all();

    // 3. Seed activities if database has 0 records
    if (activities.length === 0) {
      console.log("Seeding preloaded activities...");
      
      // Insert in loop
      for (const act of PRELOADED_ACTIVITIES) {
        await db.orm.public.Activity.create({
          title: act.title,
          category: act.category,
          duration: act.duration,
          description: act.description,
        });
      }

      // Re-fetch seeded list
      activities = await db.orm.public.Activity.all();
    }

    // 4. Fetch history for this user
    const history = await db.orm.public.ActivityHistory.where({ userId: session.userId }).all();

    return NextResponse.json({ activities, history });
  } catch (error: any) {
    console.error("Get activities error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
