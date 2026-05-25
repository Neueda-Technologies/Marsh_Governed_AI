# Lab 5: Build a Reviewable AI Result Panel

## Objective

You will implement the display components that make governed AI output safe to review and act on. The hook, API layer, types, and review action panel are already wired. Your job is the rendering — the parts that turn backend response contracts into interfaces reviewers can actually use.

By the end you will have:

- A structured accepted result display with confidence bands.
- A denied result panel that shows the reason without echoing sensitive content.
- A working transition telemetry panel that makes the state machine visible.

---

## Format

**Tasks 1 and 2** are build tasks: individual implementation, then pair to compare.
**Task 3** is a think-pair-share: classify before you build.
**Extension** is optional and individual.

Total time: 45 minutes.

---

## Working Directory

```
./module_05_starter/frontend
```

**Note:** Make sure the backend server is running in another terminal before starting the frontend.

In one terminal, start the backend (if not already running):

```bash
cd ../backend
npm install
npm run dev
```

In a separate terminal, start the frontend dev server and confirm the app loads:

```bash
npm install
npm run dev
```

Open the app in your browser. You should see the form and sample input buttons. Try submitting the "Pass sample: invoice" input — the app will throw because `AcceptedResultDetails` is not yet implemented. That is expected.

---

## Task 1: Implement the Accepted Result Display (15 minutes)

Open `src/components/AcceptedResultDetails.tsx`.

This component receives a `WorkflowAcceptedResponse` and renders the extracted fields. Right now it throws. Your job is to implement it.

**Build (12 min)**

The component should display:

- Document type
- Confidence — but not as a raw decimal. Map it to a band with a label:
  - `≥ 0.90` → High confidence
  - `0.75–0.89` → Medium confidence — review carefully
  - `< 0.75` → Low confidence — check all fields
- Entities — as a list, not a comma-separated string
- Summary — if present
- Trace ID — visible but not prominent, for audit reference

The confidence band is the key design decision here. A reviewer seeing `0.87` has to decide what that means. A reviewer seeing `Medium confidence — review carefully` knows what to do.

**Test**

Click "Pass sample: invoice" and submit. You should see a structured result panel with a confidence band label rather than a raw number.

Then click "Pass sample: contract" and confirm the same structure renders correctly for a different document type.

**Pair (3 min)**

Compare your confidence band thresholds. Did you draw the lines in the same places? What happens at exactly `0.75` or `0.90` — which band does it fall into, and does that matter?

More importantly: who defined these thresholds in your Module 2 and 4 work, and where did that value live?

---

## Task 2: Implement the Denied Result Panel (8 minutes)

Open `src/components/DeniedResultPanel.tsx`.

This component receives a `WorkflowDeniedResponse` and renders the denial. It throws right now.

**Build (6 min)**

The panel should:

- Make it clear the request was denied — not just that an error occurred.
- Show the deny reason code.
- Not echo any of the input text back. The input may contain the sensitive content that triggered the denial.
- Not offer any reviewer actions — denial at this boundary is final.

**Test**

Click "Fail sample: deny" (SSN and credit card) and submit. You should see the denied panel with a reason code and no input content reflected back.

Then click "Fail sample: policy review" (internal-only) and submit. This one returns `needs_review` not `denied` — confirm the review panel renders correctly instead.

**Pair (2 min)**

Compare your panels. Did you show the deny reason to the user, or just a generic "denied" message?

This is the question from the demo slides: in a regulated environment, should the deny reason be visible to the end user or only to an admin reviewer? There is no single right answer — but you should be able to defend whichever choice you made.

---

## Task 3: The State Machine as an Audit Control (10 minutes)

**Think (3 min)**

Open `src/hooks/useDocumentExtractionDemo.ts`. Read the `transition` function and how it builds the `transitions` array.

Then open `src/components/TransitionTelemetry.tsx` — it is currently a stub.

Before implementing it, answer these questions in your notes:

- What information does each transition record carry?
- Who would query this data in a production system, and when?
- Is this frontend telemetry, backend telemetry, or both — and does the distinction matter?
- What would you need to add to make this data useful for a post-incident review?

**Pair (3 min)**

Compare answers. Focus on the third question — frontend vs backend telemetry. If the backend already has a trace, what additional value does frontend state transition data provide?

**Build (4 min)**

Implement `TransitionTelemetry`. It receives the `transitions` array from the hook and should display each record showing: the from state, the to state, the triggering event, and the timestamp.

Keep it minimal — this is a diagnostic tool, not a primary UI element.

**Test**

Submit several requests using different sample inputs. Watch the telemetry panel populate. Confirm that `needs_review` and `denied` transitions appear correctly alongside `accepted`.

---

## Extension: Confidence Band as a Shared Utility (if time allows)

The confidence band logic you wrote in `AcceptedResultDetails` is a policy decision — the thresholds and labels are things that could change, and they should be consistent across any component that displays confidence.

Extract the band calculation into a shared utility function in `src/utils/confidence.ts`. The function should take a confidence number and return a band label and a severity level (`high`, `medium`, `low`).

Update `AcceptedResultDetails` to use it.

**Pair question:** if the confidence thresholds changed — say the medium/high boundary moved from `0.90` to `0.85` — how many files would you need to update before and after this refactor?

---

## Definition of Done

- "Pass sample: invoice" returns a structured panel with a confidence band label, entity list, and trace ID.
- "Fail sample: deny" returns a denied panel with a reason code and no input content.
- "Fail sample: policy review" returns the needs_review panel with reviewer actions available.
- The transition telemetry panel shows state changes for all three paths.
- You can explain why the confidence band is a governance decision, not just a display preference.
- You can defend your choice about whether to show the deny reason to end users.

---

## Bridge to Module 6

Your UI now makes three backend outcomes visible and actionable.

Module 6 asks how you know the backend is producing the right outcomes in the first place — not just structurally valid ones. Bring your confidence threshold decisions. In Module 6 you will define what "correct extraction" looks like using a golden dataset, and that threshold will need a measurable basis rather than an educated guess.