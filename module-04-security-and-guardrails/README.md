# Lab 4: Add Guardrails to a Workflow

## Objective
In this lab, you'll harden an existing AI workflow using layered security controls. You'll implement trust-boundary checks, tool constraints, output validation, and deterministic fallback behavior.

You will:
1. Identify trust boundaries and threat entry points.
2. Add pre-call input guardrails.
3. Add post-call schema and policy validation.
4. Define refusal/fallback behavior for unsafe outcomes.
5. Produce a reusable guardrail checklist for future features.

This lab builds on a starter baseline, not a finished implementation rebuild. Use your prior module decisions as inputs:
- Module 2: workflow boundary + trace contract
- Module 3: execution pattern and tool-boundary decisions

---

## Scenario: Secure Document Processing Path

You are improving a document-processing workflow already in development.

The system currently:
- Accepts user-submitted text/documents.
- Extracts structured fields via model call.
- Returns output for frontend review.

Your task is to add guardrails so unsafe or uncertain outputs do not reach end users unchecked.

## Working directory

Use: `governed-ai-feature-delivery/demo-app-starter/module_4_starter`

Reference implementation (instructor only): `governed-ai-feature-delivery/demo-app`

---

## Task 1: Map Trust Boundaries and Risks

Identify where untrusted content enters and where controls should be enforced.

**Your task:**
- Mark each input/output as untrusted, semi-trusted, or trusted.
- Identify at least 4 concrete risks (including prompt injection).
- Map each risk to a specific guardrail layer.
- Define one trace field that proves each guardrail was applied.
- Tie each proposed guardrail to ownership (`workflow`, `validator`, `gateway`, `config`, or frontend UX signal).

**Hints:**
- User and document content are untrusted by default.
- Tool responses are semi-trusted until validated.
- Model output is untrusted until post-call checks pass.

<details>
<summary>Possible Solution for Task 1</summary>

```text
Risk mapping example:
1) Prompt injection in uploaded doc -> input screening + instruction hierarchy
2) Oversized payload -> pre-call size limit
3) Policy-invalid category in output -> post-call policy validator
4) Missing audit path -> trace metadata contract
```

</details>

---

## Task 2: Add Input and Tool Guardrails

Implement guardrails before and during model/tool interaction.

**Your task:**
- Add pre-call input checks (schema + size/type constraints).
- Add trust labeling metadata to request context.
- Define a tool allowlist and parameter constraints.
- Add timeout/retry limits for tool invocation.
- Ensure tool guardrails are implemented within the feature slice (no cross-cutting ad hoc files).

**Hints:**
- Keep pre-call checks deterministic and fast.
- Do not permit open-ended tool access.
- Capture tool call intent/result in trace records.

<details>
<summary>Possible Solution for Task 2</summary>

```text
Pre-call checks:
- required fields present
- input text length 20..10000

Tool boundaries:
- allowlist: classifyEmail, enrichCustomerProfile
- parameter constraints: enum/category checks, max payload sizes
- timeout: 2s, retry: 1
```

</details>

---

## Task 3: Enforce Output Validation + Fallback

Protect frontend and downstream systems from unsafe output.

**Your task:**
- Validate output against schema contract.
- Add policy checks (allowed categories/content rules).
- Return `accepted` only when all checks pass.
- Return `needs_review` or refusal when checks fail.
- Define explicit routing criteria for `needs_review` versus `denied`.

**Hints:**
- Schema pass does not guarantee policy pass.
- Keep fallback response shape stable.
- Include reason codes and trace id in fallback responses.

<details>
<summary>Possible Solution for Task 3</summary>

```ts
if (!schemaValid || !policyValid) {
  return {
    status: "needs_review",
    traceId,
    reason: "validation_failed_or_policy_blocked",
  };
}

return { status: "accepted", traceId, data: safeOutput };
```

</details>

---

## Example Output

```text
POST /documents/extract
status: accepted
traceId: trc_01J...
validation: pre=pass, schema=pass, policy=pass
```

```text
POST /documents/extract
status: needs_review
traceId: trc_01J...
reason: policy_blocked
validation: pre=pass, schema=pass, policy=fail
```

---

## Key Concepts Demonstrated

- **Trust boundaries**: explicit handling of untrusted data flows.
- **Layered guardrails**: input, tool, output, and fallback controls.
- **Dual validation**: schema correctness plus policy compliance.
- **Safe degradation**: deterministic responses when uncertain or unsafe.

---

## Definition of Done

- Trust boundaries are documented for the scenario.
- Input checks and tool constraints are implemented.
- Output path enforces schema + policy validation.
- Fallback/refusal path is deterministic and traceable.
- Security-relevant decision metadata is logged.
- Team can point to where Module 2/3 design decisions are enforced in this module.

---

## Facilitator Debrief Prompts

1. Which boundary was hardest to secure and why?
2. Where did schema validation pass but policy still fail?
3. Which fallback rule improved safety most?
4. What guardrail can become a shared platform default?

---

## Next Steps

In Module 5, you’ll design frontend UX patterns that communicate uncertainty, confidence, and review states produced by these backend guardrails.
