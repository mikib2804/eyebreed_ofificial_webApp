import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { MediaSection } from "@/components/media-section";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { prisma } from "@/lib/prisma";
import { productWithVariants, toStoreProduct } from "@/lib/products";
import { campaignProducts, campaignProductToStoreProduct } from "@/lib/campaign-catalog";

export default async function Home() {
  const visionSlugs = campaignProducts.map((item) => item.slug);
  const products = await prisma.product
    .findMany({
      where: { status: "ACTIVE", slug: { in: visionSlugs } },
      include: productWithVariants,
    })
    .then((items) => {
      const databaseBySlug = new Map(items.map((item) => {
        const product = toStoreProduct(item);
        return [product.slug, product] as const;
      }));
      return campaignProducts.map((item) =>
        campaignProductToStoreProduct(item, databaseBySlug.get(item.slug)),
      );
    })
    .catch(() => campaignProducts.map((item) => campaignProductToStoreProduct(item)));

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
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
