"use client";

import Link from "next/link";
import { Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Image from "next/image";
import { useStore } from "@/components/store-provider";
import { useEffect, useRef, useState } from "react";
import { Currency } from "@/lib/i18n";
import SaleTicker from "./saleTicker";
import { PaletteSwatch } from "@/components/palette-provider";
import { usePathname } from "next/navigation";
export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const handleResize = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener("change", handleResize);
    return () => desktop.removeEventListener("change", handleResize);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !navigationRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setMenuOpen(false); menuToggleRef.current?.focus(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);
  const { locale, setLocale, currency, setCurrency, cart, setCartOpen, t } =
    useStore();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="relative z-30 bg-ink text-white">
      <SaleTicker />
      <div className="bg-espresso-700 px-4 py-2 text-center text-[9px] tracking-luxury md:text-[10px]">
        {t.shipping}
      </div>
      <nav ref={navigationRef} aria-label="Main navigation" className="relative mx-auto grid h-22 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 px-5 md:h-24 md:px-10">
        <div className="hidden items-center gap-7 text-[10px] tracking-[.17em] xl:flex">
          {t.nav.map((item) => (
            <a key={item} href="#products" className="link-line">
              {item}
            </a>
          ))}
          <Link href="/our-story" className="link-line">
            {locale === "he" ? "הסיפור שלנו" : "OUR STORY"}
          </Link>
        </div>
        <button
          ref={menuToggleRef}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((current) => !current)}
          className="grid h-11 w-11 place-items-center justify-self-start xl:hidden"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
          <div
            id="mobile-navigation"
            hidden={!menuOpen}
            className="absolute inset-x-0 top-full z-50 border-b border-white/20 bg-ink px-5 py-4 text-[10px] tracking-[.17em] shadow-xl md:px-10 xl:hidden"
          >
            {t.nav.map((item) => (
              <a key={item} href="/#products" className="flex min-h-11 items-center border-b border-white/10">
                {item}
              </a>
            ))}
            <Link href="/our-story" className="flex min-h-11 items-center">
              {locale === "he" ? "הסיפור שלנו" : "OUR STORY"}
            </Link>
          </div>
        <Link
          href="/"
          className="flex h-full items-center justify-center overflow-hidden"
        >
          <Image
            height={108}
            width={290}
            alt="EYEBREED"
            src="/app_icons/appIcon.png"
            priority
            className={`h-14 object-contain ${pathname === "/" ? "w-40" : "w-28"} sm:h-16 sm:w-48 md:h-20 md:w-56`}
          />
        </Link>
        <div className="flex items-center justify-self-end gap-3 md:gap-5">
          {pathname !== "/" && <PaletteSwatch />}
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
              <span className="absolute -end-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso-400 px-1 text-[9px] text-ink">
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
