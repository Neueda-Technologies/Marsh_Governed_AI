# Demo App Backend (Module 2 Scaffold)

This backend scaffold mirrors the Module 2 lab architecture:

- Thin controller
- Workflow orchestration service
- Prompt assets in code (versioned)
- Pre and post validation gates
- Gateway-mediated model call with trace metadata
- Deterministic accepted/fallback response contract

It can also run in a Mastra-managed mode to align with internal team standards.

## Endpoint contract

`POST /documents/extract`

Request:

```json
{
  "text": "document text",
  "source": "upload",
  "traceId": "optional-trace-id"
}
```

Response:

```json
{
  "status": "accepted",
  "traceId": "trc_xxx",
  "promptVersion": "extract-v1",
  "modelIdentifier": "gpt-4o-mini",
  "data": {
    "documentType": "invoice",
    "confidence": 0.92,
    "entities": ["amount", "invoice_number"]
  }
}
```

or fallback:

```json
{
  "status": "needs_review",
  "traceId": "trc_xxx",
  "promptVersion": "extract-v1",
  "modelIdentifier": "gpt-4o-mini",
  "reason": "validation_failed"
}
```

## Runtime profiles

Set `APP_PROFILE` to choose defaults:

| Profile | LLM mode default | Mastra runtime default | Model identifier default | Confidence threshold default |
| --- | --- | --- | --- |
| `dev` | `mock` | `false` | `gpt-4o-mini` | `0.8` |
| `stage` | `mock` | `true` | `gpt-4o-mini` | `0.85` |
| `prod` | `openai` | `true` | `gpt-4o-mini` | `0.9` |

Optional explicit overrides (for demos/troubleshooting):
- `LLM_MODE=mock|openai`
- `USE_MASTRA_RUNTIME=true|false`
- `MODEL_IDENTIFIER=<model-name>`
- `CONFIDENCE_THRESHOLD=<0..1>`
- `DEBUG_LLM_LOGS=true|false`
- `OPENAI_BASE_URL=<proxy-or-provider-url>`

## Notes

- This is intentionally lightweight for training use.
- Default local profile is `dev`, which uses deterministic mock behavior.
- `stage` and `prod` defaults make Mastra runtime behavior explicit.
- The Mastra adapter currently delegates to the same gateway logic; this is the extension point to plug in real Mastra workflows/agents/tools.

## LLM modes and profiles

- `LLM_MODE=mock`: deterministic local demo behavior.
- `LLM_MODE=openai`: real LLM call through OpenAI Chat Completions API.

Required for OpenAI mode:

```bash
export APP_PROFILE=prod
export OPENAI_API_KEY=your_key_here
# Optional for gateway/proxy setups:
# export OPENAI_BASE_URL=https://your-proxy/v1
```

## Run as NestJS HTTP endpoint

```bash
npm run build
npm run start:nest
```

Dev mode:

```bash
npm run dev:nest
```

`npm run dev` is aliased to the same Nest server startup for convenience.

Stage-like mode (Mastra enabled, mock gateway):

```bash
APP_PROFILE=stage npm run dev:nest
```

Prod-like mode (Mastra + OpenAI defaults):

```bash
APP_PROFILE=prod OPENAI_API_KEY=your_key_here npm run dev:nest
```

Run with real OpenAI:

```bash
LLM_MODE=openai OPENAI_API_KEY=your_key_here npm run dev:nest
```

Health check:

```bash
curl http://localhost:3000/documents/health
```

Extraction endpoint:

```bash
curl -X POST http://localhost:3000/documents/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Invoice #INV-1023 due next Friday for 1250 EUR.",
    "source": "upload"
  }'
```

## Evaluation harness (Module 06)

Starter eval dataset:
- `evals/document-extraction.dataset.json`

Run the eval suite:

```bash
npm run eval:document-extraction
```

Output artifact:
- `evals/artifacts/document-extraction-summary.json`

The command exits non-zero if any eval case fails.

Generate release gate report (quality + policy + trace checks):

```bash
npm run release-gate
```

Release artifacts:
- `evals/artifacts/release-gate-report.md` (human-readable)
- `evals/artifacts/release-gate-report.json` (structured)

Generate version bundle manifest:

```bash
npm run version-bundle
```

Version bundle artifacts:
- `evals/artifacts/version-bundle-manifest.json`
- `evals/version-bundle-manifest.schema.json`

## Operational safety

See `OPERATIONS.md` for:
- kill-switch operation (`FEATURE_DOCUMENT_EXTRACTION_ENABLED`)
- rollback steps for model/threshold config
- a 5-minute demo script (`npm run ops:demo-safety`)
