import type { Prisma } from "@prisma/client";
import type { StoreProduct } from "@/lib/catalog";

export const productWithVariants = { variants: { orderBy: { size: "asc" as const } } };

type DbProduct = Prisma.ProductGetPayload<{ include: typeof productWithVariants }>;

export function toStoreProduct(product: DbProduct): StoreProduct {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    nameHe: product.nameHe ?? product.name,
    material: product.material ?? "",
    image: product.images[0] ?? "/logo.jpg",
    description: product.description,
    descriptionHe: product.descriptionHe ?? product.description,
    story: product.story ?? "Designed as a lasting part of the modern wardrobe, with considered proportions and an uncompromising attention to material.",
    storyHe: product.storyHe ?? product.story ?? product.descriptionHe ?? product.description,
    inventory: product.variants.length > 0 ? product.variants.reduce((sum, variant) => sum + variant.inventory, 0) : product.inventory,
    sizes: product.variants.length > 0 ? product.variants.map(({ size, inventory }) => ({ size, inventory })) : [{ size: "ONE SIZE", inventory: product.inventory }],
    prices: {
      USD: Number(product.priceUsd),
      ILS: Number(product.priceIls),
      EUR: Number(product.priceEur)
    }
  };
}
