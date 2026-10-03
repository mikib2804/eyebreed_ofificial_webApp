"use client";
import { useMemo, useState } from "react";
import { recommendations } from "@/lib/size-guide-data";

export function RecommendationFinder() {
  const [gender, setGender] = useState<"men"|"women">("men");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(75);
  const result = useMemo(() => recommendations[gender].find((r) => height >= r.h[0] && height <= r.h[1])?.weights.find((w) => weight >= w[0] && weight <= w[1])?.[2], [gender,height,weight]);
  return <section className="min-w-0 border border-white/20 p-4 sm:p-6">
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"><div><p dir="ltr" className="text-start text-[9px] tracking-[.25em] text-espresso-400">SIZE FINDER</p><h2 dir="rtl" className="mt-2 font-display text-2xl">המלצת מידה</h2></div><div dir="rtl" className="grid w-full grid-cols-2 border border-white/20 text-[10px] sm:flex sm:w-auto"><button onClick={() => setGender("men")} className={`min-h-11 px-4 py-2 ${gender === "men" ? "bg-white text-black" : ""}`}>גברים</button><button onClick={() => setGender("women")} className={`min-h-11 px-4 py-2 ${gender === "women" ? "bg-white text-black" : ""}`}>נשים</button></div></div>
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"><label dir="rtl" className="min-w-0 text-[10px] text-white/75">גובה <span dir="ltr">/ CM</span><input dir="ltr" inputMode="numeric" type="number" value={height} onChange={(e)=>setHeight(+e.target.value)} className="mt-2 block min-h-12 w-full min-w-0 border border-white/20 bg-transparent p-3 text-base text-white outline-none focus:border-espresso-400" /></label><label dir="rtl" className="min-w-0 text-[10px] text-white/75">משקל <span dir="ltr">/ KG</span><input dir="ltr" inputMode="numeric" type="number" value={weight} onChange={(e)=>setWeight(+e.target.value)} className="mt-2 block min-h-12 w-full min-w-0 border border-white/20 bg-transparent p-3 text-base text-white outline-none focus:border-espresso-400" /></label></div>
    <div aria-live="polite" className="mt-5 flex min-h-14 items-center justify-between gap-4 border-t border-white/15 pt-5"><span className="text-xs text-white/75">המידה המומלצת</span><strong dir="ltr" className="shrink-0 font-display text-3xl text-espresso-400">{result ?? "—"}</strong></div>
  </section>;
}
