"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { EmptyState, PageTitle } from "@/components/account-shell";
import { useStore } from "@/components/store-provider";
import type { StoreProduct } from "@/lib/catalog";
import { money } from "@/lib/i18n";
import { usePreOrder } from "@/components/pre-order-provider";

type WishlistProduct = StoreProduct;

export function WishlistView({ initialItems }: { initialItems: WishlistProduct[] }) {
  const { locale, currency, addToCart } = useStore();
  const { enabled: preOrderMode } = usePreOrder();
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
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {items.map((product) => (
            <article key={product.id} className="relative flex h-full flex-col overflow-hidden rounded-md border border-black/10 bg-white py-1.5 transition hover:-translate-y-0.5 hover:shadow-lg">
              <button
                type="button"
                onClick={() => remove(product.id)}
                title={locale === "he" ? "הסרה ממועדפים" : "Remove from wishlist"}
                aria-label={locale === "he" ? "הסרה ממועדפים" : "Remove from wishlist"}
                className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-md border border-black/15 bg-white/95 text-black shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <X size={14} aria-hidden="true" />
              </button>
              <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
                <div className="relative h-40 shrink-0 overflow-hidden bg-white sm:h-36">{product.image && <Image src={product.image} alt={product.name} fill sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw" className="object-contain transition duration-500 hover:scale-[1.02]" />}{preOrderMode && <span className="absolute inset-x-0 bottom-0 bg-[#76513f] px-2 py-1 text-center text-[7px] font-semibold tracking-wider text-white">הזמנה מוקדמת</span>}</div>
                <h2 className="mt-1.5 line-clamp-2 min-h-10 px-2 font-display text-lg leading-5">{locale === "he" ? product.nameHe : product.name}</h2>
                <p className="mt-auto px-2 text-[11px]">{money(product.prices[currency], currency, locale)}</p>
              </Link>
              <button
                type="button"
                onClick={() => addToCart(product)}
                disabled={product.inventory < 1 || !product.sizes.some((size) => size.inventory > 0)}
                className="mx-2 mt-1.5 flex min-h-9 w-[calc(100%-1rem)] shrink-0 items-center justify-center gap-1.5 rounded-md bg-ink px-2 text-[8px] tracking-wider text-white transition hover:bg-espresso-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag size={12} aria-hidden="true" />
                {locale === "he" ? "הוספה לסל" : "ADD TO CART"}
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div><EmptyState title="Your wishlist is empty" text="Save pieces you love and return to them at any time." /><p className="sr-only"><Heart />Wishlist empty</p></div>
      )}
    </>
  );
}
