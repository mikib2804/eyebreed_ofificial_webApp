import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const httpsUrl = z.string().url().refine((value) => new URL(value).protocol === "https:");
const schema = z.object({ name: z.string().trim().min(2).max(120), nameHe: z.string().trim().max(120), description: z.string().trim().min(10).max(10_000), priceUsd: z.coerce.number().nonnegative().max(1_000_000), priceIls: z.coerce.number().nonnegative().max(1_000_000), priceEur: z.coerce.number().nonnegative().max(1_000_000), status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]), imageUrl: httpsUrl }).strict();
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 }); const access = await getAdminAccess(); if (access.status !== "authorized") return NextResponse.json({ error: "Forbidden" }, { status: access.status === "unauthenticated" ? 401 : 403 });
  const id = z.string().cuid().safeParse((await params).id); const body = schema.safeParse(await request.json().catch(() => null)); if (!id.success || !body.success) return NextResponse.json({ error: "Invalid product update" }, { status: 400 });
  const { imageUrl, ...data } = body.data; const product = await prisma.$transaction(async (tx) => { const updated = await tx.product.update({ where: { id: id.data }, data: { ...data, nameHe: data.nameHe || null, images: [imageUrl] } }); await tx.auditLog.create({ data: { actorId: access.user.id, action: "PRODUCT_UPDATED", entityType: "Product", entityId: updated.id, metadata: { status: updated.status } } }); return updated; }).catch(() => null);
  return product ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Product not found" }, { status: 404 });
}
