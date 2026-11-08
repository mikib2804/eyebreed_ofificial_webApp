"use client";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa";

export default function PaymentSupport() {
  return (
    <div className="border-t border-black/10 py-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex flex-wrap items-center justify-center gap-4 text-white/90">
          <span className="text-[10px] uppercase tracking-[.18em]">
            Secure checkout powered by Stripe
          </span>
          <span className="sr-only">
            Available payment methods are shown securely by Stripe at checkout.
          </span>
          <div aria-hidden="true" className="flex items-center gap-3">
            <FaCcVisa className="h-7 w-auto" />
            <FaCcMastercard className="h-7 w-auto" />
            <FaCcAmex className="h-7 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
