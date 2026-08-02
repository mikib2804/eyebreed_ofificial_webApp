import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AdminProductForm } from "@/components/admin-product-form";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <main className="min-h-screen bg-cream px-5 py-12 text-ink md:px-12">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] tracking-luxury">EYEBREED / ADMIN</p>
        <h1 className="my-8 font-display text-7xl">Product atelier</h1>
        <AdminProductForm categories={categories} />
        <div className="mt-16 overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-black ">
                <th className="py-4 ">PRODUCT</th>
                <th>STATUS</th>
                <th>INVENTORY</th>
                <th>USD</th>
                <th>CATEGORY</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product: (typeof products)[number]) => (
                <tr key={product.id} className="border-b border-black/15">
                  <td className="py-5">{product.name}</td>
                  <td>{product.status}</td>
                  <td>{product.inventory}</td>
                  <td>${product.priceUsd.toString()}</td>
                  <td>{product.category.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
