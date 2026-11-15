import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";
const additionalMediaHosts = (process.env.MEDIA_ALLOWED_HOSTS ?? "").split(",").map((host) => host.trim()).filter((host) => host && host !== "images.unsplash.com");
const allowedImageSources = ["'self'", "data:", "blob:", "https://images.unsplash.com", "https://*.cdninstagram.com", "https://*.fbcdn.net", ...additionalMediaHosts.map((host) => `https://${host}`)].join(" ");
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self' https://checkout.stripe.com",
  `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src ${allowedImageSources}`,
  "media-src 'self' blob: https://*.cdninstagram.com https://*.fbcdn.net",
  "font-src 'self' data:",
  "connect-src 'self'",
  ...(!isDevelopment ? ["upgrade-insecure-requests"] : []),
].join("; ");

const nextConfig: NextConfig = {
  // Produce the minimal self-contained server used by the production image.
  output: "standalone",
  // Keep the long-running development server away from the production build
  // output. Netlify and `next start` continue to use Next.js' standard `.next`.
  distDir: isDevelopment ? ".next-dev" : ".next",
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      ...additionalMediaHosts.map((hostname) => ({ protocol: "https" as const, hostname })),
    ]
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        { key: "Content-Security-Policy", value: contentSecurityPolicy },
      ],
    }];
  },
};

export default nextConfig;
