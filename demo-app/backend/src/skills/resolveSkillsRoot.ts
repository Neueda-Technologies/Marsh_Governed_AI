import { join } from "node:path";

export function resolveSkillsRoot(): string {
  return join(__dirname, "../../skills");
}
