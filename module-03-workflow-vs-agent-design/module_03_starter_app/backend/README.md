# Module 3 starter — backend

Baseline for **Lab 3: Choose the Right Execution Pattern**. This is the completed **Lab 2** governed workflow endpoint—use it as your reference implementation when classifying scenarios and defining tool boundaries.

## What is already here

- Nest bootstrap, CORS, runtime profile config (`APP_PROFILE=dev` uses mock LLM)
- `GET /documents/health` and `POST /documents/extract`
- Thin controller → workflow orchestration → prompt version → pre/post validation → confidence threshold routing
- Mock LLM gateway with `mockScenarios` (`pass`, `lowConfidence`, `policyBlocked`)

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

Extended implementation (bounded tools, policy gates, evals): `../../../demo-app/backend`
