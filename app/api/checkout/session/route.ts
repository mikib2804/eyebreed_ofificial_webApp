import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { quoteCart, QuoteError } from "@/lib/cart-quote";
import { cartQuoteInputSchema } from "@/lib/cart-quote-schema";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { getStripe } from "@/lib/stripe";
import { consumeRateLimit } from "@/lib/rate-limit";

function appOrigin() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (!configured) throw new Error("NEXT_PUBLIC_APP_URL is not configured.");
  const url = new URL(configured);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:")) throw new Error("Invalid application origin.");
  return url.origin;
}

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  if (process.env.STRIPE_CHECKOUT_ENABLED !== "true") return NextResponse.json({ error: "Test checkout is not enabled yet." }, { status: 503 });
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Sign in before checkout." }, { status: 401 });
  const rate = await consumeRateLimit("checkout", session.user.id, 10, 15 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many checkout attempts. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const parsed = cartQuoteInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart data." }, { status: 400 });

  let pendingOrder: { id: string; orderNumber: string; total: Prisma.Decimal; currency: string; customerEmail: string };
  try {
    pendingOrder = await prisma.$transaction(async (transaction) => {
      const [user, address] = await Promise.all([
        transaction.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, name: true } }),
        transaction.address.findFirst({ where: { userId: session.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }),
      ]);
      if (!user?.email) throw new QuoteError("EMAIL_REQUIRED", "Your account needs an email address before checkout.");
      if (!address) throw new QuoteError("ADDRESS_REQUIRED", "Add a shipping address before checkout.");
      const quote = await quoteCart(parsed.data, transaction);
      if (quote.total <= 0) throw new QuoteError("INVALID_TOTAL", "The order total must be greater than zero.");

      if (quote.appliedDiscountId) {
        const discount = await transaction.discount.findUniqueOrThrow({ where: { id: quote.appliedDiscountId } });
        if (discount.perCustomerLimit !== null) {
          const used = await transaction.discountRedemption.count({ where: { discountId: discount.id, OR: [{ userId: user.id }, { email: user.email }] } });
          if (used >= discount.perCustomerLimit) throw new QuoteError("CUSTOMER_LIMIT_REACHED", "You have already used this discount the maximum number of times.");
        }
        if (discount.usageLimit !== null) {
          const reserved = await transaction.discount.updateMany({ where: { id: discount.id, usageCount: { lt: discount.usageLimit } }, data: { usageCount: { increment: 1 } } });
          if (!reserved.count) throw new QuoteError("CODE_LIMIT_REACHED", "This discount code has reached its usage limit.");
        } else {
          await transaction.discount.update({ where: { id: discount.id }, data: { usageCount: { increment: 1 } } });
        }
      }

      const order = await transaction.order.create({
        data: {
          orderNumber: `EB-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`,
          userId: user.id,
          customerName: user.name ?? address.fullName,
          customerEmail: user.email,
          shippingAddress: { label: address.label, fullName: address.fullName, phone: address.phone, line1: address.line1, line2: address.line2, city: address.city, postalCode: address.postalCode, country: address.country },
          subtotal: quote.subtotal,
          discountAmount: quote.discountAmount,
          shippingAmount: quote.shippingAmount,
          taxAmount: 0,
          total: quote.total,
          currency: quote.currency,
          discountCode: quote.discountCode,
          promotionSnapshot: { ...quote.promotion, freeShipping: quote.freeShipping, quotedAt: new Date().toISOString() },
          items: { create: quote.lines.map((line) => ({ productId: line.productId, productName: line.name, size: line.size, color: line.color, quantity: line.quantity, unitPrice: line.unitAmount })) },
          history: { create: { action: "CHECKOUT_CREATED", note: "Trusted server quote accepted; awaiting Stripe payment.", actorId: user.id } },
        },
      });
      if (quote.appliedDiscountId) await transaction.discountRedemption.create({ data: { discountId: quote.appliedDiscountId, orderId: order.id, userId: user.id, email: user.email, amount: quote.discountAmount, currency: quote.currency } });
      return { id: order.id, orderNumber: order.orderNumber, total: order.total, currency: order.currency, customerEmail: order.customerEmail };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof QuoteError) return NextResponse.json({ error: error.message, code: error.code }, { status: error.status });
    return NextResponse.json({ error: "Could not create the pending order." }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const origin = appOrigin();
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: pendingOrder.customerEmail,
      line_items: [{ price_data: { currency: pendingOrder.currency.toLowerCase(), unit_amount: Math.round(Number(pendingOrder.total) * 100), product_data: { name: `EYEBREED order ${pendingOrder.orderNumber}` } }, quantity: 1 }],
      metadata: { orderId: pendingOrder.id, orderNumber: pendingOrder.orderNumber },
      payment_intent_data: { metadata: { orderId: pendingOrder.id, orderNumber: pendingOrder.orderNumber } },
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?order=${encodeURIComponent(pendingOrder.orderNumber)}`,
    }, { idempotencyKey: pendingOrder.id });
    await prisma.order.update({ where: { id: pendingOrder.id }, data: { stripeCheckoutSessionId: checkout.id } });
    return NextResponse.json({ url: checkout.url });
  } catch {
    await prisma.$transaction(async (transaction) => {
      const redemption = await transaction.discountRedemption.findUnique({ where: { orderId: pendingOrder.id } });
      await transaction.order.delete({ where: { id: pendingOrder.id } }).catch(() => null);
      if (redemption) await transaction.discount.update({ where: { id: redemption.discountId }, data: { usageCount: { decrement: 1 } } });
    }).catch(() => null);
    return NextResponse.json({ error: "Stripe test checkout is not configured or could not be created." }, { status: 503 });
  }
}
