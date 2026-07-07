import type { NextConfig } from "next";

// The backend the client's API calls are proxied to. Same-origin from the
// browser's perspective (no CORS, no build-time NEXT_PUBLIC coupling); Next
// forwards to this target. Override with API_PROXY_TARGET at build/run.
const API_TARGET = process.env.API_PROXY_TARGET || "http://localhost:4200";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for a lean Docker
  // image — ideal for ECS/Fargate.
  output: "standalone",
  async rewrites() {
    return [
      { source: "/db/:path*", destination: `${API_TARGET}/db/:path*` },
      { source: "/auth/:path*", destination: `${API_TARGET}/auth/:path*` },
      { source: "/storage/:path*", destination: `${API_TARGET}/storage/:path*` },
      { source: "/api/:path*", destination: `${API_TARGET}/api/:path*` },
    ];
  },
};

export default nextConfig;
