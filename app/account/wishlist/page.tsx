import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/account";
import { WishlistView } from "@/components/wishlist-view";
import { campaignProducts, campaignProductToStoreProduct } from "@/lib/campaign-catalog";
import type { StoreProduct } from "@/lib/catalog";

export default async function WishlistPage() {
  const user = await requireCustomer();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: { include: { variants: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <WishlistView
      initialItems={items.map(({ product }) => {
        const campaignProduct = campaignProducts.find((item) => item.slug === product.slug);
        const databaseProduct: StoreProduct = {
          id: product.id,
          slug: product.slug,
          name: product.name,
          nameHe: product.nameHe ?? product.name,
          material: product.material ?? "",
          image: product.images[0] ?? "",
          images: product.images,
          description: product.description,
          descriptionHe: product.descriptionHe ?? product.description,
          story: product.story ?? "",
          storyHe: product.storyHe ?? product.story ?? "",
          inventory: product.inventory,
          sizes: product.variants.map((variant) => ({ size: variant.size, inventory: product.inventory })),
          prices: { USD: Number(product.priceUsd), ILS: Number(product.priceIls), EUR: Number(product.priceEur) },
        };
        return campaignProduct
          ? campaignProductToStoreProduct(campaignProduct, databaseProduct)
          : databaseProduct;
      })}
    />
  );
}
