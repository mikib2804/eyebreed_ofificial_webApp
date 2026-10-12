"use client";

import Image from "next/image";
import { ArrowRight, Mail, MousePointer2 } from "lucide-react";
import { FormEvent, useState } from "react";
import PaymentSupport from "./PaymentSupport";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function VisionWaitlist() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();

    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/vision-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) throw new Error(result.message || "Please try again.");

      setStatus("success");
      setMessage(result.message || "You’re on the list.");
      form.reset();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-[#25130e] text-[#f5eee4]">
      <Image
        src="/campaign/vision-of-life/hero-mobile.webp"
        alt="Two EYEBREED models wearing the Vision of Life collection"
        fill
        priority
        sizes="(max-width: 767px) 100vw, 1px"
        className="-z-30 object-cover object-center md:hidden"
      />
      <Image
        src="/campaign/vision-of-life/hero-wide.webp"
        alt="Two EYEBREED models wearing the Vision of Life collection"
        fill
        priority
        sizes="(min-width: 768px) 100vw, 1px"
        className="-z-30 hidden object-cover object-center md:block"
      />
      <div className="absolute inset-0 -z-20 bg-[#1e0e09]/35" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,transparent_15%,rgba(18,7,4,.2)_58%,rgba(12,5,3,.66)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />

      <div className="mx-auto flex min-h-svh w-full max-w-[1500px] flex-col items-center px-5 pb-7 pt-6 text-center sm:px-8 sm:pb-9 sm:pt-8 lg:px-12">
        <header className="flex flex-col items-center" aria-label="EYEBREED">
          <Image
            src="/app_icons/appIcon.png"
            alt=""
            width={120}
            height={120}
            className="h-16 w-24 object-contain brightness-0 invert sm:h-20 sm:w-28"
          />
          <span className="-mt-2 font-display text-xl tracking-[.34em] sm:text-2xl">
            EYEBREED
          </span>
        </header>

        <section className="my-auto flex w-full max-w-[760px] flex-col items-center py-7 sm:py-10">
          <div className="relative w-full pt-8 sm:pt-10">
            <svg
              aria-hidden="true"
              viewBox="0 0 620 94"
              preserveAspectRatio="none"
              className="absolute left-1/2 top-0 h-14 w-[84%] -translate-x-1/2 overflow-visible sm:h-20"
            >
              <path
                d="M12 82 C 92 0, 184 8, 260 50 S 390 76, 456 35 S 554 12, 608 52"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="relative inline-flex items-start">
              <h1 className="font-display text-[clamp(5.2rem,18vw,12.5rem)] font-medium leading-[.64] tracking-[-.075em] drop-shadow-[0_3px_18px_rgba(0,0,0,.45)]">
                VISION
              </h1>
            </div>
          </div>

          <div className="mt-5 flex w-[min(92%,500px)] items-center gap-5 sm:mt-8">
            <span className="h-px flex-1 bg-current/75" />
            <p className="font-display text-2xl tracking-[.46em] sm:text-4xl">
              OF LIFE
            </p>
            <span className="h-px flex-1 bg-current/75" />
          </div>

          <p
            dir="rtl"
            className="mt-5 text-xl tracking-[.15em] sm:mt-7 sm:text-2xl"
          >
            הזמנה מוקדמת
          </p>

          <form
            onSubmit={submit}
            className="mt-6 w-full max-w-[590px] space-y-2.5 sm:mt-7"
          >
            <label className="sr-only" htmlFor="vision-email">
              Email address
            </label>
            <div className="flex min-h-16 items-center rounded-2xl border border-white/70 bg-black/25 px-5 shadow-[0_12px_45px_rgba(0,0,0,.18)] backdrop-blur-sm sm:min-h-[74px] sm:px-7">
              <input
                id="vision-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="EMAIL ADDRESS"
                className="min-w-0 flex-1  bg-transparent font-display text-xl tracking-[.04em] text-white outline-none ring-0 placeholder:text-white/65 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 sm:text-2xl"
              />
              <Mail
                aria-hidden="true"
                className="ml-4 size-6 shrink-0"
                strokeWidth={1.4}
              />
            </div>
            <div className="relative">
              <button
                type="submit"
                disabled={status === "submitting"}
                className="vision-join-button group flex min-h-16 w-full items-center justify-center gap-5 rounded-2xl bg-[#f3ebdf] px-6 font-display text-lg font-semibold tracking-[.32em] text-[#17100d] shadow-[0_12px_45px_rgba(0,0,0,.24)] transition duration-300 hover:bg-white focus-visible:outline-white disabled:cursor-wait disabled:opacity-70 sm:min-h-[74px] sm:text-2xl"
              >
                <span>
                  {status === "submitting" ? "JOINING…" : "JOIN THE LIST"}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-6 transition-transform duration-300 group-hover:translate-x-1.5"
                  strokeWidth={1.5}
                />
              </button>
              {status === "idle" && (
                <div
                  aria-hidden="true"
                  className="vision-demo-cursor pointer-events-none absolute -bottom-7 right-0 z-10 h-16 w-16 text-[#17100d] sm:-bottom-8 sm:-right-3"
                >
                  <span className="vision-click-ray vision-click-ray--one" />
                  <span className="vision-click-ray vision-click-ray--two" />
                  <span className="vision-click-ray vision-click-ray--three" />
                  <MousePointer2 className="absolute bottom-0 right-0 size-11 fill-white stroke-[2.4] drop-shadow-[2px_3px_0_rgba(0,0,0,.7)] sm:size-12" />
                </div>
              )}
            </div>
            <p
              aria-live="polite"
              className={`min-h-5 pt-1 text-[11px] tracking-[.16em] ${
                status === "error" ? "text-red-200" : "text-white/85"
              }`}
            >
              {message}
            </p>
          </form>
        </section>

        <footer className="flex flex-col items-center text-[10px] leading-5 tracking-[.38em] sm:text-xs sm:leading-6">
          <p>IT’S NOT THE EYES</p>
          <p>IT’S THE VISION</p>
          <div className="mx-auto mt-16 justify-center items-center flex max-w-[1600px] flex-col gap-3 border-t border-white/15 pt-6 text-[9px] tracking-wider text-white/75 sm:flex-row sm:justify-between">
            <span>© 2026 EYEBREED-STUDIO™. All Rights Reserved.</span>
            <PaymentSupport />
            <span className="flex gap-2 justify-center text-center items-center sm:justify-end">
              DESIGNED AND POWERED BY EASYPASSPROJECTS ©
              <Image
                src="/easyPassProjects.png"
                alt="EASYPASSPROJECTS"
                width={20}
                height={20}
              />
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
