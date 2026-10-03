"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { StoreProduct } from "@/lib/catalog";
import { money } from "@/lib/i18n";
import { useStore } from "@/components/store-provider";

export function ProductDetail({ product }: { product: StoreProduct }) {
  const { locale, currency, addToCart } = useStore();
  const firstAvailable = useMemo(
    () => product.sizes.find((variant) => variant.inventory > 0)?.size ?? "",
    [product.sizes],
  );
  const [selectedSize, setSelectedSize] = useState(firstAvailable);
  const [selectedImage, setSelectedImage] = useState(0);
  const selectedImageRef = useRef(0);
  const galleryRef = useRef<HTMLDivElement>(null);
  const images = product.images.length ? product.images : [product.image];
  const showImage = useCallback((index: number) => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const nextIndex = (index + images.length) % images.length;
    gallery.scrollTo({
      left: nextIndex * gallery.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }, [images.length]);
  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setTimeout(() => showImage(selectedImage + 1), 5000);
    return () => window.clearTimeout(timer);
  }, [images.length, selectedImage, showImage]);
  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    let previousWidth = gallery.clientWidth;
    const resizeObserver = new ResizeObserver(() => {
      if (gallery.clientWidth === previousWidth) return;
      previousWidth = gallery.clientWidth;
      gallery.scrollTo({ left: selectedImageRef.current * gallery.clientWidth, behavior: "instant" });
    });
    resizeObserver.observe(gallery);
    return () => resizeObserver.disconnect();
  }, []);
  const selectedVariant = product.sizes.find(
    (variant) => variant.size === selectedSize,
  );
  const soldOut = product.inventory < 1 || !firstAvailable;

  const text =
    locale === "he"
      ? {
          back: "חזרה לקולקציה",
          size: "בחרו מידה",
          add: "הוספה לסל",
          soldOut: "אזל מהמלאי",
          details: "פרטי הפריט",
          story: "הסיפור",
          available: "זמין",
          left: "נותרו",
        }
      : {
          back: "Back to collection",
          size: "Select size",
          add: "Add to bag",
          soldOut: "Sold out",
          details: "Item details",
          story: "The story",
          available: "Available",
          left: "left",
        };

  return (
    <main className="bg-cream text-ink">
      <div className="mx-auto grid min-h-[calc(100vh-8rem)] max-w-[1280px] lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-10 lg:py-12">
        <div className="mx-auto w-full min-w-0 max-w-[480px] self-start lg:max-w-[440px]">
          <Link
            href="/#products"
            className="mx-5 my-4 flex w-fit items-center gap-3 text-[10px] uppercase tracking-[.15em] lg:mx-0 lg:mt-0"
          >
            <ArrowLeft size={14} className="rtl:rotate-180" />
            {text.back}
          </Link>
          <div className="relative aspect-[2/3] w-full">
          <div
            ref={galleryRef}
            dir="ltr"
            role="region"
            aria-label={locale === "he" ? "תמונות המוצר" : "Product images"}
            tabIndex={0}
            className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain lg:overflow-x-hidden"
            onScroll={(event) => {
              const gallery = event.currentTarget;
              if (gallery.clientWidth) {
                const index = Math.max(0, Math.min(images.length - 1, Math.round(gallery.scrollLeft / gallery.clientWidth)));
                selectedImageRef.current = index;
                setSelectedImage(index);
              }
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                showImage(selectedImage + (event.key === "ArrowLeft" ? -1 : 1));
              }
            }}
          >
            {images.map((src, index) => (
              <div key={src} className="relative h-full w-full shrink-0 snap-center snap-always">
                <Image
                  src={src}
                  alt={`${product.name} — ${index + 1}`}
                  fill
                  priority={index === 0}
                  draggable={false}
                  className="select-none object-contain object-center"
                  sizes="(max-width: 479px) 100vw, (max-width: 1023px) 480px, (max-width: 1279px) 42vw, 440px"
                />
              </div>
            ))}
          </div>
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => showImage(selectedImage - 1)}
                aria-label={locale === "he" ? "התמונה הקודמת" : "Previous image"}
                className="absolute left-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink lg:grid"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={() => showImage(selectedImage + 1)}
                aria-label={locale === "he" ? "התמונה הבאה" : "Next image"}
                className="absolute right-5 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-cream/90 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink lg:grid"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
          </div>
          {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto px-5 py-1 lg:px-0">
                {images.map((src, index) => (
                  <button
                    key={src}
                    onClick={() => showImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={selectedImage === index}
                    className={`relative h-20 w-14 shrink-0 overflow-hidden border transition ${selectedImage === index ? "border-ink ring-1 ring-black/30" : "border-black/20 opacity-70 hover:opacity-100"}`}
                  >
                    <Image src={src} alt="" fill className="object-contain" sizes="56px" />
                  </button>
                ))}
              </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col justify-center px-6 py-14 sm:px-12 lg:justify-start lg:px-0 lg:py-0">
          <p className="text-[10px] uppercase tracking-luxury text-black/75">
            {product.material}
          </p>
          <h1 className="mt-5 font-display text-5xl leading-none sm:text-7xl">
            {locale === "he" ? product.nameHe : product.name}
          </h1>
          <p className="mt-7 text-lg">
            {money(product.prices[currency], currency, locale)}
          </p>
          <p className="mt-8 max-w-xl whitespace-pre-line text-sm leading-7 text-black/75">
            {locale === "he" ? product.descriptionHe : product.description}
          </p>

          <div className="mt-10 border-t border-black/20 pt-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[11px] uppercase tracking-[.18em]">
                {text.size}
              </h2>
              <div className="flex items-center gap-4">
                <Link href="/size-guide" className="border-b border-black/50 pb-1 text-[10px] uppercase tracking-[.14em] transition hover:border-espresso-700 hover:text-accent-readable">
                  {locale === "he" ? "מדריך מידות" : "Size Guide"}
                </Link>
                {selectedVariant && <span className="text-[10px] text-black/75">{selectedVariant.inventory} {text.left}</span>}
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
              {product.sizes.map((variant) => (
                <button
                  key={variant.size}
                  onClick={() => setSelectedSize(variant.size)}
                  disabled={variant.inventory < 1}
                  className={`relative border px-3 py-4 text-[11px] transition ${selectedSize === variant.size ? "border-ink bg-ink text-white" : "border-black/25 hover:border-black"} disabled:cursor-not-allowed disabled:text-black/25 disabled:line-through`}
                >
                  {variant.size}
                  {selectedSize === variant.size && (
                    <Check size={12} className="absolute end-1.5 top-1.5" />
                  )}
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
            {!soldOut && (
              <p className="mt-4 flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider text-black/75">
                <span className="h-1.5 w-1.5 rounded-full bg-green-700" />
                {text.available}
              </p>
            )}
          </div>

          <div className="mt-12 grid gap-8 border-t border-black/20 pt-9 sm:grid-cols-2">
            <section>
              <h2 className="text-[10px] uppercase tracking-luxury">
                {text.details}
              </h2>
              <p className="mt-4 whitespace-pre-line text-xs leading-6 text-black/75">
                {product.material}
                <br />
                Designed for a refined everyday silhouette.
              </p>
            </section>
            <section>
              <h2 className="text-[10px] uppercase tracking-luxury">
                {text.story}
              </h2>
              <p className="mt-4 whitespace-pre-line text-xs leading-6 text-black/75">
                {locale === "he" ? product.storyHe : product.story}
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
