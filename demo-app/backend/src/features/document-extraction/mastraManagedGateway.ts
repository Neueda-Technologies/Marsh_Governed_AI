import type { Mastra } from "@mastra/core";
import type { GatewayInvokeInput, GatewayInvokeResult, LlmGateway } from "./gateway";
import { logTraceEvent } from "./logger";

// Adapter that allows this training app to run behind a Mastra runtime.
// For now, it delegates model invocation to an underlying gateway while
// centralizing the place where teams can plug in Mastra workflows/agents.
export function createMastraManagedGateway(runtime: Mastra, delegate: LlmGateway): LlmGateway {
  return {
    async invoke(input: GatewayInvokeInput): Promise<GatewayInvokeResult> {
      void runtime;
      logTraceEvent({
        stage: "gateway",
        event: "mastra_runtime_delegate",
        traceId: input.traceId,
        promptVersion: input.promptVersion,
        modelIdentifier: input.modelIdentifier,
      });
      return delegate.invoke(input);
    },
  };
}
