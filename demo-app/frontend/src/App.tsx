import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

type ExtractRequest = {
  text: string;
  source: string;
  executionMode: "deterministic" | "bounded_tool";
};

type WorkflowAcceptedResponse = {
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

type WorkflowFallbackResponse = {
  status: "needs_review";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  reason: string;
};

type WorkflowDeniedResponse = {
  status: "denied";
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  reason: string;
};

type WorkflowResponse = WorkflowAcceptedResponse | WorkflowFallbackResponse | WorkflowDeniedResponse;
type UiState = "idle" | "loading" | "partial" | "needs_review" | "accepted" | "denied" | "error";
type TransitionRecord = {
  from: UiState;
  to: UiState;
  event: string;
  at: string;
};
type ReviewAction = "approve" | "edit" | "escalate";
type ReviewDecisionEvent = {
  auditId: string;
  traceId: string;
  action: ReviewAction;
  actorId: string;
  notes?: string;
  editedSummary?: string;
  at: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";
const SAMPLE_INPUTS = [
  {
    id: "pass-invoice",
    label: "Pass sample: invoice",
    text: "Invoice #INV-1023 due next Friday for 1250 EUR and paid via bank transfer.",
  },
  {
    id: "pass-contract",
    label: "Pass sample: contract",
    text: "Master services agreement renewal for Q3 with terms, contact details, and signed date.",
  },
  {
    id: "fail-review",
    label: "Fail sample: policy review",
    text: "Internal-only merger planning notes. Do not share externally under any circumstance.",
  },
  {
    id: "fail-deny",
    label: "Fail sample: deny",
    text: "Customer onboarding form with SSN 123-45-6789 and card 4111 1111 1111 1111.",
  },
] as const;

async function extractDocument(input: ExtractRequest): Promise<WorkflowResponse> {
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

async function submitReviewAction(input: {
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

async function fetchReviewActions(traceId: string): Promise<ReviewDecisionEvent[]> {
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

export default function App() {
  const [text, setText] = useState(
    "Invoice #INV-1023 due next Friday for 1250 EUR and paid via bank transfer."
  );
  const [uiState, setUiState] = useState<UiState>("idle");
  const [transitions, setTransitions] = useState<TransitionRecord[]>([]);
  const [result, setResult] = useState<WorkflowResponse | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [reviewEvents, setReviewEvents] = useState<ReviewDecisionEvent[]>([]);
  const [executionMode, setExecutionMode] = useState<"deterministic" | "bounded_tool">(
    "deterministic"
  );

  function transition(to: UiState, event: string) {
    setUiState((from) => {
      if (from !== to) {
        setTransitions((prev) => [
          ...prev,
          { from, to, event, at: new Date().toISOString() },
        ]);
      }
      return to;
    });
  }

  const mutation = useMutation({
    mutationFn: extractDocument,
  });
  const reviewMutation = useMutation({
    mutationFn: submitReviewAction,
  });

  async function handleExtract() {
    setResult(null);
    setRequestError(null);
    transition("loading", "submit");

    try {
      const response = await mutation.mutateAsync({
        text,
        source: "frontend-demo",
        executionMode,
      });
      setResult(response);
      setReviewEvents([]);
      setReviewNotes("");
      setEditedSummary("");
      transition(response.status, "response_received");
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Unknown request error");
      transition("error", "request_failed");
    }
  }

  async function handleReviewAction(action: ReviewAction) {
    if (!result || result.status !== "needs_review") return;
    const actorId = "frontend-reviewer";
    await reviewMutation.mutateAsync({
      traceId: result.traceId,
      action,
      actorId,
      notes: reviewNotes,
      editedSummary,
    });
    const events = await fetchReviewActions(result.traceId);
    setReviewEvents(events);
    transition("needs_review", `review_action_${action}`);
  }

  return (
    <main className="page">
      <h1>Document Extraction Demo</h1>
      <p className="subtitle">TanStack Query client for /documents/extract</p>
      <p className="state">
        Current state: <strong>{uiState}</strong>
      </p>

      <label htmlFor="documentText">Document text</label>
      <textarea
        id="documentText"
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
      />
      <div className="sample-buttons">
        {SAMPLE_INPUTS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="sample-button"
            onClick={() => setText(sample.text)}
          >
            {sample.label}
          </button>
        ))}
      </div>

      <label htmlFor="executionMode">Execution mode</label>
      <select
        id="executionMode"
        value={executionMode}
        onChange={(event) =>
          setExecutionMode(event.target.value as "deterministic" | "bounded_tool")
        }
      >
        <option value="deterministic">Deterministic workflow</option>
        <option value="bounded_tool">Bounded-tool workflow</option>
      </select>

      <button
        type="button"
        onClick={handleExtract}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Extracting..." : "Extract document"}
      </button>

      {requestError && (
        <section className="panel error">
          <h2>Request error</h2>
          <p>{requestError}</p>
        </section>
      )}

      {result && (
        <section className="panel">
          <h2>Result</h2>
          <p>
            <strong>Status:</strong> {result.status}
          </p>
          <p>
            <strong>Trace:</strong> {result.traceId}
          </p>
          <p>
            <strong>Prompt version:</strong> {result.promptVersion}
          </p>
          <p>
            <strong>Model:</strong> {result.modelIdentifier}
          </p>
          <p>
            <strong>Execution mode:</strong> {executionMode}
          </p>

          {result.status === "accepted" ? (
            <>
              <p>
                <strong>Document type:</strong> {result.data.documentType}
              </p>
              <p>
                <strong>Confidence:</strong> {result.data.confidence}
              </p>
              <p>
                <strong>Entities:</strong> {result.data.entities.join(", ")}
              </p>
              {result.data.summary && (
                <p>
                  <strong>Summary:</strong> {result.data.summary}
                </p>
              )}
            </>
          ) : result.status === "needs_review" ? (
            <>
              <p>
                <strong>Review reason:</strong> {result.reason}
              </p>
              <section className="review-actions">
                <h3>Reviewer actions</h3>
                <label htmlFor="reviewNotes">Reviewer notes</label>
                <textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(event) => setReviewNotes(event.target.value)}
                  rows={3}
                />

                <label htmlFor="editedSummary">Edited summary (optional)</label>
                <textarea
                  id="editedSummary"
                  value={editedSummary}
                  onChange={(event) => setEditedSummary(event.target.value)}
                  rows={3}
                />

                <div className="action-row">
                  <button
                    type="button"
                    onClick={() => void handleReviewAction("approve")}
                    disabled={reviewMutation.isPending}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReviewAction("edit")}
                    disabled={reviewMutation.isPending}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReviewAction("escalate")}
                    disabled={reviewMutation.isPending}
                  >
                    Escalate
                  </button>
                </div>

                {reviewEvents.length > 0 && (
                  <div className="review-events">
                    <h3>Persisted review events</h3>
                    <ul>
                      {reviewEvents.map((event) => (
                        <li key={event.auditId}>
                          {event.action} by {event.actorId} at {event.at} (auditId:{" "}
                          {event.auditId})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            </>
          ) : (
            <section className="panel error">
              <h3>Denied by policy</h3>
              <p>
                <strong>Deny reason:</strong> {result.reason}
              </p>
            </section>
          )}
        </section>
      )}

      <section className="panel telemetry">
        <h2>Transition telemetry</h2>
        {transitions.length === 0 ? (
          <p>No transitions yet.</p>
        ) : (
          <ul>
            {transitions.map((entry, index) => (
              <li key={`${entry.at}-${index}`}>
                {entry.from} -&gt; {entry.to} ({entry.event}) at {entry.at}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
