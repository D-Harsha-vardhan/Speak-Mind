import {
  AIProvider,
  ChatMessage,
  EmotionAnalysisResult,
  LongitudinalInsightResult,
  JournalReflectionResult,
  SafetyClassificationResult,
} from "./types";

export class MockProvider implements AIProvider {
  name = "mock";

  async generateChatResponse(
    messages: ChatMessage[],
    systemInstruction?: string
  ): Promise<string> {
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || "";
    
    // Simulate thinking delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (lastMessage.includes("exam") || lastMessage.includes("study") || lastMessage.includes("work")) {
      return "It sounds like you're carrying a lot of academic pressure right now. When assignments pile up, it's completely normal to feel overwhelmed. Would you like to try a short planning exercise, or take a quick breathing study break?";
    }
    if (lastMessage.includes("sleep") || lastMessage.includes("tired")) {
      return "Sleep is so important, and when you can't rest, everything feels heavier. Have you tried setting a screen wind-down routine 30 minutes before sleep, or doing a calming wind-down breathing exercise?";
    }
    if (lastMessage.includes("sad") || lastMessage.includes("lonely") || lastMessage.includes("alone")) {
      return "I hear you, and it's really tough to feel lonely or down. Even in quiet moments, please know that you are valuable. Sometimes sharing a small thought with a trusted friend, counselor, or family member can help lighten the load.";
    }
    if (lastMessage.includes("kill") || lastMessage.includes("suicide") || lastMessage.includes("die") || lastMessage.includes("hurt myself")) {
      return "I'm really concerned to hear that, and I want to make sure you're safe. Please reach out to someone who can help. You can contact your school counselor, a trusted adult, or text/call 988 (Lifeline) for immediate, free, and confidential support. You don't have to go through this alone.";
    }
    
    return "Thank you for sharing that with me. Taking a moment to reflect on how you're feeling is a healthy step. What's on your mind right now that you'd like to talk about?";
  }

  async analyzeEmotionAndThemes(text: string): Promise<EmotionAnalysisResult> {
    const lower = text.toLowerCase();
    
    let emotion = "neutral";
    let confidence = 0.85;
    const themes: string[] = [];

    if (lower.includes("exam") || lower.includes("assignment") || lower.includes("grade") || lower.includes("workload")) {
      emotion = "stressed";
      themes.push("academics", "workload");
    } else if (lower.includes("sleep") || lower.includes("tired") || lower.includes("exhausted")) {
      emotion = "neutral"; // or overwhelmed
      themes.push("sleep");
    } else if (lower.includes("friend") || lower.includes("lonely") || lower.includes("argue") || lower.includes("relationship")) {
      emotion = "lonely";
      themes.push("relationships");
    } else if (lower.includes("angry") || lower.includes("mad") || lower.includes("hate")) {
      emotion = "angry";
      themes.push("social situations");
    } else if (lower.includes("happy") || lower.includes("great") || lower.includes("good")) {
      emotion = "happy";
    }

    if (lower.includes("future") || lower.includes("career") || lower.includes("college")) {
      themes.push("future concerns");
    }
    if (lower.includes("time") || lower.includes("schedule") || lower.includes("late")) {
      themes.push("time management");
    }

    return {
      emotion,
      confidence,
      themes: themes.length > 0 ? themes : ["general"],
    };
  }

  async generateLongitudinalInsight(
    dataPoints: { moodLabel: string; themes: string[] }[]
  ): Promise<LongitudinalInsightResult> {
    const academicCount = dataPoints.filter((dp) =>
      dp.themes.includes("academics") || dp.themes.includes("workload")
    ).length;
    
    if (academicCount >= 3) {
      return {
        insightType: "academic_workload",
        title: "Academic Workload Pattern",
        explanation: "Academic stress appeared in several of your recent check-ins. You tend to feel more overwhelmed on days where deadlines are approaching.",
        evidence: `Academic workload or academic stress was mentioned in ${academicCount} of your recent interactions.`,
        recommendation: "Consider breaking down your study sessions into 25-minute Pomodoro blocks and planning your tasks beforehand.",
      };
    }

    return {
      insightType: "general_reflection",
      title: "Wellness Reflection",
      explanation: "Your check-ins are showing steady engagement with your reflection goals.",
      evidence: `You completed ${dataPoints.length} check-ins recently.`,
      recommendation: "Try practicing gratitude journaling to find positive moments in your day.",
    };
  }

  async generateJournalReflection(content: string): Promise<JournalReflectionResult> {
    const lower = content.toLowerCase();
    
    let summary = "You wrote about your day and the things currently on your mind.";
    const themes: string[] = [];
    let reflectionQuestion = "What is one small thing that brought you comfort today?";
    let suggestedActivityCategory = "reflection";

    if (lower.includes("stressed") || lower.includes("busy") || lower.includes("work")) {
      summary = "You described feeling busy and managing multiple responsibilities.";
      themes.push("workload");
      reflectionQuestion = "If you could remove one task from tomorrow's list, what would it be?";
      suggestedActivityCategory = "focus";
    } else if (lower.includes("sad") || lower.includes("tired")) {
      summary = "You expressed feeling a bit low or physically exhausted.";
      themes.push("sleep");
      reflectionQuestion = "What kind of small wind-down activity would help you rest tonight?";
      suggestedActivityCategory = "sleep";
    }

    return {
      summary,
      themes: themes.length > 0 ? themes : ["reflection"],
      reflectionQuestion,
      suggestedActivityCategory,
    };
  }

  async classifySafety(text: string): Promise<SafetyClassificationResult> {
    const lower = text.toLowerCase();

    if (lower.includes("kill") || lower.includes("suicide") || lower.includes("end my life") || lower.includes("want to die")) {
      return { severity: "IMMEDIATE_SUPPORT_NEEDED" };
    }
    if (lower.includes("hurt myself") || lower.includes("cut myself") || lower.includes("self harm") || lower.includes("depressed")) {
      return { severity: "HIGH_CONCERN" };
    }
    if (lower.includes("scared") || lower.includes("crying") || lower.includes("overwhelmed") || lower.includes("alone")) {
      return { severity: "DISTRESS" };
    }

    return { severity: "NORMAL" };
  }
}
