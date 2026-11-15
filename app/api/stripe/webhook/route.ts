import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";
import { getRequestId, logServerEvent } from "@/lib/server-log";
import { sendOrderConfirmationEmail, sendPaymentUnsuccessfulEmail } from "@/lib/email";

export async function POST(request: Request) {
  const requestId = getRequestId(request);
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > 1_048_576) return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });

  let event: Stripe.Event;
  try {
    const raw = await request.text();
    if (Buffer.byteLength(raw, "utf8") > 1_048_576) return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (error) {
    logServerEvent("warn", "stripe-webhook", requestId, "signature_rejected", { errorType: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400, headers: { "X-Request-ID": requestId } });
  }

  if (!["checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired", "payment_intent.payment_failed"].includes(event.type)) return NextResponse.json({ received: true });
  const stripeObject = event.data.object as Stripe.Checkout.Session | Stripe.PaymentIntent;
  const checkout = stripeObject as Stripe.Checkout.Session;
  const orderId = stripeObject.metadata?.orderId;
  if (!orderId) return NextResponse.json({ error: "Missing order metadata." }, { status: 400 });

  try {
    const notification = await prisma.$transaction(async (transaction) => {
      await transaction.stripeWebhookEvent.create({ data: { id: event.id, type: event.type } });
      const order = await transaction.order.findUnique({ where: { id: orderId }, include: { items: true, discountRedemption: true, user: { select: { emailLocale: true } } } });
      if (!order) throw new Error("Order not found");

      if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed" || event.type === "payment_intent.payment_failed") {
        if (order.paymentStatus !== "PENDING") return null;
        if (order.discountRedemption) {
          await transaction.discountRedemption.delete({ where: { orderId: order.id } });
          await transaction.discount.update({ where: { id: order.discountRedemption.discountId }, data: { usageCount: { decrement: 1 } } });
        }
        const interrupted = event.type === "checkout.session.expired";
        await transaction.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: "FAILED", history: { create: { action: interrupted ? "CHECKOUT_EXPIRED" : "PAYMENT_FAILED", note: interrupted ? "Stripe Checkout session expired before payment." : "Stripe reported an asynchronous payment failure." } } } });
        return { kind: interrupted ? "interrupted" as const : "failed" as const, order };
      }

      if (order.paymentStatus === "PAID") return null;
      if (event.type === "checkout.session.completed" && checkout.payment_status !== "paid") return null;
      for (const item of order.items) {
        if (!item.productId) continue;
        const variant = await transaction.productVariant.findFirst({ where: { productId: item.productId, size: item.size ?? "", color: item.color ?? "" }, select: { id: true } });
        if (variant) {
          const adjusted = await transaction.productVariant.updateMany({ where: { id: variant.id, inventory: { gte: item.quantity } }, data: { inventory: { decrement: item.quantity } } });
          if (!adjusted.count) throw new Error("Insufficient variant inventory");
        } else {
          const adjusted = await transaction.product.updateMany({ where: { id: item.productId, inventory: { gte: item.quantity } }, data: { inventory: { decrement: item.quantity } } });
          if (!adjusted.count) throw new Error("Insufficient product inventory");
        }
        await transaction.inventoryAdjustment.create({ data: { productId: item.productId, variantId: variant?.id, delta: -item.quantity, reason: `Stripe payment for ${order.orderNumber}` } });
      }
      const paymentIntent = typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;
      await transaction.order.update({ where: { id: order.id }, data: { status: "PAID", paymentStatus: "PAID", stripePaymentIntentId: paymentIntent ?? null, paidAt: new Date(), history: { create: { action: "PAYMENT_CONFIRMED", note: `Verified Stripe event ${event.id}.` } } } });
      return { kind: "paid" as const, order };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (notification?.kind === "paid") await sendOrderConfirmationEmail(notification.order).catch((error) => logServerEvent("error", "email", requestId, "order_confirmation_failed", { errorType: error instanceof Error ? error.name : "unknown" }));
    else if (notification) await sendPaymentUnsuccessfulEmail(notification.order, notification.kind).catch((error) => logServerEvent("error", "email", requestId, "payment_notification_failed", { errorType: error instanceof Error ? error.name : "unknown" }));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ received: true, duplicate: true });
    logServerEvent("error", "stripe-webhook", requestId, "processing_failed", { eventType: event.type, errorType: error instanceof Error ? error.name : "unknown" });
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500, headers: { "X-Request-ID": requestId } });
  }
  return NextResponse.json({ received: true });
}
