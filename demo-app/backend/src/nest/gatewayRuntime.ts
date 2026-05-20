import {
  createMastraManagedGateway,
  createMockLlmGateway,
  createOpenAiLlmGateway,
} from "../features/document-extraction";
import { createMastraRuntime } from "../mastra/runtime";
import { getRuntimeProfileConfig } from "../config/runtimeProfile";

export function createGatewayForRuntime() {
  const config = getRuntimeProfileConfig();

  const baseGateway =
    config.llmMode === "openai"
      ? createOpenAiLlmGateway({
          apiKey: requireEnv("OPENAI_API_KEY"),
          baseUrl: config.openAiBaseUrl,
          debugLogging: config.debugLlmLogs,
        })
      : createMockLlmGateway({ debugLogging: config.debugLlmLogs });

  return config.useMastraRuntime
    ? createMastraManagedGateway(createMastraRuntime(), baseGateway)
    : baseGateway;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
