export const DOCUMENT_EXTRACTION_PROMPT_VERSION = "extract-v1";

export function buildDocumentExtractionPrompt(inputText: string): string {
  return [
    "You are an extraction assistant for regulated document workflows.",
    "Return only valid JSON with exactly these keys: documentType, confidence, entities, summary.",
    "documentType must be one of: invoice, contract, email, other (lowercase only).",
    "confidence must be a number between 0 and 1.",
    "entities must be an array of strings (for example: [\"invoice_number\", \"amount_due\"]).",
    "Do not return entities as an object or map.",
    "summary must be a plain string.",
    "Do not include any extra keys, nesting, markdown, or prose.",
    "Document text:",
    inputText,
  ].join("\n");
}
