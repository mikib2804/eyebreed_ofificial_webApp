"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { EmptyState, PageTitle } from "@/components/account-shell";
import { useStore } from "@/components/store-provider";
import { money } from "@/lib/i18n";

type WishlistProduct = { id: string; slug: string; name: string; nameHe: string; image: string | null; prices: { USD: number; ILS: number; EUR: number } };

export function WishlistView({ initialItems }: { initialItems: WishlistProduct[] }) {
  const { locale, currency } = useStore();
  const [items, setItems] = useState(initialItems);

  async function remove(productId: string) {
    const previous = items;
    setItems((current) => current.filter((product) => product.id !== productId));
    const response = await fetch(`/api/account/wishlist/${productId}`, { method: "DELETE" });
    if (!response.ok) setItems(previous);
  }

  return (
    <>
      <PageTitle title="Wishlist"><p className="mt-4 text-sm text-black/60">{locale === "he" ? "כל הפריטים שסימנת בלב נשמרים כאן." : "Every piece you heart is saved here."}</p></PageTitle>
      {items.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((product) => (
            <article key={product.id} className="overflow-hidden rounded-2xl border border-black/10 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-lg">
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-black/5">{product.image && <Image src={product.image} alt={product.name} fill className="object-cover transition duration-500 hover:scale-[1.02]" />}</div>
                <h2 className="mt-4 px-2 font-display text-2xl">{locale === "he" ? product.nameHe : product.name}</h2>
                <p className="px-2 pb-2 text-xs">{money(product.prices[currency], currency, locale)}</p>
              </Link>
              <button type="button" onClick={() => remove(product.id)} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 text-[9px] tracking-wider text-red-700 transition hover:bg-red-600 hover:text-white"><Trash2 size={14} />{locale === "he" ? "הסרה מהמועדפים" : "REMOVE FROM WISHLIST"}</button>
            </article>
          ))}
        </div>
      ) : (
        <div><EmptyState title="Your wishlist is empty" text="Save pieces you love and return to them at any time." /><p className="sr-only"><Heart />Wishlist empty</p></div>
      )}
    </>
  );
}
