"use client";

import { Mail, Phone, Clock3 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useStore } from "@/components/store-provider";
import PaymentSupport from "./PaymentSupport";
import ContactOptions from "./Contact-options";
import { footerHelpRoutes, footerShopRoutes } from "@/lib/site-routes";
import { useSubmitGuard } from "@/lib/use-submit-guard";
import { FormEvent, useRef, useState } from "react";

export function Footer() {
  const { data: session } = useSession();
  const { t, locale } = useStore();
  const contactStartedAt = useRef(Date.now());
  const [contactMessage, setContactMessage] = useState("");
  const [contactError, setContactError] = useState(false);
  const { blocked: contactBusy, run: runContactRequest } = useSubmitGuard(2_500);

  async function requestContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    await runContactRequest(async () => {
      setContactMessage("");
      setContactError(false);
      const form = new FormData(formElement);
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: locale === "he" ? "פנייה מהאתר" : "Website contact",
            email: form.get("email"),
            message: locale === "he" ? "אשמח שנציג מהצוות יחזור אליי בהקדם האפשרי." : "Please ask a member of the team to contact me as soon as possible.",
            locale,
            company: form.get("company"),
            startedAt: contactStartedAt.current,
          }),
        });
        const result = await response.json().catch(() => ({}));
        setContactError(!response.ok);
        setContactMessage(result.message ?? (response.ok ? "Request received." : "Could not send your request."));
        if (response.ok) {
          formElement.reset();
          contactStartedAt.current = Date.now();
        }
      } catch {
        setContactError(true);
        setContactMessage(locale === "he" ? "לא ניתן לשלוח כרגע. נסו שוב." : "Could not send your request. Please try again.");
      }
    });
  }
  return (
    <footer
      dir={locale === "he" ? "rtl" : "ltr"}
      className="bg-ink px-6 pb-3 pt-12 text-white sm:pt-16 md:px-10 lg:pb-5 lg:pt-20"
    >
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-12 lg:grid-cols-[1.4fr_.7fr_.7fr_1fr] lg:gap-12">
        <div className="col-span-2 lg:col-span-1 lg:border-e lg:border-white/25 lg:pe-16">
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
          <p className="mt-6 max-w-sm text-[11px] leading-6 tracking-[.14em] text-white/75">
            {locale === "he" ? "השאירו אימייל והצוות שלנו יחזור אליכם בהקדם האפשרי." : "LEAVE YOUR EMAIL AND OUR TEAM WILL CONTACT YOU AS SOON AS POSSIBLE."}
          </p>
          <form className="mt-8 max-w-sm" onSubmit={requestContact}>
            <div className="flex border border-white/50">
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                maxLength={254}
                placeholder={locale === "he" ? "האימייל שלך" : "YOUR EMAIL"}
                aria-label={
                  locale === "he" ? "אימייל ליצירת קשר" : "Contact email"
                }
                className="min-w-0 flex-1 bg-transparent px-5 py-4 text-[10px] tracking-luxury outline-none"
              />
              <button
                disabled={contactBusy}
                className="min-h-12 px-5 transition-all duration-300 hover:translate-x-0.5 disabled:opacity-50"
                aria-label={locale === "he" ? "שליחת בקשת קשר" : "Request contact"}
              >
                {contactBusy ? "…" : "→"}
              </button>
            </div>
            <input
              name="company"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="sr-only"
            />
            {contactMessage && (
              <p
                role={contactError ? "alert" : "status"}
                aria-live="polite"
                className={`mt-3 text-xs ${contactError ? "text-red-300" : "text-green-300"}`}
              >
                {contactMessage}
              </p>
            )}
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
        <div className="col-span-2 border-t border-white/20 pt-8 lg:col-span-1 lg:border-t-0 lg:pt-0">
          <h3 className="text-xs tracking-[.16em]">{t.contact}</h3>
          <div className="mt-5 grid gap-x-8 gap-y-4 text-xs text-white/75 sm:grid-cols-2 lg:grid-cols-1">
            <a className="flex min-w-0 items-center gap-3" href="tel:+972509045444">
              <Phone className="shrink-0" size={17} strokeWidth={1.2} />
              +972 5 09 045 444
            </a>
            <a
              className="flex min-w-0 items-center gap-3"
              href="mailto:eyebreedofficial@gmail.com"
            >
              <Mail className="shrink-0" size={17} strokeWidth={1.2} />
              <span className="break-all" dir="ltr">eyebreedofficial@gmail.com</span>
            </a>
            <p className="flex items-center gap-3">
              <Clock3 className="shrink-0" size={17} strokeWidth={1.2} />
              SUN–THU 09:00–18:00
            </p>
          </div>
          <ContactOptions />
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-[1600px] flex-col items-center justify-center gap-3 border-t border-white/15 pt-6 text-[9px] tracking-wider text-white/75 sm:flex-row sm:justify-between lg:mt-16">
        <span dir="ltr">All Rights Reserved EYEBREED 2026 ©.</span>
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
    <div className="min-w-0">
      <h3 className="text-xs tracking-[.16em]">{title}</h3>
      <ul className="mt-5 space-y-3 text-[11px] uppercase tracking-wider text-white/75 sm:mt-6 sm:space-y-4">
        {links.map((item) => (
          <li key={`${item.href}-${item.label}`}>
            <Link className="break-words transition hover:text-white" href={item.href}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
