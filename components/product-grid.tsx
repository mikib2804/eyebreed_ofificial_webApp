"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { products } from "@/lib/catalog";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";

export function ProductGrid() {
  const { locale, currency, addToCart, t } = useStore();

  return (
    <section
      id="products"
      className="bg-cream px-5 py-20 text-ink md:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-12 flex items-center gap-8">
          <h2 className="whitespace-nowrap -skew-x-6 font-display italic tracking-[0.2em] text-5xl md:text-7xl">
            {t.edit}
          </h2>
          <span className="h-px w-full bg-ink/30" />
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-6">
          {products.map((product) => (
            <article key={product.id} className="group">
              <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe8e2]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover grayscale-[15%] transition duration-700 ease-luxury group-hover:scale-[1.025]"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <button
                  aria-label="Add to favorites"
                  className="absolute end-4 top-4"
                >
                  <Heart size={18} strokeWidth={1.2} />
                </button>
                <button
                  onClick={() => addToCart(product)}
                  className="absolute inset-x-0 bottom-0 translate-y-full bg-ink px-4 py-4 text-[10px] tracking-luxury text-white transition duration-500 group-hover:translate-y-0 focus:translate-y-0"
                >
                  {t.add}
                </button>
              </div>
              <div className="mt-5 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-[.12em]">
                    {locale === "he" ? product.nameHe : product.name}
                  </h3>
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
      </div>
    </section>
  );
}
