import type { ReviewAction, ReviewDecisionEvent } from "../types";

type ReviewActionsPanelProps = {
  reviewNotes: string;
  onReviewNotesChange: (notes: string) => void;
  editedSummary: string;
  onEditedSummaryChange: (summary: string) => void;
  onReviewAction: (action: ReviewAction) => void;
  isSubmitting: boolean;
  reviewEvents: ReviewDecisionEvent[];
};

export function ReviewActionsPanel({
  reviewNotes,
  onReviewNotesChange,
  editedSummary,
  onEditedSummaryChange,
  onReviewAction,
  isSubmitting,
  reviewEvents,
}: ReviewActionsPanelProps) {
  return (
    <section className="review-actions">
      <h3>Reviewer actions</h3>
      <label htmlFor="reviewNotes">Reviewer notes</label>
      <textarea
        id="reviewNotes"
        value={reviewNotes}
        onChange={(event) => onReviewNotesChange(event.target.value)}
        rows={3}
      />

      <label htmlFor="editedSummary">Edited summary (optional)</label>
      <textarea
        id="editedSummary"
        value={editedSummary}
        onChange={(event) => onEditedSummaryChange(event.target.value)}
        rows={3}
      />

      <div className="action-row">
        <button
          type="button"
          onClick={() => void onReviewAction("approve")}
          disabled={isSubmitting}
        >
          Approve
        </button>
        <button
          type="button"
          onClick={() => void onReviewAction("edit")}
          disabled={isSubmitting}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => void onReviewAction("escalate")}
          disabled={isSubmitting}
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
                {event.action} by {event.actorId} at {event.at} (auditId: {event.auditId})
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
