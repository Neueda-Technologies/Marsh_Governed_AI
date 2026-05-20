import type {
  ExtractRequest,
  ExtractedDocument,
  PostValidationResult,
  PreValidationResult,
} from "./types";

const ALLOWED_TYPES = new Set(["invoice", "contract", "email", "other"]);
const POLICY_REVIEW_INPUT_PATTERNS = [/password/i, /private key/i, /internal-only/i];
const POLICY_DENY_INPUT_PATTERNS = [/\b\d{3}-\d{2}-\d{4}\b/, /\b(?:\d[ -]*?){13,16}\b/];
const POLICY_REVIEW_OUTPUT_PATTERNS = [/unverified/i, /guess/i];
const POLICY_DENY_OUTPUT_PATTERNS = [/transfer funds to personal account/i, /bypass approval/i];

export function validatePreCall(input: ExtractRequest): PreValidationResult {
  if (!input.text || typeof input.text !== "string") {
    return { ok: false, reason: "invalid_input" };
  }

  const trimmed = input.text.trim();
  if (trimmed.length < 20 || trimmed.length > 10000) {
    return { ok: false, reason: "invalid_input" };
  }

  if (POLICY_DENY_INPUT_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { ok: false, reason: "policy_sensitive_input", outcome: "deny" };
  }

  if (POLICY_REVIEW_INPUT_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { ok: false, reason: "policy_sensitive_input", outcome: "review" };
  }

  return { ok: true };
}

export function validatePostCall(candidate: unknown): PostValidationResult {
  if (!candidate || typeof candidate !== "object") {
    return { ok: false, reason: "validation_failed" };
  }

  const data = candidate as Partial<ExtractedDocument>;

  if (typeof data.documentType !== "string" || !ALLOWED_TYPES.has(data.documentType)) {
    return { ok: false, reason: "validation_failed" };
  }

  if (typeof data.confidence !== "number" || data.confidence < 0 || data.confidence > 1) {
    return { ok: false, reason: "validation_failed" };
  }

  if (!Array.isArray(data.entities) || data.entities.some((x) => typeof x !== "string")) {
    return { ok: false, reason: "validation_failed" };
  }

  const summary = typeof data.summary === "string" ? data.summary : "";
  if (POLICY_DENY_OUTPUT_PATTERNS.some((pattern) => pattern.test(summary))) {
    return { ok: false, reason: "policy_sensitive_output", outcome: "deny" };
  }

  if (POLICY_REVIEW_OUTPUT_PATTERNS.some((pattern) => pattern.test(summary))) {
    return { ok: false, reason: "policy_sensitive_output", outcome: "review" };
  }

  return {
    ok: true,
    data: {
      documentType: data.documentType,
      confidence: data.confidence,
      entities: data.entities,
      summary: typeof data.summary === "string" ? data.summary : undefined,
    },
  };
}
