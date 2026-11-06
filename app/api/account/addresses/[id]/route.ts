import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";

const updateSchema = z.object({
  label: z.string().trim().min(1).max(30).optional(),
  fullName: z.string().trim().min(2).max(80).optional(),
  phone: z.string().trim().max(30).nullable().optional(),
  line1: z.string().trim().min(3).max(120).optional(),
  line2: z.string().trim().max(120).nullable().optional(),
  city: z.string().trim().min(2).max(80).optional(),
  postalCode: z.string().trim().max(20).nullable().optional(),
  country: z.string().trim().min(2).max(80).optional(),
  isDefault: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "No changes supplied");

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please check the address details." }, { status: 400 });
  const { id } = await params;

  const updated = await prisma.$transaction(async (transaction) => {
    const current = await transaction.address.findFirst({ where: { id, userId: session.user.id } });
    if (!current) return null;
    if (parsed.data.isDefault === true) {
      await transaction.address.updateMany({ where: { userId: session.user.id, id: { not: id } }, data: { isDefault: false } });
    }
    const { isDefault, ...details } = parsed.data;
    return transaction.address.update({
      where: { id: current.id },
      data: {
        ...details,
        // Never leave an address book without a default by unchecking the
        // current default. Switching defaults is handled atomically above.
        ...(isDefault === true ? { isDefault: true } : isDefault === false && !current.isDefault ? { isDefault: false } : {}),
      },
    });
  });

  if (!updated) return NextResponse.json({ error: "Address not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const deleted = await prisma.$transaction(async (transaction) => {
    const address = await transaction.address.findFirst({ where: { id, userId: session.user.id }, select: { id: true, isDefault: true } });
    if (!address) return false;
    await transaction.address.delete({ where: { id: address.id } });
    if (address.isDefault) {
      const replacement = await transaction.address.findFirst({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, select: { id: true } });
      if (replacement) await transaction.address.update({ where: { id: replacement.id }, data: { isDefault: true } });
    }
    return true;
  });
  return NextResponse.json({ ok: deleted }, { status: deleted ? 200 : 404 });
}
