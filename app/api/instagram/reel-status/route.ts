import { NextRequest, NextResponse } from "next/server";
import { instagramReelEmbedUrl } from "@/lib/reels";

export async function GET(request: NextRequest) {
  const link = request.nextUrl.searchParams.get("url") ?? "";
  const embedUrl = instagramReelEmbedUrl(link);

  if (!embedUrl) {
    return NextResponse.json({ available: false }, { status: 400 });
  }

  try {
    const response = await fetch(embedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; EYEBREED-Reel-Availability/1.0)",
      },
      next: { revalidate: 3600 },
    });
    const html = await response.text();
    const hasPlayableContext =
      /"contextJSON"\s*:\s*(?:"(?!null)|\{)/.test(html);

    return NextResponse.json(
      { available: response.ok && hasPlayableContext },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json({ available: false });
  }
}
