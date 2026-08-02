import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { MediaSection } from "@/components/media-section";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main><Hero /><ProductGrid /><MediaSection /></main>
      <Footer />
      <CartDrawer />
    </>
  );
}
