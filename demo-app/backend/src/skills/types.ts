export type SkillFrontMatter = {
  id: string;
  version?: string;
  description?: string;
  keywords?: string[];
  sources?: string[];
};

export type LoadedSkill = {
  id: string;
  declaredVersion: string;
  contentDigest: string;
  description: string;
  keywords: string[];
  sources: string[];
  body: string;
  path: string;
};

export type SkillMatchContext = {
  text: string;
  source: string;
};

export type SkillLoadResult = {
  requested: string[];
  loaded: LoadedSkill[];
  blocked: string[];
};
