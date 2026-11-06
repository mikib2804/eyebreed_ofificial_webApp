import "server-only";
import type { ReelItem } from "@/lib/reels";

type GraphMedia = { id: string; caption?: string; media_type?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"; media_product_type?: "AD" | "FEED" | "STORY" | "REELS"; media_url?: string; thumbnail_url?: string; permalink?: string; timestamp?: string; children?: { data?: GraphMedia[] } };
type GraphResponse = { data?: GraphMedia[]; error?: { message?: string; type?: string; code?: number } };
const GRAPH_API_VERSION = process.env.INSTAGRAM_GRAPH_API_VERSION ?? "v24.0";

function toReel(media: GraphMedia, parent?: GraphMedia): ReelItem | null {
  if (media.media_type !== "VIDEO" || !media.media_url) return null;
  const source = parent ?? media;
  return { id: media.id, type: "video", src: media.media_url, poster: media.thumbnail_url ?? source.thumbnail_url, title: source.caption?.trim().split(/\r?\n/)[0]?.slice(0, 120) || "EYEBREED on Instagram", link: source.permalink ?? "https://www.instagram.com/eyebreed_official/", account: "eyebreed_official", publishedAt: source.timestamp };
}

export async function getInstagramVideos(limit = 12): Promise<ReelItem[]> {
  const userId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!userId || !accessToken) { console.warn("Instagram Graph API is not configured. Set INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN."); return []; }
  const fields = ["id", "caption", "media_type", "media_product_type", "media_url", "thumbnail_url", "permalink", "timestamp", "children{id,media_type,media_url,thumbnail_url}"].join(",");
  const url = new URL(`https://graph.facebook.com/${GRAPH_API_VERSION}/${userId}/media`);
  url.searchParams.set("fields", fields); url.searchParams.set("limit", String(Math.min(50, Math.max(limit * 2, 20)))); url.searchParams.set("access_token", accessToken);
  const response = await fetch(url, { next: { revalidate: 1800 } });
  const payload = (await response.json()) as GraphResponse;
  if (!response.ok || payload.error) { console.error("Instagram Graph API request failed", { status: response.status, type: payload.error?.type, code: payload.error?.code, message: payload.error?.message }); return []; }
  return (payload.data ?? []).flatMap((media) => { const direct = toReel(media); if (direct) return [direct]; return (media.children?.data ?? []).map((child) => toReel(child, media)).filter((item): item is ReelItem => Boolean(item)); }).slice(0, limit);
}
