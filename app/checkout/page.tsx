import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CheckoutFlow } from "@/components/checkout-flow";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { prisma } from "@/lib/prisma";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user.id) redirect("/login?callbackUrl=/checkout");

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <>
    <Navbar />
    <CheckoutFlow addresses={addresses.map((address) => ({
      id: address.id,
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2,
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault,
    }))} />
    <Footer />
    <CartDrawer />
  </>;
}
