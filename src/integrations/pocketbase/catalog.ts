import type { RecordModel } from "pocketbase";
import {
  collections as fallbackCollections,
  getCollectionBySlug as getFallbackCollectionBySlug,
  getProductById as getFallbackProductById,
  getProductsByCollection as getFallbackProductsByCollection,
  products as fallbackProducts,
  type Collection,
  type Product,
} from "@/data/products";
import { getCollectionImage } from "@/lib/catalogAssets";
import { getPocketBaseClient, isPocketBaseConfigured } from "./client";

type PocketBaseErrorLike = {
  status?: number;
  message?: string;
};

type CollectionRecord = RecordModel & {
  slug?: string;
  name?: string;
  tagline?: string;
  description?: string;
  hero_image_url?: string | null;
  sort_order?: number | null;
};

type ProductRecord = RecordModel & {
  name?: string;
  price?: number;
  description?: string;
  philosophy?: string;
  materials?: unknown;
  dimensions?: string;
  image_url?: string | null;
  gallery?: unknown;
  sort_order?: number | null;
  active?: boolean;
  collection?: string | string[] | null;
  collection_id?: string | string[] | null;
};

const fallbackCollectionsWithDemoImages: Collection[] = fallbackCollections.map((collection) => ({
  ...collection,
  image: getCollectionImage(collection.slug, null),
}));

const readString = (value: unknown): string => (typeof value === "string" ? value : "");
const readNumber = (value: unknown): number => (typeof value === "number" ? value : 0);
const readStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];

const shouldFallbackRead = (error: PocketBaseErrorLike | null) => {
  if (!error) return false;
  return (
    error.status === 404 ||
    error.message?.toLowerCase().includes("not found") === true ||
    error.message?.toLowerCase().includes("failed to fetch") === true ||
    error.message?.toLowerCase().includes("network") === true ||
    error.message?.toLowerCase().includes("timeout") === true
  );
};

const resolveRecordFileOrUrl = (record: RecordModel, value: unknown): string | null => {
  const fileName = readString(value);
  if (!fileName) return null;
  if (/^https?:\/\//i.test(fileName)) return fileName;
  return getPocketBaseClient().files.getURL(record, fileName);
};

const toCollection = (row: CollectionRecord): Collection => ({
  id: row.id,
  slug: readString(row.slug),
  name: readString(row.name),
  tagline: readString(row.tagline),
  description: readString(row.description),
  image: getCollectionImage(readString(row.slug), resolveRecordFileOrUrl(row, row.hero_image_url)),
});

const getRelationId = (row: ProductRecord): string => {
  const relation = row.collection ?? row.collection_id;
  if (typeof relation === "string") return relation;
  if (Array.isArray(relation) && typeof relation[0] === "string") return relation[0];
  return "";
};

const toProduct =
  (collectionMap: Map<string, Collection>) =>
  (row: ProductRecord): Product => {
    const collection = collectionMap.get(getRelationId(row));
    const collectionSlug = collection?.slug ?? "";
    const collectionName = collection?.name ?? "";
    const recordImage = resolveRecordFileOrUrl(row, row.image_url);
    const primaryImage = getCollectionImage(collectionSlug, recordImage);
    const recordGallery = readStringArray(row.gallery).map((item) => resolveRecordFileOrUrl(row, item) ?? primaryImage);
    const gallery = recordGallery.length ? recordGallery : [primaryImage, primaryImage, primaryImage];

    return {
      id: row.id,
      name: readString(row.name),
      collection: collectionName,
      collectionSlug,
      price: readNumber(row.price),
      description: readString(row.description),
      philosophy: readString(row.philosophy),
      materials: readStringArray(row.materials),
      dimensions: readString(row.dimensions),
      image: primaryImage,
      images: gallery,
    };
  };

export const fetchCollections = async (): Promise<Collection[]> => {
  if (!isPocketBaseConfigured) return fallbackCollectionsWithDemoImages;

  try {
    const records = await getPocketBaseClient().collection("collections").getFullList<CollectionRecord>({
      sort: "sort_order,name",
    });
    return records.map(toCollection);
  } catch (error) {
    // Keep storefront usable for guests when PocketBase is temporarily unreachable.
    if (shouldFallbackRead(error as PocketBaseErrorLike)) return fallbackCollectionsWithDemoImages;
    return fallbackCollectionsWithDemoImages;
  }
};

export const fetchCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  if (!isPocketBaseConfigured) return getFallbackCollectionBySlug(slug) ?? null;

  try {
    const record = await getPocketBaseClient()
      .collection("collections")
      .getFirstListItem<CollectionRecord>(`slug="${slug}"`);
    return toCollection(record);
  } catch (error) {
    if (shouldFallbackRead(error as PocketBaseErrorLike)) return getFallbackCollectionBySlug(slug) ?? null;
    return getFallbackCollectionBySlug(slug) ?? null;
  }
};

const fetchCollectionMap = async () => {
  const collectionRows = await fetchCollections();
  return new Map(collectionRows.map((item) => [item.id, item]));
};

export const fetchProducts = async (): Promise<Product[]> => {
  if (!isPocketBaseConfigured) return fallbackProducts;

  try {
    const [rows, collectionMap] = await Promise.all([
      getPocketBaseClient().collection("products").getFullList<ProductRecord>({
        sort: "sort_order,name",
        filter: "active=true",
      }),
      fetchCollectionMap(),
    ]);
    return rows.map(toProduct(collectionMap));
  } catch (error) {
    if (shouldFallbackRead(error as PocketBaseErrorLike)) return fallbackProducts;
    return fallbackProducts;
  }
};

export const fetchProductsByCollectionSlug = async (slug: string): Promise<Product[]> => {
  if (!isPocketBaseConfigured) return getFallbackProductsByCollection(slug);
  const products = await fetchProducts();
  return products.filter((item) => item.collectionSlug === slug);
};

export const fetchProductById = async (id: string): Promise<Product | null> => {
  if (!isPocketBaseConfigured) return getFallbackProductById(id) ?? null;

  try {
    const [row, collectionMap] = await Promise.all([
      getPocketBaseClient().collection("products").getOne<ProductRecord>(id),
      fetchCollectionMap(),
    ]);
    if (row.active === false) return null;
    return toProduct(collectionMap)(row);
  } catch (error) {
    if (shouldFallbackRead(error as PocketBaseErrorLike)) return getFallbackProductById(id) ?? null;
    return getFallbackProductById(id) ?? null;
  }
};
