export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const SAMPLE_INPUTS = [
  {
    id: "pass-invoice",
    label: "Pass sample: invoice",
    text: "Invoice #INV-1023 due next Friday for 1250 EUR and paid via bank transfer.",
  },
  {
    id: "pass-contract",
    label: "Pass sample: contract",
    text: "Master services agreement renewal for Q3 with terms, contact details, and signed date.",
  },
  {
    id: "fail-review",
    label: "Fail sample: policy review",
    text: "Internal-only merger planning notes. Do not share externally under any circumstance.",
  },
  {
    id: "fail-deny",
    label: "Fail sample: deny",
    text: "Customer onboarding form with SSN 123-45-6789 and card 4111 1111 1111 1111.",
  },
] as const;

export const DEFAULT_DOCUMENT_TEXT: string = SAMPLE_INPUTS[0].text;
