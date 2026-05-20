export type AppProfile = "dev" | "stage" | "prod";
export type LlmMode = "mock" | "openai";

type ProfileSettings = {
  llmMode: LlmMode;
  useMastraRuntime: boolean;
  modelIdentifier: string;
  confidenceThreshold: number;
  featureDocumentExtractionEnabled: boolean;
  debugLlmLogs: boolean;
};

const PROFILE_DEFAULTS: Record<AppProfile, ProfileSettings> = {
  dev: {
    llmMode: "mock",
    useMastraRuntime: false,
    modelIdentifier: "gpt-4o-mini",
    confidenceThreshold: 0.8,
    featureDocumentExtractionEnabled: true,
    debugLlmLogs: true,
  },
  stage: {
    llmMode: "mock",
    useMastraRuntime: true,
    modelIdentifier: "gpt-4o-mini",
    confidenceThreshold: 0.85,
    featureDocumentExtractionEnabled: true,
    debugLlmLogs: false,
  },
  prod: {
    llmMode: "openai",
    useMastraRuntime: true,
    modelIdentifier: "gpt-4o-mini",
    confidenceThreshold: 0.9,
    featureDocumentExtractionEnabled: true,
    debugLlmLogs: false,
  },
};

export function getRuntimeProfileConfig() {
  const profile = parseProfile(process.env.APP_PROFILE);
  const defaults = PROFILE_DEFAULTS[profile];

  return {
    profile,
    llmMode: parseLlmMode(process.env.LLM_MODE) ?? defaults.llmMode,
    useMastraRuntime: parseBoolean(process.env.USE_MASTRA_RUNTIME) ?? defaults.useMastraRuntime,
    modelIdentifier: process.env.MODEL_IDENTIFIER?.trim() || defaults.modelIdentifier,
    confidenceThreshold:
      parseNumber(process.env.CONFIDENCE_THRESHOLD) ?? defaults.confidenceThreshold,
    featureDocumentExtractionEnabled:
      parseBoolean(process.env.FEATURE_DOCUMENT_EXTRACTION_ENABLED) ??
      defaults.featureDocumentExtractionEnabled,
    debugLlmLogs: parseBoolean(process.env.DEBUG_LLM_LOGS) ?? defaults.debugLlmLogs,
    openAiApiKey: process.env.OPENAI_API_KEY,
    openAiBaseUrl: process.env.OPENAI_BASE_URL,
  };
}

function parseProfile(value: string | undefined): AppProfile {
  if (value === "stage" || value === "prod") return value;
  return "dev";
}

function parseLlmMode(value: string | undefined): LlmMode | undefined {
  if (value === "mock" || value === "openai") return value;
  return undefined;
}

function parseBoolean(value: string | undefined): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseNumber(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}
