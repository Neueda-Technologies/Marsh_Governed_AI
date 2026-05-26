---
title: "**Workflow vs Agent Design**"
sub_title: Module 3 — Governed AI Feature Delivery
author: Kevin Cunningham
---

## You have a working workflow

In Module 2 you built a deterministic, traceable endpoint.

<!-- pause -->

Fixed sequence. Known output contract. Pre-call and post-call validation. Fallback on failure.

<!-- pause -->

**Think:** what kind of problem would break this pattern?

<!-- speaker_note: 60 seconds — what would your workflow struggle to handle? -->

<!-- end_slide -->

## When the fixed sequence breaks down

A deterministic workflow assumes:

- The steps are known in advance.
<!-- pause -->
- The output contract is stable.
<!-- pause -->
- The same input always follows the same path.

<!-- pause -->

**Some problems don't fit those assumptions.**

<!-- pause -->

Classifying a known document type: fits.

Triaging an ambiguous email with unknown intent: maybe.

Exploring a corpus of documents to propose next actions: probably not.

<!-- pause -->

The question isn't which pattern is *better* — it's which pattern fits *this problem*.

<!-- end_slide -->

## Three execution patterns

| Pattern | Best for | Governance cost |
| ------- | -------- | --------------- |
| Deterministic workflow | Repeatable, auditable tasks | Low |
| Bounded tools | Controlled external actions | Medium |
| Agentic flow | Open-ended planning and exploration | High |

<!-- pause -->

**Think:** where does your current feature sit? Where might it move?

<!-- speaker_note: Pair: 90 seconds. -->

<!-- end_slide -->


## Pattern 1: Deterministic workflow

<!-- speaker_note: Switch to the agent harness / car animation now. Return here when done. -->

You've built this. You know what it looks like.

<!-- pause -->

- Fixed sequence with explicit branching
<!-- pause -->
- Known output contract — the frontend can depend on it
<!-- pause -->
- Easiest to test, evaluate, and audit
<!-- pause -->
- Best for extraction, classification, routing, compliance

<!-- pause -->

> When in doubt, start here. Move away only when evidence demands it.

<!-- end_slide -->

## Pattern 2: Bounded tools

Same workflow structure — but the model can invoke a constrained set of tools as part of processing.

<!-- pause -->

Not arbitrary tool execution. An **allowlist** — the only tools that can run are the ones you explicitly permit.

<!-- pause -->

Let's see it.

<!-- end_slide -->

## Demo: deterministic vs bounded tool path

<!-- speaker_note: Send the standard happy path request first. Then the same request with executionMode bounded_tool. Point at bounded_tool_selection in the trace, then open tools.ts and ALLOWED_TOOLS. -->

```json
{
  "text": "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.",
  "source": "demo"
}
```

```json
{
  "text": "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.",
  "source": "demo",
  "executionMode": "bounded_tool"
}
```

```
workflow    🔧 bounded_tool_selection
             tools: ["entity_normalizer","external_web_search"]
             blocked: ["external_web_search"]
```

<!-- end_slide -->


## What the demo shows

<!-- speaker_note: Switch to the code execution / sandbox containment animation now. Return here when done. -->

The workflow requested two tools. One ran. One was blocked.

<!-- pause -->

`entity_normalizer` is on the allowlist — it ran.

`external_web_search` is not — it was silently blocked and logged.

<!-- pause -->

The trace records both: what was requested, what was allowed, what was blocked.

<!-- pause -->

**That's the governance obligation for bounded tools:**
- Explicit allowlist — not "permit unless blocked"
- Every tool decision logged
- Output still passes through post-call validation

<!-- pause -->

> The tool boundary is a governance control point, not just an implementation detail.

<!-- end_slide -->

## Pattern 3: Agentic behaviour

Adaptive planning. Dynamic decision chains. The model decides what to do next based on intermediate results.

<!-- pause -->

Useful for genuinely open-ended problems:

- Exploring a corpus with unknown structure
- Multi-step investigation where next steps depend on findings
- Tasks where the sequence can't be defined in advance

<!-- pause -->

**This is the high-cost option — not the advanced default.**

<!-- pause -->

- Harder to test: you can't enumerate the paths
- Harder to audit: the decision chain is dynamic
- Harder to evaluate: success criteria are less crisp
- Higher blast radius when tool calls go wrong

<!-- end_slide -->

## The decision questions

Answer these before implementation — not after.

<!-- pause -->

1. Is deterministic output required?
<!-- pause -->
2. Is strict auditability required?
<!-- pause -->
3. How many tools are genuinely needed — and can you allowlist them?
<!-- pause -->
4. Can quality be evaluated repeatably?
<!-- pause -->
5. What is the blast radius if a tool call goes wrong?

<!-- pause -->

**Think:** apply these to your current feature. Which answers push you toward workflow? Which toward agent?

<!-- speaker_note: Pair: 2 minutes. -->

<!-- end_slide -->

## Classify these scenarios

Three scenarios. For each one — workflow, bounded tools, or agentic?

<!-- pause -->

**Scenario A:** Parse known fields from a structured invoice PDF.

<!-- pause -->

**Scenario B:** Classify an incoming email, route to a team, and enrich with CRM context before routing.

<!-- pause -->

**Scenario C:** Given access to a document corpus, propose the three most relevant documents for a user query and explain why.

<!-- pause -->

<!-- speaker_note: Pair: classify all three, then be ready to defend Scenario B — that's the contested one. -->

<!-- end_slide -->

## Scenario verdicts

**A — Document extraction:** deterministic workflow.

<!-- pause -->

Known fields, known document types, known output contract. Adding agents here introduces risk and overhead with no benefit.

<!-- pause -->

**B — Email triage:** workflow plus bounded tools.

<!-- pause -->

The classification step is deterministic. The CRM lookup is a bounded tool call. Agentic behaviour is only justified for genuine edge cases — and those should fall back to human review, not autonomous resolution.

<!-- pause -->

**C — Document exploration:** agentic may be justified.

<!-- pause -->

The sequence can't be defined in advance. But it still needs: deeper trace coverage, approval checkpoints before high-risk actions, and stronger evaluation criteria before production.

<!-- end_slide -->

## Tool boundaries: the rules

Whether MCP tools or internal tools, the obligations are the same:

<!-- pause -->

- Allowlist tools — do not permit arbitrary execution
<!-- pause -->
- Constrain parameters and payload sizes explicitly
<!-- pause -->
- Define timeouts and retry behaviour per tool
<!-- pause -->
- Log tool call intent and outcome in every trace

<!-- pause -->

The ownership model differs — MCP tools are platform-managed, internal tools are team-owned — but the governance requirement is identical.

<!-- end_slide -->

## LLM skills vs MCPs

Two ways to extend what a model can do. MCP is the current standard — and a live source of frustration.

<!-- pause -->

| | LLM skills (built-in tools) | MCP tools |
| - | --------------------------- | --------- |
| What they are | Capabilities baked into the model or SDK | External servers the harness connects to at runtime |
| Ownership | Model provider or your team | Platform-managed or third-party |
| Latency | Low — no network hop | Higher — crosses a process boundary |
| Governance | Defined at model/SDK level | Explicit boundaries required per tool |
| Best for | Core reasoning tasks, structured output, code gen | Dynamic tool discovery, stateful integrations, IDE tooling |

<!-- pause -->

**The honest picture on MCP right now:**

<!-- pause -->

It solves real problems — dynamic tool discovery, session state, bidirectional communication — things a plain REST call can't do.

<!-- pause -->

But the production costs are real: tool schema overhead can consume a significant portion of your context window before the agent processes any input. The ecosystem is fragmented. Authentication across multiple servers adds friction most teams didn't anticipate.

<!-- pause -->

Perplexity moved away from MCP in early 2026. So did others. Direct REST APIs and CLI approaches are gaining ground for fixed tool sets in production.

<!-- end_slide -->

## The governance point that doesn't change

Whether you use MCP, a direct API, or CLI — the obligations are identical.

<!-- pause -->

Switching protocol does not eliminate prompt injection.

Switching protocol does not fix privilege escalation.

Switching protocol does not reduce your attack surface.

<!-- pause -->

**It changes the plumbing. It does not change the threat model.**

<!-- pause -->

The decision heuristic:

<!-- pause -->

- Fixed, known tool set in production → direct API or CLI, lower overhead
<!-- pause -->
- Dynamic tool discovery, stateful interactions, IDE/dev tooling → MCP is still the strongest fit
<!-- pause -->
- Either way: allowlist, log every tool decision, test the failure path

<!-- end_slide -->

## Migration strategy

You will almost always start with more workflow than you need and less agent than you think.

<!-- pause -->

1. Build the deterministic baseline first.
<!-- pause -->
2. Measure where the fixed sequence actually fails — use evidence, not assumption.
<!-- pause -->
3. Introduce bounded tools before moving to autonomy.
<!-- pause -->
4. Add agentic behaviour only when evaluation results support it.

<!-- pause -->

> Choosing agent over workflow without evidence is a governance decision with costs — it just feels like an architecture decision.

<!-- end_slide -->

## Failure modes to watch

- Over-agentic design applied to deterministic problems
<!-- pause -->
- Tool allowlists that are too broad — "everything except the dangerous ones"
<!-- pause -->
- No trace coverage of dynamic tool decisions
<!-- pause -->
- No fallback when confidence is low or tool calls fail
<!-- pause -->
- Releasing agentic features before evaluation baselines exist

<!-- end_slide -->

## Summary

<!-- incremental_lists: true -->

- **Agentic is not the default** — choose autonomy only when the decision questions justify it.
<!-- pause -->
- **Workflow first** keeps delivery predictable, auditable, and testable.
<!-- pause -->
- **Bounded tools** offer a controllable middle ground with explicit governance obligations.
<!-- pause -->
- **The decision framework** replaces "agents sound more capable" with defensible engineering rationale.

<!-- incremental_lists: false -->

<!-- end_slide -->

## Bridge to Module 4

**What you've established:**

- Execution model decisions with explicit rationale.
<!-- pause -->
- Tool boundaries that define your attack surface.

<!-- pause -->

**The question Module 4 asks:**

Regardless of execution model — workflow, bounded tools, or agent — the same attack vectors apply.

<!-- pause -->

- Where can inputs be manipulated?
<!-- pause -->
- Where can tool calls be exploited?
<!-- pause -->
- Where does your trace coverage have gaps?

<!-- pause -->

<!-- speaker_note: Your first task in Module 4: map your tool boundaries against the threat model. -->

<!-- end_slide -->

<!-- jump_to_middle -->

Questions?
===

<!-- end_slide -->
