import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";

@Module({
  controllers: [DocumentsController],
  // Lab 2 Task 1: if you extract Nest providers/factories from documents.controller.ts,
  // register them here instead of module-level singletons in the controller file:
  // providers: [GatewayRuntimeService, DocumentExtractionControllerFactory],
})
export class AppModule {}
