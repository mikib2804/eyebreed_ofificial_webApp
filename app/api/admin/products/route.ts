import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const httpsUrl = z.string().url().refine(
  (value) => new URL(value).protocol === "https:",
  "Only HTTPS media URLs are allowed",
);

const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  nameHe: z.string().trim().max(120).optional(),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
  categoryId: z.string().min(1).max(64),
  priceUsd: z.coerce.number().nonnegative().max(1_000_000),
  priceIls: z.coerce.number().nonnegative().max(1_000_000),
  priceEur: z.coerce.number().nonnegative().max(1_000_000),
  inventory: z.coerce.number().int().nonnegative().max(100_000),
  imageUrl: httpsUrl,
  videoUrl: z.union([httpsUrl, z.literal("")]).optional(),
  description: z.string().trim().min(10).max(10_000),
}).strict();

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }

  const access = await getAdminAccess();
  if (access.status === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (access.status === "forbidden") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = productSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { imageUrl, ...data } = parsed.data;
  const product = await prisma.$transaction(async (transaction) => {
    const created = await transaction.product.create({
      data: {
        ...data,
        images: [imageUrl],
        videoUrl: data.videoUrl || null,
        story: data.description,
        status: "ACTIVE",
        variants: {
          create: ["XS", "S", "M", "L", "XL"].map((size) => ({
            size,
            inventory: Math.floor(data.inventory / 5),
          })),
        },
      },
    });

    await transaction.auditLog.create({
      data: {
        actorId: access.user.id,
        action: "PRODUCT_CREATED",
        entityType: "Product",
        entityId: created.id,
        metadata: { slug: created.slug, inventory: created.inventory },
      },
    });

    return created;
  });

  return NextResponse.json(product, { status: 201 });
}
