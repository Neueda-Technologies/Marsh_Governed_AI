import type { ExtractRequest, WorkflowResponse } from "./types";
import type { WorkflowDeps } from "./workflow";

/**
 * Lab 2 Task 1: thin controller factory — delegate to workflow.execute.
 * Wire from src/nest/documents.controller.ts with createGatewayForRuntime().
 */
export function createDocumentController(_deps: WorkflowDeps) {
  return {
    extractDocument: async (_input: ExtractRequest): Promise<WorkflowResponse> => {
      throw new Error("Lab 2 Task 1: implement createDocumentController in controller.ts");
    },
  };
}
