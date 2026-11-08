import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isSameOriginMutation } from "@/lib/request-security";
import { consumeRateLimit } from "@/lib/rate-limit";

const idSchema = z.string().cuid();

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isSameOriginMutation(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rate = await consumeRateLimit("account-preorder", session.user.id, 30, 15 * 60);
  if (!rate.allowed) return NextResponse.json({ error: "Too many pre-order updates. Try again later." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const parsedId = idSchema.safeParse((await params).id);
  if (!parsedId.success) return NextResponse.json({ error: "Invalid pre-order" }, { status: 400 });
  const result = await prisma.preOrder.updateMany({ where: { id: parsedId.data, userId: session.user.id, status: "WAITING" }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: result.count === 1 }, { status: result.count ? 200 : 409 });
}
