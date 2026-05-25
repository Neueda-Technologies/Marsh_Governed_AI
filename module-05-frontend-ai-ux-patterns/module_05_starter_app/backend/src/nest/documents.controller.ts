import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  createDocumentController,
  getReviewActions,
  recordReviewAction,
  type ExtractRequest,
  type ReviewActionRequest,
} from "../features/document-extraction";
import { createGatewayForRuntime } from "./gatewayRuntime";
import { getRuntimeProfileConfig } from "../config/runtimeProfile";

@Controller("documents")
export class DocumentsController {
  private readonly runtimeConfig = getRuntimeProfileConfig();
  private readonly documentController = createDocumentController({
    gateway: createGatewayForRuntime(),
    modelIdentifier: this.runtimeConfig.modelIdentifier,
    confidenceThreshold: this.runtimeConfig.confidenceThreshold,
    featureEnabled: this.runtimeConfig.featureDocumentExtractionEnabled,
  });

  @Get("health")
  health() {
    return { ok: true };
  }

  @Post("extract")
  async extract(@Body() body: ExtractRequest) {
    return this.documentController.extractDocument(body);
  }

  @Post("review-action")
  reviewAction(@Body() body: ReviewActionRequest) {
    const event = recordReviewAction(body);
    return {
      ok: true,
      event,
    };
  }

  @Post("review-actions")
  reviewActions(@Body() body: { traceId: string }) {
    return {
      traceId: body.traceId,
      events: getReviewActions(body.traceId),
    };
  }
}
