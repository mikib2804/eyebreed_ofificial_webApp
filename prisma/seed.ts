import { PrismaClient, ProductStatus } from "@prisma/client";
import { campaignProducts } from "../lib/campaign-catalog";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.upsert({
    where: { slug: "vision-collection" },
    update: { name: "Vision Collection", nameHe: "קולקציית Vision" },
    create: { name: "Vision Collection", nameHe: "קולקציית Vision", slug: "vision-collection" },
  });

  const websitePromotion = await prisma.discount.findFirst({
    where: { name: "15% website promotion", code: null },
    select: { id: true },
  });
  if (websitePromotion) {
    await prisma.discount.update({ where: { id: websitePromotion.id }, data: { type: "PERCENTAGE", scope: "STORE", value: 15, active: true } });
  } else {
    await prisma.discount.create({ data: { name: "15% website promotion", code: null, type: "PERCENTAGE", scope: "STORE", value: 15, active: true } });
  }

  await prisma.product.updateMany({
    where: { slug: { in: ["espresso-overshirt", "relaxed-hoodie", "tailored-trousers", "knit-polo"] } },
    data: { status: ProductStatus.ARCHIVED, featured: false },
  });

  for (const item of campaignProducts) {
    const inventory = item.folder === "hat" ? 30 : item.sizes.length * 6;
    // Store list prices. The trusted quote applies the single 15% website
    // promotion so products with compare-at pricing are not discounted twice.
    const listPrices = "compareAtPrices" in item ? item.compareAtPrices : item.prices;
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        name: item.name,
        nameHe: item.nameHe,
        description: item.description,
        descriptionHe: item.descriptionHe,
        material: item.material,
        images: [...item.images],
        story: item.story,
        storyHe: item.storyHe,
        priceUsd: listPrices.USD,
        priceIls: listPrices.ILS,
        priceEur: listPrices.EUR,
        inventory,
        categoryId: category.id,
        featured: true,
        status: ProductStatus.ACTIVE,
      },
      create: {
        name: item.name,
        nameHe: item.nameHe,
        slug: item.slug,
        material: item.material,
        images: [...item.images],
        description: item.description,
        descriptionHe: item.descriptionHe,
        story: item.story,
        storyHe: item.storyHe,
        priceUsd: listPrices.USD,
        priceIls: listPrices.ILS,
        priceEur: listPrices.EUR,
        inventory,
        featured: true,
        status: ProductStatus.ACTIVE,
        categoryId: category.id,
      },
    });

    await prisma.productVariant.deleteMany({ where: { productId: product.id, size: { notIn: [...item.sizes] } } });
    for (const size of item.sizes) {
      await prisma.productVariant.upsert({
        where: { productId_size_color: { productId: product.id, size, color: "" } },
        update: { inventory: item.folder === "hat" ? 30 : 6 },
        create: { productId: product.id, size, inventory: item.folder === "hat" ? 30 : 6 },
      });
    }
  }
}

main().finally(() => prisma.$disconnect());
