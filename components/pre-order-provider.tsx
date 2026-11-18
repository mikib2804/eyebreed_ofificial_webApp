"use client";

import { HelpCircle, X } from "lucide-react";
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useStore } from "@/components/store-provider";
import { preOrderContent } from "@/lib/pre-order-content";

const PRE_ORDER_NOTICE_SESSION_KEY = "eyebreed-pre-order-notice-v1";
const PreOrderContext = createContext({ enabled: false });

export function PreOrderProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useStore();
  const [enabled, setEnabled] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const dismissNotice = useCallback(() => {
    sessionStorage.setItem(PRE_ORDER_NOTICE_SESSION_KEY, "dismissed");
    setNoticeOpen(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch("/api/store/pre-order", { cache: "no-store" });
        if (!response.ok) return;
        const result = (await response.json()) as { enabled?: boolean };
        if (cancelled) return;
        const active = result.enabled === true;
        setEnabled(active);
        if (active) {
          setNoticeOpen(sessionStorage.getItem(PRE_ORDER_NOTICE_SESSION_KEY) !== "dismissed");
        } else {
          setNoticeOpen(false);
          sessionStorage.removeItem(PRE_ORDER_NOTICE_SESSION_KEY);
        }
      } catch {}
    };
    void load();
    const refresh = () => void load();
    const visibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    const timer = window.setInterval(load, 60_000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  useEffect(() => {
    if (!noticeOpen) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismissNotice();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", keydown);
    return () => {
      document.removeEventListener("keydown", keydown);
      document.body.style.overflow = originalOverflow;
      previous?.focus();
    };
  }, [dismissNotice, noticeOpen]);

  const he = locale === "he";
  return (
    <PreOrderContext.Provider value={{ enabled }}>
      {children}
      {enabled && noticeOpen && (
        <div className="fixed inset-0 z-[105] grid place-items-center px-4 py-6" dir={he ? "rtl" : "ltr"}>
          <button type="button" tabIndex={-1} aria-hidden="true" onClick={dismissNotice} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="preorder-notice-title" aria-describedby="preorder-notice-description" className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#1a1110] text-white shadow-[0_30px_100px_rgba(0,0,0,.5)]">
            <div className="h-1.5 bg-[#8a5f46]" />
            <button ref={closeRef} type="button" onClick={dismissNotice} aria-label={he ? "סגירת הודעת הזמנה מוקדמת" : "Close pre-order notice"} className="absolute end-4 top-5 grid h-11 w-11 place-items-center rounded-full border border-white/25 transition hover:bg-white hover:text-black"><X size={19} aria-hidden="true" /></button>
            <div className="p-6 pe-16 sm:p-9 sm:pe-20">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-semibold tracking-[.24em] text-[#d9b99f]">VISION DROP</p>
                <PreOrderInfoButton />
              </div>
              <h2 id="preorder-notice-title" dir="ltr" className={`mt-5 font-display text-4xl sm:text-5xl ${he ? "text-right" : "text-left"}`}>PRE-ORDER NOTICE</h2>
              <div id="preorder-notice-description" className="mt-6 space-y-4 text-sm leading-7 text-white/85 sm:text-base">
                <p>{he ? "כל ההזמנות באתר כרגע מתבצעות בשיטת הזמנה מוקדמת (Pre-Order)." : "All website orders are currently placed as Pre-Orders."}</p>
                <p>{he ? "זמן האספקה המשוער הוא בין 30 ל-60 ימים ממועד ההזמנה." : "Estimated delivery is 30–60 days from the order date."}</p>
                <p>{he ? "חשוב לנו שתכירו את התהליך לפני ביצוע ההזמנה." : "We want you to understand the process before placing your order."}</p>
              </div>
              <button type="button" onClick={dismissNotice} className="mt-8 min-h-12 w-full rounded-lg bg-[#8a5f46] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#a87858]">{he ? "הבנתי, להמשך גלישה" : "I understand, continue browsing"}</button>
            </div>
          </div>
        </div>
      )}
    </PreOrderContext.Provider>
  );
}

export function usePreOrder() {
  return useContext(PreOrderContext);
}

export function PreOrderInfoButton({ inverse = false }: { inverse?: boolean }) {
  const { locale } = useStore();
  const [opened, setOpened] = useState(false);
  const [hovered, setHovered] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpenedRef = useRef(false);
  const content = preOrderContent[locale];
  const visible = opened || hovered;

  useEffect(() => {
    if (opened) {
      wasOpenedRef.current = true;
      closeRef.current?.focus();
    } else if (wasOpenedRef.current) {
      wasOpenedRef.current = false;
      triggerRef.current?.focus();
    }
  }, [opened]);

  return (
    <div className="relative inline-flex" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <button ref={triggerRef} type="button" aria-label={locale === "he" ? "מידע נוסף על הזמנה מוקדמת" : "More information about pre-orders"} aria-expanded={visible} onClick={() => setOpened((current) => !current)} className={`grid h-9 w-9 place-items-center rounded-full border ${inverse ? "border-black/30 text-black" : "border-white/35 text-white"}`}><HelpCircle size={18} aria-hidden="true" /></button>
      {visible && (
        <div role="dialog" aria-label={content.title} onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setOpened(false); setHovered(false); } }} className="fixed inset-3 z-[120] flex max-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-black/15 bg-white text-[#171412] shadow-2xl sm:inset-auto sm:end-5 sm:top-5 sm:max-h-[calc(100dvh-2.5rem)] sm:w-[min(92vw,560px)]" dir={locale === "he" ? "rtl" : "ltr"}>
          <div className="flex items-start justify-between gap-4 border-b border-black/15 p-5 sm:p-6">
            <strong className="pe-3 font-display text-2xl sm:text-3xl">{content.title}</strong>
            <button ref={closeRef} type="button" onClick={() => { setOpened(false); setHovered(false); }} aria-label={locale === "he" ? "סגירת מידע" : "Close information"} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-black/20"><X size={18} aria-hidden="true" /></button>
          </div>
          <div className="overflow-y-auto p-5 text-sm leading-7 sm:p-6">
            {content.paragraphs.map((paragraph) => <p key={paragraph} className="mb-4">{paragraph}</p>)}
            <strong className="mb-3 block">{content.important}</strong>
            <ul className="list-disc space-y-2 ps-5">{content.bullets.map((item) => <li key={item}>{item}</li>)}</ul>
            <p className="mt-5">{content.closing}</p>
            <strong dir="ltr" className={`mt-6 block tracking-[.08em] ${locale === "he" ? "text-right" : "text-left"}`}>IT’S NOT THE EYES, IT’S THE VISION.</strong>
            <strong dir="ltr" className={`mt-2 block ${locale === "he" ? "text-right" : "text-left"}`}>EYEBREED.</strong>
          </div>
        </div>
      )}
    </div>
  );
}
