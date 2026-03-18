import monolithImg from "@/assets/monolith-collection.jpg";
import stillnessImg from "@/assets/stillness-collection.jpg";
import originImg from "@/assets/origin-collection.jpg";

const collectionImages: Record<string, string> = {
  monolith: monolithImg,
  stillness: stillnessImg,
  origin: originImg,
};

const baseUrl = import.meta.env.BASE_URL || "/";
const placeholderPath = `${baseUrl}placeholder.svg`;

const toPublicStorageUrl = (path: string) => {
  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) return path;

  const normalized = path.replace(/^\/+/, "");
  if (normalized.startsWith("storage/v1/object/public/")) {
    return `${base}/${normalized}`;
  }
  return `${base}/storage/v1/object/public/${normalized}`;
};

const isAbsoluteOrBrowserPath = (value: string) => {
  return /^(https?:\/\/|data:|blob:)/i.test(value) || value.startsWith("/");
};

const looksLikePublicAssetPath = (value: string) => {
  return /^(\.?\/)?(assets|images|img)\//i.test(value) || /^[^/]+\.[a-z0-9]{2,5}(\?.*)?$/i.test(value);
};

const toBaseAssetPath = (value: string) => `${baseUrl}${value.replace(/^\/+/, "")}`;

const normalizeImageUrl = (value: string) => {
  if (isAbsoluteOrBrowserPath(value)) return value;

  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("storage/v1/object/public/")) {
    return toPublicStorageUrl(normalized);
  }

  if (looksLikePublicAssetPath(normalized)) {
    return toBaseAssetPath(normalized);
  }

  // Treat bucket-like paths as Supabase Storage public paths.
  if (normalized.includes("/")) {
    return toPublicStorageUrl(normalized);
  }

  return value;
};

const fallbackBySlug = (slug?: string) => {
  if (!slug) return placeholderPath;

  const normalizedSlug = slug.toLowerCase().trim();
  if (collectionImages[normalizedSlug]) return collectionImages[normalizedSlug];
  if (normalizedSlug.includes("monolith")) return monolithImg;
  if (normalizedSlug.includes("stillness")) return stillnessImg;
  if (normalizedSlug.includes("origin")) return originImg;
  return placeholderPath;
};

export const getCollectionImage = (slug?: string, imageUrl?: string | null) => {
  const value = imageUrl?.trim();
  if (!value) return fallbackBySlug(slug);
  return normalizeImageUrl(value);
};

export const resolveProductImage = (imageUrl?: string | null, slug?: string) => {
  const value = imageUrl?.trim();
  if (!value) return fallbackBySlug(slug);
  return normalizeImageUrl(value);
};

export const collectionImageMap = collectionImages;
