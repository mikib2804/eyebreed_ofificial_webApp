"use client";
import {
  FaApplePay,
  FaCcMastercard,
  FaCcVisa,
  FaGooglePay,
} from "react-icons/fa";

type PaymentSupportProps = {
  variant?: "footer" | "checkout";
};

export default function PaymentSupport({
  variant = "footer",
}: PaymentSupportProps) {
  const checkout = variant === "checkout";
  const caption = (
    <span
      className={`text-center  uppercase tracking-[.16em] ${checkout ? "text-[8px] text-black/45" : "text-[7px] text-white/55"}`}
    >
      Secure checkout powered by{" "}
      <a
        href="https://stripe.com/"
        target="_blank"
        rel="noreferrer"
        className="underline underline-offset-2 transition hover:opacity-75"
      >
        Stripe
      </a>
    </span>
  );

  return (
    <div className={checkout ? "py-4" : "py-3"}>
      <div
        className={`flex flex-col items-center justify-center gap-3 ${checkout ? "text-black/70" : "text-white/90"}`}
      >
        <span className="sr-only">
          Payment methods: Visa, Mastercard, Google Pay, Apple Pay, and bit.
          Availability is confirmed securely at checkout.
        </span>
        <div
          aria-hidden="true"
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <FaCcVisa className={checkout ? "h-8 w-auto" : "h-7 w-auto"} />
          <FaCcMastercard className={checkout ? "h-8 w-auto" : "h-7 w-auto"} />
          <FaGooglePay className={checkout ? "h-8 w-auto" : "h-7 w-auto"} />
          <FaApplePay className={checkout ? "h-8 w-auto" : "h-7 w-auto"} />
          <span
            className={`grid min-w-10 place-items-center rounded border px-2 font-sans text-sm font-bold lowercase leading-none ${checkout ? "h-7 border-black/35" : "h-6 border-white/45"}`}
          >
            bit
          </span>
        </div>
        {caption}
      </div>
    </div>
  );
}
