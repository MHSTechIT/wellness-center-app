import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle (.next/standalone) for a lean Docker
  // image — ideal for ECS/Fargate.
  output: "standalone",
};

export default nextConfig;
