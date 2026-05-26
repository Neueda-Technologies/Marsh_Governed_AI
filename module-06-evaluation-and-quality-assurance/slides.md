---
title: "**Evaluation and Quality Assurance**"
sub_title: Module 6 — Governed AI Feature Delivery
author: Kevin Cunningham
---

## A question about your confidence threshold

In Module 2 you set a confidence threshold. In Module 4 you added policy checks. In Module 5 you chose band labels for the UI.

<!-- pause -->

**Think:** where did those numbers come from?

`0.85` for the threshold. `0.90` for "high confidence". `0.75` for the medium/low boundary.

<!-- pause -->

<!-- speaker_note: 60 seconds — what was the basis for those decisions? -->

<!-- pause -->

If the answer is "educated guess" or "felt reasonable" — that's the problem Module 6 solves.

<!-- end_slide -->

## Evals are a delivery discipline

Not research infrastructure. Not a QA team's job. Not something you add after the first incident.

<!-- pause -->

Without evals:

- Prompt changes are opinions, not decisions.
- Model upgrades are guesses, not comparisons.
- Release confidence is hope, not evidence.
- Quality bugs surface in production, not before it.

<!-- pause -->

> If it matters for release, it needs a measurable criterion.

<!-- end_slide -->

## What you already have

Look at the validators you wrote in Module 4:

- `documentType` must be one of four allowed values — exact match
- `confidence` must be a number between 0 and 1 — range check
- `entities` must be an array of strings — schema check
- SSN patterns must be denied — policy check
- Confidence below threshold must route to `needs_review` — behaviour check

<!-- pause -->

Those are eval criteria. You already wrote them. You just haven't run them systematically against a fixed dataset yet.

<!-- pause -->

**Think:** what inputs would you need to test all five of those rules reliably?

<!-- speaker_note: Pair: 90 seconds. -->

<!-- end_slide -->

## Golden datasets

A golden dataset is a curated set of inputs with documented expected outputs — the cases your feature must handle correctly before it ships.

<!-- pause -->

- Include happy-path cases and failure edge cases.
- Version the dataset alongside prompt and model changes.
- Start small and representative — ten meaningful cases beat a hundred vague ones.

<!-- pause -->

**Think:** for the document extraction feature — what are the ten cases you would include?

<!-- speaker_note: 60 seconds — write them down. -->

<!-- end_slide -->

## Designing pass/fail criteria

| Field | Expected | Rule |
| ----- | -------- | ---- |
| `documentType` | `invoice` | Exact match required |
| `confidence` | 0–1 | Must be within valid range |
| `entities` | Includes `invoice_number`, `amount_due` | Required keys present |
| Fallback behaviour | `needs_review` on low confidence | Policy-compliant routing required |

<!-- pause -->

Each rule maps to a release risk. If any of these fail, the feature should not ship.

<!-- pause -->

Separate hard failures from soft thresholds:

- Hard failure: wrong `documentType`, missing required entity → do not ship
- Soft threshold: confidence variance within ±0.05 → acceptable with rationale

<!-- pause -->

> A release decision based on one dimension alone is incomplete.

<!-- end_slide -->

## The five evaluation dimensions

1. **Correctness** — is output factually and functionally right?
<!-- pause -->
2. **Format** — does output match the schema and contract?
<!-- pause -->
3. **Safety** — does behaviour follow policy and refusal rules?
<!-- pause -->
4. **Grounding** — is the response supported by input or evidence?
<!-- pause -->
5. **Operational** — latency, cost, and error-rate targets.

<!-- pause -->

**Think:** which of these does your Module 4 validator cover? Which does it miss entirely?

<!-- speaker_note: Pair: 90 seconds. -->

<!-- end_slide -->

## Prompt and model comparison

The most common use of an eval suite: you have a prompt change or a new model version. You need to know if quality improves, degrades, or stays the same.

<!-- pause -->

Run the same golden dataset against both variants. Compare:

- Accuracy per case — did the right answer stay right?
- Safety per case — did any refusal behaviour change?
- Latency and cost — did quality improvements come at operational cost?

<!-- pause -->

Promote the variant only if quality improves or stays within acceptable bounds.

<!-- pause -->

Record the rationale for the chosen variant as part of the release record.

<!-- pause -->

> This is how the confidence threshold stops being an educated guess and becomes a defensible number.

<!-- end_slide -->

## Trace-driven debugging

When an eval case fails, the trace tells you where.

<!-- pause -->

- Pre-call validation failed → input problem
- Gateway invoke returned unexpected output → model or prompt problem
- Post-call validation failed → output contract problem
- Confidence below threshold → calibration problem

<!-- pause -->

Every failing eval case that you diagnose via trace becomes a permanent test case. The golden dataset grows from incidents, not just from design.

<!-- pause -->

> Turn recurring failures into permanent dataset entries. That is how the suite earns its value over time.

<!-- end_slide -->

## Lightweight eval architecture

You do not need a sophisticated framework to start.

<!-- pause -->

Four components:

- **Dataset files** — JSON inputs with expected outputs
- **Runner** — sends each case through the endpoint
- **Scorer** — checks actual output against expected rules
- **Report** — pass/fail per case with failure reason

<!-- pause -->

Start local. Add to CI when the baseline is stable.

<!-- pause -->

> A simple eval that runs consistently beats a sophisticated one that doesn't.

<!-- end_slide -->

## Anti-patterns to avoid

These feel like rigour but aren't:

<!-- pause -->

- Measuring only accuracy — safety and refusal behaviour are also release criteria
<!-- pause -->
- No edge cases in the dataset — the happy path passing tells you very little
<!-- pause -->
- Dataset drift — inputs that were representative six months ago may not be now
<!-- pause -->
- Ignoring latency and cost when comparing quality improvements
<!-- pause -->
- Manual eval that can't be re-run — if a human has to judge it every time, it isn't a gate

<!-- pause -->

**Think:** which of these is your current setup closest to?

<!-- speaker_note: 60 seconds — honest answer. -->

<!-- end_slide -->

## What you build in the lab

A lightweight eval suite for the document extraction feature:

<!-- pause -->

- A golden dataset — inputs with documented expected outputs
<!-- pause -->
- Machine-checkable pass/fail rules per case
<!-- pause -->
- A runner that sends each case through the endpoint
<!-- pause -->
- A report showing pass/fail per case with failure reason
<!-- pause -->
- A prompt comparison run — two variants, same dataset, documented rationale

<!-- pause -->

Definition of done: the suite runs without manual intervention and produces a clear pass or fail result per case.

<!-- end_slide -->

## Summary

<!-- incremental_lists: true -->

- **Evals are delivery discipline** — not research, not optional, not post-incident.
<!-- pause -->
- **Golden datasets** anchor quality across prompt and model changes over time.
<!-- pause -->
- **Five dimensions** — correctness, format, safety, grounding, operational.
<!-- pause -->
- **Traces and evals together** improve debugging speed and governance evidence.
<!-- pause -->
- **Release confidence** comes from measurable evidence, not opinion.

<!-- incremental_lists: false -->

<!-- end_slide -->

## Bridge to Module 7

**What you now have:**

A repeatable eval suite that produces evidence-based release recommendations.

<!-- pause -->

**The question Module 7 asks:**

Eval results need to gate deployment, not just inform it.

<!-- pause -->

- Which eval criteria become hard CI gates — a failing case blocks the release?
<!-- pause -->
- What observability do you need after release to know the feature is still behaving correctly?
<!-- pause -->
- What does a rollback trigger look like in production?

<!-- pause -->

<!-- speaker_note: Your first task in Module 7: decide which of your eval criteria are hard gates and which are advisory. -->

<!-- end_slide -->

<!-- jump_to_middle -->

Questions?
===

<!-- end_slide -->
