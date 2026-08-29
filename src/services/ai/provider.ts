import { env } from "@/lib/env";
import { AIProvider } from "./types";
import { MockProvider } from "./mockProvider";
import { NvidiaProvider } from "./nvidiaProvider";

let aiProviderInstance: AIProvider;

export function getAIProvider(): AIProvider {
  if (aiProviderInstance) {
    return aiProviderInstance;
  }

  const selectedProvider = env.aiProvider;

  switch (selectedProvider) {
    case "nvidia":
      aiProviderInstance = new NvidiaProvider();
      break;
    case "gemini":
      // For now, if gemini is chosen, fallback to Nvidia or Mock if not fully implemented.
      // We can also create a basic Gemini provider if needed.
      // Let's default to Nvidia or Mock for now.
      aiProviderInstance = new NvidiaProvider();
      break;
    case "mock":
    default:
      aiProviderInstance = new MockProvider();
      break;
  }

  console.log(`Initialized AI Provider: ${aiProviderInstance.name}`);
  return aiProviderInstance;
}

// Export a default helper for easy importing
export const ai = {
  get client(): AIProvider {
    return getAIProvider();
  },
};
