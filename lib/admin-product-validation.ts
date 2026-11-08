import { z } from "zod";

function safeMediaUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("..")) return true;
  try {
    const url = new URL(value);
    const allowed = new Set(["images.unsplash.com", ...(process.env.MEDIA_ALLOWED_HOSTS ?? "").split(",").map((host) => host.trim().toLowerCase()).filter(Boolean)]);
    return url.protocol === "https:" && allowed.has(url.hostname.toLowerCase()) && !url.username && !url.password;
  } catch { return false; }
}

const mediaUrl = z.string().trim().min(1).max(2_048).refine(safeMediaUrl, "Media must be a safe local path or an HTTPS URL on an allowed host.");
const variant = z.object({ size: z.string().trim().min(1).max(30), color: z.string().trim().max(50).default(""), inventory: z.coerce.number().int().min(0).max(100_000) }).strict();

export const adminProductSchema = z.object({
  name: z.string().trim().min(2).max(120), nameHe: z.string().trim().max(120).default(""),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), categoryId: z.string().cuid(),
  description: z.string().trim().min(10).max(10_000), descriptionHe: z.string().trim().max(10_000).default(""),
  story: z.string().trim().max(10_000).default(""), storyHe: z.string().trim().max(10_000).default(""), material: z.string().trim().max(500).default(""),
  priceUsd: z.coerce.number().nonnegative().max(1_000_000), priceIls: z.coerce.number().nonnegative().max(1_000_000), priceEur: z.coerce.number().nonnegative().max(1_000_000),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]), featured: z.boolean(), bestSeller: z.boolean(), isNew: z.boolean(), lowStockThreshold: z.coerce.number().int().min(0).max(100_000),
  images: z.array(mediaUrl).min(1).max(12), videoUrl: z.union([mediaUrl, z.literal("")]), variants: z.array(variant).min(1).max(100),
}).strict().superRefine((data, context) => {
  const keys = new Set<string>();
  data.variants.forEach((item, index) => { const key = `${item.size.toLowerCase()}\0${item.color.toLowerCase()}`; if (keys.has(key)) context.addIssue({ code: "custom", path: ["variants", index], message: "Duplicate size/color variant." }); keys.add(key); });
});

export type AdminProductInput = z.infer<typeof adminProductSchema>;
