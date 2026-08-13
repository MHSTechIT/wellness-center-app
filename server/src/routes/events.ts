import type { Express, Request, Response } from 'express';
import { requireAuth } from '../shared/session';

// ============================================================
// Server-Sent Events — the app's ONLY server→client push channel.
//
// WHY THIS EXISTS: this stack deliberately has no websocket (see AGENTS.md), and the browser
// client's `supabase.channel()` is a no-op stub — so the "REAL-TIME: Supabase pushes new/changed
// leads instantly" subscription in app.ts never delivered anything. Every cross-page sync fix so
// far has therefore been CLIENT-side only: a BroadcastChannel (same browser only) plus a 30s poll.
// That is why "Advisor sets Appointment Fixed – Zoom on one machine, Reception/Admin sees it on
// another" kept needing a manual refresh, reported four times.
//
// SSE is plain HTTP on the existing Express server and the existing origin — no new
// infrastructure, no websocket, no proxy config. It gives genuine cross-device, cross-role push.
//
// PRIVACY: the stream carries NO row data and NO identifiers — only the NAME of the table that
// changed, e.g. {"t":"leads"}. It is a cache-invalidation signal, not a data channel: clients
// re-query through the authenticated /db/query gateway to actually read anything. That is why this
// endpoint does not require a session — EventSource cannot send an Authorization header, and the
// alternative (a token in the query string) would put a credential in URLs, logs and referrers.
// ============================================================

type SseClient = { id: number; res: Response };

let _nextId = 1;
const clients = new Set<SseClient>();

// Notify every connected browser that `table` changed. Called from the /db/query gateway, which
// is the single choke point every write from every page and role already goes through — so new
// features get real-time sync automatically, with no per-feature wiring to forget.
export function broadcastChange(table: string): void {
  if (!table || !clients.size) return;
  const frame = `data: ${JSON.stringify({ t: table })}\n\n`;
  for (const c of clients) {
    try { c.res.write(frame); } catch { /* dead socket — the close handler removes it */ }
  }
}

// Relay a check-in celebration to every connected device. Same privacy bar as broadcastChange:
// the frame carries a HASH of the lead id plus a timestamp — no name, no phone, no raw id. A
// receiving client hashes the leads it is ALREADY authorised to hold in memory and celebrates only
// on a match, which also scopes the animation to the people who can see that lead (its advisor,
// admins) with no role logic on this unauthenticated stream.
export function broadcastCheer(h: string, at: string): void {
  if (!h || !clients.size) return;
  const frame = `data: ${JSON.stringify({ t: '_cheer', h: String(h).slice(0, 32), at: String(at).slice(0, 40) })}\n\n`;
  for (const c of clients) {
    try { c.res.write(frame); } catch { /* dead socket — the close handler removes it */ }
  }
}

export function registerEventRoutes(app: Express) {
  app.get('/events', (req: Request, res: Response) => {
    res.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',   // no-transform: stop proxies buffering the stream
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',                   // disable nginx response buffering
    });
    res.flushHeaders?.();
    res.write('retry: 3000\n\n');                  // browser reconnects 3s after a drop

    const client: SseClient = { id: _nextId++, res };
    clients.add(client);

    // Comment frame every 25s. Idle connections are otherwise dropped by proxies/load balancers,
    // and a silently dead stream is worse than no stream — it looks connected but delivers nothing.
    const beat = setInterval(() => {
      try { res.write(': ping\n\n'); } catch { /* handled by close */ }
    }, 25000);

    const cleanup = () => { clearInterval(beat); clients.delete(client); };
    req.on('close', cleanup);
    req.on('error', cleanup);
  });

  // The stream is open (EventSource cannot send headers), but CAUSING a broadcast requires a
  // session — otherwise anyone could make every clinic screen celebrate at will.
  app.post('/events/cheer', requireAuth, (req: Request, res: Response) => {
    const h = String(req.body?.h || '').trim();
    const at = String(req.body?.at || '').trim();
    if (!h || !at) { res.status(400).json({ error: 'h and at are required' }); return; }
    broadcastCheer(h, at);
    res.json({ ok: true });
  });
}
