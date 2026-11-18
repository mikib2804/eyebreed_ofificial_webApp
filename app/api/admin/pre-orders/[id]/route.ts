import { randomUUID } from "node:crypto";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { quoteCart, QuoteError } from "@/lib/cart-quote";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";
import { maintenanceUnavailableResponse } from "@/lib/maintenance";

const schema = z.object({ status: z.enum(["WAITING", "PRODUCT_AVAILABLE", "CUSTOMER_NOTIFIED", "CONVERTED_TO_ORDER", "CANCELLED"]) }).strict();
const transitions: Record<string, readonly string[]> = { WAITING: ["PRODUCT_AVAILABLE", "CANCELLED"], PRODUCT_AVAILABLE: ["CUSTOMER_NOTIFIED", "CANCELLED"], CUSTOMER_NOTIFIED: ["CONVERTED_TO_ORDER", "CANCELLED"], CONVERTED_TO_ORDER: [], CANCELLED: [] };

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminMutation(request, "preorders"); if ("response" in authorization) return authorization.response;
  const id = z.string().cuid().safeParse((await params).id); if (!id.success) return NextResponse.json({ error: "Invalid pre-order" }, { status: 400 });
  const raw = await readJsonBody(request, 4_096); if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const body = schema.safeParse(raw.data); if (!body.success) return NextResponse.json({ error: "Invalid pre-order update" }, { status: 400 });
  if (body.data.status === "CONVERTED_TO_ORDER") {
    const maintenance = await maintenanceUnavailableResponse();
    if (maintenance) return maintenance;
  }
  try {
    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.preOrder.findUnique({ where: { id: id.data }, include: { user: { select: { id: true, name: true, email: true } }, product: { select: { name: true } } } });
      if (!current) throw new Error("NOT_FOUND");
      if (body.data.status !== current.status && !transitions[current.status].includes(body.data.status)) throw new Error("INVALID_TRANSITION");
      let convertedOrderId = current.convertedOrderId;
      if (body.data.status === "CONVERTED_TO_ORDER" && current.status !== "CONVERTED_TO_ORDER") {
        if (!current.user?.email) throw new Error("LINKED_CUSTOMER_REQUIRED");
        const address = await tx.address.findFirst({ where: { userId: current.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] });
        if (!address) throw new Error("ADDRESS_REQUIRED");
        const quote = await quoteCart({ currency: "ILS", items: [{ productId: current.productId, quantity: current.quantity, size: current.size, color: current.color }] }, tx);
        const order = await tx.order.create({ data: {
          orderNumber: `EB-PO-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`, userId: current.user.id,
          customerName: current.user.name ?? current.customerName, customerEmail: current.user.email,
          shippingAddress: { label: address.label, fullName: address.fullName, phone: address.phone, line1: address.line1, line2: address.line2, city: address.city, postalCode: address.postalCode, country: address.country },
          subtotal: quote.subtotal, discountAmount: quote.discountAmount, shippingAmount: quote.shippingAmount, taxAmount: 0, total: quote.total, currency: quote.currency,
          discountCode: quote.discountCode, promotionSnapshot: { promotion: quote.promotion, shippingEnabled: quote.shippingEnabled, freeShipping: quote.freeShipping, source: "PREORDER_CONVERSION", quotedAt: new Date().toISOString() },
          items: { create: quote.lines.map((line) => ({ productId: line.productId, productName: line.name, size: line.size, color: line.color, quantity: line.quantity, unitPrice: line.unitAmount })) },
          history: { create: { action: "PREORDER_CONVERTED", note: `Converted from pre-order ${current.id}`, actorId: authorization.access.user.id } },
        } });
        convertedOrderId = order.id;
      }
      const updated = await tx.preOrder.update({ where: { id: current.id }, data: { status: body.data.status, convertedOrderId, contactedAt: body.data.status === "PRODUCT_AVAILABLE" ? new Date() : undefined, notifiedAt: body.data.status === "CUSTOMER_NOTIFIED" ? new Date() : undefined } });
      await tx.auditLog.create({ data: { actorId: authorization.access.user.id, action: body.data.status === "CONVERTED_TO_ORDER" ? "PREORDER_CONVERTED" : "PREORDER_UPDATED", entityType: "PreOrder", entityId: current.id, metadata: { from: current.status, to: updated.status, convertedOrderId } } });
      return { status: updated.status, convertedOrderId };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof QuoteError) return NextResponse.json({ error: error.message }, { status: error.status });
    const code = error instanceof Error ? error.message : "";
    const known: Record<string, [string, number]> = { NOT_FOUND: ["Pre-order not found", 404], INVALID_TRANSITION: ["Invalid status transition", 409], LINKED_CUSTOMER_REQUIRED: ["Link this pre-order to a verified customer before conversion.", 409], ADDRESS_REQUIRED: ["The customer needs a shipping address before conversion.", 409] };
    const response = known[code] ?? ["Could not update pre-order.", 500]; return NextResponse.json({ error: response[0] }, { status: response[1] });
  }
}
