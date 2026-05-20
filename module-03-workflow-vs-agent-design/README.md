# Lab 3: Choose the Right Execution Pattern

## Objective
In this lab, you'll decide when to use deterministic workflows, bounded tool patterns, or agentic behavior. You’ll apply an explicit decision framework to realistic scenarios and justify trade-offs with governance and delivery outcomes.

You will:
1. Apply a decision framework across multiple use cases.
2. Choose an execution pattern with explicit rationale.
3. Define tool-boundary controls for selected patterns.
4. Specify observability and fallback requirements.
5. Produce a reusable execution-model checklist for your team.

Important scope note:
- The current starter/reference app supports deterministic and bounded-tool flows.
- In this module, agentic is primarily a governed design decision (and rollout criterion), not mandatory runtime implementation.

---

## Scenario Set

You are standardizing AI feature delivery across teams that currently mix workflows, tools, and agents inconsistently.

Evaluate these scenarios:
- **Scenario A:** document extraction into structured schema (known fields).
- **Scenario B:** email triage + enrichment + routing with 1-2 internal tools.
- **Scenario C:** open-ended investigation assistant with dynamic next-step planning.

Use your Module 2 implementation as the baseline reference when discussing "what changes" per scenario.

## Working directory

Use: `governed-ai-feature-delivery/demo-app-starter/module_3_starter`

Reference implementation (instructor only): `governed-ai-feature-delivery/demo-app`

---

## Task 1: Classify Each Scenario

Use the framework to classify each scenario as:
- deterministic workflow
- bounded tool pattern
- agentic pattern

**Your task:**
- Decide the best-fit pattern for A, B, and C.
- Give 2-3 reasons per decision.
- State one major trade-off per scenario.
- Mark each scenario as one of:
  - `implement now`
  - `defer until evidence`
  - `not appropriate`

**Hints:**
- Ask: is deterministic output required?
- Ask: is full auditability mandatory?
- Ask: can quality be evaluated repeatably?
- Start with least-powerful pattern that works.

<details>
<summary>Possible Solution for Task 1</summary>

```text
A) Document extraction -> Deterministic workflow
Reasons: known schema, high auditability need, repeatable eval path
Trade-off: lower flexibility for unusual documents

B) Email triage + enrichment -> Bounded tool pattern
Reasons: limited external actions needed, still requires control and traceability
Trade-off: more orchestration complexity than pure workflow

C) Investigation assistant -> Agentic pattern
Reasons: open-ended planning, dynamic step selection, uncertain path length
Trade-off: higher governance/evaluation and debugging overhead
```

</details>

---

## Task 2: Define Tool Boundaries

For each scenario, define tool policy boundaries and explicit tool-choice rationale.

**Your task:**
- Select which tools are allowed per scenario and justify each selection.
- Name one tool you intentionally exclude per scenario and explain why.
- Specify tool allowlist (which tools are permitted).
- Define parameter constraints (size, range, allowed values).
- Define timeout/retry policy.
- Define which actions require human approval.

**Hints:**
- Evaluate tools on reliability, side-effect risk, latency/cost, and observability fit.
- Avoid open-ended "any tool" access.
- High-risk side effects should require confirmation.
- Log tool intent + result for each call.

<details>
<summary>Possible Solution for Task 2</summary>

```text
B) Email triage bounded tools
Allowlist: classifyEmail, fetchCustomerTier
Constraints:
- classifyEmail.category in approved enum only
- fetchCustomerTier.customerId must match UUID pattern
Timeout/retry:
- timeout 2s each, retry once
Approval:
- no autonomous outbound communication actions
```

</details>

---

## Task 3: Add Observability + Fallback Contract

Specify what must be traceable and how failures degrade safely.

**Your task:**
- Define minimum trace fields for each pattern.
- Define what triggers fallback.
- Define deterministic fallback response shape.
- Define one evaluation checkpoint for release readiness.
- For any agentic choice, define explicit "enablement gates" (what evidence is required before implementation/production use).

**Hints:**
- Include model/prompt/tool provenance in traces.
- Fallback should protect users from uncertain outcomes.
- Keep fallback contract stable for frontend.

<details>
<summary>Possible Solution for Task 3</summary>

```text
Minimum trace fields:
- trace_id
- execution_pattern (workflow / bounded_tools / agentic)
- prompt_version
- model_identifier
- tool_calls[] with input summary + result status
- decision_outcome (accepted / needs_review / refused)

Fallback trigger examples:
- low confidence
- policy breach
- invalid tool result

Fallback response:
{ status: "needs_review", reason: "validation_failed_or_uncertain" }

Release checkpoint:
- pass scenario-specific eval threshold before enabling broader autonomy
```

</details>

---

## Example Output

```text
Scenario classifications:
- A: workflow
- B: bounded_tools
- C: agentic

Tool boundary policy:
- allowlists defined
- parameter constraints defined
- approval gates defined for high-risk actions

Observability contract:
- trace schema defined
- fallback contract defined

Enablement decision:
- agentic implementation deferred pending eval and guardrail evidence
```

---

## Key Concepts Demonstrated

- **Execution-model selection**: choosing the least-powerful viable pattern.
- **Tool boundary governance**: constraining capability safely.
- **Observability by design**: traceability for dynamic decision paths.
- **Fallback discipline**: safe degradation under uncertainty.

---

## Definition of Done

- All three scenarios are classified with clear criteria-based rationale.
- Tool boundaries are explicit for at least one bounded/agentic scenario.
- Observability requirements are listed before implementation details.
- Fallback behavior is defined and deterministic.
- For agentic scenarios, team provides explicit enablement/defer criteria.

---

## Facilitator Debrief Prompts

1. Which scenario was most contentious and why?
2. Which decision criterion changed your first instinct?
3. Where would your current production system fail this framework?
4. What will you standardize before building the next AI feature?

---

## Next Steps

In Module 4, you will apply security and guardrails to these execution patterns, focusing on prompt injection defense, trust boundaries, and safe failure handling.
