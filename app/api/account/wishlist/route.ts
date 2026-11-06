import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user.id) {
    return NextResponse.json({ productIds: [] }, { status: 401 });
  }

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  });

  return NextResponse.json(
    { productIds: items.map((item) => item.productId) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
