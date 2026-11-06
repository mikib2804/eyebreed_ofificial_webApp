import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { MediaSection } from "@/components/media-section";
import { ReelsSection } from "@/components/ReelsSection";
import { CartoonCollection } from "@/components/cartoon-collection";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { prisma } from "@/lib/prisma";
import { productWithVariants, toStoreProduct } from "@/lib/products";
import { campaignProducts } from "@/lib/campaign-catalog";
import { getInstagramVideos } from "@/lib/instagram";

export default async function Home() {
  const visionSlugs = campaignProducts.map((item) => item.slug);
  const [databaseProducts, reels] = await Promise.all([prisma.product.findMany({
      where: { status: "ACTIVE", slug: { in: visionSlugs } },
      include: productWithVariants,
    }), getInstagramVideos()]);
  const productsBySlug = new Map(databaseProducts.map((item) => [item.slug, toStoreProduct(item)] as const));
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
