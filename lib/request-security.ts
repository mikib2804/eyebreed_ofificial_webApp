/**
 * Cookie-authenticated mutations must come from this site's own origin.
 * Browsers attach Origin to fetch requests that use non-safe HTTP methods.
 */
export function isSameOriginMutation(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
