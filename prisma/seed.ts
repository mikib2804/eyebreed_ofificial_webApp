import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

const catalog = [
  { name: "Espresso Overshirt", nameHe: "חולצת אספרסו", slug: "espresso-overshirt", usd: 249, ils: 920, eur: 229, material: "Wool blend", image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Relaxed Hoodie", nameHe: "קפוצ׳ון שחור", slug: "relaxed-hoodie", usd: 189, ils: 699, eur: 175, material: "Cotton fleece", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85", sizes: ["XS", "S", "M", "L", "XL"] },
  { name: "Tailored Trousers", nameHe: "מכנסיים מחויטים", slug: "tailored-trousers", usd: 269, ils: 995, eur: 249, material: "Virgin wool", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85", sizes: ["28", "30", "32", "34", "36"] },
  { name: "Knit Polo", nameHe: "פולו סרוג", slug: "knit-polo", usd: 169, ils: 625, eur: 155, material: "Merino wool", image: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1200&q=85", sizes: ["XS", "S", "M", "L", "XL"] }
] as const;

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "the-edit" },
    update: { name: "The Edit", nameHe: "הקולקציה" },
    create: { name: "The Edit", nameHe: "הקולקציה", slug: "the-edit" }
  });

  for (const item of catalog) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name, nameHe: item.nameHe, material: item.material, images: [item.image],
        story: "Born from the tension between architectural tailoring and effortless movement, this piece is made to be worn often and kept for years. Every proportion was refined in the VERO studio.",
        storyHe: "הפריט נולד מהמפגש בין חייטות אדריכלית לתנועה טבעית. כל פרופורציה עוצבה בסטודיו VERO כדי ליצור בגד שנלבש שוב ושוב ונשמר לאורך שנים.",
        inventory: 24, featured: true, status: ProductStatus.ACTIVE
      },
      create: {
        name: item.name, nameHe: item.nameHe, slug: item.slug, material: item.material, images: [item.image],
        description: "A considered wardrobe essential, cut for a refined everyday silhouette.",
        descriptionHe: "פריט מלתחה מדויק בגזרה מודרנית ועל־זמנית.",
        story: "Born from the tension between architectural tailoring and effortless movement, this piece is made to be worn often and kept for years. Every proportion was refined in the VERO studio.",
        storyHe: "הפריט נולד מהמפגש בין חייטות אדריכלית לתנועה טבעית. כל פרופורציה עוצבה בסטודיו VERO כדי ליצור בגד שנלבש שוב ושוב ונשמר לאורך שנים.",
        priceUsd: item.usd, priceIls: item.ils, priceEur: item.eur,
        inventory: 24, featured: true, status: ProductStatus.ACTIVE, categoryId: category.id
      }
    });

    await prisma.productVariant.createMany({
      data: item.sizes.map((size, index) => ({ productId: product.id, size, inventory: index === 0 ? 2 : 6 })),
      skipDuplicates: true
    });
  }
}

main().finally(() => prisma.$disconnect());
