import type { WorkflowAcceptedResponse } from "../types";

type AcceptedResultDetailsProps = {
  result: WorkflowAcceptedResponse;
};

export function AcceptedResultDetails({ result }: AcceptedResultDetailsProps) {
  return (
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
  );
}
