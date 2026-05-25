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
  reason:
    | "invalid_input"
    | "validation_failed"
    | "low_confidence"
    | "policy_blocked"
    | "hostile_input";
  metadata?: {
    confidenceThreshold?: number;
    observedConfidence?: number;
    routingReason?: string;
  };
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

export type PreValidationResult = {
  ok: boolean;
  reason?: "invalid_input" | "hostile_input" | "policy_blocked";
  deny?: boolean;
};

export type PostValidationResult = {
  ok: boolean;
  reason?: "validation_failed";
  data?: ExtractedDocument;
};

export type PostValidationPolicyResult = {
  ok: boolean;
  reason?: "policy_blocked";
};

export type ReviewAction = "approve" | "edit" | "escalate";

export type ReviewActionRequest = {
  traceId: string;
  action: ReviewAction;
  actorId?: string;
  notes?: string;
  editedSummary?: string;
};

export type ReviewDecisionEvent = {
  auditId: string;
  traceId: string;
  action: ReviewAction;
  actorId: string;
  notes?: string;
  editedSummary?: string;
  at: string;
};
