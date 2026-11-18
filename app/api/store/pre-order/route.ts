import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "store" },
    select: { globalPreOrderMode: true },
  });
  return NextResponse.json(
    { enabled: settings?.globalPreOrderMode ?? false },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
