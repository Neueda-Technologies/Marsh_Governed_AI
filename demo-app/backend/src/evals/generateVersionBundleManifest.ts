import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { DOCUMENT_EXTRACTION_PROMPT_VERSION } from "../features/document-extraction/prompt";
import { getRuntimeProfileConfig } from "../config/runtimeProfile";

type EvalCase = {
  id: string;
};

function sha256ForFile(filePath: string): string {
  const content = readFileSync(filePath);
  return createHash("sha256").update(content).digest("hex");
}

function main() {
  const cwd = process.cwd();
  const packageJsonPath = path.resolve(cwd, "package.json");
  const datasetPath = path.resolve(cwd, "evals", "document-extraction.dataset.json");
  const manifestPath = path.resolve(cwd, "evals", "artifacts", "version-bundle-manifest.json");

  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8")) as {
    version: string;
  };
  const dataset = JSON.parse(readFileSync(datasetPath, "utf8")) as EvalCase[];
  const runtimeConfig = getRuntimeProfileConfig();

  const promptFile = path.resolve(
    cwd,
    "src",
    "features",
    "document-extraction",
    "prompt.ts"
  );
  const workflowFile = path.resolve(
    cwd,
    "src",
    "features",
    "document-extraction",
    "workflow.ts"
  );
  const validatorsFile = path.resolve(
    cwd,
    "src",
    "features",
    "document-extraction",
    "validators.ts"
  );
  const runtimeProfileFile = path.resolve(cwd, "src", "config", "runtimeProfile.ts");

  const manifest = {
    manifestVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    appVersion: packageJson.version,
    prompt: {
      name: "document-extraction",
      version: DOCUMENT_EXTRACTION_PROMPT_VERSION,
    },
    runtimeConfig: {
      profile: runtimeConfig.profile,
      llmMode: runtimeConfig.llmMode,
      useMastraRuntime: runtimeConfig.useMastraRuntime,
      modelIdentifier: runtimeConfig.modelIdentifier,
      confidenceThreshold: runtimeConfig.confidenceThreshold,
      openAiBaseUrl: runtimeConfig.openAiBaseUrl ?? null,
    },
    evalSet: {
      datasetPath: path.relative(cwd, datasetPath),
      totalCases: dataset.length,
      datasetSha256: sha256ForFile(datasetPath),
    },
    sourceHashes: {
      promptFile: sha256ForFile(promptFile),
      workflowFile: sha256ForFile(workflowFile),
      validatorsFile: sha256ForFile(validatorsFile),
      runtimeProfileFile: sha256ForFile(runtimeProfileFile),
    },
  };

  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Version bundle manifest written: ${path.relative(cwd, manifestPath)}`);
}

main();
