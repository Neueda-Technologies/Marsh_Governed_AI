# Lab 8: Final Team Build and Review

## Objective

You will integrate the work from all seven modules into a complete, defensible release — demonstrate it, defend it, and decide what your team does with it after today.

This is not a build lab. The building is done. This is an integration and readiness lab — finding the gaps, closing the ones you can, documenting the ones you can't, and making a release decision you can stand behind.

---

## Format

**Task 1** is preparation: identify and close your gaps before the demo.
**Task 2** is the demo: show the five required things.
**Task 3** is adoption planning: decide what this course produces for your team beyond today.

Total time: 60 minutes (adjust to session length).

---

## Working Directory

Your full stack from Modules 2–7. You need:

- Backend running with `npm run start:dev`
- Frontend running and connected to the backend
- `evals/artifacts/` populated from Module 6
- `evals/artifacts/release-readiness-pack.md` from Module 7

If any of these are missing, get them in place before starting Task 1.

---

## Task 1: Integration Check and Gap Closure (20 minutes)

Before the demo, verify that the full stack actually works together — not each layer in isolation.

**Work through this checklist individually (10 min)**

Run the backend. Open the frontend. Submit the "Pass sample: invoice" input.

Confirm:

- The accepted result renders with confidence band, entities, and trace ID visible
- The trace in the terminal shows `controller → workflow → gateway → workflow → accepted_decision` in sequence
- The `promptVersion` in the UI matches what the trace shows

Now submit the "Fail sample: deny" input.

Confirm:

- The denied panel renders with a reason code and no sensitive content echoed
- The trace shows the pre-call validation firing before the gateway is invoked
- The response shape is consistent with what your eval suite expects

Now open `evals/artifacts/release-readiness-pack.md`.

Read your go/no-go recommendation. Does it still hold given what you just saw? If anything is inconsistent, update the pack before the demo.

**Pair: find the gap (10 min)**

Swap stacks with your partner. Run their full flow. Look for:

- Any state that produces an unexpected UI rendering
- Any trace missing `promptVersion` or `modelIdentifier`
- Any eval case that would now fail given what you saw in the live app
- Any gate in the release-readiness pack that doesn't have a named owner

Feed back one gap to your partner. They have 5 minutes to either close it or document it as a known risk in the pack.

---

## Task 2: The Demo (20 minutes)

Each pair presents to the room. 5–7 minutes per pair.

**You must show all five:**

**1. End-to-end accepted path**
Submit a request and walk the trace from `controller → request_received` to `workflow → accepted_decision`. Point at the `promptVersion` and `modelIdentifier` in the trace — that is your provenance evidence.

**2. A failure path**
Show one of: pre-call denial, post-call validation failure, or low confidence routing. The trace must show the failure stage clearly. The UI must render the correct panel for the status.

**3. Eval evidence**
Open `release-gate-report.md`. State the three gate results. If any gate failed during Module 6 — what did you change, and did you rerun the suite?

**4. Trace evidence**
Show a complete trace — one where `traceId`, `promptVersion`, and `modelIdentifier` are all present. Point at them explicitly. An auditor should be able to answer "which prompt version produced this output" from the trace alone.

**5. Go/no-go recommendation**
State your decision. Cite at least two specific gate results. Name the release owner. State one condition that would change the recommendation.

**Room: while watching each demo, note:**

- Which of the five elements was least convincing?
- What would you need to see before approving this for production in your environment?

One piece of feedback per demo, shared after each presentation.

---

## Task 3: Adoption Planning (15 minutes)

The demo proves the pattern works in a training environment. Adoption planning is what determines whether it works in yours.

**Think (4 min)**

Answer these four questions for your real team context:

1. Which pattern from this course would have the most immediate impact if adopted next sprint — and what would it take to introduce it?
2. Which pattern requires stakeholder alignment before it can be adopted — who specifically, and what is the conversation?
3. What is the one thing your current team delivery process does that directly conflicts with what you've learned here?
4. Who owns AI feature governance on your team after today — and if the answer is "nobody yet", what does that mean for the next feature you ship?

**Pair (5 min)**

Compare answers. Focus on question 3 — the conflict. That is the real adoption blocker, and naming it is more useful than listing what you want to do.

**Share (6 min)**

One adoption decision per pair to the room:

- What you're committing to doing differently
- What the first concrete step is
- Who owns it

If you can't name a concrete first step and an owner, the commitment isn't real yet.

---

## Definition of Done

- Full stack runs end-to-end with consistent behaviour across the three status paths.
- The demo covers all five required elements.
- `evals/artifacts/release-readiness-pack.md` is consistent with what the live demo showed.
- At least one gap identified in Task 1 is either closed or documented with a named owner.
- Each team member leaves with one named adoption commitment and a concrete first step.

---

## Course Close

You leave with three things.

**A pattern set.** Governed workflow, layered guardrails, structured UX, eval suite, release controls. These are reusable across every AI feature you ship. The course scenario was document extraction — the patterns apply to any feature where AI output reaches a user in a regulated environment.

**A known gap list.** The things your current build doesn't cover yet. That list is not a sign of failure — it is your next sprint's input. The teams that improve fastest are the ones that are honest about their gaps.

**An adoption commitment.** One named thing, one owner, one first step. That is what turns training into production impact.

> The patterns are the asset. Not the prototype.