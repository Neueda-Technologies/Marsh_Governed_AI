import type {
  ExtractRequest,
  PostValidationResult,
  PreValidationResult,
} from "./types";

/** Lab 2 Task 3: validate input before gateway.invoke. */
export function validatePreCall(_input: ExtractRequest): PreValidationResult {
  throw new Error("Lab 2 Task 3: implement validatePreCall in validators.ts");
}

/** Lab 2 Task 3: treat model output as untrusted until this passes. */
export function validatePostCall(_candidate: unknown): PostValidationResult {
  throw new Error("Lab 2 Task 3: implement validatePostCall in validators.ts");
}
