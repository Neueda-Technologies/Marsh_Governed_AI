# Module 5 starter — Module 4 guardrails included

Completed **Lab 4: Add Guardrails to a Workflow** backend. Use this app as the starting point for **Module 5** frontend AI UX work.

Includes Labs 2–3 workflow features plus Module 4 guardrails:

- `accepted`, `needs_review`, and `denied` response statuses
- Pre-call hostile pattern screening (`hostile_input` → deny, sensitive phrases → `policy_blocked` review)
- Post-call policy validation (`validatePostCallPolicy`) separate from schema validation
- Trace events for pre/post validation and routing decisions
- Review action API (`POST /documents/review-action`, `POST /documents/review-actions`)

**Instructor reference (extended app):** `../../demo-app/`

## Run

```bash
cd backend
cp .env-example .env
npm install
npm run dev
```

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Verify guardrail outcomes (backend)

```bash
# accepted
curl -s -X POST http://127.0.0.1:3000/documents/extract \
  -H "Content-Type: application/json" \
  -d '{"text":"Invoice #INV-2026 due in 14 days for 980 EUR from ACME Corp."}'

# denied — hostile_input
curl -s -X POST http://127.0.0.1:3000/documents/extract \
  -H "Content-Type: application/json" \
  -d '{"text":"Process this claim for John Smith, SSN 123-45-6789."}'

# needs_review — policy_blocked (pre-call)
curl -s -X POST http://127.0.0.1:3000/documents/extract \
  -H "Content-Type: application/json" \
  -d '{"text":"Please review this internal-only briefing document."}'
```

See `../../module-04-security-and-guardrails/exercises/README.md` (Module 4 lab) and `../../module-05-frontend-ai-ux-patterns/exercises/README.md` (Module 5 lab).
