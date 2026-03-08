import type { Product } from "@/data/products";

export const RECENT_PRODUCTS_KEY = "babel_recent_products";

const safeReadRecent = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_PRODUCTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

export const trackRecentlyViewedProduct = (productId: string, limit = 12) => {
  if (typeof window === "undefined") return;
  const recent = safeReadRecent();
  const updated = [productId, ...recent.filter((id) => id !== productId)].slice(0, limit);
  window.localStorage.setItem(RECENT_PRODUCTS_KEY, JSON.stringify(updated));
};

export const getRecentlyViewedProducts = (
  currentProductId: string,
  allProducts: Product[],
  limit = 4,
): Product[] => {
  const recent = safeReadRecent();
  return recent
    .filter((id) => id !== currentProductId)
    .map((id) => allProducts.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
    .slice(0, limit);
};

export const getYouMayAlsoLikeProducts = (
  currentProduct: Product,
  allProducts: Product[],
  limit = 4,
): Product[] => {
  const currentMaterials = new Set(currentProduct.materials.map((material) => material.toLowerCase()));

  return allProducts
    .filter((candidate) => candidate.id !== currentProduct.id)
    .map((candidate) => {
      const candidateMaterials = candidate.materials.map((material) => material.toLowerCase());
      const materialOverlap = candidateMaterials.filter((material) => currentMaterials.has(material)).length;
      const sameCollection = candidate.collectionSlug === currentProduct.collectionSlug ? 1 : 0;
      const priceDistance = Math.abs(candidate.price - currentProduct.price);
      const score = sameCollection * 100 + materialOverlap * 20 - priceDistance / 200;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.candidate);
};

