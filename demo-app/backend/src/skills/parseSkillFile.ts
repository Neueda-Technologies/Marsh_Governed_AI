import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import type { LoadedSkill, SkillFrontMatter } from "./types";

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function parseFrontMatter(block: string): SkillFrontMatter {
  const meta: SkillFrontMatter = { id: "" };
  let listKey: "keywords" | "sources" | null = null;

  for (const rawLine of block.split("\n")) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem && listKey) {
      const value = listItem[1].trim().replace(/^["']|["']$/g, "");
      meta[listKey] = [...(meta[listKey] ?? []), value];
      continue;
    }

    listKey = null;
    const scalar = line.match(/^(\w+):\s*(.*)$/);
    if (!scalar) {
      continue;
    }

    const [, key, rawValue] = scalar;
    if (key === "keywords" || key === "sources") {
      listKey = key;
      if (rawValue.trim()) {
        meta[key] = [rawValue.trim().replace(/^["']|["']$/g, "")];
      } else {
        meta[key] = [];
      }
      continue;
    }

    if (key === "id" || key === "description" || key === "version") {
      meta[key] = rawValue.trim().replace(/^["']|["']$/g, "");
    }
  }

  return meta;
}

export function parseSkillFile(path: string): LoadedSkill {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(FRONT_MATTER_RE);
  if (!match) {
    throw new Error(`Invalid skill file (missing front matter): ${path}`);
  }

  const meta = parseFrontMatter(match[1]);
  if (!meta.id) {
    throw new Error(`Skill missing id: ${path}`);
  }
  if (!meta.version) {
    throw new Error(`Skill missing version in front matter: ${path}`);
  }

  const contentDigest = createHash("sha256").update(raw).digest("hex").slice(0, 12);

  return {
    id: meta.id,
    declaredVersion: meta.version,
    contentDigest,
    description: meta.description ?? "",
    keywords: meta.keywords ?? [],
    sources: meta.sources ?? [],
    body: match[2].trim(),
    path,
  };
}
