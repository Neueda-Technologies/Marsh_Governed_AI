import type { ExtractRequest, WorkflowResponse } from "./types";
import { createDocumentExtractionWorkflow, type WorkflowDeps } from "./workflow";
import { DOCUMENT_EXTRACTION_PROMPT_VERSION } from "./prompt";
import { logTraceEvent } from "./logger";

export function createDocumentController(deps: WorkflowDeps) {
  const modelIdentifier = deps.modelIdentifier ?? "gpt-4o-mini";
  const workflow = createDocumentExtractionWorkflow(deps);

  return {
    extractDocument: async (input: ExtractRequest): Promise<WorkflowResponse> => {
      logTraceEvent({
        stage: "controller",
        event: "request_received",
        traceId: input.traceId ?? "pending_trace",
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier,
        details: {
          hasText: typeof input.text === "string",
          source: input.source ?? "unknown",
        },
      });
      return workflow.execute(input);
    },
  };
}
