# WellnessOS

Clinic CRM. **PostgreSQL** database, **Express** backend, **Next.js** frontend.
In production the backend serves the built frontend, so it runs as **one process
on one port** — no Docker, no proxy, no CORS to configure.

```
project/
├── client/     # Frontend — Next.js 16 (static export → client/out)
├── server/     # Backend  — Node + Express (Postgres gateway, auth, storage, Meta, Tata)
│               #            and serves client/out in production
├── db/schema.sql
└── package.json    # root scripts
```

- The browser holds **no DB credentials**. It calls the server: `/db` (data),
  `/auth` (login), `/storage` (files), `/api/*` (Meta sync, click-to-call).
- The server owns the secrets, connects to **PostgreSQL** via `pg`, and (in prod)
  serves the frontend on the same origin — so those calls just work.
- **No Supabase** anywhere.

## Prerequisites
- Node.js 20+
- A PostgreSQL database. Apply `db/schema.sql` once (`psql "<conn>" -f db/schema.sql`
  or via pgAdmin).
- Meta & Tata credentials (see `server/.env.example`).

## Environment
| File | Used by | Contains |
|------|---------|----------|
| `server/.env` | Express (server) | `PG*` (PostgreSQL) + all `META_*` and `TATA_*` secrets |
| `client/.env.local` | Next dev only | `NEXT_PUBLIC_API_BASE_URL=http://localhost:4200` (dev talks to the backend directly) |

In **production** the client is built with no `NEXT_PUBLIC_API_BASE_URL`, so it
uses same-origin relative URLs and the server serves it — nothing to point at.

## Local development (two servers, hot reload)
```bash
npm run install:all
npm run dev:server     # Express → http://localhost:4200  (set PORT=4200 in server/.env)
npm run dev            # Next.js → http://localhost:3000
```
The dev client calls the backend at `http://localhost:4200` (CORS-allowed).

## Production (ONE server — no Docker) ⭐
```bash
npm run install:all
# 1. put your secrets in server/.env  (PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE + META_*/TATA_*)
#    …or set them as real environment variables on the box.
# 2. build the frontend (static) + the server:
npm run build
# 3. start the one server — it serves the app AND the API on a single port:
cd server && PORT=4200 npm start
#   → open http://<your-server>:4200
```
That's it. The browser loads the app from the same origin it calls for data, so
`/db`, `/auth`, `/api` can never 404 due to a misconfigured URL.

On AWS: run that one Node process (e.g. with **pm2**: `pm2 start "npm start" --cwd server`)
behind your load balancer / security group on port 4200 (or set `PORT=80`).
Set the `PG*`, `META_*`, `TATA_*` values as environment variables on the instance.
Health check: `GET /health`. For webhooks: `POST /api/calls/webhook/recording`.

## Login
The owner account is seeded with a password. First user:
`info@myhealthschool.in`. New users click **"First time? Set your password"** on
the login screen (their email must exist in `app_users`).

## Database
`db/schema.sql` is the full schema. The older `supabase-*.sql` files are the
historical per-feature migrations it was consolidated from.
