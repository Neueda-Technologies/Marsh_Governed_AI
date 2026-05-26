---
title: "**Backend Workflow Patterns**"
sub_title: Module 2 — Governed AI Feature Delivery
author: Kevin Cunningham
---

## Opening scenario

Module 1 produced a governance brief: trace IDs, prompt versions, validation gates.

Someone proposes shipping the extract endpoint in one controller method that calls the model directly.

**Think:** which audit question fails first — and which layer should have caught it?

<!-- end_slide -->

## Where we left off

In Module 1 you made governance decisions for the document intake scenario.

<!-- pause -->

You decided where rules should live, what evidence every request needs, and what happens when something fails.

<!-- pause -->

Module 2 is where those decisions become structure.

<!-- end_slide -->

## Before we look at the solution

Here is the simplest possible implementation of the feature:

```typescript
@Post("/extract")
async extract(@Body() body: any) {
  const result = await this.llm.invoke(body.text);
  return result;
}
```

<!-- pause -->

**Think:** using your governance brief from Module 1 — what's missing here?

<!-- speaker_note: 60 seconds. Then we'll compare. -->

<!-- end_slide -->

## What's missing

- No input validation contract
<!-- pause -->
- No prompt version tracking
<!-- pause -->
- No output schema enforcement
<!-- pause -->
- No trace or audit metadata
<!-- pause -->
- No fallback path

<!-- pause -->

Every gap here maps directly to a governance requirement you identified in the lab.

<!-- pause -->

The question isn't *whether* to fix this — it's *how to structure the fix.*

<!-- end_slide -->

## The layering question

We need to add: validation, prompt management, tracing, fallback handling.

<!-- pause -->

**Think:** where would you put each of those? What are your options?

<!-- speaker_note: 90 seconds — then pairs. -->

<!-- pause -->

<!-- speaker_note: Share: what did you disagree on? -->

<!-- end_slide -->

## The pattern: workflow layering

- **Controller**: request/response contract only
<!-- pause -->
- **Workflow service**: orchestration, decisions, fallback
<!-- pause -->
- **Prompt module**: versioned prompt assets
<!-- pause -->
- **Validators**: pre and post-call checks
<!-- pause -->
- **Gateway adapter**: model access, tracing, audit envelope

<!-- pause -->

Each layer has one job. Let's look at what that means in practice.

<!-- end_slide -->

## Demo: the anti-pattern vs the pattern

**Demo:** Walk the anti-pattern path first, then the governed path in the demo app.

<!--
speaker_note: |
  Points to land:
  - Where the controller boundary sits
  - How the workflow service owns the sequence
  - Where the prompt version appears in the trace
  - What a post-call validation failure looks like
  - What the fallback response looks like vs a raw model error
-->

<!-- end_slide -->

## After the demo: layer ownership

| Layer | Owns | Avoids |
| ----- | ---- | ------ |
| Controller | Transport contract, auth context | Orchestration, prompt logic |
| Workflow service | Sequence, branching, retries, fallback | HTTP transport concerns |
| Prompt module | Task instructions, placeholders, version id | Business policy, branching |
| Validators | Schema and policy checks | Model invocation |
| Gateway adapter | Model routing, trace metadata, audit envelope | Domain decision logic |

<!-- pause -->

**Which of these boundaries did the demo make clearest? Which is still fuzzy?**

<!-- end_slide -->

## Prompt assets are code

This is the one that teams skip most often.

<!-- pause -->

- Store prompt templates as code artefacts, not hidden strings.
<!-- pause -->
- Attach version metadata — you need this for audit and rollback.
<!-- pause -->
- Parameterise fields explicitly. No implicit mutation.
<!-- pause -->
- Review prompt changes like behaviour changes: diff, approve, merge.

<!-- pause -->

> A prompt edit that bypasses review is a behaviour change that bypasses review.

<!-- end_slide -->

## The output contract

Model output is untrusted until it passes validation.

<!-- pause -->

| Field | Type | Rule |
| ----- | ---- | ---- |
| `documentType` | enum | Must be one of approved categories |
| `confidence` | number | 0–1, required |
| `entities` | array | Required, max length policy-constrained |
| `summary` | string | Optional, length-limited |

<!-- pause -->

**Think:** what happens if `confidence` comes back as `null`? Who should handle that — and where?

<!-- end_slide -->

## Validation gates

**Pre-call** — before the model is invoked:

- Input shape and required fields
- Size and type constraints
- Policy constraints (allowed routes, feature flags)

<!-- pause -->

**Post-call** — after the model responds:

- Schema and parse validity
- Policy checks (allowed categories, content rules)
- Confidence threshold — trigger fallback if below minimum

<!-- pause -->

Failing pre-call is cheap. Failing post-call is recoverable. Skipping both is a production incident.

<!-- end_slide -->

## Failure is part of the design

**When validation fails:**

<!-- pause -->

- Do not return raw model output.
<!-- pause -->
- Return a deterministic `needs_review` response.
<!-- pause -->
- Persist trace and failure reason for follow-up.
<!-- pause -->
- Maintain a UI-safe output contract at all times.

<!-- pause -->

Safe fallback isn't a sign the feature failed. It's the feature working as designed.

<!-- end_slide -->

## The gateway as a governance control

Teams often treat the gateway as a transport wrapper. It isn't.

<!-- pause -->

- Consistent model invocation contract across all features
<!-- pause -->
- Prompt and model provenance recorded in every trace
<!-- pause -->
- Central routing and provider abstraction
<!-- pause -->
- Audit-ready request/response envelope

<!-- pause -->

If the gateway doesn't record which prompt version produced this output, your audit contract has a gap.

<!-- end_slide -->

## Testing the workflow

| Test type | What it covers |
| --------- | -------------- |
| Unit | Orchestration branches, decision logic |
| Contract | Request/response schema conformance |
| Validation | Rejection paths and fallback behaviour |
| Integration | Gateway adapter stub with trace verification |

<!-- pause -->

**The fallback path must be tested.** If you've only tested the happy path, you haven't tested the governance.

<!-- end_slide -->

## What you're building in the lab

A NestJS endpoint that:

- Accepts document input via a validated controller contract
<!-- pause -->
- Runs deterministic workflow orchestration in a service layer
<!-- pause -->
- Calls the model via gateway with trace metadata and prompt version
<!-- pause -->
- Enforces post-call schema and policy checks
<!-- pause -->
- Returns an accepted output or a safe fallback response

<!-- pause -->

**Definition of done:** each layer has a clear boundary and the fallback path is tested.

<!-- end_slide -->

## Summary

<!-- incremental_lists: true -->

- **Structure beats ad-hoc calls** — reliability, reuse, and auditability require it.
<!-- pause -->
- **Prompts are code artefacts** — version them, review them, treat changes as behaviour changes.
<!-- pause -->
- **Validation gates are mandatory** — pre-call and post-call, every time.
<!-- pause -->
- **Gateway integration** enables consistent traceability across features.
<!-- pause -->
- **Fallback is intentional design** — not an edge case.

<!-- incremental_lists: false -->

<!-- end_slide -->

## Bridge to Module 3

**What you've built:**

A deterministic, traceable workflow pattern you can reuse across features.

<!-- pause -->

**The question Module 3 asks:**

When is a deterministic workflow the right tool — and when isn't it?

<!-- pause -->

- Where does a fixed sequence break down?
<!-- pause -->
- When does agentic behaviour become appropriate?
<!-- pause -->
- What new governance challenges does that introduce?

<!-- pause -->

<!-- speaker_note: Your first task in Module 3: map your workflow against the agent decision framework. -->

<!-- end_slide -->

<!-- jump_to_middle -->

Questions?
===

<!-- end_slide -->
