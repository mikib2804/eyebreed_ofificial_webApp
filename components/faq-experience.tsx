"use client";

import Image from "next/image";
import { Search, ArrowUpRight, Send } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useStore } from "@/components/store-provider";
import { ContactForm } from "@/components/contact-form";
import { faqContent } from "@/lib/faq-data";
import ContactOptions from "./Contact-options";

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export function FaqExperience() {
  const { locale } = useStore();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [openAnswers, setOpenAnswers] = useState<Set<string>>(() => new Set());
  const searchSectionRef = useRef<HTMLElement>(null);
  const content = faqContent[locale];
  const normalizedQuery = normalize(query);
  const allItems = useMemo(
    () => content.flatMap((category) => category.items),
    [content],
  );
  const suggestions = normalizedQuery
    ? allItems
        .filter((item) => normalize(item.question).includes(normalizedQuery))
        .slice(0, 5)
    : [];
  const visibleCategories = content
    .map((category) => ({
      ...category,
      items: category.items.filter((item) =>
        normalize(`${item.question} ${item.answer}`).includes(normalizedQuery),
      ),
    }))
    .filter((category) => category.items.length > 0);

  return (
    <main className="bg-cream text-ink" dir={locale === "he" ? "rtl" : "ltr"}>
      <header className="relative min-h-[390px] overflow-hidden bg-ink px-5 py-14 text-white sm:px-10 lg:min-h-[460px] lg:py-[4.5rem]">
        <Image
          src="/campaign/modernAll/DSCF0181.JPG"
          alt="EYEBREED Vision campaign"
          fill
          priority
          className="object-cover object-center opacity-45"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,5,5,.9)_0%,rgba(5,5,5,.62)_52%,rgba(5,5,5,.25)_100%)] rtl:bg-[linear-gradient(270deg,rgba(5,5,5,.9)_0%,rgba(5,5,5,.62)_52%,rgba(5,5,5,.25)_100%)]" />
        <div className="relative z-10 mx-auto flex min-h-[280px] max-w-6xl flex-col justify-center lg:min-h-[330px]">
          <p
            dir="ltr"
            className={`text-[10px] tracking-[.3em] text-espresso-400 ${locale === "he" ? "text-right" : "text-left"}`}
          >
            EYEBREED / SUPPORT
          </p>
          <h1 className="mt-6 max-w-4xl font-display text-[clamp(3.4rem,9vw,8rem)] leading-[.86] tracking-[-.035em]">
            {locale === "he" ? "שאלות ותשובות" : "QUESTIONS & ANSWERS"}
          </h1>
          <p className="mt-7 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            {locale === "he"
              ? "כל מה שרציתם לדעת על הסיפור, החזון, המוצרים וההזמנות של EYEBREED."
              : "Everything you need to know about the EYEBREED story, vision, products, and orders."}
          </p>
        </div>
      </header>

      <section
        ref={searchSectionRef}
        className="relative z-20 mx-auto -mt-12 max-w-6xl scroll-mt-6 px-5 sm:px-10"
      >
        <div className="relative rounded-2xl bg-white p-3 shadow-[0_24px_70px_rgba(24,16,12,.14)] sm:p-4">
          <div className="flex min-h-16 items-center gap-4 px-4 sm:min-h-20 sm:px-6">
            <Search
              className="shrink-0 text-espresso-600"
              size={22}
              strokeWidth={1.4}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => {
                setFocused(true);
                window.setTimeout(() => {
                  searchSectionRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }, 50);
              }}
              onBlur={() => window.setTimeout(() => setFocused(false), 120)}
              placeholder={
                locale === "he"
                  ? "חפשו שאלה, מוצר או נושא..."
                  : "Search a question, product, or topic..."
              }
              aria-label={
                locale === "he"
                  ? "חיפוש בשאלות ותשובות"
                  : "Search questions and answers"
              }
              className="min-w-0 flex-1 bg-transparent text-base outline-none ring-0 placeholder:text-black/40 focus:!outline-none focus:ring-0 focus-visible:!outline-none focus-visible:ring-0 sm:text-lg"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="shrink-0 text-[9px] tracking-[.16em] text-black/55 hover:text-black"
              >
                {locale === "he" ? "ניקוי" : "CLEAR"}
              </button>
            )}
          </div>
          {focused && suggestions.length > 0 && (
            <div className="absolute inset-x-3 top-[calc(100%-6px)] z-30 overflow-hidden rounded-b-2xl bg-white pt-2 shadow-xl sm:inset-x-4">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onMouseDown={() => setQuery(item.question)}
                  className="flex w-full items-center justify-between gap-4 border-t border-black/10 px-5 py-4 text-start text-sm transition hover:bg-cream"
                >
                  <span>{item.question}</span>
                  <ArrowUpRight size={14} className="shrink-0 opacity-45" />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-10 lg:py-28">
        {visibleCategories.length ? (
          <div className="space-y-20">
            {visibleCategories.map((category, categoryIndex) => (
              <section
                key={category.title}
                aria-labelledby={`faq-category-${categoryIndex}`}
              >
                <div className="mb-8 flex items-end gap-5 border-b border-black/15 pb-5">
                  <span className="font-display text-4xl text-espresso-500">
                    {categoryIndex + 1}.
                  </span>
                  <h2
                    id={`faq-category-${categoryIndex}`}
                    className="font-display text-3xl sm:text-5xl"
                  >
                    {category.title}
                  </h2>
                </div>
                <div className="divide-y divide-black/15 border-b border-black/15">
                  {category.items.map((item) => {
                    const isOpen = openAnswers.has(item.id);
                    return (
                      <div key={item.id}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={`faq-answer-${item.id}`}
                          onClick={() =>
                            setOpenAnswers((current) => {
                              const next = new Set(current);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              return next;
                            })
                          }
                          className="flex w-full items-center justify-between gap-6 py-6 text-start text-base font-medium sm:py-8 sm:text-lg"
                        >
                          <span>{item.question}</span>
                          <span
                            aria-hidden="true"
                            className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border border-black/25 transition duration-500 ${isOpen ? "rotate-45 bg-ink text-white" : "rotate-0"}`}
                          >
                            <span className="absolute h-px w-3.5 bg-current" />
                            <span className="absolute h-3.5 w-px bg-current" />
                          </span>
                        </button>
                        <div
                          id={`faq-answer-${item.id}`}
                          className={`grid transition-[grid-template-rows,opacity,transform] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isOpen ? "grid-rows-[1fr] translate-y-0 opacity-100" : "grid-rows-[0fr] -translate-y-2 opacity-0"}`}
                        >
                          <div className="overflow-hidden">
                            <div className="max-w-3xl pb-8 pe-12 text-sm leading-8 text-black/65 sm:text-base sm:leading-8">
                              {item.answer}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="border-y border-black/15 py-20 text-center">
            <p className="font-display text-4xl">
              {locale === "he" ? "לא מצאנו תשובה" : "NO ANSWER FOUND"}
            </p>
            <p className="mt-4 text-sm text-black/60">
              {locale === "he"
                ? "נסו מילת חיפוש אחרת או צרו איתנו קשר."
                : "Try another search or contact us directly."}
            </p>
          </div>
        )}

        <div
          id="contact"
          className="mt-24 bg-ink rounded-md p-8 text-white sm:p-12 lg:p-16"
        >
          <div>
            <p className="text-[9px] tracking-[.25em] text-espresso-400">
              EYEBREED SUPPORT
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">
              {locale === "he" ? "עדיין יש שאלה?" : "STILL HAVE A QUESTION?"}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">
              {locale === "he"
                ? "אנחנו כאן לעזור בכל שאלה על מידה, מוצר או הזמנה."
                : "We are here to help with sizing, products, and orders."}
            </p>
          </div>
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-5">
              <button
                type="button"
                aria-expanded={contactOpen}
                aria-controls="faq-contact-form"
                onClick={() => setContactOpen((open) => !open)}
                className="group inline-flex min-h-14 items-center justify-center border border-white/40 px-7 text-[10px] tracking-[.18em] transition duration-300 hover:bg-white hover:text-ink"
              >
                <span>{locale === "he" ? "צרו קשר" : "CONTACT US"}</span>
                <Send
                  aria-hidden="true"
                  size={16}
                  strokeWidth={1.5}
                  className={`ms-4 transition-transform duration-500 ${locale === "he" ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1"} ${contactOpen ? "scale-110" : ""}`}
                />
              </button>
              <ContactOptions compact />
            </div>
            <div
              id="faq-contact-form"
              className={`grid transition-[grid-template-rows,opacity,transform] duration-700 ease-[cubic-bezier(.22,1,.36,1)] ${contactOpen ? "grid-rows-[1fr] translate-y-0 opacity-100" : "pointer-events-none grid-rows-[0fr] -translate-y-3 opacity-0"}`}
            >
              <div className="overflow-hidden">
                <div className="mt-9 border-t border-white/20 pt-9 text-ink">
                  <div className="rounded-2xl bg-cream p-5 shadow-[0_24px_70px_rgba(0,0,0,.25)] sm:p-8 lg:p-10">
                    <ContactForm compact />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
