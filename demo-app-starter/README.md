# Demo app — learner starters

Checkpointed baselines for course labs. Each path is a snapshot of what participants should have **at the start** of that module's lab—not the instructor reference.

| Path | Use in |
|------|--------|
| `backend/` | Module 2 — build the governed workflow endpoint |
| `module_3_starter/` | Module 3 (planned) |
| `module_4_starter/` | Module 4 (planned) |
| `module_5_starter/` | Module 5 (planned) |
| `module_6_starter/` | Module 6 (planned) |
| `module_7_starter/` | Module 7 (planned) |

**Instructor reference (finished app):** `../demo-app/`

## Module 2 — `backend/`

Runnable Nest API with health check and stub files under `src/features/document-extraction/`. Implement the lab in that feature slice; wire `POST /documents/extract` when you reach Task 1.

```bash
cd backend
cp .env-example .env
npm install
npm run dev
curl http://localhost:3000/documents/health
```

See `backend/README.md` and `module-02-backend-workflow-patterns/exercises/README.md`.
