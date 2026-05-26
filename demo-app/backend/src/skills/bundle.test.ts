import { describe, expect, it } from "vitest";
import { buildSkillBundleMetadata } from "./bundle";
import { parseSkillFile } from "./parseSkillFile";
import { buildSkillCatalogManifest } from "./loader";
import { resolveSkillsRoot } from "./resolveSkillsRoot";
import { join } from "node:path";

describe("skill bundle versioning", () => {
  it("requires declared version in SKILL.md front matter", () => {
    const skill = parseSkillFile(join(resolveSkillsRoot(), "invoice-extraction", "SKILL.md"));
    expect(skill.declaredVersion).toBe("1.0.0");
    expect(skill.contentDigest).toMatch(/^[a-f0-9]{12}$/);
  });

  it("produces stable bundleVersion for the same loaded skill set", () => {
    const skill = parseSkillFile(join(resolveSkillsRoot(), "invoice-extraction", "SKILL.md"));
    const first = buildSkillBundleMetadata([skill]);
    const second = buildSkillBundleMetadata([skill]);
    expect(first.bundleVersion).toBe(second.bundleVersion);
    expect(first.applied[0]).toEqual({
      id: "invoice-extraction",
      declaredVersion: "1.0.0",
      contentDigest: skill.contentDigest,
    });
  });

  it("includes all catalog skills in version bundle manifest", () => {
    const catalog = buildSkillCatalogManifest(resolveSkillsRoot());
    expect(catalog.entries.length).toBeGreaterThanOrEqual(3);
    expect(catalog.catalogVersion).toMatch(/^[a-f0-9]{12}$/);
    expect(catalog.entries.find((entry) => entry.id === "external-enrichment")?.allowlisted).toBe(
      false,
    );
  });
});
