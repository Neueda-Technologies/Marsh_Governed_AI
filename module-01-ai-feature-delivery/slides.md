---
title: "**AI Feature Delivery** in Regulated Environments"
sub_title: Module 1 — Governed AI Feature Delivery
author: Kevin Cunningham
---

## Before we start

Six months ago your team shipped an AI feature to production.

<!-- pause -->

Today an auditor calls. They want to know:

<!-- pause -->

*"Why did the system deny this customer's application?"*

<!-- pause -->

**What can you show them?**

<!-- pause -->

Take 60 seconds. Think about what evidence you'd have — or wouldn't.

<!-- end_slide -->

## The gap we're closing

Most teams can answer that question for a traditional feature.

<!-- pause -->

Very few can answer it confidently for an AI feature.

<!-- pause -->

That gap is what this course is about.

<!-- end_slide -->

## Why AI features are different: let's find out

You're building a feature that classifies customer documents.

A traditional version: rule-based, deterministic.
An AI version: LLM-powered, probabilistic.

<!-- pause -->

**Think:** what changes about how you test, deploy, and audit it?

<!-- speaker_note: 60 seconds — then we'll compare notes. -->

<!-- end_slide -->

## What actually changes

| Area | Traditional feature | AI feature |
| ---- | ------------------- | ---------- |
| Output | Deterministic | Probabilistic / variable |
| Testing | Unit/integration mostly enough | Needs eval datasets + quality thresholds |
| Change risk | Mostly code changes | Code + prompt + model + data drift |
| Observability | Logs and metrics | Logs, traces, prompt/model provenance |

<!-- pause -->

How close were you?

<!-- end_slide -->

## The provenance problem

Traditional: *same input → same output, always.*

<!-- pause -->

AI: output can vary with each request, even for identical input.

<!-- pause -->

And the things that change output aren't always in your codebase.

<!-- pause -->

- Someone edits a prompt.
- A model provider silently updates a version.
- Input data distribution shifts.

<!-- pause -->

None of these show up in your deployment pipeline.

<!-- end_slide -->

> **Key point:** AI features require a broader and deeper engineering contract.

<!-- pause -->

Same engineering discipline — expanded control surface.

<!-- end_slide -->

## Where should the rules live?

Look at these four options:

- Backend code
- Prompt text
- Config / feature flags
- Infrastructure

<!-- pause -->

**Think:** where would you put each of these?

- Allowed document types
- Confidence threshold for routing
- Which model to use
- Fallback strategy if the model is unavailable
- Regional routing requirement (EU vs US)

<!-- speaker_note: 90 seconds — we'll compare in a moment. -->

<!-- end_slide -->

## Where logic should live

| Put it in... | Typical responsibilities | Example |
| ------------ | ------------------------ | ------- |
| Backend code | Workflow sequence, retries, policy branching | Retry if confidence score below threshold |
| Prompt assets in code | Task instructions, output format constraints | Extraction schema and field definitions |
| Config | Model selection, thresholds, feature flags | Model name, confidence threshold, region |
| Infrastructure | Deployment policy, secrets, regional routing | EU/US routing rules, secrets management |

<!-- pause -->

> Rule: never hide a business rule inside prompt text only.

<!-- pause -->

If it can't be tested, reviewed, or versioned — it's a governance gap.

<!-- end_slide -->

## The AI request lifecycle

A governed request isn't just a call to an API.

<!-- pause -->

1. User or system submits input.
<!-- pause -->
2. Backend workflow prepares context and applies policy constraints.
<!-- pause -->
3. Gateway routes the model call and records trace metadata.
<!-- pause -->
4. Model returns structured or unstructured response.
<!-- pause -->
5. Post-call validation and safety checks run.
<!-- pause -->
6. Frontend presents result with confidence and review affordances.

<!-- pause -->

Each step is a control point. Each control point needs evidence.

<!-- end_slide -->

## Architecture boundaries

For this course, we're working across four layers:

<!-- pause -->

- **TanStack frontend**: interaction, review, uncertainty display
<!-- pause -->
- **NestJS backend**: orchestration, policy, deterministic workflow steps
<!-- pause -->
- **LLM gateway**: routing, traceability, auditability controls
<!-- pause -->
- **Model provider**: inference capability, latency/cost trade-offs
<!-- pause -->
- **Evaluation layer**: quality checks and regression detection

<!-- pause -->

You need to know which layer owns which responsibility — and be able to defend it.

<!-- end_slide -->

## Risk categories you're designing for

<!-- pause -->

- **Hallucination**: plausible but incorrect output
<!-- pause -->
- **Data exposure**: leakage of PII or sensitive context
<!-- pause -->
- **Trace gaps**: no explainable path from input to decision
<!-- pause -->
- **Operational drift**: prompt or model changes with no controls

<!-- pause -->

**Which of these keeps you up at night for your current context?**

<!-- end_slide -->

## "Governance will slow us down"

You've heard this. You may have said it.

<!-- pause -->

Here's what ungoverned delivery actually looks like at scale:

<!-- pause -->

- Every team reinvents the same controls independently.
<!-- pause -->
- Incidents take days to diagnose because provenance is missing.
<!-- pause -->
- Audits require manual reconstruction of decisions.
<!-- pause -->
- New features can't reuse anything because nothing is standardised.

<!-- pause -->

Governance done well is a delivery accelerator — reusable modules, shared standards, faster shipping.

<!-- end_slide -->

## The scenario we'll use throughout this course

An AI-powered document intake feature in a regulated environment.

It needs to:

<!-- pause -->

- Accept document or text input
<!-- pause -->
- Extract structured information
<!-- pause -->
- Classify and route results
<!-- pause -->
- Apply validation and guardrails
<!-- pause -->
- Surface outputs in a reviewable UI

<!-- pause -->

This scenario touches every layer of the governed architecture. The same feature thread runs through all eight modules.

<!-- end_slide -->

## What you'll build a view on in the lab

Before Module 2 implementation, you need to make decisions:

<!-- pause -->

- Which control points are sufficient as-is?
<!-- pause -->
- What evidence must exist for every request?
<!-- pause -->
- Where do specific rules live — and why?
<!-- pause -->
- What happens when you change one parameter?

<!-- pause -->

The lab produces a one-page governance design brief you'll carry forward.

<!-- end_slide -->

## Summary

<!-- incremental_lists: true -->

- **AI features are different**: broader engineering controls are required.
<!-- pause -->
- **Governed delivery is practical**: boundaries, traceability, validation.
<!-- pause -->
- **Architecture matters early**: where logic lives determines risk.
<!-- pause -->
- **This is the foundation** for workflows, guardrails, UX, evals, and deployment.

<!-- incremental_lists: false -->

<!-- end_slide -->

## Bridge to Module 2

**What we've established:**

- Where responsibilities sit across the stack.
<!-- pause -->
- Which risks and controls must be explicit from day one.
<!-- pause -->

**What's next:**

In the lab you'll make governance decisions for the document intake scenario.

<!-- pause -->

In Module 2 you'll translate those decisions into a concrete NestJS workflow boundary, validation sequence, and trace contract.

<!-- pause -->

<!-- speaker_note: Your decisions in the lab shape what you build in Module 2. -->

<!-- end_slide -->

<!-- jump_to_middle -->

Questions?
===

<!-- end_slide -->
