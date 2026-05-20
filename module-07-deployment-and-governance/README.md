# Lab 7: Define AI Release Readiness Criteria

## Objective
In this lab, you'll build a practical release-readiness contract for an AI feature. You’ll define versioning rules, gate criteria, observability requirements, and rollback/fallback controls.

You will:
1. Define versioned release bundle requirements.
2. Specify hard and soft CI/CD gate criteria.
3. Define traceability and logging evidence required for approval.
4. Define rollback and fallback trigger conditions.
5. Produce a go/no-go recommendation template.

This lab builds on a starter baseline and prior module artifacts. Bring forward:
- Module 6 eval dataset, scoring output, and comparison notes
- Existing trace/guardrail contracts from Modules 2-4
- UX status/fallback expectations from Module 5

---

## Scenario: Releasing a New Extraction Variant

Your team is preparing to ship an updated AI feature version:
- Prompt template updated.
- Model version changed.
- Evaluation dataset expanded.

You must decide if this change is release-ready for production.

## Working directory

Use: `governed-ai-feature-delivery/demo-app-starter/module_7_starter/backend`

Reference implementation (instructor only): `governed-ai-feature-delivery/demo-app/backend`

---

## Task 1: Define Release Bundle Contract

Specify what must be versioned and attached to every release.

**Your task:**
- List required version identifiers (prompt/model/eval/policy).
- Define required metadata fields (owner, date, environment, region scope).
- Define artifact naming or tagging convention.
- Define minimum documentation attached to release candidate.
- Ensure bundle links directly to the exact eval run used for decision.

**Hints:**
- If it changes behavior, it should be versioned.
- Keep metadata machine-readable where possible.
- Include region scope where deployment differs (e.g., EU/US).

<details>
<summary>Possible Solution for Task 1</summary>

```text
Required bundle metadata:
- prompt_version
- model_identifier
- eval_dataset_version
- policy_config_version
- release_owner
- target_regions
- release_timestamp
```

</details>

---

## Task 2: Define CI/CD Gate Policy

Turn quality expectations into enforceable release gates.

**Your task:**
- Define 3 hard-fail gates.
- Define 2 soft gates with escalation behavior.
- Map each gate to an owner.
- Define what evidence must be attached when gate fails.
- Include one trace-completeness gate tied to prior observability requirements.

**Hints:**
- Hard gates should cover safety-critical outcomes.
- Soft gates can cover optimization targets (latency/cost trade-offs).
- Ownership should be explicit before deployment.

<details>
<summary>Possible Solution for Task 2</summary>

```text
Hard gates:
1) Safety test failures == 0
2) Schema compliance >= 99%
3) Critical task accuracy >= threshold

Soft gates:
1) P95 latency within budget
2) Cost per request within budget

Failure evidence:
- trace sample
- failing cases
- owner escalation note
```

</details>

---

## Task 3: Define Runtime Controls and Go/No-Go Rule

Specify how to contain risk after deployment.

**Your task:**
- Define rollback trigger conditions.
- Define request-level fallback trigger conditions.
- Define kill-switch trigger conditions.
- Define required runtime alerts.
- Produce final go/no-go recommendation format.

**Hints:**
- Rollback handles release-level issues.
- Fallback handles per-request uncertainty/failure.
- Alerts should include quality drift, error spikes, and policy breaches.

<details>
<summary>Possible Solution for Task 3</summary>

```text
Rollback triggers:
- sustained safety regression
- major accuracy drop against baseline

Fallback triggers:
- validation_failed
- low_confidence
- tool_timeout

Go/No-go template:
- decision
- evidence summary
- known risks
- owner sign-off
```

</details>

---

## Example Output

```text
Release bundle: complete
Hard gates: 3/3 pass
Soft gates: 1 pass, 1 warning
Trace evidence: attached
Rollback/fallback playbook: defined
Decision: GO with latency monitoring
```

---

## Key Concepts Demonstrated

- **Release discipline**: explicit, versioned, evidence-backed deployment contract.
- **Gate governance**: objective criteria linked to ownership.
- **Operational resilience**: rollback and fallback as complementary controls.
- **Auditability**: traceable rationale for release decisions.

---

## Definition of Done

- Release bundle requirements are explicit and complete.
- Hard/soft gate criteria are defined with thresholds and owners.
- Runtime controls include rollback, fallback, and kill-switch triggers.
- Go/no-go template includes evidence and accountability fields.
- Team identifies which gates should become mandatory automation in next CI iteration.

---

## Facilitator Debrief Prompts

1. Which gate is hardest to operationalize in your current pipeline?
2. Which release evidence item is currently missing in your team?
3. Where are ownership boundaries unclear during incidents?
4. What single control would reduce risk fastest next sprint?

---

## Next Steps

In Module 8, you will combine architecture, guardrails, UX, evals, and deployment controls into a complete final build and review.
