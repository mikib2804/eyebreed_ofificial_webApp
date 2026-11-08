import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/admin-auth";

export async function GET() {
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") {
    return NextResponse.json({ authorized: false }, { status: 401, headers: { "Cache-Control": "private, no-store" } });
  }
  if (access.status === "forbidden") {
    return NextResponse.json({ authorized: false }, { status: 403, headers: { "Cache-Control": "private, no-store" } });
  }
  return NextResponse.json({ authorized: true }, { headers: { "Cache-Control": "private, no-store" } });
}
