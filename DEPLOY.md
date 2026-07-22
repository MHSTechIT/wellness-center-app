# Deploy runbook — and why "works in dev, breaks in prod" happens

This app runs as **one** Node/Express process serving both the API and the built
frontend (`client/out`), against **one shared PostgreSQL** database that dev and
prod both point at. Because the database is shared, **dev and prod see the same
data** — so a status that looks different between them is almost never a "data
sync" problem. It is one of exactly three things:

## The three real causes (in order of how often they bite)

1. **Stale production bundle.** This is a single-page app: once a browser tab
   loads `initApp()`, it keeps running that JavaScript for hours/days with no
   reload. If a deploy didn't fully take (client not rebuilt, or the server not
   restarted, or the browser served a cached bundle), prod runs **old code**
   while dev runs new code — the classic "fixed in dev, still broken in prod."
   *Guard:* every build bakes its commit SHA. The footer + login card show it,
   the server reports it at `/version`, and open tabs get a **"New version —
   Refresh"** banner when they differ. Verify with `PROD_URL=… npm run
   predeploy:scan`… (see step 4).

2. **Timing-dependent UI logic.** A label/stage computed from data that loads
   **asynchronously** (payment rows) can render a generic/stale value before the
   data arrives, and only get corrected on some later event. Which value "wins"
   depends on execution timing, which differs between dev (unminified, HMR) and
   prod (minified, faster). *Guard:* status labels are now recomputed
   **unconditionally** once their authoritative data loads — no path renders a
   label from not-yet-loaded data. If you add a new status label, follow the same
   rule (compute from the loaded DB rows, never from a dropdown default or a
   not-yet-populated map).

3. **Bad rows in the shared database.** Duplicate paid installments or stale
   `due` rows can make a stage read "Fully Paid" when it isn't. Because the DB is
   shared, this shows **identically** in dev and prod (so it's not really an
   environment bug) — but combined with a stale bundle it *feels* like one.
   *Guard:* `npm run predeploy:scan` flags these before every deploy.

## Pre-deploy validation — run this every time

From the repo root:

```
npm run predeploy
```

This runs, and **stops on the first failure**:
1. `typecheck` — client + server `tsc --noEmit`. A TS error otherwise fails the
   build silently and freezes prod on the last good bundle.
2. `build` — client (`next build` → `client/out`) **and** server (`tsc` → `dist/`).
3. `predeploy:scan` — read-only DB scan for payment/enrollment anomalies
   (duplicate paid rows, stale dues, "fully paid" contradictions). **Exit 1 if any
   found** — clean them before deploying.
4. `predeploy-verify` — prints the commit SHA this build will bake in.

Run just the data scan any time (read-only, safe): `npm run predeploy:scan`.

## Deploy steps (on the server)

Manual by design (no CI). Do **all** of these — skipping the rebuild or restart
is cause #1 above.

```
git fetch origin && git reset --hard origin/main
npm --prefix client run build      # rebuild the FRONTEND bundle (client/out)
npm --prefix server run build      # rebuild the SERVER (dist/) — new API routes 404 without this
pm2 restart <app>                  # restart so dist/ + the new /version SHA take effect
```

Environment variables (`.env`, `.env.local`) are gitignored — they are **not**
deployed by git. If a feature depends on a new secret (e.g. Tata telephony), set
it on the server before restarting.

## Verify prod == local (do this after every deploy)

```
PROD_URL=https://<your-domain> node server/scripts/predeploy-verify.mjs
```

- ✅ `PROD == LOCAL` → production is serving the current build.
- ❌ `MISMATCH` → the deploy didn't fully take. Re-run the deploy steps, then
  hard-reload the browser (open tabs get the in-app **Refresh** banner).

Cross-check by eye: the SHA in the app's **sidebar footer / login card** must
equal `git rev-parse --short HEAD` locally and the `/version` value in prod.

## If a status still looks wrong

1. Is prod on the current SHA? (`predeploy-verify`). If not → stale bundle, redeploy.
2. Is the browser tab on the current SHA? (footer). If not → click Refresh / hard-reload.
3. Still wrong on the current build → run `npm run predeploy:scan`; a flagged row
   is a data problem to clean, not a code bug.
4. None of the above → it's a genuine code bug; reproduce in dev on the same lead.
