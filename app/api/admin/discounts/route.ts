import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { discountInputSchema } from "@/lib/discount-validation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

export async function POST(request: Request) {
  const authorization = await authorizeAdminMutation(request, "discounts"); if ("response" in authorization) return authorization.response;
  const raw = await readJsonBody(request, 16_384); if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const parsed = discountInputSchema.safeParse(raw.data);
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
      await transaction.auditLog.create({ data: { actorId: authorization.access.user.id, action: "DISCOUNT_CREATED", entityType: "Discount", entityId: created.id, metadata: { code: created.code, type: created.type, scope: created.scope, value: String(created.value) } } });
      return created;
    });
    return NextResponse.json({ id: discount.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That discount code already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not create the discount." }, { status: 500 });
  }
}
