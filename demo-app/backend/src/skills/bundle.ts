import { createHash } from "node:crypto";
import type { LoadedSkill } from "./types";

export type AppliedSkillRef = {
  id: string;
  declaredVersion: string;
  contentDigest: string;
};

export type SkillBundleMetadata = {
  bundleVersion: string;
  applied: AppliedSkillRef[];
};

export type SkillCatalogEntry = AppliedSkillRef & {
  path: string;
  allowlisted: boolean;
};

function toAppliedRefs(skills: LoadedSkill[]): AppliedSkillRef[] {
  return skills
    .map((skill) => ({
      id: skill.id,
      declaredVersion: skill.declaredVersion,
      contentDigest: skill.contentDigest,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function buildSkillBundleMetadata(loaded: LoadedSkill[]): SkillBundleMetadata {
  const applied = toAppliedRefs(loaded);
  const bundleVersion = createHash("sha256")
    .update(JSON.stringify(applied))
    .digest("hex")
    .slice(0, 12);

  return { bundleVersion, applied };
}

export function buildSkillCatalogVersion(entries: SkillCatalogEntry[]): string {
  const payload = entries
    .map((entry) => ({
      id: entry.id,
      declaredVersion: entry.declaredVersion,
      contentDigest: entry.contentDigest,
      allowlisted: entry.allowlisted,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex").slice(0, 12);
}
