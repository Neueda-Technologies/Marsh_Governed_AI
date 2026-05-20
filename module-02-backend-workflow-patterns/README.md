# Lab 2: Build a Structured Workflow Endpoint

## Objective
In this lab, you'll implement a governed NestJS workflow endpoint from controller to validated response. You'll practice layering, prompt versioning, gateway integration, and safe fallback behavior.

You will:
1. Define clear controller/workflow/prompt/validator boundaries.
2. Implement a gateway-mediated model call with trace metadata.
3. Enforce pre-call and post-call validation gates.
4. Return deterministic output contracts, including fallback.
5. Produce a reusable module pattern for future AI features.

This lab is implementation on top of a starter baseline, not greenfield. You must use your Module 1 design brief to justify your control-point and trace decisions.

---

## Scenario: Document Extraction Service

Your team is implementing a backend service that processes document text and returns structured fields for frontend review.

The service needs to:
- Accept text input and minimal metadata.
- Extract structured fields with a model call.
- Validate output against schema and policy rules.
- Return either accepted output or a safe fallback state.

This lab extends the Module 1 lifecycle and governance boundaries into real backend implementation.

## Working directory

Use: `governed-ai-feature-delivery/demo-app-starter/backend`

Suggested scaffold files:
- `src/features/document-extraction/controller.ts`
- `src/features/document-extraction/workflow.ts`
- `src/features/document-extraction/prompt.ts`
- `src/features/document-extraction/validators.ts`
- `src/features/document-extraction/gateway.ts`
- `src/features/document-extraction/types.ts`

Reference implementation (instructor only): `governed-ai-feature-delivery/demo-app/backend`

### Required input artifact
Bring your Module 1 design brief. At minimum, include:
- Outcome-to-control mapping (`accepted`, `needs_review`, `denied` or deferred rationale)
- Ownership decisions (`workflow` vs `prompt` vs `config` vs infra)
- Minimum trace contract

---

## Task 1: Implement Layered Endpoint Skeleton

Create the basic structure for a governed endpoint.

**Your task:**
- Implement a controller with request DTO validation.
- Create a workflow service for orchestration.
- Create a prompt module with explicit version tag.
- Add validator stubs for pre-call and post-call checks.
- Keep all of the above in a single feature slice (`document-extraction`).

**Hints:**
- Keep controller thin; no model logic in controller.
- Put sequencing and decisions in workflow service.
- Represent prompt version as explicit constant/metadata field.
- Keep return types stable for frontend consumption.
- This is within-feature layering, not cross-project folder-by-layer architecture.

<details>
<summary>Possible Solution for Task 1</summary>

```ts
// Structure sketch
// controller -> workflowService.execute(input)
// workflowService uses: promptTemplate + gateway + validators
// returns: { status, traceId, data?, reason? }
```

</details>

---

## Task 2: Add Gateway Call + Trace Metadata

Integrate a gateway adapter for model invocation.

**Your task:**
- Generate or propagate a `traceId`.
- Send prompt + variables + metadata via gateway adapter.
- Include `promptVersion` and `modelIdentifier` in trace envelope.
- Capture response in workflow service for validation.
- Show where this matches your Module 1 audit contract.

**Hints:**
- Keep provider details behind gateway interface.
- Trace metadata should be mandatory for every request.
- Do not leak raw provider response directly to caller.

<details>
<summary>Possible Solution for Task 2</summary>

```ts
const traceId = context.traceId ?? createTraceId();
const result = await gateway.invoke({
  traceId,
  promptVersion: "extract-v1",
  model: "gpt-4o-mini",
  input: promptInput
});
```

</details>

---

## Task 3: Enforce Validation + Fallback Contract

Add deterministic acceptance and fallback behavior.

**Your task:**
- Run pre-call input checks before gateway invoke.
- Validate post-call output against schema + policy constraints.
- Return `accepted` when checks pass.
- Return `needs_review` fallback when checks fail.
- If you defer `denied` to a later module, explicitly note that in your README notes.

**Hints:**
- Treat model output as untrusted until validated.
- Keep fallback output shape predictable.
- Persist failure reason and trace metadata for review.

<details>
<summary>Possible Solution for Task 3</summary>

```ts
if (!preValidation.ok) {
  return { status: "needs_review", traceId, reason: "invalid_input" };
}

if (!postValidation.ok) {
  return { status: "needs_review", traceId, reason: "validation_failed" };
}

return { status: "accepted", traceId, data: validatedOutput };
```

</details>

---

## Example Output

```text
POST /documents/extract
status: accepted
traceId: trc_01J...
promptVersion: extract-v1
modelIdentifier: gpt-4o-mini
validation: pre=pass, post=pass
```

```text
POST /documents/extract
status: needs_review
traceId: trc_01J...
reason: validation_failed
validation: pre=pass, post=fail
```

---

## Key Concepts Demonstrated

- **Layered backend design**: clear ownership and reduced coupling.
- **Feature-sliced locality**: boundaries are clear and co-located by domain feature.
- **Prompt governance in code**: reviewable and versioned behavior assets.
- **Validation gates**: deterministic controls around model variability.
- **Gateway traceability**: consistent provenance for audit and debugging.
- **Safe fallback**: predictable failure handling for production workflows.

---

## Definition of Done

- Controller is thin and delegates to workflow service.
- Workflow service orchestrates sequence and fallback decisions.
- Prompt version is explicit and propagated to gateway metadata.
- Post-call validation blocks invalid output from caller response.
- Endpoint always returns stable response contract (`accepted` or `needs_review`).
- Implementation lives in the `document-extraction` feature slice.
- Team can point to where each Module 1 design-brief decision appears in code/config/tests.

---

## Next Steps

In Module 3, you will use this deterministic workflow as a baseline and decide when to keep it fixed vs when bounded tools or agentic behavior are justified.
