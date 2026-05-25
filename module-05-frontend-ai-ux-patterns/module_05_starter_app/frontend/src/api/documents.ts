import { API_BASE_URL } from "../constants";
import type {
  ExtractRequest,
  ReviewAction,
  ReviewDecisionEvent,
  WorkflowResponse,
} from "../types";

export async function extractDocument(input: ExtractRequest): Promise<WorkflowResponse> {
  const response = await fetch(`${API_BASE_URL}/documents/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as WorkflowResponse;
}

export async function submitReviewAction(input: {
  traceId: string;
  action: ReviewAction;
  actorId: string;
  notes: string;
  editedSummary: string;
}): Promise<ReviewDecisionEvent> {
  const response = await fetch(`${API_BASE_URL}/documents/review-action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Review action failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    ok: boolean;
    event: ReviewDecisionEvent;
  };
  return payload.event;
}

export async function fetchReviewActions(traceId: string): Promise<ReviewDecisionEvent[]> {
  const response = await fetch(`${API_BASE_URL}/documents/review-actions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ traceId }),
  });

  if (!response.ok) {
    throw new Error(`Review actions fetch failed with status ${response.status}`);
  }

  const payload = (await response.json()) as {
    traceId: string;
    events: ReviewDecisionEvent[];
  };
  return payload.events;
}
