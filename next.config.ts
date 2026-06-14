import type { NextConfig } from "next";

// Static HTML export is only needed for the Capacitor (Android) build, which
// can't run server-side API routes. On Vercel we build the full app so the
// /api routes are deployed as serverless functions.
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isCapacitorBuild
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {}),
  trailingSlash: true,
};

export default nextConfig;
