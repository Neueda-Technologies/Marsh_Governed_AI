import type { ExtractRequest, WorkflowResponse } from "./types";
import { createDocumentExtractionWorkflow, type WorkflowDeps } from "./workflow";

export function createDocumentController(deps: WorkflowDeps) {
  const workflow = createDocumentExtractionWorkflow(deps);

  return {
    extractDocument: async (input: ExtractRequest): Promise<WorkflowResponse> => {
      return workflow.execute(input);
    },
  };
}
