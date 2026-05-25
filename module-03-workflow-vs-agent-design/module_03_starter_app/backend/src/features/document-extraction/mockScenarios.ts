/**
 * Fixed mock LLM outputs for Lab 2 fallback testing.
 * The mock gateway picks a scenario from prompt text (see resolveMockScenario).
 *
 * Try in POST /documents/extract after Task 3:
 * - Default body text → pass (accepted when validators + threshold allow)
 * - Prefix text with "FAIL:" → lowConfidence (post-validation pass, threshold fallback)
 * - Prefix text with "POLICY:" → policyBlocked (invalid documentType → validation_failed)
 */
export const mockScenarios = {
  pass: {
    documentType: "invoice",
    confidence: 0.92,
    entities: ["invoice_number", "amount_due"],
    summary: "Invoice detected with billing entities.",
  },
  lowConfidence: {
    documentType: "invoice",
    confidence: 0.42,
    entities: ["invoice_number"],
    summary: "Invoice with uncertain extraction quality.",
  },
  policyBlocked: {
    documentType: "not-a-real-type",
    confidence: 0.8,
    entities: ["entity_a"],
    summary: "Model returned a disallowed document type.",
  },
} as const;

export type MockScenarioKey = keyof typeof mockScenarios;

/** Reads sentinels embedded in the prompt (document text is appended at the end). */
export function resolveMockScenario(prompt: string): MockScenarioKey {
  if (prompt.includes("POLICY:")) {
    return "policyBlocked";
  }
  if (prompt.includes("FAIL:")) {
    return "lowConfidence";
  }
  return "pass";
}
