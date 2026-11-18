import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authorizeAdminMutation } from "@/lib/admin-mutation";
import { maintenanceNoticeInputSchema, maintenanceNoticeUpdateSchema } from "@/lib/maintenance-validation";
import { prisma } from "@/lib/prisma";
import { readJsonBody } from "@/lib/request-body";

const idSchema = z.string().cuid();

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminMutation(request, "maintenance");
  if ("response" in authorization) return authorization.response;
  const id = idSchema.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: "Invalid maintenance notice." }, { status: 400 });
  const raw = await readJsonBody(request, 16_384);
  if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const update = maintenanceNoticeUpdateSchema.safeParse(raw.data);
  if (!update.success) return NextResponse.json({ error: "Please check the maintenance notice fields.", fields: update.error.flatten().fieldErrors }, { status: 400 });
  try {
    const updated = await prisma.$transaction(async (transaction) => {
      const existing = await transaction.maintenanceNotice.findUnique({ where: { id: id.data } });
      if (!existing) return null;
      const candidate = maintenanceNoticeInputSchema.safeParse({
        title: update.data.title ?? existing.title,
        message: update.data.message ?? existing.message,
        duration: update.data.duration ?? existing.duration,
        startsAt: update.data.startsAt ?? existing.startsAt.toISOString(),
        endsAt: update.data.endsAt ?? existing.endsAt.toISOString(),
        active: update.data.active ?? existing.active,
        subtitle: update.data.subtitle ?? existing.subtitle ?? "",
      });
      if (!candidate.success) throw new Error("INVALID_NOTICE");
      if (candidate.data.active) await transaction.maintenanceNotice.updateMany({ where: { active: true, id: { not: id.data } }, data: { active: false } });
      const notice = await transaction.maintenanceNotice.update({
        where: { id: id.data },
        data: { ...candidate.data, subtitle: candidate.data.subtitle || null, startsAt: new Date(candidate.data.startsAt), endsAt: new Date(candidate.data.endsAt) },
      });
      await transaction.auditLog.create({ data: { actorId: authorization.access.user.id, action: "MAINTENANCE_NOTICE_UPDATED", entityType: "MaintenanceNotice", entityId: notice.id, metadata: { active: notice.active, startsAt: notice.startsAt.toISOString(), endsAt: notice.endsAt.toISOString() } } });
      return notice;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    if (!updated) return NextResponse.json({ error: "Maintenance notice not found." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_NOTICE") return NextResponse.json({ error: "End time must be after the start time." }, { status: 400 });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return NextResponse.json({ error: "Another maintenance notice is already active." }, { status: 409 });
    return NextResponse.json({ error: "Could not update the maintenance notice." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const authorization = await authorizeAdminMutation(request, "maintenance");
  if ("response" in authorization) return authorization.response;
  const id = idSchema.safeParse((await params).id);
  if (!id.success) return NextResponse.json({ error: "Invalid maintenance notice." }, { status: 400 });
  try {
    await prisma.$transaction(async (transaction) => {
      const removed = await transaction.maintenanceNotice.delete({ where: { id: id.data } });
      await transaction.auditLog.create({ data: { actorId: authorization.access.user.id, action: "MAINTENANCE_NOTICE_DELETED", entityType: "MaintenanceNotice", entityId: removed.id, metadata: { title: removed.title, active: removed.active } } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") return NextResponse.json({ error: "Maintenance notice not found." }, { status: 404 });
    return NextResponse.json({ error: "Could not delete the maintenance notice." }, { status: 500 });
  }
}
