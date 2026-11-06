import { AddressBook } from "@/components/address-book";
import { requireCustomer } from "@/lib/account";
import { prisma } from "@/lib/prisma";

export default async function AddressesPage() {
  const user = await requireCustomer();
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <AddressBook addresses={addresses.map((address) => ({
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
  }))} />;
}
