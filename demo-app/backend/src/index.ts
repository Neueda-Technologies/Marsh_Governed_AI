import {
  createDocumentController,
  createMastraManagedGateway,
  createMockLlmGateway,
  createOpenAiLlmGateway,
} from "./features/document-extraction";
import { createMastraRuntime } from "./mastra/runtime";
import { getRuntimeProfileConfig } from "./config/runtimeProfile";

async function main() {
  const config = getRuntimeProfileConfig();
  const baseGateway =
    config.llmMode === "openai"
      ? createOpenAiLlmGateway({
          apiKey: requireEnv("OPENAI_API_KEY"),
          baseUrl: config.openAiBaseUrl,
          debugLogging: config.debugLlmLogs,
        })
      : createMockLlmGateway({ debugLogging: config.debugLlmLogs });

  const gateway = config.useMastraRuntime
    ? createMastraManagedGateway(createMastraRuntime(), baseGateway)
    : baseGateway;

  const controller = createDocumentController({
    gateway,
    modelIdentifier: config.modelIdentifier,
    confidenceThreshold: config.confidenceThreshold,
    featureEnabled: config.featureDocumentExtractionEnabled,
  });

  const response = await controller.extractDocument({
    text: "Invoice #INV-1023 due next Friday for 1250 EUR.",
    source: "upload",
  });

  console.log(JSON.stringify(response, null, 2));
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

void main();
