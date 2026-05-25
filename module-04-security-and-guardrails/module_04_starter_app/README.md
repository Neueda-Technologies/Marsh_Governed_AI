# Module 3 solution — Module 4 baseline

Completed **Lab 3: Choose the Right Execution Pattern** checkpoint. Use this app as the starting point for **Module 4** security and guardrails work.

Includes the Lab 2 governed workflow plus:

- `executionMode` on extract requests (`deterministic` | `bounded_tool`)
- `tools.ts` with an allowlisted bounded-tool path (`entity_normalizer` allowed; `entity_classifier` blocked)
- `bounded_tool_selection` trace events when bounded-tool mode is active

**Instructor reference (extended app):** `../../demo-app/`

## Run

```bash
cd backend
cp .env-example .env
npm install
npm run dev
curl http://localhost:3000/documents/health
```

### Verify bounded-tool mode

```bash
curl -s -X POST http://127.0.0.1:3000/documents/extract \
  -H "Content-Type: application/json" \
  -d '{"text":"Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp.","source":"lab","executionMode":"bounded_tool"}'
```

Expect `status: "accepted"`, lowercased/deduplicated `data.entities`, and a `bounded_tool_selection` log line with `blockedTools: ["entity_classifier"]`.

See `backend/README.md` and `../../module-03-workflow-vs-agent-design/exercises/README.md` (Module 3 lab).
