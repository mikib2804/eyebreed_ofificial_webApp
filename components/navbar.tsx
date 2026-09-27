"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/components/store-provider";
import React from "react";
import { Currency } from "@/lib/i18n";
export function Navbar() {
  const { locale, setLocale, currency, setCurrency, cart, setCartOpen, t } =
    useStore();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="relative z-30 bg-ink text-white">
      <div className="bg-espresso-700 px-4 py-2 text-center text-[9px] tracking-luxury md:text-[10px]">
        {t.shipping}
      </div>
      <nav className="mx-auto grid h-22 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 px-5 md:h-24 md:px-10">
        <div className="hidden items-center gap-7 text-[10px] tracking-[.17em] xl:flex">
          {t.nav.map((item) => (
            <a key={item} href="#products" className="link-line">
              {item}
            </a>
          ))}
        </div>
        <button
          aria-label="Open menu"
          className="relative justify-self-start xl:hidden group"
        >
          <Menu size={20} />

          <div
            className={`absolute top-full hidden group-hover:flex flex-col gap-3 rounded bg-ink px-5 py-4 text-[10px] tracking-[.17em] z-50 ${locale === "he" ? "right-0" : "left-0"}`}
          >
            {t.nav.map((item) => (
              <a key={item} href="#products" className="link-line">
                {item}
              </a>
            ))}
          </div>
        </button>
        <Link
          href="/"
          className="flex h-full items-center justify-center"
        >
          <Image
            height={108}
            width={290}
            alt="EYEBREED"
            src="/app_icons/logo.jpg"
            priority
            className="h-16 w-44 object-contain sm:h-20 sm:w-56 md:h-[108px] md:w-[290px]"
          />
        </Link>
        <div className="flex items-center justify-self-end gap-3 md:gap-5">
          <button aria-label="Search" className="hidden sm:block">
            <Search size={19} strokeWidth={1.3} />
          </button>
          <Link href="/login" aria-label="Account" className="hidden sm:block">
            <UserRound size={19} strokeWidth={1.3} />
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            className="relative"
          >
            <ShoppingBag size={20} strokeWidth={1.3} />
            {count > 0 && (
              <span className="absolute -end-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso-500 px-1 text-[9px]">
                {count}
              </span>
            )}
          </button>
          <select
            aria-label="Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as typeof currency)}
            className="bg-transparent text-[10px] tracking-wider outline-none p-2 cursor-pointer text-white"
          >
            {Object.values(Currency).map((currency) => (
              <option key={currency} className="cursor-pointer">
                {currency}
              </option>
            ))}
          </select>
          <button
            onClick={() => setLocale(locale === "en" ? "he" : "en")}
            className="border-s border-white/30 ps-3 text-[10px] tracking-wider"
          >
            {locale === "en" ? "HE" : "EN"}
          </button>
        </div>
      </nav>
    </header>
  );
}
