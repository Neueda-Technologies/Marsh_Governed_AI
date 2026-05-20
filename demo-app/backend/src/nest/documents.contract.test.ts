import { describe, expect, it } from "vitest";
import { DocumentsController } from "./documents.controller";
import type { WorkflowResponse } from "../features/document-extraction";

function assertCommonMetadataFields(response: WorkflowResponse) {
  expect(
    response.status === "accepted" ||
      response.status === "needs_review" ||
      response.status === "denied"
  ).toBe(true);
  expect(response.traceId).toEqual(expect.any(String));
  expect(response.traceId.length).toBeGreaterThan(0);
  expect(response.promptVersion).toEqual(expect.any(String));
  expect(response.promptVersion.length).toBeGreaterThan(0);
  expect(response.modelIdentifier).toEqual(expect.any(String));
  expect(response.modelIdentifier.length).toBeGreaterThan(0);
}

describe("POST /documents/extract contract", () => {
  const controller = new DocumentsController();

  it("returns accepted response shape for valid input", async () => {
    const response = await controller.extract({
      text: "Invoice #INV-2108 due in 14 days for 2500 EUR and paid via bank transfer.",
      source: "upload",
    });

    assertCommonMetadataFields(response);
    expect(response.status).toBe("accepted");
    if (response.status === "accepted") {
      expect(response.data).toEqual(
        expect.objectContaining({
          documentType: expect.any(String),
          confidence: expect.any(Number),
          entities: expect.any(Array),
        })
      );
    }
  });

  it("returns needs_review response shape for invalid input", async () => {
    const response = await controller.extract({
      text: "too short",
      source: "upload",
    });

    assertCommonMetadataFields(response);
    expect(response.status).toBe("needs_review");
    if (response.status === "needs_review") {
      expect(response.reason).toBe("invalid_input");
    }
  });

  it("routes missing text requests to needs_review with invalid_input reason", async () => {
    const response = await controller.extract({} as never);

    assertCommonMetadataFields(response);
    expect(response.status).toBe("needs_review");
    if (response.status === "needs_review") {
      expect(response.reason).toBe("invalid_input");
    }
  });

  it("returns denied response shape for policy-sensitive input", async () => {
    const response = await controller.extract({
      text: "Customer record includes SSN 123-45-6789 for verification. Please continue processing.",
      source: "upload",
    });

    assertCommonMetadataFields(response);
    expect(response.status).toBe("denied");
    if (response.status === "denied") {
      expect(response.reason).toBe("policy_sensitive_input");
    }
  });

  it("persists review action events with traceable audit metadata", async () => {
    const traceId = "trace-review-actions";
    const actionResponse = controller.reviewAction({
      traceId,
      action: "approve",
      actorId: "reviewer-1",
      notes: "Looks good for demo progression",
    });

    expect(actionResponse.ok).toBe(true);
    expect(actionResponse.event).toEqual(
      expect.objectContaining({
        traceId,
        action: "approve",
        actorId: "reviewer-1",
        notes: "Looks good for demo progression",
        auditId: expect.any(String),
        at: expect.any(String),
      })
    );

    const eventsResponse = controller.reviewActions({ traceId });
    expect(eventsResponse.traceId).toBe(traceId);
    expect(eventsResponse.events.length).toBeGreaterThan(0);
    expect(eventsResponse.events[0]).toEqual(
      expect.objectContaining({
        traceId,
        action: "approve",
        actorId: "reviewer-1",
      })
    );
  });
});
