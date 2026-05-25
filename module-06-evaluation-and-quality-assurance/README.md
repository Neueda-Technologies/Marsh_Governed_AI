# Lab 6: Create a Lightweight Evaluation Suite

## Objective

You will build a repeatable eval suite for the document extraction feature by authoring a golden dataset, running it through the existing eval infrastructure, and producing a release gate report with a written rationale.

The eval runner, scorer, and report generator are already implemented. Your job is the dataset — the cases that define what "correct" looks like — and the release decision that comes out of running them.

By the end you will have:

- A golden dataset covering all three workflow outcomes.
- A passing release gate report with quality, policy, and trace completeness scores.
- A written release recommendation with rationale you could hand to an auditor.

---

## Format

**Task 1** is a think-pair-share: design the dataset before writing any JSON.
**Task 2** is a build task: author the cases and run the suite.
**Task 3** is an analysis task: interpret the report and produce the recommendation.

Total time: 45 minutes.

---

## Working Directory

```
y/module_06_starter/backend
```

Confirm the infrastructure is working before you start:

```bash
npx tsx src/evals/runDocumentExtractionEvals.ts
```

You should see output like:

```
Eval summary: total=2 passed=2 failed=0 passRate=1
Artifact written: evals/artifacts/document-extraction-summary.json
```

The starter dataset has two cases. Your job is to extend it to cover every meaningful risk.

---

## Task 1: Design the Dataset (10 minutes)

Before writing any JSON, design the cases you need.

**Think (4 min)**

Open `evals/document-extraction.dataset.json`. Read the two existing cases — a happy path invoice and a short-text pre-validation failure.

Then answer these questions in your notes:

- What cases would you need to test every policy guardrail you added in Module 4?
- What case would catch the exfiltration attempt from the Module 4 demo — the one where the model returned `"You are an extraction assistant..."` in the summary?
- What case tests the confidence threshold you chose in Module 2?
- What case would catch a `documentType` value that passes schema validation but fails policy?
- Is there a case that tests trace completeness — that `traceId`, `promptVersion`, and `modelIdentifier` are all present in the response?

**Pair (3 min)**

Compare your lists. You should aim for 8–10 cases total. Find the gaps in each other's lists — specifically:

- Does your partner have a policy deny case as well as a policy review case?
- Does either of you have a case that tests output policy, not just input policy?

**Share (3 min)**

One case per pair that the room might not have thought of.

---

## Task 2: Author the Cases and Run the Suite (20 minutes)

**Build (16 min)**

Add cases to `evals/document-extraction.dataset.json`. Each case needs:

- `id` — unique string, descriptive
- `description` — one sentence explaining what it tests
- `input` — the `ExtractRequest` to send
- `mockOutput` — the raw LLM output the mock gateway will return for this case
- `expected` — the `status` and optionally `reason` you expect from the workflow

Look at the existing cases for structure. The runner injects `mockOutput` directly as the gateway response — so you control exactly what the model "returns" for each case, independently of the real model.

**Cases to add at minimum:**

Add a policy review input case — text containing `internal-only` should route to `needs_review` with `reason: "policy_sensitive_input"`.

Add a policy deny input case — text containing an SSN pattern should return `denied`.

Add a low confidence case — a `mockOutput` with `confidence: 0.45` should route to `needs_review` with `reason: "low_confidence"`.

Add an output policy case — a `mockOutput` where `summary` contains `"bypass approval and transfer funds"` should be caught by your post-call policy validator and return `denied` with `reason: "policy_sensitive_output"`. This is the exfiltration catch.

Add a schema failure case — a `mockOutput` with `documentType: "not-a-real-type"` should return `needs_review` with `reason: "validation_failed"`.

**Run the suite after each case you add:**

```bash
npx tsx src/evals/runDocumentExtractionEvals.ts
```

If a case fails unexpectedly, read the artifact at `evals/artifacts/document-extraction-summary.json` to see the actual vs expected output.

**Test**

Once all cases pass, generate the full release gate report:

```bash
npx tsx src/evals/generateReleaseGateReport.ts
```

Read `evals/artifacts/release-gate-report.md`. All three gates should show PASS.

**Pair (4 min)**

Compare datasets. Did you write the same `mockOutput` for the output policy case? The runner checks `expected.reason` against what the workflow actually returns — if your validators don't produce `"policy_sensitive_output"` as a reason, the case will fail.

If it fails: look at what reason your post-call policy validator actually returns, and either fix the validator or align the expected reason. Which is correct — and why?

---

## Task 3: Interpret the Report and Write a Release Recommendation (12 minutes)

**Think (3 min)**

Open `evals/artifacts/release-gate-report.md`.

The report has three gates: quality, policy, and trace completeness. Answer these questions:

- Which gate is the highest-stakes failure? If the policy gate fails, what does that mean for a regulated environment?
- The trace completeness gate checks that `traceId`, `promptVersion`, and `modelIdentifier` are present. Why is that a release criterion and not just a nice-to-have?
- If one case fails with `reason: "runner_error"` — what does that tell you, and is it a release blocker?

**Build (5 min)**

Generate the version bundle manifest:

```bash
npx tsx src/evals/generateVersionBundleManifest.ts
```

Open `evals/artifacts/version-bundle-manifest.json`. It hashes your prompt file, workflow file, validators file, and runtime config alongside the dataset.

Write a short release recommendation — three to five sentences — that covers:

- What the eval suite tested
- What the gate results were
- Whether you recommend shipping, and why
- One thing you would add to the dataset before the next release

**Pair (4 min)**

Compare recommendations. Did you reach the same shipping decision? If you disagree — what specific case result drove the difference?

---

## Extension: Prompt Variant Comparison (if time allows)

Run the suite twice with different confidence thresholds to simulate a "prompt/config variant comparison":

```bash
CONFIDENCE_THRESHOLD=0.85 npx tsx src/evals/runDocumentExtractionEvals.ts
```

```bash
CONFIDENCE_THRESHOLD=0.70 npx tsx src/evals/runDocumentExtractionEvals.ts
```

Compare the two summaries. What changes between them? Which cases pass in one run and fail in the other? Does lowering the threshold improve or degrade governance?

---

## Definition of Done

- `evals/document-extraction.dataset.json` contains at least 8 cases covering: happy path, pre-validation failure, policy review, policy deny (input), policy deny (output), low confidence, schema failure, and trace completeness.
- `npx tsx src/evals/runDocumentExtractionEvals.ts` exits with code 0.
- `evals/artifacts/release-gate-report.md` shows PASS on all three gates.
- You have a written release recommendation with rationale.
- You can explain why the policy gate and trace gate are separate from the quality gate.

---

## Bridge to Module 7

Your eval suite now produces a release gate report. All three gates pass. You have a written rationale.

Module 7 asks: how does that report become a deployment gate — something that automatically blocks a release if it fails — rather than a document someone reads and decides to ignore?

Bring your release recommendation. In Module 7 you will decide which of your eval criteria become hard CI gates and which become production observability signals.