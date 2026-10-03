"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Fingerprint, Gem, Users } from "lucide-react";
import { useStore } from "@/components/store-provider";

const story = {
  he: {
    eyebrow: "הסיפור שלנו",
    heroA: "יותר ממה",
    heroB: "שרואים.",
    intro:
      "EYEBREED נולד מחוסר ביטחון — והפך את מה שהיה הכי קל להסתיר לחזון שאי אפשר להתעלם ממנו.",
    chapter: "נקודת ההתחלה",
    originA: "מחוסר ביטחון",
    originB: "ל־VISION.",
    origin:
      "מאחורי המותג עומד אדם שלא תמיד היה מסוגל להסתכל על עצמו במראה בלי לשפוט את עצמו — את המראה שלו, את חוסר הסימטריה בעיניים ואת הדרך שבה אחרים עלולים לראות אותו. אבל במקום לתת לחוסר הביטחון להגדיר אותו, הוא החליט להפוך אותו ל־Vision.",
    philosophy: "הפילוסופיה שלנו",
    statementA: "IT’S NOT THE EYES.",
    statementB: "IT’S THE VISION.",
    vision:
      "חוסר הסימטריה בעיניים הפך לנקודת ההתחלה של EYEBREED — ״גזעי עיניים״. מותג שנבנה מתוך הרעיון שהדבר שאנחנו הכי מנסים להסתיר יכול להפוך דווקא לדבר שהכי מייחד אותנו.",
    future: "העתיד",
    futureTitle: "הסיפור הזה רק מתחיל.",
    community:
      "EYEBREED הוא לא רק מה שאתה לובש. מי שלובש אותו הוא חלק מקהילה שבאה לנצח את החיים, להתגבר על מה שעוצר אותה ולהסתכל קדימה.",
    final: "אבל הקהילה הזאת היא לא סיפור של כולם.",
    cta: "לקולקציית VISION",
  },
  en: {
    eyebrow: "OUR STORY",
    heroA: "MORE THAN",
    heroB: "WHAT YOU SEE.",
    intro:
      "EYEBREED was born from insecurity — transforming what was easiest to hide into a vision impossible to ignore.",
    chapter: "THE BEGINNING",
    originA: "FROM INSECURITY",
    originB: "TO VISION.",
    origin:
      "Behind the brand is a person who could not always look in the mirror without judging himself — his appearance, the asymmetry of his eyes, and the way others might see him. Instead of letting insecurity define him, he chose to transform it into Vision.",
    philosophy: "OUR PHILOSOPHY",
    statementA: "IT’S NOT THE EYES.",
    statementB: "IT’S THE VISION.",
    vision:
      "The asymmetry of his eyes became the starting point for EYEBREED — a brand built on the belief that what we try hardest to hide can become precisely what makes us unique.",
    future: "THE FUTURE",
    futureTitle: "THIS STORY IS ONLY BEGINNING.",
    community:
      "EYEBREED is more than what you wear. Everyone who wears it joins a community determined to take on life, overcome what holds them back, and keep looking forward.",
    final: "But this community is not everyone’s story.",
    cta: "EXPLORE THE VISION",
  },
};

export function OurStoryExperience() {
  const { locale } = useStore();
  const c = story[locale];
  const rtl = locale === "he";

  return (
    <main className="bg-cream text-ink">
      <section className="relative min-h-[650px] overflow-hidden bg-ink text-white lg:min-h-[720px]">
        <Image
          src="/campaign/modernAll/DSCF0093.JPG"
          alt="EYEBREED Vision campaign"
          fill
          priority
          className="object-cover object-[65%_center] opacity-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#050505_0%,rgba(5,5,5,.96)_30%,rgba(5,5,5,.55)_55%,transparent_82%)] rtl:bg-[linear-gradient(270deg,#050505_0%,rgba(5,5,5,.96)_30%,rgba(5,5,5,.55)_55%,transparent_82%)]" />
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="relative z-10 flex min-h-[650px] max-w-[1600px] items-center px-6 py-20 sm:px-10 lg:min-h-[720px] lg:px-16"
        >
          <div className="max-w-[650px]">
            <p className="text-[10px] uppercase tracking-[.3em] text-white/65">
              {c.eyebrow}
            </p>
            <h1 className="mt-6 font-display text-[clamp(3.5rem,7vw,7.5rem)] leading-[.78]">
              <span className="block">{c.heroA}</span>
              <span className="mt-5 block text-espresso-400">{c.heroB}</span>
            </h1>
            <span className="mt-8 block h-px w-16 bg-espresso-400" />
            <p className="mt-7 max-w-lg text-sm leading-7 text-white/75">
              {c.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="grid bg-cream lg:grid-cols-2 lg:items-stretch">
        <div className="relative min-h-[430px] w-full overflow-hidden sm:min-h-[560px] lg:min-h-[680px]">
          <Image
            src="/campaign/modernAll/DSCF0479.JPG"
            alt="EYEBREED garment craftsmanship"
            fill
            className="object-cover grayscale-[25%]"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="flex items-center px-6 py-16 sm:px-10 lg:px-[7vw] lg:py-24"
        >
          <div>
            <p className="text-[9px] uppercase tracking-[.28em] text-espresso-700">
              {c.chapter}
            </p>
            <h2 className="mt-5 font-display text-[clamp(3rem,5vw,5.5rem)] leading-[.86]">
              <span className="block">{c.originA}</span>
              <span className="block text-espresso-600">{c.originB}</span>
            </h2>
            <p className="mt-8 max-w-xl text-sm leading-8 text-black/65">
              {c.origin}
            </p>
            <Link
              href="/#products"
              className="mt-9 inline-flex border  border-espresso-600 bg-[#856951] px-7 py-4 text-[10px] tracking-[.18em] text-white transition hover:bg-ink"
            >
              {c.cta}
            </Link>
          </div>
        </div>
      </section>

      <section className="relative min-h-[560px] overflow-hidden bg-ink text-white">
        <Image
          src="/campaign/modernAll/DSCF0280.JPG"
          alt="EYEBREED community campaign"
          fill
          className="object-cover object-center opacity-55"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent rtl:bg-gradient-to-l" />
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="relative z-10 mx-auto flex min-h-[560px] max-w-[1600px] items-center px-6 py-20 sm:px-10 lg:px-16"
        >
          <div className="max-w-2xl">
            <p className="text-[9px] tracking-[.28em] text-espresso-400">
              {c.philosophy}
            </p>
            <h2
              dir="ltr"
              className={`mt-5 font-display text-[clamp(3rem,5.5vw,6rem)] leading-[.86] ${rtl ? "text-right" : "text-left"}`}
            >
              <span className="block">{c.statementA}</span>
              <span className="block text-espresso-400">{c.statementB}</span>
            </h2>
            <p className="mt-8 max-w-xl text-sm leading-8 text-white/72">
              {c.vision}
            </p>
          </div>
        </div>
      </section>

      <section className="grid border-b border-black/10 bg-cream sm:grid-cols-2 lg:grid-cols-4">
        <Value icon={<Gem />} title="COURAGE" he="האומץ להיות אתה" />
        <Value icon={<Eye />} title="VISION" he="לראות מעבר" />
        <Value icon={<Users />} title="COMMUNITY" he="אנשים שמאמינים יחד" />
        <Value icon={<Fingerprint />} title="IDENTITY" he="מה שמייחד אותך" />
      </section>

      <section className="grid bg-ink text-white lg:grid-cols-2">
        <div className="relative min-h-[430px] lg:min-h-[600px]">
          <Image
            src="/campaign/modernAll/DSCF0181.JPG"
            alt="EYEBREED Vision collection detail"
            fill
            className="object-cover opacity-75"
            sizes="(max-width:1024px) 100vw, 50vw"
          />
        </div>
        <div
          dir={rtl ? "rtl" : "ltr"}
          className="flex items-center px-6 py-16 sm:px-10 lg:px-[7vw] lg:py-24"
        >
          <div>
            <p className="text-[9px] tracking-[.28em] text-espresso-400">
              {c.future}
            </p>
            <h2 className="mt-5 font-display text-[clamp(3rem,5vw,5.5rem)] leading-[.88]">
              {c.futureTitle}
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-8 text-white/68">
              {c.community}
            </p>
            <p className="mt-5 font-display text-xl text-espresso-400">
              {c.final}
            </p>
            <Link
              href="/#products"
              className="mt-9 inline-flex border border-espresso-500 px-7 py-4 text-[10px] tracking-[.18em] transition hover:bg-espresso-700"
            >
              {c.cta}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function Value({
  icon,
  title,
  he,
}: {
  icon: React.ReactNode;
  title: string;
  he: string;
}) {
  return (
    <div className="border-b border-black/10 px-6 py-12 text-center sm:border-e lg:py-16">
      <span className="mx-auto flex h-10 items-center justify-center [&>svg]:h-7 [&>svg]:w-7 [&>svg]:stroke-[1]">
        {icon}
      </span>
      <h3 className="mt-5 text-[11px] tracking-[.2em]">{title}</h3>
      <p dir="rtl" className="mt-3 text-xs text-black/55">
        {he}
      </p>
    </div>
  );
}
