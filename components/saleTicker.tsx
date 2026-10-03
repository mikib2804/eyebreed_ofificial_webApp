"use client";
type SaleTickerProps = {
  text?: string;
};
export default function SaleTicker({ text = "50% SALE" }: SaleTickerProps) {
  const items = Array.from({ length: 8 }, () => text);

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
