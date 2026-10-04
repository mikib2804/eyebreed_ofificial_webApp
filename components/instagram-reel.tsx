"use client";

import { useEffect, useRef, useState } from "react";
import { instagramReelEmbedUrl } from "@/lib/reels";

export function processInstagramEmbeds() {
  (
    window as Window & { instgrm?: { Embeds?: { process: () => void } } }
  ).instgrm?.Embeds?.process();
}

export function InstagramReel({ link }: { link: string }) {
  const host = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setScale(Math.min(1, element.clientWidth / 360)),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setAvailable(null);
    fetch(`/api/instagram/reel-status?url=${encodeURIComponent(link)}`, {
      signal: controller.signal,
    })
      .then((response) => response.json())
      .then((result: { available?: boolean }) =>
        setAvailable(result.available === true),
      )
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setAvailable(false);
        }
      });
    return () => controller.abort();
  }, [link]);

  useEffect(() => {
    const element = content.current;
    if (!element || !instagramReelEmbedUrl(link)) return;
    setLoading(true);
    setUnavailable(false);
    let frame: HTMLIFrameElement | null = null;
    const finishLoading = () => setLoading(false);
    const hideUnavailableReel = () => {
      setLoading(false);
      setUnavailable(true);
    };
    const observer = new MutationObserver(() => {
      const nextFrame = element.querySelector("iframe");
      if (!nextFrame || nextFrame === frame) return;
      frame?.removeEventListener("load", finishLoading);
      frame?.removeEventListener("error", hideUnavailableReel);
      frame = nextFrame;
      // The server-side status check validates playability. Reveal as soon as
      // Instagram creates the iframe so a cached iframe load cannot be missed.
      finishLoading();
      frame.addEventListener("load", finishLoading, { once: true });
      frame.addEventListener("error", hideUnavailableReel, { once: true });
    });
    observer.observe(element, { childList: true, subtree: true });
    // Hide the card when Instagram cannot create a playable embed.
    const timeout = window.setTimeout(() => {
      if (!frame) hideUnavailableReel();
    }, 15000);
    // Instagram transforms this dedicated DOM container; React owns only its wrapper.
    const blockquote = document.createElement("blockquote");
    blockquote.className = "instagram-media";
    blockquote.setAttribute("data-instgrm-captioned", "");
    blockquote.setAttribute("data-instgrm-permalink", link);
    blockquote.setAttribute("data-instgrm-version", "14");
    Object.assign(blockquote.style, {
      background: "#fff",
      border: "0",
      margin: "0",
      padding: "0",
      width: "360px",
      minWidth: "326px",
      maxWidth: "360px",
    });
    const fallback = document.createElement("a");
    fallback.href = link;
    fallback.target = "_blank";
    fallback.rel = "noopener noreferrer";
    fallback.textContent = "View this reel on Instagram · @eyebreed_official";
    Object.assign(fallback.style, {
      display: "flex",
      minHeight: "520px",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      color: "#161618",
      textAlign: "center",
    });
    blockquote.append(fallback);
    element.replaceChildren(blockquote);
    processInstagramEmbeds();
    return () => {
      observer.disconnect();
      frame?.removeEventListener("load", finishLoading);
      frame?.removeEventListener("error", hideUnavailableReel);
      window.clearTimeout(timeout);
      element.replaceChildren();
    };
  }, [link]);

  if (available === false || unavailable) return null;

  return (
    <article
      ref={host}
      style={{ height: 800 * scale }}
      aria-busy={loading}
      className="relative w-[calc(100vw-32px)] max-w-[360px] shrink-0 snap-center overflow-x-hidden overflow-y-auto rounded-2xl border border-ink/10 bg-paper shadow-lg"
    >
      <div ref={content} style={{ width: 360, zoom: scale }} />
      {loading && (
        <div
          role="status"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-paper"
        >
          {/* The brand image stays decorative; the status provides its accessible label. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/app_icons/appIcon.png"
            alt=""
            width={80}
            height={80}
            className="reel-loading-logo h-20 w-20 object-contain"
          />
          <span className="text-xs tracking-widest text-ink">
            Loading reel…
          </span>
        </div>
      )}
    </article>
  );
}
