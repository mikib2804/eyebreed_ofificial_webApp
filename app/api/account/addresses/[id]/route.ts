import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { addressUpdateSchema } from "@/lib/address-schema";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";
import { readJsonBody } from "@/lib/request-body";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rate = await consumeRateLimit("account-address", session.user.id, 40, 15 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many address updates. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const raw = await readJsonBody(request, 8_192);
  if (!raw.ok) return NextResponse.json({ error: raw.error }, { status: raw.status });
  const parsed = addressUpdateSchema.safeParse(raw.data);
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
  const rate = await consumeRateLimit("account-address", session.user.id, 40, 15 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many address updates. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
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
