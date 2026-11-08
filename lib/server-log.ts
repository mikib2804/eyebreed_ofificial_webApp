import "server-only";
import { randomUUID } from "node:crypto";

const SAFE_REQUEST_ID = /^[A-Za-z0-9._:-]{1,64}$/;

export function getRequestId(request: Request) {
  const supplied = request.headers.get("x-request-id")?.trim();
  return supplied && SAFE_REQUEST_ID.test(supplied) ? supplied : randomUUID();
}

type SafeValue = string | number | boolean | null;

export function logServerEvent(level: "warn" | "error", area: string, requestId: string, event: string, metadata: Record<string, SafeValue> = {}) {
  const entry = JSON.stringify({ timestamp: new Date().toISOString(), level, area, requestId, event, ...metadata });
  if (level === "error") console.error(entry);
  else console.warn(entry);
}
