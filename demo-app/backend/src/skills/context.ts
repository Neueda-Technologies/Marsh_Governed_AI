import type { ExtractRequest } from "../features/document-extraction/types";
import type { SkillMatchContext } from "./types";

export function buildSkillContext(input: ExtractRequest): SkillMatchContext {
  return {
    text: input.text.toLowerCase(),
    source: (input.source ?? "unknown").toLowerCase(),
  };
}
