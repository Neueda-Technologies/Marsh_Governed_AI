# Lab 7: Define AI Release Readiness Criteria

## Objective

You will produce a release-readiness pack for the document extraction feature — the complete set of evidence and decisions a team would need to ship an AI feature safely in a regulated environment.

This lab uses artefacts you have already produced: the version bundle manifest and release gate report from Module 6, the trace contract from Modules 2–4, and the UI state model from Module 5. The new work is making deployment decisions and testing the runtime controls.

By the end you will have:

- A hands-on demonstration of the kill switch and its governance implications.
- A gate policy with hard and soft criteria, each with a named owner.
- A go/no-go recommendation document that connects every prior artefact.

---

## Format

**Task 1** is a build task: run the kill switch demo and observe what versioning captures.
**Task 2** is think-pair-share: decide which gates block and which monitor.
**Task 3** is a build task: produce the release-readiness pack.

Total time: 45 minutes.

---

## Working Directory

```
/module_07_starter/backend
```

This is the Module 6 end state with evals intact. Confirm you have the artifacts from Module 6 before starting:

```bash
ls evals/artifacts/
```

You should see `document-extraction-summary.json`, `release-gate-report.md`, and `version-bundle-manifest.json`. If any are missing, rerun:

```bash
npx tsx src/evals/generateVersionBundleManifest.ts
npx tsx src/evals/generateReleaseGateReport.ts
```

---

## Task 1: Version a Config Change and Observe the Manifest (12 minutes)

**Build (10 min)**

The scenario: your team wants to tighten the confidence threshold before the next release — from `0.80` to `0.85`. You need to verify this counts as a versioned change.

Step 1 — open `evals/artifacts/version-bundle-manifest.json`. Note the current value of `runtimeConfig.confidenceThreshold` and `sourceHashes.runtimeProfileFile`.

Step 2 — update the confidence threshold in your `.env`:

```
CONFIDENCE_THRESHOLD=0.85
```

Step 3 — regenerate the manifest:

```bash
npm run generate-manifest
```

Step 4 — open the manifest again. What changed? What stayed the same?

Step 5 — rerun the eval suite with the new threshold:

```bash
npx tsx src/evals/generateReleaseGateReport.ts
```

Does the report still pass? If any cases now fail — which ones, and why?

Step 6 — run the kill switch demo:

```bash
npx tsx src/ops/demoKillSwitchAndRollback.ts
```

Point at the two responses. The `denied` response from the kill switch has the same envelope shape as any other denied response — the frontend contract holds without a code change or redeployment.

**Pair (2 min)**

Compare manifest diffs. Did you get the same hash change? 

More importantly: the manifest captured the threshold change, but it didn't capture a change to the `.env` value directly — it captures the `runtimeProfileFile` hash. If someone changed `CONFIDENCE_THRESHOLD` in `.env` without touching `runtimeProfile.ts`, would the manifest detect it?

That's a gap. Note it — it becomes a recommendation in Task 3.

---

## Task 2: Define the Gate Policy (12 minutes)

You have three gates from Module 6: quality, policy, and trace completeness. You need to decide which are hard blocks and which are monitor-only.

**Think (4 min)**

For each gate, answer:

- If this gate fails, can the feature ship? Under what circumstances, if any?
- Who owns this gate — who is the named person who signs off if it fails?
- What evidence must be attached to a gate failure for it to be escalated rather than blocked?

Then define two additional soft gates that aren't in the current report but matter for a regulated environment:

- One operational gate (latency, cost, or error rate)
- One governance gate (something that matters for audit or compliance evidence, not just quality)

**Pair (4 min)**

Compare gate policies. The most contested decision is usually the trace completeness gate — some teams treat it as advisory, others as a hard block. Argue both sides.

Then: does your team have named owners for each gate right now? If not, what changes before you can ship?

**Share (4 min)**

One gate definition per pair to the room — specifically, the governance gate you added. What does it cover and why does it matter for a regulated environment?

---

## Task 3: Produce the Release-Readiness Pack (18 minutes)

**Build (14 min)**

Create a file at `evals/artifacts/release-readiness-pack.md`.

The pack should be readable by a non-engineer — a delivery manager, a compliance officer, or a senior stakeholder. It needs to answer: is this feature safe to release, and how do we know?

Structure it as follows:

**Release bundle**

State the version identifiers for this release:
- Prompt version (from the manifest)
- Model identifier (from the manifest)
- Eval dataset SHA (from the manifest)
- Confidence threshold (from the manifest)
- Source file hashes for prompt, workflow, and validators

**Gate results**

For each gate from Task 2, state: the gate name, the threshold, the result from the release gate report, whether it is a hard block or soft monitor, and the named owner.

**Runtime controls**

Define the three controls and their triggers:

- Kill switch: what condition triggers it, who can activate it, what the response shape is
- Fallback: what per-request conditions route to `needs_review`, what the user sees
- Rollback: what sustained condition triggers a version revert, what the previous bundle was

**Known gaps**

Note at least two things your current build does not yet cover — things you would add before the next release cycle. Include the manifest gap from Task 1 if you found it.

**Go/no-go recommendation**

State your decision. Back it with specific evidence from the gate results. Name the release owner. Note one condition that would change the recommendation.

**Pair (4 min)**

Exchange packs. Read your partner's recommendation. Do you agree with the decision? Is the evidence specific enough that a compliance officer could reproduce the reasoning without asking questions?

---

## Definition of Done

- The manifest diff from Task 1 is understood — you can explain what the threshold change did and didn't capture.
- The gate policy has at least five gates (three from Module 6, two new), each with a threshold, hard/soft designation, and named owner.
- `evals/artifacts/release-readiness-pack.md` exists and covers all five sections.
- The go/no-go recommendation cites specific gate results, not general confidence.
- You can explain the difference between a kill switch, a fallback, and a rollback to a non-engineer.

---

## Share-Out

Two questions to the room:

- Which gate is hardest to operationalise in your current pipeline — and what would it take to automate it?
- What single control, if it had been in place, would have prevented the most significant AI incident your team has experienced or heard about?

---

## Bridge to Module 8

Your release-readiness pack is the deliverable that connects every decision from Module 1 to a shipping recommendation with evidence.

If Module 8 follows: bring this pack. Your first task is to identify the one gap in your current build that carries the most release risk — and the pack's known gaps section is where to start.

If this is the final module: the pack is the artefact. It represents a governed delivery discipline — not a one-off document, but a repeatable process your team can apply to every AI feature you ship.