import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { discountInputSchema } from "@/lib/discount-validation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";
import { z } from "zod";
import { sendDiscountCampaign } from "@/lib/email";
import { logServerEvent } from "@/lib/server-log";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminMutation(request, "discounts"); if ("response" in authorization) return authorization.response;
  const raw = await readJsonBody(request, 16_384); if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const parsed = discountInputSchema.safeParse(raw.data);
  if (!parsed.success) return NextResponse.json({ error: "Please check the discount settings.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const parsedId = z.string().cuid().safeParse((await params).id); if (!parsedId.success) return NextResponse.json({ error: "Invalid discount" }, { status: 400 }); const id = parsedId.data;
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
      await transaction.auditLog.create({ data: { actorId: authorization.access.user.id, action: "DISCOUNT_UPDATED", entityType: "Discount", entityId: discount.id, metadata: { code: discount.code, active: discount.active, scope: discount.scope, value: String(discount.value) } } });
      return discount;
    });
    if (!updated) return NextResponse.json({ error: "Discount not found." }, { status: 404 });
    const campaign = await sendDiscountCampaign(updated.id).catch((error) => { logServerEvent("error", "email", updated.id, "discount_campaign_failed", { errorType: error instanceof Error ? error.name : "unknown" }); return { recipients: 0 }; });
    return NextResponse.json({ ok: true, marketingRecipients: campaign.recipients });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "That discount code already exists." }, { status: 409 });
    return NextResponse.json({ error: "Could not update the discount." }, { status: 500 });
  }
}
