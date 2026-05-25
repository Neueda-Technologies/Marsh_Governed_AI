import type { TransitionRecord } from "../types";

type TransitionTelemetryProps = {
  transitions: TransitionRecord[];
};

export function TransitionTelemetry({ transitions }: TransitionTelemetryProps) {
  return (
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
  );
}
