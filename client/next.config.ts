import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` emits a plain static site to client/out.
  // In production the Express server serves it on the SAME origin as the API,
  // so the browser's /db, /auth, /storage, /api calls hit the backend directly
  // — no proxy target, no CORS, nothing to misconfigure.
  output: "export",
  images: { unoptimized: true },
};

export default nextConfig;
