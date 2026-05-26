import { describe, expect, it } from "vitest";
import { loadSkillsForRequest } from "./loader";
import { parseSkillFile } from "./parseSkillFile";
import { resolveSkillsRoot } from "./resolveSkillsRoot";
import { join } from "node:path";

describe("skill loader", () => {
  it("parses front matter lists from SKILL.md", () => {
    const skill = parseSkillFile(join(resolveSkillsRoot(), "invoice-extraction", "SKILL.md"));
    expect(skill.id).toBe("invoice-extraction");
    expect(skill.keywords).toContain("invoice");
    expect(skill.body).toContain("Prefer entities");
  });

  it("loads invoice-extraction for invoice-like text", () => {
    const result = loadSkillsForRequest(resolveSkillsRoot(), {
      text: "invoice #inv-2026 amount due 980 eur",
      source: "demo",
    });

    expect(result.requested).toContain("invoice-extraction");
    expect(result.loaded.map((skill) => skill.id)).toEqual(["invoice-extraction"]);
    expect(result.blocked).toEqual([]);
  });

  it("loads pii-handling for upload source", () => {
    const result = loadSkillsForRequest(resolveSkillsRoot(), {
      text: "contract renewal notice for acme corp",
      source: "upload",
    });

    expect(result.requested).toContain("pii-handling");
    expect(result.loaded.map((skill) => skill.id)).toEqual(["pii-handling"]);
  });

  it("blocks external-enrichment when matched but not allowlisted", () => {
    const result = loadSkillsForRequest(resolveSkillsRoot(), {
      text: "please run a web search for latest rates on this vendor",
      source: "demo",
    });

    expect(result.requested).toContain("external-enrichment");
    expect(result.loaded).toEqual([]);
    expect(result.blocked).toEqual(["external-enrichment"]);
  });
});
