import { logTraceEvent } from "./logger";
import { mockScenarios, resolveMockScenario } from "./mockScenarios";

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

/** Training-safe mock gateway — wire from workflow in Lab 2 Task 2. */
export function createMockLlmGateway(options?: { debugLogging?: boolean }): LlmGateway {
  const debugLogging = options?.debugLogging ?? false;
  return {
    async invoke(input: GatewayInvokeInput): Promise<GatewayInvokeResult> {
      const scenario = resolveMockScenario(input.prompt);
      const rawOutput = mockScenarios[scenario];

      logTraceEvent({
        stage: "gateway",
        event: "invoke_started",
        traceId: input.traceId,
        promptVersion: input.promptVersion,
        modelIdentifier: input.modelIdentifier,
        details: { mode: "mock", scenario },
      });

      const result = {
        modelIdentifier: input.modelIdentifier,
        rawOutput,
      };

      if (debugLogging) {
        logTraceEvent({
          stage: "gateway",
          event: "llm_response_payload",
          traceId: input.traceId,
          promptVersion: input.promptVersion,
          modelIdentifier: input.modelIdentifier,
          details: { mode: "mock", scenario, rawOutput: result.rawOutput },
        });
      }

      logTraceEvent({
        stage: "gateway",
        event: "invoke_completed",
        traceId: input.traceId,
        promptVersion: input.promptVersion,
        modelIdentifier: input.modelIdentifier,
        details: { mode: "mock", scenario, hasOutput: true },
      });

      return result;
    },
  };
}
