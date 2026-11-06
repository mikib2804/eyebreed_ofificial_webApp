import "server-only";

export function getAppOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (!configured) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  const url = new URL(configured);
  if (url.protocol === "https:") return url.origin;
  if (process.env.NODE_ENV !== "production" && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname)) return url.origin;
  throw new Error("NEXT_PUBLIC_APP_URL must be HTTPS in production.");
}
