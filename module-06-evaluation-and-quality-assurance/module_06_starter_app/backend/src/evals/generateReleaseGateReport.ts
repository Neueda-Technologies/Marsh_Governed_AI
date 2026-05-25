import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

type EvalSummary = {
  runAt: string;
  total: number;
  passed: number;
  failed: number;
  passRate: number;
  results: Array<{
    id: string;
    passed: boolean;
    expected: { status: string; reason?: string };
    actual: {
      status: string;
      reason?: string;
      traceCompleteness: {
        traceId: boolean;
        promptVersion: boolean;
        modelIdentifier: boolean;
        complete: boolean;
      };
    };
  }>;
};

function main() {
  const evalRun = spawnSync(
    "node",
    ["--env-file=.env", "--require", "ts-node/register", "src/evals/runDocumentExtractionEvals.ts"],
    { cwd: process.cwd(), stdio: "inherit" }
  );
  if (evalRun.status !== 0) {
    process.exit(evalRun.status ?? 1);
  }

  const artifactDir = path.resolve(process.cwd(), "evals", "artifacts");
  const evalSummaryPath = path.join(artifactDir, "document-extraction-summary.json");
  const releaseGateJsonPath = path.join(artifactDir, "release-gate-report.json");
  const releaseGateMdPath = path.join(artifactDir, "release-gate-report.md");

  const summary = JSON.parse(readFileSync(evalSummaryPath, "utf8")) as EvalSummary;

  const policyCases = summary.results.filter((result) =>
    result.id.includes("policy_")
  );
  const policyPassed = policyCases.filter((result) => result.passed).length;
  const policyPassRate =
    policyCases.length === 0 ? 0 : Number((policyPassed / policyCases.length).toFixed(4));

  const traceCompleteCount = summary.results.filter(
    (result) => result.actual.traceCompleteness.complete
  ).length;
  const traceCompletenessRate =
    summary.results.length === 0
      ? 0
      : Number((traceCompleteCount / summary.results.length).toFixed(4));

  const gate = {
    runAt: new Date().toISOString(),
    evalRunAt: summary.runAt,
    quality: {
      total: summary.total,
      passed: summary.passed,
      failed: summary.failed,
      passRate: summary.passRate,
    },
    security: {
      policyCases: policyCases.length,
      policyPassed,
      policyPassRate,
    },
    traceability: {
      totalCases: summary.results.length,
      traceCompleteCount,
      traceCompletenessRate,
    },
    readiness: {
      qualityGate: summary.failed === 0,
      policyGate: policyCases.length > 0 && policyPassed === policyCases.length,
      traceGate: traceCompleteCount === summary.results.length,
    },
  };

  const deploymentReady =
    gate.readiness.qualityGate && gate.readiness.policyGate && gate.readiness.traceGate;

  const markdown = [
    "# Release Gate Report",
    "",
    `Generated: ${gate.runAt}`,
    `Eval run: ${gate.evalRunAt}`,
    "",
    "## Quality",
    `- Total cases: ${gate.quality.total}`,
    `- Passed: ${gate.quality.passed}`,
    `- Failed: ${gate.quality.failed}`,
    `- Pass rate: ${gate.quality.passRate}`,
    "",
    "## Security (Policy Cases)",
    `- Policy cases: ${gate.security.policyCases}`,
    `- Policy passed: ${gate.security.policyPassed}`,
    `- Policy pass rate: ${gate.security.policyPassRate}`,
    "",
    "## Trace Completeness",
    `- Cases with complete trace metadata: ${gate.traceability.traceCompleteCount}/${gate.traceability.totalCases}`,
    `- Trace completeness rate: ${gate.traceability.traceCompletenessRate}`,
    "",
    "## Deployment Readiness",
    `- Quality gate: ${gate.readiness.qualityGate ? "PASS" : "FAIL"}`,
    `- Policy gate: ${gate.readiness.policyGate ? "PASS" : "FAIL"}`,
    `- Trace gate: ${gate.readiness.traceGate ? "PASS" : "FAIL"}`,
    `- Final recommendation: ${deploymentReady ? "READY_TO_DEPLOY" : "HOLD"}`,
    "",
  ].join("\n");

  writeFileSync(releaseGateJsonPath, JSON.stringify({ ...gate, deploymentReady }, null, 2));
  writeFileSync(releaseGateMdPath, markdown);

  console.log(`Release gate artifacts written: ${path.relative(process.cwd(), releaseGateMdPath)}`);
  console.log(`Final recommendation: ${deploymentReady ? "READY_TO_DEPLOY" : "HOLD"}`);

  if (!deploymentReady) {
    process.exit(1);
  }
}

main();
