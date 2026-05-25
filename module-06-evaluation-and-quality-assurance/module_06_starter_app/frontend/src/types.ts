export type ExtractRequest = {
  text: string;
  source: string;
  executionMode: "deterministic" | "bounded_tool";
};

export type WorkflowAcceptedResponse = {
  status: "accepted";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  data: {
    documentType: string;
    confidence: number;
    entities: string[];
    summary?: string;
  };
};

export type WorkflowFallbackResponse = {
  status: "needs_review";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  reason: string;
};

export type WorkflowDeniedResponse = {
  status: "denied";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  reason: string;
};

export type WorkflowResponse =
  | WorkflowAcceptedResponse
  | WorkflowFallbackResponse
  | WorkflowDeniedResponse;

export type UiState =
  | "idle"
  | "loading"
  | "partial"
  | "needs_review"
  | "accepted"
  | "denied"
  | "error";

export type TransitionRecord = {
  from: UiState;
  to: UiState;
  event: string;
  at: string;
};

export type ReviewAction = "approve" | "edit" | "escalate";

export type ReviewDecisionEvent = {
  auditId: string;
  traceId: string;
  action: ReviewAction;
  actorId: string;
  notes?: string;
  editedSummary?: string;
  at: string;
};
