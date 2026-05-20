# Lab 5: Build a Reviewable AI Result Panel

## Objective
In this lab, you'll implement a frontend AI component that makes model output safe to review and act on. You’ll build structured rendering, confidence/evidence cues, and robust state handling for streaming and fallback responses.

You will:
1. Render structured AI output with field-level status.
2. Add confidence and evidence indicators.
3. Implement edit-before-save review flow.
4. Handle streaming and fallback states deterministically.
5. Produce a reusable UI pattern for governed AI features.

This lab builds on a starter baseline, not a full rebuild. Bring forward:
- Module 2: backend response contract and trace references
- Module 3: execution-pattern reasoning
- Module 4: guardrail outcomes (`accepted`, `needs_review`, `denied`)

---

## Scenario: Extraction Review Interface

You are building a TanStack UI component for document-processing results.

The component must:
- Display structured extracted fields.
- Surface confidence and evidence context.
- Support user edits before committing.
- Handle `loading`, `accepted`, `needs_review`, `denied`, and `error` states.

This lab connects backend guardrails to safe user interaction patterns.

## Working directory

Use: `governed-ai-feature-delivery/demo-app-starter/module_5_starter/frontend`

Reference implementation (instructor only): `governed-ai-feature-delivery/demo-app/frontend`

---

## Task 1: Render Structured Result Card

Build the baseline review panel.

**Your task:**
- Render typed fields from extraction result object.
- Show status per field (accepted, uncertain, missing).
- Keep layout stable across result states.
- Avoid raw unstructured text as primary output.

**Hints:**
- Use explicit field components instead of generic text blocks.
- Keep response contract close to backend schema.
- Display trace id/reference for advanced inspection.

<details>
<summary>Possible Solution for Task 1</summary>

```tsx
<ResultCard>
  <Field name="documentType" value={data.documentType} status="accepted" />
  <Field name="amountDue" value={data.amountDue} status="uncertain" />
  <Field name="invoiceNumber" value={data.invoiceNumber} status="accepted" />
</ResultCard>
```

</details>

---

## Task 2: Add Confidence and Evidence Cues

Help users understand reliability before taking action.

**Your task:**
- Show confidence per critical field.
- Display evidence snippet/source context for each key value.
- Use clear uncertainty visuals for low-confidence outputs.
- Prevent ambiguous values from appearing "final."

**Hints:**
- Confidence bands are often clearer than raw decimals.
- Evidence should be concise and directly relevant.
- Keep confidence language domain-appropriate.

<details>
<summary>Possible Solution for Task 2</summary>

```tsx
<ConfidenceBadge level="medium" />
<EvidenceSnippet source="page_2" text="Invoice Total: EUR 1,250" />
```

</details>

---

## Task 3: Review Flow + Streaming/Fallback States

Complete the governed interaction flow.

**Your task:**
- Add edit-before-save actions for uncertain fields.
- Require confirmation for high-impact commit.
- Implement explicit state transitions for baseline request/response flow.
- Implement fallback UI for `needs_review`, `denied`, and `error`.
- Optional extension: map same state model to SSE (`loading` -> `partial` -> terminal).

**Hints:**
- Keep state transitions explicit and deterministic.
- Partial output should not auto-commit.
- Use stable fallback UI copy and actions across screens.
- Baseline app does not require full SSE implementation in this module.

<details>
<summary>Possible Solution for Task 3</summary>

```ts
switch (result.status) {
  case "loading":
  case "partial":
    return <ProgressiveResultView />;
  case "needs_review":
    return <ReviewRequiredPanel />;
  case "accepted":
    return <EditableResultPanel />;
  default:
    return <ErrorPanel />;
}
```

</details>

---

## Example Output

```text
State: needs_review
Fields shown: 8
Low confidence fields: 2
Evidence snippets shown: 3
Edit-before-save enabled: yes
Commit gated: yes
```

---

## Key Concepts Demonstrated

- **Structured AI UX**: task-focused components over generic chat output.
- **Uncertainty communication**: confidence + evidence working together.
- **Review-first interaction**: user confirmation before high-impact actions.
- **State reliability**: deterministic handling for streaming and fallback.

---

## Definition of Done

- Structured result card renders with field-level status.
- Confidence and evidence are visible for key fields.
- Uncertain fields support edit-before-save.
- Baseline state transitions and fallback states are implemented and testable.
- UI behavior aligns with backend status contract.
- Team can explain how this state model extends to streaming without breaking governance controls.

---

## Facilitator Debrief Prompts

1. Which UI element most improved confidence in decisions?
2. Where could users still misinterpret uncertain output?
3. Which fallback state was hardest to design clearly?
4. What should be standardized as a shared component next?

---

## Next Steps

In Module 6, you will define evaluation criteria for these UI and workflow behaviors so quality can be measured and gated before release.
