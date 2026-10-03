"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { StoreProduct } from "@/lib/catalog";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGrid({ products, displayImages = {} }: {
  products: StoreProduct[];
  displayImages?: Record<string, string>;
}) {
  const { locale, currency, addToCart, t } = useStore();
  const [liked, setLiked] = useState<boolean[]>([]);
  return (
    <section
      id="products"
      className="bg-cream px-5 py-20 text-ink md:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-8 flex min-w-0 items-center gap-3 sm:mb-12 sm:gap-8">
          <h2 className="shrink-0 whitespace-nowrap -skew-x-6 font-display text-[clamp(1.75rem,9vw,4.5rem)] italic tracking-[clamp(.08em,1.5vw,.2em)]">
            {t.edit}
          </h2>
          <span className="h-px min-w-0 flex-1 bg-ink/30" />
        </div>
        {products.length === 0 ? (
          <p className="border-y border-black/20 py-16 text-center text-xs tracking-luxury">
            THE COLLECTION IS BEING PREPARED
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {products.map((product, index) => (
              <article key={product.id} className="group">
                <div className="relative aspect-square overflow-hidden bg-white">
                  <Link href={`/products/${product.slug}`} className="absolute inset-0" draggable={false}>
                  <Image
                    src={displayImages[product.slug] ?? product.image}
                    alt={product.name}
                    fill
                    draggable={false}
                    className="select-none object-contain object-center"
                    sizes="(max-width: 1023px) 50vw, 25vw"
                  />
                  </Link>

                  <button type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      setLiked((prev) => {
                        const newLiked = [...prev];
                        newLiked[index] = !newLiked[index];
                        return newLiked;
                      });
                    }}
                    aria-label="Add to favorites"
                    aria-pressed={liked[index] ?? false}
                    className="absolute end-4 top-4 cursor-pointer"
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.2}
                      className={cn(
                        "transition-all duration-200",
                        liked[index]
                          ? "fill-red-600 stroke-red-600"
                          : "fill-transparent stroke-current",
                      )}
                    />
                  </button>
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      addToCart(product);
                    }}
                    disabled={product.inventory < 1}
                    className="absolute inset-x-0 bottom-0 translate-y-full bg-ink px-4 py-4 text-[10px] tracking-luxury text-white transition duration-500 group-hover:translate-y-0 focus:translate-y-0 disabled:cursor-not-allowed disabled:bg-charcoal"
                  >
                    {product.inventory > 0 ? t.add : "SOLD OUT"}
                  </button>
                </div>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-[11px] font-medium uppercase tracking-[.12em]">
                        {locale === "he" ? product.nameHe : product.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-black/75">
                      {product.material}
                    </p>
                  </div>
                  <p className="text-xs">
                    {money(product.prices[currency], currency, locale)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
