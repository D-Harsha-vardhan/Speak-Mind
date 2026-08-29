import { env } from "@/lib/env";
import {
  AIProvider,
  ChatMessage,
  EmotionAnalysisResult,
  LongitudinalInsightResult,
  JournalReflectionResult,
  SafetyClassificationResult,
} from "./types";

export class NvidiaProvider implements AIProvider {
  name = "nvidia";

  private async callNvidiaAPI(
    messages: ChatMessage[],
    jsonMode = false,
    modelOverride?: string,
    apiKeyOverride?: string
  ): Promise<string> {
    const apiKey = apiKeyOverride || env.nvidiaApiKey;
    if (!apiKey) {
      throw new Error("NVIDIA_API_KEY is not configured.");
    }

    const model = modelOverride || env.nvidiaChatModel;
    const url = "https://integrate.api.nvidia.com/v1/chat/completions";

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.2,
          max_tokens: 1024,
          response_format: jsonMode ? { type: "json_object" } : undefined,
        }),
      });

      if (!response.ok) {
        const fallbackModel = "meta/llama-3.2-11b-vision-instruct";

        // Retry with active Llama-3.2-11b-vision-instruct fallback model and force main API key
        if ((response.status === 400 || response.status === 404 || response.status === 410) && 
            (model !== fallbackModel || apiKey !== env.nvidiaApiKey)) {
          console.warn(`NVIDIA Model ${model} failed (status ${response.status}). Retrying with fallback ${fallbackModel} on main API key...`);
          return this.callNvidiaAPI(messages, jsonMode, fallbackModel, env.nvidiaApiKey);
        }
        const errorData = await response.text();
        console.error("NVIDIA API error response:", errorData);
        throw new Error(`NVIDIA API request failed with status ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (error) {
      console.error("Error communicating with NVIDIA AI:", error);
      throw new Error("Failed to connect to NVIDIA AI services.");
    }
  }

  async generateChatResponse(
    messages: ChatMessage[],
    systemInstruction?: string
  ): Promise<string> {
    const formattedMessages: ChatMessage[] = [];

    if (systemInstruction) {
      formattedMessages.push({ role: "system", content: systemInstruction });
    }

    formattedMessages.push(...messages);
    return this.callNvidiaAPI(formattedMessages, false);
  }

  async analyzeEmotionAndThemes(text: string): Promise<EmotionAnalysisResult> {
    const systemPrompt = `You are an AI-powered emotional wellness classifier. Analyze the user's text and output a JSON object indicating the primary emotion and key themes.
Categories:
- emotions: "calm", "happy", "frustrated", "sad", "stressed", "worried", "lonely", "angry", "overwhelmed", "neutral"
- themes: "academics", "relationships", "family", "social situations", "sleep", "workload", "confidence", "future concerns", "time management"

Output format MUST be JSON matching this schema:
{
  "emotion": "stressed",
  "confidence": 0.85,
  "themes": ["academics", "workload"]
}
Ensure confidence is a number between 0.0 and 1.0. Do NOT include any explanations or markdown formatting outside the JSON object.`;

    const responseText = await this.callNvidiaAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ], true);

    try {
      // Find JSON block if LLM returned markdown
      const cleaned = this.extractJson(responseText);
      const result = JSON.parse(cleaned);
      return {
        emotion: result.emotion || "neutral",
        confidence: typeof result.confidence === "number" ? result.confidence : 0.8,
        themes: Array.isArray(result.themes) ? result.themes : ["general"],
      };
    } catch (e) {
      console.error("Failed to parse emotion JSON response:", responseText, e);
      return { emotion: "neutral", confidence: 0.5, themes: ["general"] };
    }
  }

  async generateLongitudinalInsight(
    dataPoints: { moodLabel: string; themes: string[] }[]
  ): Promise<LongitudinalInsightResult> {
    const systemPrompt = `You are a longitudinal wellness pattern engine. Review the user's historical check-in data and generate a supportive, non-diagnostic observation.
Provide:
1. insightType: A short slug identifying the theme (e.g. "academic_stress")
2. title: A friendly title
3. explanation: A simple explanation of the recurring pattern
4. evidence: The general evidence backing it up (e.g. "academic workload appeared in 6 of your last 10 check-ins")
5. recommendation: Practical, non-medical wellness action to try

Output MUST be a JSON object:
{
  "insightType": "academic_stress",
  "title": "School Stress Reflection",
  "explanation": "We noticed that academic workload has been a recurring factor on days when you feel stressed.",
  "evidence": "Academic workload was present in 4 of your last 7 check-ins.",
  "recommendation": "Try scheduling a short focus break or task planning session to make things feel more manageable."
}
Do NOT diagnose any clinical conditions. Return ONLY JSON.`;

    const userContent = `Here is my historical wellness check-in log:
${JSON.stringify(dataPoints, null, 2)}`;

    const responseText = await this.callNvidiaAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ], true);

    try {
      const cleaned = this.extractJson(responseText);
      const result = JSON.parse(cleaned);
      return {
        insightType: result.insightType || "general",
        title: result.title || "Wellness Reflection",
        explanation: result.explanation || "Your check-ins show regular reflection on your wellness.",
        evidence: result.evidence || "Based on your active check-in history.",
        recommendation: result.recommendation || "Take a moment to practice a breathing activity.",
      };
    } catch (e) {
      console.error("Failed to parse insight JSON:", responseText, e);
      return {
        insightType: "general",
        title: "Daily Reflection",
        explanation: "Keep checking in to identify wellness patterns over time.",
        evidence: "Based on check-in tracking.",
        recommendation: "Try a simple breathing exercise.",
      };
    }
  }

  async generateJournalReflection(content: string): Promise<JournalReflectionResult> {
    const systemPrompt = `You are a private journal reflection assistant. Summarize the user's entry, identify general themes, ask a gentle reflection question, and suggest a wellness activity category ("calm", "focus", "reflection", "sleep", "social").
Output MUST be a JSON object:
{
  "summary": "Short summary of what they wrote.",
  "themes": ["theme1", "theme2"],
  "reflectionQuestion": "Gently challenging reflection question.",
  "suggestedActivityCategory": "calm"
}
Do NOT diagnose or provide clinical advice. Return ONLY JSON.`;

    const responseText = await this.callNvidiaAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: content },
    ], true);

    try {
      const cleaned = this.extractJson(responseText);
      const result = JSON.parse(cleaned);
      return {
        summary: result.summary || "You shared reflections about your day.",
        themes: Array.isArray(result.themes) ? result.themes : ["reflection"],
        reflectionQuestion: result.reflectionQuestion || "What is one thing that made you smile today?",
        suggestedActivityCategory: result.suggestedActivityCategory || "reflection",
      };
    } catch (e) {
      console.error("Failed to parse journal reflection JSON:", responseText, e);
      return {
        summary: "You wrote in your journal.",
        themes: ["reflection"],
        reflectionQuestion: "What would make tomorrow feel a bit easier?",
        suggestedActivityCategory: "reflection",
      };
    }
  }

  async classifySafety(text: string): Promise<SafetyClassificationResult> {
    try {
      // 1. Prepare distress prompt
      const distressPrompt = `You are a sentiment classifier. Determine if the user's text indicates emotional distress, high stress, deep sadness, loneliness, or feeling overwhelmed.
Respond ONLY with one word, either "DISTRESS" or "NORMAL".
User message: "${text}"`;

      // 2. Run dedicated safety model AND emotional distress level checks concurrently
      const [safetyResult, distressResult] = await Promise.all([
        this.callNvidiaAPI(
          [{ role: "user", content: text }],
          false,
          env.nvidiaSafetyModel,
          env.nvidiaSafetyApiKey
        ),
        this.callNvidiaAPI(
          [{ role: "user", content: distressPrompt }],
          false,
          env.nvidiaChatModel,
          env.nvidiaApiKey
        )
      ]);

      const cleanedSafety = safetyResult.trim().toLowerCase();

      // If flagged unsafe, inspect category codes
      if (cleanedSafety.includes("unsafe")) {
        // s3 / S3 is the standard code for Self-Harm
        if (cleanedSafety.includes("s3")) {
          return { severity: "IMMEDIATE_SUPPORT_NEEDED" };
        }
        return { severity: "HIGH_CONCERN" };
      }

      // If labeled safe, process the emotional distress result
      const cleanedDistress = distressResult.trim().toUpperCase();

      if (cleanedDistress.includes("DISTRESS")) {
        return { severity: "DISTRESS" };
      }
      return { severity: "NORMAL" };
    } catch (e) {
      console.error("NVIDIA safety model check failed, using fallbacks:", e);
      // Basic keyword fallbacks for local resiliency
      const lower = text.toLowerCase();
      if (lower.includes("kill") || lower.includes("suicide") || lower.includes("die")) {
        return { severity: "IMMEDIATE_SUPPORT_NEEDED" };
      }
      if (lower.includes("hurt") || lower.includes("cut")) {
        return { severity: "HIGH_CONCERN" };
      }
      return { severity: "NORMAL" };
    }
  }

  private extractJson(text: string): string {
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return text.substring(jsonStart, jsonEnd + 1);
    }
    return text;
  }
}
