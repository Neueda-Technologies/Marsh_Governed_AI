import type { ReviewAction, ReviewDecisionEvent, WorkflowResponse } from "../types";
import { AcceptedResultDetails } from "./AcceptedResultDetails";
import { DeniedResultPanel } from "./DeniedResultPanel";
import { ResultMetadata } from "./ResultMetadata";
import { ReviewActionsPanel } from "./ReviewActionsPanel";

type ExtractionResultPanelProps = {
  result: WorkflowResponse;
  executionMode: string;
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
  editedSummary: string;
  onEditedSummaryChange: (summary: string) => void;
  onReviewAction: (action: ReviewAction) => void;
  isReviewSubmitting: boolean;
  reviewEvents: ReviewDecisionEvent[];
};

export function ExtractionResultPanel({
  result,
  executionMode,
  reviewNotes,
  onReviewNotesChange,
  editedSummary,
  onEditedSummaryChange,
  onReviewAction,
  isReviewSubmitting,
  reviewEvents,
}: ExtractionResultPanelProps) {
  return (
    <section className="panel">
      <h2>Result</h2>
      <ResultMetadata result={result} executionMode={executionMode} />

      {result.status === "accepted" ? (
        <AcceptedResultDetails result={result} />
      ) : result.status === "needs_review" ? (
        <>
          <p>
            <strong>Review reason:</strong> {result.reason}
          </p>
          <ReviewActionsPanel
            reviewNotes={reviewNotes}
            onReviewNotesChange={onReviewNotesChange}
            editedSummary={editedSummary}
            onEditedSummaryChange={onEditedSummaryChange}
            onReviewAction={onReviewAction}
            isSubmitting={isReviewSubmitting}
            reviewEvents={reviewEvents}
          />
        </>
      ) : (
        <DeniedResultPanel result={result} />
      )}
    </section>
  );
}
