import "server-only";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";

export function requestFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("x-real-ip")?.trim() || forwarded || "unknown";
}

export async function consumeRateLimit(scope: string, identity: string, limit: number, windowSeconds: number) {
  const salt = process.env.AUTH_SECRET || "eyebreed-rate-limit";
  const key = createHash("sha256").update(`${salt}:${scope}:${identity}`).digest("hex");
  const rows = await prisma.$queryRaw<Array<{ count: number; expiresAt: Date }>>`
    INSERT INTO "RateLimitBucket" ("key", "count", "expiresAt", "updatedAt")
    VALUES (${key}, 1, CURRENT_TIMESTAMP + (${windowSeconds} * INTERVAL '1 second'), CURRENT_TIMESTAMP)
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimitBucket"."expiresAt" <= CURRENT_TIMESTAMP THEN 1 ELSE "RateLimitBucket"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimitBucket"."expiresAt" <= CURRENT_TIMESTAMP THEN CURRENT_TIMESTAMP + (${windowSeconds} * INTERVAL '1 second') ELSE "RateLimitBucket"."expiresAt" END,
      "updatedAt" = CURRENT_TIMESTAMP
    RETURNING "count", "expiresAt"
  `;
  const bucket = rows[0];
  return { allowed: Boolean(bucket && bucket.count <= limit), remaining: Math.max(0, limit - (bucket?.count ?? limit)), retryAfter: Math.max(1, Math.ceil(((bucket?.expiresAt.getTime() ?? Date.now()) - Date.now()) / 1000)) };
}
