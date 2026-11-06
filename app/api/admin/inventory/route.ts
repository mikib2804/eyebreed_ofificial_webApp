import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const schema = z.object({ productId: z.string().cuid(), variantId: z.string().cuid().nullable().optional(), delta: z.coerce.number().int().min(-100_000).max(100_000).refine((value) => value !== 0), reason: z.string().trim().min(3).max(500) }).strict();
export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const access = await getAdminAccess(); if (access.status !== "authorized") return NextResponse.json({ error: "Forbidden" }, { status: access.status === "unauthenticated" ? 401 : 403 });
  const body = schema.safeParse(await request.json().catch(() => null)); if (!body.success) return NextResponse.json({ error: "Invalid inventory adjustment" }, { status: 400 });
  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: body.data.productId }, select: { inventory: true } }); if (!product) throw new Error("NOT_FOUND");
      const nextProduct = product.inventory + body.data.delta; if (nextProduct < 0) throw new Error("NEGATIVE");
      if (body.data.variantId) { const variant = await tx.productVariant.findFirst({ where: { id: body.data.variantId, productId: body.data.productId }, select: { inventory: true } }); if (!variant) throw new Error("NOT_FOUND"); if (variant.inventory + body.data.delta < 0) throw new Error("NEGATIVE"); await tx.productVariant.update({ where: { id: body.data.variantId }, data: { inventory: { increment: body.data.delta } } }); }
      await tx.product.update({ where: { id: body.data.productId }, data: { inventory: { increment: body.data.delta } } });
      const adjustment = await tx.inventoryAdjustment.create({ data: { productId: body.data.productId, variantId: body.data.variantId || null, delta: body.data.delta, reason: body.data.reason, actorId: access.user.id } });
      await tx.auditLog.create({ data: { actorId: access.user.id, action: "INVENTORY_ADJUSTED", entityType: "Product", entityId: body.data.productId, metadata: { before: product.inventory, after: nextProduct, delta: body.data.delta, variantId: body.data.variantId || null, reason: body.data.reason } } }); return adjustment;
    });
    return NextResponse.json({ ok: true, result }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error && error.message === "NEGATIVE" ? "Inventory cannot be negative" : "Product or variant not found" }, { status: 409 }); }
}
