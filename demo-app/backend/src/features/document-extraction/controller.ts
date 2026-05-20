import type { ExtractRequest, WorkflowResponse } from "./types";
import { createDocumentExtractionWorkflow } from "./workflow";
import type { LlmGateway } from "./gateway";
import { DOCUMENT_EXTRACTION_PROMPT_VERSION } from "./prompt";
import { logTraceEvent } from "./logger";

type ControllerDeps = {
  gateway: LlmGateway;
  modelIdentifier?: string;
  confidenceThreshold?: number;
  featureEnabled?: boolean;
};

export function createDocumentController({
  gateway,
  modelIdentifier,
  confidenceThreshold,
  featureEnabled,
}: ControllerDeps) {
  const resolvedModelIdentifier = modelIdentifier ?? "gpt-4o-mini";
  const workflow = createDocumentExtractionWorkflow({
    gateway,
    modelIdentifier,
    confidenceThreshold,
    featureEnabled,
  });

  return {
    // Keep controller thin: delegate orchestration to workflow layer.
    extractDocument: async (input: ExtractRequest): Promise<WorkflowResponse> => {
      logTraceEvent({
        stage: "controller",
        event: "request_received",
        traceId: input.traceId ?? "pending_trace",
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier: resolvedModelIdentifier,
        details: {
          hasText: typeof input.text === "string",
          source: input.source ?? "unknown",
        },
      });
      return workflow.execute(input);
    },
  };
}
