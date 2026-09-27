import { campaignProducts } from "@/lib/campaign-catalog";

export type GuideKey = "joggers" | "polo" | "zip" | "hat";

const productImages = Object.fromEntries(campaignProducts.map((p) => [p.folder, [...p.images]]));

export const sizeGuides = {
  joggers: {
    label: "VISION JOGGERS", title: "Vision Joggers", fit: "Oversized, Baggy", images: productImages.pants,
    headers: ["מידה", "רוחב מותניים*", "גובה חגורת מותניים", "גובה קדמי", "גובה אחורי", "אורך פנימי", "רוחב מפשעה", "רוחב גומי בתחתית", "פתח כיס"],
    rows: [["XS","32.5","5","31","43","70","41","21","18"],["S","34.5","5","32","44","71","42","22","18"],["M","36.5","5","33","45","72","43","23","18"],["L","38.5","5","34","46","73","44","24","18"],["XL","40.5","5","35","47","74","45","25","18"],["2XL","42.5","5","36","48","75","46","26","18"]],
    footnote: "*רוחב המותניים נמדד כשהמכנס מונח שטוח.",
  },
  polo: {
    label: "VISION POLO", title: "Vision Polo", fit: "Oversized עדינה", images: productImages.shirt,
    headers: ["מידה", "רוחב חזה", "אורך קדמי", "אורך שרוול קצר", "אורך שרוול פנימי ארוך"],
    rows: [["S","58","70","23","40–42"],["M","61","72","24","42–44"],["L","63","74","25","44–46"],["XL","65","76","26","46–48"]], footnote: "כל המידות בס״מ.",
  },
  zip: {
    label: "VISION ZIP UP", title: "Vision Zip Up", fit: "Oversized", images: productImages.hoodie,
    headers: ["מידה", "רוחב חזה", "אורך קדמי", "אורך שרוול", "רוחב גב", "רוחב זרוע"],
    rows: [["M","63","63","57.5","64","24.5"],["L","65.5","64.5","59","66","25.5"],["XL","68","66","60.5","68","26.5"],["2XL","70.5","67.5","62","70","27.5"]], footnote: "כל המידות בס״מ.",
  },
  hat: {
    label: "VISION HAT", title: "Vision EB Hat", fit: "One Size", images: productImages.hat,
    headers: ["מידה", "רוחב", "גובה"], rows: [["ONE SIZE","25","25"]], footnote: "כל המידות בס״מ.",
  },
} as const;

type Range = { h: [number, number]; weights: Array<[number, number, string]> };
export const recommendations: Record<"men" | "women", Range[]> = {
  men: [
    {h:[160,169],weights:[[50,62,"S"],[63,72,"M"],[73,84,"L"],[85,98,"XL"],[99,115,"2XL"]]},
    {h:[170,179],weights:[[55,67,"S"],[68,77,"M"],[78,89,"L"],[90,103,"XL"],[104,120,"2XL"]]},
    {h:[180,189],weights:[[60,72,"S"],[73,82,"M"],[83,94,"L"],[95,108,"XL"],[109,125,"2XL"]]},
    {h:[190,230],weights:[[65,77,"S"],[78,87,"M"],[88,99,"L"],[100,113,"XL"],[114,130,"2XL"]]},
  ],
  women: [
    {h:[150,159],weights:[[45,54,"S"],[55,64,"M"],[65,76,"L"],[77,90,"XL"],[91,105,"2XL"]]},
    {h:[160,169],weights:[[48,57,"S"],[58,67,"M"],[68,79,"L"],[80,93,"XL"],[94,108,"2XL"]]},
    {h:[170,179],weights:[[52,61,"S"],[62,71,"M"],[72,83,"L"],[84,97,"XL"],[98,112,"2XL"]]},
    {h:[180,230],weights:[[56,65,"S"],[66,75,"M"],[76,87,"L"],[88,101,"XL"],[102,116,"2XL"]]},
  ],
};
