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

// The catalog comes from PostgreSQL at request time. Keeping this route dynamic
// also lets the Docker image build without baking database credentials into it.
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
        type: "PERCENTAGE",
        scope: "PRODUCT",
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      select: { name: true, value: true, products: { select: { id: true } } },
    }), getInstagramVideos()]);
  const discountByProductId = new Map<string, { percentage: number; label: string }>();
  for (const discount of productDiscounts) {
    for (const product of discount.products) {
      const percentage = Number(discount.value);
      const current = discountByProductId.get(product.id);
      if (!current || percentage > current.percentage) discountByProductId.set(product.id, { percentage, label: discount.name });
    }
  }
  const productsBySlug = new Map(databaseProducts.map((item) => {
    const product = toStoreProduct(item);
    const discount = discountByProductId.get(item.id);
    return [item.slug, applyPercentageDiscount(product, discount?.percentage ?? 0, discount?.label)] as const;
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
