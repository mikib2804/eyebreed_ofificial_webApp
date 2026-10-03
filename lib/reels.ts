export interface ReelItem {
  id: string;
  type: "video" | "image" | "instagram";
  src: string;
  poster?: string;
  title?: string;
  link: string;
  account?: string;
  likes?: number;
}

export function instagramReelEmbedUrl(link: string): string | null {
  try {
    const url = new URL(link);
    if (
      url.protocol !== "https:" ||
      !["instagram.com", "www.instagram.com"].includes(url.hostname)
    )
      return null;
    const match = url.pathname.match(
      /^\/(?:reel|reels|p)\/([A-Za-z0-9_-]+)\/?$/,
    );
    return match ? `https://www.instagram.com/reel/${match[1]}/embed/` : null;
  } catch {
    return null;
  }
}

// Add individual reel URLs here; Instagram supplies the video and its preview.
export const INSTAGRAM_REEL_LINKS: string[] = [
  "https://www.instagram.com/reel/DeCrxOesnXz/",
  "https://www.instagram.com/reel/DdzC3TlMv_Z/",
  "https://www.instagram.com/reel/DYuFiGAMqbI/",
  "https://www.instagram.com/reel/DYpQ4E-M7cP/",
  "https://www.instagram.com/reel/DYY-ZVIs4oy/",
  "https://www.instagram.com/reel/Dd-_7tzM_jH/",
];

export const INSTAGRAM_REELS: ReelItem[] = INSTAGRAM_REEL_LINKS.filter((link) =>
  instagramReelEmbedUrl(link),
).map((link, index) => ({
  id: `instagram-${index + 1}`,
  type: "instagram",
  src: instagramReelEmbedUrl(link)!,
  link,
  title: `EYEBREED Reel ${index + 1}`,
  account: "eyebreed_official",
}));

// Campaign previews until reel video files and individual Instagram URLs are supplied.
export const REELS_DATA: ReelItem[] = [
  {
    id: "1",
    type: "image",
    src: "/campaign/modernAll/DSCF0127.JPG",
    title: "Above the city",
  },
  {
    id: "2",
    type: "image",
    src: "/campaign/modernAll/DSCF0415.JPG",
    title: "Made for the streets",
  },
  {
    id: "3",
    type: "image",
    src: "/campaign/modernAll/DSCF0479.JPG",
    title: "The vision",
  },
  {
    id: "4",
    type: "image",
    src: "/campaign/modernAll/DSCF0181.JPG",
    title: "A different perspective",
  },
  {
    id: "5",
    type: "image",
    src: "/campaign/modernAll/DSCF0544.JPG",
    title: "Everyday expression",
  },
].map((item) => ({
  ...item,
  type: "image",
  link: "https://www.instagram.com/eyebreed_official/reels/",
}));
