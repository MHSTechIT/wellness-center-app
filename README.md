# WellnessOS

Clinic CRM — a **Client (Next.js) + Server (Express)** monorepo, structured for
container deployment on **AWS (ECS/Fargate)**.

```
project/
├── client/     # Frontend — Next.js 16 + React 19 (UI + client logic)
├── server/     # Backend  — Node + Express API (Meta sync + Tata telephony)
├── docker-compose.yml
└── package.json    # root orchestration scripts
```

- **client/** — the browser app. Talks to Supabase directly for most data, and
  calls the backend for Meta sync/leads and click-to-call.
- **server/** — a plain Node/Express service. Owns the secrets (Meta tokens,
  Tata API key) and exposes `/api/*`. Reuses the framework-agnostic
  `services/meta.ts` and `services/tata.ts` modules.
- Data platform: **Supabase** (Postgres + Auth + Realtime + Storage).

## Prerequisites
- Node.js 20+
- Docker (for the container workflow)
- A Supabase project; Meta & Tata credentials (see the `.env.example` files)

## Environment
Copy the examples and fill them in:

| File | Used by | Contains |
|------|---------|----------|
| `client/.env.local` | Next.js (client) | `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_API_BASE_URL` |
| `server/.env` | Express (server) | Supabase, all `META_*` and `TATA_*` secrets |
| `.env` (root) | docker-compose | `NEXT_PUBLIC_*` build args for the client image |

> `NEXT_PUBLIC_*` values are inlined into the browser bundle **at build time**.
> `NEXT_PUBLIC_API_BASE_URL` is the backend origin (empty = same-origin).

## Local development
```bash
npm run install:all      # install client + server deps
npm run dev:server       # Express API  → http://localhost:4000
npm run dev              # Next.js app  → http://localhost:3000
```
The client reads `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:4000`) to
reach the API. CORS on the server allows the client origin (`CORS_ORIGIN`).

## Run the whole stack with Docker
```bash
cp .env.example .env     # fill NEXT_PUBLIC_* for the client build
docker compose up --build
# client → http://localhost:3000 , server → http://localhost:4000
```

## Deploy on AWS (ECS/Fargate)
Two independent images — build, push to ECR, run as two services behind one ALB.

```bash
# Backend
docker build -t <acct>.dkr.ecr.<region>.amazonaws.com/wellness-server ./server
# Frontend (bake the public envs in)
docker build ./client \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.<your-domain> \
  -t <acct>.dkr.ecr.<region>.amazonaws.com/wellness-client
# docker push both …
```

Suggested topology:
- **ALB** → `/api/*` to the **server** target group (port 4000, health `/health`);
  everything else to the **client** target group (port 3000).
- Or host client + server on separate subdomains and set `NEXT_PUBLIC_API_BASE_URL`
  to the API subdomain (CORS already handles cross-origin).
- Set each service's env vars from the corresponding `.env.example`. Use a
  Supabase **service-role** key for the server (`SUPABASE_SERVICE_ROLE_KEY`).

The server runs an in-process daily Meta-token refresh (replaces the old Vercel
cron). For webhooks, point Smartflo at `https://api.<your-domain>/api/calls/webhook/recording`.

## Database
SQL migrations for Supabase live in `*.sql` at the repo root — run them in the
Supabase SQL editor.
