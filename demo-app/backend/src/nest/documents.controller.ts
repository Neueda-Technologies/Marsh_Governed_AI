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

const runtimeConfig = getRuntimeProfileConfig();
const documentController = createDocumentController({
  gateway: createGatewayForRuntime(),
  modelIdentifier: runtimeConfig.modelIdentifier,
  confidenceThreshold: runtimeConfig.confidenceThreshold,
  featureEnabled: runtimeConfig.featureDocumentExtractionEnabled,
});

@Controller("documents")
export class DocumentsController {
  @Post("extract")
  async extract(@Body() body: ExtractRequest) {
    return documentController.extractDocument(body);
  }

  @Get("health")
  health() {
    return { ok: true };
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
