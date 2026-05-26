import { buildSkillBundleMetadata, type SkillBundleMetadata } from "./bundle";
import type { LoadedSkill } from "./types";

export type PromptWithSkills = {
  prompt: string;
  skillIds: string[];
  skillBundle: SkillBundleMetadata;
};

export function buildPromptWithSkills(basePrompt: string, skills: LoadedSkill[]): PromptWithSkills {
  const skillBundle = buildSkillBundleMetadata(skills);

  if (skills.length === 0) {
    return { prompt: basePrompt, skillIds: [], skillBundle };
  }

  const skillBlock = skills
    .map(
      (skill) =>
        `### Skill: ${skill.id}@${skill.declaredVersion} (digest ${skill.contentDigest})\n${skill.description}\n\n${skill.body}`,
    )
    .join("\n\n");

  const prompt = [
    basePrompt,
    "",
    "---",
    "Additional governed instructions (skills):",
    skillBlock,
    "---",
    "Follow the base JSON contract above; skills refine behaviour only.",
  ].join("\n");

  return {
    prompt,
    skillIds: skills.map((skill) => skill.id),
    skillBundle,
  };
}
