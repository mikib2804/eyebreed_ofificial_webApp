import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { MediaSection } from "@/components/media-section";
import { ReelsSection } from "@/components/ReelsSection";
import { CartoonCollection } from "@/components/cartoon-collection";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { prisma } from "@/lib/prisma";
import { applyPercentageDiscount, productWithVariants, toStoreProduct } from "@/lib/products";
import { campaignProducts } from "@/lib/campaign-catalog";
import { getInstagramVideos } from "@/lib/instagram";

// The catalog and discounts come from PostgreSQL and must be resolved when a
// request arrives, not while the Docker image is being built.
export const dynamic = "force-dynamic";

export default async function Home() {
  const visionSlugs = campaignProducts.map((item) => item.slug);
  const now = new Date();
  const [databaseProducts, productDiscounts, reels] = await Promise.all([prisma.product.findMany({
      where: { status: "ACTIVE", slug: { in: visionSlugs } },
      include: productWithVariants,
    }), prisma.discount.findMany({
      where: {
        active: true,
        code: null,
        type: { in: ["PERCENTAGE", "FIXED"] },
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      select: {
        name: true,
        type: true,
        scope: true,
        value: true,
        minimumPurchase: true,
        usageLimit: true,
        usageCount: true,
        products: { select: { id: true } },
        categories: { select: { id: true } },
      },
    }), getInstagramVideos()]);
  const discountByProductId = new Map<string, { percentage: number; label: string }>();
  const bundleLabelByProductId = new Map<string, string>();
  for (const discount of productDiscounts) {
    if (discount.usageLimit !== null && discount.usageCount >= discount.usageLimit) continue;
    if (discount.minimumPurchase !== null) continue;
    const linkedProductIds = new Set(discount.products.map((product) => product.id));
    const linkedCategoryIds = new Set(discount.categories.map((category) => category.id));
    if (discount.type === "FIXED") {
      if (discount.scope === "PRODUCT" && linkedProductIds.size > 1) {
        for (const productId of linkedProductIds) bundleLabelByProductId.set(productId, discount.name);
      }
      continue;
    }
    for (const product of databaseProducts) {
      const applies = discount.scope === "STORE"
        || (discount.scope === "PRODUCT" && linkedProductIds.has(product.id))
        || (discount.scope === "CATEGORY" && linkedCategoryIds.has(product.categoryId));
      if (!applies) continue;
      const percentage = Number(discount.value);
      const current = discountByProductId.get(product.id);
      if (!current || percentage > current.percentage) discountByProductId.set(product.id, { percentage, label: discount.name });
    }
  }
  const productsBySlug = new Map(databaseProducts.map((item) => {
    const product = toStoreProduct(item);
    const discount = discountByProductId.get(item.id);
    const discountedProduct = applyPercentageDiscount(product, discount?.percentage ?? 0, discount?.label);
    return [item.slug, {
      ...discountedProduct,
      saleLabel: discountedProduct.saleLabel ?? bundleLabelByProductId.get(item.id),
    }] as const;
  }));
  const products = visionSlugs.flatMap((slug) => {
    const product = productsBySlug.get(slug);
    return product ? [product] : [];
  });

  return (
    <>
      <link rel="icon" href="/icon.ico" />
      <Navbar />
      <main>
        <Hero />
        <ProductGrid
          products={products}
          displayImages={Object.fromEntries(campaignProducts.map((item) => [item.slug, item.visionImage]))}
        />
        <MediaSection />
        <ReelsSection items={reels} />
        <CartoonCollection />
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
