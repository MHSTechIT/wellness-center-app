<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project structure (layered)

The code is split into clear layers. One Next.js app, but frontend and backend
concerns live in separate folders:

```
src/
  app/        Next.js delivery shell (framework-required locations only)
    page.tsx        Thin client component: mounts the shell + useEffect → initApp()
    layout.tsx      Root layout
    globals.css     Styles
    api/**/route.ts Thin HTTP handlers → delegate to server/
  client/     FRONTEND
    template.ts     getMainContent() — the full UI markup (HTML string)
    app.ts          initApp(root) — all client logic, state and window.* handlers
  server/     BACKEND (server-only; secrets never reach the client)
    meta.ts         Meta Graph API crawl + Supabase sync
    tata.ts         Tata/Smartflo click-to-call integration
  shared/     Used by both layers
    supabase.ts     Supabase data client
```

Import via the `@/*` alias → `src/*` (e.g. `@/server/meta`, `@/shared/supabase`).

Notes:
- `app/page.tsx`, `app/layout.tsx`, `app/api/**/route.ts` MUST stay in `app/`
  (App Router requirement) — they are the delivery shell, not business logic.
- The UI is a single HTML template (`template.ts`) rendered via
  `dangerouslySetInnerHTML`; interactions are `onclick="window._fn()"` handlers
  registered inside `initApp()` (`client/app.ts`). Keep new UI markup in
  `template.ts` and new handlers/logic in `client/app.ts`.
- Backend integrations and anything using secrets go in `server/`.
