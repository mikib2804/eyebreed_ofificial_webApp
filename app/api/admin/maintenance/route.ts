import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { maintenanceNoticeInputSchema } from "@/lib/maintenance-validation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

export async function POST(request: Request) {
  const authorization = await authorizeAdminMutation(request, "maintenance");
  if ("response" in authorization) return authorization.response;
  const raw = await readJsonBody(request, 16_384);
  if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const parsed = maintenanceNoticeInputSchema.safeParse(raw.data);
  if (!parsed.success) return NextResponse.json({ error: "Please check the maintenance notice fields.", fields: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { startsAt, endsAt, subtitle, ...values } = parsed.data;
  try {
    const notice = await prisma.$transaction(async (transaction) => {
      if (values.active) await transaction.maintenanceNotice.updateMany({ where: { active: true }, data: { active: false } });
      const created = await transaction.maintenanceNotice.create({ data: { ...values, subtitle: subtitle || null, startsAt: new Date(startsAt), endsAt: new Date(endsAt) } });
      await transaction.auditLog.create({ data: { actorId: authorization.access.user.id, action: "MAINTENANCE_NOTICE_CREATED", entityType: "MaintenanceNotice", entityId: created.id, metadata: { active: created.active, startsAt: created.startsAt.toISOString(), endsAt: created.endsAt.toISOString() } } });
      return created;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ id: notice.id }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Another maintenance notice is already active." }, { status: 409 });
    return NextResponse.json({ error: "Could not create the maintenance notice." }, { status: 500 });
  }
}
