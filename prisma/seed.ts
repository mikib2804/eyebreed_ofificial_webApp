import { PrismaClient, ProductStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "the-edit" },
    update: {},
    create: { name: "The Edit", nameHe: "הקולקציה", slug: "the-edit" }
  });

  const products = [
    ["Espresso Overshirt", "חולצת אספרסו", "espresso-overshirt", 249, 920, 229, "Wool blend", "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85"],
    ["Relaxed Hoodie", "קפוצ׳ון שחור", "relaxed-hoodie", 189, 699, 175, "Cotton fleece", "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85"],
    ["Tailored Trousers", "מכנסיים מחויטים", "tailored-trousers", 269, 995, 249, "Virgin wool", "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1200&q=85"],
    ["Knit Polo", "פולו סרוג", "knit-polo", 169, 625, 155, "Merino wool", "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?auto=format&fit=crop&w=1200&q=85"]
  ] as const;

  for (const [name, nameHe, slug, usd, ils, eur, material, image] of products) {
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name, nameHe, slug, material, images: [image],
        description: "A considered wardrobe essential, cut for a refined everyday silhouette.",
        descriptionHe: "פריט מלתחה מדויק בגזרה מודרנית ועל-זמנית.",
        priceUsd: usd, priceIls: ils, priceEur: eur,
        inventory: 24, featured: true, status: ProductStatus.ACTIVE,
        categoryId: category.id
      }
    });
  }
}

main().finally(() => prisma.$disconnect());
