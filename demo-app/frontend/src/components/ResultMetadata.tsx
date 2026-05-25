import type { WorkflowResponse } from "../types";

type ResultMetadataProps = {
  result: WorkflowResponse;
  executionMode: string;
};

export function ResultMetadata({ result, executionMode }: ResultMetadataProps) {
  return (
    <>
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
    </>
  );
}
