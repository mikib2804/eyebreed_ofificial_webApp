"use client";

import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Play,
  Pause,
  Heart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/components/store-provider";
import {
  INSTAGRAM_REELS,
  REELS_DATA,
  instagramReelEmbedUrl,
  type ReelItem,
} from "@/lib/reels";

function ReelVideo({ item, active }: { item: ReelItem; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    let visible = false;
    const update = () => {
      if (active && visible && !document.hidden)
        void video.play().catch(() => setPlaying(false));
      else {
        video.pause();
        video.currentTime = 0;
        setPlaying(false);
      }
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        update();
      },
      { threshold: 0.2 },
    );
    observer.observe(video);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      video.pause();
    };
  }, [active]);

  return (
    <>
      <video
        ref={ref}
        src={item.src}
        poster={item.poster}
        muted
        loop
        playsInline
        preload="metadata"
        onPlaying={() => setPlaying(true)}
        onError={() => setPlaying(false)}
        className="h-full w-full object-cover"
      />
      {item.poster && (
        <Image
          src={item.poster}
          alt={item.title ?? "Reel cover"}
          fill
          sizes="(max-width: 640px) 74vw, 280px"
          className={`pointer-events-none object-cover transition-opacity duration-200 motion-reduce:transition-none ${active && playing ? "opacity-0" : "opacity-100"}`}
        />
      )}
    </>
  );
}

function ReelCard({
  item,
  index,
  hebrew,
}: {
  item: ReelItem;
  index: number;
  hebrew: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [preview, setPreview] = useState(false);
  const active = hovered || focused || preview;
  if (item.type === "instagram") {
    const embedUrl = instagramReelEmbedUrl(item.link);
    if (!embedUrl) return null;
    return (
      <div className="relative w-[min(90vw,360px)] min-w-[326px] shrink-0 snap-start overflow-hidden rounded-3xl bg-ink transition-transform duration-300 hover:scale-[1.02] motion-reduce:transform-none">
        <div
          className="flex min-h-16 items-center justify-between gap-3 bg-cream px-4 py-3 text-ink"
          dir="ltr"
        >
          <a
            href={`https://www.instagram.com/${item.account ?? "eyebreed_official"}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
          >
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-display text-sm text-cream"
              aria-hidden="true"
            >
              EB
            </span>
            <span className="truncate text-xs font-medium">
              @{item.account ?? "eyebreed_official"}
            </span>
          </a>
          {item.likes !== undefined && (
            <span
              title={
                hebrew
                  ? "מספר לייקים שנבדק ב־3 באוקטובר 2026"
                  : "Likes verified October 3, 2026"
              }
              className="flex shrink-0 items-center gap-1.5 text-xs"
              aria-label={`${item.likes} ${hebrew ? "לייקים" : "likes"}`}
            >
              <Heart size={16} aria-hidden="true" className="fill-red-400" />
              <span>
                {item.likes.toLocaleString(hebrew ? "he-IL" : "en-US")}{" "}
                {hebrew ? "לייקים" : "likes"}
              </span>
            </span>
          )}
        </div>
        {/* Crop the embed to its media area; Instagram owns the iframe contents. */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <iframe
            src={embedUrl}
            title={item.title ?? `EYEBREED Instagram Reel ${index + 1}`}
            loading="lazy"
            tabIndex={-1}
            aria-hidden="true"
            className="pointer-events-none absolute -left-px -top-[54px] h-[760px] w-[calc(100%+18px)] border-0"
          />
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${item.title ?? `Reel ${index + 1}`} — ${hebrew ? "פתיחה באינסטגרם בחלון חדש" : "open Instagram in a new tab"}`}
            className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
          >
            <span className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white">
              <ArrowUpRight size={18} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    );
  }
  return (
    <div
      onPointerEnter={(event) => {
        if (
          event.pointerType === "mouse" &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      className="group relative aspect-[9/16] w-[74vw] max-w-[280px] shrink-0 snap-start overflow-hidden rounded-3xl bg-ink transition-transform duration-300 hover:scale-[1.02] motion-reduce:transform-none sm:w-[260px] lg:w-[280px]"
    >
      <a
        href={item.link}
        target="_blank"
        rel="noopener noreferrer"
        onFocus={() => {
          if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            setFocused(true);
        }}
        onBlur={() => setFocused(false)}
        aria-label={`${item.title ?? `Reel ${index + 1}`} — ${hebrew ? "פתיחה באינסטגרם בחלון חדש" : "open Instagram in a new tab"}`}
        className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white"
      >
        {item.type === "video" ? (
          <ReelVideo item={item} active={active} />
        ) : (
          <Image
            src={item.src}
            alt={item.title ?? "EYEBREED campaign"}
            fill
            sizes="(max-width: 640px) 74vw, 280px"
            className="object-cover"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-black/90 to-transparent p-5 pt-20 text-white">
          <span className="text-sm font-medium">
            {item.title ?? "EYEBREED"}
          </span>
          <ArrowUpRight size={20} aria-hidden="true" className="shrink-0" />
        </div>
      </a>
      {item.type === "video" && (
        <button
          type="button"
          onClick={() => setPreview(!preview)}
          aria-pressed={preview}
          aria-label={
            preview
              ? hebrew
                ? "עצירת תצוגה מקדימה"
                : "Stop reel preview"
              : hebrew
                ? "הפעלת תצוגה מקדימה"
                : "Play reel preview"
          }
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/80 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {preview ? <Pause size={18} /> : <Play size={18} />}
        </button>
      )}
    </div>
  );
}

export function ReelsSection({
  items = INSTAGRAM_REELS.length ? INSTAGRAM_REELS : REELS_DATA,
}: {
  items?: ReelItem[];
}) {
  const { locale } = useStore();
  const row = useRef<HTMLDivElement>(null);
  const interaction = useRef({ hovering: false, focused: false, resumeAt: 0 });
  const [autoPaused, setAutoPaused] = useState(false);
  const [bounds, setBounds] = useState({ start: true, end: false });
  const hebrew = locale === "he";

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
    if (!element || items.length < 2 || autoPaused) return;
    let visible = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.5 },
    );
    observer.observe(element);
    const timer = window.setInterval(() => {
      const state = interaction.current;
      if (
        !visible ||
        document.hidden ||
        motion.matches ||
        state.hovering ||
        state.focused ||
        Date.now() < state.resumeAt
      )
        return;
      const max = element.scrollWidth - element.clientWidth;
      if (max <= 2) return;
      const card = element.firstElementChild as HTMLElement | null;
      element.scrollTo({
        left:
          element.scrollLeft >= max - 2
            ? 0
            : Math.min(
                max,
                element.scrollLeft + (card?.offsetWidth ?? 360) + 20,
              ),
        behavior: "smooth",
      });
    }, 5000);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
    };
  }, [items, autoPaused]);

  const move = (direction: number) => {
    interaction.current.resumeAt = Date.now() + 10000;
    const element = row.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    const step = (card?.offsetWidth ?? 280) + 20;
    element.scrollBy({
      left: direction * step,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };

  if (!items.length) return null;

  return (
    <section
      aria-labelledby="reels-heading"
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
      onPointerDownCapture={() => {
        interaction.current.resumeAt = Date.now() + 10000;
      }}
      className="overflow-hidden bg-cream py-16 text-ink md:py-24"
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex items-end justify-between gap-5 px-5 md:px-12">
          <div>
            <p className="mb-3 text-xs tracking-[0.18em]" dir="ltr">
              @EYEBREED_OFFICIAL
            </p>
            <h2
              id="reels-heading"
              className="font-display text-4xl md:text-6xl"
            >
              {hebrew ? "החזון בתנועה" : "THE VISION IN MOTION"}
            </h2>
            <p className="mt-3 text-sm text-ink/75">
              {hebrew
                ? "הקמפיין שלנו. עוד באינסטגרם."
                : "From our campaign. More on Instagram."}
            </p>
          </div>
          <div className="flex shrink-0 gap-2" dir="ltr">
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={bounds.start}
              aria-label={hebrew ? "הקודם" : "Previous reels"}
              aria-controls="reels-carousel"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 transition hover:bg-ink hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-default disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={bounds.end}
              aria-label={hebrew ? "הבא" : "Next reels"}
              aria-controls="reels-carousel"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-ink/30 transition hover:bg-ink hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink disabled:cursor-default disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div
          ref={row}
          id="reels-carousel"
          dir="ltr"
          role="region"
          aria-label={hebrew ? "קרוסלת רילס" : "Reels carousel"}
          tabIndex={0}
          onTouchMove={() => {
            interaction.current.resumeAt = Date.now() + 10000;
          }}
          onWheel={() => {
            interaction.current.resumeAt = Date.now() + 10000;
          }}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
              event.preventDefault();
              move(event.key === "ArrowLeft" ? -1 : 1);
            }
          }}
          className="scrollbar-none flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 py-3 [scroll-padding-inline:20px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ink md:px-12 md:[scroll-padding-inline:48px]"
        >
          {items.map((item, index) => (
            <ReelCard key={item.id} item={item} index={index} hebrew={hebrew} />
          ))}
        </div>
      </div>
    </section>
  );
}
