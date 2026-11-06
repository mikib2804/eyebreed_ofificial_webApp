"use client";

import { Mail, Phone, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStore } from "@/components/store-provider";
import PaymentSupport from "./PaymentSupport";
import ContactOptions from "./Contact-options";
import { footerHelpRoutes, footerShopRoutes } from "@/lib/site-routes";
import { FormEvent, useState } from "react";

export function Footer() {
  const { data: session } = useSession();
  const { t, locale } = useStore();
  const [newsletterStartedAt] = useState(() => Date.now());
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterError, setNewsletterError] = useState(false);
  const [newsletterBusy, setNewsletterBusy] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setNewsletterBusy(true); setNewsletterMessage(""); setNewsletterError(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), locale, consent: form.get("consent") === "on", company: form.get("company"), startedAt: newsletterStartedAt }) });
    const result = await response.json().catch(() => ({})); setNewsletterBusy(false); setNewsletterError(!response.ok); setNewsletterMessage(result.message ?? (response.ok ? "Subscribed." : "Could not subscribe."));
    if (response.ok) event.currentTarget.reset();
  }
  return (
    <footer
      dir={locale === "he" ? "rtl" : "ltr"}
      className="bg-ink px-6 pt-16 pb-3 text-white md:px-10 lg:pt-20 lg:pb-5"
    >
      <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-[1.4fr_.7fr_.7fr_1fr]">
        <div className="lg:border-e lg:border-white/25 lg:pe-16">
          {/* <p className="font-display text-5xl tracking-[.18em]">EYEBREED</p> */}
          <p className="font-display text-5xl tracking-[.18em]">
            <Image
              height={96}
              width={240}
              alt="EYEBREED"
              src="/app_icons/appIcon.png"
              className="h-24 w-60 object-contain"
            />
          </p>
          <p className="mt-6 max-w-xs text-[11px] leading-6 tracking-[.14em] text-white/75">
            SUBSCRIBE TO RECEIVE UPDATES
            <br />
            ON NEW ARRIVALS AND EDITORIALS.
          </p>
          <form className="mt-8 max-w-sm" onSubmit={subscribe}>
            <div className="flex border border-white/50"><input name="email" type="email" required autoComplete="email" placeholder={locale === "he" ? "האימייל שלך" : "YOUR EMAIL"} aria-label={locale === "he" ? "אימייל להרשמה" : "Subscription email"} className="min-w-0 flex-1 bg-transparent px-5 py-4 text-[10px] tracking-luxury outline-none" /><button disabled={newsletterBusy} className="min-h-12 px-5 transition-all duration-300 hover:translate-x-0.5 disabled:opacity-50" aria-label={locale === "he" ? "הרשמה לעדכונים" : "Subscribe"}>{newsletterBusy ? "…" : "→"}</button></div>
            <label className="mt-3 flex items-start gap-2 text-[10px] leading-5 text-white/75"><input name="consent" type="checkbox" required className="mt-1" /><span>{locale === "he" ? "אני מסכים/ה לקבל עדכונים שיווקיים ויכול/ה לבטל בכל עת." : "I agree to receive marketing updates and can unsubscribe at any time."}</span></label>
            <input name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px]" />
            {newsletterMessage && <p role={newsletterError ? "alert" : "status"} aria-live="polite" className={`mt-3 text-xs ${newsletterError ? "text-red-300" : "text-green-300"}`}>{newsletterMessage}</p>}
          </form>
        </div>
        <FooterLinks
          title={locale === "he" ? "חנות" : "SHOP"}
          links={footerShopRoutes.map((route) => ({
            label: route.label[locale],
            href: route.href,
          }))}
        />
        <FooterLinks
          title={locale === "he" ? "עזרה" : "HELP"}
          links={[
            ...footerHelpRoutes.map((route) => ({
              label: route.label[locale],
              href: route.href,
            })),
            {
              label: session
                ? locale === "he"
                  ? "החשבון שלי"
                  : "My Account"
                : locale === "he"
                  ? "התחברות / הרשמה"
                  : "Login / Register",
              href: session ? "/account" : "/login",
            },
            ...(session?.user.role === "ADMIN"
              ? [
                  {
                    label: locale === "he" ? "ניהול" : "Admin",
                    href: "/admin",
                  },
                ]
              : []),
          ]}
        />
        <div>
          <h3 className="text-xs tracking-[.16em]">{t.contact}</h3>
          <div className="mt-6 space-y-5 text-xs text-white/75">
            <a className="flex items-center gap-3" href="tel:+972509045444">
              <Phone size={17} strokeWidth={1.2} />
              +972 5 09 045 444
            </a>
            <a
              className="flex items-center gap-3"
              href="mailto:eyebreedofficial@gmail.com"
            >
              <Mail size={17} strokeWidth={1.2} />
              eyebreedofficial@gmail.com
            </a>
            <p className="flex items-center gap-3">
              <Clock3 size={17} strokeWidth={1.2} />
              SUN–THU 09:00–18:00
            </p>
          </div>
          <ContactOptions />
        </div>
      </div>
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
  );
}

function FooterLinks({
  title,
  links,
}: {
  title: string;
  links: Array<{ label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-xs tracking-[.16em]">{title}</h3>
      <ul className="mt-6 space-y-4 text-[11px] uppercase tracking-wider text-white/75">
        {links.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link className="transition hover:text-white" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
