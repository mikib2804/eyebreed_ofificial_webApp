import { NextResponse } from "next/server";
import { quoteCart, QuoteError } from "@/lib/cart-quote";
import { cartQuoteInputSchema } from "@/lib/cart-quote-schema";
import { isSameOriginMutation } from "@/lib/request-security";
import { consumeRateLimit, requestFingerprint } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin", code: "INVALID_ORIGIN" }, { status: 403 });
  const rate = await consumeRateLimit("cart-quote", requestFingerprint(request), 60, 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many quote requests.", code: "RATE_LIMITED" }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const parsed = cartQuoteInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart data.", code: "INVALID_CART" }, { status: 400 });
  try {
    return NextResponse.json(await quoteCart(parsed.data), { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof QuoteError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    return NextResponse.json({ error: "Could not calculate the cart total.", code: "QUOTE_FAILED" }, { status: 500 });
  }
}
