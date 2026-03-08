import {
  collections as fallbackCollections,
  getCollectionBySlug as getFallbackCollectionBySlug,
  getProductById as getFallbackProductById,
  getProductsByCollection as getFallbackProductsByCollection,
  products as fallbackProducts,
  type Collection,
  type Product,
} from "@/data/products";
import { getCollectionImage, resolveProductImage } from "@/lib/catalogAssets";
import { getSupabaseClient, isSupabaseConfigured } from "./client";

type SupabaseErrorLike = {
  code?: string;
  message?: string;
};

type ProductQueryRow = {
  id: string;
  name: string;
  price: number;
  description: string;
  philosophy: string;
  materials: string[];
  dimensions: string;
  image_url: string | null;
  gallery: string[] | null;
  collections: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

const shouldFallbackRead = (error: SupabaseErrorLike | null) => {
  if (!error) return false;
  return (
    error.code === "PGRST205" ||
    error.code === "42P01" ||
    error.message?.includes("schema cache") === true ||
    error.message?.includes("does not exist") === true
  );
};

const toCollection = (row: {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  hero_image_url: string | null;
}): Collection => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  tagline: row.tagline,
  description: row.description,
  image: getCollectionImage(row.slug, row.hero_image_url),
});

const fallbackCollectionsWithDemoImages: Collection[] = fallbackCollections.map((collection) => ({
  ...collection,
  image: getCollectionImage(collection.slug, null),
}));

const toProduct = (row: ProductQueryRow): Product => {
  const linkedCollection = Array.isArray(row.collections) ? row.collections[0] : row.collections;
  const collectionSlug = linkedCollection?.slug ?? "";
  const collectionName = linkedCollection?.name ?? "";
  const primaryImage = resolveProductImage(row.image_url, collectionSlug);
  const gallery = (row.gallery ?? [])
    .map((image) => resolveProductImage(image, collectionSlug))
    .filter(Boolean);
  const safeGallery = gallery.length ? gallery : [primaryImage, primaryImage, primaryImage];

  return {
    id: row.id,
    name: row.name,
    collection: collectionName,
    collectionSlug,
    price: row.price,
    description: row.description,
    philosophy: row.philosophy,
    materials: row.materials ?? [],
    dimensions: row.dimensions,
    image: primaryImage,
    images: safeGallery,
  };
};

export const fetchCollections = async (): Promise<Collection[]> => {
  if (!isSupabaseConfigured) return fallbackCollectionsWithDemoImages;

  const { data, error } = await getSupabaseClient()
    .from("collections")
    .select("id, slug, name, tagline, description, hero_image_url, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (shouldFallbackRead(error)) return fallbackCollectionsWithDemoImages;
    console.warn("[catalog] Falling back to local collections due to Supabase read error:", error);
    return fallbackCollectionsWithDemoImages;
  }
  return (data ?? []).map(toCollection);
};

export const fetchCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  if (!isSupabaseConfigured) return getFallbackCollectionBySlug(slug) ?? null;

  const { data, error } = await getSupabaseClient()
    .from("collections")
    .select("id, slug, name, tagline, description, hero_image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    if (shouldFallbackRead(error)) return getFallbackCollectionBySlug(slug) ?? null;
    console.warn("[catalog] Falling back to local collection due to Supabase read error:", error);
    return getFallbackCollectionBySlug(slug) ?? null;
  }
  if (!data) return null;
  return toCollection(data);
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) return fallbackProducts;

  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(
      "id, name, price, description, philosophy, materials, dimensions, image_url, gallery, collections(name, slug)",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (shouldFallbackRead(error)) return fallbackProducts;
    console.warn("[catalog] Falling back to local products due to Supabase read error:", error);
    return fallbackProducts;
  }
  return ((data ?? []) as ProductQueryRow[]).map(toProduct);
};

export const fetchProductsByCollectionSlug = async (slug: string): Promise<Product[]> => {
  if (!isSupabaseConfigured) return getFallbackProductsByCollection(slug);

  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(
      "id, name, price, description, philosophy, materials, dimensions, image_url, gallery, collections!inner(name, slug)",
    )
    .eq("active", true)
    .eq("collections.slug", slug)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (shouldFallbackRead(error)) return getFallbackProductsByCollection(slug);
    console.warn("[catalog] Falling back to local collection products due to Supabase read error:", error);
    return getFallbackProductsByCollection(slug);
  }
  return ((data ?? []) as ProductQueryRow[]).map(toProduct);
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return getFallbackProductById(id) ?? null;

  const { data, error } = await getSupabaseClient()
    .from("products")
    .select(
      "id, name, price, description, philosophy, materials, dimensions, image_url, gallery, collections(name, slug)",
    )
    .eq("id", id)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    if (shouldFallbackRead(error)) return getFallbackProductById(id) ?? null;
    console.warn("[catalog] Falling back to local product due to Supabase read error:", error);
    return getFallbackProductById(id) ?? null;
  }
  if (!data) return null;
  return toProduct(data as ProductQueryRow);
};
