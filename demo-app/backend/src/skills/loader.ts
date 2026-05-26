import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { buildSkillCatalogVersion, type SkillCatalogEntry } from "./bundle";
import { parseSkillFile } from "./parseSkillFile";
import type { LoadedSkill, SkillLoadResult, SkillMatchContext } from "./types";

export const ALLOWED_SKILL_IDS = ["invoice-extraction", "pii-handling"] as const;
export type AllowedSkillId = (typeof ALLOWED_SKILL_IDS)[number];

function skillMatches(skill: LoadedSkill, ctx: SkillMatchContext): boolean {
  const keywordHit =
    skill.keywords.length > 0 &&
    skill.keywords.some((keyword) => ctx.text.includes(keyword.toLowerCase()));

  const sourceHit =
    skill.sources.length > 0 && skill.sources.some((source) => ctx.source === source.toLowerCase());

  if (skill.keywords.length === 0 && skill.sources.length === 0) {
    return false;
  }

  return keywordHit || sourceHit;
}

export function discoverSkills(skillsRoot: string): LoadedSkill[] {
  const entries = readdirSync(skillsRoot, { withFileTypes: true });
  const paths = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => join(skillsRoot, entry.name, "SKILL.md"))
    .filter((path) => {
      try {
        return statSync(path).isFile();
      } catch {
        return false;
      }
    });

  return paths.map(parseSkillFile);
}

export function loadSkillsForRequest(skillsRoot: string, ctx: SkillMatchContext): SkillLoadResult {
  const all = discoverSkills(skillsRoot);
  const requested = all.filter((skill) => skillMatches(skill, ctx)).map((skill) => skill.id);

  const allowed = new Set<string>(ALLOWED_SKILL_IDS);
  const loaded = all.filter((skill) => requested.includes(skill.id) && allowed.has(skill.id));
  const loadedIds = new Set(loaded.map((skill) => skill.id));
  const blocked = requested.filter((id) => !loadedIds.has(id));

  return { requested, loaded, blocked };
}

export function buildSkillCatalogManifest(skillsRoot: string, cwd = process.cwd()): {
  catalogVersion: string;
  allowedSkillIds: readonly string[];
  entries: SkillCatalogEntry[];
} {
  const allowed = new Set<string>(ALLOWED_SKILL_IDS);
  const entries = discoverSkills(skillsRoot)
    .map((skill) => ({
      id: skill.id,
      declaredVersion: skill.declaredVersion,
      contentDigest: skill.contentDigest,
      path: relative(cwd, skill.path),
      allowlisted: allowed.has(skill.id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    catalogVersion: buildSkillCatalogVersion(entries),
    allowedSkillIds: ALLOWED_SKILL_IDS,
    entries,
  };
}
