"use client";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaPaypal,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa";
import { SiBit } from "react-icons/si";

export default function PaymentSupport() {
  return (
    <div className="border-t border-black/10 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex text-white flex-wrap items-center justify-center gap-5 text-black/60">
          <FaCcVisa className="h-7 w-auto" aria-label="Visa" />
          <FaPaypal className="h-7 w-auto" aria-label="PayPal" />
          <FaCcMastercard className="h-7 w-auto" aria-label="Mastercard" />
          <span
            className="text-xs font-bold tracking-tight select-none pointer-events-none"
            aria-label="Isracard"
          >
            ישראכרט
          </span>

          <SiBit className="h-7 w-auto" aria-label="Bit" />
          <FaApplePay className="h-7 w-auto" aria-label="Apple Pay" />
          <FaGooglePay className="h-7 w-auto" aria-label="Google Pay" />
        </div>
      </div>
    </div>
  );
}

function PaymentIcon({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div
      title={label}
      aria-label={label}
      className="
        flex h-9 min-w-12 items-center justify-center
        rounded-md border border-black/10
        bg-white px-2
        text-gray-700
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-black/20
        hover:text-black
      "
    >
      <span className="text-xl">{children}</span>
    </div>
  );
}
