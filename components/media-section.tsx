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
          src="/campaign/modernAll/DSCF0127.JPG"
          alt="EYEBREED Vision campaign overlooking the city"
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
            src="/campaign/modernAll/DSCF0415.JPG"
            alt="EYEBREED Vision campaign at the graffiti wall"
            fill
            className="object-cover grayscale-[20%]"
            sizes="25vw"
          />
        </div>
        <div className="relative min-h-[420px] lg:min-h-[620px]">
          <Image
            src="/campaign/modernAll/DSCF0479.JPG"
            alt="EYEBREED Vision hoodie campaign portrait"
            fill
            className="object-cover grayscale-[10%]"
            sizes="25vw"
          />
        </div>
      </div>
    </section>
  );
}
