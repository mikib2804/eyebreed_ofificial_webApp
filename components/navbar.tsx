"use client";

import Link from "next/link";
import { Menu, ShoppingBag, X, UserRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useStore } from "@/components/store-provider";
import { useEffect, useRef, useState } from "react";
import { Currency } from "@/lib/i18n";
import SaleTicker from "@/components/saleTicker";
import { usePathname } from "next/navigation";
import { primaryNavigationRoutes } from "@/lib/site-routes";

function NavTooltip({ children }: { children: React.ReactNode }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute end-0 top-[calc(100%+.7rem)] z-50 w-max translate-y-1.5 rounded-lg border border-white/15 bg-[#171310]/95 px-3 py-2 text-[9px] font-medium tracking-[.12em] text-white opacity-0 shadow-[0_12px_35px_rgba(0,0,0,.35)] backdrop-blur-md transition duration-200 before:absolute before:-top-1 before:end-4 before:h-2 before:w-2 before:rotate-45 before:border-s before:border-t before:border-white/15 before:bg-[#171310] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigationRef = useRef<HTMLElement>(null);
  const menuToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const handleResize = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", handleResize);
    return () => desktop.removeEventListener("change", handleResize);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const outside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !navigationRef.current?.contains(event.target)
      )
        setMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [menuOpen]);
  const { locale, setLocale, currency, setCurrency, cart, cartOpen, setCartOpen, t } =
    useStore();
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="relative z-30 bg-ink text-white">
      <SaleTicker />
      <div className="bg-espresso-700 px-4 py-2 text-center text-[9px] tracking-luxury md:text-[10px]">
        {t.shipping}
      </div>
      <nav
        ref={navigationRef}
        aria-label="Main navigation"
        className="relative mx-auto grid h-22 max-w-[1600px] grid-cols-[1fr_auto_1fr] items-center border-b border-white/10 px-5 md:h-24 md:px-10"
      >
        <div className="hidden grid-cols-3 items-center gap-x-5 gap-y-2 text-[9px] tracking-[.14em] xl:grid">
          {primaryNavigationRoutes.map((route) => (
            <Link
              key={route.id}
              href={route.href}
              aria-current={pathname === route.href ? "page" : undefined}
              className="link-line w-fit whitespace-nowrap"
            >
              {route.label[locale].toUpperCase()}
            </Link>
          ))}
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" className="link-line w-fit whitespace-nowrap">
              {locale === "he" ? "ניהול" : "ADMIN"}
            </Link>
          )}
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
          {primaryNavigationRoutes.map((route) => (
            <Link
              key={route.id}
              href={route.href}
              aria-current={pathname === route.href ? "page" : undefined}
              className="flex min-h-11 items-center border-b border-white/10"
            >
              {route.label[locale].toUpperCase()}
            </Link>
          ))}
          <Link
            href={session ? "/account" : "/login"}
            className="flex min-h-11 items-center border-b border-white/10"
          >
            {session
              ? locale === "he"
                ? "החשבון שלי"
                : "MY ACCOUNT"
              : locale === "he"
                ? "התחברות / הרשמה"
                : "LOGIN / REGISTER"}
          </Link>
          {session?.user.role === "ADMIN" && (
            <Link href="/admin" className="flex min-h-11 items-center">
              {locale === "he" ? "ניהול" : "ADMIN"}
            </Link>
          )}
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
          <Link
            href={session ? "/account" : "/login"}
            aria-label={session ? "My account" : "Login or register"}
            className="group relative flex min-h-10 items-center gap-2 rounded-full border border-white/20 bg-espresso-700 px-3 text-[9px] tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition duration-300 hover:border-white/40 hover:bg-espresso-600 sm:px-4"
          >
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 transition duration-300 group-hover:bg-white/20">
              <UserRound size={15} strokeWidth={1.5} />
            </span>
            <span className="hidden lg:inline">
              {session
                ? (session.user.name?.split(" ")[0] ?? "MY ACCOUNT")
                : locale === "he"
                  ? "התחברות / הרשמה"
                  : "LOGIN / REGISTER"}
            </span>
            <NavTooltip>
              {session
                ? locale === "he"
                  ? "החשבון שלי"
                  : "MY ACCOUNT"
                : locale === "he"
                  ? "התחברות או הרשמה"
                  : "LOGIN OR REGISTER"}
            </NavTooltip>
          </Link>
          <button
            onClick={() => setCartOpen(true)}
            aria-label="Open cart"
            aria-controls="cart-dialog"
            aria-expanded={cartOpen}
            className="group relative grid h-10 w-10 place-items-center rounded-full transition duration-300 hover:bg-white/10"
          >
            <ShoppingBag size={20} strokeWidth={1.3} />
            {count > 0 && (
              <span className="absolute -end-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-espresso-400 px-1 text-[9px] text-ink">
                {count}
              </span>
            )}
            <NavTooltip>
              {locale === "he"
                ? count > 0
                  ? `סל הקניות · ${count} פריטים`
                  : "סל הקניות"
                : count > 0
                  ? `SHOPPING BAG · ${count} ITEMS`
                  : "SHOPPING BAG"}
            </NavTooltip>
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
            aria-label={locale === "en" ? "Switch language to Hebrew" : "החלפת שפה לאנגלית"}
            className="group relative min-h-10 border-s border-white/30 ps-3 text-[10px] tracking-wider"
          >
            {locale === "en" ? "HE" : "EN"}
            <NavTooltip>
              {locale === "en" ? "עברית" : "ENGLISH"}
            </NavTooltip>
          </button>
        </div>
      </nav>
    </header>
  );
}
