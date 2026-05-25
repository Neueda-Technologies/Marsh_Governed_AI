import type {
  ExtractRequest,
  ExtractedDocument,
  PostValidationResult,
  PreValidationResult,
} from "./types";

const ALLOWED_TYPES = new Set(["invoice", "contract", "email", "other"]);

export function validatePreCall(input: ExtractRequest): PreValidationResult {
  if (!input.text || typeof input.text !== "string") {
    return { ok: false, reason: "invalid_input" };
  }

  const trimmed = input.text.trim();
  if (trimmed.length < 20 || trimmed.length > 10000) {
    return { ok: false, reason: "invalid_input" };
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
