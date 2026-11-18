"use client";

import Link from "next/link";
import { Boxes, ClipboardList, ExternalLink, Gauge, Menu, MessageCircle, Package, Percent, Settings, ShoppingBag, Users, Wrench, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type AdminSection = { id: string; label: string };
const icons: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  Overview: Gauge, Products: Package, Discounts: Percent, Orders: ShoppingBag,
  "Pre-orders": ClipboardList, Messages: MessageCircle, Customers: Users,
  Inventory: Boxes, Settings,
  Maintenance: Wrench,
};

export function AdminMobileNavigation({ active, locale, managerLabel, storeLabel, sections }: {
  active: string;
  locale: "en" | "he";
  managerLabel: string;
  storeLabel: string;
  sections: AdminSection[];
}) {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); toggleRef.current?.focus(); }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return <header ref={headerRef} className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#211b17] text-white shadow-[0_10px_35px_rgba(23,20,18,.2)] lg:hidden">
    <div className="flex min-h-16 w-full min-w-0 items-center gap-2 px-3 sm:gap-3 sm:px-4">
      <button ref={toggleRef} type="button" aria-expanded={open} aria-controls="admin-mobile-menu" aria-label={open ? (locale === "he" ? "סגירת תפריט" : "Close menu") : (locale === "he" ? "פתיחת תפריט" : "Open menu")} onClick={() => setOpen((value) => !value)} className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-white/25 transition hover:bg-white hover:text-black">
        {open ? <X size={20} /> : <Menu size={21} />}
      </button>
      <Link href={`/admin?section=${encodeURIComponent(active)}&lang=${locale}`} className="min-w-0 flex-1">
        <span className="block truncate text-[9px] tracking-[.24em] text-white/55">EYEBREED</span>
        <span className="block truncate font-display text-lg leading-none sm:text-xl">{managerLabel}</span>
      </Link>
      <div className="flex shrink-0 rounded-md border border-white/15 p-0.5 text-[9px]">
        <Link href={`/admin?section=${encodeURIComponent(active)}&lang=he`} className={`grid min-h-9 place-items-center rounded px-2 ${locale === "he" ? "bg-white text-black" : "text-white/65"}`}>HE</Link>
        <Link href={`/admin?section=${encodeURIComponent(active)}&lang=en`} className={`grid min-h-9 place-items-center rounded px-2 ${locale === "en" ? "bg-white text-black" : "text-white/65"}`}>EN</Link>
      </div>
      <Link href="/#products" aria-label={storeLabel} className="group/collection relative grid h-11 w-9 shrink-0 place-items-center text-white/70 hover:text-white sm:w-11">
        <ExternalLink size={18} />
        <span role="tooltip" className="pointer-events-none absolute end-0 top-[calc(100%+.35rem)] z-[60] w-max translate-y-1 rounded-md border border-white/15 bg-[#171412] px-3 py-2 text-[9px] font-medium tracking-wider text-white opacity-0 shadow-xl transition duration-200 group-hover/collection:translate-y-0 group-hover/collection:opacity-100 group-focus-visible/collection:translate-y-0 group-focus-visible/collection:opacity-100">
          {locale === "he" ? "לקולקציה" : "TO COLLECTION"}
        </span>
      </Link>
    </div>
    <nav id="admin-mobile-menu" aria-label={locale === "he" ? "חלקי ניהול" : "Admin sections"} aria-hidden={!open} inert={!open} className={`absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] origin-top overflow-y-auto bg-[#211b17] px-3 pb-4 shadow-2xl transition-[opacity,transform,visibility] duration-300 ease-out sm:px-4 ${open ? "visible translate-y-0 scale-y-100 opacity-100" : "invisible pointer-events-none -translate-y-3 scale-y-95 opacity-0"}`}>
      <div className="border-t border-white/10 pt-2">
        {sections.map((section) => {
          const Icon = icons[section.id] ?? Package;
          const selected = active === section.id;
          return <Link key={section.id} href={`/admin?section=${encodeURIComponent(section.id)}&lang=${locale}`} aria-current={selected ? "page" : undefined} onClick={() => setOpen(false)} className={`flex min-h-14 items-center gap-4 border-b border-white/10 px-3 text-sm transition ${selected ? "bg-white text-[#211b17]" : "text-white/75 hover:bg-white/10 hover:text-white"}`}>
            <Icon size={20} strokeWidth={1.7} /><span className="min-w-0 flex-1 break-words font-medium">{section.label}</span><span className={selected ? "text-black/40" : "text-white/40"} aria-hidden="true">›</span>
          </Link>;
        })}
      </div>
    </nav>
  </header>;
}
