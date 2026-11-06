import { NextResponse } from "next/server";
import { getInstagramVideos } from "@/lib/instagram";

export async function GET() {
  const videos = await getInstagramVideos();
  return NextResponse.json({ videos }, {
    headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
  });
}
