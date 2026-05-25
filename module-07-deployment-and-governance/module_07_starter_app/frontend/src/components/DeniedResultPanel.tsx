import type { WorkflowDeniedResponse } from "../types";

type DeniedResultPanelProps = {
  result: WorkflowDeniedResponse;
};

export function DeniedResultPanel({ result }: DeniedResultPanelProps) {
  return (
    <section className="panel error">
      <h3>Denied by policy</h3>
      <p>
        <strong>Deny reason:</strong> {result.reason}
      </p>
    </section>
  );
}
