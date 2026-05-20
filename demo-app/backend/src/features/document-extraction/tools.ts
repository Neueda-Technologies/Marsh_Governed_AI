import type { ExtractedDocument } from "./types";

type ToolName = "entity_normalizer" | "external_web_search";

const ALLOWED_TOOLS: ToolName[] = ["entity_normalizer"];

export function runBoundedToolPath(input: ExtractedDocument) {
  const requestedTools: ToolName[] = ["entity_normalizer", "external_web_search"];
  const allowedTools = requestedTools.filter((tool) => ALLOWED_TOOLS.includes(tool));

  let output = input;
  for (const tool of allowedTools) {
    if (tool === "entity_normalizer") {
      output = applyEntityNormalizer(output);
    }
  }

  return {
    output,
    requestedTools,
    allowedTools,
    blockedTools: requestedTools.filter((tool) => !allowedTools.includes(tool)),
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
