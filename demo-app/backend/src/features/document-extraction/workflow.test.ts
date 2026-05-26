import { describe, expect, it, vi } from "vitest";
import { createDocumentExtractionWorkflow } from "./workflow";
import type { GatewayInvokeInput, GatewayInvokeResult, LlmGateway } from "./gateway";
import { DOCUMENT_EXTRACTION_PROMPT_VERSION } from "./prompt";

function createFakeGateway(rawOutput: unknown) {
  const invoke = vi.fn(async (input: GatewayInvokeInput): Promise<GatewayInvokeResult> => {
    return {
      modelIdentifier: input.modelIdentifier,
      rawOutput,
    };
  });

  const gateway: LlmGateway = { invoke };
  return { gateway, invoke };
}

describe("document extraction workflow", () => {
  it("returns accepted for valid input and valid post-validation output", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.95,
      entities: ["invoice_number", "amount_due"],
      summary: "Invoice with key billing fields",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    const result = await workflow.execute({
      text: "Invoice #12345 from ACME Corp with amount due of 400 USD.",
      traceId: "trace-accepted",
    });

    expect(invoke).toHaveBeenCalledTimes(1);
    expect(invoke).toHaveBeenCalledWith(
      expect.objectContaining({
        traceId: "trace-accepted",
        promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
        modelIdentifier: "test-model",
      }),
    );
    expect(result).toEqual({
      status: "accepted",
      traceId: "trace-accepted",
      promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      modelIdentifier: "test-model",
      data: {
        documentType: "invoice",
        confidence: 0.95,
        entities: ["invoice_number", "amount_due"],
        summary: "Invoice with key billing fields",
      },
    });
  });

  it("returns needs_review with invalid_input when pre-validation fails", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.9,
      entities: ["invoice_number"],
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    const result = await workflow.execute({
      text: "too short",
      traceId: "trace-invalid-input",
    });

    expect(invoke).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "needs_review",
      traceId: "trace-invalid-input",
      promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      modelIdentifier: "test-model",
      reason: "invalid_input",
    });
  });

  it("returns needs_review with validation_failed when post-validation fails", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "not-a-real-type",
      confidence: 0.8,
      entities: ["entity_a"],
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    const result = await workflow.execute({
      text: "This is a sufficiently long document text for extraction testing.",
      traceId: "trace-validation-failed",
    });

    expect(invoke).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      status: "needs_review",
      traceId: "trace-validation-failed",
      promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      modelIdentifier: "test-model",
      reason: "validation_failed",
    });
  });

  it("injects allowlisted skills into the gateway prompt for invoice-like text", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.95,
      entities: ["invoice_number", "amount_due"],
      summary: "Invoice with key billing fields",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    const result = await workflow.execute({
      text: "Invoice #12345 from ACME Corp with amount due of 400 USD.",
      traceId: "trace-skills",
      skillsMode: "auto",
    });

    const prompt = invoke.mock.calls[0]?.[0]?.prompt as string;
    expect(prompt).toContain("### Skill: invoice-extraction@1.0.0");
    expect(prompt).not.toContain("external-enrichment");
    expect(result.status).toBe("accepted");
    if (result.status === "accepted") {
      expect(result.skills?.bundleVersion).toMatch(/^[a-f0-9]{12}$/);
      expect(result.skills?.applied).toEqual([
        expect.objectContaining({
          id: "invoice-extraction",
          declaredVersion: "1.0.0",
        }),
      ]);
    }
  });

  it("skips skill injection when skillsMode is off", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.95,
      entities: ["invoice_number"],
      summary: "Invoice with key billing fields",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    await workflow.execute({
      text: "Invoice #12345 from ACME Corp with amount due of 400 USD.",
      traceId: "trace-skills-off",
      skillsMode: "off",
    });

    const prompt = invoke.mock.calls[0]?.[0]?.prompt as string;
    expect(prompt).not.toContain("### Skill:");
  });

  it("applies bounded-tool allowlist path when executionMode is bounded_tool", async () => {
    const { gateway } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.95,
      entities: ["Invoice_Number", " invoice_number ", "Amount_Due"],
      summary: "Invoice with key billing fields",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    const result = await workflow.execute({
      text: "Invoice #12345 from ACME Corp with amount due of 400 USD.",
      traceId: "trace-bounded-tool",
      executionMode: "bounded_tool",
    });

    expect(result.status).toBe("accepted");
    if (result.status === "accepted") {
      expect(result.data.entities).toEqual(["invoice_number", "amount_due"]);
      expect(result.data.summary).toContain("[bounded-tool: entity_normalizer]");
    }
  });

  it("returns denied for policy-sensitive input pattern", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.95,
      entities: ["invoice_number"],
      summary: "Invoice with key billing fields",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    const result = await workflow.execute({
      text: "Please extract details for SSN 123-45-6789 from this attached record.",
      traceId: "trace-policy-deny",
    });

    expect(invoke).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "denied",
      traceId: "trace-policy-deny",
      promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      modelIdentifier: "test-model",
      reason: "policy_sensitive_input",
    });
  });

  it("returns needs_review for policy-review input pattern", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.95,
      entities: ["invoice_number"],
      summary: "Invoice with key billing fields",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
    });

    const result = await workflow.execute({
      text: "This extraction may expose internal-only values for a production incident report.",
      traceId: "trace-policy-review",
    });

    expect(invoke).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "needs_review",
      traceId: "trace-policy-review",
      promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      modelIdentifier: "test-model",
      reason: "policy_sensitive_input",
    });
  });

  it("routes low-confidence outputs to needs_review with threshold metadata", async () => {
    const { gateway } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.42,
      entities: ["invoice_number"],
      summary: "Invoice with uncertain extraction quality",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
      confidenceThreshold: 0.8,
    });

    const result = await workflow.execute({
      text: "Invoice #12345 from ACME Corp with amount due of 400 USD.",
      traceId: "trace-low-confidence",
    });

    expect(result).toEqual({
      status: "needs_review",
      traceId: "trace-low-confidence",
      promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      modelIdentifier: "test-model",
      reason: "low_confidence",
      metadata: {
        confidenceThreshold: 0.8,
        observedConfidence: 0.42,
        routingReason: "confidence_below_threshold",
      },
    });
  });

  it("returns denied with feature_disabled when kill switch is active", async () => {
    const { gateway, invoke } = createFakeGateway({
      documentType: "invoice",
      confidence: 0.95,
      entities: ["invoice_number"],
      summary: "Invoice with key billing fields",
    });
    const workflow = createDocumentExtractionWorkflow({
      gateway,
      modelIdentifier: "test-model",
      featureEnabled: false,
    });

    const result = await workflow.execute({
      text: "Invoice #12345 from ACME Corp with amount due of 400 USD.",
      traceId: "trace-feature-disabled",
    });

    expect(invoke).not.toHaveBeenCalled();
    expect(result).toEqual({
      status: "denied",
      traceId: "trace-feature-disabled",
      promptVersion: DOCUMENT_EXTRACTION_PROMPT_VERSION,
      modelIdentifier: "test-model",
      reason: "feature_disabled",
    });
  });
});
