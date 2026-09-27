"use client";

import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store-provider";
import { modernAllImages } from "@/lib/campaign-catalog";

export function Hero() {
  const { t } = useStore();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((current) => (current + 1) % modernAllImages.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero-section relative grid min-h-[650px] bg-ink text-white lg:grid-cols-[30%_70%]">
      <div className="hero-image absolute inset-y-0 end-0 w-[70%] overflow-hidden" role="img" aria-label="EYEBREED campaign collection">
        {modernAllImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={index === 0}
            className={`object-cover object-center transition duration-[1400ms] ease-luxury ${slide === index ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`}
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
        ))}
        <div className="absolute bottom-8 end-8 z-[3] flex gap-2">
          {modernAllImages.map((_, index) => (
            <button key={index} onClick={() => setSlide(index)} aria-label={`Show campaign image ${index + 1}`} className={`h-1 transition-all ${slide === index ? "w-8 bg-white" : "w-3 bg-white/40"}`} />
          ))}
        </div>
      </div>
      <div className="hero-text-fade relative z-15 flex flex-col justify-center py-20 pl-12 pr-16 lg:pl-8 lg:pr-10 xl:pl-6 xl:pr-8">
        <p className="mb-9 text-[10px] tracking-[.38em]">{t.collection}</p>
        <h1 className="font-display text-[clamp(4rem,7vw,8.5rem)] font-light leading-[.75] tracking-[-.035em]">
          <span className="block">{t.headlineA}</span>
          <span className="mt-5 block">{t.headlineB}</span>
          <span className="mt-5 block text-espresso-500">{t.headlineC}</span>
        </h1>
        <p className="mt-10 max-w-sm text-sm leading-7 text-white/70">
          {t.intro}
        </p>
        <a
          href="#products"
          className="group mt-9 flex w-fit items-center gap-8 border border-espresso-500 px-7 py-4 text-[10px] tracking-[.22em] transition duration-500 hover:bg-espresso-700"
        >
          {t.cta}
          <ArrowDownRight
            size={16}
            className="transition-transform group-hover:translate-x-1 group-hover:translate-y-1 rtl:rotate-90"
          />
        </a>
      </div>
    </section>
  );
}
