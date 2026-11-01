"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { useStore } from "@/components/store-provider";

export function MediaSection() {
  const { t } = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [filmActive, setFilmActive] = useState(false);

  const showFilm = () => {
    setFilmActive(true);
    void videoRef.current?.play();
  };

  const hideFilm = () => {
    setFilmActive(false);
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  const toggleFilm = () => {
    if (filmActive) hideFilm();
    else showFilm();
  };

  return (
    <section className="grid bg-ink text-white lg:grid-cols-2">
      <div
        className="group relative min-h-[420px] overflow-hidden lg:min-h-[620px]"
        onMouseEnter={showFilm}
        onMouseLeave={hideFilm}
      >
        <Image
          src="/campaign/modernAll/DSCF0127.JPG"
          alt="EYEBREED Vision campaign overlooking the city"
          fill
          className={`object-cover transition duration-1000 group-hover:scale-105 ${filmActive ? "opacity-0" : "opacity-65"}`}
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <video
          ref={videoRef}
          src="/media/eyebreed-viral.mp4"
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="EYEBREED Autumn Film"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${filmActive ? "opacity-100" : "opacity-0"}`}
        />
        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/15 transition-all duration-500 ${filmActive ? "bg-black/0" : "bg-black/15"}`}>
          <h2 className={`p-3 font-display text-5xl transition duration-500 md:text-7xl ${filmActive ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}>{t.media}</h2>
          <button
            type="button"
            aria-label={filmActive ? "Pause film" : "Play film"}
            aria-pressed={filmActive}
            onClick={toggleFilm}
            onFocus={showFilm}
            className={`mt-8 flex h-16 w-16 items-center justify-center rounded-full border border-white/80 transition duration-300 hover:bg-white hover:text-black ${filmActive ? "bg-black/25 opacity-70 hover:opacity-100" : ""}`}
          >
            {filmActive ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2">
        <div className="relative min-h-[420px] lg:min-h-[620px]">
          <Image
            src="/campaign/modernAll/DSCF0415.JPG"
            alt="EYEBREED Vision campaign at the graffiti wall"
            fill
            className="object-cover grayscale-[20%]"
            sizes="25vw"
          />
        </div>
        <div className="relative min-h-[420px] lg:min-h-[620px]">
          <Image
            src="/campaign/modernAll/DSCF0479.JPG"
            alt="EYEBREED Vision hoodie campaign portrait"
            fill
            className="object-cover grayscale-[10%]"
            sizes="25vw"
          />
        </div>
      </div>
    </section>
  );
}
