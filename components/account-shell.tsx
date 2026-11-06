"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Clock, Heart, LayoutDashboard, LogOut, MapPin, Package, UserRound } from "lucide-react";
import { useStore } from "@/components/store-provider";

const links = [
  ["/account", "Overview", "סקירה", LayoutDashboard],
  ["/account/orders", "My Orders", "ההזמנות שלי", Package],
  ["/account/pre-orders", "My Pre-orders", "הזמנות מוקדמות", Clock],
  ["/account/profile", "My Profile", "הפרופיל שלי", UserRound],
  ["/account/addresses", "My Addresses", "הכתובות שלי", MapPin],
  ["/account/wishlist", "Wishlist", "המועדפים שלי", Heart],
] as const;

export function AccountShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { locale } = useStore();
  const hebrew = locale === "he";

  return (
    <div className="bg-[#eee8df] px-4 py-8 text-[#171412] sm:px-6 md:px-10 lg:py-16">
      <div className="mx-auto grid min-h-[65vh] max-w-[1500px] gap-6 lg:grid-cols-[270px_minmax(0,1fr)] lg:gap-10">
        <aside className="h-fit overflow-hidden rounded-3xl bg-[#171412] p-4 text-[#f8f3ec] shadow-[0_22px_65px_rgba(23,20,18,.18)] lg:sticky lg:top-6 lg:p-5">
          <div className="border-b border-white/15 px-3 pb-5 pt-2">
            <p className="text-[9px] tracking-[.3em] text-white/50">EYEBREED</p>
            <h2 className="mt-2 font-display text-3xl text-white">{hebrew ? "החשבון שלי" : "My Account"}</h2>
          </div>
          <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {links.map(([href, labelEn, labelHe, Icon]) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-[9px] tracking-[.12em] transition duration-300 sm:px-4 ${active ? "bg-[#f8f3ec] !text-[#171412] shadow-sm" : "text-white/65 hover:bg-white/10 hover:!text-white"}`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{hebrew ? labelHe : labelEn}</span>
                </Link>
              );
            })}
            <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="flex min-h-12 items-center gap-3 rounded-xl px-3 text-start text-[9px] tracking-[.12em] text-white/65 transition duration-300 hover:bg-red-500/15 hover:!text-red-200 sm:px-4">
              <LogOut size={16} className="shrink-0" /> {hebrew ? "התנתקות" : "LOG OUT"}
            </button>
          </nav>
        </aside>

        <section className="min-w-0 rounded-3xl border border-black/10 bg-white/70 p-5 shadow-[0_18px_55px_rgba(23,20,18,.08)] backdrop-blur-sm sm:p-8 lg:p-10">
          {children}
        </section>
      </div>
    </div>
  );
}

export function PageTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  const { locale } = useStore();
  const translations: Record<string, string> = { "My Orders": "ההזמנות שלי", "My Pre-orders": "הזמנות מוקדמות", "My Profile": "הפרופיל שלי", "My Addresses": "הכתובות שלי", Wishlist: "המועדפים שלי" };
  const displayTitle = locale === "he" ? (translations[title] ?? title) : title;
  return <header className="mb-10 border-b border-black/10 pb-8"><p className="text-[9px] tracking-[.24em] text-black/45">{eyebrow ?? (locale === "he" ? "החשבון שלי" : "MY ACCOUNT")}</p><h1 className="mt-3 max-w-4xl font-display text-5xl leading-none text-[#171412] md:text-6xl">{displayTitle}</h1>{children}</header>;
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  const { locale } = useStore();
  const emptyTranslations: Record<string, [string, string]> = {
    "No orders yet": ["עדיין אין הזמנות", "הרכישות שלך ב־EYEBREED יופיעו כאן."],
    "Your wishlist is empty": ["רשימת המועדפים שלך ריקה", "שמרו פריטים שאהבתם וחזרו אליהם בכל זמן."],
    "No saved addresses": ["אין כתובות שמורות", "הוסיפו כתובת לתהליך רכישה מהיר יותר."],
    "No pre-orders": ["אין הזמנות מוקדמות", "ההרשמות והעדכונים שלך יופיעו כאן."],
    "No matching orders": ["לא נמצאו הזמנות", "הזמנות התואמות למסנן יופיעו כאן."],
  };
  const translated = emptyTranslations[title];
  return <div className="rounded-2xl border border-dashed border-black/20 bg-[#f7f2eb] px-6 py-16 text-center"><h2 className="font-display text-3xl text-[#171412]">{locale === "he" && translated ? translated[0] : title}</h2><p className="mx-auto mt-3 max-w-md text-xs leading-6 text-black/60">{locale === "he" && translated ? translated[1] : text}</p><Link href="/#products" className="mt-7 inline-flex min-h-12 items-center rounded-full bg-[#171412] px-7 text-[9px] tracking-luxury !text-white transition hover:bg-espresso-700">{locale === "he" ? "לקולקציה" : "EXPLORE COLLECTION"}</Link></div>;
}
