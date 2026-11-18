import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { adminProductSchema } from "@/lib/admin-product-validation";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

export async function POST(request: Request) {
  const authorization = await authorizeAdminMutation(request, "products");
  if ("response" in authorization) return authorization.response;
  const body = await readJsonBody(request, 64_000);
  if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
  const parsed = adminProductSchema.safeParse(body.data);
  if (!parsed.success) return NextResponse.json({ error: "Invalid product data", fields: parsed.error.flatten() }, { status: 400 });
  const data = parsed.data;
  try {
    const product = await prisma.$transaction(async (tx) => {
      const created = await tx.product.create({ data: {
        name: data.name, nameHe: data.nameHe || null, slug: data.slug, categoryId: data.categoryId,
        description: data.description, descriptionHe: data.descriptionHe || null, story: data.story || null, storyHe: data.storyHe || null,
        material: data.material || null, priceUsd: data.priceUsd, priceIls: data.priceIls, priceEur: data.priceEur,
        inventory: data.inventory, images: data.images, videoUrl: data.videoUrl || null,
        status: data.status, featured: data.featured, bestSeller: data.bestSeller, isNew: data.isNew, lowStockThreshold: data.lowStockThreshold,
        variants: { create: data.variants },
      } });
      await tx.auditLog.create({ data: { actorId: authorization.access.user.id, action: "PRODUCT_CREATED", entityType: "Product", entityId: created.id, metadata: { slug: created.slug, status: created.status, variants: data.variants.length } } });
      return created;
    });
    return NextResponse.json({ ok: true, id: product.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That product slug or variant already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not create product." }, { status: 500 });
  }
}
