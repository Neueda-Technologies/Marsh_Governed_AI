# Module 2 starter — backend

Baseline for **Lab 2: Build a Structured Workflow Endpoint**. The server runs; extraction is yours to implement in `src/features/document-extraction/`.

## What is already here

- Nest bootstrap, CORS, runtime profile config (`APP_PROFILE=dev` uses mock LLM)
- `GET /documents/health`
- Shared types, trace logger, and **mock** LLM gateway with `mockScenarios` (`pass`, `lowConfidence`, `policyBlocked`) — use in Task 2; do not call the provider from the controller
- Stub modules with `Lab 2 Task N` comments for: `controller.ts`, `workflow.ts`, `prompt.ts`, `validators.ts`

## What you implement (lab tasks)

1. Layered endpoint: thin controller, workflow orchestration, prompt version, validator stubs → wire `POST /documents/extract` in `src/nest/documents.controller.ts`
2. Gateway invoke + trace metadata in the workflow
3. Pre/post validation and stable `accepted` / `needs_review` responses

## Mock scenarios (fallback testing)

After Task 3, prefix document `text` to drive the mock gateway:

| Prefix in `text` | Mock output | Typical result after Task 3 |
|------------------|-------------|------------------------------|
| *(none)* | `pass` (confidence 0.92) | `accepted` |
| `POLICY:` | `policyBlocked` (invalid `documentType`) | `needs_review` (`validation_failed`) |
| `FAIL:` | `lowConfidence` (confidence 0.42) | `needs_review` once workflow applies a confidence threshold (see reference `workflow.ts`); valid schema alone stays `accepted` |

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

Finished implementation: `../../demo-app/backend`
