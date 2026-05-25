# Lab 1: Governed AI Design Decisions (Not a Rebuild)

## Objective

This lab intentionally does not ask you to recreate the live demo or write code. Instead, you will use the document intake scenario from Module 1 to make governance decisions, evaluate trade-offs, and produce a design brief you'll carry into Module 2.

Think like someone responsible for getting an AI feature safely into production.

You will:

1. Analyze observed runtime outcomes (`accepted`, `needs_review`, `denied`).
2. Decide where and why interception should happen.
3. Define a minimum audit/trace contract.
4. Propose one policy/profile variation and predict impact.
5. Produce a short governance design brief for Module 2 implementation.

---

## Format: Think-Pair-Share

Each task follows the same structure:

1. **Think** — work alone for the time given. Write notes, not prose.
2. **Pair** — compare with the person next to you. Find agreements and disagreements.
3. **Share** — one point from each pair to the room. We're looking for disagreements, not consensus.

Team size: 2–4 people. Total time: 40 minutes.

---

## Scenario: Document Intake Assistant

You are shaping governance standards for an AI-powered document intake feature in a regulated environment.

The running app demonstrates:

- Frontend status updates showing `accepted`, `needs_review`, or `denied`.
- Backend lifecycle logging with traceable decision events.
- Guardrail-driven routing at multiple points in the pipeline.

Your job: decide whether these controls are sufficient and what must change before wider rollout.

---

## Task 1: Outcome-to-Control Mapping

**Time:** Think 4 min → Pair 3 min → Share 3 min

### Think

The pipeline can short-circuit at several points — a request may never reach the model, or never reach routing:

- **Config / feature flag** — can assign `denied` (e.g. feature disabled)
- **Pre-call gate** — input validity and policy-sensitive content → can assign `denied` or `needs_review`
- **Post-call gate** — schema and policy checks on model output → can assign `denied` or `needs_review`
- **Routing gate** — confidence threshold → can assign `accepted` or `needs_review` (only if earlier gates pass)

For each outcome — `accepted`, `needs_review`, `denied` — answer these questions:

- Which gate(s) can assign this outcome? (More than one may apply — list all that apply, with one example reason each.)
- What evidence should exist in logs or traces?
- What should the user see in the UI?
- What could go wrong with this control?

Write one row per outcome. Notes are fine — no need for complete sentences.

**Example row:**

```text
Outcome: needs_review
Decision source: pre-call (invalid_input), post-call (validation_failed), or routing (low_confidence)
Required evidence: traceId, promptVersion, modelIdentifier, fallback_decision reason
User signal: needs_review status + reason + clear next step
Risk: vague reason text leads to reviewer confusion
```

### Pair

Compare your rows. Where do you disagree on what evidence is required? Where do you disagree on what the user should see?

### Share

One disagreement per pair to the room. There are no wrong answers here — we're building a shared picture.

---

## Task 2: Boundary and Ownership Decisions

**Time:** Think 5 min → Pair 4 min → Share 3 min

### Think

For each item below, assign it to one owner: `workflow`, `prompt`, `config`, or `infrastructure`.

- Allowed document types
- Confidence threshold for routing
- Policy-sensitive input patterns
- Model selection
- Fallback strategy
- Regional routing requirement (EU/US)

For each assignment, write one line: *why here and not somewhere else?*

**Success criterion:** your team can defend why no critical business rule is hidden only inside prompt text.

### Pair

Find one assignment where you disagreed. Can you resolve it — or is the disagreement itself revealing something about the design?

### Share

One contested assignment to the room, with both sides of the argument.

---

## Task 3: Minimum Audit Contract

**Time:** Think 5 min → Pair 4 min → Share 3 min

### Think

An auditor asks: *"Why was this application denied six months ago?"*

Define the smallest set of fields that must exist in every request trace to answer that question without reading source code.

For each field, mark it `mandatory` or `nice-to-have`.

Make sure you have at least one field covering each of these:

- Who or what made the request (identity/provenance)
- What validation ran (validation evidence)
- What decision was made and why (decision/routing evidence)
- What the user experienced (user-impact evidence)

Add one privacy rule: what should *not* be logged by default.

### Pair

Compare your mandatory fields. Are there fields your partner included that you left out? Do you agree on the privacy rule?

### Share

One field the room might not have thought of — and why it matters.

---

## Task 4: Controlled Variation

**Time:** Think 4 min → Pair 3 min → Share 3 min

### Think

Choose one change to the current governance setup:

- Raise the confidence threshold (e.g. 0.80 → 0.90)
- Tighten the policy-sensitive deny patterns
- Relax one review pattern to reduce false positives
- Disable a feature flag for a specific scenario and define user messaging

Without implementing it, predict:

- How does outcome distribution shift (`accepted` / `needs_review` / `denied`)?
- What happens to reviewer workload?
- Does risk go up or down — and for whom?
- What one metric would you watch after rollout?

### Pair

Did you choose different variations? Compare predictions. Which change carries more risk?

### Share

One prediction that surprised your partner.

---

## Final Output: One-Page Design Brief

Consolidate your notes into a single shared page — doc, whiteboard, or markdown.

Your brief should cover:

1. Outcome-to-control mapping table (Task 1)
2. Ownership decisions with rationale (Task 2)
3. Minimum audit contract with mandatory fields (Task 3)
4. Your controlled variation and predicted impact (Task 4)
5. Two open questions you're carrying into Module 2

---

## Bridge to Module 2

Bring your brief forward. In Module 2 you will translate these decisions into a concrete NestJS workflow boundary, validation sequence, and trace contract.

Your open questions from the design brief are the starting point for Module 2 discussion.
