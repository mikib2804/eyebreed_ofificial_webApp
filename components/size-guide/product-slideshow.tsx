"use client";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

export function ProductSlideshow({
  images,
  title,
}: {
  images: readonly string[];
  title: string;
}) {
  const [index, setIndex] = useState(0);
  useEffect(() => setIndex(0), [images]);
  useEffect(() => {
    if (images.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % images.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [images]);
  const move = (by: number) =>
    setIndex((i) => (i + by + images.length) % images.length);
  return (
    <section
      dir="ltr"
      className="relative min-h-[56vh] overflow-hidden bg-[#171717] lg:sticky lg:top-0 lg:h-screen"
    >
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={`${title} campaign view ${i + 1}`}
          fill
          priority={i === 0}
          className={`object-cover transition duration-1000 ease-luxury ${i === index ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`}
          sizes="(max-width:1024px) 100vw, 44vw"
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15" />
      <button
        onClick={() => move(-1)}
        aria-label="Previous image"
        className="absolute start-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/40 bg-black/20 backdrop-blur transition hover:bg-white hover:text-black"
      >
        <ChevronRight className="rtl:rotate-180" />
      </button>
      <button
        onClick={() => move(1)}
        aria-label="Next image"
        className="absolute end-5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center border border-white/40 bg-black/20 backdrop-blur transition hover:bg-white hover:text-black"
      >
        <ChevronLeft className="rtl:rotate-180" />
      </button>
      <div className="absolute inset-x-5 bottom-5 flex gap-2 overflow-x-auto">
        {images.map((src, i) => (
          <button
            key={src}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
            className={`relative h-16 w-12 shrink-0 overflow-hidden border ${i === index ? "border-white" : "border-white/25 opacity-60"}`}
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </button>
        ))}
      </div>
    </section>
  );
}
