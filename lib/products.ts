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
    image: product.images[0] ?? "/app_icons/logo.jpg",
    images: product.images.length ? product.images : ["/app_icons/logo.jpg"],
    description: product.description,
    descriptionHe: product.descriptionHe ?? product.description,
    story: product.story ?? "Designed as a lasting part of the modern wardrobe, with considered proportions and an uncompromising attention to material.",
    storyHe: product.storyHe ?? product.story ?? product.descriptionHe ?? product.description,
    inventory: product.inventory,
    sizes: product.variants.map(({ size }) => ({ size, inventory: product.inventory })),
    prices: {
      USD: Number(product.priceUsd),
      ILS: Number(product.priceIls),
      EUR: Number(product.priceEur)
    }
  };
}

export function applyPercentageDiscount(product: StoreProduct, percentage: number, label?: string): StoreProduct {
  const safePercentage = Math.min(100, Math.max(0, percentage));
  if (safePercentage <= 0) return product;
  const multiplier = 1 - safePercentage / 100;
  return {
    ...product,
    saleLabel: label?.trim() ? `${label.trim()} · ${safePercentage}%` : `${safePercentage}% SALE`,
    compareAtPrices: { ...product.prices },
    prices: {
      USD: Math.round(product.prices.USD * multiplier * 100) / 100,
      ILS: Math.round(product.prices.ILS * multiplier * 100) / 100,
      EUR: Math.round(product.prices.EUR * multiplier * 100) / 100,
    },
  };
}
