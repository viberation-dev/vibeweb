import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Server actions cap request bodies at 1MB by default; profile photos
    // may be up to 2MB (VIB-178), plus multipart overhead.
    serverActions: { bodySizeLimit: "3mb" },
  },
};

export default nextConfig;
