import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createDocumentExtractionWorkflow } from "../features/document-extraction/workflow";
import type {
  ExtractRequest,
  GatewayInvokeInput,
  GatewayInvokeResult,
  LlmGateway,
  WorkflowResponse,
} from "../features/document-extraction";

type EvalCase = {
  id: string;
  description: string;
  input: ExtractRequest;
  mockOutput: unknown;
  expected: {
    status: WorkflowResponse["status"];
    reason?: string;
  };
};

type EvalResult = {
  id: string;
  description: string;
  passed: boolean;
  expected: EvalCase["expected"];
  actual: {
    status: WorkflowResponse["status"];
    reason?: string;
    traceCompleteness: {
      traceId: boolean;
      promptVersion: boolean;
      modelIdentifier: boolean;
      complete: boolean;
    };
  };
};

function createCaseGateway(caseDef: EvalCase): LlmGateway {
  return {
    async invoke(input: GatewayInvokeInput): Promise<GatewayInvokeResult> {
      return {
        modelIdentifier: input.modelIdentifier,
        rawOutput: caseDef.mockOutput,
      };
    },
  };
}

function evaluateCase(caseDef: EvalCase): Promise<EvalResult> {
  const workflow = createDocumentExtractionWorkflow({
    gateway: createCaseGateway(caseDef),
    modelIdentifier: "eval-model",
    confidenceThreshold: Number(process.env.CONFIDENCE_THRESHOLD ?? 0.8),
  });

  return workflow
    .execute(caseDef.input)
    .then((response) => {
      const actualReason =
        "reason" in response && typeof response.reason === "string" ? response.reason : undefined;
      const traceCompleteness = {
        traceId: typeof response.traceId === "string" && response.traceId.length > 0,
        promptVersion:
          typeof response.promptVersion === "string" && response.promptVersion.length > 0,
        modelIdentifier:
          typeof response.modelIdentifier === "string" && response.modelIdentifier.length > 0,
        complete: false,
      };
      traceCompleteness.complete =
        traceCompleteness.traceId &&
        traceCompleteness.promptVersion &&
        traceCompleteness.modelIdentifier;

      const passed =
        response.status === caseDef.expected.status &&
        (caseDef.expected.reason ? caseDef.expected.reason === actualReason : true);
      return {
        id: caseDef.id,
        description: caseDef.description,
        passed,
        expected: caseDef.expected,
        actual: {
          status: response.status,
          reason: actualReason,
          traceCompleteness,
        },
      };
    })
    .catch((error: unknown) => ({
      id: caseDef.id,
      description: caseDef.description,
      passed: false,
      expected: caseDef.expected,
      actual: {
        status: "denied",
        reason: error instanceof Error ? error.message : "runner_error",
        traceCompleteness: {
          traceId: false,
          promptVersion: false,
          modelIdentifier: false,
          complete: false,
        },
      },
    }));
}

async function main() {
  const datasetPath = path.resolve(process.cwd(), "evals", "document-extraction.dataset.json");
  const artifactDir = path.resolve(process.cwd(), "evals", "artifacts");
  const artifactPath = path.join(artifactDir, "document-extraction-summary.json");

  const dataset = JSON.parse(readFileSync(datasetPath, "utf8")) as EvalCase[];
  const results = await Promise.all(dataset.map((item) => evaluateCase(item)));

  const passed = results.filter((item) => item.passed).length;
  const failed = results.length - passed;
  const summary = {
    runAt: new Date().toISOString(),
    total: results.length,
    passed,
    failed,
    passRate: results.length === 0 ? 0 : Number((passed / results.length).toFixed(4)),
    results,
  };

  mkdirSync(artifactDir, { recursive: true });
  writeFileSync(artifactPath, JSON.stringify(summary, null, 2));

  console.log(
    `Eval summary: total=${summary.total} passed=${summary.passed} failed=${summary.failed} passRate=${summary.passRate}`
  );
  console.log(`Artifact written: ${path.relative(process.cwd(), artifactPath)}`);

  if (failed > 0) {
    process.exit(1);
  }
}

void main();
