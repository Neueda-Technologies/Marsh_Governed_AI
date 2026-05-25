# Module 3 solution — backend

Completed **Lab 3** governed workflow. Baseline for **Module 4** guardrails exercises.

## What is here

- Nest bootstrap, CORS, runtime profile config (`APP_PROFILE=dev` uses mock LLM)
- `GET /documents/health` and `POST /documents/extract`
- Thin controller → workflow orchestration → prompt version → pre/post validation → confidence threshold routing
- **`executionMode`**: `deterministic` (default) or `bounded_tool` (allowlisted post-processing via `tools.ts`)
- Mock LLM gateway with `mockScenarios` (`pass`, `lowConfidence`, `policyBlocked`)

## Bounded-tool mode

```bash
curl -s -X POST http://localhost:3000/documents/extract \
  -H 'Content-Type: application/json' \
  -d '{"text":"Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.","source":"lab","executionMode":"bounded_tool"}'
```

Server logs include a `bounded_tool_selection` event with `requestedTools`, `allowedTools`, and `blockedTools`. Response `data.entities` are lowercased and deduplicated; `data.summary` gains `[bounded-tool: entity_normalizer]`.

## Mock scenarios

Prefix document `text` to drive the mock gateway:

| Prefix in `text` | Mock output | Typical result |
|------------------|-------------|----------------|
| *(none)* | `pass` (confidence 0.92) | `accepted` |
| `POLICY:` | `policyBlocked` (invalid `documentType`) | `needs_review` (`validation_failed`) |
| `FAIL:` | `lowConfidence` (confidence 0.42) | `needs_review` (`low_confidence`) |

Example:

```bash
curl -s -X POST http://localhost:3000/documents/extract \
  -H 'Content-Type: application/json' \
  -d '{"text":"FAIL: Invoice #12345 from ACME Corp with amount due of 400 USD."}'
```

See `src/features/document-extraction/mockScenarios.ts`.

## Run

```bash
cp .env-example .env
npm install
npm run dev
```

API default: **http://localhost:3000**

## Reference (instructors)

Extended implementation (policy gates, review API, evals): `../../../demo-app/backend`
