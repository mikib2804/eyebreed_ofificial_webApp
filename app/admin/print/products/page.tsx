import Link from "next/link";
import { redirect } from "next/navigation";
import { PrintReportButton } from "@/components/print-report-button";
import { getAdminAccess } from "@/lib/admin-auth";
import { adminStatus, type AdminLocale } from "@/lib/admin-i18n";
import { prisma } from "@/lib/prisma";

const money = (value: number, currency: string, locale: AdminLocale) => new Intl.NumberFormat(locale === "he" ? "he-IL" : "en-US", { style: "currency", currency }).format(value);

export default async function PrintableProducts({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const access = await getAdminAccess();
  if (access.status === "unauthenticated") redirect("/login?callbackUrl=/admin/print/products");
  if (access.status === "forbidden") redirect("/");
  const locale: AdminLocale = (await searchParams).lang === "en" ? "en" : "he";
  const he = locale === "he";
  const products = await prisma.product.findMany({ include: { category: { select: { name: true } }, variants: { orderBy: [{ size: "asc" }, { color: "asc" }] } }, orderBy: { name: "asc" } });
  const totalInventory = products.reduce((total, product) => total + product.inventory, 0);

  return <main dir={he ? "rtl" : "ltr"} className="min-h-screen bg-white p-4 text-black sm:p-8 print:p-0">
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b-2 border-black pb-5 print:mb-4"><div><p className="text-xs tracking-[.3em]">EYEBREED</p><h1 className="mt-2 font-display text-4xl">{he ? "דוח כל המוצרים" : "All products report"}</h1><p className="mt-2 text-xs text-black/60">{he ? "הופק" : "Generated"}: {new Date().toLocaleString(he ? "he-IL" : "en-US")}</p></div><div className="flex gap-2 print:hidden"><Link href={`/admin?section=Products&lang=${locale}`} className="inline-flex min-h-11 items-center border border-black px-5 text-xs">{he ? "חזרה לניהול" : "BACK TO ADMIN"}</Link><PrintReportButton label={he ? "הדפסה" : "PRINT"}/></div></div>
      <section className="mb-8 grid grid-cols-2 gap-3 border border-black p-4"><div><span className="text-xs text-black/55">{he ? "מספר מוצרים" : "Product count"}</span><strong className="block text-3xl">{products.length}</strong></div><div><span className="text-xs text-black/55">{he ? "סה״כ יחידות במלאי" : "Total units in stock"}</span><strong className="block text-3xl">{totalInventory}</strong></div></section>
      <div className="space-y-5">{products.map((product) => {
        const stock = product.inventory;
        return <article key={product.id} className="break-inside-avoid border border-black p-4">
          <header className="flex flex-wrap items-start justify-between gap-3 border-b border-black pb-3"><div><h2 className="text-xl font-bold">{he && product.nameHe ? product.nameHe : product.name}</h2><p className="text-xs text-black/60">{product.name} · {product.category.name} · {product.slug}</p></div><div className="text-end"><strong className="block text-2xl">{stock}</strong><span className="text-xs">{he ? "יחידות" : "units"} · {adminStatus(locale, product.status)}</span></div></header>
          <div className="grid gap-4 py-4 text-xs sm:grid-cols-2 print:grid-cols-2"><div><strong>{he ? "מחירים" : "Prices"}</strong><p>{money(Number(product.priceIls), "ILS", locale)} · {money(Number(product.priceUsd), "USD", locale)} · {money(Number(product.priceEur), "EUR", locale)}</p></div><div><strong>{he ? "פרטים" : "Details"}</strong><p>{product.material || "—"}</p><p>{he ? "סף מלאי נמוך" : "Low-stock threshold"}: {product.lowStockThreshold}</p></div></div>
          {product.variants.length ? <p className="border-y border-black py-3 text-sm"><strong>{he ? "מידות" : "Sizes"}:</strong> {product.variants.map((variant) => variant.size).join(" · ")}</p> : null}
          <div className="mt-4 grid gap-3 text-xs sm:grid-cols-2 print:grid-cols-2"><div><strong>{he ? "תיאור" : "Description"}</strong><p className="mt-1 whitespace-pre-line leading-5">{he ? product.descriptionHe || product.description : product.description}</p></div>{(product.storyHe || product.story) && <div><strong>{he ? "סיפור המוצר" : "Product story"}</strong><p className="mt-1 whitespace-pre-line leading-5">{he ? product.storyHe || product.story : product.story}</p></div>}</div>
        </article>;
      })}</div>
      {!products.length && <p className="py-16 text-center">{he ? "אין מוצרים להדפסה." : "No products to print."}</p>}
    </div>
  </main>;
}
