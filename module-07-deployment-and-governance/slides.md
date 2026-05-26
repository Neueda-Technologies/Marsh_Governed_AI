---
title: "**Deployment and Governance**"
sub_title: Module 7 — Governed AI Feature Delivery
author: Kevin Cunningham
---

## You already have a release artifact

In Module 6 you generated a version bundle manifest. Open it:

```
evals/artifacts/version-bundle-manifest.json
```

<!-- pause -->

It contains: prompt version, model identifier, confidence threshold, dataset SHA, and source file hashes for prompt, workflow, validators, and runtime config.

<!-- pause -->

**Think:** if a colleague made a change to `validators.ts` and reran the evals — what would change in this file? Would you know a change had happened?

<!-- speaker_note: 60 seconds. -->

<!-- pause -->

That manifest is your versioning contract. Module 7 is about what happens next — getting it into a pipeline, wiring it to deployment controls, and knowing what to do when something goes wrong.

<!-- end_slide -->

## The release gap

Strong prototypes fail in production when release controls are weak.

<!-- pause -->

The specific failure modes for AI features:

- Prompt or model change ships without rerunning evals
- No kill switch — a bad release can only be fixed by redeployment
- Observability added after the first incident, not before
- No named owner for release gate failures — unowned gates get bypassed

<!-- pause -->

**Think:** which of these is your current build most exposed to?

<!-- speaker_note: Pair: 90 seconds. -->

<!-- end_slide -->

## What "release-ready" actually means

Five things — all of them, not a partial checklist:

<!-- pause -->

1. Quality thresholds pass on the current golden dataset
<!-- pause -->
2. Safety and refusal behaviour validated — zero hard failures
<!-- pause -->
3. Traceability and provenance fields confirmed in every response
<!-- pause -->
4. Rollback and fallback mechanisms tested — not just documented
<!-- pause -->
5. Ownership and on-call response paths named

<!-- pause -->

> A partial checklist is not a release gate. It is a list of things you hope are true.

<!-- end_slide -->

## Version everything that changes behaviour

| Asset | Must be versioned | Why |
| ----- | ----------------- | --- |
| Prompt assets | Yes | Behaviour changes outside app logic |
| Model identifier | Yes | Quality, cost, and latency can shift |
| Eval dataset | Yes | Prevents moving the quality baseline |
| Policy config | Yes | Compliance behaviour changes |

<!-- pause -->

> If an asset changes behaviour, it must have a version. No exceptions.

<!-- pause -->

The manifest hashes your source files. If `validators.ts` changes between releases and the hash doesn't change — someone bypassed the process.

<!-- end_slide -->

## CI/CD gates

Your Module 6 release gate report has three gates: quality, policy, trace completeness.

<!-- pause -->

In a pipeline those become:

- Block deploy on hard-fail eval criteria — zero tolerance for safety failures
- Enforce minimum pass rate — your team decides what "good enough to ship" means
- Require trace artifact generation — no artifact, no deploy
- Named owner per gate — unowned gates get bypassed

<!-- pause -->

**Think:** which of your Module 6 gates would you make a hard block — the pipeline fails and the deploy stops? Which would you monitor but not block on?

<!-- speaker_note: Pair: 90 seconds. -->

<!-- end_slide -->

## Demo: the kill switch

**Demo:** Run the kill switch script — show feature ON vs OFF responses.

```bash
npx tsx src/ops/demoKillSwitchAndRollback.ts
```

<!--
speaker_note: |
  Points to land:
  - denied response shape matches any other denied — frontend contract holds
  - No redeployment required — one config value
  - Trace is still complete — kill switch produces audit evidence
-->

<!-- pause -->

**Ask:** the kill switch produces a `denied` response. Should it produce `denied` or something else — a `feature_unavailable` status, for example? What changes for the frontend and for the auditor?

<!-- end_slide -->

## Rollback vs fallback

These are different controls for different problems.

<!-- pause -->

| Control | Trigger | Effect |
| ------- | ------- | ------ |
| Rollback | Bad release behaviour across traffic | Revert to previous version bundle |
| Fallback | Uncertain or failed single request | Safe deterministic response for that request |

<!-- pause -->

Rollback handles a bad release. Fallback handles a bad request.

<!-- pause -->

> Rollback alone does not protect in-flight uncertain requests. You need both — and both must be rehearsed before you need them.

<!-- end_slide -->

## Observability before launch

The trace your backend already produces covers most of this. What a production system needs on top:

<!-- pause -->

- Aggregated fallback and refusal event rates — a spike in `needs_review` is an early warning signal
- Latency and cost per model call — silent degradation after a model version change
- Prompt and model provenance per run — already in every trace, needs to be queryable
- Correlation across services — the trace ID needs to travel all the way to the frontend

<!-- pause -->

> Observability design starts before release. Not after the first incident.

<!-- end_slide -->

## Incident response

When something goes wrong, the trace tells you where.

<!-- pause -->

1. Detect regression via alerts or eval monitoring
<!-- pause -->
2. Triage with trace evidence — which stage failed?
<!-- pause -->
3. Activate kill switch or rollback if traffic is affected
<!-- pause -->
4. Route affected requests through the fallback path
<!-- pause -->
5. Capture post-incident improvements as permanent dataset entries

<!-- pause -->

Step 5 is the one teams skip. Every incident that isn't turned into a new eval case will recur.

<!-- end_slide -->

## Common release anti-patterns

You've seen all of these now — but naming them helps:

<!-- pause -->

- Shipping prompt or model changes without rerunning evals
<!-- pause -->
- No named owner for release gate failures
<!-- pause -->
- No rehearsed rollback or kill-switch procedure
<!-- pause -->
- Observability added after incidents rather than before release
<!-- pause -->
- Release gate report generated but never read

<!-- pause -->

**Think:** which of these is most likely to be the first thing your team skips under delivery pressure?

<!-- speaker_note: 60 seconds — honest answer. -->

<!-- end_slide -->

## What you produce in the lab

A release-readiness pack — a single document a non-engineer could read to understand whether the feature is safe to release:

<!-- pause -->

- Versioned change bundle: prompt, model, eval dataset identifiers
<!-- pause -->
- Gate criteria with pass/fail outcomes from Module 6
<!-- pause -->
- Rollback and fallback playbooks with named triggers
<!-- pause -->
- Observability requirements confirmed
<!-- pause -->
- A written go/no-go recommendation with evidence and a named owner

<!-- pause -->

Definition of done: a non-engineer could read this pack and understand whether the feature is safe to release — and know who to call if it isn't.

<!-- end_slide -->

## Summary

<!-- incremental_lists: true -->

- **Release-ready AI** requires evidence-backed gates — all five, not a partial checklist.
<!-- pause -->
- **Version everything** that changes behaviour, not just application code.
<!-- pause -->
- **Observability before launch** enables safe operation and fast incident recovery.
<!-- pause -->
- **Rollback and fallback** are both required, both different, and both must be rehearsed.
<!-- pause -->
- **Every incident** that isn't turned into a new eval case will recur.

<!-- incremental_lists: false -->

<!-- end_slide -->

## Bridge to Module 8

**What you now have:**

A complete governed delivery stack — workflow, guardrails, UX, evals, and deployment.

<!-- pause -->

**If this is the final module:**

The release-readiness pack you produce in the lab is the deliverable. It connects every decision from Module 1 to a shipping recommendation with evidence.

<!-- pause -->

**If Module 8 follows:**

Your first task: identify the one gap in your current build that carries the most release risk.

Module 8 is the final integration and review session. Bring your artefacts.

<!-- end_slide -->

<!-- jump_to_middle -->

Questions?
===

<!-- end_slide -->
