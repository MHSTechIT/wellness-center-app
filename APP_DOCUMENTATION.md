# MHS Wellness Center — Complete Application Documentation

**WellnessOS** — a clinic CRM for MHS Wellness Center, Chennai. It carries a lead from a Meta
(Facebook/Instagram) ad through calling, appointment booking, clinic visit, screening, consultation,
enrolment, payment and refund — plus blood tests, physiotherapy, telephony, recordings, reporting
and marketing analytics.

> Generated from the codebase and the live database on **13 August 2026** (commit `1c88b62`).
> Everything below was read from source or verified against the running system — nothing is assumed.

---

## Table of contents

1. [System at a glance](#1-system-at-a-glance)
2. [Technology stack](#2-technology-stack)
3. [Repository layout](#3-repository-layout)
4. [Architecture](#4-architecture)
5. [The data gateway (how the browser reaches Postgres)](#5-the-data-gateway)
6. [Authentication, sessions and RBAC](#6-authentication-sessions-and-rbac)
7. [Database reference](#7-database-reference)
8. [Self-applying schema](#8-self-applying-schema)
9. [HTTP API reference](#9-http-api-reference)
10. [Integrations](#10-integrations)
11. [Real-time and cross-device sync](#11-real-time-and-cross-device-sync)
12. [Screens and modules](#12-screens-and-modules)
13. [Core workflows end to end](#13-core-workflows-end-to-end)
14. [Business logic and canonical rules](#14-business-logic-and-canonical-rules)
15. [Vocabularies (statuses, services, programs)](#15-vocabularies)
16. [Files, storage and recordings](#16-files-storage-and-recordings)
17. [Reporting engine](#17-reporting-engine)
18. [Frontend conventions](#18-frontend-conventions)
19. [Configuration reference](#19-configuration-reference)
20. [Build, run and deploy](#20-build-run-and-deploy)
21. [Known issues and open items](#21-known-issues-and-open-items)
22. [Glossary](#22-glossary)

---

## 1. System at a glance

| | |
|---|---|
| **Product** | Clinic CRM / practice management for a wellness centre |
| **Primary line of business** | Diabetes reversal counselling; plus physiotherapy, blood tests, HBOT, sauna, cold plunge, weight loss |
| **Users** | Health Advisors (tele-sales), Health Coaches (clinical), Reception, BDM, Accounts, Admin / Super Admin |
| **Lead source** | Meta Lead Ads (primary), CSV import, walk-ins |
| **Deployment shape** | One Node process on one port in production (backend serves the built frontend) |
| **Database** | PostgreSQL, 26 tables |
| **No Docker, no websockets, no Supabase** | Deliberate — see [Architecture](#4-architecture) |

### The one-line story

> A Meta ad produces a lead → it lands in Postgres via a server-side crawl → an advisor is assigned
> and calls (click-to-call, recorded) → an appointment is booked → Reception checks the client in →
> Screening takes vitals → a Health Coach runs the consultation (recorded) and proposes a program →
> payment is collected (or an EMI deal goes to the BDM for approval) → enrolment is stamped → every
> screen and the Admin Report read that same stamped fact.

---

## 2. Technology stack

### Frontend (`client/`)

| Tool | Version | Role |
|---|---|---|
| **Next.js** | 16.2.9 | App Router, `output: "export"` → a fully static site in `client/out` |
| **React** | 19.2.4 | Shell only — the UI itself is a hand-written HTML string |
| **TypeScript** | 5.x | Whole codebase |
| **Tailwind CSS** | 4 (via `@tailwindcss/postcss`) | Present; the app's real styling is hand-written CSS in `globals.css` |
| **jsPDF** | 4.2.1 | Client-side PDF export (reports, prescriptions) |
| **ESLint** | 9 + `eslint-config-next` | Linting |

### Backend (`server/`)

| Tool | Version | Role |
|---|---|---|
| **Node.js** | 20+ | Runtime |
| **Express** | 4.21.2 | HTTP server |
| **pg** (node-postgres) | 8.22 | The only database driver; a connection `Pool` |
| **cors** | 2.8.5 | Dev-only cross-origin (production is same-origin) |
| **dotenv** | 16.4 | `server/.env` |
| **tsx** | 4.19 | Dev watch mode |
| **TypeScript** | 5.x | Compiled to `dist/` for production |

**Notably absent, on purpose:** no ORM (raw SQL through one query builder), no JWT library (hand-rolled
HMAC on Node's `crypto`), no websocket library (SSE instead), no multipart parser (base64 uploads),
no Supabase client (a shim with the same API talks to this backend instead).

### Code size

| File | Lines | What it is |
|---|---|---|
| `client/src/client/app.ts` | ~17,550 | All client logic, state and `window.*` handlers |
| `client/src/client/template.ts` | ~2,215 | The entire UI as one HTML string |
| `client/src/app/globals.css` | ~1,415 | All styling |
| `server/src/services/meta.ts` | ~1,035 | Meta Graph API crawl + sync |
| `server/src/shared/schema.ts` | ~225 | Self-applying migrations |
| `server/src/shared/query.ts` | ~185 | The SQL engine behind the gateway |

---

## 3. Repository layout

```
Wellness Center App/
├── client/                       FRONTEND — Next.js 16 + React 19
│   ├── src/app/
│   │   ├── page.tsx              Shell: sidebar nav + mounts the template, calls initApp()
│   │   ├── layout.tsx            Root layout
│   │   └── globals.css           All styles
│   ├── src/client/
│   │   ├── template.ts           getMainContent() — the full UI markup as an HTML string
│   │   └── app.ts                initApp(root) — every handler, all state, all logic
│   ├── src/shared/
│   │   └── supabase.ts           Data client with the supabase-js API, backed by /db /auth /storage
│   ├── public/                   Logo, mascot GIF, icons
│   └── next.config.ts            output: "export"
│
├── server/                       BACKEND — Node + Express (owns every secret)
│   ├── src/index.ts              App wiring: CORS, JSON, routes, static, daily token refresh
│   ├── src/routes/
│   │   ├── data.ts               /db/query — the generic Postgres gateway
│   │   ├── auth.ts               /auth/login, /auth/signup
│   │   ├── storage.ts            /storage/upload, /storage/files/*
│   │   ├── meta.ts               /api/meta/*
│   │   ├── calls.ts              /api/calls/*
│   │   └── events.ts             /events (SSE), /events/cheer
│   ├── src/services/
│   │   ├── meta.ts               Meta Graph API crawl, sync, insights, token lifecycle
│   │   └── tata.ts               Tata Smartflo click-to-call + call normalisation
│   ├── src/shared/
│   │   ├── db.ts                 pg Pool
│   │   ├── query.ts              One SQL engine + the table allowlist
│   │   ├── schema.ts             Self-applying, additive schema steps
│   │   ├── session.ts            HMAC session tokens + requireAuth
│   │   └── supabase.ts           Server-side data client (same API, direct pg)
│   └── uploads/                  Uploaded files (UPLOAD_DIR)
│
├── db/schema.sql                 Base schema, applied once by hand
├── AGENTS.md / CLAUDE.md         Instructions for AI agents working in this repo
├── DEPLOY.md                     Deployment runbook
└── README.md                     Quick start
```

---

## 4. Architecture

### The three hard rules

1. **The browser never holds database credentials.** It calls the server; the server owns Postgres.
2. **The server owns every secret** — Meta tokens, Tata API keys, the session secret, DB password.
3. **Production is one process on one port.** Express serves `client/out` via `express.static`, so
   the frontend and API share an origin: no proxy, no CORS, no Docker.

```
┌──────────────────────────────────────────────────────────┐
│ BROWSER                                                   │
│  page.tsx (React shell)                                   │
│   └── template.ts  → one HTML string via                  │
│                      dangerouslySetInnerHTML              │
│   └── app.ts       → initApp(root): state + window._fn()  │
│   └── shared/supabase.ts  ← "supabase-js API", no creds   │
└───────────────┬──────────────────────────────────────────┘
                │  HTTPS  (NEXT_PUBLIC_API_BASE_URL in dev,
                │          same-origin in production)
┌───────────────▼──────────────────────────────────────────┐
│ EXPRESS SERVER                                            │
│  /auth      login / signup (scrypt password hashes)       │
│  /db/query  generic gateway → shared/query.ts → pg        │
│  /storage   base64 upload + authenticated download        │
│  /api/meta  Meta Graph crawl, sync, insights, tokens      │
│  /api/calls Tata click-to-call, webhook, recordings       │
│  /events    Server-Sent Events (the only server→client push)│
│  static     client/out  (production only)                 │
└───────────────┬──────────────────────────────────────────┘
                │ node-postgres Pool
┌───────────────▼──────────────────────────────────────────┐
│ POSTGRESQL — 26 tables                                    │
└──────────────────────────────────────────────────────────┘
        ▲                         ▲
        │                         │
  Meta Graph API v21       Tata Smartflo (telephony)
```

### Why "supabase" appears everywhere but Supabase does not

The app was migrated off Supabase. Rather than rewrite ~100 call sites, `client/src/shared/supabase.ts`
implements the **same fluent API** (`supabase.from(t).select().eq()...`) and translates it into a
POST to `/db/query`. Two consequences that matter constantly:

- **`supabase.channel()` is a no-op stub.** It does nothing. Real-time is SSE (§11).
- **The gateway resolves `{error}` rather than throwing.** A `try/catch` around a write is dead code;
  you must check the returned `{error}`. The helper `_dbOk()` exists for exactly this, and forgetting
  it has previously caused duplicate payments and lost check-ins.

---

## 5. The data gateway

`POST /db/query` (auth required) is a single generic endpoint. Body:

```jsonc
{
  "action": "select" | "insert" | "upsert" | "update" | "delete",
  "table":  "leads",
  "values": { }        // insert/upsert/update  (NOT "rows")
  "columns": "a,b,c",  // select
  "filters": [ { "col": "id", "op": "eq", "val": "123" } ],
  "order":   { "col": "created_at", "ascending": false },
  "limit": 500, "offset": 0,
  "single": true,      // return one object instead of an array
  "returning": true,   // insert/update/delete return the affected rows
  "onConflict": "meta_lead_id", "ignoreDuplicates": false
}
```

Always returns `200` with `{ data, error, count }` — **errors arrive in the body, never as a throw**.

### Safety mechanisms

| Mechanism | Detail |
|---|---|
| **Table allowlist** | `TABLES` in `shared/query.ts` is a real access control — the gateway can reach any table named there, so new tables must be added deliberately. |
| **Identifier validation** | Table and column names are matched against `IDENT` and quoted; values are always parameterised (`$1`, `$2` …). |
| **`MAX_SELECT_LIMIT = 5000`** | A hard cap. The answer to needing more is **paging**, not raising the cap — the client has `_pageAll()` for this. |
| **`redact()`** | Strips sensitive columns from responses. |
| **`validateOrgWrite()`** | `org_roles.modules` *is* the permission list, so unrestricted writes there would be privilege escalation. Mutations to the org tables are limited to admin roles. |
| **Change broadcast** | Every successful mutation calls `broadcastChange(table)` — the single choke point that gives every feature real-time sync for free. A `select` never broadcasts (it would loop forever). |
| **`{preserve: v}` marker** | Insert `v` for a new row, but on conflict keep the existing non-empty value. This is how the Meta sync seeds a field without clobbering a human's later correction (used for `leads.sugar_poll`). |

### Allowlisted tables

`leads`, `appointments`, `payments`, `assignees`, `csv_leads`, `csv_import_batches`,
`call_recordings`, `lead_activity`, `app_users`, `app_settings`, `meta_tokens`, `meta_sync_state`,
`source_connections`, `lead_assignments`, `office_recordings`, `zoom_recordings`,
`bt_tests`, `bt_lab_partners`, `bt_coupons`, `bt_orders`,
`org_services`, `org_roles`, `org_role_services`, `physio_pricing`, `bdm_requests`,
`thyrocare_payouts`.

---

## 6. Authentication, sessions and RBAC

### Passwords

`app_users.password_hash` — hashed with Node's built-in **scrypt** (no external auth library).
`POST /auth/login` verifies; `POST /auth/signup` creates.

### Session tokens

`server/src/shared/session.ts` — a hand-rolled **HMAC-signed token** (base64url payload + signature),
deliberately not a JWT dependency.

- Payload: `{ email, role, name, iat, exp }`
- **TTL: 12 hours** — one staff shift, then re-login.
- Signed with `SESSION_SECRET`. **If unset, a random secret is generated per process** and the server
  warns loudly: every session then dies on restart or deploy.
- `requireAuth` middleware guards every sensitive route.
- The token is stored in `localStorage` under **`wos_session`**.
- `/storage/files/*` also accepts the token as `?token=` — a plain `<img src>` or download link
  cannot send an `Authorization` header.

This replaced an earlier hardcoded `access_token: "local"` that no server code validated — anyone
could paste a crafted user object into localStorage and become whoever they claimed.

### Role-based access

- **`org_roles.modules`** is the permission list: which screens a role may open.
- **`org_role_services`** maps roles to services.
- Every signed-in client *reads* the org tables to build the nav and the user form; *writes* are
  restricted to admin roles (see `validateOrgWrite`).
- Roles in use: Super Admin, Admin, Advisor, Health Coach, Receptionist, BDM, Accounts.

### Data scoping

Advisors and coaches see **their own** book. The identity used for scoping is resolved by
`_advisorName()`, which maps a login to its assignee/account name — a login email can differ from
the assignee name, and this resolver is the single key the whole RBAC layer uses.

---

## 7. Database reference

**PostgreSQL — 26 tables.** Core tables and their columns as they exist today:

### `leads` (36 columns) — the spine of the system

```
id, meta_lead_id, name, phone, email, source, lead_date, created_at,
is_valid, is_duplicate, is_assigned, assigned_to, assigned_at,
in_pool, pool_added_at,
campaign, campaign_id, ad_name, adset_name, form_name,
ad_account_id, ad_account_name,
service, language, city, street,
call_status, next_followup, sugar_poll,
coach_profile (JSONB), advisor_profile (JSONB), screening_vitals (JSONB),
visited_at, confirmed_at, enrolled_at, client_id
```

- **`meta_lead_id`** is the business key used throughout the app (not `id`).
- **`advisor_profile` / `coach_profile`** are JSONB blobs holding the whole form. **They are saved
  *positionally*** — as an array of field values in DOM order — which is the single most important
  fragility in the codebase (see §18).
- **`enrolled_at`** is the canonical enrolment fact (§14).

### `appointments` (22 columns)

```
id, lead_id, client_id, client_name, phone, service, hc_pt,
appt_date, appt_time, status, visited_at, stage, session, source, language, notes,
meeting_type, meeting_link, created_at,
blood_test_data (JSONB), screening_vitals_data (JSONB), physio_data (JSONB)
```

- `hc_pt` = the assigned Health Coach / physiotherapist, **snapshotted at booking time**.
- `status`: `expected` → `visited` / `cancelled` / `no-show`.
- `stage`: `screening` → `screened` → `physio` …
- `meeting_type`: `direct` | `zoom` | `Home` (Home only on the Blood Test page).
- ⚠️ `visited_at` is **TEXT**, not a timestamp, and 8 rows hold time-only strings like `"04:30 pm"`.

### `payments` (29 columns)

```
id, lead_id, appointment_id, amount, status, method, service, program,
paid_at, due_date, created_at,
verified, verified_at, verified_by,
refund_status, refund_amount, refund_reason, refund_requested_at,
refund_processed_at, refund_paid_at,
payment_type, installment_number, total_installments,
emi_provider, emi_subvention, txn_ref, proof_url, proof_name, collected_by
```

### `lead_activity` (8 columns) — the audit trail

```
id, lead_id, action, field, old_value, new_value, actor, created_at
```

`actor` is the authenticated user's name; the Tata webhook writes `Telephony`.

### `bdm_requests` (12 columns) — approvals queue

```
id, lead_id, client_name, program, snapshot (JSONB), status,
requested_by, requested_at, decided_by, decided_at, return_reason, kind
```

- `kind`: `enrollment` (deal approval — approving **enrols** the client) or `assessment_edit`
  (reopen a saved health assessment — approving enrols **nobody**).
- `status`: `pending` → `approved` | `returned`.
- `snapshot` is deliberately a frozen copy, not live joins, so the BDM approves what was proposed.

### `assignees` (8) / `app_users` (11) / `org_roles` (8)

```
assignees:  id, name, role, branch, phone, email, is_active, created_at
app_users:  id, email, name, role, roles, service, active, password_hash,
            tata_did, tata_extension, created_at
org_roles:  id, name, is_assignable, modules, is_protected, is_active, sort, created_at
```

### The rest

| Table | Purpose |
|---|---|
| `call_recordings` (16) | Telephony call log + recording URLs |
| `office_recordings` (8) | In-clinic consultation audio |
| `zoom_recordings` (9) | Online consultation links |
| `csv_leads` (15), `csv_import_batches` (11) | CSV import staging + batch history |
| `lead_assignments` (10) | Immutable assignment history (who assigned whom, when) |
| `meta_tokens` (6), `meta_sync_state` (9) | Meta token store + crawl checkpoints |
| `source_connections` (6) | Lead-source configuration |
| `bt_tests` (8), `bt_lab_partners` (6), `bt_coupons` (10), `bt_orders` (30) | Blood-test module |
| `org_services` (6), `org_role_services` (2) | Services master + role↔service map |
| `physio_pricing` (7) | Physiotherapy price list |
| `thyrocare_payouts` (11) | Money owed to / paid to the blood-test lab partner |
| `app_settings` (3) | Key–value application settings |

---

## 8. Self-applying schema

`server/src/shared/schema.ts` runs `ensureSchema()` **on every boot**. It exists because manual SQL
migration files were explicitly ruled out — schema changes ship with the code.

**Order:** `TABLES` → `STEPS` (columns/indexes) → `BACKFILLS` (data repair).
**Rule:** every step must be **additive and idempotent** (`CREATE TABLE IF NOT EXISTS`,
`ADD COLUMN IF NOT EXISTS`, guarded `UPDATE`). Nothing destructive ever goes here.

Current steps:

```
leads.confirmed_at (+ index)          thyrocare_payouts (table, + paid_at index)
leads.adset_name                      thyrocare_payouts.covers_days / .status / .settled_at
payments.refund_paid_at (+ index)     bdm_requests (table) + .kind + lead index + status index
BACKFILL: leads.sugar_poll from the advisor profile
BACKFILL: payments.refund_paid_at
```

The sugar backfill **scans for the value** rather than trusting a fixed array index — a lesson from
a real bug where the positional index had shifted.

---

## 9. HTTP API reference

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/health` | — | Liveness |
| GET | `/version` | — | Running build SHA (used by the client's update banner) |
| POST | `/auth/login` | — | Email + password against `app_users` |
| POST | `/auth/signup` | — | Create a user |
| POST | `/db/query` | ✅ | **The data gateway** (§5) |
| POST | `/storage/upload` | ✅ | Base64 JSON upload (64 MB limit) |
| GET | `/storage/files/*` | ✅ (or `?token=`) | Download an uploaded file |
| GET | `/events` | — | **SSE stream** (open by design — carries no data, see §11) |
| POST | `/events/cheer` | ✅ | Broadcast a check-in celebration |
| GET/POST | `/api/meta/sync` | ✅ | Run the Meta lead crawl (`?force=1` to ignore checkpoints) |
| GET | `/api/meta/leads` | ✅ | Read synced leads |
| GET/POST | `/api/meta/token` | ✅ | Inspect / set the Meta token |
| GET | `/api/meta/campaigns` | ✅ | Campaign statuses |
| GET | `/api/meta/ads` | ✅ | Ad statuses |
| GET | `/api/meta/forms` | ✅ | Lead-form statuses |
| GET | `/api/meta/insights` | ✅ | Spend / impressions / clicks / video views |
| GET | `/api/meta/accounts` | ✅ | Configured ad accounts |
| POST | `/api/calls/initiate/:contactId` | ✅ | Click-to-call |
| POST | `/api/calls/webhook/recording` | — (provider) | Tata call + recording webhook |
| PUT | `/api/calls/:contactId/latest-type` | ✅ | Tag the latest call |
| GET | `/api/calls/:contactId/recordings` | ✅ | Recordings for a contact |
| GET | `/api/calls/:contactId/sync` | ✅ | Pull the provider's call log |
| GET | `/api/calls/config-status` | ✅ | Whether telephony is configured |

---

## 10. Integrations

### 10.1 Meta (Facebook / Instagram) Lead Ads — Graph API v21

**What it does:** crawls ad accounts and lead forms, normalises each lead, and upserts it into
`leads` — including full ad attribution (campaign, adset, ad, form).

**Token resolution order** (`getMetaToken()`): `META_ACCESS_TOKEN` first, then the system token.
This order matters — the **system token returns `campaign_name: null` and `ad_name: null`**, so
using it first silently destroys attribution. Fixing this restored attribution on 1,092 leads.

**Key functions** (`server/src/services/meta.ts`):

| Function | Purpose |
|---|---|
| `crawlAdAccountLeads()` | Primary crawl, by ad account |
| `crawlPageFormLeads()` | Direct crawl by page/form (its own token list) |
| `syncMetaLeadsToSupabase()` | Normalise + upsert into `leads` |
| `fetchAdInsights(ids, since, until)` | Spend, impressions, clicks, 3-second plays (`video_view`) |
| `fetchCampaignStatuses` / `fetchAdStatuses` / `fetchFormStatuses` | Live status of each object |
| `checkTokenValidity` / `exchangeForLongLivedToken` | Token lifecycle |
| `metaTargetFormIds` / `metaTargetAdAccounts` / `adAccountNames` | Crawl scope |

**Crawl scope lives in code**, not in one machine's `.env` — env can only override. Adding a form or
account means editing `services/meta.ts` and deploying.

**Sync trigger:** leads are pulled by **client-side auto-sync**; the daily server job only refreshes
the token.

**Prune rule:** the sync *deletes* out-of-crawl Meta leads that have no workflow state. Anything
carrying `in_pool`, `assigned`, or `pool_added_at` is kept — otherwise worked leads vanish.

⚠️ **Attribution requires `ads_read` permission on the token.** Without it, campaign/adset/ad names
come back null.

### 10.2 Tata Smartflo — telephony

**What it does:** click-to-call from the lead profile, then a webhook delivers call status, duration
and a recording URL.

- `POST /api/calls/initiate/:contactId` places the call using the agent's DID/extension
  (`app_users.tata_did`, `app_users.tata_extension`), falling back to `TATA_TELE_*` config.
- `POST /api/calls/webhook/recording` receives the result, upserts `call_recordings` (on `call_id`),
  and — on a terminal status — writes a `lead_activity` row with `actor = 'Telephony'`.
- The recording is downloaded into local storage so playback does not depend on the provider URL.
- `services/tata.ts` normalises phone numbers (`digits10`), call status, direction and duration, and
  identifies "own" call records via the configured caller-number set.

### 10.3 Thyrocare — blood-test lab partner

Not an API integration — an **operational money flow**. Blood tests booked in the app create a
liability to Thyrocare, reconciled in Accounts:

`Blood Test → Thyrocare reconciliation` (multi-select days) → **Proceed** → rows move into the
**Payout** table → multi-select → **Mark as paid** → they land in **Thyrocare payments history**,
and the "Paid to Thyrocare" card reflects actual payouts (not the liability).

Backed by `thyrocare_payouts` (`covers_days`, `status`, `paid_at`, `settled_at`).

### 10.4 WhatsApp

No API. The Health Advisor page builds a message from an editable template with `{{name}}`
substitution and opens `https://api.whatsapp.com/send?phone=…`.

### 10.5 Storage

Local filesystem under `UPLOAD_DIR` (default `server/uploads`). Uploads are **base64 JSON** so no
multipart parser is needed; `safeRel()` blocks path traversal. Downloads require a session.

---

## 11. Real-time and cross-device sync

The stack has **no websocket by design**. Three mechanisms cover synchronisation:

| Mechanism | Scope | Notes |
|---|---|---|
| **SSE** — `GET /events` | Cross-device, cross-role | The only server→client push |
| **`BroadcastChannel("wos-lead-sync")`** | Same browser, other tabs | Instant local echo |
| **30-second poll** | Everything | Safety net when the stream is down |

### How SSE works here

`broadcastChange(table)` is called from the `/db/query` gateway — the single choke point every write
already passes through, so **new features get real-time sync with no per-feature wiring**.

**The frame carries no data:**

```
data: {"t":"leads"}
```

It is a *cache-invalidation signal*. Clients re-query through the authenticated gateway to read
anything. That is precisely why `/events` needs no session: `EventSource` cannot send an
`Authorization` header, and a token in the query string would leak into URLs, logs and referrers.

Frames are debounced **per table** (400 ms) client-side, a `retry: 3000` tells the browser to
reconnect, and a comment frame every 25 s stops proxies dropping an idle stream.

### The check-in celebration (a privacy-preserving exception)

When Reception checks a client in, a mascot animation plays on Reception, the lead's **Advisor**, and
Admin machines simultaneously. The frame carries only an **FNV hash of the lead id plus a timestamp**:

```
data: {"t":"_cheer","h":"1k4p9x","at":"2026-08-13T09:12:44.120Z"}
```

Each receiving device hashes the leads **it already holds in memory** and celebrates only on a match —
which scopes the animation to exactly the people entitled to see that lead, with **no role logic on an
unauthenticated stream**. Triggering a broadcast requires a session (`POST /events/cheer`). All three
delivery paths share one `hash@timestamp` dedup key, so the acting device cannot fire twice.

---

## 12. Screens and modules

Seventeen screens, grouped in the sidebar. Visibility per role comes from `org_roles.modules`.

### Hero screens

| Screen | id | What it does |
|---|---|---|
| **Health Advisor** | `s-advisor` | The tele-sales cockpit: dashboard cards (Total / Open / Appointment Fixed Direct & Zoom / Confirmed / Visited / Payment Stage / Enrolled / Follow-up / Closed / Call Status / Connected / Total Call Duration), assigned-leads table, full **Lead Profile** (basic info, sugar & medical, assignment & pipeline, appointment slot board, follow-ups, WhatsApp, call logs, **Activity log**), List/Kanban views, status + Sugar Level filters |
| **Health Coach** | `s-coach` | The clinical cockpit: visited-clients queue, **Health assessment** (gated behind a recording), consultation status & program, payment collection, installments/EMI, proof attachments, **Request to BDM**, office-visit recordings |

### Leads & CRM

| Screen | id | What it does |
|---|---|---|
| **Lead import** | `s-import` | CSV upload, batch history, drill-downs (Total leads table incl. a **Sugar Pool** column) |
| **Meta leads** | `s-metaleads` | Synced Meta leads, sync controls, attribution |
| **Assign & approve** | `s-abm` | Pool → advisor assignment, round-robin, bulk assign, assignment history |

### Clinic floor

| Screen | id | What it does |
|---|---|---|
| **Reception** | `s-reception` | Expected appointments, **check-in** (Direct / Zoom / walk-in registration), payments collected at desk |
| **Screening** | `s-screening` | Vitals capture (BP, pulse, temp, desk glucose) — the M0 baseline |
| **Blood test** | `s-bloodtest` | Test catalogue, orders, coupons, lab partners, Thyrocare reconciliation; the only place `meeting_type = "Home"` applies |
| **Physiotherapy** | `s-physio` | Physio sessions, pricing (`physio_pricing`), reports |
| **Recordings** | `s-recordings` | Every office-visit and Zoom recording, scoped by role |

### BDM

| Screen | id | What it does |
|---|---|---|
| **BDM Requisition** | `s-bdmreq` | Category-first approval queue: KPI strip, category chips (All / Enrolment / Assessment edit) with live counts, and a table (client/subject, category, stage, requested by + role, requested at, decided by/when). Review opens the full report inline with Approve / Return |

### Finance & insight

| Screen | id | What it does |
|---|---|---|
| **Accounts** | `s-accounts` | Revenue by service, outstanding, refund console (Process → confirm by re-typing the amount → **Payout** table → Mark as paid → **Refund history**), Thyrocare payout + payments history |
| **Reports** | `s-reports` | The Admin Report (§17) |

### Marketing

| Screen | id | What it does |
|---|---|---|
| **Campaign Tracker** | `s-campaigns` | Live Meta spend, impressions, 3-second plays, hook rate, clicks, CTR; funnel cards (Clicks → Qualified → Appointments → Visited → Revenue → ROAS) each opening a record table; CPL / CPQL / CPA / CPV / CPE; an Ads-Manager-style date picker |
| **Leads View** | `s-leadsview` | Marketing-side lead browser |

### Admin

| Screen | id | What it does |
|---|---|---|
| **Settings & masters** | `s-admin` | Users, roles and module permissions, services, screening-field builder, pricing masters |

Plus `s-collectpay` — the payment-collection sub-screen.

---

## 13. Core workflows end to end

### 13.1 Lead acquisition → assignment

```
Meta ad → lead form submitted
   → client-side auto-sync calls /api/meta/sync
   → crawlAdAccountLeads() (token WITH ads_read for attribution)
   → normalizeLead() → upsert into `leads` on meta_lead_id
       · sugar_poll written as {preserve:} so a sync never clobbers
         an advisor's corrected clinical reading
   → lead lands in the POOL (in_pool = true, pool_added_at set)
   → Assign & approve: manual or round-robin
   → leads.assigned_to + assigned_at, and a row in `lead_assignments`
   → activity: "Assigned"
```

### 13.2 Calling and follow-up

```
Advisor opens the Lead Profile
   → click-to-call → POST /api/calls/initiate/:contactId (Tata)
   → webhook returns status + duration + recording
        → call_recordings upserted, recording downloaded locally
        → lead_activity "Call" (actor = Telephony)
   → advisor sets a Call status (24 codes, §15)
        → statuses in FU_REQUIRED_CODES force a next follow-up date
        → NO_CONTACT_CODES relax every mandatory profile field —
          recording "Wrong Number" must not require inventing an age
   → Save lead record → advisor_profile (JSONB) + leads columns
        → ONE activity entry summarising every changed field
```

### 13.3 Appointment → visit

```
Advisor picks HC assigned (cleared on every lead open so it can never
   inherit the previous client's coach) and books a slot
   → appointments row: status 'expected', hc_pt snapshotted,
     meeting_type direct|zoom
   → changing HC afterwards propagates to the pending appointment;
     saving the profile re-syncs it as a backstop
   → Reception sees it under Expected
   → Check-in → status 'visited', visited_at stamped, stage 'screening'
   → SSE fires: the mascot celebration plays on Reception, the lead's
     Advisor and Admin machines at once
   → Screening records vitals → stage 'screened'
```

### 13.4 Consultation (Health Coach)

```
Coach opens the visited client → Health assessment accordion
   → popup: the only action is "Start Recording"
   → recording starts; Basic health info, Lifestyle & diet and
     Symptoms reported unlock (hidden AND disabled until then)
   → coach fills the assessment
   → "Save health record" STOPS the recording (there is no manual stop),
     uploads it against the lead it was started for, and saves the record
   → the assessment becomes READ-ONLY
```

### 13.5 Editing a saved assessment (BDM-approved)

```
Coach presses "✎ Edit Request to BDM" → in-app modal asks for a reason
   → bdm_requests row, kind = 'assessment_edit', status 'pending'
   → BDM Requisition → the Assessment edit card shows the reason and
     the assessment as saved
   → Approve ("allow edit") — this NEVER runs the enrolment writer
   → the coach can edit; saving again RE-LOCKS it
        rule: editable ⇔ approved_at > last_saved_at
        so one approval buys exactly one edit
```

### 13.6 Enrolment and payment

```
Coach sets a consultation status and program
   → payment collected (cash/card/UPI/EMI), proof attached
   → _enrollLeadShared(leadId, srcLabel, level) stamps leads.enrolled_at
     + call_status — ONE writer, so Advisor, Coach, Reception and the
     report all read the same fact
   → EMI (BFL / SaveIn) instead shows "Request to BDM":
        → snapshot frozen into bdm_requests (kind 'enrollment')
        → BDM approves → _enrollLeadShared runs → Enrolled updates
          everywhere with no manual status edits
        → or Return to coach with a reason
```

### 13.7 Refunds

```
Accounts → Refund console → Process
   → popup shows client / paid / refund amount
   → the amount must be RE-TYPED manually → Confirm
   → status "Not Paid Yet" in the Payout table
   → multi-select → Mark as paid → refund_paid_at stamped
   → the row moves into Refund history with its paid-on date
```

### 13.8 Blood test → Thyrocare settlement

```
Blood test booked (meeting_type may be 'Home' — this page only)
   → Thyrocare reconciliation lists unsettled days (multi-select)
   → Proceed → selected days + total move to the Payout table
     (covers_days recorded; the same day can never be processed twice,
      and proceeded rows leave the reconciliation table)
   → multi-select → Mark as paid → settled_at
   → Thyrocare payments history; the "Paid to Thyrocare" card shows
     actual payouts, not the liability
```

---

## 14. Business logic and canonical rules

These are the rules that have caused real bugs when violated. They are the heart of the system.

### Enrolment is `leads.enrolled_at`

- **Canonical:** `enrolled_at`, written **only** by `_enrollLeadShared()`. Not the mutable
  `call_status`.
- **Level** = paid programs ∪ consultation status level — never "due-only".
- Unified across Advisor, Coach, Reception and the Coach dashboard.
- Historically several payment paths never stamped it, so the Advisor disagreed with everyone else;
  every path now stamps it and a pre-deploy scan guards it.

### Payment integrity

- **"Fully Paid" means BOTH installments are paid** (`inst1 && inst2`).
- A missing due row was itself a bug — it produced a false "Fully Paid".
- Duplicate writes are idempotent.
- `_payDate(p)` = `paid_at || due_date || created_at` — a paid row lands on the day it was paid,
  an unpaid row on the day it was raised.

### The gateway never throws

`/db/query` always resolves. `try/catch` on a write is **dead code**. Use `_dbOk()` to check
`{error}`. Ignoring this previously caused duplicate payments and lost check-ins.

### Positional persistence (the biggest fragility)

`advisor_profile` and `coach_profile` store form values as an **array in DOM order**, plus parallel
arrays for pills and chips. Consequences:

- **Adding, moving or removing any input/select/textarea shifts every later field** on profiles saved
  earlier. When the recording bar moved into Health assessment, saves were versioned to **v:2** and
  a **v:1 → v:2 remap** was added (anchors read from the live DOM, no hardcoded indices).
- **Removing pills shifts pill state**, which is why "Recording status" was *hidden*, not deleted —
  deleting three pills would have corrupted consultation and payment status on every saved profile.
- `_advNamed` names the positional profile **by live label text**, so any badge or marker added to a
  label (e.g. a `*`) breaks `named[...]` lookups and blanks the coach's read-only views.

### Date bucketing

- **Toggle OFF:** every event buckets by the **lead's created date**.
- **Toggle ON:** each event uses **its own action date** — appointment date, `lead_activity` for
  call-status changes (there is no call-status date column), `enrolled_at`, consultation date.
- Money buckets by `_payDate`, visits by `_visitDate` (`visited_at` when parseable, else `appt_date`).

### Service tagging traps

`normService` and `_recSvcCode` disagree on multi-service strings, and `payments.service` tags
Sauna / HBOT / Weight-Loss rows as "Diabetes". Key transactions off **appointment-linked payment
rows**, not the raw service string.

### HC assignment

`HC assigned` is cleared on every lead open (it used to inherit the previous client's coach and the
slot board then snapshotted the wrong one into `hc_pt`), propagates to the pending appointment on
change, and re-syncs on save. Only `expected` appointments are ever rewritten — a `visited`
appointment is history.

### Activity log

- **Actor** = the authenticated user, resolved from the session (was a hardcoded `"ABM / Admin"`).
- **Insert precedes repaint** — the repaint re-reads the table, so rendering first showed the log
  without the entry just written.
- The renderer **merges** the local copy with the database rather than choosing one.
- **One action → one entry**: a save changing 50 fields writes a single summarised line.

### Paging

`OFFSET` paging over a non-unique sort key duplicates and drops rows — **always add a unique
tiebreaker**. `_pageAll(build, page=1000)` is the shared pager.

---

## 15. Vocabularies

### Call / lead statuses (24 codes)

| Code | Label | | Code | Label |
|---|---|---|---|---|
| `new` | New | | `wn` | Wrong Number |
| `dnd` | DND | | `afd` | Appointment Fixed – Direct |
| `rnr` | RNR | | `afz` | Appointment Fixed – Zoom |
| `busy` | Line Busy | | `apc` | Appointment Confirmed |
| `cb` | Call Back | | `vis` | Visited |
| `paid` | Already Paid | | `enr` | Enrolled |
| `fu` | Follow Up | | `payp` | Payment Pending |
| `so` | Switched Off | | `payc` | Payment Completed |
| `nreg` | Not Registered | | `int` | Interested |
| `nosugar` | No Sugar | | `nr` | Not Reachable |
| `ni` | Not Interested | | `cbr` | Callback Requested |
| `oos` | Out of Service | | `disc` | Disconnect |

- **`FU_REQUIRED_CODES`** = `cb, fu, rnr, busy, so, nr, cbr, disc` — the advisor must set a follow-up
  date (the call ended without an answer, so say when you'll retry).
- **`NO_CONTACT_CODES`** = `rnr, dnd, busy, cb, so, nreg, oos, wn, nr, disc` — nothing was learned,
  so **no** profile field is mandatory and every red `*` disappears.

### Sugar level

`No Sugar` · `150–250` · `Above 250`. Stored on `leads.sugar_poll`; the advisor's confirmed reading
wins over the raw Meta poll answer. Drives the Advisor's Sugar Level filter group and the
Sugar Pool column.

### Services (`SERVICE_MASTER`)

`Diabetes Counselling` · `Weight Loss Counselling` · `Sauna Bath` · `Cold Plunge` ·
`Physiotherapy` · `Blood Test` · `HBOT (Hyperbaric Oxygen Therapy)`

Reception shows a narrowed subset (UI only) — the master, the database and every other screen still
carry all seven, so records in a hidden service keep working.

### Required advisor fields (`ADV_REQUIRED`)

Name, Phone Number, Gender, Age, Occupation, Language, Location, Sugar level — one list drives both
Save validation and the red `*` marks, so a field can never be starred-but-unchecked.

### Programs

`L1`, `L2` (and their union, e.g. "L1 + L2" for a client enrolled in L2 who also paid L1).

---

## 16. Files, storage and recordings

| Kind | Where | Notes |
|---|---|---|
| **Office-visit audio** | `office_recordings` + `UPLOAD_DIR` | Recorded in-browser via `MediaRecorder`; **requires a secure context** (HTTPS or localhost) — on plain `http://` the microphone API is simply absent |
| **Call recordings** | `call_recordings` | Downloaded from Tata into local storage so playback survives provider URL expiry |
| **Zoom recordings** | `zoom_recordings` | Link only |
| **Payment proofs / reports** | `UPLOAD_DIR` | Base64 upload, authenticated download |

**A fixed bug worth knowing:** recordings used to be saved with the *uploader's* signed URL, so they
401'd for everyone else once that token expired. URLs are now stored bare (query string stripped) and
resolved per viewer via `getPublicUrl(file_path)`.

---

## 17. Reporting engine

The **Admin Report** (`s-reports`) is a per-metric bucketed report, not a single lead cohort.

| Metric group | Bucketed by | Source |
|---|---|---|
| Revenue, Collected, per-service, Avg Ticket, Full/Part Paid, Instalment, EMI | `_payDate(p)` | `payments` |
| Visited, Appt Fixed, Confirmed | `_visitDate(a)` | `appointments` |
| Total Leads, call statuses, sugar, screening, follow-up, location, source | `leads.created_at` | `leads` |

- **Revenue = billed** (full value including instalments still due); **Collected = received**;
  the gap is Outstanding.
- Every column group states its date basis in the header, so the mixed basis is explicit rather than
  hidden.
- Per-service columns are **generated from `SERVICE_MASTER`**, so adding a service adds its columns
  with no further code. Payments with a blank service surface under **Unassigned** rather than
  vanishing.
- Views: Period / Person; presets including ROAS and Revenue-by-service.
- The Activity toggle switches the whole report between lead-created-date and true action dates.

---

## 18. Frontend conventions

These are non-negotiable in this codebase (see `AGENTS.md`).

1. **New markup → `template.ts`. New logic → `app.ts`.** The UI is one HTML string rendered with
   `dangerouslySetInnerHTML`; interactions are `onclick="window._fn()"` handlers registered inside
   `initApp()`.
2. **Never hardcode `fetch("/api/...")`.** Use the `_api("/api/...")` helper — it only builds a URL,
   so it must be wrapped: `fetch(_api("/x"), { headers: authHeaders() })`. Hardcoding breaks the
   cross-origin dev split.
3. **`app/page.tsx` and `app/layout.tsx` must stay in `app/`** (App Router).
4. **Anything using a secret goes in `server/`**, never the client.
5. The client keeps the `@/* → src/*` alias; the server uses plain relative imports.
6. **Grid system:** `regGrid(id, colsFn, rerender)`, `gridApply`, `gridHead`. Header and row cells are
   separate strings — a column-count mismatch shifts every cell silently.
7. **CSS animation trap:** `animation: … both` with an `opacity:0` start frame pins an element
   invisible forever if it is inserted while hidden. This really happened to a whole table.
8. **`suppressHydrationWarning`** on `<main>` is deliberate: the browser normalises the hand-written
   HTML string, so it can never byte-match server output.

---

## 19. Configuration reference

### `server/.env`

| Key | Purpose |
|---|---|
| `PGHOST` `PGPORT` `PGUSER` `PGPASSWORD` `PGDATABASE` | PostgreSQL connection |
| `PORT` | Express port |
| `SESSION_SECRET` | **Set this** — otherwise sessions die on every restart |
| `CORS_ORIGIN` | Dev cross-origin allowance |
| `META_APP_ID` `META_APP_SECRET` | Meta app credentials |
| `META_ACCESS_TOKEN` | **Preferred token** — the one that returns attribution |
| `META_SYSTEM_ACCESS_TOKEN` | Fallback (⚠️ returns null campaign/ad names) |
| `META_PAGE_ACCESS_TOKEN` `META_PAGE_ID` `META_PAGE_IDS` | Page-form crawl |
| `META_AD_ACCOUNT_ID` `META_AD_ACCOUNTS` `META_ACTIVE_AD_ACCOUNTS` | Ad-account scope (overrides the in-code defaults) |
| `TATA_TELE_API_KEY` | Smartflo API key |
| `TATA_TELE_CALLER_ID` | Outbound caller ID |
| `TATA_TELE_DEFAULT_EXTENSION_NUMBER` | Fallback extension |
| `TATA_TELE_USE_SUPPORT_FALLBACK` | Fallback behaviour toggle |
| `UPLOAD_DIR` | File storage root (default `server/uploads`) |

### `client/.env.local` (dev only)

| Key | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Backend origin in dev. **Empty in production** — same origin |
| `NEXT_PUBLIC_BUILD_VERSION` | Build SHA baked in; compared with `/version` to show the Refresh banner |

---

## 20. Build, run and deploy

### Local development (two processes)

```bash
npm run install:all
npm run dev:server     # Express  → http://localhost:4100
npm run dev            # Next.js  → http://localhost:3000
```

Or via `.claude/launch.json`: the configurations `wellness-server` (4100) and `wellnessapp` (3000).

### Production (one process, one port, no Docker)

```bash
npm run install:all
# secrets into server/.env
npm run build          # builds client → client/out, then server → dist
npm start              # Express serves the API *and* client/out
```

### Pre-deploy validation

```bash
npm run predeploy      # typecheck + build + DB scan + version verify
```

### Every root script

| Script | Runs |
|---|---|
| `npm run dev` | `client` dev server (Next.js, port 3000) |
| `npm run dev:server` | `server` dev server (tsx watch, port 4100) |
| `npm run build` | client build **then** server build |
| `npm run build:client` / `build:server` | one side only |
| `npm start` | production server (serves the API and `client/out`) |
| `npm run typecheck` | `tsc --noEmit` on both sides |
| `npm run predeploy:scan` | `server/scripts/predeploy-scan.mjs` — data-integrity scan |
| `npm run predeploy` | typecheck → build → scan → `predeploy-verify.mjs` |
| `npm run install:all` | installs both `client` and `server` |
| `npm run migrate` | `server/scripts/run-migration.mjs` (one-off SQL runner; routine schema changes go through the self-applying schema instead) |

> **Note:** `README.md` still says the backend runs on **4200**. The real configured port is
> **4100** (`server/.env` → `PORT`, and `.claude/launch.json`). Trust 4100.

### Rules learned the hard way

- **A TypeScript error fails the build silently** — production then freezes on the last good commit.
  Always run the build and confirm the deploy reports READY.
- **Never run `npm run build` in `client/` while `next dev` is running** — it corrupts the dev
  compile; restart the dev server afterwards.
- **Deployment is manual** (the CI/CD pipeline was removed).
- **"Works locally, stale in production" is usually a browser on an old bundle** — the version banner
  now catches this.
- **Restart the backend explicitly after server edits**; the watcher is not always trustworthy.
- The schema applies itself on boot, so a deploy carries its own migrations.

---

## 21. Known issues and open items

### Blocking / operational

| Item | Detail |
|---|---|
| **Meta token lacks `ads_read`** | Both databases have had **no new leads since 10 Aug 11:47**. Grant `ads_read` on MHS Ad Account (2024). |
| **Deploy pending** | The HC-assignment prevention, the recording-playback fix, the BDM workflow and the assessment gate are all committed but not yet in production. The HC bug was still producing new mismatches during development. |

### Data quality

| Item | Detail |
|---|---|
| `appointments.visited_at` is **TEXT** | 8 rows hold time-only strings (`"04:30 pm"`) that cannot be parsed. Repairs are drafted but **await approval**. |
| **Confirmed card is structurally ~0** | Only 2 leads have `confirmed_at`. |
| **Historic activity actors** | ~1,900 rows still read `ABM / Admin`; there is no way to recover who really acted. Left as-is rather than rewriting history. |
| **Storage buckets** | Legacy note: some file uploads previously failed for want of buckets; storage is now local-filesystem. |

### Behavioural changes to communicate

| Item | Detail |
|---|---|
| **Saved assessments open read-only** | Any client with a saved coach profile now requires a BDM-approved edit to change. This applies to existing records, not just new ones. |
| **No manual Stop on recordings** | A recording ends only at *Save health record* (or when the coach starts another client). If neither happens, it keeps running. |

### Module maturity

Some modules are live and some remain static mock-ups pending new tables — Blood Test, Physio,
Accounts and Reports were the Phase-2 build; check current state before assuming a screen is wired.

---

## 22. Glossary

| Term | Meaning |
|---|---|
| **ABM** | Assign & approve screen (assignment/board management) |
| **BDM** | Business Development Manager — approves EMI deals and assessment edits |
| **HA** | Health Advisor (tele-sales) |
| **HC** | Health Coach (clinical consultation) |
| **L1 / L2** | Program tiers |
| **M0** | Baseline screening measurement |
| **RNR** | Ring No Response |
| **DND** | Do Not Disturb |
| **Hook rate** | 3-second video plays ÷ impressions |
| **CPL / CPQL / CPA / CPV / CPE** | Cost per Lead / Qualified Lead / Appointment / Visit / Enrolment |
| **ROAS** | Return On Ad Spend |
| **Pool** | Unassigned leads awaiting an advisor |
| **Screening** | Vitals capture on arrival |
| **Thyrocare** | The blood-test lab partner |
| **Smartflo** | Tata's cloud telephony product |

---

*Document generated 13 August 2026 from commit `1c88b62`. Figures and column lists were read from
the live database and the source tree; where a rule is stated it corresponds to code that exists.*
