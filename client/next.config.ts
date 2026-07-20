import type { NextConfig } from "next";
import { execSync } from "child_process";

// Commit SHA baked into the client bundle at build time as NEXT_PUBLIC_BUILD_VERSION. The running
// client compares it to the server's /version to detect a newer deploy and prompt a reload. Prefer
// an explicit BUILD_VERSION env; else read the current commit; else "dev". next build inlines every
// literal process.env.NEXT_PUBLIC_* reference, even in output:"export".
function buildVersion(): string {
  if (process.env.BUILD_VERSION) return process.env.BUILD_VERSION;
  try { return execSync("git rev-parse --short HEAD").toString().trim(); } catch { return "dev"; }
}

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_BUILD_VERSION: buildVersion() },
  // Static export: `next build` emits a plain static site to client/out.
  // In production the Express server serves it on the SAME origin as the API,
  // so the browser's /db, /auth, /storage, /api calls hit the backend directly
  // — no proxy target, no CORS, nothing to misconfigure.
  output: "export",
  images: { unoptimized: true },
  // Hide the Next.js dev-mode on-screen indicator (the floating "N" badge). It is a
  // development-only overlay and never ships in the static export, but disabling it keeps
  // the local dev view clean. Compile/runtime errors are still surfaced.
  devIndicators: false,
};

export default nextConfig;
