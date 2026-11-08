import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user.id) {
    // Reading the guest wishlist is intentionally an empty, cache-free result.
    // Mutating wishlist routes remain authenticated and return 401 for guests.
    return NextResponse.json(
      { productIds: [] },
      { headers: { "Cache-Control": "no-store" } },
    );
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
