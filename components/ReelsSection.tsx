"use client";

import { useStore } from "@/components/store-provider";
import { INSTAGRAM_REELS, type ReelItem } from "@/lib/reels";
import Script from "next/script";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  InstagramReel,
  processInstagramEmbeds,
} from "@/components/instagram-reel";

export function ReelsSection({
  items = INSTAGRAM_REELS,
}: {
  items?: ReelItem[];
}) {
  const { locale } = useStore();
  const hebrew = locale === "he";
  const row = useRef<HTMLDivElement>(null);
  const interaction = useRef({ hovering: false, focused: false, until: 0 });
  const [bounds, setBounds] = useState({ start: true, end: false });
  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const update = () =>
      setBounds({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    const observer = new ResizeObserver(update);
    observer.observe(element);
    element.addEventListener("scroll", update, { passive: true });
    update();
    return () => {
      observer.disconnect();
      element.removeEventListener("scroll", update);
    };
  }, [items]);
  useEffect(() => {
    const element = row.current;
    if (!element || items.length < 2) return;
    let visible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.25 },
    );
    observer.observe(element);
    const timer = window.setInterval(() => {
      const state = interaction.current;
      if (
        !visible ||
        document.hidden ||
        matchMedia("(prefers-reduced-motion: reduce)").matches ||
        state.hovering ||
        state.focused ||
        Date.now() < state.until ||
        element.contains(document.activeElement)
      )
        return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 2) return;
      const width =
        (element.firstElementChild as HTMLElement | null)?.offsetWidth ?? 360;
      element.scrollTo({
        left:
          element.scrollLeft >= max - 2
            ? 0
            : Math.min(max, element.scrollLeft + width + 20),
        behavior: "smooth",
      });
    }, 5000);
    return () => {
      observer.disconnect();
      window.clearInterval(timer);
    };
  }, [items]);
  const override = () => {
    interaction.current.until = Date.now() + 10000;
  };
  const move = (direction: number) => {
    override();
    const element = row.current;
    if (!element) return;
    element.scrollBy({
      left:
        direction *
        (((element.firstElementChild as HTMLElement | null)?.offsetWidth ??
          360) +
          20),
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  if (!items.length) return null;
  return (
    <section
      aria-labelledby="reels-heading"
      className="overflow-hidden bg-cream py-12 text-ink sm:py-16 md:py-24"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") interaction.current.hovering = true;
      }}
      onPointerLeave={() => {
        interaction.current.hovering = false;
      }}
      onFocusCapture={() => {
        interaction.current.focused = true;
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          interaction.current.focused = false;
      }}
      onPointerDownCapture={override}
    >
      <Script
        id="instagram-embed"
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onReady={processInstagramEmbeds}
      />
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 px-4 sm:px-5 md:px-12">
          <p className="mb-3 text-xs tracking-[0.18em]" dir="ltr">
            @EYEBREED_OFFICIAL
          </p>
          <h2
            id="reels-heading"
            className="font-display text-[clamp(1.8rem,7vw,3.75rem)] leading-tight"
          >
            {hebrew ? "החזון בתנועה" : "THE VISION IN MOTION"}
          </h2>
          <p className="mt-3 text-sm text-ink/75">
            {hebrew
              ? "הקמפיין שלנו. עוד באינסטגרם."
              : "From our campaign. More on Instagram."}
          </p>
        </div>
        <div className="mb-4 flex gap-2 px-4 md:px-12" dir="ltr">
          <button
            type="button"
            disabled={bounds.start}
            onClick={() => move(-1)}
            aria-label={hebrew ? "הריל הקודם" : "Previous reels"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            disabled={bounds.end}
            onClick={() => move(1)}
            aria-label={hebrew ? "הריל הבא" : "Next reels"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
        <div
          ref={row}
          role="region"
          aria-label={hebrew ? "קרוסלת רילס" : "Reels carousel"}
          tabIndex={0}
          dir="ltr"
          onWheel={override}
          onTouchMove={override}
          onKeyDown={(event) => {
            if (
              event.target === event.currentTarget &&
              (event.key === "ArrowLeft" || event.key === "ArrowRight")
            ) {
              event.preventDefault();
              move(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
          className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 py-4 [scroll-padding-inline:16px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] md:px-12 md:[scroll-padding-inline:48px]"
        >
          {items.map((item) => (
            <InstagramReel key={item.id} link={item.link} />
          ))}
        </div>
      </div>
    </section>
  );
}
