import { NextResponse } from "next/server";
import { getActiveMaintenanceNotice } from "@/lib/maintenance";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { notice: await getActiveMaintenanceNotice() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
