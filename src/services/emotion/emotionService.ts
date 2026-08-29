import { db } from "@/lib/db";
import { ai } from "@/services/ai/provider";

export interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  themes: string[];
}

export class EmotionService {
  /**
   * Analyzes text for non-clinical emotional cues and logs the event if userId is provided.
   */
  static async analyzeAndLog(
    text: string,
    source: "chat" | "journal",
    userId?: string
  ): Promise<EmotionAnalysis> {
    try {
      // 1. Call AI provider for emotion classification
      const result = await ai.client.analyzeEmotionAndThemes(text);

      // 2. Log event if user context is available
      if (userId) {
        await db.orm.public.EmotionEvent.create({
          userId,
          emotion: result.emotion,
          confidence: result.confidence,
          themes: result.themes,
          source,
        });
      }

      return result;
    } catch (error) {
      console.error("Emotion analysis service error:", error);
      // Fail-safe default
      return {
        emotion: "neutral",
        confidence: 1.0,
        themes: ["general"],
      };
    }
  }
}
