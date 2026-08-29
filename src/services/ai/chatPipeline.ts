import { db } from "@/lib/db";
import { SafetyService, SafetySeverity } from "@/services/safety/safetyService";
import { EmotionService } from "@/services/emotion/emotionService";
import { ai } from "@/services/ai/provider";
import { ChatMessage } from "@/services/ai/types";

export interface PipelineResult {
  response: string;
  safetySeverity: SafetySeverity;
  detectedEmotion: string;
  detectedThemes: string[];
}

export class ChatPipeline {
  /**
   * Executes the SpeakMind 2.0 AI pipeline:
   * Input Sanitization -> Safety Analysis -> Emotion/Theme Analysis -> Context Engine -> Response Policy -> LLM Generation -> Output Safety Check -> Final Response
   */
  static async execute(
    userId: string,
    conversationId: string,
    userMessageText: string
  ): Promise<PipelineResult> {
    
    // 1. INPUT SANITIZATION
    const sanitizedInput = userMessageText.trim();
    if (!sanitizedInput) {
      throw new Error("Message content cannot be empty.");
    }

    // 2. RUN BACKGROUND EMOTION LOGGING (Fire and Forget)
    EmotionService.analyzeAndLog(sanitizedInput, "chat", userId).catch(e => {
      console.error("Pipeline emotion analysis background error:", e);
    });
    let detectedEmotion = "neutral";
    let detectedThemes: string[] = ["general"];

    // 3. RUN SAFETY CHECK & CONTEXT FETCH CONCURRENTLY
    let safetySeverity: SafetySeverity = "NORMAL";
    let rawMessages: any[] = [];

    try {
      const [safetyResult, fetchedMessages] = await Promise.all([
        SafetyService.evaluateInput(sanitizedInput, userId).catch(e => {
          console.error("Pipeline safety evaluation error:", e);
          return "NORMAL" as SafetySeverity;
        }),
        db.orm.public.Message.where({ conversationId }).all().catch(e => {
          console.error("Context engine error retrieving history:", e);
          return [];
        })
      ]);

      safetySeverity = safetyResult;
      rawMessages = fetchedMessages;
    } catch (e) {
      console.error("Pipeline parallel check & fetch failed:", e);
    }

    // If safety level is critical, intercept immediately with a pre-approved safe message
    if (safetySeverity === "HIGH_CONCERN" || safetySeverity === "IMMEDIATE_SUPPORT_NEEDED") {
      const safetyResponse = SafetyService.getOverrideResponse(safetySeverity);
      
      // Save messages in DB
      await this.saveMessage(conversationId, "user", sanitizedInput);
      await this.saveMessage(conversationId, "assistant", safetyResponse);
      
      return {
        response: safetyResponse,
        safetySeverity,
        detectedEmotion,
        detectedThemes,
      };
    }

    // 4. CONVERSATION CONTEXT ENGINE (Process fetched messages)
    let history: ChatMessage[] = [];
    try {
      // Sort messages chronologically
      const sortedMessages = [...rawMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );

      // Take only the last 10 messages for prompt efficiency
      const lastMessages = sortedMessages.slice(-10);
      
      history = lastMessages.map((msg) => ({
        role: msg.role as "user" | "assistant" | "system",
        content: msg.content,
      }));
    } catch (e) {
      console.error("Context engine error formatting history:", e);
    }

    // Add current user message to prompt context
    const currentMessage: ChatMessage = { role: "user", content: sanitizedInput };
    const promptHistory = [...history, currentMessage];

    // 5. RESPONSE POLICY & SYSTEM PROMPT BUILDER
    // Build instructions to enforce AI identity: supportive, non-clinical, non-diagnostic
    let systemInstruction = `You are SpeakMind, a warm, supportive, and age-appropriate emotional wellness companion for youth.
Your goal is to give young people a safe space to reflect, share their thoughts, and identify feelings.
Identity and Boundaries:
- You are NOT a therapist, psychologist, or medical doctor.
- You must NEVER diagnose mental health conditions (e.g., do NOT say "you have depression" or "you have anxiety").
- You must NEVER prescribe treatments or claim to replace qualified human professionals, counselors, parents, or guardians.
- Never make the user feel dependent on you (e.g., do NOT say "I'm the only one who understands you" or "you don't need anyone else").
Communication style:
- Speak warmly, with empathy, and be respectful.
- Be concise and clear. Do not overwhelm the user with long walls of text.
- Reflect back what the user says to show active listening.
- Ask gentle, open-ended questions that encourage self-reflection or practical healthy coping habits (like study breaks, breathing, journaling).`;

    // Adjust system instruction if user is in DISTRESS
    if (safetySeverity === "DISTRESS") {
      systemInstruction += `\n- The user is showing signs of distress. Maintain a calm, grounding presence. Gently suggest checking in with a trusted person, counselor, or teacher, and encourage looking at a simple breathing or focus break activity if appropriate.`;
    }

    // 6. LLM RESPONSE GENERATION
    let responseText = "";
    try {
      responseText = await ai.client.generateChatResponse(
        promptHistory,
        systemInstruction
      );
    } catch (e) {
      console.error("LLM Generation error:", e);
      responseText = "I'm having a little trouble connecting to my thoughts right now. Can we take a brief moment and try again?";
    }

    // 7. OUTPUT SAFETY CHECK
    const isOutputSafe = await SafetyService.evaluateOutput(responseText);
    if (!isOutputSafe) {
      responseText = "I want to make sure I support you safely. Let's take a slow breath. If you are feeling overwhelmed, talking to a trusted friend or checking out our grounding activities list might help.";
    }

    // 8. SAVE TO DATABASE
    await this.saveMessage(conversationId, "user", sanitizedInput);
    await this.saveMessage(conversationId, "assistant", responseText);

    return {
      response: responseText,
      safetySeverity,
      detectedEmotion,
      detectedThemes,
    };
  }

  private static async saveMessage(
    conversationId: string,
    role: "user" | "assistant",
    content: string
  ): Promise<void> {
    try {
      await db.orm.public.Message.create({
        conversationId,
        role,
        content,
      });
    } catch (e) {
      console.error("Failed to save message in pipeline:", e);
    }
  }
}
