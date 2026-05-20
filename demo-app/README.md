# Demo app — local setup

This folder contains a small **NestJS** API (`backend/`) and a **Vite + React** UI (`frontend/`) used in the governed AI feature delivery course. Run both processes locally for the full experience.

## Prerequisites

- **Node.js** 20 or newer (the repo uses current TypeScript and Nest; use an LTS if unsure).
- **npm** (comes with Node).

## 1. Backend

```bash
cd backend
cp .env-example .env
npm install
```

Edit `.env` as needed. Defaults use `APP_PROFILE=dev` with mock LLM behavior, so you can run without a real API key. To call OpenAI, set `LLM_MODE=openai`, `OPENAI_API_KEY`, and optionally `OPENAI_BASE_URL` (see `backend/.env-example` comments).

**Development server** (watches files, loads `.env`):

```bash
npm run dev
```

The API listens on **http://localhost:3000** (override with `PORT` in `.env`).

**Production-style run** (after compile):

```bash
npm run build
npm run start
```

Health check:

```bash
curl http://localhost:3000/documents/health
```

More detail (profiles, extraction contract, evals, release gate): **`backend/README.md`**. Operational demos (kill switch, rollback): **`backend/OPERATIONS.md`**.

## 2. Frontend

The API allows the Vite dev origin **http://localhost:5173** only. Keep the UI on that port unless you change CORS in `backend/src/main.nest.ts`.

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open the URL Vite prints (typically **http://localhost:5173**).  
`VITE_API_BASE_URL` in `.env` must match the backend (default: `http://localhost:3000`).

## 3. Typical workflow

1. Terminal A: `cd backend && npm run dev`
2. Terminal B: `cd frontend && npm run dev`
3. Use the UI against the running API, or call `POST /documents/extract` directly as documented in `backend/README.md`.

## Optional checks

From `backend/`:

```bash
npm test
```

From `frontend/`:

```bash
npm run lint
npm run build
```
