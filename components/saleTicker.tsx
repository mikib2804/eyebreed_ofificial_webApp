"use client";

import { useStore } from "@/components/store-provider";

type SaleTickerProps = {
  text?: string;
};
export default function SaleTicker({ text }: SaleTickerProps) {
  const { locale } = useStore();
  const message =
    text ??
    (locale === "he" ? "15% הנחה על הזמנות באתר" : "15% OFF WEBSITE ORDERS");
  // Each duplicated track stays wider than a large desktop without creating
  // tens of thousands of pixels of scrollable overflow in RTL documents.
  const items = Array.from({ length: 12 }, () => message);

  return (
    <div
      dir="ltr"
      className="relative isolate h-8 w-full max-w-full overflow-x-clip bg-espresso-400 text-ink [contain:strict]"
    >
      <span className="sr-only">{message}</span>
      <div
        aria-hidden="true"
        className="absolute inset-y-0 start-0 flex w-max items-center animate-marquee will-change-transform motion-reduce:animate-none"
      >
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
