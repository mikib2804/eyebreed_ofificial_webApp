import "server-only";

import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export type PublicMaintenanceNotice = {
  title: string;
  message: string;
  duration: string;
  startsAt: string;
  endsAt: string;
  subtitle: string | null;
};

export async function getActiveMaintenanceNotice(now = new Date()): Promise<PublicMaintenanceNotice | null> {
  try {
    const notice = await prisma.maintenanceNotice.findFirst({
      where: { active: true, startsAt: { lte: now } },
      orderBy: { startsAt: "desc" },
      select: { title: true, message: true, duration: true, startsAt: true, endsAt: true, subtitle: true },
    });
    return notice ? {
      ...notice,
      startsAt: notice.startsAt.toISOString(),
      endsAt: notice.endsAt.toISOString(),
    } : null;
  } catch (error) {
    // Keep the existing storefront available while a rolling deployment is
    // between shipping the code and applying the accompanying migration.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") return null;
    throw error;
  }
}

export async function maintenanceUnavailableResponse() {
  const notice = await getActiveMaintenanceNotice();
  if (!notice) return null;
  return NextResponse.json(
    { error: "The store is temporarily unavailable for maintenance.", code: "MAINTENANCE_ACTIVE" },
    { status: 503, headers: { "Cache-Control": "private, no-store", "Retry-After": "300" } },
  );
}
