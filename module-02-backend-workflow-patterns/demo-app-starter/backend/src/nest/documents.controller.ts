import { Controller, Get } from "@nestjs/common";
// Lab 2 Task 1: uncomment when wiring the extract endpoint:
// import { Body, Post } from "@nestjs/common";
// import { createDocumentController, type ExtractRequest } from "../features/document-extraction";
// import { createGatewayForRuntime } from "./gatewayRuntime";
// import { getRuntimeProfileConfig } from "../config/runtimeProfile";

/**
 * Lab 2 Task 1: wire POST /documents/extract below.
 * Keep this class thin — delegate to createDocumentController from the feature slice.
 */
@Controller("documents")
export class DocumentsController {
  @Get("health")
  health() {
    return { ok: true, starter: "module-2" };
  }

  // Lab 2 Task 1: uncomment and wire createDocumentController + createGatewayForRuntime:
  //
  // private readonly runtimeConfig = getRuntimeProfileConfig();
  // private readonly documentController = createDocumentController({
  //   gateway: createGatewayForRuntime(),
  //   modelIdentifier: this.runtimeConfig.modelIdentifier,
  //   confidenceThreshold: this.runtimeConfig.confidenceThreshold,
  //   featureEnabled: this.runtimeConfig.featureDocumentExtractionEnabled,
  // });
  //
  // @Post("extract")
  // async extract(@Body() body: ExtractRequest) {
  //   return this.documentController.extractDocument(body);
  // }
}
