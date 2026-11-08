"use client";

import Image from "next/image";
import { ArrowDownRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store-provider";
import { modernAllImages } from "@/lib/campaign-catalog";
import { PaletteSwatch } from "@/components/palette-provider";

export function Hero() {
  const { t, locale } = useStore();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(
      () => setSlide((current) => (current + 1) % modernAllImages.length),
      5200,
    );
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="hero-section relative min-h-[620px] overflow-hidden bg-ink text-white sm:min-h-[650px]">
      <PaletteSwatch hero />
      <div className="hero-image absolute inset-0 w-full overflow-hidden lg:inset-y-0 lg:start-auto lg:end-0 lg:w-[70%]">
        {modernAllImages.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt=""
            fill
            priority={index === 0}
            className={`object-cover object-center transition duration-[1400ms] ease-luxury motion-reduce:transform-none motion-reduce:transition-none ${slide === index ? "scale-100 opacity-100" : "scale-[1.025] opacity-0"}`}
            sizes="(max-width: 1024px) 100vw, 70vw"
          />
        ))}
        <div className="absolute bottom-5 end-5 z-[3] hidden gap-2 sm:flex lg:bottom-8 lg:end-8">
          {modernAllImages.map((_, index) => (
            <button key={index} type="button" onClick={() => setSlide(index)} aria-label={`Show campaign image ${index + 1}`} aria-pressed={slide === index} className={`min-h-11 px-1 transition-all ${slide === index ? "w-10" : "w-5"}`}><span className={`block h-1 ${slide === index ? "bg-white" : "bg-white/40"}`} /></button>
          ))}
        </div>
      </div>
      <div className="hero-text-fade relative z-10 flex min-h-[620px] w-full flex-col justify-center px-5 py-16 sm:min-h-[650px] sm:px-10 lg:w-[48%] lg:px-8 lg:py-20 xl:px-6">
        <p className="mb-7 text-[9px] tracking-[.32em] sm:mb-9 sm:text-[10px] sm:tracking-[.38em]">{t.collection}</p>
        <h1 className="font-display text-[clamp(3rem,13vw,5.25rem)] font-light leading-[.82] tracking-[-.035em] lg:text-[clamp(4rem,7vw,8.5rem)] lg:leading-[.75]">
          <span className="block">{t.headlineA}</span>
          <span className="mt-5 block">
            {locale === "he" ? (
              <>
                חיים <span className="text-espresso-200">שלי</span>
              </>
            ) : (
              <>
                OF <span className="text-espresso-200">LIFE</span>
              </>
            )}
          </span>
          {t.headlineC && (
            <span className="mt-5 block text-espresso-200">{t.headlineC}</span>
          )}
        </h1>
        <p className="mt-8 max-w-sm text-xs leading-6 text-white/70 sm:mt-10 sm:text-sm sm:leading-7">
          {t.intro}
        </p>
        <a
          href="#products"
          className="group mt-7 flex w-fit items-center gap-6 border border-espresso-500 px-5 py-3.5 text-[9px] tracking-[.18em] transition duration-500 hover:bg-espresso-700 sm:mt-9 sm:gap-8 sm:px-7 sm:py-4 sm:text-[10px] sm:tracking-[.22em]"
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
