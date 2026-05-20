import { createDocumentController, createMockLlmGateway } from "../features/document-extraction";

async function main() {
  const sampleInput = {
    text: "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.",
    source: "ops-demo",
    traceId: "ops-demo-trace",
  };

  const enabledController = createDocumentController({
    gateway: createMockLlmGateway(),
    modelIdentifier: "gpt-4o-mini",
    confidenceThreshold: 0.8,
    featureEnabled: true,
  });

  const disabledController = createDocumentController({
    gateway: createMockLlmGateway(),
    modelIdentifier: "gpt-4o-mini",
    confidenceThreshold: 0.8,
    featureEnabled: false,
  });

  const before = await enabledController.extractDocument(sampleInput);
  const after = await disabledController.extractDocument(sampleInput);

  console.log("=== Operational safety demo ===");
  console.log("1) Feature ON response:");
  console.log(JSON.stringify(before, null, 2));
  console.log("\n2) Kill switch ON response:");
  console.log(JSON.stringify(after, null, 2));
  console.log(
    "\nTo run in server mode: set FEATURE_DOCUMENT_EXTRACTION_ENABLED=false and restart backend."
  );
}

void main();
