"use client";

import { Mail, Phone, Clock3, MessageCircleCheck } from "lucide-react";
import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";
import Image from "next/image";
import { useStore } from "@/components/store-provider";

export function Footer() {
  const { t } = useStore();
  return (
    <footer
      dir="ltr"
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
          <form
            className="mt-8 flex max-w-sm border border-white/50"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              placeholder="YOUR EMAIL"
              aria-label="Email"
              className="min-w-0 flex-1 bg-transparent px-5 py-4 text-[10px] tracking-luxury outline-none"
            />
            <button
              className="px-5 hover:translate-x-0.5 transition-all duration-300"
              aria-label="Subscribe"
            >
              →
            </button>
          </form>
        </div>
        <FooterLinks
          title="SHOP"
          links={[
            "New arrivals",
            "Clothing",
            "Knitwear",
            "Shoes",
            "Accessories",
            { label: "Our story", href: "/our-story" },
          ]}
        />
        <FooterLinks
          title="HELP"
          links={[
            { label: "Sizing", href: "/size-guide" },
            { label: "Shipping", href: "#" },
            { label: "Returns", href: "#" },
            { label: "FAQ", href: "#" },
            { label: "Privacy", href: "#" },
          ]}
        />
        <div>
          <h3 className="text-xs tracking-[.16em]">{t.contact}</h3>
          <div className="mt-6 space-y-5 text-xs text-white/75">
            <a className="flex items-center gap-3" href="tel:+97235550148">
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
          <div className="mt-8 flex gap-5 border-t border-white/30 pt-6">
            <a href="https://www.instagram.com/eyebreed_official?stkn=aWZlNWU0dGtrcmd0">
              <FaInstagram className="cursor-pointer size-6 hover:-translate-y-1 transition-all duration-300" />
            </a>
            <a href="https://www.facebook.com/share/1FVCLsYsD1/">
              <FaFacebook className="cursor-pointer size-6 hover:-translate-y-1 transition-all duration-300" />
            </a>
            <a
              href={`https://wa.me/972509045444?text=${encodeURIComponent(
                "היי, אני מעוניין ליצור קשר עם EYEBREED-STUDIO. אנא צור איתי קשר בהקדם האפשרי.",
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Contact us on WhatsApp"
            >
              <FaWhatsapp className="size-6 cursor-pointer transition-all duration-300 hover:-translate-y-1" />
            </a>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-16 flex max-w-[1600px] flex-col gap-3 border-t border-white/15 pt-6 text-[9px] tracking-wider text-white/75 sm:flex-row sm:justify-between">
        <span>© 2026 EYEBREED-STUDIO™. All Rights Reserved.</span>
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
  links: Array<string | { label: string; href: string }>;
}) {
  return (
    <div>
      <h3 className="text-xs tracking-[.16em]">{title}</h3>
      <ul className="mt-6 space-y-4 text-[11px] uppercase tracking-wider text-white/75">
        {links.map((link) => {
          const item =
            typeof link === "string" ? { label: link, href: "#" } : link;
          return (
            <li key={item.label}>
              <a className="transition hover:text-white" href={item.href}>
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
