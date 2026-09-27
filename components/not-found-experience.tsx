"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SpecularButton from "./SpecularButton";
import { modernAllImages } from "@/lib/campaign-catalog";

const archive = modernAllImages;

export function NotFoundExperience() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % archive.length), 5200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 lg:start-[39%]">
        {archive.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt="EYEBREED editorial archive"
            fill
            priority={index === 0}
            className={`object-cover object-center transition duration-[1500ms] ease-luxury ${slide === index ? "scale-100 opacity-70" : "scale-[1.04] opacity-0"}`}
            sizes="(max-width: 1024px) 100vw, 61vw"
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,#050505_35%,rgba(5,5,5,.92)_47%,rgba(5,5,5,.28)_73%,rgba(5,5,5,.42)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(5,5,5,.3)_0%,rgba(5,5,5,.75)_45%,#050505_77%)]" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-end pe-[2vw] max-lg:items-start max-lg:justify-center max-lg:pt-[18vh]">
        <span className="font-display text-[clamp(17rem,42vw,48rem)] leading-none text-cream/85 mix-blend-screen max-lg:text-[50vw]">404</span>
      </div>

      <header className="relative z-20 flex items-center justify-between px-6 py-7 sm:px-10 lg:px-16">
        <Link href="/" className="font-display text-2xl tracking-[.28em] sm:text-3xl">EYEBREED</Link>
        <p className="text-[9px] tracking-[.25em] text-white/55">ERROR / 404</p>
      </header>

      <section className="relative z-20 flex min-h-[calc(100vh-96px)] items-center px-6 pb-12 sm:px-10 lg:w-[51%] lg:px-16">
        <div className="w-full max-w-2xl pt-[34vh] lg:pt-0">
          <p className="text-[9px] tracking-[.28em] text-white/60">ARCHIVE 0{slide + 1} / 0{archive.length}</p>
          <div className="mt-5 flex max-w-sm gap-3">
            {archive.map((_, index) => (
              <button key={index} onClick={() => setSlide(index)} aria-label={`View archive image ${index + 1}`} className="h-px flex-1 bg-white/25">
                <span className={`block h-px bg-white transition-all duration-700 ${slide === index ? "w-full" : "w-0"}`} />
              </button>
            ))}
          </div>

          <h1 className="mt-10 font-display text-[clamp(3rem,5.4vw,6.5rem)] leading-[.9] tracking-[-.02em]">THE PAGE HAS<br />LEFT THE<br />COLLECTION.</h1>
          <p className="mt-7 max-w-md text-sm leading-7 text-white/62">What you were looking for is no longer here — but the story continues.</p>

          <div className="mt-9 flex flex-col items-start gap-6 sm:flex-row sm:items-center">
            <SpecularButton
              onClick={() => router.push("/")}
              size="lg" radius={18} tint="#ffffff" tintOpacity={0}
              textColor="#f5f5f5" lineColor="#ffffff" baseColor="#1b1b1b"
              intensity={1} shineSize={10} shineFade={40} thickness={1}
              speed={0.35} followMouse proximity={250}
              className="min-w-56 text-[10px] tracking-luxury"
            >
              RETURN HOME
            </SpecularButton>
            <Link href="/#products" className="group flex items-center gap-5 border-b border-white/40 pb-2 text-[10px] tracking-[.18em]">
              EXPLORE THE COLLECTION <ArrowRight size={15} className="transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
