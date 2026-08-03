import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { MediaSection } from "@/components/media-section";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { prisma } from "@/lib/prisma";
import { productWithVariants, toStoreProduct } from "@/lib/products";

export default async function Home() {
  const dbProducts = await prisma.product.findMany({
    where: { status: "ACTIVE" },
    include: productWithVariants,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }]
  });
  const products = dbProducts.map(toStoreProduct);

  return (
    <>
      <Navbar />
      <main><Hero /><ProductGrid products={products} /><MediaSection /></main>
      <Footer />
      <CartDrawer />
    </>
  );
}
