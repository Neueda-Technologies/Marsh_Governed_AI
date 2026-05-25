import type { ReviewActionRequest, ReviewDecisionEvent } from "./types";

const reviewEventsByTraceId = new Map<string, ReviewDecisionEvent[]>();

export function recordReviewAction(input: ReviewActionRequest): ReviewDecisionEvent {
  const event: ReviewDecisionEvent = {
    auditId: createAuditId(),
    traceId: input.traceId,
    action: input.action,
    actorId: input.actorId ?? "unknown_actor",
    notes: input.notes,
    editedSummary: input.editedSummary,
    at: new Date().toISOString(),
  };

  const existing = reviewEventsByTraceId.get(input.traceId) ?? [];
  reviewEventsByTraceId.set(input.traceId, [...existing, event]);
  return event;
}

export function getReviewActions(traceId: string): ReviewDecisionEvent[] {
  return reviewEventsByTraceId.get(traceId) ?? [];
}

function createAuditId(): string {
  return `aud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}
