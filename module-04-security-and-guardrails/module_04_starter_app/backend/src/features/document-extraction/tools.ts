import type { ExtractedDocument } from "./types";

export type ToolName = "entity_normalizer" | "entity_classifier";

export const ALLOWED_TOOLS: ToolName[] = ["entity_normalizer"];

export function runBoundedToolPath(input: ExtractedDocument) {
  const requestedTools: ToolName[] = ["entity_normalizer", "entity_classifier"];
  const allowedTools = requestedTools.filter((tool) => ALLOWED_TOOLS.includes(tool));
  const blockedTools = requestedTools.filter((tool) => !allowedTools.includes(tool));

  let output = input;
  for (const tool of allowedTools) {
    if (tool === "entity_normalizer") {
      output = applyEntityNormalizer(output);
    }
    if (tool === "entity_classifier") {
      output = applyEntityClassifier(output);
    }
  }

  return {
    output,
    requestedTools,
    allowedTools,
    blockedTools,
  };
}

function applyEntityNormalizer(data: ExtractedDocument): ExtractedDocument {
  return {
    ...data,
    entities: Array.from(new Set(data.entities.map((entity) => entity.trim().toLowerCase()))),
    summary: data.summary
      ? `${data.summary} [bounded-tool: entity_normalizer]`
      : "[bounded-tool: entity_normalizer]",
  };
}

function applyEntityClassifier(_data: ExtractedDocument): ExtractedDocument {
  throw new Error("not implemented");
}
