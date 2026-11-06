import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-auth";
import { discountInputSchema } from "@/lib/discount-validation";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (access.status === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = discountInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the discount settings.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { id } = await params;
  const { productIds, categoryIds, ...data } = parsed.data;
  try {
    const updated = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.discount.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return null;
      const discount = await transaction.discount.update({
        where: { id },
        data: {
          ...data,
          products: { set: data.scope === "PRODUCT" ? productIds.map((productId) => ({ id: productId })) : [] },
          categories: { set: data.scope === "CATEGORY" ? categoryIds.map((categoryId) => ({ id: categoryId })) : [] },
        },
      });
      await transaction.auditLog.create({ data: { actorId: access.user.id, action: "DISCOUNT_UPDATED", entityType: "Discount", entityId: discount.id, metadata: { code: discount.code, active: discount.active, scope: discount.scope, value: String(discount.value) } } });
      return discount;
    });
    if (!updated) return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That discount code already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not update the discount." }, { status: 500 });
  }
}
