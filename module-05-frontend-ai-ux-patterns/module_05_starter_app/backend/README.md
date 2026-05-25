# Module 5 starter — backend (Module 4 complete)

Completed **Lab 4** guardrails on the Module 3 governed workflow. Baseline for **Module 5** frontend UX exercises.

## What is here

- Nest bootstrap, CORS, runtime profile config (`APP_PROFILE=dev` uses mock LLM)
- `GET /documents/health`, `POST /documents/extract`
- `POST /documents/review-action`, `POST /documents/review-actions`
- Thin controller → workflow orchestration → prompt version → pre/post validation → **post-call policy** → confidence threshold routing
- **`executionMode`**: `deterministic` (default) or `bounded_tool`
- Guardrail outcomes: `accepted`, `needs_review`, `denied` with reasons `hostile_input`, `policy_blocked`, etc.
- Trace events: `pre_validation_result`, `post_validation_result`, `post_policy_validation_result`, `deny_decision`, `fallback_decision`, `accepted_decision`

## Guardrail checks

| Input / condition | Status | Reason |
|-------------------|--------|--------|
| SSN or card number in text | `denied` | `hostile_input` |
| `internal-only`, `password`, `private key` in text | `needs_review` | `policy_blocked` |
| Instruction-like / oversized `summary` or >20 entities | `needs_review` | `policy_blocked` |
| Schema invalid | `needs_review` | `validation_failed` |
| Confidence below threshold | `needs_review` | `low_confidence` |

## Bounded-tool mode

```bash
curl -s -X POST http://localhost:3000/documents/extract \
  -H 'Content-Type: application/json' \
  -d '{"text":"Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.","source":"lab","executionMode":"bounded_tool"}'
```

## Mock scenarios

Prefix document `text` to drive the mock gateway:

| Prefix in `text` | Mock output | Typical result |
|------------------|-------------|----------------|
| *(none)* | `pass` (confidence 0.92) | `accepted` |
| `POLICY:` | `policyBlocked` (invalid `documentType`) | `needs_review` (`validation_failed`) |
| `FAIL:` | `lowConfidence` (confidence 0.42) | `needs_review` (`low_confidence`) |

## Run

```bash
cp .env-example .env
npm install
npm run dev
```

API default: **http://localhost:3000**

## Reference (instructors)

Extended implementation: `../../../demo-app/backend`
