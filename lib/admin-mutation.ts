import "server-only";
import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-auth";
import { consumeRateLimit } from "@/lib/rate-limit";
import { isSameOriginMutation } from "@/lib/request-security";
import { getRequestId, logServerEvent } from "@/lib/server-log";

export async function authorizeAdminMutation(request: Request, scope: string) {
  const requestId = getRequestId(request);
  if (!isSameOriginMutation(request)) {
    logServerEvent("warn", "admin", requestId, "origin_rejected", { scope });
    return { response: NextResponse.json({ error: "Invalid request origin" }, { status: 403, headers: { "X-Request-ID": requestId } }) } as const;
  }
  const access = await getAdminAccess();
  if (access.status !== "authorized") {
    logServerEvent("warn", "admin", requestId, "access_rejected", { scope, reason: access.status });
    return { response: NextResponse.json({ error: access.status === "unauthenticated" ? "Unauthorized" : "Forbidden" }, { status: access.status === "unauthenticated" ? 401 : 403, headers: { "X-Request-ID": requestId } }) } as const;
  }
  const rate = await consumeRateLimit(`admin:${scope}`, access.user.id, 120, 15 * 60);
  if (!rate.allowed) {
    logServerEvent("warn", "admin", requestId, "rate_limited", { scope });
    return { response: NextResponse.json({ error: "Too many admin changes. Try again shortly." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter), "X-Request-ID": requestId } }) } as const;
  }
  return { access, requestId } as const;
}
