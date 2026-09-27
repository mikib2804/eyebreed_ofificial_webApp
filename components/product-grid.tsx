"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { StoreProduct } from "@/lib/catalog";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGrid({ products }: { products: StoreProduct[] }) {
  const { locale, currency, addToCart, t } = useStore();
  const [liked, setLiked] = useState<boolean[]>([]);
  return (
    <section
      id="products"
      className="bg-cream px-5 py-20 text-ink md:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-12 flex items-center gap-8">
          <h2 className="whitespace-nowrap -skew-x-6 font-display text-5xl italic tracking-[0.2em] md:text-7xl">
            {t.edit}
          </h2>
          <span className="h-px w-full bg-ink/30" />
        </div>
        {products.length === 0 ? (
          <p className="border-y border-black/20 py-16 text-center text-xs tracking-luxury">
            THE COLLECTION IS BEING PREPARED
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
            {products.map((product, index) => (
              <article key={product.id} className="group">
                <Link
                  href={`/products/${product.slug}`}
                  className="relative block aspect-[4/5] overflow-hidden bg-[#ebe8e2]"
                >
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover object-center grayscale-[15%] transition duration-700 ease-luxury group-hover:scale-[1.025]"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <span
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
                  </span>
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
                </Link>
                <div className="mt-5 flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-[11px] font-medium uppercase tracking-[.12em]">
                        {locale === "he" ? product.nameHe : product.name}
                      </h3>
                    </Link>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-black/55">
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
