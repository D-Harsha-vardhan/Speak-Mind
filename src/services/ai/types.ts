export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface EmotionAnalysisResult {
  emotion: string;
  confidence: number;
  themes: string[];
}

export interface LongitudinalInsightResult {
  insightType: string;
  title: string;
  explanation: string;
  evidence: string;
  recommendation: string;
}

export interface JournalReflectionResult {
  summary: string;
  themes: string[];
  reflectionQuestion: string;
  suggestedActivityCategory: string; // "calm" | "focus" | "reflection" | "sleep" | "social"
}

export interface SafetyClassificationResult {
  severity: "NORMAL" | "DISTRESS" | "HIGH_CONCERN" | "IMMEDIATE_SUPPORT_NEEDED";
}

export interface AIProvider {
  name: string;
  
  generateChatResponse(
    messages: ChatMessage[],
    systemInstruction?: string
  ): Promise<string>;

  analyzeEmotionAndThemes(
    text: string
  ): Promise<EmotionAnalysisResult>;

  generateLongitudinalInsight(
    dataPoints: { moodLabel: string; themes: string[] }[]
  ): Promise<LongitudinalInsightResult>;

  generateJournalReflection(
    content: string
  ): Promise<JournalReflectionResult>;

  classifySafety(
    text: string
  ): Promise<SafetyClassificationResult>;
}
