export const env = {
  get databaseUrl(): string {
    const value = process.env.DATABASE_URL;
    if (!value) {
      throw new Error("DATABASE_URL environment variable is missing.");
    }
    return value;
  },

  get authSecret(): string {
    const value = process.env.AUTH_SECRET;
    if (!value) {
      // Return a fallback in development only, throw in production
      if (process.env.NODE_ENV === "production") {
        throw new Error("AUTH_SECRET environment variable is missing in production.");
      }
      return "speakmind-default-dev-secret-key-change-in-prod";
    }
    return value;
  },

  get aiProvider(): "mock" | "nvidia" | "gemini" {
    const value = process.env.AI_PROVIDER || "mock";
    if (value !== "mock" && value !== "nvidia" && value !== "gemini") {
      throw new Error(`Invalid AI_PROVIDER: "${value}". Expected "mock", "nvidia", or "gemini".`);
    }
    return value as "mock" | "nvidia" | "gemini";
  },

  get nvidiaApiKey(): string {
    const value = process.env.NVIDIA_API_KEY;
    if (this.aiProvider === "nvidia" && !value) {
      throw new Error("NVIDIA_API_KEY is required when AI_PROVIDER is set to 'nvidia'.");
    }
    return value || "";
  },

  get nvidiaSafetyApiKey(): string {
    return process.env.NVIDIA_SAFETY_API_KEY || this.nvidiaApiKey;
  },

  get nvidiaChatModel(): string {
    return process.env.NVIDIA_CHAT_MODEL || "nvidia/nemotron-3.5-lightning-30b-a3b";
  },

  get nvidiaSafetyModel(): string {
    return process.env.NVIDIA_SAFETY_MODEL || "nvidia/nemotron-3.5-content-safety";
  },

  get geminiApiKey(): string {
    const value = process.env.GEMINI_API_KEY;
    if (this.aiProvider === "gemini" && !value) {
      throw new Error("GEMINI_API_KEY is required when AI_PROVIDER is set to 'gemini'.");
    }
    return value || "";
  },

  get apiBaseUrl(): string {
    return (
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL ||
      "http://localhost:3000"
    );
  },

  get isProduction(): boolean {
    return process.env.NODE_ENV === "production";
  },
};
