# Lab 3: Choose the Right Execution Pattern

## Objective

You will extend the governed workflow you completed in Module 2, apply the execution pattern decision framework to **new** scenarios (not the slide examples), and define governance requirements for patterns you choose not to implement yet.

By the end you will have:

- A `tools.ts` module with a bounded tool allowlist, wired into the workflow via a new `executionMode` field.
- A classified execution pattern decision for three scenarios with explicit rationale.
- A governance design brief for the scenario your team rated highest-risk or `defer until evidence`.

---

## Format

**Task 1** is a build task: individual implementation, then pair to compare.
**Task 2** is think-pair-share: classify scenarios you have **not** seen in the deck.
**Task 3** is a governance design task: pair work, then share-out.

Total time: 45 minutes.

> **Facilitator note:** Slides use invoice / email / corpus scenarios (A–C). This lab deliberately uses different problems in a different order so classification requires criteria, not recall. Verdicts are in `<details>` blocks only — do not read them aloud until after share-out.

---

## Working Directory

Either keep working from the progress you've made so far, or, if you want to start fresh, here is a directory that should reflect your completed Module 2 endpoint at the start of this exercise:

```
governed-ai-feature-delivery/module-03-workflow-vs-agent-design/exercises/module_03_starter_app/backend
```

**Instructor solution** (completed Lab 3, Module 4 baseline):

```
governed-ai-feature-delivery/module-04-security-and-guardrails/exercises/module_04_starter_app/backend
```

To verify the baseline setup:

```bash
npm install
npm run dev
```

Test your endpoint:

```bash
curl -s -X POST http://127.0.0.1:3000/documents/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp."}'
```

You should get back a response including `status: "accepted"` with `traceId`, `promptVersion`, and `data` fields.

---

## Task 1: Add a Bounded Tool Path (15 minutes)

Your workflow currently runs in one mode: deterministic. You are going to add a second mode — `bounded_tool` — that passes the validated output through an allowlisted set of tools before returning it to the caller.

This requires changes to three files.

**Build (12 min)**

### Step 1 — Extend `types.ts`

Add `executionMode` as an optional field on `ExtractRequest`:

```typescript
executionMode?: "deterministic" | "bounded_tool";
```

### Step 2 — Create `tools.ts`

Create `src/features/document-extraction/tools.ts`.

It needs:

- A `ToolName` union type with two values: `"entity_normalizer"` and `"entity_classifier"`.
- An `ALLOWED_TOOLS` array containing only `"entity_normalizer"` — `entity_classifier` is defined but not yet permitted.
- A `runBoundedToolPath` function that takes an `ExtractedDocument` and returns:
  - `output` — the transformed document
  - `requestedTools` — the full list of tools the path would like to run
  - `allowedTools` — filtered to only those on the allowlist
  - `blockedTools` — anything requested but not allowed

The function should request both tools, filter by the allowlist, and apply only the allowed ones.

Implement `applyEntityNormalizer` — it should deduplicate and lowercase the entities array, and append `[bounded-tool: entity_normalizer]` to the summary.

Leave `applyEntityClassifier` as a stub that throws `"not implemented"` — the extension below adds this later.

### Step 3 — Wire into `workflow.ts`

After the confidence check passes and you have valid `post.data`, add a branch:

```typescript
const executionMode = input.executionMode ?? "deterministic";
let finalData = post.data;

if (executionMode === "bounded_tool") {
  const toolRun = runBoundedToolPath(post.data);
  finalData = toolRun.output;
  // log a trace event here with requestedTools, allowedTools, blockedTools
}
```

Use `logTraceEvent` to record the tool selection. Import it from `./logger`. The stage should be `"workflow"`, the event `"bounded_tool_selection"`.

Return `finalData` in the accepted response instead of `post.data`.

**Test**

Send a deterministic request — confirm behaviour is unchanged:

```json
{
  "text": "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.",
  "source": "lab"
}
```

Then send with `executionMode: "bounded_tool"`:

```json
{
  "text": "Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.",
  "source": "lab",
  "executionMode": "bounded_tool"
}
```

In the trace you should see:

```
workflow    bounded_tool_selection
             tools: ["entity_normalizer","entity_classifier"]
             blocked: ["entity_classifier"]
```

And `data.entities` should be lowercased and deduplicated. `data.summary` should end with `[bounded-tool: entity_normalizer]`.

**Pair (3 min)**

Compare implementations. Did your `requestedTools` list match? Did you log the trace event?

More importantly: you just created an allowlist with one entry and one intentionally blocked tool. What process should govern adding `entity_classifier` to `ALLOWED_TOOLS` in a production codebase?

**Extension — if time allows**

Implement `applyEntityClassifier` in `tools.ts`. It should prefix each entity string based on its content:

- Contains `"invoice"` or `"number"` → prefix `"ref:"`
- Contains `"amount"` or `"due"` or `"total"` → prefix `"financial:"`
- Anything else → prefix `"entity:"`

Then add `"entity_classifier"` to `ALLOWED_TOOLS`. Send the bounded tool request again and confirm both tools appear in `allowedTools` and the entity prefixes appear in the response.

---

## Task 2: Classify New Scenarios (15 minutes)

These scenarios are **not** the slide examples. They are listed in deliberate order — do not assume Scenario 1 is the “easy workflow” case.

For each scenario, choose one pattern:

- deterministic workflow
- bounded tool pattern
- agentic pattern

Also mark each as: `implement now` | `defer until evidence` | `not appropriate`

**Your task (individual, 5 min):**

- Write your classification and **two criteria-based reasons** per scenario (use the decision questions from the deck, not gut feel).
- Write **one condition** that would change your answer for each scenario.
- Note which scenario was hardest — you will need it for Task 3.

**Pair (5 min)**

Compare classifications. You must find at least one disagreement. Argue using auditability, eval repeatability, and blast radius — not “agents are smarter.”

**Share (5 min)**

One contested scenario per pair to the room. Facilitator captures disagreements before opening the answer key.

### Scenario 1 — Fraud alert investigation

A fraud analyst receives an alert ID. The system must pull transaction history, account metadata, and watchlist hits from different internal systems, decide what to check next based on what it finds, and produce a narrative summary with recommended actions. Investigation paths vary widely by alert type.

### Scenario 2 — Commercial lease abstraction

Legal operations uploads standard commercial lease PDFs. The system extracts exactly fourteen named fields (rent, term, break clause, guarantor, etc.) into a fixed JSON schema for portfolio reporting. Document layout is standardized; no external calls.

### Scenario 3 — Sales follow-up copilot

Inside the CRM, a rep asks for help on an opportunity. The system drafts a follow-up email from deal notes, checks calendar availability for proposed meeting times, and logs a suggested activity — but **does not send** email or create meetings without explicit rep approval.

---

## Task 3: Governance Design (12 minutes)

Split work by what your pair actually decided in Task 2 — not by scenario number.

**Part A — Bounded pattern (5 min pair)**

For the scenario **you** classified as bounded tools (many pairs will pick Scenario 3; some may argue Scenario 1 with a fixed playbook):

- Tool allowlist: which tools are permitted?
- One tool you **exclude** on purpose and why
- Parameter constraints (types, size limits, allowed enums)
- Timeout/retry policy per tool
- Which actions require human approval before execution

**Part B — Agentic or defer (5 min pair)**

For the scenario **you** classified as agentic or marked `defer until evidence` (often Scenario 1):

- What evidence would you need before production? (eval metric, shadow period, etc.)
- Mandatory trace fields for every step in a dynamic chain
- Fallback triggers and a **stable** fallback response shape for the UI
- One approval checkpoint before a high-risk action
- MCP vs direct internal API: does switching protocol change the **threat model**? (Yes/no + one sentence why)

**Share (2 min)**

One finding per pair: what was the hardest governance question — and would your Part A allowlist from the bounded scenario apply unchanged to the agentic one?

---

## Definition of Done

- `tools.ts` exists with `ALLOWED_TOOLS`, `runBoundedToolPath`, and `applyEntityNormalizer` implemented.
- `ExtractRequest` in `types.ts` includes `executionMode`.
- Sending `executionMode: "bounded_tool"` produces a `bounded_tool_selection` trace event with `allowedTools` and `blockedTools`.
- The accepted response `data.entities` is transformed when bounded tool mode is active.
- All three **lab** scenarios (1–3 above) are classified with criteria-based rationale and an implement/defer/not mark.
- Part A documents tool boundaries for your bounded scenario; Part B documents enablement, trace, and fallback for your agentic/defer scenario.

---

## Facilitator Debrief Prompts

1. Did anyone map Scenario 1 → workflow because “we just built a workflow”? How did Task 1 code experience bias classifications?
2. Which scenario had the most split votes — and which decision criterion broke the tie?
3. How different was Part A’s allowlist from what you would allow in Part B?
4. What will you standardize before the next AI feature ships?

---

## Bridge to Module 4

You have made execution pattern decisions and defined tool boundaries.

Module 4 asks what happens when those boundaries are attacked — the same allowlist you just built is also an attack surface, and the same trace fields you defined are what an auditor looks for after an incident.

Bring your governance brief. Module 4 maps it against the threat model.
