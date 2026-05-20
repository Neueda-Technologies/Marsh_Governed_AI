# Lab 1: Governed AI Design Decisions (Not a Rebuild)

## Objective
This lab intentionally does not ask you to recreate the live demo. Instead, you will use the same scenario to make governance decisions, evaluate trade-offs, and produce evidence standards your team can reuse.

You will:
1. Analyze observed runtime outcomes (`accepted`, `needs_review`, `denied`).
2. Decide where and why interception should happen.
3. Define a minimum audit/trace contract.
4. Propose one policy/profile variation and predict impact.
5. Produce a short governance design brief for Module 2 implementation.

---

## Scenario: Document Intake Assistant

You are shaping standards for an AI-powered document intake feature in a regulated environment.

The current app already demonstrates:
- Frontend status updates and transition telemetry.
- Backend lifecycle logging and traceable decision events.
- Guardrail-driven routing (`accepted`, `needs_review`, `denied`).

Your job in this lab is to decide whether these controls are sufficient and what should change before wider rollout.

---

## Working Mode and Timebox

- Team size: 2-4 people.
- Time: 35-45 minutes total.
- Output format: one shared page (doc, whiteboard, or markdown).
- Constraint: no source-code walkthrough required; focus on behavior and governance logic.

Suggested pacing:
1. Task 1 (10 min)
2. Task 2 (10 min)
3. Task 3 (10 min)
4. Task 4 (8 min)
5. Share-out (5-7 min)

---

## Task 1: Outcome-to-Control Mapping

Use the observed outcomes from the demo and map each one to its control point.

**Your task:**
- Create a table with rows for `accepted`, `needs_review`, and `denied`.
- For each row, state:
  - Which gate produced the decision (pre-call, post-call, confidence routing, etc.).
  - What evidence should exist in logs/traces.
  - What the user should see in the UI.
- Add one "what could go wrong" note per row.

**Deliverable snippet:**
```text
Outcome: needs_review
Decision source: post-call validation or low-confidence routing
Required evidence: traceId, promptVersion, modelIdentifier, fallback_decision reason
User signal: needs_review status + reason + clear next step
Risk: vague reason text leads to reviewer confusion
```

---

## Task 2: Boundary and Ownership Decisions

Decide where each rule should live so it remains testable and auditable.

**Your task:**
- For each item below, assign ownership: `workflow`, `prompt`, `config`, or `infrastructure`.
  - Allowed document types
  - Confidence threshold
  - Policy-sensitive input patterns
  - Model selection
  - Fallback strategy
  - Regional routing requirement (EU/US style)
- Add a one-line rationale for each assignment.

**Success criterion:**
- Your team can defend why no critical business rule is hidden only inside prompt text.

---

## Task 3: Minimum Audit Contract

Define the smallest evidence set needed for post-incident review.

**Your task:**
- Propose required fields for every request trace.
- Mark each field as `mandatory` or `nice-to-have`.
- Include at least one field for each category:
  - Identity/provenance
  - Validation evidence
  - Decision/routing evidence
  - User-impact evidence
- Add one privacy rule (what should not be logged by default).

**Hint:**
- If an auditor asked "why was this denied?" your contract should answer without reading source code.

---

## Task 4: Controlled Variation (Make It Interesting)

Introduce one governance change and predict behavior differences before implementation.

Choose one variation:
- Raise confidence threshold (example: 0.80 -> 0.90)
- Tighten policy-sensitive deny patterns
- Relax one review pattern to reduce false positives
- Disable feature flag for a scenario and define user messaging

**Your task:**
- State the proposed change.
- Predict impact on:
  - Outcome distribution (`accepted`/`needs_review`/`denied`)
  - Reviewer workload
  - Risk posture
- Identify one metric you would monitor after rollout.

---

## Final Team Output (1-page design brief)

Your brief should include:
1. Outcome-to-control mapping table.
2. Ownership decisions with rationale.
3. Minimum audit contract.
4. Controlled variation and predicted impact.
5. Top 2 open questions for Module 2 implementation.

---

## Next Step to Module 2

Bring your design brief forward. In Module 2, you will translate these decisions into a concrete NestJS workflow boundary, validation sequence, and trace/log contract.
