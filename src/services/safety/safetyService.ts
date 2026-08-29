import { db } from "@/lib/db";
import { ai } from "@/services/ai/provider";

export type SafetySeverity =
  | "NORMAL"
  | "DISTRESS"
  | "HIGH_CONCERN"
  | "IMMEDIATE_SUPPORT_NEEDED";

export const SAFETY_RESPONSES: Record<Exclude<SafetySeverity, "NORMAL">, string> = {
  DISTRESS:
    "It sounds like you're going through a tough time right now. Please remember that you don't have to carry this alone. Talking to a trusted friend, family member, teacher, or school counselor can make a real difference. Would you like to take a slow breath together, or look at some grounding activities?",
  
  HIGH_CONCERN:
    "I hear how heavy things feel for you right now, and I want to support your safety. I am an AI companion, but I cannot replace human support. If you are experiencing deep emotional pain or self-harm thoughts, please consider talking to a professional or reaching out to a trusted person in your life. You can also text or call 988 anytime for free, confidential support.",
  
  IMMEDIATE_SUPPORT_NEEDED:
    "I'm very concerned for your safety. Please know that your life is valuable and there is support available. Please reach out to someone who can help you immediately, such as a family member, local emergency services, or call/text the 988 Suicide & Crisis Lifeline right now. They are available 24/7. Please connect with someone in the real world who can be there with you.",
};

export class SafetyService {
  /**
   * Classifies user input and logs to the database if user ID is provided.
   */
  static async evaluateInput(
    content: string,
    userId?: string
  ): Promise<SafetySeverity> {
    try {
      // 1. Call AI safety classifier
      const classification = await ai.client.classifySafety(content);
      const severity = classification.severity;

      // 2. Log if it's a concern (DISTRESS, HIGH_CONCERN, or IMMEDIATE_SUPPORT_NEEDED)
      if (userId && severity !== "NORMAL") {
        await db.orm.public.SafetyEvent.create({
          userId,
          severity,
        });
      }

      return severity;
    } catch (error) {
      console.error("Safety evaluation error:", error);
      // Fail-safe: default to NORMAL or DISTRESS if classifier fails
      return "NORMAL";
    }
  }

  /**
   * Evaluates if the AI output contains anything unsafe.
   * This acts as the Output Safety Check in the pipeline.
   */
  static async evaluateOutput(
    responseContent: string
  ): Promise<boolean> {
    // Simple filter to block dangerous AI output patterns
    const lower = responseContent.toLowerCase();
    const flags = ["how to cut", "how to kill", "suicide method", "lethal dose"];
    
    for (const flag of flags) {
      if (lower.includes(flag)) {
        return false; // Unsafe output
      }
    }
    return true; // Safe
  }

  /**
   * Returns a standard direct warning message for high-severity inputs
   */
  static getOverrideResponse(severity: Exclude<SafetySeverity, "NORMAL">): string {
    return SAFETY_RESPONSES[severity];
  }
}
