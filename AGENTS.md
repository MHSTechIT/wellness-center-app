<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project structure (Client + Server monorepo)

Two independent, separately-deployable apps. See `README.md` for run/deploy.

```
client/                     FRONTEND — Next.js 16 + React 19
  src/app/
    page.tsx        Thin client component: mounts the shell + useEffect → initApp()
    layout.tsx      Root layout
    globals.css     Styles
  src/client/
    template.ts     getMainContent() — the full UI markup (HTML string)
    app.ts          initApp(root) — all client logic, state and window.* handlers
  src/shared/
    supabase.ts     Supabase browser client
  Dockerfile, next.config.ts (output: "standalone")

server/                     BACKEND — Node + Express (owns all secrets)
  src/index.ts      Express app (CORS, JSON, routes, daily token refresh)
  src/routes/
    meta.ts         /api/meta/{leads,sync,token}
    calls.ts        /api/calls/{initiate,webhook,latest-type,recordings}
  src/services/
    meta.ts         Meta Graph API crawl + Supabase sync (framework-agnostic)
    tata.ts         Tata/Smartflo click-to-call
  src/shared/supabase.ts    Supabase server client (service-role capable)
  Dockerfile, tsconfig.json (tsc → dist/)
```

Notes:
- **Client → Server** calls go through `NEXT_PUBLIC_API_BASE_URL`. In
  `client/src/client/app.ts` every backend call uses the `_api("/api/...")`
  helper — never hardcode `fetch("/api/...")`, or it breaks the cross-origin split.
- The client's `app/page.tsx`, `app/layout.tsx` MUST stay in `app/` (App Router).
- The UI is a single HTML template (`template.ts`) rendered via
  `dangerouslySetInnerHTML`; interactions are `onclick="window._fn()"` handlers
  registered inside `initApp()`. New markup → `template.ts`; new logic → `app.ts`.
- Backend integrations / anything using secrets go in `server/` (never the client).
- The server uses plain relative imports (no `@/` alias); the client keeps `@/* → src/*`.
