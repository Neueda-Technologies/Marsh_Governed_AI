import { Body, Controller, Get, Post } from "@nestjs/common";
import { createDocumentController, type ExtractRequest } from "../features/document-extraction";
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
}
