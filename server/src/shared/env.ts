// Centralised environment loading. Imported FIRST from index.ts (before any module that
// reads process.env at import time, e.g. the pg pool), so every secret is in place.
//
// Load order (earlier wins — override:false keeps the first non-empty value for a key):
//   1) <cwd>/.env         — the server's primary env file (server/.env in dev/prod)
//   2) <cwd>/.env.local   — operator-local overrides next to the server, if present
//   3) <repo-root>/.env.local — the shared repo-root .env.local (holds Tata Tele creds, etc.)
// This makes the credentials configured in .env.local available to the calling integration
// without changing how any other variable is resolved.
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();                                                              // <cwd>/.env
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });           // <cwd>/.env.local
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env.local') });     // <repo-root>/.env.local
