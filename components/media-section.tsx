"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useStore } from "@/components/store-provider";

export function MediaSection() {
  const { t } = useStore();

  return (
    <section className="grid bg-ink text-white lg:grid-cols-2">
      <div className="group relative min-h-[420px] overflow-hidden lg:min-h-[620px]">
        <Image
          src="https://images.unsplash.com/photo-1488161628813-04466f872be2?auto=format&fit=crop&w=1600&q=85"
          alt="Autumn editorial film"
          fill
          className="object-cover opacity-65 transition duration-1000 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h2 className="font-display text-5xl md:text-7xl p-3">{t.media}</h2>
          <button
            aria-label="Play film"
            className="mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-white/80 transition hover:bg-white hover:text-black"
          >
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="relative min-h-[420px] lg:min-h-[620px]">
          <Image
            src="https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=1000&q=85"
            alt="Man in black tailoring"
            fill
            className="object-cover grayscale-[20%]"
            sizes="25vw"
          />
        </div>
        <div className="relative min-h-[420px] lg:min-h-[620px]">
          <Image
            src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1000&q=85"
            alt="Man in cream knitwear"
            fill
            className="object-cover grayscale-[10%]"
            sizes="25vw"
          />
        </div>
      </div>
    </section>
  );
}
