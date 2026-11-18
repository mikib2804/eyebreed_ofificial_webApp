"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "@/components/store-provider";
import PaymentSupport from "@/components/PaymentSupport";
import type { PublicMaintenanceNotice } from "@/lib/maintenance";

const BYPASS_PREFIXES = ["/admin", "/login"];

function isBypassed(pathname: string) {
  return BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function remainingTime(endsAt: string, now: number, locale: "he" | "en") {
  const milliseconds = new Date(endsAt).getTime() - now;
  if (milliseconds <= 0) return locale === "he"
    ? "התחזוקה נמשכת זמן רב מהצפוי. אנחנו עובדים כדי לחזור בהקדם."
    : "Maintenance is taking longer than expected. We are working to return as soon as possible.";
  const seconds = Math.floor(milliseconds / 1_000);
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = [days ? `${days}${locale === "he" ? " ימים" : "d"}` : "", `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`].filter(Boolean);
  return parts.join(" · ");
}

export function MaintenanceGate({ initialNotice, initialNow, children }: { initialNotice: PublicMaintenanceNotice | null; initialNow: number; children: React.ReactNode }) {
  const pathname = usePathname();
  const { locale, setLocale } = useStore();
  const [notice, setNotice] = useState(initialNotice);
  const [now, setNow] = useState(initialNow);
  const bypassed = isBypassed(pathname);

  useEffect(() => {
    if (bypassed) return;
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/store/maintenance", { cache: "no-store" });
        if (!response.ok) return;
        const result = await response.json() as { notice?: PublicMaintenanceNotice | null };
        if (!cancelled) setNotice(result.notice ?? null);
      } catch {}
    };
    void load();
    const interval = window.setInterval(load, 5_000);
    const focus = () => void load();
    const visibility = () => { if (document.visibilityState === "visible") void load(); };
    window.addEventListener("focus", focus);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      window.removeEventListener("focus", focus);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [bypassed]);

  useEffect(() => {
    if (!notice || bypassed) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [bypassed, notice]);

  const countdown = useMemo(() => notice ? remainingTime(notice.endsAt, now, locale) : "", [locale, notice, now]);
  if (bypassed || !notice) return children;
  const he = locale === "he";

  return (
    <main id="main-content" tabIndex={-1} className="relative isolate min-h-svh overflow-x-hidden overscroll-none bg-black text-[#f5eee4]" dir={he ? "rtl" : "ltr"}>
      <div aria-hidden="true" className="fixed inset-0 -z-30 overflow-hidden bg-[#25130e] md:hidden">
        <div className="absolute left-1/2 top-1/2 h-[102vw] w-[102dvh] -translate-x-1/2 -translate-y-1/2 -rotate-90">
          <Image
            src="/campaign/vision-of-life/hero.webp"
            alt=""
            fill
            priority
            sizes="100svh"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-[#160906]/55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_10%,rgba(18,7,4,.22)_54%,rgba(8,3,2,.8)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" />
      </div>
      <Image
        src="/campaign/vision-of-life/maintenance-desktop.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 768px) 100vw, 1px"
        className="absolute inset-0 -z-30 hidden object-cover object-center md:block"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-20 hidden bg-[#160906]/55 md:block" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 hidden bg-[radial-gradient(circle_at_center,transparent_10%,rgba(18,7,4,.22)_54%,rgba(8,3,2,.8)_100%)] md:block" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 hidden h-1/2 bg-gradient-to-t from-black/75 to-transparent md:block" />

      <div dir="ltr" className="absolute end-5 top-5 z-20 flex items-center rounded-full border border-white/35 bg-black/15 px-4 py-2 text-[10px] tracking-[.2em] backdrop-blur-sm sm:end-8 sm:top-7 sm:text-xs">
        <button type="button" aria-pressed={!he} onClick={() => setLocale("en")} className={!he ? "text-white" : "text-white/55"}>EN</button>
        <span aria-hidden="true" className="mx-2 text-white/35">|</span>
        <button type="button" aria-pressed={he} onClick={() => setLocale("he")} className={he ? "text-white" : "text-white/55"}>עב</button>
      </div>

      <div className="mx-auto flex min-h-svh w-full max-w-[1500px] flex-col items-center px-5 pb-7 pt-5 text-center sm:px-8 sm:pb-9 sm:pt-7 lg:px-12">
        <header className="flex flex-col items-center" aria-label="EYEBREED">
          <Image src="/app_icons/appIcon.png" alt="" width={120} height={120} className="h-14 w-20 object-contain brightness-0 invert sm:h-20 sm:w-28" />
          <span dir="ltr" className="-mt-2 font-display text-lg tracking-[.34em] sm:text-2xl">EYEBREED</span>
        </header>

        <section aria-labelledby="maintenance-title" className="my-auto flex w-full max-w-[760px] flex-col items-center py-6 sm:py-9">
          <div className="relative w-full pt-7 sm:pt-10">
            <svg aria-hidden="true" viewBox="0 0 620 94" preserveAspectRatio="none" className="absolute left-1/2 top-0 h-12 w-[84%] -translate-x-1/2 overflow-visible sm:h-20">
              <path d="M12 82 C 92 0, 184 8, 260 50 S 390 76, 456 35 S 554 12, 608 52" fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            </svg>
            <h1 dir="ltr" className="relative font-display text-[clamp(4.6rem,17vw,11rem)] font-medium leading-[.64] tracking-[-.075em] drop-shadow-[0_3px_18px_rgba(0,0,0,.45)]">VISION</h1>
          </div>

          <div dir="ltr" className="mt-5 flex w-[min(92%,500px)] items-center gap-5 sm:mt-8">
            <span className="h-px flex-1 bg-current/75" />
            <p className="font-display text-xl tracking-[.46em] sm:text-4xl">OF LIFE</p>
            <span className="h-px flex-1 bg-current/75" />
          </div>

          <h2 id="maintenance-title" className="mt-6 break-words font-display text-3xl font-semibold leading-tight drop-shadow-lg sm:mt-8 sm:text-5xl">{notice.title}</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/90 drop-shadow-md sm:text-lg sm:leading-8">{notice.message}</p>
          {notice.subtitle && <p className="mt-2 text-xs leading-6 text-white/70 sm:text-sm">{notice.subtitle}</p>}

          <div className="mt-6 w-full max-w-[590px] overflow-hidden rounded-2xl border border-white/55 bg-black/25 shadow-[0_12px_45px_rgba(0,0,0,.28)] backdrop-blur-sm sm:mt-8">
            <div className="flex items-center justify-center gap-3 border-b border-white/20 px-5 py-3 sm:py-4">
              <span className="text-[10px] font-medium tracking-[.16em] text-white/65 sm:text-xs">{he ? "משך משוער" : "EXPECTED DURATION"}</span>
              <strong className="font-display text-xl sm:text-2xl">{notice.duration}</strong>
            </div>
            <div className="px-4 py-4 sm:px-7 sm:py-6">
              <span className="block text-[10px] font-medium tracking-[.18em] text-white/65 sm:text-xs">{he ? "זמן שנותר" : "TIME REMAINING"}</span>
              <strong dir="ltr" aria-live="polite" aria-atomic="true" className="mt-2 block break-words font-display text-[clamp(2.5rem,9vw,5.5rem)] font-medium leading-none tracking-[.04em] text-[#f5eee4] drop-shadow-[0_3px_16px_rgba(0,0,0,.5)]">{countdown}</strong>
            </div>
          </div>
        </section>

        <footer dir="ltr" className="flex w-full flex-col items-center text-[9px] leading-5 tracking-[.32em] sm:text-xs sm:leading-6 sm:tracking-[.38em]">
          <p>IT’S NOT THE EYES</p>
          <p>IT’S THE VISION</p>
          <div className="mx-auto mt-8 flex w-full max-w-[1600px] flex-col items-center justify-center gap-3 border-t border-white/15 pt-5 text-[8px] tracking-wider text-white/75 sm:mt-12 sm:flex-row sm:justify-between sm:text-[9px]">
            <span>© 2026 EYEBREED™. All Rights Reserved.</span>
            <PaymentSupport />
            <span className="flex items-center justify-center gap-2 text-center sm:justify-end">DESIGNED AND POWERED BY EASYPASSPROJECTS ©<Image src="/easyPassProjects.png" alt="EASYPASSPROJECTS" width={20} height={20} /></span>
          </div>
        </footer>
      </div>
    </main>
  );
}
