export type GatewayInvokeInput = {
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  prompt: string;
};

export type GatewayInvokeResult = {
  modelIdentifier: string;
  rawOutput: unknown;
};

export type LlmGateway = {
  invoke: (input: GatewayInvokeInput) => Promise<GatewayInvokeResult>;
};

import { logTraceEvent } from "./logger";

// Training-safe mock gateway for deterministic workshop behavior.
export function createMockLlmGateway(options?: { debugLogging?: boolean }): LlmGateway {
  const debugLogging = options?.debugLogging ?? false;
  return {
    async invoke(input: GatewayInvokeInput): Promise<GatewayInvokeResult> {
      logTraceEvent({
        stage: "gateway",
        event: "invoke_started",
        traceId: input.traceId,
        promptVersion: input.promptVersion,
        modelIdentifier: input.modelIdentifier,
        details: { mode: "mock" },
      });
      void input.prompt;
      const result = {
        modelIdentifier: input.modelIdentifier,
        rawOutput: {
          documentType: "invoice",
          confidence: 0.92,
          entities: ["invoice_number", "amount_due"],
          summary: "Invoice detected with billing entities.",
        },
      };
      if (debugLogging) {
        logTraceEvent({
          stage: "gateway",
          event: "llm_request_payload",
          traceId: input.traceId,
          promptVersion: input.promptVersion,
          modelIdentifier: input.modelIdentifier,
          details: {
            mode: "mock",
            prompt: input.prompt,
          },
        });
        logTraceEvent({
          stage: "gateway",
          event: "llm_response_payload",
          traceId: input.traceId,
          promptVersion: input.promptVersion,
          modelIdentifier: input.modelIdentifier,
          details: {
            mode: "mock",
            rawOutput: result.rawOutput,
          },
        });
      }
      logTraceEvent({
        stage: "gateway",
        event: "invoke_completed",
        traceId: input.traceId,
        promptVersion: input.promptVersion,
        modelIdentifier: input.modelIdentifier,
        details: { mode: "mock", hasOutput: true },
      });
      return result;
    },
  };
}

type OpenAiGatewayConfig = {
  apiKey: string;
  baseUrl?: string;
  debugLogging?: boolean;
};

type TokenUsage = {
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
};

export function createOpenAiLlmGateway(config: OpenAiGatewayConfig): LlmGateway {
  const baseUrl =
    typeof config.baseUrl === "string" && config.baseUrl.trim().length > 0
      ? config.baseUrl.trim()
      : "https://api.openai.com/v1";

  return {
    async invoke(input: GatewayInvokeInput): Promise<GatewayInvokeResult> {
      const requestBody = {
        model: input.modelIdentifier,
        temperature: 0,
        response_format: { type: "json_object" as const },
        messages: [
          {
            role: "system" as const,
            content:
              "Return only valid JSON with keys: documentType, confidence, entities, summary.",
          },
          {
            role: "user" as const,
            content: input.prompt,
          },
        ],
      };
      logTraceEvent({
        stage: "gateway",
        event: "invoke_started",
        traceId: input.traceId,
        promptVersion: input.promptVersion,
        modelIdentifier: input.modelIdentifier,
        details: { mode: "openai" },
      });
      if (config.debugLogging) {
        logTraceEvent({
          stage: "gateway",
          event: "llm_request_payload",
          traceId: input.traceId,
          promptVersion: input.promptVersion,
          modelIdentifier: input.modelIdentifier,
          details: {
            mode: "openai",
            request: requestBody,
          },
        });
      }
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        logTraceEvent({
          stage: "gateway",
          event: "invoke_failed",
          traceId: input.traceId,
          promptVersion: input.promptVersion,
          modelIdentifier: input.modelIdentifier,
          details: { mode: "openai", status: response.status },
        });
        const text = await response.text();
        throw new Error(`OpenAI request failed: ${response.status} ${text}`);
      }

      const responsePayload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
        usage?: {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
        };
      };
      const tokenUsage = extractTokenUsage(responsePayload.usage);

      const content = responsePayload.choices?.[0]?.message?.content ?? "{}";

      const result = {
        modelIdentifier: input.modelIdentifier,
        rawOutput: safeJsonParse(content),
      };
      if (config.debugLogging) {
        logTraceEvent({
          stage: "gateway",
          event: "llm_response_payload",
          traceId: input.traceId,
          promptVersion: input.promptVersion,
          modelIdentifier: input.modelIdentifier,
          details: {
            mode: "openai",
            messageContent: content,
            rawOutput: result.rawOutput,
            tokenUsage,
          },
        });
      }
      logTraceEvent({
        stage: "gateway",
        event: "invoke_completed",
        traceId: input.traceId,
        promptVersion: input.promptVersion,
        modelIdentifier: input.modelIdentifier,
        details: { mode: "openai", hasOutput: true, tokenUsage },
      });
      return result;
    },
  };
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function extractTokenUsage(usage: {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
} | undefined): TokenUsage {
  if (!usage) return {};
  return {
    promptTokens: usage.prompt_tokens,
    completionTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  };
}
