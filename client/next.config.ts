import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
