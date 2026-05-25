import type {
  ExtractRequest,
  ExtractedDocument,
  PostValidationPolicyResult,
  PostValidationResult,
  PreValidationResult,
} from "./types";

const ALLOWED_TYPES = new Set(["invoice", "contract", "email", "other"]);

const HOSTILE_DENY_PATTERNS: RegExp[] = [
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b(?:\d[ -]*?){13,16}\b/,
];

const HOSTILE_REVIEW_PATTERNS: RegExp[] = [
  /password/i,
  /private[\s_-]?key/i,
  /internal[\s_-]?only/i,
];

const POLICY_INSTRUCTION_PATTERNS: RegExp[] = [
  /ignore previous/i,
  /system:/i,
  /return your response as/i,
  /include the full/i,
];

export function validatePreCall(input: ExtractRequest): PreValidationResult {
  if (!input.text || typeof input.text !== "string") {
    return { ok: false, reason: "invalid_input" };
  }

  const trimmed = input.text.trim();
  if (trimmed.length < 20 || trimmed.length > 10000) {
    return { ok: false, reason: "invalid_input" };
  }

  if (HOSTILE_DENY_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { ok: false, reason: "hostile_input", deny: true };
  }

  if (HOSTILE_REVIEW_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    return { ok: false, reason: "policy_blocked", deny: false };
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

export function validatePostCallPolicy(data: ExtractedDocument): PostValidationPolicyResult {
  const summary = data.summary ?? "";

  if (POLICY_INSTRUCTION_PATTERNS.some((pattern) => pattern.test(summary))) {
    return { ok: false, reason: "policy_blocked" };
  }

  if (summary.length > 500) {
    return { ok: false, reason: "policy_blocked" };
  }

  if (data.entities.length > 20) {
    return { ok: false, reason: "policy_blocked" };
  }

  return { ok: true };
}
