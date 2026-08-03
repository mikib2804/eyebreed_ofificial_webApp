"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { useMemo, useState } from "react";
import type { StoreProduct } from "@/lib/catalog";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";

export function ProductDetail({ product }: { product: StoreProduct }) {
  const { locale, currency, addToCart } = useStore();
  const firstAvailable = useMemo(() => product.sizes.find((variant) => variant.inventory > 0)?.size ?? "", [product.sizes]);
  const [selectedSize, setSelectedSize] = useState(firstAvailable);
  const selectedVariant = product.sizes.find((variant) => variant.size === selectedSize);
  const soldOut = product.inventory < 1 || !firstAvailable;

  const text = locale === "he" ? {
    back: "חזרה לקולקציה", size: "בחרו מידה", add: "הוספה לסל", soldOut: "אזל מהמלאי",
    details: "פרטי הפריט", story: "הסיפור", available: "זמין", left: "נותרו"
  } : {
    back: "Back to collection", size: "Select size", add: "Add to bag", soldOut: "Sold out",
    details: "Item details", story: "The story", available: "Available", left: "left"
  };

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1600px] lg:grid-cols-[58%_42%]">
        <div className="relative min-h-[58vh] bg-[#e8e4dc] lg:min-h-[850px]">
          <Image src={product.image} alt={product.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
          <Link href="/#products" className="absolute start-5 top-5 flex items-center gap-3 bg-cream/90 px-4 py-3 text-[10px] uppercase tracking-[.15em] backdrop-blur md:start-8 md:top-8">
            <ArrowLeft size={14} className="rtl:rotate-180" />{text.back}
          </Link>
        </div>

        <div className="flex flex-col justify-center px-6 py-14 sm:px-12 lg:px-[5vw] lg:py-20">
          <p className="text-[10px] uppercase tracking-luxury text-black/50">{product.material}</p>
          <h1 className="mt-5 font-display text-5xl leading-none sm:text-7xl">{locale === "he" ? product.nameHe : product.name}</h1>
          <p className="mt-7 text-lg">{money(product.prices[currency], currency, locale)}</p>
          <p className="mt-8 max-w-xl text-sm leading-7 text-black/65">{locale === "he" ? product.descriptionHe : product.description}</p>

          <div className="mt-10 border-t border-black/20 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[11px] uppercase tracking-[.18em]">{text.size}</h2>
              {selectedVariant && <span className="text-[10px] text-black/50">{selectedVariant.inventory} {text.left}</span>}
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {product.sizes.map((variant) => (
                <button
                  key={variant.size}
                  onClick={() => setSelectedSize(variant.size)}
                  disabled={variant.inventory < 1}
                  className={`relative border px-3 py-4 text-[11px] transition ${selectedSize === variant.size ? "border-ink bg-ink text-white" : "border-black/25 hover:border-black"} disabled:cursor-not-allowed disabled:text-black/25 disabled:line-through`}
                >
                  {variant.size}{selectedSize === variant.size && <Check size={12} className="absolute end-1.5 top-1.5" />}
                </button>
              ))}
            </div>
            <button
              onClick={() => addToCart(product, selectedSize)}
              disabled={soldOut || !selectedSize}
              className="mt-5 w-full bg-ink py-5 text-[10px] uppercase tracking-luxury text-white transition hover:bg-espresso-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {soldOut ? text.soldOut : text.add}
            </button>
            {!soldOut && <p className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-black/50"><span className="h-1.5 w-1.5 rounded-full bg-green-700" />{text.available}</p>}
          </div>

          <div className="mt-12 grid gap-8 border-t border-black/20 pt-9 sm:grid-cols-2">
            <section><h2 className="text-[10px] uppercase tracking-luxury">{text.details}</h2><p className="mt-4 text-xs leading-6 text-black/60">{product.material}<br />Designed for a refined everyday silhouette.</p></section>
            <section><h2 className="text-[10px] uppercase tracking-luxury">{text.story}</h2><p className="mt-4 text-xs leading-6 text-black/60">{locale === "he" ? product.storyHe : product.story}</p></section>
          </div>
        </div>
      </div>
    </main>
  );
}
