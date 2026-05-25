export type ExtractRequest = {
  text: string;
  source?: string;
  traceId?: string;
  executionMode?: "deterministic" | "bounded_tool";
};

export type ExtractedDocument = {
  documentType: "invoice" | "contract" | "email" | "other";
  confidence: number;
  entities: string[];
  summary?: string;
};

export type WorkflowAcceptedResponse = {
  status: "accepted";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  data: ExtractedDocument;
};

export type WorkflowFallbackResponse = {
  status: "needs_review";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  reason: "invalid_input" | "validation_failed" | "low_confidence";
  metadata?: {
    confidenceThreshold?: number;
    observedConfidence?: number;
    routingReason?: string;
  };
};

export type WorkflowResponse = WorkflowAcceptedResponse | WorkflowFallbackResponse;

export type PreValidationResult = {
  ok: boolean;
  reason?: "invalid_input";
};

export type PostValidationResult = {
  ok: boolean;
  reason?: "validation_failed";
  data?: ExtractedDocument;
};
