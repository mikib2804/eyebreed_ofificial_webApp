import "server-only";

export type BodyReadResult =
  | { ok: true; data: unknown }
  | { ok: false; status: 400 | 413 | 415; error: string };

export async function readJsonBody(request: Request, maxBytes = 16_384): Promise<BodyReadResult> {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return { ok: false, status: 415, error: "Content-Type must be application/json." };
  }
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return { ok: false, status: 413, error: "Request body is too large." };
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return { ok: false, status: 413, error: "Request body is too large." };
  try { return { ok: true, data: JSON.parse(raw) }; }
  catch { return { ok: false, status: 400, error: "Invalid JSON request." }; }
}
