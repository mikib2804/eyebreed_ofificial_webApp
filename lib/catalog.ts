export type StoreProduct = {
  id: string;
  name: string;
  nameHe: string;
  material: string;
  image: string;
  prices: { USD: number; ILS: number; EUR: number };
};

export const products: StoreProduct[] = [
  {
    id: "espresso-overshirt",
    name: "Espresso Overshirt",
    nameHe: "חולצת אספרסו",
    material: "Wool blend",
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=85",
    prices: { USD: 249, ILS: 920, EUR: 229 }
  },
  {
    id: "relaxed-hoodie",
    name: "Relaxed Hoodie",
    nameHe: "קפוצ׳ון שחור",
    material: "Cotton fleece",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=85",
    prices: { USD: 189, ILS: 699, EUR: 175 }
  },
  {
    id: "tailored-trousers",
    name: "Tailored Trousers",
    nameHe: "מכנסיים מחויטים",
    material: "Virgin wool",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=85",
    prices: { USD: 269, ILS: 995, EUR: 249 }
  },
  {
    id: "knit-polo",
    name: "Knit Polo",
    nameHe: "פולו סרוג",
    material: "Merino wool",
    image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1000&q=85",
    prices: { USD: 169, ILS: 625, EUR: 155 }
  }
];
