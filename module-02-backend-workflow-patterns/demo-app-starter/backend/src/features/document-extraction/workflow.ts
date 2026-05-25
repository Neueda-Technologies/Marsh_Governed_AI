import type { LlmGateway } from "./gateway";
import type { ExtractRequest, WorkflowResponse } from "./types";

export type WorkflowDeps = {
  gateway: LlmGateway;
  modelIdentifier?: string;
  confidenceThreshold?: number;
  featureEnabled?: boolean;
};

/**
 * Lab 2 Tasks 1–3: orchestrate pre-validation → gateway → post-validation → response.
 * Sequence and fallback decisions live here, not in the controller.
 */
export function createDocumentExtractionWorkflow(_deps: WorkflowDeps) {
  return {
    execute: async (_input: ExtractRequest): Promise<WorkflowResponse> => {
      throw new Error(
        "Lab 2 Tasks 2–3: implement createDocumentExtractionWorkflow in workflow.ts",
      );
    },
  };
}
