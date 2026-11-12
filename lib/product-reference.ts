const LEGACY_CAMPAIGN_PREFIX = "campaign-";

export function splitProductReferences(productIds: string[]) {
  const directIds: string[] = [];
  const legacySlugs: string[] = [];

  for (const productId of productIds) {
    if (productId.startsWith(LEGACY_CAMPAIGN_PREFIX)) {
      const slug = productId.slice(LEGACY_CAMPAIGN_PREFIX.length);
      if (slug) legacySlugs.push(slug);
    } else {
      directIds.push(productId);
    }
  }

  return {
    directIds: [...new Set(directIds)],
    legacySlugs: [...new Set(legacySlugs)],
  };
}

export function productReferenceKeys(product: { id: string; slug: string }) {
  return [product.id, `${LEGACY_CAMPAIGN_PREFIX}${product.slug}`] as const;
}
