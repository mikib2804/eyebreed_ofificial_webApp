"use client";
import Link from "next/link";
import { Shirt, Sparkles, Wind } from "lucide-react";
import { useState } from "react";
import { sizeGuides, type GuideKey } from "@/lib/size-guide-data";
import { SizeTable } from "./size-table";
import { ProductSlideshow } from "./product-slideshow";
import { RecommendationFinder } from "./recommendation-finder";

export function SizeGuideExperience() {
  const [active, setActive] = useState<GuideKey>("joggers");
  const guide = sizeGuides[active];
  return <main dir="rtl" className="min-h-screen bg-[#0c0c0c] text-white">
    <div dir="ltr" className="grid lg:grid-cols-[56%_44%]">
      <section dir="rtl" className="min-w-0 px-4 py-9 sm:px-8 sm:py-12 lg:px-10 lg:py-16 xl:px-14">
        <p dir="ltr" className="text-start text-[9px] tracking-[.32em] text-white/45">EYEBREED / VISION COLLECTION</p>
        <h1 dir="ltr" className="mt-3 font-display text-[clamp(2.15rem,11vw,6rem)] leading-[.95] sm:mt-4">{guide.title} <span className="block text-espresso-400 sm:inline">— SIZE GUIDE</span></h1>
        <nav dir="ltr" className="mt-7 grid grid-cols-2 border-s border-t border-espresso-500/50 sm:mt-8 sm:flex sm:overflow-x-auto sm:border-b sm:border-s-0 sm:border-t-0" aria-label="Product size guides">{(Object.keys(sizeGuides) as GuideKey[]).map((key) => <button dir="ltr" key={key} onClick={()=>setActive(key)} className={`min-h-12 border-b border-e border-espresso-500/50 px-3 py-3 text-[9px] tracking-[.1em] transition sm:shrink-0 sm:border sm:border-b-0 sm:border-e-0 sm:px-5 sm:text-[10px] sm:tracking-[.12em] ${active === key ? "bg-espresso-600 text-white" : "text-white/60 hover:text-white"}`}>{sizeGuides[key].label}</button>)}</nav>
        <div className="mt-6 flex flex-col gap-2 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:border-0 sm:pb-0"><p dir="rtl" className="text-[10px] text-white/45 sm:text-xs">טבלת מידות המוצר <span dir="ltr">/ PRODUCT MEASUREMENTS</span></p><p dir="ltr" className="text-[10px] sm:text-xs">FIT: <span className="text-espresso-400">{guide.fit}</span></p></div>
        <div className="mt-4"><SizeTable headers={guide.headers} rows={guide.rows} footnote={guide.footnote} /></div>
        <div className="mt-8"><RecommendationFinder /></div>
        <section className="mt-8 grid gap-px border border-white/20 bg-white/20 sm:grid-cols-3">
          <Care icon={<Sparkles size={18}/>} title="כביסה עדינה" text="עד 20°C" />
          <Care icon={<Shirt size={18}/>} title="אין לערבב צבעים" text="Wash separately" />
          <Care icon={<Wind size={18}/>} title="ייבוש באוויר" text="מומלץ ייבוש עצמי" />
        </section>
        <section className="mt-8 border-s-2 border-espresso-500 ps-5 text-sm leading-7 text-white/65"><h2 className="text-white">טיפ למי שמתלבט בין שתי מידות</h2><p className="mt-2">למראה רחב ובאגי יותר בחרו במידה הגדולה; למראה מעט מדויק וצמוד יותר בחרו במידה הקטנה, כל עוד מידות הגוף מתאימות לטבלת המוצר.</p><p className="mt-3 text-xs text-white/40">המלצות גובה ומשקל הן הערכה כללית בלבד. טבלת המידות של כל מוצר היא המקור המדויק ביותר לבחירה.</p></section>
        <Link href="/#products" className="mt-10 inline-flex border border-espresso-500 px-8 py-4 text-[10px] tracking-[.2em] transition hover:bg-espresso-600">SHOP THE COLLECTION</Link>
      </section>
      <ProductSlideshow images={guide.images} title={guide.title} />
    </div>
  </main>;
}

function Care({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) { return <div className="bg-[#0c0c0c] p-5"><span className="text-espresso-400">{icon}</span><h3 className="mt-3 text-xs">{title}</h3><p className="mt-1 text-[10px] text-white/45">{text}</p></div>; }
