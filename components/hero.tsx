"use client";

import { ArrowDownRight } from "lucide-react";
import { useStore } from "@/components/store-provider";

export function Hero() {
  const { t } = useStore();

  return (
    <section className="hero-section relative grid min-h-[650px] bg-ink text-white lg:grid-cols-[30%_70%]">
      <div
        className="hero-image absolute inset-y-0 end-0 w-[70%]"
        role="img"
        aria-label="Model wearing an espresso tailored suit"
      />
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
