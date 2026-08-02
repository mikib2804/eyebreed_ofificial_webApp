import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const productSchema = z.object({
  name: z.string().min(2),
  nameHe: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  categoryId: z.string().min(1),
  priceUsd: z.coerce.number().nonnegative(),
  priceIls: z.coerce.number().nonnegative(),
  priceEur: z.coerce.number().nonnegative(),
  inventory: z.coerce.number().int().nonnegative(),
  imageUrl: z.string().url(),
  videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
  description: z.string().min(10)
});

export async function POST(request: Request) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = productSchema.safeParse(Object.fromEntries(await request.formData()));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const { imageUrl, ...data } = parsed.data;
  const product = await prisma.product.create({
    data: { ...data, images: [imageUrl], videoUrl: data.videoUrl || null, status: "ACTIVE" }
  });
  return NextResponse.json(product, { status: 201 });
}
