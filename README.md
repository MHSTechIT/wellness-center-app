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

- **client/** — the browser app. Talks ONLY to the backend (no DB credentials in
  the browser): `/db` for data, `/auth` for login, `/storage` for files, `/api/*`
  for Meta sync/leads and click-to-call.
- **server/** — a plain Node/Express service. Owns the secrets (PostgreSQL creds,
  Meta tokens, Tata API key), connects to PostgreSQL via `pg`, and exposes the
  data gateway + auth + storage + `/api/*`.
- Data platform: **self-managed PostgreSQL** (no Supabase, no external DB service).

## Prerequisites
- Node.js 20+
- Docker (for the container workflow)
- A PostgreSQL database; Meta & Tata credentials (see the `.env.example` files).
  Apply `db/schema.sql` to the database once to create the tables.

## Environment
Copy the examples and fill them in:

| File | Used by | Contains |
|------|---------|----------|
| `client/.env.local` | Next.js (client) | `NEXT_PUBLIC_API_BASE_URL` (the backend origin) |
| `server/.env` | Express (server) | `PG*` (PostgreSQL), all `META_*` and `TATA_*` secrets |
| `.env` (root) | docker-compose | `NEXT_PUBLIC_API_BASE_URL` build arg for the client image |

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

## Deploy on AWS
Two services must BOTH run: the **client** (Next.js) and the **server** (Express).
The client's Next server proxies `/db`, `/auth`, `/storage`, `/api` to the backend.

> ⚠️ **The #1 production gotcha:** Next bakes the proxy target at **BUILD time**.
> You MUST build the client with `API_PROXY_TARGET` = the backend's reachable URL.
> If you don't, it defaults to `http://server:4000` (docker) / `localhost:4200`
> and the client's `/db` & `/auth` calls **404 in production**.

Easiest — single EC2 box with Docker:
```bash
docker compose up --build -d       # client :3000  +  server :4000, wired automatically
# server/.env must have PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE + META_*/TATA_*
```

ECS/Fargate (two images):
```bash
# Backend
docker build -t <ecr>/wellness-server ./server
# Frontend — MUST bake the backend URL the Next server will proxy to:
docker build ./client --build-arg API_PROXY_TARGET=https://api.<your-domain> \
  -t <ecr>/wellness-client
```
- Server task env: `PG*` (PostgreSQL) + `META_*` + `TATA_*` (see `server/.env.example`).
- Health check: `GET /health` on the server (port 4000).
- Client → server must be reachable at whatever `API_PROXY_TARGET` you baked
  (an internal ALB/service URL, or a public `https://api.<domain>`).

Non-Docker (PM2 on EC2): run the backend (`npm --prefix server start`, with `PG*`
env), then build the client with the backend URL and start it:
```bash
API_PROXY_TARGET=http://localhost:4200 npm --prefix client run build
PORT=3000 npm --prefix client start
```

The server runs an in-process daily Meta-token refresh (replaces the old Vercel
cron). For webhooks, point Smartflo at `https://api.<your-domain>/api/calls/webhook/recording`.

## Database
The consolidated schema is `db/schema.sql` — apply it once to your PostgreSQL
(`psql "<conn>" -f db/schema.sql`, or via pgAdmin). The older `supabase-*.sql`
files are the historical per-feature migrations it was built from.
