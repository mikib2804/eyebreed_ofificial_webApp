import { FaInstagram, FaFacebook, FaWhatsapp } from "react-icons/fa";

export default function ContactOptions({ compact = false }: { compact?: boolean }) {
  const linkClass = compact
    ? "grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white/75 transition duration-300 hover:-translate-y-1 hover:border-white hover:text-white"
    : "text-white/75 transition duration-300 hover:-translate-y-1 hover:text-white";

  return (
    <div className={compact ? "flex items-center gap-3" : "mt-8 flex gap-5 border-t border-white/30 pt-6"}>
      <a className={linkClass} href="https://www.instagram.com/eyebreed_official?stkn=aWZlNWU0dGtrcmd0" target="_blank" rel="noopener noreferrer" aria-label="EYEBREED on Instagram">
        <FaInstagram className="size-5" />
      </a>
      <a className={linkClass} href="https://www.facebook.com/share/1FVCLsYsD1/" target="_blank" rel="noopener noreferrer" aria-label="EYEBREED on Facebook">
        <FaFacebook className="size-5" />
      </a>
      <a
        className={linkClass}
        href={`https://wa.me/972509045444?text=${encodeURIComponent(
          "היי, אני מעוניין ליצור קשר עם EYEBREED. אנא צור איתי קשר בהקדם האפשרי.",
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
      >
        <FaWhatsapp className="size-5" />
      </a>
    </div>
  );
}
