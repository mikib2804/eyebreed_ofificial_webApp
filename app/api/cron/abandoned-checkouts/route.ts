import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentUnsuccessfulEmail } from "@/lib/email";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret) return false;
  const a = Buffer.from(secret); const b = Buffer.from(supplied);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  if (!process.env.CRON_SECRET) return NextResponse.json({ error: "Cron is not configured." }, { status: 503 });
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cutoff = new Date(Date.now() - 45 * 60 * 1000);
  const orders = await prisma.order.findMany({
    where: { paymentStatus: "PENDING", status: "PENDING_PAYMENT", stripeCheckoutSessionId: { not: null }, createdAt: { lte: cutoff } },
    select: { id: true, orderNumber: true, customerEmail: true, user: { select: { emailLocale: true } } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  const results = await Promise.all(orders.map((order) => sendPaymentUnsuccessfulEmail(order, "interrupted")));
  return NextResponse.json({ checked: orders.length, sent: results.filter((result) => result.sent).length });
}
