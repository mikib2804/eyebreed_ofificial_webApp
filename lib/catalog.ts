export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  nameHe: string;
  material: string;
  image: string;
  images: string[];
  description: string;
  descriptionHe: string;
  story: string;
  storyHe: string;
  inventory: number;
  sizes: { size: string; inventory: number }[];
  prices: { USD: number; ILS: number; EUR: number };
};
