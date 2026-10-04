"use client";

import { useStore } from "@/components/store-provider";
import { INSTAGRAM_REELS, type ReelItem } from "@/lib/reels";
import Script from "next/script";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
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
  const interaction = useRef({ until: 0 });
  const [activeReel, setActiveReel] = useState(0);
  const [visibleReels, setVisibleReels] = useState(items.length);

  useEffect(() => {
    const element = row.current;
    if (!element) return;

    const updateIndicators = () => {
      const cards = Array.from(element.children) as HTMLElement[];
      setVisibleReels(cards.length);
      if (!cards.length) {
        setActiveReel(0);
        return;
      }

      const viewportCenter = element.scrollLeft + element.clientWidth / 2;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - viewportCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });
      setActiveReel(closestIndex);
    };

    const resizeObserver = new ResizeObserver(updateIndicators);
    const mutationObserver = new MutationObserver(updateIndicators);
    resizeObserver.observe(element);
    mutationObserver.observe(element, { childList: true });
    element.addEventListener("scroll", updateIndicators, { passive: true });
    updateIndicators();

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      element.removeEventListener("scroll", updateIndicators);
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
      { threshold: 0.2 },
    );
    observer.observe(element);
    const timer = window.setInterval(() => {
      const state = interaction.current;
      if (
        !visible ||
        document.hidden ||
        matchMedia("(prefers-reduced-motion: reduce)").matches ||
        Date.now() < state.until
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
    const max = element.scrollWidth - element.clientWidth;
    const distance =
      ((element.firstElementChild as HTMLElement | null)?.offsetWidth ?? 360) +
      20;
    const next = element.scrollLeft + direction * distance;
    const target =
      direction > 0 && element.scrollLeft >= max - 2
        ? 0
        : direction < 0 && element.scrollLeft <= 2
          ? max
          : Math.max(0, Math.min(max, next));
    element.scrollTo({
      left: target,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  const goToReel = (index: number) => {
    override();
    const element = row.current;
    const card = element?.children[index] as HTMLElement | undefined;
    if (!element || !card) return;
    element.scrollTo({
      left: Math.max(
        0,
        card.offsetLeft - (element.clientWidth - card.offsetWidth) / 2,
      ),
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
    >
      <Script
        id="instagram-embed"
        src="https://www.instagram.com/embed.js"
        strategy="afterInteractive"
        onReady={processInstagramEmbeds}
      />
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 px-4 sm:px-5 md:px-12">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2" dir="ltr">
              <a
                href="https://www.instagram.com/eyebreed_official/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs tracking-[0.18em] transition-opacity hover:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                @EYEBREED_OFFICIAL
              </a>
              <a
                href="https://www.instagram.com/eyebreed_official/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit EYEBREED Official on Instagram"
                className="shrink-0 rounded-md transition-transform duration-300  focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <Image
                  src="/instaLogo.png"
                  alt=""
                  width={220}
                  height={183}
                  className="h-auto w-10 object-contain sm:w-12"
                />
              </a>
            </div>
            <h2
              id="reels-heading"
              className="font-display text-[clamp(1.8rem,7vw,3.75rem)] leading-[0.95]"
            >
              {hebrew ? "החזון בתנועה" : "THE VISION IN MOTION"}
            </h2>
            <p className="mt-3 text-sm text-ink/75">
              {hebrew
                ? "הקמפיין שלנו. עוד באינסטגרם."
                : "From our campaign. More on Instagram."}
            </p>
          </div>
        </div>
        <div className="mb-4 flex gap-2 px-4 md:px-12" dir="ltr">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label={hebrew ? "הריל הקודם" : "Previous reels"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label={hebrew ? "הריל הבא" : "Next reels"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
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
        {visibleReels > 1 && (
          <div
            className="mt-3 flex h-5 items-center justify-center gap-2 px-4"
            dir="ltr"
            aria-label={hebrew ? "בחירת ריל" : "Select reel"}
          >
            {Array.from({ length: visibleReels }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToReel(index)}
                aria-label={
                  hebrew ? `מעבר לריל ${index + 1}` : `Go to reel ${index + 1}`
                }
                aria-current={index === activeReel ? "true" : undefined}
                className={`rounded-[2px] bg-ink transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 ${
                  index === activeReel
                    ? "h-3 w-3 opacity-100"
                    : "h-2 w-2 opacity-35 hover:opacity-70"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
