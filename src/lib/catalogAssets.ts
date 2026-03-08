import monolithImg from "@/assets/monolith-collection.jpg";
import stillnessImg from "@/assets/stillness-collection.jpg";
import originImg from "@/assets/origin-collection.jpg";

const collectionImages: Record<string, string> = {
  monolith: monolithImg,
  stillness: stillnessImg,
  origin: originImg,
};

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

const normalizeImageUrl = (value: string) => {
  if (isAbsoluteOrBrowserPath(value)) return value;

  const normalized = value.replace(/^\/+/, "");
  if (normalized.startsWith("storage/v1/object/public/")) {
    return toPublicStorageUrl(normalized);
  }

  if (looksLikePublicAssetPath(normalized)) {
    return `/${normalized}`;
  }

  // Treat bucket-like paths as Supabase Storage public paths.
  if (normalized.includes("/")) {
    return toPublicStorageUrl(normalized);
  }

  return value;
};

const fallbackBySlug = (slug?: string) => {
  if (!slug) return "/placeholder.svg";
  return collectionImages[slug] ?? "/placeholder.svg";
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
