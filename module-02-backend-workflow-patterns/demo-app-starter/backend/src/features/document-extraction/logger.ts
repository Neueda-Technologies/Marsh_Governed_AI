type TraceLogEvent = {
  stage: "controller" | "workflow" | "gateway";
  event: string;
  traceId: string;
  promptVersion: string;
  modelIdentifier: string;
  details?: Record<string, unknown>;
};

export function logTraceEvent(event: TraceLogEvent): void {
  const payload = {
    ts: new Date().toISOString(),
    ...event,
  };
  console.log(JSON.stringify(payload));
}
