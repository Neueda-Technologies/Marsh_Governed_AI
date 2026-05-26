export type ExtractRequest = {
  text: string;
  source?: string;
  traceId?: string;
  executionMode?: "deterministic" | "bounded_tool";
  /** When "off", skip deterministic skill routing (default: off). */
  skillsMode?:  "off" | "auto";
};

export type AppliedSkillRef = {
  id: string;
  declaredVersion: string;
  contentDigest: string;
};

export type SkillBundleMetadata = {
  bundleVersion: string;
  applied: AppliedSkillRef[];
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
  skills?: SkillBundleMetadata;
  data: ExtractedDocument;
};

export type WorkflowFallbackResponse = {
  status: "needs_review";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  skills?: SkillBundleMetadata;
  reason:
    | "invalid_input"
    | "validation_failed"
    | "policy_sensitive_input"
    | "policy_sensitive_output"
    | "low_confidence";
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
  skills?: SkillBundleMetadata;
  reason: "policy_sensitive_input" | "policy_sensitive_output" | "feature_disabled";
};

export type WorkflowResponse =
  | WorkflowAcceptedResponse
  | WorkflowFallbackResponse
  | WorkflowDeniedResponse;

export type PreValidationResult = {
  ok: boolean;
  reason?: "invalid_input" | "policy_sensitive_input";
  outcome?: "review" | "deny";
};

export type PostValidationResult = {
  ok: boolean;
  reason?: "validation_failed" | "policy_sensitive_output";
  outcome?: "review" | "deny";
  data?: ExtractedDocument;
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
