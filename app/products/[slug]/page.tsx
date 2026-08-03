import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { ProductDetail } from "@/components/product-detail";
import { prisma } from "@/lib/prisma";
import { productWithVariants, toStoreProduct } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dbProduct = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    include: productWithVariants
  });

  if (!dbProduct) notFound();
  const product = toStoreProduct(dbProduct);

  return <><Navbar /><ProductDetail product={product} /><Footer /><CartDrawer /></>;
}
