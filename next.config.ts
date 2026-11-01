import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use a project-specific cache directory. This also avoids stale/locked
  // artifacts left in the conventional `.next` directory on Windows.
  distDir: ".next-eyebreed",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" }
    ]
  }
};

export default nextConfig;
