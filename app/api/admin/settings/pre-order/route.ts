import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

const schema = z.object({ enabled: z.boolean() }).strict();

export async function PATCH(request: Request) {
  const authorization = await authorizeAdminMutation(request, "settings-pre-order");
  if ("response" in authorization) return authorization.response;
  const raw = await readJsonBody(request, 2_048);
  if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const body = schema.safeParse(raw.data);
  if (!body.success) return NextResponse.json({ error: "Invalid pre-order setting" }, { status: 400 });

  await prisma.$transaction(async (transaction) => {
    await transaction.storeSettings.upsert({
      where: { id: "store" },
      update: { globalPreOrderMode: body.data.enabled },
      create: { id: "store", globalPreOrderMode: body.data.enabled },
    });
    await transaction.auditLog.create({
      data: {
        actorId: authorization.access.user.id,
        action: "PRE_ORDER_MODE_UPDATED",
        entityType: "StoreSettings",
        entityId: "store",
        metadata: { enabled: body.data.enabled },
      },
    });
  });

  return NextResponse.json({ enabled: body.data.enabled });
}
