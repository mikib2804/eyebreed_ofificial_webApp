"use client";
type SaleTickerProps = {
  text?: string;
};
export default function SaleTicker({
  text = "SECOND ITEM 50% OFF",
}: SaleTickerProps) {
  // Keep each duplicated marquee track wider than large desktop displays so
  // the loop never exposes an empty area in the middle of the ticker.
  const items = Array.from({ length: 16 }, () => text);

  return (
    <div className="w-full overflow-hidden bg-espresso-400 text-ink">
      <div className="flex w-max animate-marquee">
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
