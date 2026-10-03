"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { modernAllImages } from "@/lib/campaign-catalog";

const slideLabels = ["THE ART OF ARRIVAL.", "FORM FOLLOWS FEELING.", "QUIETLY DISTINCT."];
const slides = modernAllImages.map((image, index) => ({ image, label: slideLabels[index % slideLabels.length] }));

export function LoginExperience() {
  const router = useRouter();
  const [slide, setSlide] = useState(0);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setInterval(
      () => setSlide((current) => (current + 1) % slides.length),
      5500,
    );
    return () => window.clearInterval(timer);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (mode === "register") {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.get("name"), email, password }),
      });
      if (!response.ok) {
        const body = await response.json();
        setError(body.error ?? "We could not create your account.");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.error) {
      setError("Email or password is incorrect.");
      setLoading(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <main className="grid min-h-screen bg-cream text-ink lg:grid-cols-[58%_42%]">
      <section className="relative min-h-[42vh] overflow-hidden bg-ink text-white lg:min-h-screen">
        {slides.map((item, index) => (
          <Image
            key={item.image}
            src={item.image}
            alt="EYEBREED editorial campaign"
            fill
            priority={index === 0}
            className={`object-cover object-center transition duration-[1400ms] ease-luxury ${slide === index ? "scale-100 opacity-75" : "scale-[1.035] opacity-0"}`}
            sizes="(max-width: 1024px) 100vw, 58vw"
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/20" />
        <Link
          href="/"
          aria-label="Back to store"
          className="absolute start-6 top-6 z-10 flex h-11 w-11 items-center justify-center border border-white/45 transition hover:bg-white hover:text-black md:start-10 md:top-10"
        >
          <ArrowLeft size={19} className="rtl:rotate-180" />
        </Link>
        <div className="absolute inset-x-6 bottom-8 z-10 md:inset-x-12 md:bottom-12 lg:inset-x-16 lg:bottom-16">
          <p className="text-[9px] tracking-[.3em] text-white/75">
            EYEBREED JOURNAL&nbsp;&nbsp;/&nbsp;&nbsp;0{slide + 1}
          </p>
          <h2 className="mt-5 max-w-3xl font-display text-4xl leading-none sm:text-6xl lg:text-[clamp(4rem,6vw,7rem)]">
            {slides[slide].label}
          </h2>
          <div className="mt-8 flex gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlide(index)}
                aria-label={`Show slide ${index + 1}`}
                className="h-px w-12 bg-white/35"
              >
                <span
                  className={`block h-px bg-white transition-all duration-700 ${slide === index ? "w-full" : "w-0"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-[650px] items-center justify-center px-6 py-14 sm:px-12 lg:px-[5vw]">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="block text-center font-display text-4xl tracking-[.22em]"
          >
            EYEBREED
          </Link>
          <div className="mt-14 flex border-b border-black/15 text-[10px] uppercase tracking-[.2em]">
            <button
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 pb-4 ${mode === "login" ? "border-b border-black text-black" : "text-black/75"}`}
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setMode("register");
                setError("");
              }}
              className={`flex-1 pb-4 ${mode === "register" ? "border-b border-black text-black" : "text-black/75"}`}
            >
              Create account
            </button>
          </div>
          <h1 className="mt-12 font-display text-5xl leading-none">
            {mode === "login" ? "Welcome back" : "Join EYEBREED"}
          </h1>
          <p className="mt-4 text-xs leading-6 text-black/75">
            {mode === "login"
              ? "Sign in to continue your EYEBREED experience."
              : "Create an account for a more considered experience."}
          </p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-7">
            {mode === "register" && (
              <AuthField
                label="FULL NAME"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            )}
            <AuthField
              label="EMAIL ADDRESS"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            <div>
              <div className="flex items-end border-b border-black/45 focus-within:border-black">
                <label className="flex-1 text-[9px] tracking-[.2em]">
                  PASSWORD
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    minLength={8}
                    maxLength={72}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    required
                    className="mt-2 block w-full bg-transparent py-2 text-sm tracking-normal outline-none"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="mb-3 ms-4 text-black/75"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {mode === "login" && (
                <button
                  type="button"
                  className="mt-3 float-end text-[10px] underline underline-offset-4"
                >
                  Forgot password?
                </button>
              )}
            </div>
            {error && (
              <p
                role="alert"
                className="border-s-2 border-espresso-700 ps-3 text-xs text-accent-readable"
              >
                {error}
              </p>
            )}
            <button
              disabled={loading}
              className="w-full bg-ink py-5 text-[10px] tracking-luxury text-white transition hover:bg-espresso-700 disabled:opacity-50"
            >
              {loading
                ? "PLEASE WAIT…"
                : mode === "login"
                  ? "SIGN IN"
                  : "CREATE ACCOUNT"}
            </button>
          </form>

          <div className="my-7 flex items-center gap-4 text-[9px] tracking-wider text-black/75">
            <span className="h-px flex-1 bg-black/20" />
            OR
            <span className="h-px flex-1 bg-black/20" />
          </div>
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-4 border border-black/55 py-4 text-[10px] tracking-[.16em] transition hover:bg-white"
          >
            <span className="font-bold text-base">G</span>CONTINUE WITH GOOGLE
          </button>
          <p className="mt-9 text-center text-[10px] text-black/75">
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
          <p className="absolute bottom-4 w-full text-center text-[10px] text-black/75">
            © 2026 EYEBREED-STUDIO™. All Rights Reserved.
          </p>
        </div>
      </section>
    </main>
  );
}

function AuthField({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block border-b border-black/45 text-[9px] tracking-[.2em] focus-within:border-black">
      {label}
      <input
        {...props}
        className="mt-2 block w-full bg-transparent py-2 text-sm tracking-normal outline-none"
      />
    </label>
  );
}
