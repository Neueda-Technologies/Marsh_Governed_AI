import { ExtractionForm } from "./components/ExtractionForm";
import { ExtractionResultPanel } from "./components/ExtractionResultPanel";
import { PageHeader } from "./components/PageHeader";
import { RequestErrorPanel } from "./components/RequestErrorPanel";
import { TransitionTelemetry } from "./components/TransitionTelemetry";
import { useDocumentExtractionDemo } from "./hooks/useDocumentExtractionDemo";

export default function App() {
  const {
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
  } = useDocumentExtractionDemo();

  return (
    <main className="page">
      <PageHeader uiState={uiState} />

      <ExtractionForm
        text={text}
        onTextChange={setText}
        executionMode={executionMode}
        onExecutionModeChange={setExecutionMode}
        onExtract={() => void handleExtract()}
        isExtracting={mutation.isPending}
      />

      {requestError && <RequestErrorPanel message={requestError} />}

      {result && (
        <ExtractionResultPanel
          result={result}
          executionMode={executionMode}
          reviewNotes={reviewNotes}
          onReviewNotesChange={setReviewNotes}
          editedSummary={editedSummary}
          onEditedSummaryChange={setEditedSummary}
          onReviewAction={(action) => void handleReviewAction(action)}
          isReviewSubmitting={reviewMutation.isPending}
          reviewEvents={reviewEvents}
        />
      )}

      <TransitionTelemetry transitions={transitions} />
    </main>
  );
}
