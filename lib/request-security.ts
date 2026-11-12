/**
 * Cookie-authenticated mutations must come from this site's own origin.
 * Browsers attach Origin to fetch requests that use non-safe HTTP methods.
 */
export function isSameOriginMutation(request: Request): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader) return false;

  try {
    const browserOrigin = new URL(originHeader).origin;
    const internalOrigin = new URL(request.url).origin;
    if (browserOrigin === internalOrigin) return true;

    // Next.js can see the upstream address (127.0.0.1) while the browser uses
    // localhost, a LAN address, or the HTTPS hostname in front of Nginx. The
    // proxy preserves that public target in these headers.
    const forwardedHost = firstHeaderValue(request.headers.get("x-forwarded-host"));
    const host = forwardedHost ?? firstHeaderValue(request.headers.get("host"));
    if (!host) return false;

    const forwardedProtocol = firstHeaderValue(request.headers.get("x-forwarded-proto"));
    const protocol = forwardedProtocol ?? new URL(request.url).protocol.slice(0, -1);
    if (protocol !== "http" && protocol !== "https") return false;

    return browserOrigin === new URL(`${protocol}://${host}`).origin;
  } catch {
    return false;
  }
}

function firstHeaderValue(value: string | null): string | null {
  const first = value?.split(",", 1)[0]?.trim();
  return first || null;
}
