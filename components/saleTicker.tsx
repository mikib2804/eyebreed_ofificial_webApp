"use client";

import { useStore } from "@/components/store-provider";

type SaleTickerProps = {
  text?: string;
};
export default function SaleTicker({ text }: SaleTickerProps) {
  const { locale } = useStore();
  const message =
    text ??
    (locale === "he"
      ? "15% הנחה על הזמנות באתר"
      : "15% OFF WEBSITE ORDERS");
  // Keep each duplicated marquee track wider than large desktop displays so
  // the loop never exposes an empty area in the middle of the ticker.
  const items = Array.from({ length: 40 }, () => message);

  return (
    <div dir="ltr" className="w-full overflow-hidden bg-espresso-400 text-ink">
      <span className="sr-only">{message}</span>
      <div aria-hidden="true" className="flex w-max animate-marquee will-change-transform motion-reduce:animate-none">
        <div className="flex shrink-0">
          {items.map((text, index) => (
            <span
              key={`first-${index}`}
              className="mx-8 whitespace-nowrap text-2xl font-bold"
            >
              {text}
            </span>
          ))}
        </div>
        <div className="flex shrink-0">
          {items.map((text, index) => (
            <span
              key={`second-${index}`}
              className="mx-8 whitespace-nowrap text-2xl font-bold"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
