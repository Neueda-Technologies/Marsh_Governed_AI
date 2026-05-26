---
title: "**Final Build and Review**"
sub_title: Module 8 — Governed AI Feature Delivery
author: Kevin Cunningham
---

## What this session is

Not a teaching session. A proof session.

<!-- pause -->

You have built:

- A governed backend workflow with validation layers
- Bounded tool usage with an allowlist and trace
- Layered guardrails at input, output, and tool boundaries
- A structured frontend review experience
- An evaluation suite with release gate results
- A release-readiness pack with a go/no-go recommendation

<!-- pause -->

Module 8 is where those pieces have to work together — and where the gaps become visible.

<!-- pause -->

> Integration exposes real trade-offs and weak boundaries. That is the point.

<!-- end_slide -->

## Before the demo: identify your gap

**Think:** looking across everything you've built — what is the one boundary that you are least confident about?

<!-- pause -->

Not the thing you haven't finished. The thing you've built but aren't sure holds under pressure.

<!-- pause -->

<!-- speaker_note: 90 seconds — write it down. -->

<!-- pause -->

That gap is what your demo should stress-test.

<!-- end_slide -->

## What the demo must show

Five things — all of them:

<!-- pause -->

1. One end-to-end request lifecycle — input to accepted output, with trace
<!-- pause -->
2. One failure path — show the fallback behaviour it triggers, not just that it exists
<!-- pause -->
3. Eval evidence — the release gate report supporting your go/no-go decision
<!-- pause -->
4. Trace evidence — a complete trace showing provenance fields
<!-- pause -->
5. The go/no-go recommendation — stated, with rationale, with a named owner

<!-- pause -->

> If you cannot show the failure path and the trace, the demo is incomplete.

<!-- end_slide -->

## What counts as evidence

| Evidence type | Artefact |
| ------------- | -------- |
| Architecture | Boundary map — which layer owns what |
| Quality | Eval pass/fail summary and dataset version |
| Safety | Guardrail rule set with at least one denial example |
| Operations | Release gate results and rollback trigger definition |
| Observability | Trace sample with traceId, promptVersion, modelIdentifier |

<!-- pause -->

Verbal claims without artefacts are not accepted as evidence.

<!-- end_slide -->

## Common final-build failure modes

Knowing these before the demo is useful:

<!-- pause -->

- Feature works once but lacks repeatable eval evidence
<!-- pause -->
- Strong backend, inconsistent frontend review behaviour across the three status paths
<!-- pause -->
- Good eval scores but no named owner for the release gate
<!-- pause -->
- Trace data present but not structured to answer "why was this denied?"

<!-- pause -->

**Think:** which of these is your build closest to?

<!-- speaker_note: Pair: 90 seconds — be honest. -->

<!-- end_slide -->

## After the demo: adoption planning

The demo proves the pattern works. Adoption planning is what turns it into production impact.

<!-- pause -->

Four questions — work through them as a team:

<!-- pause -->

1. What can become a shared platform default immediately — something every AI feature your team ships should use?
<!-- pause -->
2. What needs one more sprint to harden before wider rollout?
<!-- pause -->
3. What risks require stakeholder alignment outside the team?
<!-- pause -->
4. Who owns ongoing quality and governance controls after today?

<!-- pause -->

> Adoption planning is not optional. Without it, this course produces a prototype, not a capability.

<!-- end_slide -->

## Course close

You leave with three things:

<!-- pause -->

**A pattern set** — governed workflow, layered guardrails, structured UX, eval suite, release controls. These are reusable. Apply them to the next AI feature you ship.

<!-- pause -->

**A known gap list** — the things your current build doesn't cover yet. That list is your next sprint's input, not a sign of failure.

<!-- pause -->

**An adoption decision** — who owns what, and what changes next. If that decision isn't made in this room, it won't be made.

<!-- pause -->

> The patterns are the asset. Not the prototype.

<!-- end_slide -->

<!-- jump_to_middle -->

Questions?
===

<!-- end_slide -->
