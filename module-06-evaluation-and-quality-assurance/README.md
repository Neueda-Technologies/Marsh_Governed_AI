# Lab 6: Create a Lightweight Evaluation Suite

## Objective
In this lab, you'll build a repeatable evaluation suite for your AI workflow. You’ll define golden datasets, pass/fail criteria, and run prompt/model comparisons with trace-backed analysis.

You will:
1. Build a small golden dataset for key workflow behaviors.
2. Define machine-checkable pass/fail criteria.
3. Run at least two prompt/model variants on the same dataset.
4. Analyze failures using traces.
5. Produce a release recommendation with evidence.

This lab builds on a starter baseline, not a full rebuild. Bring forward:
- Module 2 workflow contract and response statuses
- Module 3 execution-pattern decisions
- Module 4 guardrail/refusal rules
- Module 5 UI-state expectations for `accepted` / `needs_review` / `denied`

---

## Scenario: Eval Gate for Document Extraction Feature

Your team has multiple prompt/model options and needs a consistent way to decide what is release-ready.

The suite must evaluate:
- Structured extraction correctness.
- Schema/format compliance.
- Safety/refusal behavior.
- Basic operational limits (latency/cost).

## Working directory

Use: `governed-ai-feature-delivery/demo-app-starter/module_6_starter/backend`

Reference implementation (instructor only): `governed-ai-feature-delivery/demo-app/backend`

---

## Task 1: Define Golden Dataset

Create an initial dataset that reflects realistic behavior and risk.

**Your task:**
- Add 8-12 test cases.
- Include happy path, edge cases, and failure conditions.
- Define expected output per case.
- Assign case tags (correctness, safety, fallback, etc.).
- Include at least one case for each terminal workflow status used in the app.

**Hints:**
- Include at least one injection-like hostile input.
- Include at least one low-confidence/needs_review case.
- Keep dataset small but representative for first iteration.

<details>
<summary>Possible Solution for Task 1</summary>

```text
cases/
- case-01-basic-invoice.json
- case-02-contract-summary.json
- case-03-missing-fields.json
- case-04-hostile-instruction-in-doc.json
- case-05-low-confidence-ambiguous.json
...
```

</details>

---

## Task 2: Add Pass/Fail Rules

Turn expectations into measurable checks.

**Your task:**
- Define checks for schema compliance.
- Define checks for field-level correctness.
- Define checks for safety/refusal behavior.
- Define one latency or cost threshold.

**Hints:**
- Separate hard failures from soft warnings.
- Use explicit tolerances where exact equality is unrealistic.
- Ensure rules are machine-checkable where possible.

<details>
<summary>Possible Solution for Task 2</summary>

```text
Rules:
- schema_valid == true (hard fail)
- required_entities_present == true (hard fail)
- policy_block_on_hostile_input == true (hard fail)
- fallback_status_on_low_confidence == needs_review (hard fail)
- p95_latency_ms < 2500 (soft/hard depending on release policy)
```

</details>

---

## Task 3: Run Comparison + Trace Analysis

Compare variants and decide what should ship.

**Your task:**
- Run baseline and candidate variants on same dataset.
- Record summary metrics for each variant.
- Inspect failed traces for top regressions.
- Write release recommendation with rationale.
- Mark which criteria are "hard gate" vs "monitor only" for next module release policy.

**Hints:**
- Keep dataset and scoring logic constant between runs.
- Use trace evidence to explain behavior changes.
- Include both quality and operational metrics.

<details>
<summary>Possible Solution for Task 3</summary>

```text
Baseline:
- pass_rate: 84%
- safety_failures: 2
- p95_latency_ms: 1800

Candidate:
- pass_rate: 89%
- safety_failures: 1
- p95_latency_ms: 2400

Recommendation:
- Ship candidate behind guardrail if latency budget allows.
- Add new permanent test for prior safety failure.
```

</details>

---

## Example Output

```text
Dataset size: 10 cases
Metrics tracked: correctness, schema, safety, latency
Comparison run: baseline vs candidate complete
Trace reviews completed: 4 failing cases
Release recommendation: documented
```

---

## Key Concepts Demonstrated

- **Golden datasets**: repeatable quality baselines.
- **Machine-checkable criteria**: objective release signals.
- **Variant comparison discipline**: fair A/B quality decisions.
- **Trace-backed analysis**: explainable regression diagnosis.

---

## Definition of Done

- Golden dataset is created with expected outcomes.
- Pass/fail rules cover correctness, format, and safety.
- At least two variants are compared on same data.
- Failed cases are analyzed with trace evidence.
- Team outputs a clear release recommendation.
- Team identifies at least one metric to promote to Module 7 deployment gate.

---

## Facilitator Debrief Prompts

1. Which eval rule was most valuable for release confidence?
2. Which failures were hardest to diagnose without traces?
3. What should be promoted to mandatory CI gate first?
4. Where do you still rely on subjective quality judgments?

---

## Next Steps

In Module 7, you’ll convert these evaluation results into deployment gates, release controls, and observability requirements for governed production delivery.
