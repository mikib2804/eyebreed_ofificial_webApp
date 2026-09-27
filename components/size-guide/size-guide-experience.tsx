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
      <section dir="rtl" className="px-4 py-12 sm:px-8 lg:px-10 lg:py-16 xl:px-14">
        <p dir="ltr" className="text-start text-[9px] tracking-[.32em] text-white/45">EYEBREED / VISION COLLECTION</p>
        <h1 dir="ltr" className="mt-4 font-display text-[clamp(2.8rem,5vw,6rem)] leading-none">{guide.title} <span className="text-espresso-400">— SIZE GUIDE</span></h1>
        <nav dir="ltr" className="mt-8 flex overflow-x-auto border-b border-espresso-500/50" aria-label="Product size guides">{(Object.keys(sizeGuides) as GuideKey[]).map((key) => <button dir="ltr" key={key} onClick={()=>setActive(key)} className={`shrink-0 border border-b-0 border-e-0 border-espresso-500/50 px-5 py-3 text-[10px] tracking-[.12em] transition ${active === key ? "bg-espresso-600 text-white" : "text-white/60 hover:text-white"}`}>{sizeGuides[key].label}</button>)}</nav>
        <div className="mt-6 flex items-center justify-between gap-4"><p dir="rtl" className="text-xs text-white/45">טבלת מידות המוצר <span dir="ltr">/ PRODUCT MEASUREMENTS</span></p><p dir="ltr" className="text-xs">FIT: <span className="text-espresso-400">{guide.fit}</span></p></div>
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
