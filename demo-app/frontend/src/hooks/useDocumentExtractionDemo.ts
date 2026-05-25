import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  extractDocument,
  fetchReviewActions,
  submitReviewAction,
} from "../api/documents";
import { DEFAULT_DOCUMENT_TEXT } from "../constants";
import type {
  ReviewAction,
  ReviewDecisionEvent,
  TransitionRecord,
  UiState,
  WorkflowResponse,
} from "../types";

export function useDocumentExtractionDemo() {
  const [text, setText] = useState(DEFAULT_DOCUMENT_TEXT);
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

    await reviewMutation.mutateAsync({
      traceId: result.traceId,
      action,
      actorId: "frontend-reviewer",
      notes: reviewNotes,
      editedSummary,
    });

    const events = await fetchReviewActions(result.traceId);
    setReviewEvents(events);
    transition("needs_review", `review_action_${action}`);
  }

  return {
    text,
    setText,
    uiState,
    transitions,
    result,
    requestError,
    reviewNotes,
    setReviewNotes,
    editedSummary,
    setEditedSummary,
    reviewEvents,
    executionMode,
    setExecutionMode,
    mutation,
    reviewMutation,
    handleExtract,
    handleReviewAction,
  };
}
