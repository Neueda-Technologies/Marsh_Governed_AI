#!/usr/bin/env tsx

/**
 * prettyTrace.ts
 * Pipe tsx server output into this script for readable trace output.
 *
 * Usage:
 *   APP_PROFILE=dev npx tsx src/main.nest.ts | npx tsx src/ops/prettyTrace.ts
 */

import * as readline from "readline";
const SHOW_PAYLOADS = process.env.PRETTY_TRACE_PAYLOADS === "true";
// ANSI colour helpers
const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const STAGE_COLOURS: Record<string, string> = {
  controller: c.cyan,
  workflow: c.magenta,
  gateway: c.yellow,
};

const EVENT_ICONS: Record<string, string> = {
  request_received: "▶",
  pre_validation_result: "⬡",
  post_validation_result: "⬡",
  invoke_started: "→",
  invoke_completed: "←",
  llm_request_payload: "↑",
  llm_response_payload: "↓",
  accepted_decision: "✅",
  fallback_decision: "⚠️ ",
  deny_decision: "🚫",
  bounded_tool_selection: "🔧",
};

type TraceEvent = {
  ts?: string;
  stage?: string;
  event?: string;
  traceId?: string;
  promptVersion?: string;
  modelIdentifier?: string;
  details?: Record<string, unknown>;
};

function formatTime(ts: string): string {
  try {
    return new Date(ts).toISOString().slice(11, 19);
  } catch {
    return "??:??:??";
  }
}

function stageColour(stage: string): string {
  return STAGE_COLOURS[stage] ?? c.white;
}

function formatStage(stage: string): string {
  return `${stageColour(stage)}${c.bold}${stage.padEnd(12)}${c.reset}`;
}

function formatEvent(event: string): string {
  const icon = EVENT_ICONS[event] ?? "·";
  const isDecision =
    event.endsWith("_decision") || event === "accepted_decision";
  const colour = event.includes("deny")
    ? c.red
    : event.includes("fallback")
    ? c.yellow
    : event.includes("accepted")
    ? c.green
    : c.white;
  return `${icon} ${colour}${isDecision ? c.bold : ""}${event}${c.reset}`;
}

function formatDetails(
  event: string,
  details: Record<string, unknown> | undefined,
  extra: Partial<TraceEvent>
): string[] {
  const lines: string[] = [];
  if (event === "llm_request_payload" || event === "llm_response_payload") {
    const mode = details?.mode ?? "unknown";
    const tokens =
      event === "llm_response_payload" && details?.tokenUsage
        ? `  tokens: ${(details.tokenUsage as Record<string, unknown>).totalTokens ?? "?"}`
        : "";
  
    lines.push(`${c.dim}          mode: ${mode}${tokens}${c.reset}`);
  
    if (SHOW_PAYLOADS && event === "llm_request_payload") {
      const request = details?.request as Record<string, unknown> | undefined;
      const messages = request?.messages as Array<{ role: string; content: string }> | undefined;
      const userMessage = messages?.find((m) => m.role === "user");
      if (userMessage?.content) {
        const excerpt = userMessage.content.replace(/\n/g, "↵");
        lines.push(`${c.dim}          prompt: ${c.yellow}${excerpt}${c.reset}`);
      }
    }
  
    if (SHOW_PAYLOADS && event === "llm_response_payload") {
      const raw = details?.rawOutput as Record<string, unknown> | undefined;
      if (raw) {
        lines.push(`${c.dim}          output: ${c.green}${JSON.stringify(raw).slice(0, 200)}${c.reset}`);
      }
    }
  
    return lines;
  }

  const parts: string[] = [];

  if (details?.ok !== undefined) {
    parts.push(
      details.ok
        ? `${c.green}ok: true${c.reset}`
        : `${c.red}ok: false${c.reset}`
    );
  }

  if (details?.reason != null) {
    parts.push(`${c.yellow}reason: ${details.reason}${c.reset}`);
  }

  if (details?.mode != null) {
    parts.push(`${c.dim}mode: ${details.mode}${c.reset}`);
  }

  if (details?.source != null) {
    parts.push(`${c.dim}source: ${details.source}${c.reset}`);
  }

  if (details?.hasText != null) {
    parts.push(`${c.dim}hasText: ${details.hasText}${c.reset}`);
  }

  if (details?.hasOutput != null) {
    parts.push(`${c.dim}hasOutput: ${details.hasOutput}${c.reset}`);
  }

  if (details?.tokenUsage != null) {
    const tu = details.tokenUsage as Record<string, unknown>;
    parts.push(`${c.dim}tokens: ${tu.totalTokens ?? "?"}${c.reset}`);
  }

  if (details?.confidenceThreshold != null) {
    parts.push(
      `${c.yellow}threshold: ${details.confidenceThreshold}${c.reset}`
    );
  }

  if (details?.observedConfidence != null) {
    parts.push(
      `${c.yellow}observed: ${details.observedConfidence}${c.reset}`
    );
  }

  if (details?.requestedTools != null) {
    parts.push(`${c.dim}tools: ${JSON.stringify(details.requestedTools)}${c.reset}`);
  }

  if (details?.blockedTools != null) {
    const blocked = details.blockedTools as unknown[];
    if (blocked.length > 0) {
      parts.push(`${c.red}blocked: ${JSON.stringify(blocked)}${c.reset}`);
    }
  }

  // On decisions, show provenance
  if (event.endsWith("_decision") || event === "accepted_decision") {
    if (extra.traceId) parts.push(`${c.dim}traceId: ${extra.traceId}${c.reset}`);
    if (extra.promptVersion) parts.push(`${c.dim}promptVersion: ${extra.promptVersion}${c.reset}`);
    if (extra.modelIdentifier) parts.push(`${c.dim}model: ${extra.modelIdentifier}${c.reset}`);
  }

  if (parts.length > 0) {
    lines.push(`          ${parts.join("  ")}`);
  }

  return lines;
}

function printDivider(): void {
  console.log(`${c.dim}${"─".repeat(72)}${c.reset}`);
}

function handleLine(raw: string): void {
  const trimmed = raw.trim();
  if (!trimmed) return;

  // Pass through non-JSON lines (e.g. NestJS startup banner)
  if (!trimmed.startsWith("{")) {
    console.log(`${c.dim}${trimmed}${c.reset}`);
    return;
  }

  let event: TraceEvent;
  try {
    event = JSON.parse(trimmed) as TraceEvent;
  } catch {
    console.log(`${c.dim}${trimmed}${c.reset}`);
    return;
  }

  const time = formatTime(event.ts ?? "");
  const stage = event.stage ?? "unknown";
  const eventName = event.event ?? "unknown";

  // Divider before each new request at controller level
  if (stage === "controller" && eventName === "request_received") {
    printDivider();
  }

  const timeStr = `${c.dim}${time}${c.reset}`;
  const stageStr = formatStage(stage);
  const eventStr = formatEvent(eventName);

  console.log(`${timeStr}  ${stageStr}  ${eventStr}`);

  const detailLines = formatDetails(eventName, event.details, event);
  for (const line of detailLines) {
    console.log(line);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  terminal: false,
});

rl.on("line", handleLine);

rl.on("close", () => {
  console.log(`\n${c.dim}trace stream ended${c.reset}`);
});