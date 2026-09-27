"use client";
import { useMemo, useState } from "react";
import { recommendations } from "@/lib/size-guide-data";

export function RecommendationFinder() {
  const [gender, setGender] = useState<"men"|"women">("men");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const result = useMemo(() => recommendations[gender].find((r) => height >= r.h[0] && height <= r.h[1])?.weights.find((w) => weight >= w[0] && weight <= w[1])?.[2], [gender,height,weight]);
  return <section className="border border-white/20 p-5 sm:p-6">
    <div className="flex items-center justify-between gap-4"><div><p dir="ltr" className="text-start text-[9px] tracking-[.25em] text-espresso-400">SIZE FINDER</p><h2 dir="rtl" className="mt-2 font-display text-2xl">המלצת מידה</h2></div><div dir="rtl" className="flex border border-white/20 text-[10px]"><button onClick={() => setGender("men")} className={`px-4 py-2 ${gender === "men" ? "bg-white text-black" : ""}`}>גברים</button><button onClick={() => setGender("women")} className={`px-4 py-2 ${gender === "women" ? "bg-white text-black" : ""}`}>נשים</button></div></div>
    <div className="mt-6 grid grid-cols-2 gap-4"><label dir="rtl" className="text-[10px] text-white/55">גובה <span dir="ltr">/ CM</span><input dir="ltr" type="number" value={height} onChange={(e)=>setHeight(+e.target.value)} className="mt-2 w-full border border-white/20 bg-transparent p-3 text-base text-white outline-none focus:border-espresso-400" /></label><label dir="rtl" className="text-[10px] text-white/55">משקל <span dir="ltr">/ KG</span><input dir="ltr" type="number" value={weight} onChange={(e)=>setWeight(+e.target.value)} className="mt-2 w-full border border-white/20 bg-transparent p-3 text-base text-white outline-none focus:border-espresso-400" /></label></div>
    <div aria-live="polite" className="mt-5 flex items-center justify-between border-t border-white/15 pt-5"><span className="text-xs text-white/55">המידה המומלצת</span><strong className="font-display text-3xl text-espresso-400">{result ?? "—"}</strong></div>
  </section>;
}
