"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/components/store-provider";
import SpecularButton from "./SpecularButton";
import Image from "next/image";
import { cn } from "@/lib/utils";

const COOKIE_NAME = "eyebreed_cookie_consent";
const ONE_YEAR = 60 * 60 * 24 * 365;

type ConsentChoice = "all" | "necessary";

export function CookieConsent() {
  const { locale } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasChoice = document.cookie
      .split("; ")
      .some((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
    if (!hasChoice) setVisible(true);
  }, []);

  function saveChoice(choice: ConsentChoice) {
    document.cookie = `${COOKIE_NAME}=${choice}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
    window.localStorage.setItem(COOKIE_NAME, choice);
    window.dispatchEvent(
      new CustomEvent("eyebreed:cookie-consent", { detail: choice }),
    );
    setVisible(false);
  }

  if (!visible) return null;

  const text =
    locale === "he"
      ? {
          eyebrow: "הפרטיות שלך",
          title: "אנחנו משתמשים בעוגיות",
          body: "עוגיות חיוניות מאפשרות לאתר, להתחברות ולסל הקניות לפעול. באישורכם נוכל להשתמש גם בעוגיות נוספות כדי לשפר את החוויה.",
          accept: "אישור הכל",
          necessary: "חיוניות בלבד",
          close: "סגירה עם עוגיות חיוניות בלבד",
        }
      : {
          eyebrow: "YOUR PRIVACY",
          title: "We use cookies",
          body: "Essential cookies keep the store, sign-in and shopping bag working. With your permission, optional cookies can help us improve your experience.",
          accept: "ACCEPT ALL",
          necessary: "NECESSARY ONLY",
          close: "Close with necessary cookies only",
        };

  return (
    <aside
      role="dialog"
      aria-live="polite"
      aria-label={text.title}
      className="fixed inset-x-4 bottom-4 z-[100] border border-white/20 bg-ink/95 text-white shadow-2xl backdrop-blur-md sm:start-auto sm:w-[min(94vw,620px)] md:bottom-7 md:end-7"
    >
      <button
        type="button"
        aria-label={text.close}
        onClick={() => saveChoice("necessary")}
        className="absolute end-4 top-4 p-2 text-white/55 hover:text-white"
      >
        <X size={17} strokeWidth={1.4} />
      </button>

      <div className="relative p-6 pe-14 sm:p-8 sm:pe-16">
        <p className="text-[9px] tracking-luxury text-espresso-200">
          {text.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-4xl">{text.title}</h2>
        <p className="mt-4 max-w-xl text-xs leading-6 text-white/62">
          {text.body}
        </p>
        <Image
          className={cn(
            "absolute",
            locale === "he" ? "left-14 top-8" : "right-14 top-8 -scale-x-100",
          )}
          height={70}
          width={70}
          alt="cookie"
          src="/app_icons/cookie.png"
        />
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <SpecularButton
            type="button"
            onClick={() => saveChoice("all")}
            size="md"
            radius={12}
            baseColor="#4a2f24"
            lineColor="#ffffff"
            className="min-w-44 text-[9px] tracking-luxury"
          >
            {text.accept}
          </SpecularButton>
          <button
            type="button"
            onClick={() => saveChoice("necessary")}
            className="min-h-11 border border-white/25 px-5 py-3 text-[9px] tracking-luxury text-white/75 hover:border-white hover:text-white"
          >
            {text.necessary}
          </button>
        </div>
      </div>
    </aside>
  );
}
