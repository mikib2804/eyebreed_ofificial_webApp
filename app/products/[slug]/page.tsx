import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductDetail } from "@/components/product-detail";
import { prisma } from "@/lib/prisma";
import { productWithVariants, toStoreProduct } from "@/lib/products";
import { campaignProducts, campaignProductToStoreProduct } from "@/lib/campaign-catalog";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaignProduct = campaignProducts.find((item) => item.slug === slug);
  const dbProduct = await prisma.product
    .findFirst({ where: { slug, status: "ACTIVE" }, include: productWithVariants })
    .catch(() => null);
  if (!dbProduct && !campaignProduct) notFound();
  const databaseProduct = dbProduct ? toStoreProduct(dbProduct) : undefined;
  const product = campaignProduct
    ? campaignProductToStoreProduct(campaignProduct, databaseProduct)
    : databaseProduct!;

  return (
    <>
      <Navbar />
      <ProductDetail product={product} />
      <Footer />
      <CartDrawer />
    </>
  );
}
