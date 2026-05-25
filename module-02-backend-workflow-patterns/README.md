# Lab 2: Build a Structured Workflow Endpoint

## Objective

You will implement a governed NestJS workflow endpoint from controller through to validated response. The starter gives you types, a gateway, and mock scenarios. Your job is to wire the layers and make the governance controls real.

By the end you will have:

- A thin controller that delegates to a workflow service.
- A prompt module with an explicit version label.
- Pre-call and post-call validation gates.
- A deterministic fallback contract when validation fails.
- A confidence threshold check that routes low-confidence results to review.

Use your Module 1 design brief to justify your control-point decisions as you go. If your brief differs from what the starter expects, note it — that's a legitimate finding.

---

## Format

Tasks 1–3 are build tasks: work individually, then pair to compare your implementation before moving on. Task 4 is an extension task with a pair discussion before you build.

Total time: 45 minutes.

---

## Working Directory

```
governed-ai-feature-delivery/demo-app-starter/backend
```

Files you will implement:

- `src/features/document-extraction/controller.ts`
- `src/features/document-extraction/prompt.ts`
- `src/features/document-extraction/validators.ts`
- `src/features/document-extraction/workflow.ts`

Files already implemented — read but do not modify:

- `src/features/document-extraction/gateway.ts` — mock gateway with scenario routing
- `src/features/document-extraction/mockScenarios.ts` — fixed test outputs and sentinel logic
- `src/features/document-extraction/types.ts` — all request and response types
- `src/nest/documents.controller.ts` — NestJS wiring, commented out until Task 1

The mock gateway selects a scenario based on sentinels in the document text:

| Text prefix | Scenario | Gateway output |
| ----------- | -------- | -------------- |
| *(none)* | `pass` | `confidence: 0.92`, valid invoice |
| `FAIL:` | `lowConfidence` | `confidence: 0.42`, valid invoice |
| `POLICY:` | `policyBlocked` | `documentType: "not-a-real-type"` |

---

## Task 1: Wire the Controller and Prompt (10 minutes)

**Build (8 min)**

- Implement `createDocumentController` in `controller.ts`. It should create the workflow, call `workflow.execute(input)`, and return the result. Keep it thin — no orchestration logic here.
- Implement `buildDocumentExtractionPrompt` in `prompt.ts`. The prompt should instruct the model to return JSON with the four expected fields: `documentType`, `confidence`, `entities`, `summary`. The `DOCUMENT_EXTRACTION_PROMPT_VERSION` constant is already defined — leave it as-is.
- Uncomment the wiring in `src/nest/documents.controller.ts` as instructed in the file comments.

Start the server and confirm `GET /documents/health` returns `{ ok: true }`. The extract endpoint will throw until Task 2.

**Pair (2 min)**

Compare your prompt text. Did you include the same constraints? Did you constrain `documentType` to the allowed enum values? What happens if you don't?

---

## Task 2: Implement the Workflow and Gateway Call (10 minutes)

**Build (8 min)**

Implement `createDocumentExtractionWorkflow` in `workflow.ts`. For now, skip validation — just wire the gateway call and return a response.

Your workflow should:

- Generate a `traceId` if one wasn't provided in the request (a simple timestamp-based string is fine).
- Build the prompt using `buildDocumentExtractionPrompt`.
- Call `gateway.invoke` with `traceId`, `promptVersion`, `modelIdentifier`, and `prompt`.
- Return the gateway output directly as an `accepted` response for now.

Send a POST request to `/documents/extract`:

```json
{
  "text": "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.",
  "source": "lab"
}
```

Confirm you get an `accepted` response with a `traceId` and `promptVersion` in the body.

**Pair (2 min)**

Check each other's response shapes. Is `promptVersion` present? Is `modelIdentifier` recorded? Does your `traceId` format match what your Module 1 audit contract required?

---

## Task 3: Add Validation Gates and Fallback (12 minutes)

**Build (10 min)**

Implement `validatePreCall` and `validatePostCall` in `validators.ts`, then wire them into your workflow.

`validatePreCall` should reject input that is:

- Missing or not a string.
- Fewer than 20 characters or more than 10,000 characters.

`validatePostCall` should reject output where:

- `documentType` is not one of `invoice`, `contract`, `email`, `other`.
- `confidence` is not a number between 0 and 1.
- `entities` is not an array of strings.

For both functions, return `{ ok: false, reason: "invalid_input" }` or `{ ok: false, reason: "validation_failed" }` on failure, and `{ ok: true, data: validatedOutput }` on success.

Update your workflow to:

- Run `validatePreCall` before calling the gateway. Return `needs_review` with `reason: "invalid_input"` if it fails.
- Run `validatePostCall` on the gateway result. Return `needs_review` with `reason: "validation_failed"` if it fails.

Test all three mock scenarios:

```json
{ "text": "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp." }
```
Expected: `status: "accepted"`

```json
{ "text": "FAIL: Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp." }
```
Expected: `status: "accepted"` — low confidence passes validation, check is not yet wired

```json
{ "text": "POLICY: Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp." }
```
Expected: `status: "needs_review"`, `reason: "validation_failed"`

**Pair (2 min)**

Compare your validator logic. Did you handle the same edge cases? What happens if `entities` contains non-string values? What happens if `confidence` is `null`?

---

## Task 4: Add a Confidence Threshold Check (10 minutes)

The `lowConfidence` scenario returns `confidence: 0.42`. Post-call validation currently passes it — the schema is valid, just uncertain. This is a governance gap: a technically valid but low-confidence result is going to the caller as `accepted`.

**Think (3 min)**

Before writing any code, answer these questions in your notes:

- Where should the threshold check live — in `validatePostCall`, or in the workflow after validation passes?
- What should the response look like — `needs_review`, `denied`, or something new?
- Where does the threshold value itself belong — hardcoded, in the validator, or passed in from config?
- What fields should the response carry so a reviewer knows why it was routed?

**Pair (3 min)**

Compare your answers. The most interesting question: validator or workflow? There's a defensible case for both — find the disagreement and articulate it.

**Build (4 min)**

Implement whichever approach you agreed on. The `confidenceThreshold` value is already available in `WorkflowDeps` — it flows in from `runtimeProfile.ts`.

You will need to extend `WorkflowFallbackResponse` in `types.ts` to add `"low_confidence"` as a valid reason, and optionally add a `metadata` field to carry the threshold and observed confidence.

Test with:

```json
{ "text": "FAIL: Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp." }
```

Expected: `status: "needs_review"`, `reason: "low_confidence"`

---

## Definition of Done

- `GET /documents/health` returns `{ ok: true }`.
- `POST /documents/extract` with valid text returns `status: "accepted"` with `traceId`, `promptVersion`, `modelIdentifier`, and `data`.
- `POST /documents/extract` with `POLICY:` prefix returns `status: "needs_review"`, `reason: "validation_failed"`.
- `POST /documents/extract` with `FAIL:` prefix returns `status: "needs_review"`, `reason: "low_confidence"`.
- `POST /documents/extract` with text under 20 characters returns `status: "needs_review"`, `reason: "invalid_input"`.
- You can point to where each Module 1 ownership decision appears in the code.

---

## Share-Out

One finding per pair to the room:

- Where did your Module 1 design brief match the implementation — and where did it diverge?
- What did the confidence threshold question reveal about where policy logic should live?

---

## Bridge to Module 3

You now have a deterministic, traceable workflow. Every decision is explicit, every path is testable.

Module 3 asks: when is this fixed sequence the right tool — and when does it break down? Bring your workflow. You'll map it against the agent decision framework and decide what, if anything, should be less deterministic.