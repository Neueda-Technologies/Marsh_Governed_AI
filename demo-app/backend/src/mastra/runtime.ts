import { Mastra } from "@mastra/core";

export function createMastraRuntime(): Mastra {
  return new Mastra({
    // Keep runtime lightweight for the workshop starter.
    // Teams can register real workflows/agents/tools incrementally.
  });
}
