"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/store-provider";
import { campaignProducts } from "@/lib/campaign-catalog";

function itemName(folder: string, hebrew: boolean) {
  const item = campaignProducts.find((product) => product.folder === folder)!;
  return hebrew ? item.nameHe : item.name;
}

function productFor(folder: string) {
  return campaignProducts.find((product) => product.folder === folder)!;
}

const looks = [
  { src: "jersey-back.jpg", en: "Jersey · Back", he: "חולצה · אחורי" },
  { src: "hoodie-front.jpg", en: "Hoodie · Front", he: "קפוצ׳ון · קדמי" },
  { src: "hoodie-back.jpg", en: "Hoodie · Back", he: "קפוצ׳ון · אחורי" },
  { src: "jersey-front.jpg", en: "Jersey · Front", he: "חולצה · קדמי" },
];

export function CartoonCollection() {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const [openLook, setOpenLook] = useState<string | null>(null);

  return (
    <section
      aria-labelledby="cartoon-collection-heading"
      className="bg-cream pb-16 text-ink md:pb-24"
    >
      <div className="mx-auto max-w-[1600px] px-4 sm:px-5 md:px-12">
        <div className="mb-7 border-t border-ink/20 pt-8 md:pt-10">
          <h2
            id="cartoon-collection-heading"
            className="font-display text-[clamp(1.8rem,3.5vw,3.5rem)] leading-tight tracking-[-0.025em]"
          >
            {hebrew ? "קולקציית המודליסטים " : "THE CARTOON AVATAR "}
          </h2>
          <h2 className="font-display text-ink/50 text-[clamp(1.8rem,3.5vw,3.5rem)] leading-tight tracking-[-0.025em]">
            {hebrew ? "המצוירים" : "COLLECTION"}
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {looks.map((look, index) => {
            const garmentFolder = look.src.startsWith("hoodie")
              ? "hoodie"
              : "shirt";
            const garment = productFor(garmentFolder);
            const pants = productFor("pants");
            const hat = productFor("hat");

            return (
              <figure key={look.src} className="group min-w-0">
                <div
                  className="avatar-look relative aspect-[2/3] w-full overflow-hidden bg-[#fff]"
                  data-open={openLook === look.src}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenLook(openLook === look.src ? null : look.src)
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape") {
                        setOpenLook(null);
                        event.currentTarget.blur();
                      }
                    }}
                    aria-label={
                      hebrew
                        ? `פרטי הלבוש: ${look.he}`
                        : `Show outfit details: ${look.en}`
                    }
                    aria-pressed={openLook === look.src}
                    className="absolute inset-0 z-0 block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-readable focus-visible:outline-offset-[-4px]"
                  >
                    <Image
                      src={`/cartoon-collection/${look.src}`}
                      alt={
                        hebrew
                          ? look.he
                          : `EYEBREED cartoon avatar wearing the ${look.en.toLowerCase()} look`
                      }
                      fill
                      sizes="(min-width: 1600px) 361px, (min-width: 1024px) 25vw, 50vw"
                      className="object-contain transition-transform duration-500 group-hover:scale-[1.025] motion-reduce:transform-none"
                    />
                  </button>
                  <div
                    className="avatar-callouts absolute inset-0 z-10"
                    dir="ltr"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 150"
                      className="pointer-events-none absolute inset-0 h-full w-full"
                      fill="none"
                    >
                      <defs>
                        <marker
                          id={`avatar-arrow-${index}`}
                          markerWidth="5"
                          markerHeight="5"
                          refX="4"
                          refY="2.5"
                          orient="auto"
                          markerUnits="strokeWidth"
                        >
                          <path
                            d="M0 0L4 2.5L0 5"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </marker>
                      </defs>
                      <g
                        stroke="currentColor"
                        strokeWidth=".7"
                        strokeLinecap="round"
                        markerEnd={`url(#avatar-arrow-${index})`}
                      >
                        {look.src.startsWith("jersey") && (
                          <path d="M76 13 Q67 8 58 16" />
                        )}
                        <path d="M24 45 Q29 32 40 42" />
                        <path d="M79 93 Q66 89 62 103" />
                      </g>
                    </svg>
                    {look.src.startsWith("jersey") && (
                      <ProductHotspot
                        product={hat}
                        name={itemName("hat", hebrew)}
                        className="right-[3%] top-[3%]"
                      />
                    )}
                    <ProductHotspot
                      product={garment}
                      name={itemName(garmentFolder, hebrew)}
                      className="left-[3%] top-[25%]"
                    />
                    <ProductHotspot
                      product={pants}
                      name={itemName("pants", hebrew)}
                      className="right-[3%] top-[54%]"
                    />
                  </div>
                </div>
                <figcaption className="flex min-h-16 items-center justify-between gap-4 border-b border-ink/15 py-4">
                  <div className="min-w-0">
                    <p className="text-[10px] leading-relaxed text-ink/65 sm:text-xs">
                      {itemName(
                        look.src.startsWith("hoodie") ? "hoodie" : "shirt",
                        hebrew,
                      )}
                      {" · "}
                      {look.src.includes("front")
                        ? hebrew
                          ? "קדמי"
                          : "Front"
                        : hebrew
                          ? "אחורי"
                          : "Back"}
                    </p>
                  </div>
                  <Link
                    href={`/products/${garment.slug}`}
                    aria-label={`${hebrew ? "פתיחת" : "Open"} ${itemName(garmentFolder, hebrew)}`}
                    className="group/caption inline-flex shrink-0 items-center gap-2  pb-1 text-[8px] font-medium tracking-[.16em] text-ink/65 transition-colors hover:border-ink hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-[9px]"
                  >
                    <span>{hebrew ? "לצפייה" : "VIEW"}</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover/caption:translate-x-1"
                    >
                      →
                    </span>
                  </Link>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProductHotspot({
  product,
  name,
  className,
}: {
  product: (typeof campaignProducts)[number];
  name: string;
  className: string;
}) {
  return (
    <Link
      href={`/products/${product.slug}`}
      aria-label={`Open ${name}`}
      className={`avatar-callout group/hotspot ${className}`}
    >
      <span className="relative mb-1 block aspect-square w-10 overflow-hidden bg-white sm:w-12">
        <Image
          src={product.visionImage}
          alt=""
          fill
          sizes="48px"
          className="object-cover transition-transform duration-300 group-hover/hotspot:scale-110"
        />
      </span>
      <span className="block max-w-24 leading-tight">{name}</span>
      <span className="mt-1 block text-[7px] font-medium tracking-[.16em] opacity-60 sm:text-[8px]">
        VIEW →
      </span>
    </Link>
  );
}
