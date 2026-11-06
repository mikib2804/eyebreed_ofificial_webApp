import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-auth";
import { discountInputSchema } from "@/lib/discount-validation";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

export async function POST(request: Request) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (access.status === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = discountInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the discount settings.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { productIds, categoryIds, ...data } = parsed.data;
  try {
    const discount = await prisma.$transaction(async (transaction) => {
      const created = await transaction.discount.create({
        data: {
          ...data,
          products: { connect: data.scope === "PRODUCT" ? productIds.map((id) => ({ id })) : [] },
          categories: { connect: data.scope === "CATEGORY" ? categoryIds.map((id) => ({ id })) : [] },
        },
      });
      await transaction.auditLog.create({ data: { actorId: access.user.id, action: "DISCOUNT_CREATED", entityType: "Discount", entityId: created.id, metadata: { code: created.code, type: created.type, scope: created.scope, value: String(created.value) } } });
      return created;
    });
    return NextResponse.json({ id: discount.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That discount code already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not create the discount." }, { status: 500 });
  }
}
