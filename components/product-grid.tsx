"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { StoreProduct } from "@/lib/catalog";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function ProductGrid({
  products,
  displayImages = {},
}: {
  products: StoreProduct[];
  displayImages?: Record<string, string>;
}) {
  const { locale, currency, addToCart, t } = useStore();
  const router = useRouter();
  const { status } = useSession();
  const [liked, setLiked] = useState<boolean[]>([]);
  const [likeBurst, setLikeBurst] = useState<{ index: number; key: number } | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(
    () => new Set(),
  );

  useEffect(() => {
    if (status !== "authenticated") return;
    let cancelled = false;

    void fetch("/api/account/wishlist", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : { productIds: [] })
      .then((data: { productIds?: string[] }) => {
        if (cancelled) return;
        const saved = new Set(data.productIds ?? []);
        setLiked(products.map((product) => saved.has(product.id)));
      });

    return () => { cancelled = true; };
  }, [products, status]);
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
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-12 lg:gap-x-6">
            {products.map((product, index) => {
              const displayImage = displayImages[product.slug] ?? product.image;
              const imageFailed = failedImages.has(displayImage);
              return (
                <article
                  key={product.id}
                  className="group w-[calc((100%-1rem)/2)] lg:w-[calc((100%-4.5rem)/4)]"
                >
                  {!imageFailed && (
                    <div className="relative aspect-square overflow-hidden bg-white">
                      {product.compareAtPrices && (
                        <div className="absolute start-0 top-5 z-20 border-y-2 border-white bg-red-600 px-4 py-2 text-[10px] font-bold tracking-[.2em] text-white shadow-[4px_5px_0_#fff]">
                          UNEVEN · 15% SALE
                        </div>
                      )}
                      <Link
                        href={`/products/${product.slug}`}
                        className="absolute inset-0"
                        draggable={false}
                      >
                        <Image
                          src={displayImage}
                          alt={product.name}
                          fill
                          draggable={false}
                          onError={() =>
                            setFailedImages((current) =>
                              new Set(current).add(displayImage),
                            )
                          }
                          className="select-none object-contain object-center"
                          sizes="(max-width: 1023px) 50vw, 25vw"
                        />
                      </Link>

                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          if (status !== "authenticated") {
                            router.push("/login?callbackUrl=%2F%23products");
                            return;
                          }

                          const next = !(liked[index] ?? false);
                          setLiked((prev) => {
                            const newLiked = [...prev];
                            newLiked[index] = next;
                            return newLiked;
                          });
                          if (next) setLikeBurst({ index, key: Date.now() });

                          const response = await fetch(`/api/account/wishlist/${product.id}`, { method: next ? "PUT" : "DELETE" });
                          if (!response.ok) {
                            setLiked((prev) => {
                              const rolledBack = [...prev];
                              rolledBack[index] = !next;
                              return rolledBack;
                            });
                          }
                        }}
                        aria-label={liked[index] ? (locale === "he" ? "הסרה מהמועדפים" : "Remove from wishlist") : (locale === "he" ? "הוספה למועדפים" : "Add to wishlist")}
                        aria-pressed={liked[index] ?? false}
                        className="absolute end-4 top-4 z-30 grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/80 shadow-sm backdrop-blur-sm transition hover:scale-105"
                      >
                        {likeBurst?.index === index && (
                          <span key={likeBurst.key} aria-hidden="true" className="like-burst">
                            {Array.from({ length: 8 }, (_, particle) => (
                              <span key={particle} className="like-particle" />
                            ))}
                          </span>
                        )}
                        <Heart
                          size={20}
                          strokeWidth={1.2}
                          className={cn(
                            "transition-all duration-200",
                            liked[index]
                              ? "heart-liked fill-red-600 stroke-red-600"
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
                  )}
                  <div
                    className={`${imageFailed ? "mt-0 border-t border-black/15 pt-4" : "mt-5"} flex items-start justify-between gap-3`}
                  >
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
                    <div className="shrink-0 text-end text-xs">
                      {product.compareAtPrices && (
                        <p className="mb-1 text-[10px] text-black/45 line-through">
                          {money(product.compareAtPrices[currency], currency, locale)}
                        </p>
                      )}
                      <p className={product.compareAtPrices ? "font-semibold text-red-700" : ""}>
                        {money(product.prices[currency], currency, locale)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
