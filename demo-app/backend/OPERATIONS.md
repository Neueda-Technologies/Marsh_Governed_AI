# Operational Safety Runbook

This runbook supports Module 07 demonstrations for rollback and kill-switch controls.

## Kill switch (feature disable)

Set:

```bash
FEATURE_DOCUMENT_EXTRACTION_ENABLED=false
```

Then restart backend:

```bash
npm run dev
```

Expected behavior:
- `POST /documents/extract` returns:
  - `status: "denied"`
  - `reason: "feature_disabled"`

## Rollback guidance (fast path)

Use config rollback to return to previously known-safe settings:

1. Revert `MODEL_IDENTIFIER` to prior approved model.
2. Revert `CONFIDENCE_THRESHOLD` to prior approved threshold.
3. Keep `FEATURE_DOCUMENT_EXTRACTION_ENABLED=false` during incident containment.
4. Re-enable feature only after release-gate passes:

```bash
npm run release-gate
```

## Demo script (<5 minutes)

Run:

```bash
npm run ops:demo-safety
```

This prints:
1. Feature ON response
2. Feature OFF response (kill switch active)

Use this output live to show safe disable behavior.
