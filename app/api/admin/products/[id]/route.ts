import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { adminProductSchema } from "@/lib/admin-product-validation";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminMutation(request, "products");
  if ("response" in authorization) return authorization.response;
  const id = z.string().cuid().safeParse((await params).id);
  const body = await readJsonBody(request, 64_000);
  if (!id.success) return NextResponse.json({ error: "Invalid product" }, { status: 400 });
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = adminProductSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data", fields: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  try {
    await prisma.$transaction(async (tx) => {
      const before = await tx.product.findUniqueOrThrow({ where: { id: id.data }, select: { status: true, inventory: true } });
      await tx.productVariant.deleteMany({ where: { productId: id.data } });
      const updated = await tx.product.update({ where: { id: id.data }, data: {
        name: data.name, nameHe: data.nameHe || null, slug: data.slug, categoryId: data.categoryId,
        description: data.description, descriptionHe: data.descriptionHe || null, story: data.story || null, storyHe: data.storyHe || null,
        material: data.material || null, priceUsd: data.priceUsd, priceIls: data.priceIls, priceEur: data.priceEur,
        inventory: data.variants.reduce((sum, variant) => sum + variant.inventory, 0), images: data.images, videoUrl: data.videoUrl || null,
        status: data.status, featured: data.featured, bestSeller: data.bestSeller, isNew: data.isNew, lowStockThreshold: data.lowStockThreshold,
        variants: { create: data.variants },
      } });
      await tx.auditLog.create({ data: { actorId: authorization.access.user.id, action: "PRODUCT_UPDATED", entityType: "Product", entityId: updated.id, metadata: { statusBefore: before.status, statusAfter: updated.status, inventoryBefore: before.inventory, inventoryAfter: updated.inventory, variants: data.variants.length } } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That product slug or variant already exists." }, { status: 409 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not update product." }, { status: 500 });
  }
}
