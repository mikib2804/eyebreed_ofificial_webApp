import { NextRequest, NextResponse } from "next/server";

/**
 * This is only an early UX redirect. Protected layouts, pages, and API routes
 * still verify the signed session and authorization server-side. Avoiding the
 * full Auth.js bundle here keeps Node-only crypto/compression out of Edge.
 */
export function middleware(request: NextRequest) {
  const sessionCookiePrefix = process.env.NODE_ENV === "production"
    ? "__Secure-eyebreed.session"
    : "eyebreed.session";
  const hasSessionCookie = request.cookies.getAll().some(({ name }) => name === sessionCookiePrefix || name.startsWith(`${sessionCookiePrefix}.`));
  if (hasSessionCookie) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("callbackUrl", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/admin/:path*", "/account/:path*"] };
