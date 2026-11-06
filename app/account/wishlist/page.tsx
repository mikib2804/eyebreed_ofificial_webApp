import { prisma } from "@/lib/prisma";
import { requireCustomer } from "@/lib/account";
import { WishlistView } from "@/components/wishlist-view";

export default async function WishlistPage() {
  const user = await requireCustomer();
  const items = await prisma.wishlistItem.findMany({
    where: { userId: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <WishlistView
      initialItems={items.map(({ product }) => ({
        id: product.id,
        slug: product.slug,
        name: product.name,
        nameHe: product.nameHe ?? product.name,
        image: product.images[0] ?? null,
        prices: { USD: Number(product.priceUsd), ILS: Number(product.priceIls), EUR: Number(product.priceEur) },
      }))}
    />
  );
}
