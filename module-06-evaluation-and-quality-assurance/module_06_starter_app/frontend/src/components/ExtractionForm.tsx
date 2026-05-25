import { SAMPLE_INPUTS } from "../constants";

type ExtractionFormProps = {
  text: string;
  onTextChange: (text: string) => void;
  executionMode: "deterministic" | "bounded_tool";
  onExecutionModeChange: (mode: "deterministic" | "bounded_tool") => void;
  onExtract: () => void;
  isExtracting: boolean;
};

export function ExtractionForm({
  text,
  onTextChange,
  executionMode,
  onExecutionModeChange,
  onExtract,
  isExtracting,
}: ExtractionFormProps) {
  return (
    <>
      <label htmlFor="documentText">Document text</label>
      <textarea
        id="documentText"
        value={text}
        onChange={(event) => onTextChange(event.target.value)}
        rows={8}
      />
      <div className="sample-buttons">
        {SAMPLE_INPUTS.map((sample) => (
          <button
            key={sample.id}
            type="button"
            className="sample-button"
            onClick={() => onTextChange(sample.text)}
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
          onExecutionModeChange(event.target.value as "deterministic" | "bounded_tool")
        }
      >
        <option value="deterministic">Deterministic workflow</option>
        <option value="bounded_tool">Bounded-tool workflow</option>
      </select>

      <button type="button" onClick={onExtract} disabled={isExtracting}>
        {isExtracting ? "Extracting..." : "Extract document"}
      </button>
    </>
  );
}
